import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import App from './App';
import {daysAgoIso} from './data/pathwaysData';

describe('CarePath Independent Spaces Integration Flows', () => {
  it('Blue Pill: hero opens Gentle Recovery and Daily Habits independently without intermingling', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Split hero shows both independent CTAs and botanical line-art image
    expect(
      screen.getByRole('button', {name: /Open Recovery/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Open Daily Habits/i})
    ).toBeInTheDocument();

    const heroSection = screen.getByLabelText(
      /Recovery and daily habits overview/i
    );
    expect(
      heroSection.querySelector('img[src*="image_ec517fdf.png"]')
    ).not.toBeNull();

    // Default Gentle Recovery space shows ONLY recovery waffle & check-in
    expect(
      screen.getByRole('grid', {name: /28-day recovery waffle grid/i})
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('grid', {name: /28-day daily habits waffle grid/i})
    ).not.toBeInTheDocument();

    // Log a recovery session
    const rehabSection = screen.getByRole('region', {
      name: /Daily Recovery Check-In/i,
    });
    await user.click(
      within(rehabSection).getByRole('button', {name: /Heart Recovery/i})
    );
    await user.click(
      within(rehabSection).getByRole('button', {name: /^Steady/i})
    );
    await user.click(
      within(rehabSection).getByRole('button', {name: /^Calm/i})
    );
    await user.click(
      within(rehabSection).getByRole('button', {name: /Save Check-In/i})
    );
    expect(screen.getByText(/Saved heart check-in\./i)).toBeInTheDocument();

    // Click right hero CTA ("Open Daily Habits") -> switches to independent Daily Habits space
    await user.click(screen.getByRole('button', {name: /Open Daily Habits/i}));

    expect(
      screen.getByRole('grid', {name: /28-day daily habits waffle grid/i})
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('grid', {name: /28-day recovery waffle grid/i})
    ).not.toBeInTheDocument();

    // Create a Weekly Goal inside Daily Habits
    const goalInput = screen.getByLabelText(/2\. What will you do\?/i);
    await user.clear(goalInput);
    await user.type(goalInput, 'Stretch gently for 10 minutes');
    await user.click(screen.getByRole('button', {name: /Save Weekly Goal/i}));
    expect(
      screen.getByRole('heading', {name: 'Stretch gently for 10 minutes'})
    ).toBeInTheDocument();

    // Switch back to Gentle Recovery and confirm recovery session remained intact independently
    await user.click(screen.getByRole('button', {name: /Open Recovery/i}));
    expect(
      screen.getByRole('grid', {name: /28-day recovery waffle grid/i})
    ).toBeInTheDocument();
  });

  it('Blue Pill: opens Quick Check-In Drawer from top-right header Check-In button and saves independently', async () => {
    const user = userEvent.setup();
    render(<App />);

    const header = screen.getByRole('banner');
    await user.click(within(header).getByRole('button', {name: /^Check-In$/i}));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Quick Check-In')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', {name: /Save Check-In/i}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Red Pill: enforces < 7 confidence tip, validates blank goal, and handles empty Daily Habits filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open Daily Habits space
    await user.click(screen.getByRole('button', {name: /Open Daily Habits/i}));

    await user.click(
      screen.getByRole('button', {name: /Confidence 4 out of 10/i})
    );
    expect(
      screen.getByText(/That feels like a stretch \(4\/10\)/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /Try fewer days/i}));
    expect(
      screen.queryByText(/That feels like a stretch/i)
    ).not.toBeInTheDocument();

    const goalInput = screen.getByLabelText(/2\. What will you do\?/i);
    await user.clear(goalInput);
    await user.click(screen.getByRole('button', {name: /Save Weekly Goal/i}));
    expect(
      screen.getByText(/Describe a specific, concrete action/i)
    ).toBeInTheDocument();

    // Switch to Symptoms & Medication tab inside Daily Habits
    await user.click(
      screen.getByRole('tab', {name: /Symptoms & Medication/i})
    );
    const filterSelect = screen.getByLabelText(
      /Filter daily logs by medication/i
    );
    await user.selectOptions(filterSelect, 'missed');
    expect(screen.getByText(/Recent Entries \(1\)/i)).toBeInTheDocument();

    const missedDate = daysAgoIso(2);
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`Delete daily log from ${missedDate}`, 'i'),
      })
    );
    expect(
      screen.getByText(/No entries match this filter\./i)
    ).toBeInTheDocument();
  });
});
