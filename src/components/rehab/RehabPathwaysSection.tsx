import {CheckCircle2, PauseCircle, AlertTriangle, Trash2} from 'lucide-react';
import {useMemo, useState} from 'react';
import {REHAB_PROTOCOLS} from '../../data/pathwaysData';
import type {
  ProgressionStatus,
  RehabCheckIn,
  RehabCheckInInput,
  RehabTrack,
} from '../../types/carepath';
import {evaluateSafeProgression} from '../../utils/rehabRules';

interface RehabPathwaysSectionProps {
  logs: RehabCheckIn[];
  selectedTrack: RehabTrack;
  onSelectTrack: (track: RehabTrack) => void;
  onAddLog: (input: RehabCheckInInput) => void;
  onDeleteLog: (id: string) => void;
}

const EFFORT_CHOICES = [
  {label: 'Easy', hint: 'Can sing or chat easily', rpe: 9},
  {label: 'Steady', hint: 'Comfortable, full sentences', rpe: 12},
  {label: 'Hard', hint: 'Short phrases only', rpe: 15},
  {label: 'Too Much', hint: 'Out of breath or straining', rpe: 18},
];

const PAIN_CHOICES = [
  {label: 'Calm', hint: 'Little to no soreness', value: 2},
  {label: 'Noticeable', hint: 'Mild ache while moving', value: 4},
  {label: 'Sore / Flare', hint: 'Strong pain or swelling', value: 7},
];

const DURATION_CHOICES = [10, 20, 30];

const VERDICT_COPY: Record<
  ProgressionStatus,
  {title: string; detail: string; tone: string; Icon: typeof CheckCircle2}
> = {
  progress: {
    title: 'Looking good — safe to add a little more next time',
    detail: 'Your body handled this well. Add 2 or 3 extra minutes next session.',
    tone: 'text-emerald-800',
    Icon: CheckCircle2,
  },
  maintain: {
    title: 'Stay steady — repeat this same amount',
    detail: 'Do this same time and pace for a couple of days until it feels easier.',
    tone: 'text-amber-800',
    Icon: PauseCircle,
  },
  regress: {
    title: 'Take it easy — ease back and rest',
    detail: 'Your body is asking for a lighter load. Cut back by a quarter next time.',
    tone: 'text-rose-800',
    Icon: AlertTriangle,
  },
};

export function RehabPathwaysSection({
  logs,
  selectedTrack,
  onSelectTrack,
  onAddLog,
  onDeleteLog,
}: RehabPathwaysSectionProps) {
  const protocol = REHAB_PROTOCOLS[selectedTrack];

  const [borgRpe, setBorgRpe] = useState<number>(12);
  const [painLevel, setPainLevel] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [notes, setNotes] = useState<string>('');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const currentInput: RehabCheckInInput = useMemo(
    () => ({
      track: selectedTrack,
      mobilityScore: painLevel >= 6 ? 2 : 4,
      painBefore: Math.max(0, painLevel - 1),
      painDuring: painLevel,
      painAfter24h: painLevel,
      borgRpe,
      durationMinutes,
      completedChecks: [],
      notes: notes.trim(),
    }),
    [selectedTrack, borgRpe, painLevel, durationMinutes, notes]
  );

  const evaluation = useMemo(
    () => evaluateSafeProgression(currentInput),
    [currentInput]
  );

  const verdict = VERDICT_COPY[evaluation.status];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog(currentInput);
    setNotes('');
    setSavedBanner(`Saved ${protocol.shortTitle.toLowerCase()} check-in.`);
  };

  return (
    <section
      id="rehab-pathways"
      aria-labelledby="rehab-heading"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="border-b border-slate-200 pb-6">
        <h2
          id="rehab-heading"
          className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Daily Recovery Check-In
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Pick what you are working on and how today felt. We&apos;ll tell you
          whether to keep steady, add a little, or rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Step 1: Recovery Focus */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            1. What are you focusing on?
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['pulmonary', 'cardiac', 'msk'] as RehabTrack[]).map((track) => {
              const active = selectedTrack === track;
              return (
                <button
                  key={track}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onSelectTrack(track);
                    setSavedBanner(null);
                  }}
                  className={`flex h-16 items-center rounded-lg border px-4 text-left text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {REHAB_PROTOCOLS[track].title}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">{protocol.pacingSummary}</p>
        </div>

        {/* Step 2: Effort Level */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            2. How hard did moving feel?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EFFORT_CHOICES.map((choice) => {
              const active = borgRpe === choice.rpe;
              return (
                <button
                  key={choice.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setBorgRpe(choice.rpe)}
                  className={`flex h-16 flex-col justify-center rounded-lg border px-4 text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {choice.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
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

        {/* Step 3 & 4: Pain / Soreness + Time */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-slate-900">
              3. How is your soreness or pain?
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAIN_CHOICES.map((choice) => {
                const active = painLevel === choice.value;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPainLevel(choice.value)}
                    className={`flex h-16 flex-col justify-center rounded-lg border px-4 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {choice.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
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
              4. Minutes moved
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DURATION_CHOICES.map((mins) => {
                const active = durationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex h-16 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional short note */}
        <div>
          <label
            htmlFor="rehab-simple-note"
            className="block text-xs font-medium text-slate-600"
          >
            Quick note (optional)
          </label>
          <input
            id="rehab-simple-note"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Walked around the block after breakfast"
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none"
          />
        </div>

        {/* Plain-Language Guidance Summary + Single Primary CTA */}
        <div className="flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <verdict.Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${verdict.tone}`}
              aria-hidden="true"
            />
            <div>
              <p className={`text-sm font-bold ${verdict.tone}`}>
                {verdict.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">{verdict.detail}</p>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-sky-700 px-6 text-sm font-bold text-white hover:bg-sky-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Save Check-In
          </button>
        </div>

        {savedBanner && (
          <p role="status" className="text-xs font-semibold text-emerald-800">
            {savedBanner}
          </p>
        )}
      </form>

      {/* Clean Minimal Recent History */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Check-Ins ({logs.length})
        </h3>
        {logs.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No check-ins saved yet. Complete the quick steps above to log your
            first session.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {logs.map((entry) => {
              const effortLabel =
                entry.borgRpe <= 10
                  ? 'Easy'
                  : entry.borgRpe <= 13
                  ? 'Steady'
                  : entry.borgRpe <= 16
                  ? 'Hard'
                  : 'Too Much';
              const stepOutcome =
                entry.evaluation.status === 'progress'
                  ? 'Add a little next time'
                  : entry.evaluation.status === 'maintain'
                  ? 'Stay steady'
                  : 'Ease back & rest';

              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {REHAB_PROTOCOLS[entry.track].shortTitle} · {effortLabel} ·{' '}
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {entry.durationMinutes} min
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono tabular-nums">{entry.date}</span>{' '}
                      · {stepOutcome}
                      {entry.notes ? ` · ${entry.notes}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete check-in from ${entry.date}`}
                    onClick={() => onDeleteLog(entry.id)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
