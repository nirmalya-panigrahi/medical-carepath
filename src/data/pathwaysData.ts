import type {
  ActionPlan,
  ChronicCondition,
  RehabCheckIn,
  RehabTrack,
  SymptomMedLog,
} from '../types/carepath';
import {evaluateSafeProgression} from '../utils/rehabRules';

export function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

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
    title: 'Breathing Recovery',
    shortTitle: 'Breathing',
    targetRpeRange: 'Steady pace — able to speak full sentences',
    painCeiling: 'Breathing settles within 5 minutes of stopping',
    pacingSummary:
      'Take slow breaths in through your nose and gently breathe out through pursed lips while moving.',
    dailyChecks: [
      'Slow breathing warm-up before starting',
      'Easy standing & walking without holding breath',
      'Breathing settled within 3 minutes after stopping',
    ],
  },
  cardiac: {
    id: 'cardiac',
    title: 'Heart Recovery',
    shortTitle: 'Heart',
    targetRpeRange: 'Comfortable pace — pass the talk test',
    painCeiling: 'Zero chest tightness, dizziness, or discomfort',
    pacingSummary:
      'Start with 5 easy minutes to warm up, keep a steady pace, and finish with 5 slow minutes to cool down.',
    dailyChecks: [
      '5 minutes of slow warm-up first',
      'Could chat comfortably while moving',
      '5 minutes of slow cool-down without dizziness',
    ],
  },
  msk: {
    id: 'msk',
    title: 'Joints & Muscles',
    shortTitle: 'Joints & Muscles',
    targetRpeRange: 'Smooth, controlled effort without straining',
    painCeiling: 'Soreness stays mild and settles by tomorrow',
    pacingSummary:
      'Let how your joints feel the next morning guide whether you stay at the same level or add a couple of minutes.',
    dailyChecks: [
      'Morning stiffness check before moving',
      'Smooth, unhurried movement without limping',
      'Joints feel settled compared to yesterday',
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
    title: 'Blood Sugar',
    focusAreas: 'After-meal walks · Foot check · Steady meals',
    sampleAction: 'Take an easy 15-minute walk after dinner',
    sampleQuantity: '15 minutes',
    sampleWhen: 'After dinner',
    sampleMedication: 'Metformin',
    sampleVitalPlaceholder: 'e.g., 118 morning reading',
  },
  hypertension: {
    id: 'hypertension',
    title: 'Blood Pressure',
    focusAreas: 'Quiet rest · BP check · Less salt',
    sampleAction: 'Sit quietly for 5 minutes and check blood pressure',
    sampleQuantity: '10 minutes',
    sampleWhen: 'Every morning before coffee',
    sampleMedication: 'Blood pressure pill',
    sampleVitalPlaceholder: 'e.g., 126/80',
  },
  arthritis: {
    id: 'arthritis',
    title: 'Joint Comfort',
    focusAreas: 'Gentle stretching · Warmth · Pacing chores',
    sampleAction: 'Do gentle hand and knee stretches after a warm shower',
    sampleQuantity: '10 minutes',
    sampleWhen: 'After morning shower',
    sampleMedication: 'Joint cream or pain reliever',
    sampleVitalPlaceholder: 'e.g., 20 min morning stiffness',
  },
};

const sampleInputs: Array<Omit<RehabCheckIn, 'id' | 'evaluation'>> = [
  {
    date: daysAgoIso(1),
    track: 'pulmonary',
    mobilityScore: 4,
    painBefore: 1,
    painDuring: 2,
    painAfter24h: 1,
    borgRpe: 12,
    durationMinutes: 20,
    completedChecks: [],
    notes: 'Steady breathing; recovered quickly.',
  },
  {
    date: daysAgoIso(3),
    track: 'msk',
    mobilityScore: 3,
    painBefore: 2,
    painDuring: 4,
    painAfter24h: 3,
    borgRpe: 13,
    durationMinutes: 20,
    completedChecks: [],
    notes: 'Mild knee ache during stairs; settled by morning.',
  },
  {
    date: daysAgoIso(5),
    track: 'cardiac',
    mobilityScore: 4,
    painBefore: 0,
    painDuring: 1,
    painAfter24h: 0,
    borgRpe: 12,
    durationMinutes: 20,
    completedChecks: [],
    notes: 'Easy flat walk at comfortable pace.',
  },
  {
    date: daysAgoIso(8),
    track: 'pulmonary',
    mobilityScore: 4,
    painBefore: 1,
    painDuring: 2,
    painAfter24h: 2,
    borgRpe: 12,
    durationMinutes: 15,
    completedChecks: [],
    notes: 'Slow breathing warm-up helped.',
  },
  {
    date: daysAgoIso(11),
    track: 'msk',
    mobilityScore: 2,
    painBefore: 3,
    painDuring: 6,
    painAfter24h: 5,
    borgRpe: 14,
    durationMinutes: 25,
    completedChecks: [],
    notes: 'Did too much yard work; took a rest day after.',
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
    weekLabel: 'This Week',
    condition: 'hypertension',
    actionText: 'Sit quietly for 5 minutes and check blood pressure',
    quantity: '10 minutes',
    scheduleWhen: 'Before breakfast',
    frequencyDays: 5,
    confidenceScore: 8,
    completedDays: [true, true, true, false, true, false, false],
    barrierNote: 'Rushed out early on Thursday.',
    feedbackAdjustment: 'Keep the cuff next to the kettle as a reminder.',
    createdAt: daysAgoIso(4),
  },
];

export const INITIAL_SYMPTOM_LOGS: SymptomMedLog[] = [
  {
    id: 'sym-seed-1',
    date: daysAgoIso(1),
    condition: 'hypertension',
    symptomSeverity: 2,
    fatigueLevel: 2,
    vitalReading: '124/78',
    medicationName: 'Blood pressure pill',
    doseTaken: true,
    timing: 'before-symptoms',
    note: 'Felt steady all afternoon.',
  },
  {
    id: 'sym-seed-2',
    date: daysAgoIso(2),
    condition: 'arthritis',
    symptomSeverity: 5,
    fatigueLevel: 5,
    vitalReading: '40 min stiffness',
    medicationName: 'Joint cream',
    doseTaken: false,
    timing: 'missed',
    note: 'Skipped morning dose before errands; knees felt stiffer by noon.',
  },
  {
    id: 'sym-seed-3',
    date: daysAgoIso(4),
    condition: 'diabetes',
    symptomSeverity: 2,
    fatigueLevel: 2,
    vitalReading: '114',
    medicationName: 'Metformin',
    doseTaken: true,
    timing: 'with-meal',
    note: 'Walk after dinner felt great.',
  },
  {
    id: 'sym-seed-4',
    date: daysAgoIso(7),
    condition: 'hypertension',
    symptomSeverity: 2,
    fatigueLevel: 3,
    vitalReading: '126/80',
    medicationName: 'Blood pressure pill',
    doseTaken: true,
    timing: 'before-symptoms',
    note: 'Calm morning routine.',
  },
];
