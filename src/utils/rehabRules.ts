import type {
  BorgZone,
  ProgressionEvaluation,
  RehabCheckInInput,
  RehabTrack,
  ValidationResult,
} from '../types/carepath';

export interface BorgAnchor {
  rpe: number;
  cr10: number;
  label: string;
  talkTest: string;
  zone: BorgZone;
}

export const BORG_ANCHORS: BorgAnchor[] = [
  {
    rpe: 6,
    cr10: 0,
    label: 'No exertion at all',
    talkTest: 'Complete rest; effortless breathing',
    zone: 'very-light',
  },
  {
    rpe: 7,
    cr10: 0.5,
    label: 'Extremely light',
    talkTest: 'Gentle warm-up; effortless conversation',
    zone: 'very-light',
  },
  {
    rpe: 9,
    cr10: 1.5,
    label: 'Very light',
    talkTest: 'Slow walking pace; breathing barely elevated',
    zone: 'very-light',
  },
  {
    rpe: 11,
    cr10: 2.5,
    label: 'Light',
    talkTest: 'Comfortable rhythmic movement; full sentences easy',
    zone: 'moderate-target',
  },
  {
    rpe: 12,
    cr10: 3,
    label: 'Light to somewhat hard',
    talkTest: 'Optimal rehab entry zone; steady nasal/pursed-lip breathing',
    zone: 'moderate-target',
  },
  {
    rpe: 13,
    cr10: 4,
    label: 'Somewhat hard',
    talkTest: 'Target aerobic ceiling; can speak short sentences comfortably',
    zone: 'moderate-target',
  },
  {
    rpe: 14,
    cr10: 4.5,
    label: 'Moderately hard',
    talkTest: 'Upper cardiac/MSK conditioning edge; breathing noticeably deeper',
    zone: 'moderate-target',
  },
  {
    rpe: 15,
    cr10: 5,
    label: 'Hard (heavy)',
    talkTest: 'Speaking limited to brief phrases; hold progression here',
    zone: 'vigorous',
  },
  {
    rpe: 17,
    cr10: 7,
    label: 'Very hard',
    talkTest: 'Gasping between words; exceeds graded rehab threshold',
    zone: 'overexertion',
  },
  {
    rpe: 19,
    cr10: 9,
    label: 'Extremely hard',
    talkTest: 'Near-maximal strain; stop exercise and initiate recovery rest',
    zone: 'overexertion',
  },
  {
    rpe: 20,
    cr10: 10,
    label: 'Maximal exertion',
    talkTest: 'Absolute exhaustion; contraindicated for self-paced rehab',
    zone: 'overexertion',
  },
];

export function getBorgZone(rpe: number): {
  zone: BorgZone;
  cr10: number;
  label: string;
  talkTest: string;
} {
  const clamped = Math.min(20, Math.max(6, Math.round(rpe)));
  const exact = BORG_ANCHORS.find((a) => a.rpe === clamped);
  if (exact) {
    return {
      zone: exact.zone,
      cr10: exact.cr10,
      label: exact.label,
      talkTest: exact.talkTest,
    };
  }

  // Interpolate intermediate integers (8, 10, 16, 18)
  if (clamped <= 10) {
    return {
      zone: 'very-light',
      cr10: Number(((clamped - 6) * 0.4).toFixed(1)),
      label: clamped === 8 ? 'Very light warm-up' : 'Light baseline',
      talkTest: 'Easy conversation without breathlessness',
    };
  }
  if (clamped <= 14) {
    return {
      zone: 'moderate-target',
      cr10: Number(((clamped - 6) * 0.55).toFixed(1)),
      label: 'Target rehab zone',
      talkTest: 'Steady breathing; full phrases possible',
    };
  }
  if (clamped <= 16) {
    return {
      zone: 'vigorous',
      cr10: 6,
      label: 'Hard effort',
      talkTest: 'Short phrases only; consider pacing pause',
    };
  }
  return {
    zone: 'overexertion',
    cr10: clamped === 18 ? 8 : 9.5,
    label: 'Overexertion warning',
    talkTest: 'Unable to speak comfortably; reduce intensity immediately',
  };
}

