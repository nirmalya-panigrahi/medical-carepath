import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import App from './App';

describe('CarePath Integration Flows', () => {
  it('Blue Pill: renders the split hero and logs a graded rehab session + CDSMP action plan', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Split Hero headlines & edge CHECK-IN tab
    expect(
      screen.getByRole('heading', {name: /Rehab & Graded Pacing/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: /Chronic Self-Management/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Open quick daily check-in drawer/i})
    ).toBeInTheDocument();

    // Switch Rehab pathway to Cardiac and log a session
    await user.click(screen.getByRole('tab', {name: 'Cardiac'}));
    await user.click(screen.getByRole('button', {name: /Log Rehab Session/i}));

    expect(
      screen.getByText(/Saved Cardiac session/i)
    ).toBeInTheDocument();

    // Build a CDSMP Action Plan and verify it appears
    const actionInput = screen.getByLabelText(
      /What exact action will you do\?/i
    );
    await user.clear(actionInput);
    await user.type(actionInput, 'Gentle morning hip mobility routine');
    await user.click(screen.getByRole('button', {name: /Add Action Plan/i}));

    expect(
      screen.getByRole('heading', {name: 'Gentle morning hip mobility routine'})
    ).toBeInTheDocument();
  });

  it('Blue Pill: opens Quick Check-In Drawer from hero vertical edge tab and records entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', {name: /Open quick daily check-in drawer/i})
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Quick Daily Check-In')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', {name: /Save Check-In/i}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Red Pill: surfaces validation errors on invalid pain/action input and triggers < 7 confidence scale-down', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Enter invalid pain (> 10) in rehab logger
    const painDuringInput = screen.getByLabelText(/During-Session Pain/i);
    await user.clear(painDuringInput);
    await user.type(painDuringInput, '15');
    await user.click(screen.getByRole('button', {name: /Log Rehab Session/i}));

    expect(
      screen.getByText(/During-session pain must be between 0 and 10/i)
    ).toBeInTheDocument();

    // Trigger Stanford CDSMP < 7 confidence alert & scale down
    const freqInput = screen.getByLabelText(/How many days\/week\?/i);
    await user.clear(freqInput);
    await user.type(freqInput, '6');

    // Clear action text to test validation
    const actionInput = screen.getByLabelText(
      /What exact action will you do\?/i
    );
    await user.clear(actionInput);
    await user.click(screen.getByRole('button', {name: /Add Action Plan/i}));

    expect(
      screen.getByText(/Describe a specific, concrete action/i)
    ).toBeInTheDocument();
  });

  it('Red Pill: allows filtering symptom logs by missed doses without crashing on empty states', async () => {
    const user = userEvent.setup();
    render(<App />);

    const adherenceFilter = screen.getByLabelText(
      /Filter symptom logs by medication adherence/i
    );
    await user.selectOptions(adherenceFilter, 'missed');
    expect(screen.getByText(/Recorded Entries \(1\)/i)).toBeInTheDocument();

    // Delete the single missed entry and verify clean empty state appears
    const deleteButtons = screen.getAllByRole('button', {
      name: /Delete symptom log from 2026-11-20/i,
    });
    await user.click(deleteButtons[0]);
    expect(
      screen.getByText(/No symptom-medication records match the selected filter/i)
    ).toBeInTheDocument();
  });
});
