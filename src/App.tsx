import {useCallback, useState} from 'react';
import {ActionPlanSection} from './components/cdsmp/ActionPlanSection';
import {QuickCheckInDrawer} from './components/checkin/QuickCheckInDrawer';
import {SplitHero} from './components/hero/SplitHero';
import {SummaryStrip} from './components/hero/SummaryStrip';
import {SafetyFooter} from './components/layout/SafetyFooter';
import {TopNav} from './components/layout/TopNav';
import {SymptomMedLogSection} from './components/logs/SymptomMedLogSection';
import {RehabPathwaysSection} from './components/rehab/RehabPathwaysSection';
import {
  INITIAL_ACTION_PLANS,
  INITIAL_REHAB_LOGS,
  INITIAL_SYMPTOM_LOGS,
} from './data/pathwaysData';
import {useLocalStorageState} from './hooks/useLocalStorageState';
import type {
  ActionPlan,
  ActionPlanDraft,
  ChronicCondition,
  RehabCheckIn,
  RehabCheckInInput,
  RehabTrack,
  SymptomMedLog,
  SymptomMedLogInput,
} from './types/carepath';
import {evaluateSafeProgression} from './utils/rehabRules';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<RehabTrack>('pulmonary');
  const [selectedCondition, setSelectedCondition] =
    useState<ChronicCondition>('hypertension');
  const [quickDrawerOpen, setQuickDrawerOpen] = useState<boolean>(false);

  const rehabStorage = useLocalStorageState<RehabCheckIn[]>(
    'carepath_rehab_logs_v1',
    INITIAL_REHAB_LOGS
  );
  const plansStorage = useLocalStorageState<ActionPlan[]>(
    'carepath_action_plans_v1',
    INITIAL_ACTION_PLANS
  );
  const symptomStorage = useLocalStorageState<SymptomMedLog[]>(
    'carepath_symptom_logs_v1',
    INITIAL_SYMPTOM_LOGS
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, []);

  const handleAddRehabLog = useCallback(
    (input: RehabCheckInInput) => {
      const nextEntry: RehabCheckIn = {
        ...input,
        id: `rehab-${Date.now()}`,
        date: todayIso(),
        evaluation: evaluateSafeProgression(input),
      };
      rehabStorage.setValue((prev) => [nextEntry, ...prev]);
    },
    [rehabStorage]
  );

  const handleDeleteRehabLog = useCallback(
    (id: string) => {
      rehabStorage.setValue((prev) => prev.filter((item) => item.id !== id));
    },
    [rehabStorage]
  );

  const handleAddActionPlan = useCallback(
    (draft: ActionPlanDraft) => {
      const nextPlan: ActionPlan = {
        ...draft,
        id: `plan-${Date.now()}`,
        weekLabel: 'Current Week',
        completedDays: [false, false, false, false, false, false, false],
        barrierNote: '',
        feedbackAdjustment: '',
        createdAt: todayIso(),
      };
      plansStorage.setValue((prev) => [nextPlan, ...prev]);
    },
    [plansStorage]
  );

  const handleToggleDay = useCallback(
    (planId: string, dayIndex: number) => {
      plansStorage.setValue((prev) =>
        prev.map((plan) => {
          if (plan.id !== planId) return plan;
          const nextDays = [...plan.completedDays];
          nextDays[dayIndex] = !nextDays[dayIndex];
          return {...plan, completedDays: nextDays};
        })
      );
    },
    [plansStorage]
  );

  const handleUpdateFeedback = useCallback(
    (planId: string, barrierNote: string, feedbackAdjustment: string) => {
      plansStorage.setValue((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? {...plan, barrierNote, feedbackAdjustment}
            : plan
        )
      );
    },
    [plansStorage]
  );

  const handleDeletePlan = useCallback(
    (planId: string) => {
      plansStorage.setValue((prev) => prev.filter((p) => p.id !== planId));
    },
    [plansStorage]
  );

  const handleAddSymptomLog = useCallback(
    (input: SymptomMedLogInput) => {
      const nextLog: SymptomMedLog = {
        ...input,
        id: `sym-${Date.now()}`,
        date: todayIso(),
      };
      symptomStorage.setValue((prev) => [nextLog, ...prev]);
    },
    [symptomStorage]
  );

  const handleDeleteSymptomLog = useCallback(
    (id: string) => {
      symptomStorage.setValue((prev) => prev.filter((item) => item.id !== id));
    },
    [symptomStorage]
  );

  const storageWarning =
    rehabStorage.storageError ||
    plansStorage.storageError ||
    symptomStorage.storageError;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav
        onOpenQuickCheckIn={() => setQuickDrawerOpen(true)}
        onNavigateSection={scrollToSection}
      />

      {storageWarning && (
        <div
          role="alert"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-950"
        >
          {storageWarning}
        </div>
      )}

      <main>
        <SplitHero
          onSelectRehab={() => scrollToSection('rehab-pathways')}
          onSelectCdsmp={() => scrollToSection('action-plans')}
          onOpenQuickCheckIn={() => setQuickDrawerOpen(true)}
        />

        <SummaryStrip
          rehabLogs={rehabStorage.value}
          actionPlans={plansStorage.value}
          symptomLogs={symptomStorage.value}
        />

        <RehabPathwaysSection
          logs={rehabStorage.value}
          selectedTrack={selectedTrack}
          onSelectTrack={setSelectedTrack}
          onAddLog={handleAddRehabLog}
          onDeleteLog={handleDeleteRehabLog}
          onResetLogs={rehabStorage.resetValue}
        />

        <ActionPlanSection
          plans={plansStorage.value}
          selectedCondition={selectedCondition}
          onSelectCondition={setSelectedCondition}
          onAddPlan={handleAddActionPlan}
          onToggleDay={handleToggleDay}
          onUpdateFeedback={handleUpdateFeedback}
          onDeletePlan={handleDeletePlan}
          onResetPlans={plansStorage.resetValue}
        />

        <SymptomMedLogSection
          logs={symptomStorage.value}
          onAddLog={handleAddSymptomLog}
          onDeleteLog={handleDeleteSymptomLog}
          onResetLogs={symptomStorage.resetValue}
        />
      </main>

      <SafetyFooter />

      <QuickCheckInDrawer
        open={quickDrawerOpen}
        onClose={() => setQuickDrawerOpen(false)}
        onSaveRehabCheckIn={handleAddRehabLog}
      />
    </div>
  );
}
