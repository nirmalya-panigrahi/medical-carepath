import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {useMemo, useState} from 'react';
import {REHAB_PROTOCOLS} from '../../data/pathwaysData';
import type {
  ProgressionStatus,
  RehabCheckIn,
  RehabCheckInInput,
  RehabTrack,
} from '../../types/carepath';
import {
  BORG_ANCHORS,
  evaluateSafeProgression,
  getBorgZone,
  isRpeInTargetForTrack,
  validateRehabInput,
} from '../../utils/rehabRules';

interface RehabPathwaysSectionProps {
  logs: RehabCheckIn[];
  selectedTrack: RehabTrack;
  onSelectTrack: (track: RehabTrack) => void;
  onAddLog: (input: RehabCheckInInput) => void;
  onDeleteLog: (id: string) => void;
  onResetLogs: () => void;
}

const STATUS_BADGE_MAP: Record<
  ProgressionStatus,
  {label: string; toneClass: string; Icon: typeof CheckCircle2}
> = {
  progress: {
    label: 'Progress +10%',
    toneClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    Icon: CheckCircle2,
  },
  maintain: {
    label: 'Hold Baseline',
    toneClass: 'text-amber-900 bg-amber-50 border-amber-200',
    Icon: PauseCircle,
  },
  regress: {
    label: 'Regress -25%',
    toneClass: 'text-rose-800 bg-rose-50 border-rose-200',
    Icon: AlertTriangle,
  },
};

