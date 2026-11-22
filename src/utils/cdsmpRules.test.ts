import {describe, expect, it} from 'vitest';
import type {ActionPlanDraft, SymptomMedLog} from '../types/carepath';
import {
  computeWeeklyCompletionRate,
  evaluateConfidence,
  scaleDownDraftForConfidence,
  summarizeSymptomMedLogs,
  validateActionPlan,
  validateSymptomMedLog,
} from './cdsmpRules';

const validDraft: ActionPlanDraft = {
  condition: 'diabetes',
  actionText: 'Walk briskly after dinner',
  quantity: '15 minutes',
  scheduleWhen: '7:15 PM',
  frequencyDays: 5,
  confidenceScore: 8,
};

describe('cdsmpRules — Blue Pill (Happy Path)', () => {
  it('accepts valid Stanford CDSMP action plan and marks confidence >= 7 as realistic', () => {
    const validation = validateActionPlan(validDraft);
    const conf = evaluateConfidence(validDraft.confidenceScore);
    expect(validation.valid).toBe(true);
    expect(conf.needsRefinement).toBe(false);
  });

  it('computes weekly completion percentage capped cleanly at 100%', () => {
    const stats = computeWeeklyCompletionRate(
      [true, true, true, true, false, false, false],
      4
    );
    expect(stats.completedCount).toBe(4);
    expect(stats.percent).toBe(100);
  });

  it('summarizes adherence and symptom averages for taken vs missed doses', () => {
    const logs: SymptomMedLog[] = [
      {
        id: '1',
        date: '2026-11-20',
        condition: 'hypertension',
        symptomSeverity: 2,
        fatigueLevel: 2,
        vitalReading: '122/78',
        medicationName: 'Lisinopril',
        doseTaken: true,
        timing: 'before-symptoms',
        note: '',
      },
      {
        id: '2',
        date: '2026-11-21',
        condition: 'hypertension',
        symptomSeverity: 6,
        fatigueLevel: 6,
        vitalReading: '140/90',
        medicationName: 'Lisinopril',
        doseTaken: false,
        timing: 'missed',
        note: '',
      },
    ];
    const summary = summarizeSymptomMedLogs(logs);
    expect(summary.adherencePercent).toBe(50);
    expect(summary.avgSymptomTaken).toBe(2);
    expect(summary.avgSymptomMissed).toBe(6);
  });
});

describe('cdsmpRules — Red Pill (Adversarial & Edge Cases)', () => {
  it('flags confidence < 7 for Stanford refinement and scales frequency down cleanly', () => {
    const conf = evaluateConfidence(5);
    expect(conf.needsRefinement).toBe(true);

    const scaled = scaleDownDraftForConfidence({
      ...validDraft,
      frequencyDays: 6,
      confidenceScore: 5,
    });
    expect(scaled.frequencyDays).toBe(4);
    expect(scaled.confidenceScore).toBeGreaterThanOrEqual(7);
  });

  it('rejects blank action text, invalid frequency (0 or 8), and out-of-bounds confidence', () => {
    const invalid = validateActionPlan({
      ...validDraft,
      actionText: '  ',
      quantity: '',
      scheduleWhen: '',
      frequencyDays: 8,
      confidenceScore: 14,
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.actionText).toBeDefined();
    expect(invalid.errors.quantity).toBeDefined();
    expect(invalid.errors.scheduleWhen).toBeDefined();
    expect(invalid.errors.frequencyDays).toBeDefined();
    expect(invalid.errors.confidenceScore).toBeDefined();
  });

  it('rejects invalid symptom severity and missing medication name', () => {
    const res = validateSymptomMedLog({
      condition: 'arthritis',
      symptomSeverity: 11,
      fatigueLevel: -2,
      vitalReading: 'x'.repeat(45),
      medicationName: '   ',
      doseTaken: true,
      timing: 'before-symptoms',
      note: '',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.symptomSeverity).toBeDefined();
    expect(res.errors.fatigueLevel).toBeDefined();
    expect(res.errors.vitalReading).toBeDefined();
    expect(res.errors.medicationName).toBeDefined();
  });

  it('handles empty symptom log array safely without NaN', () => {
    const summary = summarizeSymptomMedLogs([]);
    expect(summary.totalLogs).toBe(0);
    expect(summary.adherencePercent).toBe(0);
    expect(summary.avgSymptomTaken).toBeNull();
    expect(summary.avgSymptomMissed).toBeNull();
  });
});
