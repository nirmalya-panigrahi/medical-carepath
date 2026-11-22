import {X} from 'lucide-react';
import {useState} from 'react';
import type {RehabCheckInInput, RehabTrack} from '../../types/carepath';
import {evaluateSafeProgression, validateRehabInput} from '../../utils/rehabRules';

interface QuickCheckInDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaveRehabCheckIn: (input: RehabCheckInInput) => void;
}

export function QuickCheckInDrawer({
  open,
  onClose,
  onSaveRehabCheckIn,
}: QuickCheckInDrawerProps) {
  const [track, setTrack] = useState<RehabTrack>('pulmonary');
  const [borgRpe, setBorgRpe] = useState<number>(12);
  const [painDuring, setPainDuring] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const quickInput: RehabCheckInInput = {
    track,
    mobilityScore: 4,
    painBefore: Math.max(0, painDuring - 1),
    painDuring,
    painAfter24h: painDuring,
    borgRpe,
    durationMinutes,
    completedChecks: [],
    notes: 'Quick daily check-in',
  };

  const verdict = evaluateSafeProgression(quickInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateRehabInput(quickInput);
    if (!check.valid) {
      setErrorMsg(Object.values(check.errors)[0] || 'Check input values.');
      return;
    }
    setErrorMsg(null);
    onSaveRehabCheckIn(quickInput);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-checkin-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-xs"
    >
      <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2
              id="quick-checkin-title"
              className="font-display text-2xl font-bold text-slate-900"
            >
              Quick Daily Check-In
            </h2>
            <p className="text-xs text-slate-500">
              30-second Borg pacing and pain threshold snapshot
            </p>
          </div>
          <button
            type="button"
            aria-label="Close quick check-in drawer"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-5">
          <div>
            <label
              htmlFor="quick-track"
              className="block text-xs font-semibold text-slate-700"
            >
              Pathway
            </label>
            <select
              id="quick-track"
              value={track}
              onChange={(e) => setTrack(e.target.value as RehabTrack)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="pulmonary">Pulmonary Rehab</option>
              <option value="cardiac">Cardiac Rehab</option>
              <option value="msk">Musculoskeletal Rehab</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <label htmlFor="quick-borg">Borg RPE (6–20)</label>
              <span className="font-mono tabular-nums">{borgRpe}</span>
            </div>
            <input
              id="quick-borg"
              type="range"
              min={6}
              max={20}
              value={borgRpe}
              onChange={(e) => setBorgRpe(Number(e.target.value))}
              className="mt-2 h-2.5 w-full cursor-pointer accent-sky-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="quick-pain"
                className="block text-xs font-semibold text-slate-700"
              >
                Pain (0–10)
              </label>
              <input
                id="quick-pain"
                type="number"
                min={0}
                max={10}
                value={painDuring}
                onChange={(e) => setPainDuring(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="quick-duration"
                className="block text-xs font-semibold text-slate-700"
              >
                Minutes
              </label>
              <input
                id="quick-duration"
                type="number"
                min={1}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs">
            <p className="font-semibold text-slate-900">{verdict.headline}</p>
            <p className="mt-1 text-slate-600">{verdict.adjustmentRule}</p>
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-rose-700">
              {errorMsg}
            </p>
          )}

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-md bg-sky-700 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800 cursor-pointer"
            >
              Save Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
