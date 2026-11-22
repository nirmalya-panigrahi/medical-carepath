import {
  AlertCircle,
  Check,
  CheckCircle2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
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
  onResetPlans: () => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ActionPlanSection({
  plans,
  selectedCondition,
  onSelectCondition,
  onAddPlan,
  onToggleDay,
  onUpdateFeedback,
  onDeletePlan,
  onResetPlans,
}: ActionPlanSectionProps) {
  const template = CDSMP_CONDITIONS[selectedCondition];

  const [actionText, setActionText] = useState<string>(template.sampleAction);
  const [quantity, setQuantity] = useState<string>(template.sampleQuantity);
  const [scheduleWhen, setScheduleWhen] = useState<string>(template.sampleWhen);
  const [frequencyDays, setFrequencyDays] = useState<number>(4);
  const [confidenceScore, setConfidenceScore] = useState<number>(8);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filterCondition, setFilterCondition] = useState<'all' | ChronicCondition>('all');

  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [barrierDraft, setBarrierDraft] = useState<string>('');
  const [adjustmentDraft, setAdjustmentDraft] = useState<string>('');

  const confidenceEval = useMemo(
    () => evaluateConfidence(confidenceScore),
    [confidenceScore]
  );

  const handleConditionTab = (condition: ChronicCondition) => {
    onSelectCondition(condition);
    const nextTemplate = CDSMP_CONDITIONS[condition];
    setActionText(nextTemplate.sampleAction);
    setQuantity(nextTemplate.sampleQuantity);
    setScheduleWhen(nextTemplate.sampleWhen);
    setFormErrors({});
  };

  const handleScaleDown = () => {
    const scaled = scaleDownDraftForConfidence({
      condition: selectedCondition,
      actionText,
      quantity,
      scheduleWhen,
      frequencyDays,
      confidenceScore,
    });
    setFrequencyDays(scaled.frequencyDays);
    setConfidenceScore(scaled.confidenceScore);
    setStatusMessage(
      `Scaled target down to ${scaled.frequencyDays} days/week to support >= 7/10 confidence.`
    );
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: ActionPlanDraft = {
      condition: selectedCondition,
      actionText: actionText.trim(),
      quantity: quantity.trim(),
      scheduleWhen: scheduleWhen.trim(),
      frequencyDays,
      confidenceScore,
    };

    const validation = validateActionPlan(draft);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      setStatusMessage(null);
      return;
    }

    setFormErrors({});
    onAddPlan(draft);
    setStatusMessage(`Added weekly action plan for ${template.title}.`);
  };

  const startFeedbackEdit = (plan: ActionPlan) => {
    setEditingFeedbackId(plan.id);
    setBarrierDraft(plan.barrierNote);
    setAdjustmentDraft(plan.feedbackAdjustment);
  };

  const saveFeedbackEdit = (planId: string) => {
    onUpdateFeedback(planId, barrierDraft.trim(), adjustmentDraft.trim());
    setEditingFeedbackId(null);
  };

  const visiblePlans = useMemo(
    () =>
      filterCondition === 'all'
        ? plans
        : plans.filter((p) => p.condition === filterCondition),
    [plans, filterCondition]
  );

  return (
    <section
      id="action-plans"
      aria-labelledby="cdsmp-heading"
      className="border-t border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-lime-800 uppercase">
              02. Stanford CDSMP Self-Management Model
            </p>
            <h2
              id="cdsmp-heading"
              className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance"
            >
              Weekly Action Planning &amp; Confidence Scoring
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Craft specific, realistic weekly micro-goals for diabetes,
              hypertension, or arthritis. Plans scored below 7/10 confidence
              trigger guided down-scaling before you commit.
            </p>
          </div>

          {/* Condition Focus Tabs */}
          <div
            role="tablist"
            aria-label="Chronic condition focus"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 self-start md:self-auto"
          >
            {(['diabetes', 'hypertension', 'arthritis'] as ChronicCondition[]).map(
              (condKey) => {
                const active = selectedCondition === condKey;
                const label =
                  condKey === 'diabetes'
                    ? 'Diabetes'
                    : condKey === 'hypertension'
                    ? 'Hypertension'
                    : 'Arthritis';
                return (
                  <button
                    key={condKey}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleConditionTab(condKey)}
                    className={`min-h-10 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-lime-800 ${
                      active
                        ? 'bg-white text-lime-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Stanford Action Plan Builder */}
          <form
            onSubmit={handleCreatePlan}
            noValidate
            className="rounded-lg border border-slate-200 bg-slate-50/70 p-5 sm:p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Build Weekly Micro-Goal
              </h3>
              <span className="text-xs text-slate-500">{template.focusAreas}</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="cdsmp-action"
                  className="block text-xs font-semibold text-slate-700"
                >
                  What exact action will you do?
                </label>
                <input
                  id="cdsmp-action"
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-lime-700 focus:outline-none"
                />
                {formErrors.actionText && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {formErrors.actionText}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cdsmp-quantity"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    How much?
                  </label>
                  <input
                    id="cdsmp-quantity"
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 15 minutes"
                    className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-lime-700 focus:outline-none"
                  />
                  {formErrors.quantity && (
                    <p role="alert" className="mt-1 text-xs text-rose-700">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cdsmp-frequency"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    How many days/week?
                  </label>
                  <input
                    id="cdsmp-frequency"
                    type="number"
                    min={1}
                    max={7}
                    value={frequencyDays}
                    onChange={(e) => setFrequencyDays(Number(e.target.value))}
                    className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-lime-700 focus:outline-none"
                  />
                  {formErrors.frequencyDays && (
                    <p role="alert" className="mt-1 text-xs text-rose-700">
                      {formErrors.frequencyDays}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="cdsmp-when"
                  className="block text-xs font-semibold text-slate-700"
                >
                  When will you do it?
                </label>
                <input
                  id="cdsmp-when"
                  type="text"
                  value={scheduleWhen}
                  onChange={(e) => setScheduleWhen(e.target.value)}
                  placeholder="e.g., After lunch on weekdays"
                  className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-lime-700 focus:outline-none"
                />
                {formErrors.scheduleWhen && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {formErrors.scheduleWhen}
                  </p>
                )}
              </div>

              {/* Confidence 0-10 Slider */}
              <div className="pt-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="cdsmp-confidence"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Confidence you will complete this (0–10)
                  </label>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {confidenceScore}/10
                  </span>
                </div>
                <input
                  id="cdsmp-confidence"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(Number(e.target.value))}
                  className="mt-2.5 h-2.5 w-full cursor-pointer accent-lime-700"
                />
                {formErrors.confidenceScore && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {formErrors.confidenceScore}
                  </p>
                )}

                {/* Stanford < 7 Threshold Feedback Box */}
                <div
                  role={confidenceEval.needsRefinement ? 'alert' : 'status'}
                  className={`mt-3 rounded-md border p-3.5 text-xs ${
                    confidenceEval.needsRefinement
                      ? 'border-amber-300 bg-amber-50 text-amber-950'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {confidenceEval.needsRefinement ? (
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-800" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-800" />
                    )}
                    <span>{confidenceEval.tierLabel}</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{confidenceEval.guidance}</p>
                  {confidenceEval.needsRefinement && (
                    <button
                      type="button"
                      onClick={handleScaleDown}
                      className="mt-2.5 inline-flex min-h-9 items-center gap-1.5 rounded border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 cursor-pointer"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Scale Down Frequency to Boost Confidence</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-lime-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lime-900 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-800"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Action Plan</span>
              </button>

              {statusMessage && (
                <p role="status" className="text-xs font-medium text-lime-900">
                  {statusMessage}
                </p>
              )}
            </div>
          </form>

          {/* Right: Active Weekly Plans & Structured Feedback Loops */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Active Weekly Plans ({visiblePlans.length})
              </h3>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Filter action plans by condition"
                  value={filterCondition}
                  onChange={(e) =>
                    setFilterCondition(
                      e.target.value as 'all' | ChronicCondition
                    )
                  }
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="all">All Conditions</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="hypertension">Hypertension</option>
                  <option value="arthritis">Arthritis</option>
                </select>
                <button
                  type="button"
                  onClick={onResetPlans}
                  className="inline-flex min-h-10 items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {visiblePlans.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No weekly action plans in this view.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use the builder on the left to commit to a specific,
                  confidence-scored micro-goal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePlans.map((plan) => {
                  const completion = computeWeeklyCompletionRate(
                    plan.completedDays,
                    plan.frequencyDays
                  );
                  const isEditing = editingFeedbackId === plan.id;

                  return (
                    <article
                      key={plan.id}
                      className="rounded-lg border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            {CDSMP_CONDITIONS[plan.condition].title} · Target{' '}
                            <span className="font-mono tabular-nums">
                              {plan.frequencyDays}d/wk
                            </span>{' '}
                            · Confidence{' '}
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {plan.confidenceScore}/10
                            </span>
                          </p>
                          <h4 className="mt-1 text-base font-bold text-slate-900">
                            {plan.actionText}
                          </h4>
                          <p className="mt-1 text-xs text-slate-600">
                            Amount: {plan.quantity} · Schedule: {plan.scheduleWhen}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Delete action plan ${plan.actionText}`}
                          onClick={() => onDeletePlan(plan.id)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* M-S Check-off Row */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1.5">
                          {DAY_LABELS.map((dayChar, idx) => {
                            const done = plan.completedDays[idx];
                            return (
                              <button
                                key={`${plan.id}-day-${idx}`}
                                type="button"
                                aria-label={`Toggle day ${idx + 1} completion for ${plan.actionText}`}
                                aria-pressed={done}
                                onClick={() => onToggleDay(plan.id, idx)}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                                  done
                                    ? 'border-lime-800 bg-lime-800 text-white'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {done ? (
                                  <Check className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  dayChar
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                            {completion.completedCount}/{completion.targetDays}
                          </span>
                          <span className="ml-1.5 text-xs text-slate-500 tabular-nums">
                            ({completion.percent}%)
                          </span>
                        </div>
                      </div>

                      {/* Structured Weekly Feedback Loop */}
                      <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
                        {isEditing ? (
                          <div className="space-y-2.5">
                            <div>
                              <label
                                htmlFor={`barrier-${plan.id}`}
                                className="block font-semibold text-slate-700"
                              >
                                Barrier or Friction Encountered
                              </label>
                              <input
                                id={`barrier-${plan.id}`}
                                type="text"
                                value={barrierDraft}
                                onChange={(e) => setBarrierDraft(e.target.value)}
                                placeholder="e.g., Afternoon fatigue delayed walk"
                                className="mt-1 min-h-10 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`adjustment-${plan.id}`}
                                className="block font-semibold text-slate-700"
                              >
                                Problem-Solving Tweak for Next Week
                              </label>
                              <input
                                id={`adjustment-${plan.id}`}
                                type="text"
                                value={adjustmentDraft}
                                onChange={(e) =>
                                  setAdjustmentDraft(e.target.value)
                                }
                                placeholder="e.g., Split into two 8-minute blocks"
                                className="mt-1 min-h-10 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveFeedbackEdit(plan.id)}
                                className="min-h-9 rounded bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-800 cursor-pointer"
                              >
                                Save Reflection
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFeedbackId(null)}
                                className="min-h-9 rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5 text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-800">
                                  Barrier:{' '}
                                </span>
                                {plan.barrierNote || 'None recorded yet'}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">
                                  Feedback Loop:{' '}
                                </span>
                                {plan.feedbackAdjustment ||
                                  'Add a problem-solving tweak after week review'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => startFeedbackEdit(plan)}
                              className="min-h-9 shrink-0 self-start rounded border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer sm:self-center"
                            >
                              Update Reflection
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
        </div>
      </div>
    </section>
  );
}
