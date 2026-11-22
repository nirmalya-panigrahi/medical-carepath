import {CheckCircle2, Plus, RotateCcw, Trash2, XCircle} from 'lucide-react';
import {useMemo, useState} from 'react';
import {CDSMP_CONDITIONS} from '../../data/pathwaysData';
import type {
  ChronicCondition,
  MedicationTiming,
  SymptomMedLog,
  SymptomMedLogInput,
} from '../../types/carepath';
import {
  summarizeSymptomMedLogs,
  validateSymptomMedLog,
} from '../../utils/cdsmpRules';

interface SymptomMedLogSectionProps {
  logs: SymptomMedLog[];
  onAddLog: (input: SymptomMedLogInput) => void;
  onDeleteLog: (id: string) => void;
  onResetLogs: () => void;
}

const TIMING_LABELS: Record<MedicationTiming, string> = {
  'before-symptoms': 'Taken before symptoms',
  'with-meal': 'Taken with meal',
  'after-symptoms': 'Taken after flare',
  missed: 'Dose missed / delayed',
};

export function SymptomMedLogSection({
  logs,
  onAddLog,
  onDeleteLog,
  onResetLogs,
}: SymptomMedLogSectionProps) {
  const [condition, setCondition] = useState<ChronicCondition>('hypertension');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(3);
  const [fatigueLevel, setFatigueLevel] = useState<number>(3);
  const [vitalReading, setVitalReading] = useState<string>('');
  const [medicationName, setMedicationName] = useState<string>(
    CDSMP_CONDITIONS.hypertension.sampleMedication
  );
  const [doseTaken, setDoseTaken] = useState<boolean>(true);
  const [timing, setTiming] = useState<MedicationTiming>('before-symptoms');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adherenceFilter, setAdherenceFilter] = useState<'all' | 'taken' | 'missed'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleConditionChange = (nextCond: ChronicCondition) => {
    setCondition(nextCond);
    setMedicationName(CDSMP_CONDITIONS[nextCond].sampleMedication);
  };

  const handleDoseToggle = (taken: boolean) => {
    setDoseTaken(taken);
    if (!taken) {
      setTiming('missed');
    } else if (timing === 'missed') {
      setTiming('before-symptoms');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: SymptomMedLogInput = {
      condition,
      symptomSeverity,
      fatigueLevel,
      vitalReading: vitalReading.trim(),
      medicationName: medicationName.trim(),
      doseTaken,
      timing: doseTaken ? timing : 'missed',
      note: note.trim(),
    };

    const validation = validateSymptomMedLog(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      setFeedback(null);
      return;
    }

    setErrors({});
    onAddLog(draft);
    setVitalReading('');
    setNote('');
    setFeedback('Logged symptom and medication entry.');
  };

  const summary = useMemo(() => summarizeSymptomMedLogs(logs), [logs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((item) => {
        if (adherenceFilter === 'taken') return item.doseTaken;
        if (adherenceFilter === 'missed') return !item.doseTaken;
        return true;
      }),
    [logs, adherenceFilter]
  );

  // Recent 7 entries chronological for dual-trend chart
  const chartLogs = useMemo(() => [...logs].slice(0, 7).reverse(), [logs]);

  return (
    <section
      id="symptom-log"
      aria-labelledby="symptom-log-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-sky-700 uppercase">
            03. Structured Feedback Loop
          </p>
          <h2
            id="symptom-log-heading"
            className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance"
          >
            Symptom vs. Medication Correlation Log
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Track daily symptom severity and vital readings alongside scheduled
            dose timing so you can spot patterns between adherence and flare-ups.
          </p>
        </div>

        {/* Correlation Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
          <div>
            <p className="text-slate-500">Adherence</p>
            <p className="mt-0.5 font-mono text-base font-bold text-slate-900 tabular-nums">
              {summary.totalLogs > 0 ? `${summary.adherencePercent}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Symptom (Taken)</p>
            <p className="mt-0.5 font-mono text-base font-bold text-emerald-800 tabular-nums">
              {summary.avgSymptomTaken !== null
                ? `${summary.avgSymptomTaken}/10`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Symptom (Missed)</p>
            <p className="mt-0.5 font-mono text-base font-bold text-rose-800 tabular-nums">
              {summary.avgSymptomMissed !== null
                ? `${summary.avgSymptomMissed}/10`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Log Entry Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5"
        >
          <h3 className="text-base font-bold text-slate-900">
            Log Daily Symptom &amp; Dose Timing
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="sym-condition"
                className="block text-xs font-semibold text-slate-700"
              >
                Condition Track
              </label>
              <select
                id="sym-condition"
                value={condition}
                onChange={(e) =>
                  handleConditionChange(e.target.value as ChronicCondition)
                }
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="hypertension">Hypertension</option>
                <option value="diabetes">Diabetes</option>
                <option value="arthritis">Arthritis</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="sym-severity"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Symptom Severity (0–10)
                </label>
                <input
                  id="sym-severity"
                  type="number"
                  min={0}
                  max={10}
                  value={symptomSeverity}
                  onChange={(e) => setSymptomSeverity(Number(e.target.value))}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums"
                />
                {errors.symptomSeverity && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {errors.symptomSeverity}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sym-fatigue"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Fatigue Level (0–10)
                </label>
                <input
                  id="sym-fatigue"
                  type="number"
                  min={0}
                  max={10}
                  value={fatigueLevel}
                  onChange={(e) => setFatigueLevel(Number(e.target.value))}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums"
                />
                {errors.fatigueLevel && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {errors.fatigueLevel}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="sym-vital"
                className="block text-xs font-semibold text-slate-700"
              >
                Self-Tracked Reading (Optional)
              </label>
              <input
                id="sym-vital"
                type="text"
                value={vitalReading}
                onChange={(e) => setVitalReading(e.target.value)}
                placeholder={CDSMP_CONDITIONS[condition].sampleVitalPlaceholder}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              />
              {errors.vitalReading && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {errors.vitalReading}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="sym-med-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Medication / Scheduled Routine
              </label>
              <input
                id="sym-med-name"
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              {errors.medicationName && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {errors.medicationName}
                </p>
              )}
            </div>

            {/* Dose Taken Segmented Control */}
            <div>
              <span className="block text-xs font-semibold text-slate-700">
                Scheduled Dose Status
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={doseTaken}
                  onClick={() => handleDoseToggle(true)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-xs font-semibold cursor-pointer ${
                    doseTaken
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Dose Taken
                </button>
                <button
                  type="button"
                  aria-pressed={!doseTaken}
                  onClick={() => handleDoseToggle(false)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-xs font-semibold cursor-pointer ${
                    !doseTaken
                      ? 'border-rose-700 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Dose Missed
                </button>
              </div>
            </div>

            {doseTaken && (
              <div>
                <label
                  htmlFor="sym-timing"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Timing Relative to Symptoms
                </label>
                <select
                  id="sym-timing"
                  value={timing}
                  onChange={(e) =>
                    setTiming(e.target.value as MedicationTiming)
                  }
                  className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="before-symptoms">Taken before symptoms</option>
                  <option value="with-meal">Taken with meal</option>
                  <option value="after-symptoms">Taken after flare</option>
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="sym-note"
                className="block text-xs font-semibold text-slate-700"
              >
                Context Note (Optional)
              </label>
              <input
                id="sym-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Hydrated well; mild stiffness eased after 30 min"
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Record Log</span>
            </button>

            {feedback && (
              <p role="status" className="text-xs font-medium text-emerald-800">
                {feedback}
              </p>
            )}
          </div>
        </form>

        {/* Right: Dual-Trend SVG Visualization + Filterable Log Table/Cards */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Clean SVG Symptom vs. Dose Trend */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Symptom vs. Dose Adherence Trend
              </h3>
              <p className="text-xs text-slate-500">
                Blue bar = Symptom (0–10) · Green/Red marker = Dose Taken/Missed
              </p>
            </div>

            {chartLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                Add at least one entry to visualize your symptom-to-medication
                pattern.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <svg
                  viewBox="0 0 420 140"
                  className="h-36 w-full min-w-[320px]"
                  role="img"
                  aria-label="Bar chart comparing symptom severity against medication adherence across recent logs"
                >
                  <line
                    x1="28"
                    y1="110"
                    x2="405"
                    y2="110"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="28"
                    y1="60"
                    x2="405"
                    y2="60"
                    stroke="#F1F5F9"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text x="6" y="113" fontSize="9" fill="#64748B">
                    0
                  </text>
                  <text x="6" y="63" fontSize="9" fill="#64748B">
                    5
                  </text>
                  <text x="2" y="18" fontSize="9" fill="#64748B">
                    10
                  </text>

                  {chartLogs.map((item, idx) => {
                    const step = 360 / Math.max(chartLogs.length, 1);
                    const x = 44 + idx * step;
                    const barHeight = Math.max(4, (item.symptomSeverity / 10) * 92);
                    const y = 110 - barHeight;
                    return (
                      <g key={item.id}>
                        <rect
                          x={x}
                          y={y}
                          width="22"
                          height={barHeight}
                          rx="3"
                          fill="#0284C7"
                          fillOpacity="0.85"
                        />
                        <circle
                          cx={x + 11}
                          cy={124}
                          r="4.5"
                          fill={item.doseTaken ? '#4D7C0F' : '#DC2626'}
                        />
                        <text
                          x={x + 11}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#0F172A"
                        >
                          {item.symptomSeverity}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Entries List */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Recorded Entries ({filteredLogs.length})
              </h3>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Filter symptom logs by medication adherence"
                  value={adherenceFilter}
                  onChange={(e) =>
                    setAdherenceFilter(
                      e.target.value as 'all' | 'taken' | 'missed'
                    )
                  }
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="all">All Logs</option>
                  <option value="taken">Dose Taken</option>
                  <option value="missed">Dose Missed</option>
                </select>
                <button
                  type="button"
                  onClick={onResetLogs}
                  className="inline-flex min-h-10 items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No symptom-medication records match the selected filter.
              </p>
            ) : (
              <>
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-2 font-medium">Date · Condition</th>
                        <th className="pb-2 text-right font-medium">Symptom</th>
                        <th className="pb-2 text-right font-medium">Fatigue</th>
                        <th className="pb-2 pl-3 font-medium">Medication</th>
                        <th className="pb-2 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="py-3 pr-2">
                            <div className="font-mono text-slate-900 tabular-nums">
                              {entry.date}
                            </div>
                            <div className="text-slate-500">
                              {CDSMP_CONDITIONS[entry.condition].title.replace(
                                ' Self-Management',
                                ''
                              )}
                              {entry.vitalReading ? ` · ${entry.vitalReading}` : ''}
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {entry.symptomSeverity}/10
                          </td>
                          <td className="py-3 text-right font-mono text-slate-700 tabular-nums">
                            {entry.fatigueLevel}/10
                          </td>
                          <td className="py-3 pl-3">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                              {entry.doseTaken ? (
                                <CheckCircle2
                                  className="h-3.5 w-3.5 shrink-0 text-emerald-700"
                                  aria-hidden="true"
                                />
                              ) : (
                                <XCircle
                                  className="h-3.5 w-3.5 shrink-0 text-rose-700"
                                  aria-hidden="true"
                                />
                              )}
                              <span>{entry.medicationName}</span>
                            </div>
                            <div className="text-slate-500">
                              {TIMING_LABELS[entry.timing]}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              aria-label={`Delete symptom log from ${entry.date}`}
                              onClick={() => onDeleteLog(entry.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stack */}
                <div className="mt-4 space-y-3 md:hidden">
                  {filteredLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-md border border-slate-200 p-3.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono font-semibold text-slate-900 tabular-nums">
                            {entry.date} ·{' '}
                            {CDSMP_CONDITIONS[entry.condition].title.replace(
                              ' Self-Management',
                              ''
                            )}
                          </p>
                          <p className="mt-0.5 text-slate-600 tabular-nums">
                            Symptom {entry.symptomSeverity}/10 · Fatigue{' '}
                            {entry.fatigueLevel}/10
                            {entry.vitalReading ? ` · ${entry.vitalReading}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Delete symptom log from ${entry.date}`}
                          onClick={() => onDeleteLog(entry.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 font-medium text-slate-800">
                        {entry.doseTaken ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-700" />
                        )}
                        <span>
                          {entry.medicationName} — {TIMING_LABELS[entry.timing]}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="mt-1.5 text-slate-600">{entry.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
