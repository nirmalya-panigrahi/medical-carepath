import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {daysAgoIso} from '../../data/pathwaysData';
import type {RehabCheckIn, SymptomMedLog} from '../../types/carepath';
import {evaluateSafeProgression} from '../../utils/rehabRules';
import {ProgressWaffle} from './ProgressWaffle';

describe('ProgressWaffle (Independent Recovery vs. Daily Habits)', () => {
  it('Blue Pill: renders 28 recovery tiles independently and updates readout on click', async () => {
    const user = userEvent.setup();
    const todayInput = {
      track: 'pulmonary' as const,
      mobilityScore: 4,
      painBefore: 1,
      painDuring: 2,
      painAfter24h: 1,
      borgRpe: 12,
      durationMinutes: 20,
      completedChecks: [],
      notes: '',
    };
    const logs: RehabCheckIn[] = [
      {
        ...todayInput,
        id: 'waffle-1',
        date: daysAgoIso(0),
        evaluation: evaluateSafeProgression(todayInput),
      },
    ];

    render(<ProgressWaffle mode="recovery" rehabLogs={logs} />);

    const grid = screen.getByRole('grid', {
      name: /28-day recovery waffle grid/i,
    });
    const tiles = grid.querySelectorAll('button');
    expect(tiles).toHaveLength(28);

    await user.click(tiles[27]);
    expect(
      screen.getByText(/Today · Breathing \(20 min\) · Looking good/i)
    ).toBeInTheDocument();
  });

  it('Blue Pill: renders independent Daily Habits waffle without mixing recovery entries', async () => {
    const user = userEvent.setup();
    const symLogs: SymptomMedLog[] = [
      {
        id: 'sym-waffle-1',
        date: daysAgoIso(0),
        condition: 'hypertension',
        symptomSeverity: 2,
        fatigueLevel: 2,
        vitalReading: '120/80',
        medicationName: 'Blood pressure pill',
        doseTaken: true,
        timing: 'before-symptoms',
        note: '',
      },
    ];

    render(
      <ProgressWaffle mode="habits" actionPlans={[]} symptomLogs={symLogs} />
    );

    const grid = screen.getByRole('grid', {
      name: /28-day daily habits waffle grid/i,
    });
    const tiles = grid.querySelectorAll('button');
    await user.click(tiles[27]);
    expect(
      screen.getByText(/Today · Blood Pressure · Medication taken/i)
    ).toBeInTheDocument();
  });

  it('Red Pill: handles zero logs gracefully in both recovery and habits modes', () => {
    const {rerender} = render(
      <ProgressWaffle mode="recovery" rehabLogs={[]} />
    );
    expect(
      screen.getByText(/Log your first recovery session below/i)
    ).toBeInTheDocument();

    rerender(
      <ProgressWaffle mode="habits" actionPlans={[]} symptomLogs={[]} />
    );
    expect(
      screen.getByText(/Log your habits or weekly goal below/i)
    ).toBeInTheDocument();
  });
});
