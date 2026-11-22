import type {
  ActionPlan,
  ChronicCondition,
  RehabCheckIn,
  RehabTrack,
  SymptomMedLog,
} from '../types/carepath';
import {evaluateSafeProgression} from '../utils/rehabRules';

export interface RehabProtocolInfo {
  id: RehabTrack;
  title: string;
  shortTitle: string;
  targetRpeRange: string;
  painCeiling: string;
  pacingSummary: string;
  dailyChecks: string[];
}

export const REHAB_PROTOCOLS: Record<RehabTrack, RehabProtocolInfo> = {
  pulmonary: {
    id: 'pulmonary',
    title: 'Pulmonary Rehab Pathway',
    shortTitle: 'Pulmonary',
    targetRpeRange: 'Borg 11–13 (Light to Somewhat Hard)',
    painCeiling: 'Dyspnea recovery within 5 mins · Pain <= 3/10',
    pacingSummary:
      'Interval pacing with pursed-lip exhalation, upright posture resets, and energy conservation between sets.',
    dailyChecks: [
      'Diaphragmatic & pursed-lip breathing warm-up (3 min)',
      'Seated-to-standing endurance check without breath-holding',
      'SpO2 / recovery breathing check at 3 min post-session',
    ],
  },
  cardiac: {
    id: 'cardiac',
    title: 'Cardiac Rehab Pathway',
    shortTitle: 'Cardiac',
    targetRpeRange: 'Borg 11–14 (Talk-Test Sustainable)',
    painCeiling: 'Zero chest/jaw discomfort · Pain <= 3/10',
    pacingSummary:
      'Gradual 5-minute warm-up and cool-down windows to avoid abrupt heart-rate spikes during aerobic blocks.',
    dailyChecks: [
      '5-minute low-intensity warm-up before target effort',
      'Conversational talk-test verified during peak block',
      '5-minute seated/walking cool-down without dizziness',
    ],
  },
  msk: {
    id: 'msk',
    title: 'Musculoskeletal Rehab Pathway',
    shortTitle: 'Musculoskeletal',
    targetRpeRange: 'Borg 11–14 (Controlled Load)',
    painCeiling: 'Pain <= 3/10 during & <= 24h baseline return',
    pacingSummary:
      'Graded tendon and joint exposure governed by the 24-hour irritability window rather than same-day push.',
    dailyChecks: [
      'Morning joint stiffness & active range-of-motion scan',
      'Controlled eccentric/isometric tempo without compensations',
      '24-hour irritability check compared against yesterday',
    ],
  },
};

export interface ConditionTemplate {
  id: ChronicCondition;
  title: string;
  focusAreas: string;
  sampleAction: string;
  sampleQuantity: string;
  sampleWhen: string;
  sampleMedication: string;
  sampleVitalPlaceholder: string;
}

export const CDSMP_CONDITIONS: Record<ChronicCondition, ConditionTemplate> = {
  diabetes: {
    id: 'diabetes',
    title: 'Diabetes Self-Management',
    focusAreas: 'Post-meal movement · Foot check · Glycemic pacing',
    sampleAction: 'Walk briskly around the block after dinner',
    sampleQuantity: '12 minutes',
    sampleWhen: 'At 7:15 PM after dinner',
    sampleMedication: 'Metformin 500mg',
    sampleVitalPlaceholder: 'e.g., 118 mg/dL fasting',
  },
  hypertension: {
    id: 'hypertension',
    title: 'Hypertension Self-Management',
    focusAreas: 'Seated BP log · Sodium swap · Breath pacing',
    sampleAction: 'Perform paced breathing and log resting blood pressure',
    sampleQuantity: '10 minutes',
    sampleWhen: 'Every morning before coffee',
    sampleMedication: 'Lisinopril 10mg',
    sampleVitalPlaceholder: 'e.g., 126/80 mmHg',
  },
  arthritis: {
    id: 'arthritis',
    title: 'Arthritis Self-Management',
    focusAreas: 'Joint protection · Warm-up ROM · Fatigue pacing',
    sampleAction: 'Complete warm-water or towel-assisted hand & knee ROM',
    sampleQuantity: '8 minutes',
    sampleWhen: 'After morning shower',
    sampleMedication: 'Topical Diclofenac / Acetaminophen',
    sampleVitalPlaceholder: 'e.g., 25 min morning stiffness',
  },
};