export function isRpeInTargetForTrack(track: RehabTrack, rpe: number): boolean {
  if (track === 'pulmonary') {
    return rpe >= 11 && rpe <= 13;
  }
  if (track === 'cardiac') {
    return rpe >= 11 && rpe <= 14;
  }
  return rpe >= 11 && rpe <= 14;
}

export function validateRehabInput(input: RehabCheckInInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!Number.isFinite(input.borgRpe) || input.borgRpe < 6 || input.borgRpe > 20) {
    errors.borgRpe = 'Borg RPE must be between 6 and 20.';
  }
  if (
    !Number.isFinite(input.mobilityScore) ||
    input.mobilityScore < 1 ||
    input.mobilityScore > 5
  ) {
    errors.mobilityScore = 'Mobility readiness must be between 1 and 5.';
  }

  const painFields: Array<[keyof RehabCheckInInput, string]> = [
    ['painBefore', 'Pre-session pain'],
    ['painDuring', 'During-session pain'],
    ['painAfter24h', '24-hour post pain'],
  ];

  for (const [field, label] of painFields) {
    const val = Number(input[field]);
    if (!Number.isFinite(val) || val < 0 || val > 10) {
      errors[field] = `${label} must be between 0 and 10.`;
    }
  }

  if (
    !Number.isFinite(input.durationMinutes) ||
    input.durationMinutes < 1 ||
    input.durationMinutes > 240
  ) {
    errors.durationMinutes = 'Session duration must be between 1 and 240 minutes.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function evaluateSafeProgression(
  input: RehabCheckInInput
): ProgressionEvaluation {
  const painDelta24h = Number((input.painAfter24h - input.painBefore).toFixed(1));
  const maxRpeForTrack = input.track === 'pulmonary' ? 13 : 14;

  // Red zone: excessive pain, significant 24h flare, or high exertion spike
  if (
    input.painDuring >= 6 ||
    input.painAfter24h >= 6 ||
    painDelta24h >= 3 ||
    input.borgRpe >= 17
  ) {
    return {
      status: 'regress',
      headline: 'Rest & Regress (-25% Workload)',
      guidance:
        input.track === 'pulmonary'
          ? 'Exertion or symptom flare exceeded safe respiratory pacing. Switch to pursed-lip breathing recovery and gentle seated mobility.'
          : 'Pain or 24-hour irritability crossed the 6/10 flare threshold. Pause progressive loading until baseline settles.',
      adjustmentRule:
        'Reduce next session duration or resistance by 25% and re-test 24h pain before progressing.',
      painDelta24h,
    };
  }

  // Amber zone: moderate symptoms (4-5), +2 post-session rise, RPE above track cap, or low mobility readiness
  if (
    input.painDuring >= 4 ||
    input.painAfter24h >= 4 ||
    painDelta24h >= 2 ||
    input.borgRpe > maxRpeForTrack ||
    input.mobilityScore <= 2
  ) {
    return {
      status: 'maintain',
      headline: 'Hold & Consolidate Baseline',
      guidance:
        'Symptoms remained manageable (Amber zone), indicating your tissue and cardiovascular capacity are adapting at the current dose.',
      adjustmentRule:
        'Repeat this exact duration and Borg RPE target for 2–3 sessions until 24h pain delta is <= 1.',
      painDelta24h,
    };
  }

  // Green zone: controlled pain (0-3), minimal 24h flare, within track Borg cap, good mobility
  return {
    status: 'progress',
    headline: 'Safe to Progress (+10% Volume)',
    guidance:
      'Pain stayed in the 0–3 green envelope, 24-hour recovery returned to baseline, and perceived exertion matched your pathway target.',
    adjustmentRule:
      'Increase total active time by ~10% (e.g., +2 to 3 minutes) or add one gentle set next session.',
    painDelta24h,
  };
}
