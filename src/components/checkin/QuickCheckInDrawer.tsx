import {X} from 'lucide-react';
import {useState} from 'react';
import {CDSMP_CONDITIONS} from '../../data/pathwaysData';
import type {
  ChronicCondition,
  RehabCheckInInput,
  RehabTrack,
  SymptomMedLogInput,
} from '../../types/carepath';
import {evaluateSafeProgression} from '../../utils/rehabRules';
import type {CareSpace} from '../layout/TopNav';

interface QuickCheckInDrawerProps {
  open: boolean;
  initialSpace: CareSpace;
  onClose: () => void;
  onSaveRecovery: (input: RehabCheckInInput) => void;
  onSaveHabitLog: (input: SymptomMedLogInput) => void;
}

export function QuickCheckInDrawer({
  open,
  initialSpace,
  onClose,
  onSaveRecovery,
  onSaveHabitLog,
}: QuickCheckInDrawerProps) {
  const [space, setSpace] = useState<CareSpace>(initialSpace);

  // Independent Recovery state
  const [track, setTrack] = useState<RehabTrack>('pulmonary');
  const [borgRpe, setBorgRpe] = useState<number>(12);
  const [painLevel, setPainLevel] = useState<number>(2);

  // Independent Daily Habits state
  const [condition, setCondition] = useState<ChronicCondition>('hypertension');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(2);
  const [doseTaken, setDoseTaken] = useState<boolean>(true);

  if (!open) {
    return null;
  }

  const quickRecoveryInput: RehabCheckInInput = {
    track,
    mobilityScore: painLevel >= 6 ? 2 : 4,
    painBefore: Math.max(0, painLevel - 1),
    painDuring: painLevel,
    painAfter24h: painLevel,
    borgRpe,
    durationMinutes: 20,
    completedChecks: [],
    notes: 'Quick recovery check-in',
  };

  const verdict = evaluateSafeProgression(quickRecoveryInput);
  const simpleAdvice =
    verdict.status === 'progress'
      ? 'Looking good — safe to add 2–3 minutes next time.'
      : verdict.status === 'maintain'
      ? 'Stay steady — repeat this same amount.'
      : 'Take it easy — ease back and rest today.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (space === 'recovery') {
      onSaveRecovery(quickRecoveryInput);
    } else {
      onSaveHabitLog({
        condition,
        symptomSeverity,
        fatigueLevel: symptomSeverity,
        vitalReading: '',
        medicationName: CDSMP_CONDITIONS[condition].sampleMedication,
        doseTaken,
        timing: doseTaken ? 'before-symptoms' : 'missed',
        note: 'Quick daily habit log',
      });
    }
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
              Quick Check-In
            </h2>
            <p className="text-xs text-slate-500">
              Choose which independent log you want to update
            </p>
          </div>
          <button
            type="button"
            aria-label="Close quick check-in drawer"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Independent Space Switcher */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={space === 'recovery'}
            onClick={() => setSpace('recovery')}
            className={`h-11 rounded-lg border text-xs font-bold cursor-pointer ${
              space === 'recovery'
                ? 'border-sky-700 bg-sky-700 text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            Gentle Recovery
          </button>
          <button
            type="button"
            aria-pressed={space === 'habits'}
            onClick={() => setSpace('habits')}
            className={`h-11 rounded-lg border text-xs font-bold cursor-pointer ${
              space === 'habits'
                ? 'border-lime-800 bg-lime-800 text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            Daily Habits
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-6">
          {space === 'recovery' ? (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-700">Focus</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([
                    ['pulmonary', 'Breathing'],
                    ['cardiac', 'Heart'],
                    ['msk', 'Joints'],
                  ] as Array<[RehabTrack, string]>).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTrack(key)}
                      className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                        track === key
                          ? 'border-sky-700 bg-sky-700 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  How hard did it feel?
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    {label: 'Easy', rpe: 9},
                    {label: 'Steady', rpe: 12},
                    {label: 'Hard', rpe: 15},
                    {label: 'Too Much', rpe: 18},
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setBorgRpe(opt.rpe)}
                      className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                        borgRpe === opt.rpe
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  How is your soreness?
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    {label: 'Calm', value: 2},
                    {label: 'Noticeable', value: 4},
                    {label: 'Sore', value: 7},
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setPainLevel(opt.value)}
                      className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                        painLevel === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs font-medium text-slate-700">{simpleAdvice}</p>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-700">Focus</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['hypertension', 'diabetes', 'arthritis'] as ChronicCondition[]).map(
                    (cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                          condition === cond
                            ? 'border-lime-800 bg-lime-800 text-white'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {CDSMP_CONDITIONS[cond].title}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  How were your symptoms?
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    {label: 'Mild', value: 2},
                    {label: 'Moderate', value: 5},
                    {label: 'Strong', value: 8},
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSymptomSeverity(opt.value)}
                      className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                        symptomSeverity === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Did you take your medication?
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDoseTaken(true)}
                    className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                      doseTaken
                        ? 'border-emerald-800 bg-emerald-800 text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Yes, took it
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoseTaken(false)}
                    className={`h-11 rounded-lg border text-xs font-semibold cursor-pointer ${
                      !doseTaken
                        ? 'border-rose-800 bg-rose-800 text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Missed or late
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-auto border-t border-slate-200 pt-4">
            <button
              type="submit"
              className={`h-11 w-full rounded-lg px-5 text-sm font-bold text-white cursor-pointer ${
                space === 'recovery'
                  ? 'bg-sky-700 hover:bg-sky-800'
                  : 'bg-lime-800 hover:bg-lime-900'
              }`}
            >
              {space === 'recovery' ? 'Save Check-In' : 'Save Daily Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
