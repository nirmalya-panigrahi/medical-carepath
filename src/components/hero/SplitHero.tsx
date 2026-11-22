import {ArrowDownRight} from 'lucide-react';
import {useState} from 'react';

interface SplitHeroProps {
  onOpenRecovery: () => void;
  onOpenHabits: () => void;
}

function CenterBotanicalPortrait() {
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = `${import.meta.env.BASE_URL}assets/aistudio/image_ec517fdf.png`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center overflow-hidden"
    >
      {!imgFailed ? (
        <img
          src={imgSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-[74%] w-auto max-w-[340px] object-contain select-none mix-blend-multiply contrast-125 opacity-85 lg:h-[82%] lg:max-w-[400px]"
        />
      ) : (
        <svg
          viewBox="0 0 260 320"
          className="h-[72%] w-auto select-none opacity-85"
          fill="none"
          stroke="#0F172A"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="presentation"
        >
          <path d="M130 48 C170 48, 198 86, 196 144 C194 214, 162 270, 130 278 C98 270, 66 214, 64 144 C62 86, 90 48, 130 48 Z" />
          <path d="M88 134 Q108 122 124 134" />
          <path d="M136 134 Q152 122 172 134" />
          <path d="M112 220 Q130 232 148 220" />
        </svg>
      )}
    </div>
  );
}

export function SplitHero({
  onOpenRecovery,
  onOpenHabits,
}: SplitHeroProps) {
  return (
    <section
      id="top"
      aria-label="Recovery and daily habits overview"
      className="relative overflow-hidden bg-slate-900"
    >
      {/* 50 / 50 Split Canvas */}
      <div className="relative grid min-h-[480px] grid-cols-1 md:min-h-[540px] md:grid-cols-2 lg:min-h-[590px]">
        {/* Left Cyan-Blue Half -> Opens Gentle Recovery */}
        <div className="relative flex flex-col justify-center bg-gradient-to-r from-[#0369A1] via-[#0EA5E9] to-[#38BDF8] px-6 py-14 text-white sm:px-10 lg:px-16">
          <div className="relative z-10 max-w-xs sm:max-w-sm">
            <p className="text-xs font-semibold tracking-wider text-sky-100 uppercase">
              Breathing · Heart · Joints
            </p>
            <h1 className="font-display mt-2 text-4xl font-extrabold leading-[0.95] tracking-tight text-white uppercase sm:text-5xl lg:text-6xl text-balance">
              Gentle Recovery
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-sky-50 sm:text-base">
              Move safely at your own pace without flare-ups.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenRecovery}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-sky-900 shadow-sm hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Open Recovery</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Lime-Green Half -> Opens Daily Habits */}
        <div className="relative flex flex-col justify-center bg-gradient-to-l from-[#3F6212] via-[#65A30D] to-[#84CC16] px-6 py-14 text-white sm:px-10 md:items-end md:text-right lg:px-16">
          <div className="relative z-10 max-w-xs sm:max-w-sm md:flex md:flex-col md:items-end">
            <p className="text-xs font-semibold tracking-wider text-lime-100 uppercase">
              Blood Sugar · Pressure · Joints
            </p>
            <h2 className="font-display mt-2 text-4xl font-extrabold leading-[0.95] tracking-tight text-white uppercase sm:text-5xl lg:text-6xl text-balance">
              Daily Habits
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-lime-50 sm:text-base">
              Pick one doable goal each week and track how you feel.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenHabits}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-lime-950 shadow-sm hover:bg-lime-50 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Open Daily Habits</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Centered Botanical Line-Art Portrait */}
        <div className="hidden md:block">
          <CenterBotanicalPortrait />
        </div>
      </div>
    </section>
  );
}
