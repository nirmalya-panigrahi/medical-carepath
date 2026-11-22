import type {
  ActionPlan,
  ActionPlanDraft,
  SymptomMedLog,
  SymptomMedLogInput,
  ValidationResult,
} from '../types/carepath';

export interface ConfidenceEvaluation {
  score: number;
  needsRefinement: boolean;
  tierLabel: string;
  guidance: string;
}

export function validateActionPlan(draft: ActionPlanDraft): ValidationResult {
  const errors: Record<string, string> = {};

  if (!draft.actionText.trim() || draft.actionText.trim().length < 4) {
    errors.actionText = 'Describe a specific, concrete action (at least 4 characters).';
  }
  if (!draft.quantity.trim()) {
    errors.quantity = 'Specify how much (e.g., 15 minutes, 2 glasses, 10 reps).';
  }
  if (!draft.scheduleWhen.trim()) {
    errors.scheduleWhen = 'Specify when you will do this (e.g., after breakfast).';
  }
  if (
    !Number.isFinite(draft.frequencyDays) ||
    draft.frequencyDays < 1 ||
    draft.frequencyDays > 7
  ) {
    errors.frequencyDays = 'Frequency must be between 1 and 7 days per week.';
  }
  if (
    !Number.isFinite(draft.confidenceScore) ||
    draft.confidenceScore < 0 ||
    draft.confidenceScore > 10
  ) {
    errors.confidenceScore = 'Confidence score must be between 0 and 10.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function evaluateConfidence(score: number): ConfidenceEvaluation {
  const clamped = Math.min(10, Math.max(0, Math.round(score)));

  if (clamped < 7) {
    return {
      score: clamped,
      needsRefinement: true,
      tierLabel: `Confidence ${clamped}/10 — Scale Down Recommended`,
      guidance:
        'Stanford CDSMP research shows plans rated below 7/10 are hard to sustain. Trim frequency or duration until you feel at least 7/10 confident.',
    };
  }

  if (clamped <= 8) {
    return {
      score: clamped,
      needsRefinement: false,
      tierLabel: `Confidence ${clamped}/10 — Realistic Target`,
      guidance:
        'Strong commitment range. Keep a brief backup cue ready for busy days.',
    };
  }

  return {
    score: clamped,
    needsRefinement: false,
    tierLabel: `Confidence ${clamped}/10 — High Self-Efficacy`,
    guidance:
      'Well-calibrated micro-goal. Track each completed day to reinforce weekly momentum.',
  };
}

export function scaleDownDraftForConfidence(draft: ActionPlanDraft): ActionPlanDraft {
  const nextFrequency = draft.frequencyDays > 3 ? Math.max(2, draft.frequencyDays - 2) : Math.max(1, draft.frequencyDays - 1);
  const nextConfidence = Math.min(8, Math.max(7, draft.confidenceScore + 2));

  return {
    ...draft,
    frequencyDays: nextFrequency,
    confidenceScore: nextConfidence,
  };
}

export function computeWeeklyCompletionRate(
  completedDays: boolean[],
  targetDays: number
): { completedCount: number; targetDays: number; percent: number } {
  const completedCount = completedDays.filter(Boolean).length;
  const safeTarget = Math.max(1, Math.min(7, targetDays));
  const percent = Math.min(100, Math.round((completedCount / safeTarget) * 100));

  return {
    completedCount,
    targetDays: safeTarget,
    percent,
  };
}

export function validateSymptomMedLog(
  input: SymptomMedLogInput
): ValidationResult {
  const errors: Record<string, string> = {};

  if (
    !Number.isFinite(input.symptomSeverity) ||
    input.symptomSeverity < 0 ||
    input.symptomSeverity > 10
  ) {
    errors.symptomSeverity = 'Symptom severity must be between 0 and 10.';
  }
  if (
    !Number.isFinite(input.fatigueLevel) ||
    input.fatigueLevel < 0 ||
    input.fatigueLevel > 10
  ) {
    errors.fatigueLevel = 'Fatigue level must be between 0 and 10.';
  }
  if (!input.medicationName.trim()) {
    errors.medicationName = 'Enter a medication or routine name (or "None scheduled").';
  }
  if (input.vitalReading.trim().length > 40) {
    errors.vitalReading = 'Vital reading must be 40 characters or fewer.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface SymptomMedSummary {
  totalLogs: number;
  adherencePercent: number;
  avgSymptomTaken: number | null;
  avgSymptomMissed: number | null;
  avgFatigue: number | null;
}

export function summarizeSymptomMedLogs(
  logs: SymptomMedLog[]
): SymptomMedSummary {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      adherencePercent: 0,
      avgSymptomTaken: null,
      avgSymptomMissed: null,
      avgFatigue: null,
    };
  }

  const takenLogs = logs.filter((l) => l.doseTaken);
  const missedLogs = logs.filter((l) => !l.doseTaken);

  const avg = (items: SymptomMedLog[], key: 'symptomSeverity' | 'fatigueLevel') =>
    items.length === 0
      ? null
      : Number(
          (items.reduce((sum, item) => sum + item[key], 0) / items.length).toFixed(1)
        );

  return {
    totalLogs: logs.length,
    adherencePercent: Math.round((takenLogs.length / logs.length) * 100),
    avgSymptomTaken: avg(takenLogs, 'symptomSeverity'),
    avgSymptomMissed: avg(missedLogs, 'symptomSeverity'),
    avgFatigue: avg(logs, 'fatigueLevel'),
  };
}

export function getActivePlansProgress(plans: ActionPlan[]): {
  totalPlans: number;
  avgConfidence: number | null;
  weeklyHits: number;
} {
  if (plans.length === 0) {
    return {totalPlans: 0, avgConfidence: null, weeklyHits: 0};
  }
  const avgConfidence = Number(
    (
      plans.reduce((sum, p) => sum + p.confidenceScore, 0) / plans.length
    ).toFixed(1)
  );
  const weeklyHits = plans.reduce(
    (sum, p) => sum + p.completedDays.filter(Boolean).length,
    0
  );
  return {
    totalPlans: plans.length,
    avgConfidence,
    weeklyHits,
  };
}
