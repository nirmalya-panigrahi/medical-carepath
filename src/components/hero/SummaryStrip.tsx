import type {ActionPlan, RehabCheckIn, SymptomMedLog} from '../../types/carepath';
import {getActivePlansProgress, summarizeSymptomMedLogs} from '../../utils/cdsmpRules';

interface SummaryStripProps {
  rehabLogs: RehabCheckIn[];
  actionPlans: ActionPlan[];
  symptomLogs: SymptomMedLog[];
}

export function SummaryStrip({
  rehabLogs,
  actionPlans,
  symptomLogs,
}: SummaryStripProps) {
  const latestRehab = rehabLogs[0];
  const plansSummary = getActivePlansProgress(actionPlans);
  const symptomSummary = summarizeSymptomMedLogs(symptomLogs);

  const latestVerdictText = latestRehab
    ? latestRehab.evaluation.status === 'progress'
      ? 'Progress +10%'
      : latestRehab.evaluation.status === 'maintain'
      ? 'Hold Baseline'
      : 'Regress -25%'
    : 'No check-ins yet';

  return (
    <section
      aria-label="Current self-management summary"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        <div className="px-4 py-5 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Rehab Pacing Sessions
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {rehabLogs.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {latestRehab
              ? `Latest: ${latestRehab.track.toUpperCase()} · Borg ${latestRehab.borgRpe}`
              : 'Log your first mobility session below'}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Latest Progression Rule
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {latestVerdictText}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {latestRehab
              ? `24h pain delta ${latestRehab.evaluation.painDelta24h >= 0 ? '+' : ''}${latestRehab.evaluation.painDelta24h}`
              : 'Evaluated by 24h pain & Borg rules'}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Active CDSMP Action Plans
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {plansSummary.totalPlans}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {plansSummary.avgConfidence !== null
              ? `Avg confidence ${plansSummary.avgConfidence}/10 · ${plansSummary.weeklyHits} day hits`
              : 'Stanford 7/10 confidence rule active'}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Medication Adherence Logged
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {symptomSummary.totalLogs > 0
              ? `${symptomSummary.adherencePercent}%`
              : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {symptomSummary.avgSymptomTaken !== null
              ? `Avg symptom ${symptomSummary.avgSymptomTaken}/10 on taken days`
              : 'Pair symptoms with dose timing'}
          </p>
        </div>
      </div>
    </section>
  );
}
