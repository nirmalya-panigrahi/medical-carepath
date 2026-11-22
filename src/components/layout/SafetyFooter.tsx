export function SafetyFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-bold text-white">
              carepath:
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
              Structured self-management and graded pacing workspace modeled on
              Borg RPE recovery guidelines and the Stanford Chronic Disease
              Self-Management Program (CDSMP).
            </p>
          </div>

          <div className="md:col-span-7">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Clinical Safety Boundary
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              This tool supports personal pacing logs and weekly habit planning;
              it is not clinical therapy or emergency medical care. Stop activity
              and seek immediate medical evaluation if you experience chest pain,
              severe unexplained shortness of breath, dizziness, or acute joint
              instability.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>Client-side local persistence · Zero external telemetry</p>
          <div className="flex items-center gap-6">
            <a href="#rehab-pathways" className="hover:text-slate-200">
              Rehab Pathways
            </a>
            <a href="#action-plans" className="hover:text-slate-200">
              CDSMP Action Plans
            </a>
            <a href="#symptom-log" className="hover:text-slate-200">
              Symptom Log
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
