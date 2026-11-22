import {useCallback, useState} from 'react';
import {ActionPlanSection} from './components/cdsmp/ActionPlanSection';
import {QuickCheckInDrawer} from './components/checkin/QuickCheckInDrawer';
import {SplitHero} from './components/hero/SplitHero';
import {SafetyFooter} from './components/layout/SafetyFooter';
import {TopNav, type CareSpace} from './components/layout/TopNav';
import {SymptomMedLogSection} from './components/logs/SymptomMedLogSection';
import {RehabPathwaysSection} from './components/rehab/RehabPathwaysSection';
import {ProgressWaffle} from './components/trends/ProgressWaffle';
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

type HabitsSubTab = 'goal' | 'log';

export default function App() {
  const [activeSpace, setActiveSpace] = useState<CareSpace>('recovery');
  const [habitsTab, setHabitsTab] = useState<HabitsSubTab>('goal');
  const [selectedTrack, setSelectedTrack] = useState<RehabTrack>('pulmonary');
  const [selectedCondition, setSelectedCondition] =
    useState<ChronicCondition>('hypertension');
  const [quickDrawerOpen, setQuickDrawerOpen] = useState<boolean>(false);

  // Independent Recovery storage
  const rehabStorage = useLocalStorageState<RehabCheckIn[]>(
    'carepath_rehab_logs_v1',
    INITIAL_REHAB_LOGS
  );

  // Independent Daily Habits storage
  const plansStorage = useLocalStorageState<ActionPlan[]>(
    'carepath_action_plans_v1',
    INITIAL_ACTION_PLANS
  );
  const symptomStorage = useLocalStorageState<SymptomMedLog[]>(
    'carepath_symptom_logs_v1',
    INITIAL_SYMPTOM_LOGS
  );

  const openSpace = useCallback((space: CareSpace) => {
    setActiveSpace(space);
    const targetId = space === 'recovery' ? 'recovery-space' : 'habits-space';
    window.requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
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
        weekLabel: 'This Week',
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
      <TopNav onOpenQuickCheckIn={() => setQuickDrawerOpen(true)} />

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
          onOpenRecovery={() => openSpace('recovery')}
          onOpenHabits={() => openSpace('habits')}
        />
        {/* Space 1: Independent Gentle Recovery */}
        {activeSpace === 'recovery' && (
          <div id="recovery-space" className="scroll-mt-16 bg-slate-50">
            <ProgressWaffle mode="recovery" rehabLogs={rehabStorage.value} />

            <RehabPathwaysSection
              logs={rehabStorage.value}
              selectedTrack={selectedTrack}
              onSelectTrack={setSelectedTrack}
              onAddLog={handleAddRehabLog}
              onDeleteLog={handleDeleteRehabLog}
            />
          </div>
        )}

        {/* Space 2: Independent Daily Habits */}
        {activeSpace === 'habits' && (
          <div id="habits-space" className="scroll-mt-16 bg-slate-50">
            <ProgressWaffle
              mode="habits"
              actionPlans={plansStorage.value}
              symptomLogs={symptomStorage.value}
            />

            <div className="border-b border-slate-200 bg-white">
              <div
                role="tablist"
                aria-label="Daily habits tools"
                className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={habitsTab === 'goal'}
                  onClick={() => setHabitsTab('goal')}
                  className={`h-10 rounded-lg px-4 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    habitsTab === 'goal'
                      ? 'bg-lime-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Weekly Goal
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={habitsTab === 'log'}
                  onClick={() => setHabitsTab('log')}
                  className={`h-10 rounded-lg px-4 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    habitsTab === 'log'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Symptoms &amp; Medication
                </button>
              </div>
            </div>

            {habitsTab === 'goal' && (
              <ActionPlanSection
                plans={plansStorage.value}
                selectedCondition={selectedCondition}
                onSelectCondition={setSelectedCondition}
                onAddPlan={handleAddActionPlan}
                onToggleDay={handleToggleDay}
                onUpdateFeedback={handleUpdateFeedback}
                onDeletePlan={handleDeletePlan}
              />
            )}

            {habitsTab === 'log' && (
              <SymptomMedLogSection
                logs={symptomStorage.value}
                onAddLog={handleAddSymptomLog}
                onDeleteLog={handleDeleteSymptomLog}
              />
            )}
          </div>
        )}
      </main>

      <SafetyFooter />

      <QuickCheckInDrawer
        key={activeSpace}
        open={quickDrawerOpen}
        initialSpace={activeSpace}
        onClose={() => setQuickDrawerOpen(false)}
        onSaveRecovery={handleAddRehabLog}
        onSaveHabitLog={handleAddSymptomLog}
      />
    </div>
  );
}