export function RehabPathwaysSection({
  logs,
  selectedTrack,
  onSelectTrack,
  onAddLog,
  onDeleteLog,
  onResetLogs,
}: RehabPathwaysSectionProps) {
  const protocol = REHAB_PROTOCOLS[selectedTrack];

  const [mobilityScore, setMobilityScore] = useState<number>(4);
  const [painBefore, setPainBefore] = useState<number>(1);
  const [painDuring, setPainDuring] = useState<number>(2);
  const [painAfter24h, setPainAfter24h] = useState<number>(2);
  const [borgRpe, setBorgRpe] = useState<number>(12);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [completedChecks, setCompletedChecks] = useState<string[]>(
    protocol.dailyChecks.slice(0, 2)
  );
  const [notes, setNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filterTrack, setFilterTrack] = useState<'all' | RehabTrack>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ProgressionStatus>(
    'all'
  );
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const handleTrackSwitch = (track: RehabTrack) => {
    onSelectTrack(track);
    setCompletedChecks(REHAB_PROTOCOLS[track].dailyChecks.slice(0, 2));
    setFormErrors({});
  };

  const toggleCheck = (item: string) => {
    setCompletedChecks((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const borgInfo = useMemo(() => getBorgZone(borgRpe), [borgRpe]);
  const inTrackTarget = useMemo(
    () => isRpeInTargetForTrack(selectedTrack, borgRpe),
    [selectedTrack, borgRpe]
  );

  const previewEvaluation = useMemo(
    () =>
      evaluateSafeProgression({
        track: selectedTrack,
        mobilityScore,
        painBefore,
        painDuring,
        painAfter24h,
        borgRpe,
        durationMinutes,
        completedChecks,
        notes,
      }),
    [
      selectedTrack,
      mobilityScore,
      painBefore,
      painDuring,
      painAfter24h,
      borgRpe,
      durationMinutes,
      completedChecks,
      notes,
    ]
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter((item) => {
        if (filterTrack !== 'all' && item.track !== filterTrack) {
          return false;
        }
        if (filterStatus !== 'all' && item.evaluation.status !== filterStatus) {
          return false;
        }
        return true;
      }),
    [logs, filterTrack, filterStatus]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: RehabCheckInInput = {
      track: selectedTrack,
      mobilityScore,
      painBefore,
      painDuring,
      painAfter24h,
      borgRpe,
      durationMinutes,
      completedChecks,
      notes: notes.trim(),
    };

    const validation = validateRehabInput(draft);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      setSubmittedNotice(null);
      return;
    }

    setFormErrors({});
    onAddLog(draft);
    setNotes('');
    setSubmittedNotice(
      `Saved ${protocol.shortTitle} session — ${previewEvaluation.headline}`
    );
  };

  const PreviewStatus = STATUS_BADGE_MAP[previewEvaluation.status];

  return (
    <section
      id="rehab-pathways"
      aria-labelledby="rehab-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-sky-700 uppercase">
            01. Pulmonary, Cardiac &amp; Musculoskeletal Rehab
          </p>
          <h2
            id="rehab-heading"
            className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance"
          >
            Graded Exposure &amp; Borg RPE Pacing
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Select your recovery pathway, score perceived exertion on the Borg
            6–20 scale, and apply deterministic 24-hour pain-threshold rules before
            increasing volume.
          </p>
        </div>

        {/* Pathway Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Rehab pathway selector"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 self-start md:self-auto"
        >
          {(['pulmonary', 'cardiac', 'msk'] as RehabTrack[]).map((trackKey) => {
            const active = selectedTrack === trackKey;
            return (
              <button
                key={trackKey}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTrackSwitch(trackKey)}
                className={`min-h-10 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-700 ${
                  active
                    ? 'bg-white text-sky-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {REHAB_PROTOCOLS[trackKey].shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Protocol Guidance Strip */}
      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Target Pacing Band</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {protocol.targetRpeRange}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Pain &amp; Breath Ceiling</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {protocol.painCeiling}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Graded Exposure Rule</p>
          <p className="mt-1 text-sm text-slate-700">{protocol.pacingSummary}</p>
        </div>
      </div>

      {/* Main Split: Borg RPE + Mobility Check Form (Left) | Live Rule Engine & History (Right) */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Interactive Borg Pacing & Mobility Check Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6"
        >
          <div id="borg-pacing" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="borg-rpe-slider"
                className="text-sm font-semibold text-slate-900"
              >
                Borg Rating of Perceived Exertion (6–20)
              </label>
              <span className="font-mono text-sm font-semibold text-sky-800 tabular-nums">
                RPE {borgRpe} · CR-10 ≈ {borgInfo.cr10}
              </span>
            </div>

            <input
              id="borg-rpe-slider"
              type="range"
              min={6}
              max={20}
              step={1}
              value={borgRpe}
              onChange={(e) => setBorgRpe(Number(e.target.value))}
              className="mt-3 h-2.5 w-full cursor-pointer accent-sky-700"
            />

            {/* Quick Borg Anchor Buttons */}
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {BORG_ANCHORS.filter((a) =>
                [6, 9, 11, 13, 15, 17].includes(a.rpe)
              ).map((anchor) => {
                const isSelected = borgRpe === anchor.rpe;
                return (
                  <button
                    key={anchor.rpe}
                    type="button"
                    onClick={() => setBorgRpe(anchor.rpe)}
                    className={`min-h-10 rounded-md border px-2 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {anchor.rpe}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">
                  {borgInfo.label}
                </span>
                <span
                  className={
                    inTrackTarget
                      ? 'font-semibold text-emerald-800'
                      : 'font-semibold text-amber-800'
                  }
                >
                  {inTrackTarget
                    ? `Within ${protocol.shortTitle} target`
                    : `Outside ${protocol.shortTitle} target`}
                </span>
              </div>
              <p className="mt-1 text-slate-600">Talk Test: {borgInfo.talkTest}</p>
            </div>
            {formErrors.borgRpe && (
              <p role="alert" className="mt-1 text-xs font-medium text-rose-700">
                {formErrors.borgRpe}
              </p>
            )}
          </div>

          {/* Pain Threshold Inputs (0-10 NRS) + Duration + Mobility */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="pain-before"
                className="block text-xs font-semibold text-slate-700"
              >
                Pre-Session Pain (0–10)
              </label>
              <input
                id="pain-before"
                type="number"
                min={0}
                max={10}
                value={painBefore}
                onChange={(e) => setPainBefore(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-sky-700 focus:outline-none"
              />
              {formErrors.painBefore && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {formErrors.painBefore}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pain-during"
                className="block text-xs font-semibold text-slate-700"
              >
                During-Session Pain (0–10)
              </label>
              <input
                id="pain-during"
                type="number"
                min={0}
                max={10}
                value={painDuring}
                onChange={(e) => setPainDuring(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-sky-700 focus:outline-none"
              />
              {formErrors.painDuring && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {formErrors.painDuring}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pain-after-24h"
                className="block text-xs font-semibold text-slate-700"
              >
                24-Hour Post Pain (0–10)
              </label>
              <input
                id="pain-after-24h"
                type="number"
                min={0}
                max={10}
                value={painAfter24h}
                onChange={(e) => setPainAfter24h(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-sky-700 focus:outline-none"
              />
              {formErrors.painAfter24h && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {formErrors.painAfter24h}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="session-duration"
                className="block text-xs font-semibold text-slate-700"
              >
                Active Duration (minutes)
              </label>
              <input
                id="session-duration"
                type="number"
                min={1}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-sky-700 focus:outline-none"
              />
              {formErrors.durationMinutes && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  {formErrors.durationMinutes}
                </p>
              )}
            </div>
          </div>

          {/* Mobility Readiness 1-5 */}
          <div className="mt-5">
            <span className="block text-xs font-semibold text-slate-700">
              Daily Mobility Readiness (1 = Severely Restricted · 5 = Smooth ROM)
            </span>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMobilityScore(score)}
                  aria-pressed={mobilityScore === score}
                  className={`min-h-11 rounded-md border font-mono text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                    mobilityScore === score
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Mobility Checks */}
          <fieldset className="mt-5">
            <legend className="text-xs font-semibold text-slate-700">
              {protocol.shortTitle} Daily Mobility Checks
            </legend>
            <div className="mt-2 space-y-2">
              {protocol.dailyChecks.map((checkItem) => {
                const checked = completedChecks.includes(checkItem);
                return (
                  <label
                    key={checkItem}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheck(checkItem)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-sky-700"
                    />
                    <span>{checkItem}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Session Notes */}
          <div className="mt-5">
            <label
              htmlFor="rehab-notes"
              className="block text-xs font-semibold text-slate-700"
            >
              Pacing Notes (Optional)
            </label>
            <input
              id="rehab-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Pursed-lip exhale on stairs kept breathing steady"
              className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span>Log Rehab Session</span>
            </button>

            {submittedNotice && (
              <p
                role="status"
                className="text-xs font-medium text-emerald-800"
              >
                {submittedNotice}
              </p>
            )}
          </div>
        </form>

        {/* Right: Live Safe Progression Rule Verdict + History Table / Cards */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Live Rule Evaluation Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Live Safe Progression Verdict
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${PreviewStatus.toneClass}`}
              >
                <PreviewStatus.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{PreviewStatus.label}</span>
              </span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              {previewEvaluation.headline}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              {previewEvaluation.guidance}
            </p>
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Next-Session Rule: </span>
              {previewEvaluation.adjustmentRule}
            </div>
          </div>

          {/* Session History with Filter & Responsive Cards/Table */}
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Pacing &amp; Pain Log ({filteredLogs.length})
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter rehab logs by pathway"
                  value={filterTrack}
                  onChange={(e) =>
                    setFilterTrack(e.target.value as 'all' | RehabTrack)
                  }
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="all">All Pathways</option>
                  <option value="pulmonary">Pulmonary</option>
                  <option value="cardiac">Cardiac</option>
                  <option value="msk">Musculoskeletal</option>
                </select>

                <select
                  aria-label="Filter rehab logs by progression status"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as 'all' | ProgressionStatus
                    )
                  }
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="all">All Verdicts</option>
                  <option value="progress">Progress (+10%)</option>
                  <option value="maintain">Hold Baseline</option>
                  <option value="regress">Regress (-25%)</option>
                </select>

                <button
                  type="button"
                  onClick={onResetLogs}
                  title="Restore sample rehab logs"
                  className="inline-flex min-h-10 items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No rehab sessions match the current filter.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Clear filters or log a daily mobility and Borg RPE check-in on
                  the left.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Data Table */}
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-2 font-medium">Date · Track</th>
                        <th className="pb-2 text-right font-medium">Borg</th>
                        <th className="pb-2 text-right font-medium">
                          Pain (Pre/24h)
                        </th>
                        <th className="pb-2 pl-3 font-medium">Verdict</th>
                        <th className="pb-2 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((entry) => {
                        const meta = STATUS_BADGE_MAP[entry.evaluation.status];
                        return (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="py-3 pr-2">
                              <div className="font-mono text-slate-900 tabular-nums">
                                {entry.date}
                              </div>
                              <div className="text-slate-500">
                                {REHAB_PROTOCOLS[entry.track].shortTitle} ·{' '}
                                {entry.durationMinutes}m
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                              {entry.borgRpe}
                            </td>
                            <td className="py-3 text-right font-mono text-slate-700 tabular-nums">
                              {entry.painBefore} → {entry.painAfter24h}
                            </td>
                            <td className="py-3 pl-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold ${meta.toneClass}`}
                              >
                                <meta.Icon className="h-3 w-3" aria-hidden="true" />
                                <span>{meta.label}</span>
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                aria-label={`Delete rehab log from ${entry.date}`}
                                onClick={() => onDeleteLog(entry.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack */}
                <div className="mt-4 space-y-3 md:hidden">
                  {filteredLogs.map((entry) => {
                    const meta = STATUS_BADGE_MAP[entry.evaluation.status];
                    return (
                      <div
                        key={entry.id}
                        className="rounded-md border border-slate-200 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                              {entry.date} · {REHAB_PROTOCOLS[entry.track].shortTitle}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                              Borg {entry.borgRpe} · {entry.durationMinutes} min · Pain{' '}
                              {entry.painBefore}→{entry.painAfter24h}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Delete rehab log from ${entry.date}`}
                            onClick={() => onDeleteLog(entry.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${meta.toneClass}`}
                          >
                            <meta.Icon className="h-3 w-3" aria-hidden="true" />
                            <span>{meta.label}</span>
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="mt-2 text-xs text-slate-600">{entry.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
