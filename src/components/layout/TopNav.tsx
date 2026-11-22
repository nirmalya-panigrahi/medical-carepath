export type CareSpace = 'recovery' | 'habits';

interface TopNavProps {
  onOpenQuickCheckIn: () => void;
}

export function TopNav({onOpenQuickCheckIn}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
          }}
          className="font-display text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
        >
          carepath:
        </a>

        <button
          type="button"
          onClick={onOpenQuickCheckIn}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Check-In
        </button>
      </div>
    </header>
  );
}