const sampleInputs: Array<Omit<RehabCheckIn, 'id' | 'evaluation'>> = [
  {
    date: '2026-11-21',
    track: 'pulmonary',
    mobilityScore: 4,
    painBefore: 1,
    painDuring: 2,
    painAfter24h: 1,
    borgRpe: 12,
    durationMinutes: 18,
    completedChecks: [
      'Diaphragmatic & pursed-lip breathing warm-up (3 min)',
      'Seated-to-standing endurance check without breath-holding',
      'SpO2 / recovery breathing check at 3 min post-session',
    ],
    notes: 'Steady nasal-to-pursed-lip cadence; recovered breath in 2 minutes.',
  },
  {
    date: '2026-11-20',
    track: 'msk',
    mobilityScore: 3,
    painBefore: 2,
    painDuring: 4,
    painAfter24h: 3,
    borgRpe: 13,
    durationMinutes: 22,
    completedChecks: [
      'Morning joint stiffness & active range-of-motion scan',
      'Controlled eccentric/isometric tempo without compensations',
    ],
    notes: 'Mild knee ache during step-downs; settled by next morning.',
  },
  {
    date: '2026-11-19',
    track: 'cardiac',
    mobilityScore: 4,
    painBefore: 0,
    painDuring: 1,
    painAfter24h: 0,
    borgRpe: 13,
    durationMinutes: 25,
    completedChecks: [
      '5-minute low-intensity warm-up before target effort',
      'Conversational talk-test verified during peak block',
      '5-minute seated/walking cool-down without dizziness',
    ],
    notes: 'Stationary cycling kept smoothly inside talk-test window.',
  },
];

export const INITIAL_REHAB_LOGS: RehabCheckIn[] = sampleInputs.map(
  (item, idx) => ({
    ...item,
    id: `rehab-seed-${idx + 1}`,
    evaluation: evaluateSafeProgression(item),
  })
);

export const INITIAL_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'plan-seed-1',
    weekLabel: 'Current Week',
    condition: 'hypertension',
    actionText: 'Log seated resting blood pressure after 5 minutes of quiet rest',
    quantity: '2 readings, 1 min apart',
    scheduleWhen: 'At 8:00 AM before breakfast',
    frequencyDays: 5,
    confidenceScore: 8,
    completedDays: [true, true, true, false, true, false, false],
    barrierNote: 'Rushed out early on Thursday morning.',
    feedbackAdjustment: 'Keep cuff beside kettle as a visual cue.',
    createdAt: '2026-11-18',
  },
  {
    id: 'plan-seed-2',
    weekLabel: 'Current Week',
    condition: 'diabetes',
    actionText: 'Take an easy flat walk at conversational pace',
    quantity: '15 minutes',
    scheduleWhen: 'Within 30 minutes after evening meal',
    frequencyDays: 4,
    confidenceScore: 7,
    completedDays: [true, false, true, true, false, false, false],
    barrierNote: 'Rainy Tuesday evening reduced motivation.',
    feedbackAdjustment: 'Use indoor hallway laps when weather is wet.',
    createdAt: '2026-11-18',
  },
];

export const INITIAL_SYMPTOM_LOGS: SymptomMedLog[] = [
  {
    id: 'sym-seed-1',
    date: '2026-11-21',
    condition: 'hypertension',
    symptomSeverity: 2,
    fatigueLevel: 3,
    vitalReading: '124/78 mmHg',
    medicationName: 'Lisinopril 10mg',
    doseTaken: true,
    timing: 'before-symptoms',
    note: 'Light afternoon energy dip only; resting BP steady.',
  },
  {
    id: 'sym-seed-2',
    date: '2026-11-20',
    condition: 'arthritis',
    symptomSeverity: 5,
    fatigueLevel: 5,
    vitalReading: '40 min stiffness',
    medicationName: 'Topical Diclofenac',
    doseTaken: false,
    timing: 'missed',
    note: 'Forgot morning application before errands; knees felt stiffer by noon.',
  },
  {
    id: 'sym-seed-3',
    date: '2026-11-19',
    condition: 'diabetes',
    symptomSeverity: 2,
    fatigueLevel: 2,
    vitalReading: '114 mg/dL',
    medicationName: 'Metformin 500mg',
    doseTaken: true,
    timing: 'with-meal',
    note: 'No GI upset when paired with evening meal and 15-min walk.',
  },
  {
    id: 'sym-seed-4',
    date: '2026-11-18',
    condition: 'arthritis',
    symptomSeverity: 3,
    fatigueLevel: 3,
    vitalReading: '20 min stiffness',
    medicationName: 'Topical Diclofenac',
    doseTaken: true,
    timing: 'before-symptoms',
    note: 'Gentle joint warm-up + timely dose kept afternoon mobility smooth.',
  },
];
