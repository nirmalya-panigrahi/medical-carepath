import {describe, expect, it} from 'vitest';
import type {RehabCheckInInput} from '../types/carepath';
import {
  evaluateSafeProgression,
  getBorgZone,
  isRpeInTargetForTrack,
  validateRehabInput,
} from './rehabRules';

const baseValidInput: RehabCheckInInput = {
  track: 'pulmonary',
  mobilityScore: 4,
  painBefore: 1,
  painDuring: 2,
  painAfter24h: 1,
  borgRpe: 12,
  durationMinutes: 20,
  completedChecks: [],
  notes: '',
};

describe('rehabRules — Blue Pill (Happy Path)', () => {
  it('maps Borg RPE 12 to moderate-target zone with CR-10 ≈ 3', () => {
    const info = getBorgZone(12);
    expect(info.zone).toBe('moderate-target');
    expect(info.cr10).toBe(3);
    expect(isRpeInTargetForTrack('pulmonary', 12)).toBe(true);
  });

  it('approves +10% progression when pain <= 3, 24h delta <= 1, and Borg within cap', () => {
    const verdict = evaluateSafeProgression(baseValidInput);
    expect(verdict.status).toBe('progress');
    expect(verdict.painDelta24h).toBe(0);
    expect(verdict.headline).toContain('Safe to Progress');
  });

  it('recommends Hold & Consolidate when pain reaches Amber zone (4-5)', () => {
    const verdict = evaluateSafeProgression({
      ...baseValidInput,
      track: 'msk',
      painDuring: 4,
      painAfter24h: 3,
    });
    expect(verdict.status).toBe('maintain');
    expect(verdict.headline).toContain('Hold & Consolidate');
  });
});

describe('rehabRules — Red Pill (Adversarial & Safety Thresholds)', () => {
  it('triggers Regress -25% when during-session pain hits 6/10 or higher', () => {
    const verdict = evaluateSafeProgression({
      ...baseValidInput,
      track: 'msk',
      painDuring: 6,
      painAfter24h: 3,
    });
    expect(verdict.status).toBe('regress');
    expect(verdict.headline).toContain('Regress');
  });

  it('triggers Regress -25% on 24-hour irritability spike >= +3 even if session pain felt mild', () => {
    const verdict = evaluateSafeProgression({
      ...baseValidInput,
      painBefore: 1,
      painDuring: 2,
      painAfter24h: 4,
    });
    expect(verdict.status).toBe('regress');
    expect(verdict.painDelta24h).toBe(3);
  });

  it('triggers Regress -25% when Borg RPE hits 17+ overexertion', () => {
    const verdict = evaluateSafeProgression({
      ...baseValidInput,
      borgRpe: 18,
    });
    expect(verdict.status).toBe('regress');
  });

  it('rejects out-of-range Borg RPE, negative pain, and invalid duration', () => {
    const result = validateRehabInput({
      ...baseValidInput,
      borgRpe: 25,
      painBefore: -1,
      painDuring: 12,
      durationMinutes: 0,
      mobilityScore: 9,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.borgRpe).toBeDefined();
    expect(result.errors.painBefore).toBeDefined();
    expect(result.errors.painDuring).toBeDefined();
    expect(result.errors.durationMinutes).toBeDefined();
    expect(result.errors.mobilityScore).toBeDefined();
  });

  it('clamps extreme Borg RPE inputs safely in getBorgZone', () => {
    expect(getBorgZone(2).zone).toBe('very-light');
    expect(getBorgZone(99).zone).toBe('overexertion');
  });
});
