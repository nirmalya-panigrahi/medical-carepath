import {CheckCircle2, Trash2, XCircle} from 'lucide-react';
import {useMemo, useState} from 'react';
import {CDSMP_CONDITIONS} from '../../data/pathwaysData';
import type {
  ChronicCondition,
  SymptomMedLog,
  SymptomMedLogInput,
} from '../../types/carepath';
import {summarizeSymptomMedLogs} from '../../utils/cdsmpRules';

interface SymptomMedLogSectionProps {
  logs: SymptomMedLog[];
  onAddLog: (input: SymptomMedLogInput) => void;
  onDeleteLog: (id: string) => void;
}

const SYMPTOM_CHOICES = [
  {label: 'Mild', hint: 'Barely noticed today', value: 2},
  {label: 'Moderate', hint: 'Got in the way a bit', value: 5},
  {label: 'Strong', hint: 'Hard to ignore', value: 8},
];

export function SymptomMedLogSection({
  logs,
  onAddLog,
  onDeleteLog,
}: SymptomMedLogSectionProps) {
  const [condition, setCondition] = useState<ChronicCondition>('hypertension');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(2);
  const [doseTaken, setDoseTaken] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed'>('all');
  const [savedText, setSavedText] = useState<string | null>(null);

  const summary = useMemo(() => summarizeSymptomMedLogs(logs), [logs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((item) => {
        if (filter === 'taken') return item.doseTaken;
        if (filter === 'missed') return !item.doseTaken;
        return true;
      }),
    [logs, filter]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      condition,
      symptomSeverity,
      fatigueLevel: symptomSeverity,
      vitalReading: '',
      medicationName: CDSMP_CONDITIONS[condition].sampleMedication,
      doseTaken,
      timing: doseTaken ? 'before-symptoms' : 'missed',
      note: note.trim(),
    });
    setNote('');
    setSavedText('Daily log saved.');
  };

  const severityWord = (score: number | null) => {
    if (score === null) return '—';
    if (score <= 3) return 'Mild';
    if (score <= 6) return 'Moderate';
    return 'Strong';
  };

  return (
    <section
      id="symptom-log"
      aria-labelledby="symptom-log-heading"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="border-b border-slate-200 pb-6">
        <h2
          id="symptom-log-heading"
          className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          How You Felt &amp; Medications
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Keep a quick daily note of how your body felt and whether you took
          your scheduled medication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        {/* Step 1: Condition */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            1. What are you checking in on?
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['hypertension', 'diabetes', 'arthritis'] as ChronicCondition[]).map(
              (cond) => {
                const active = condition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCondition(cond)}
                    className={`flex h-16 items-center rounded-lg border px-4 text-left text-sm font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {CDSMP_CONDITIONS[cond].title}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Step 2 & 3: Symptoms + Medication */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              2. How were your symptoms today?
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {SYMPTOM_CHOICES.map((choice) => {
                const active = symptomSeverity === choice.value;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSymptomSeverity(choice.value)}
                    className={`flex h-16 flex-col justify-center rounded-lg border px-3 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {choice.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        active ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {choice.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              3. Did you take your medication?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                aria-pressed={doseTaken}
                onClick={() => setDoseTaken(true)}
                className={`flex h-16 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors cursor-pointer ${
                  doseTaken
                    ? 'border-emerald-800 bg-emerald-800 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                Yes, took it
              </button>
              <button
                type="button"
                aria-pressed={!doseTaken}
                onClick={() => setDoseTaken(false)}
                className={`flex h-16 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors cursor-pointer ${
                  !doseTaken
                    ? 'border-rose-800 bg-rose-800 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                Missed or late
              </button>
            </div>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label
            htmlFor="daily-log-note"
            className="block text-xs font-medium text-slate-600"
          >
            Optional note or reading (e.g., 124/78 before breakfast)
          </label>
          <input
            id="daily-log-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything worth remembering today"
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none"
          />
        </div>

        {/* Single Primary CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-600 tabular-nums">
            {summary.totalLogs > 0
              ? `Taken ${summary.adherencePercent}% of logged days · Average symptoms: ${severityWord(
                  summary.avgSymptomTaken
                )} when taken`
              : 'Your pattern summary will appear once you log a few days.'}
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Save Daily Log
          </button>
        </div>

        {savedText && (
          <p role="status" className="text-xs font-semibold text-emerald-800">
            {savedText}
          </p>
        )}
      </form>

      {/* Clean Minimal Log History */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Entries ({filteredLogs.length})
          </h3>
          <select
            aria-label="Filter daily logs by medication"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'taken' | 'missed')
            }
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700"
          >
            <option value="all">All days</option>
            <option value="taken">Medication taken</option>
            <option value="missed">Missed or late</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            No entries match this filter.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {filteredLogs.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-slate-900">
                    {entry.doseTaken ? (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="h-4 w-4 shrink-0 text-rose-700"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      {CDSMP_CONDITIONS[entry.condition].title} ·{' '}
                      {severityWord(entry.symptomSeverity)} symptoms ·{' '}
                      {entry.doseTaken ? 'Took medication' : 'Missed dose'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">{entry.date}</span>
                    {entry.vitalReading ? ` · ${entry.vitalReading}` : ''}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label={`Delete daily log from ${entry.date}`}
                  onClick={() => onDeleteLog(entry.id)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
