export type RehabTrack = 'pulmonary' | 'cardiac' | 'msk';

export type ProgressionStatus = 'progress' | 'maintain' | 'regress';

export type BorgZone =
  | 'very-light'
  | 'moderate-target'
  | 'vigorous'
  | 'overexertion';

export interface RehabCheckInInput {
  track: RehabTrack;
  mobilityScore: number;
  painBefore: number;
  painDuring: number;
  painAfter24h: number;
  borgRpe: number;
  durationMinutes: number;
  completedChecks: string[];
  notes: string;
}

export interface ProgressionEvaluation {
  status: ProgressionStatus;
  headline: string;
  guidance: string;
  adjustmentRule: string;
  painDelta24h: number;
}

export interface RehabCheckIn extends RehabCheckInInput {
  id: string;
  date: string;
  evaluation: ProgressionEvaluation;
}

export type ChronicCondition = 'diabetes' | 'hypertension' | 'arthritis';

export interface ActionPlanDraft {
  condition: ChronicCondition;
  actionText: string;
  quantity: string;
  scheduleWhen: string;
  frequencyDays: number;
  confidenceScore: number;
}

export interface ActionPlan extends ActionPlanDraft {
  id: string;
  weekLabel: string;
  completedDays: boolean[];
  barrierNote: string;
  feedbackAdjustment: string;
  createdAt: string;
}

export type MedicationTiming =
  | 'before-symptoms'
  | 'with-meal'
  | 'after-symptoms'
  | 'missed';

export interface SymptomMedLogInput {
  condition: ChronicCondition;
  symptomSeverity: number;
  fatigueLevel: number;
  vitalReading: string;
  medicationName: string;
  doseTaken: boolean;
  timing: MedicationTiming;
  note: string;
}

export interface SymptomMedLog extends SymptomMedLogInput {
  id: string;
  date: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
