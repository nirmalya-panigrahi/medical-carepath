import {ArrowDownRight} from 'lucide-react';

interface SplitHeroProps {
  onSelectRehab: () => void;
  onSelectCdsmp: () => void;
  onOpenQuickCheckIn: () => void;
}

/**
 * Editorial duotone SVG portrait bust split down the exact vertical center
 * seam to replicate the split cyan/lime portrait composition of the hero reference.
 */
function SplitDuotonePortrait() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 600 620"
        className="h-[92%] w-auto max-w-none select-none object-contain"
        role="presentation"
      >
        <defs>
          <clipPath id="hero-left-half">
            <rect x="0" y="0" width="300" height="620" />
          </clipPath>
          <clipPath id="hero-right-half">
            <rect x="300" y="0" width="300" height="620" />
          </clipPath>
          <linearGradient id="cyan-shadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#075985" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="cyan-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0369A1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0.58" />
          </linearGradient>
          <linearGradient id="lime-shadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#365314" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#1A2E05" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="lime-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3F6212" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#365314" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Left Cyan Duotone Half */}
        <g clipPath="url(#hero-left-half)">
          {/* Shoulders & collared utility shirt */}
          <path
            d="M42 620 C56 508, 128 456, 212 436 L248 398 L300 412 L300 620 Z"
            fill="url(#cyan-shadow)"
          />
          {/* Shirt collar & placket shadow */}
          <path
            d="M214 434 L250 398 L286 480 L256 492 Z"
            fill="#0C4A6E"
            fillOpacity="0.52"
          />
          <path
            d="M110 538 Q165 516 226 530 L220 578 Q165 568 106 584 Z"
            fill="#7DD3FC"
            fillOpacity="0.22"
          />
          {/* Neck */}
          <path
            d="M236 336 L236 426 L300 452 L300 336 Z"
            fill="#075985"
            fillOpacity="0.58"
          />
          {/* Left Ear */}
          <path
            d="M198 228 C176 224, 174 282, 198 294 C205 297, 212 292, 214 280 Z"
            fill="#075985"
            fillOpacity="0.65"
          />
          {/* Head & Jawline */}
          <path
            d="M300 88 C236 88, 198 140, 200 220 C202 290, 224 352, 272 380 C282 386, 291 388, 300 388 Z"
            fill="url(#cyan-mid)"
          />
          {/* Hair texture silhouette */}
          <path
            d="M300 66 C244 64, 202 106, 194 164 C190 190, 194 210, 204 222 C206 184, 216 146, 240 124 C258 108, 280 104, 300 104 Z"
            fill="#E0F2FE"
            fillOpacity="0.24"
          />
          {/* Brow, eye, nose & calm smile contours */}
          <path
            d="M226 212 Q256 200 286 212"
            stroke="#0C4A6E"
            strokeOpacity="0.68"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="256"
            cy="232"
            rx="16"
            ry="7"
            fill="#082F49"
            fillOpacity="0.6"
          />
          <circle cx="257" cy="232" r="4" fill="#BAE6FD" fillOpacity="0.55" />
          <path
            d="M294 218 L286 286 Q292 294 300 294"
            stroke="#0C4A6E"
            strokeOpacity="0.58"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M254 322 Q278 334 300 332"
            stroke="#0C4A6E"
            strokeOpacity="0.62"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Right Lime-Olive Duotone Half */}
        <g clipPath="url(#hero-right-half)">
          {/* Shoulders & collared utility shirt */}
          <path
            d="M558 620 C544 508, 472 456, 388 436 L352 398 L300 412 L300 620 Z"
            fill="url(#lime-shadow)"
          />
          {/* Shirt collar & fold shadow */}
          <path
            d="M386 434 L350 398 L314 480 L344 492 Z"
            fill="#1A2E05"
            fillOpacity="0.48"
          />
          <path
            d="M490 538 Q435 516 374 530 L380 578 Q435 568 494 584 Z"
            fill="#D9F99D"
            fillOpacity="0.22"
          />
          {/* Neck */}
          <path
            d="M364 336 L364 426 L300 452 L300 336 Z"
            fill="#365314"
            fillOpacity="0.55"
          />
          {/* Right Ear */}
          <path
            d="M402 228 C424 224, 426 282, 402 294 C395 297, 388 292, 386 280 Z"
            fill="#365314"
            fillOpacity="0.62"
          />
          {/* Head & Jawline */}
          <path
            d="M300 88 C364 88, 402 140, 400 220 C398 290, 376 352, 328 380 C318 386, 309 388, 300 388 Z"
            fill="url(#lime-mid)"
          />
          {/* Hair texture silhouette */}
          <path
            d="M300 66 C356 64, 398 106, 406 164 C410 190, 406 210, 396 222 C394 184, 384 146, 360 124 C342 108, 320 104, 300 104 Z"
            fill="#ECFCCB"
            fillOpacity="0.24"
          />
          {/* Brow, eye, nose & calm smile contours */}
          <path
            d="M374 212 Q344 200 314 212"
            stroke="#1A2E05"
            strokeOpacity="0.65"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="344"
            cy="232"
            rx="16"
            ry="7"
            fill="#1A2E05"
            fillOpacity="0.58"
          />
          <circle cx="343" cy="232" r="4" fill="#D9F99D" fillOpacity="0.55" />
          <path
            d="M306 218 L314 286 Q308 294 300 294"
            stroke="#1A2E05"
            strokeOpacity="0.55"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M346 322 Q322 334 300 332"
            stroke="#1A2E05"
            strokeOpacity="0.58"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Crisp hairline center split seam */}
        <line
          x1="300"
          y1="0"
          x2="300"
          y2="620"
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function SplitHero({
  onSelectRehab,
  onSelectCdsmp,
  onOpenQuickCheckIn,
}: SplitHeroProps) {
  return (
    <section
      id="top"
      aria-label="Recovery pathways and chronic self-management overview"
      className="relative overflow-hidden bg-slate-900"
    >
      {/* 50 / 50 Split Chromatic Canvas */}
      <div className="relative grid min-h-[540px] grid-cols-1 md:min-h-[600px] md:grid-cols-2 lg:min-h-[640px]">
        {/* Left Cyan-Sky Half */}
        <div className="relative flex flex-col justify-center bg-gradient-to-br from-[#0284C7] via-[#0EA5E9] to-[#0369A1] px-6 py-14 text-white sm:px-10 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-3/4 bg-gradient-to-r from-[#0369A1]/75 via-[#0284C7]/35 to-transparent"
          />
          <div className="relative z-10 max-w-md">
            <p className="text-xs font-semibold tracking-wider text-sky-100 uppercase">
              Pulmonary · Cardiac · Musculoskeletal
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight text-white uppercase sm:text-5xl lg:text-6xl text-balance">
              Rehab &amp; Graded Pacing
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-50/95 sm:text-base">
              Daily mobility checks, Borg Rating of Perceived Exertion pacing,
              and 24-hour pain-threshold rules to progress safely without flare-ups.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onSelectRehab}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-sky-900 shadow-sm hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Open Rehab Pathways</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Lime-Olive Half */}
        <div className="relative flex flex-col justify-center bg-gradient-to-br from-[#65A30D] via-[#4D7C0F] to-[#3F6212] px-6 py-14 text-white sm:px-10 md:items-end md:text-right lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-3/4 bg-gradient-to-l from-[#365314]/75 via-[#4D7C0F]/35 to-transparent"
          />
          <div className="relative z-10 max-w-md md:flex md:flex-col md:items-end">
            <p className="text-xs font-semibold tracking-wider text-lime-100 uppercase">
              Diabetes · Hypertension · Arthritis
            </p>
            <h2 className="font-display mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight text-white uppercase sm:text-5xl lg:text-6xl text-balance">
              Chronic Self-Management
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-lime-50/95 sm:text-base">
              Stanford CDSMP weekly action planning with 0–10 confidence scoring,
              symptom-vs-medication logs, and structured feedback loops.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onSelectCdsmp}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-lime-950 shadow-sm hover:bg-lime-50 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Build Weekly Action Plan</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Centered Split-Duotone Portrait overlay on md+ viewports */}
        <div className="hidden md:block md:opacity-65 lg:opacity-90">
          <SplitDuotonePortrait />
        </div>
      </div>

      {/* Signature Vertical Edge Tab (mirrors CONNECT tab in reference screenshot) */}
      <button
        type="button"
        onClick={onOpenQuickCheckIn}
        aria-label="Open quick daily check-in drawer"
        className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer bg-white px-2 py-4 text-[11px] font-bold tracking-[0.2em] text-slate-900 uppercase shadow-md hover:bg-slate-100 transition-colors sm:block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        style={{writingMode: 'vertical-rl'}}
      >
        CHECK-IN
      </button>
    </section>
  );
}
