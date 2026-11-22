export function SafetyFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-white">
              carepath:
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
              For daily pacing and personal habit tracking only — not a
              substitute for medical care. Stop activity and seek medical help
              right away if you feel chest pain, severe shortness of breath, or
              dizziness.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Saved privately on this device
          </p>
        </div>
      </div>
    </footer>
  );
}
