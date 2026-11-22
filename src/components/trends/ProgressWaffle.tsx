import {useMemo, useState} from 'react';
import {CDSMP_CONDITIONS, REHAB_PROTOCOLS} from '../../data/pathwaysData';
import type {
  ActionPlan,
  RehabCheckIn,
  SymptomMedLog,
} from '../../types/carepath';
import {summarizeSymptomMedLogs} from '../../utils/cdsmpRules';

type ProgressWaffleProps =
  | {
      mode: 'recovery';
      rehabLogs: RehabCheckIn[];
    }
  | {
      mode: 'habits';
      actionPlans: ActionPlan[];
      symptomLogs: SymptomMedLog[];
    };

type DayTone = 'good-blue' | 'good-green' | 'steady' | 'rest' | 'empty';

interface WaffleDayCell {
  isoDate: string;
  shortLabel: string;
  tone: DayTone;
  summary: string;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

const CELL_STYLES: Record<DayTone, string> = {
  'good-blue': 'bg-sky-600 hover:bg-sky-700 border-sky-700',
  'good-green': 'bg-lime-700 hover:bg-lime-800 border-lime-800',
  steady: 'bg-amber-500 hover:bg-amber-600 border-amber-600',
  rest: 'bg-rose-600 hover:bg-rose-700 border-rose-700',
  empty: 'bg-slate-200 hover:bg-slate-300 border-slate-300/70',
};

export function ProgressWaffle(props: ProgressWaffleProps) {
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const days = useMemo<WaffleDayCell[]>(() => {
    const cells: WaffleDayCell[] = [];
    const today = new Date();

    if (props.mode === 'recovery') {
      const rehabByDate = new Map<string, RehabCheckIn>();
      for (const log of props.rehabLogs) {
        if (!rehabByDate.has(log.date)) {
          rehabByDate.set(log.date, log);
        }
      }

      for (let offset = 27; offset >= 0; offset--) {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        const isoDate = d.toISOString().slice(0, 10);
        const shortLabel = offset === 0 ? 'Today' : formatShortDate(d);
        const rehab = rehabByDate.get(isoDate);

        if (!rehab) {
          cells.push({
            isoDate,
            shortLabel,
            tone: 'empty',
            summary: `${shortLabel} · No recovery check-in`,
          });
          continue;
        }

        const status = rehab.evaluation.status;
        const tone: DayTone =
          status === 'regress'
            ? 'rest'
            : status === 'maintain'
            ? 'steady'
            : 'good-blue';
        const verdictWord =
          status === 'regress'
            ? 'Ease back & rest'
            : status === 'maintain'
            ? 'Stay steady'
            : 'Looking good';

        cells.push({
          isoDate,
          shortLabel,
          tone,
          summary: `${shortLabel} · ${REHAB_PROTOCOLS[rehab.track].shortTitle} (${
            rehab.durationMinutes
          } min) · ${verdictWord}`,
        });
      }

      return cells;
    }

    // Independent Daily Habits mode (uses ONLY symptomLogs & actionPlans)
    const symByDate = new Map<string, SymptomMedLog>();
    for (const log of props.symptomLogs) {
      if (!symByDate.has(log.date)) {
        symByDate.set(log.date, log);
      }
    }

    for (let offset = 27; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const isoDate = d.toISOString().slice(0, 10);
      const shortLabel = offset === 0 ? 'Today' : formatShortDate(d);
      const sym = symByDate.get(isoDate);

      if (!sym) {
        cells.push({
          isoDate,
          shortLabel,
          tone: 'empty',
          summary: `${shortLabel} · No habit log`,
        });
        continue;
      }

      const tone: DayTone =
        !sym.doseTaken || sym.symptomSeverity >= 6
          ? 'rest'
          : sym.symptomSeverity >= 4
          ? 'steady'
          : 'good-green';

      const medText = sym.doseTaken ? 'Medication taken' : 'Medication missed';
      const condTitle = CDSMP_CONDITIONS[sym.condition].title;

      cells.push({
        isoDate,
        shortLabel,
        tone,
        summary: `${shortLabel} · ${condTitle} · ${medText}`,
      });
    }

    return cells;
  }, [props]);

  const summaryBlock = useMemo(() => {
    const activeDays = days.filter((d) => d.tone !== 'empty').length;
    const restDays = days.filter((d) => d.tone === 'rest').length;

    if (props.mode === 'recovery') {
      const goodDays = days.filter((d) => d.tone === 'good-blue').length;
      const totalMinutes = props.rehabLogs.reduce(
        (sum, item) => sum + item.durationMinutes,
        0
      );

      const directionLabel =
        activeDays === 0
          ? 'Log your first recovery session below'
          : goodDays >= restDays * 2
          ? 'Recovery trending smoother'
          : restDays > goodDays
          ? 'Body asking for lighter pacing'
          : 'Steady recovery rhythm';

      return {
        kicker: 'Recovery · Last 28 Days',
        directionLabel,
        statsLine: `${activeDays} sessions logged · ${totalMinutes} total minutes moved`,
        gridLabel: '28-day recovery waffle grid',
        goodTone: 'good-blue' as DayTone,
        goodLabel: 'Good',
        steadyLabel: 'Steady',
        restLabel: 'Rest',
      };
    }

    const goodDays = days.filter((d) => d.tone === 'good-green').length;
    const symSummary = summarizeSymptomMedLogs(props.symptomLogs);
    const weeklyHits = props.actionPlans.reduce(
      (sum, plan) => sum + plan.completedDays.filter(Boolean).length,
      0
    );

    const directionLabel =
      activeDays === 0 && weeklyHits === 0
        ? 'Log your habits or weekly goal below'
        : goodDays >= restDays * 2
        ? 'Daily habits staying on track'
        : restDays > goodDays
        ? 'Missed doses or stronger symptoms noted'
        : 'Building steady daily routines';

    return {
      kicker: 'Daily Habits · Last 28 Days',
      directionLabel,
      statsLine: `${weeklyHits} goal hits this week${
        symSummary.totalLogs > 0
          ? ` · Medication taken ${symSummary.adherencePercent}% of logged days`
          : ''
      }`,
      gridLabel: '28-day daily habits waffle grid',
      goodTone: 'good-green' as DayTone,
      goodLabel: 'On track',
      steadyLabel: 'Moderate',
      restLabel: 'Missed / Flare',
    };
  }, [days, props]);

  const activeCell =
    days.find((c) => c.isoDate === selectedIso) ||
    [...days].reverse().find((c) => c.tone !== 'empty') ||
    days[days.length - 1];

  return (
    <section
      aria-label={summaryBlock.kicker}
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="max-w-md space-y-2">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {summaryBlock.kicker}
          </p>
          <h2 className="text-lg font-bold text-slate-900">
            {summaryBlock.directionLabel}
          </h2>
          <p className="text-xs text-slate-600 tabular-nums">
            {summaryBlock.statsLine}
          </p>

          <p
            aria-live="polite"
            className="pt-1 text-xs font-medium text-slate-700"
          >
            {activeCell.summary}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2.5 md:items-end">
          <div
            role="grid"
            aria-label={summaryBlock.gridLabel}
            className="grid grid-cols-7 gap-1.5"
          >
            {days.map((cell) => {
              const isSelected = activeCell.isoDate === cell.isoDate;
              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  title={cell.summary}
                  aria-label={cell.summary}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedIso(cell.isoDate)}
                  className={`h-7 w-7 rounded-md border transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                    CELL_STYLES[cell.tone]
                  } ${isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : ''}`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`h-3 w-3 rounded-md ${
                  summaryBlock.goodTone === 'good-blue'
                    ? 'bg-sky-600'
                    : 'bg-lime-700'
                }`}
                aria-hidden="true"
              />
              {summaryBlock.goodLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-amber-500" aria-hidden="true" />
              {summaryBlock.steadyLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-rose-600" aria-hidden="true" />
              {summaryBlock.restLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-slate-200" aria-hidden="true" />
              No log
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
