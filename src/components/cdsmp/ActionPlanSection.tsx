import {Check, Trash2} from 'lucide-react';
import {useMemo, useState} from 'react';
import {CDSMP_CONDITIONS} from '../../data/pathwaysData';
import type {
  ActionPlan,
  ActionPlanDraft,
  ChronicCondition,
} from '../../types/carepath';
import {
  computeWeeklyCompletionRate,
  evaluateConfidence,
  scaleDownDraftForConfidence,
  validateActionPlan,
} from '../../utils/cdsmpRules';

interface ActionPlanSectionProps {
  plans: ActionPlan[];
  selectedCondition: ChronicCondition;
  onSelectCondition: (condition: ChronicCondition) => void;
  onAddPlan: (draft: ActionPlanDraft) => void;
  onToggleDay: (planId: string, dayIndex: number) => void;
  onUpdateFeedback: (
    planId: string,
    barrierNote: string,
    feedbackAdjustment: string
  ) => void;
  onDeletePlan: (planId: string) => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_COUNTS = [2, 3, 4, 5, 6, 7];

export function ActionPlanSection({
  plans,
  selectedCondition,
  onSelectCondition,
  onAddPlan,
  onToggleDay,
  onUpdateFeedback,
  onDeletePlan,
}: ActionPlanSectionProps) {
  const template = CDSMP_CONDITIONS[selectedCondition];

  const [actionText, setActionText] = useState<string>(template.sampleAction);
  const [scheduleWhen, setScheduleWhen] = useState<string>(template.sampleWhen);
  const [frequencyDays, setFrequencyDays] = useState<number>(4);
  const [confidenceScore, setConfidenceScore] = useState<number>(8);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const confidenceEval = useMemo(
    () => evaluateConfidence(confidenceScore),
    [confidenceScore]
  );

  const handleConditionPick = (cond: ChronicCondition) => {
    onSelectCondition(cond);
    const nextTemplate = CDSMP_CONDITIONS[cond];
    setActionText(nextTemplate.sampleAction);
    setScheduleWhen(nextTemplate.sampleWhen);
    setFormError(null);
    setStatusMessage(null);
  };

  const handleMakeEasier = () => {
    const scaled = scaleDownDraftForConfidence({
      condition: selectedCondition,
      actionText,
      quantity: template.sampleQuantity,
      scheduleWhen,
      frequencyDays,
      confidenceScore,
    });
    setFrequencyDays(scaled.frequencyDays);
    setConfidenceScore(scaled.confidenceScore);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: ActionPlanDraft = {
      condition: selectedCondition,
      actionText: actionText.trim(),
      quantity: template.sampleQuantity,
      scheduleWhen: scheduleWhen.trim() || 'Anytime today',
      frequencyDays,
      confidenceScore,
    };

    const validation = validateActionPlan(draft);
    if (!validation.valid) {
      setFormError(
        Object.values(validation.errors)[0] ||
          'Please enter a short, clear goal for this week.'
      );
      setStatusMessage(null);
      return;
    }

    setFormError(null);
    onAddPlan(draft);
    setStatusMessage('Weekly goal saved.');
  };

  return (
    <section
      id="action-plans"
      aria-labelledby="cdsmp-heading"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="border-b border-slate-200 pb-6">
        <h2
          id="cdsmp-heading"
          className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          One Small Goal This Week
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Choose something simple enough that you feel sure you can stick with
          it all week.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-7">
        {/* Step 1: Condition Focus */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            1. What is this goal helping with?
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['diabetes', 'hypertension', 'arthritis'] as ChronicCondition[]).map(
              (cond) => {
                const active = selectedCondition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleConditionPick(cond)}
                    className={`flex h-16 items-center rounded-lg border px-4 text-left text-sm font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-lime-800 bg-lime-800 text-white'
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

        {/* Step 2: Goal + When + Days */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="cdsmp-action"
              className="block text-sm font-semibold text-slate-900"
            >
              2. What will you do?
            </label>
            <input
              id="cdsmp-action"
              type="text"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="e.g., Walk for 15 minutes after dinner"
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 focus:border-lime-800 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="cdsmp-when"
              className="block text-sm font-semibold text-slate-900"
            >
              3. When?
            </label>
            <input
              id="cdsmp-when"
              type="text"
              value={scheduleWhen}
              onChange={(e) => setScheduleWhen(e.target.value)}
              placeholder="e.g., After dinner"
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 focus:border-lime-800 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              4. How many days this week?
            </p>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {DAY_COUNTS.map((days) => {
                const active = frequencyDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFrequencyDays(days)}
                    className={`flex h-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {days}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 5: 1-10 Tap Confidence Buttons */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            5. How sure are you that you&apos;ll do this? (1 = not sure · 10 = very sure)
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const active = confidenceScore === num;
              return (
                <button
                  key={num}
                  type="button"
                  aria-label={`Confidence ${num} out of 10`}
                  aria-pressed={active}
                  onClick={() => setConfidenceScore(num)}
                  className={`flex h-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                    active
                      ? num < 7
                        ? 'border-amber-700 bg-amber-600 text-white'
                        : 'border-lime-800 bg-lime-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {confidenceEval.needsRefinement && (
            <div
              role="alert"
              className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900"
            >
              <span>
                That feels like a stretch ({confidenceScore}/10). Picking fewer
                days makes it much easier to keep up.
              </span>
              <button
                type="button"
                onClick={handleMakeEasier}
                className="font-semibold underline underline-offset-4 hover:text-amber-950 cursor-pointer"
              >
                Try fewer days
              </button>
            </div>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-xs font-semibold text-rose-700">
            {formError}
          </p>
        )}

        {/* Single Primary CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500">
            Aim for 7 or higher before locking in your week.
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-lime-800 px-6 text-sm font-bold text-white hover:bg-lime-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            Save Weekly Goal
          </button>
        </div>

        {statusMessage && (
          <p role="status" className="text-xs font-semibold text-lime-900">
            {statusMessage}
          </p>
        )}
      </form>

      {/* Active Goals Checklist */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <h3 className="text-sm font-bold text-slate-900">
          Your Weekly Goals ({plans.length})
        </h3>
        {plans.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No goals saved yet. Add one small step above to track your week.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200">
            {plans.map((plan) => {
              const stats = computeWeeklyCompletionRate(
                plan.completedDays,
                plan.frequencyDays
              );
              const isEditing = editingNoteId === plan.id;

              return (
                <article key={plan.id} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {CDSMP_CONDITIONS[plan.condition].title} ·{' '}
                        {plan.scheduleWhen} ·{' '}
                        <span className="font-mono tabular-nums">
                          {stats.completedCount}/{stats.targetDays} days done
                        </span>
                      </p>
                      <h4 className="mt-1 text-base font-bold text-slate-900">
                        {plan.actionText}
                      </h4>
                    </div>

                    <button
                      type="button"
                      aria-label={`Delete goal ${plan.actionText}`}
                      onClick={() => onDeletePlan(plan.id)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Day checkboxes */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {DAY_LABELS.map((char, idx) => {
                      const done = plan.completedDays[idx];
                      return (
                        <button
                          key={`${plan.id}-d-${idx}`}
                          type="button"
                          aria-label={`Toggle day ${idx + 1} for ${plan.actionText}`}
                          aria-pressed={done}
                          onClick={() => onToggleDay(plan.id, idx)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                            done
                              ? 'border-lime-800 bg-lime-800 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : char}
                        </button>
                      );
                    })}
                  </div>

                  {/* Lightweight reflection note */}
                  <div className="mt-3 text-xs text-slate-600">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="What helped or got in the way?"
                          className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateFeedback(
                              plan.id,
                              noteDraft.trim(),
                              plan.feedbackAdjustment
                            );
                            setEditingNoteId(null);
                          }}
                          className="h-11 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <span>
                          {plan.barrierNote
                            ? `Note: ${plan.barrierNote}`
                            : 'No weekly note yet.'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(plan.id);
                            setNoteDraft(plan.barrierNote);
                          }}
                          className="font-semibold text-slate-800 underline underline-offset-4 hover:text-slate-950 cursor-pointer"
                        >
                          {plan.barrierNote ? 'Edit note' : 'Add weekly note'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
