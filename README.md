# CarePath — Rehab Pacing & Chronic Self-Management

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-0284C7?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest_%26_RTL-6E9F18?logo=vitest&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-181717?logo=github&logoColor=white)

CarePath is a static, client-side recovery pacing and chronic disease self-management web application. It pairs a high-contrast 50/50 split duotone hero with two evidence-informed interactive workflows:

1. **Pulmonary, Cardiac & Musculoskeletal Rehab Pathways**: Borg 6–20 Rating of Perceived Exertion (RPE) pacing, daily mobility checklists, 0–10 pain-threshold tracking, and deterministic 24-hour safe progression rules (`Progress +10%`, `Hold Baseline`, or `Regress -25%`).
2. **Chronic Disease Self-Management (Stanford CDSMP Model)**: Weekly micro-goal Action Planning for diabetes, hypertension, and arthritis with 0–10 confidence scoring (flagging scores `< 7/10` for down-scaling), day-by-day check-offs, structured weekly feedback loops, and symptom-vs-medication correlation logging.

> **Clinical Boundary**: CarePath is an educational pacing and self-management tracker—not clinical therapy, medical diagnosis, or emergency care.

---

## Architecture Overview

```mermaid
flowchart TD
    Hero["50/50 Split Duotone Hero<br/>(Rehab Pacing | Chronic Self-Management)"] --> Strip["4-Column Live Summary Strip"]
    Hero -->|Right-edge CHECK-IN Tab| Drawer["Quick Daily Check-In Drawer"]
    Strip --> Rehab["Rehab Pathways Workspace<br/>(Borg 6-20 · Pain 0-10 · 24h Rules)"]
    Strip --> CDSMP["Stanford CDSMP Action Planner<br/>(Confidence >= 7/10 · Feedback Loop)"]
    Strip --> SymLog["Symptom vs. Medication Log<br/>(Adherence % · 7-Day SVG Trend)"]

    Rehab --> RehabRules["src/utils/rehabRules.ts"]
    CDSMP --> CdsmpRules["src/utils/cdsmpRules.ts"]
    SymLog --> CdsmpRules
    Drawer --> RehabRules

    RehabRules --> Storage["useLocalStorageState<br/>(Client-Side Persistence)"]
    CdsmpRules --> Storage
```

---

## Local Setup & Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server on port 3000
npm run dev

# Type-check with TypeScript
npm run lint

# Run unit, hook, and integration tests
npm test

# Build static production bundle into dist/
npm run build
```

---

## Automated Testing

Unit, hook, and React Testing Library integration tests cover both happy-path (**Blue Pill**) and adversarial/edge-case (**Red Pill**) scenarios:

- `src/utils/rehabRules.test.ts`: Borg RPE zone mapping, track target bounds, green/amber/red safe progression rules, 24-hour pain irritability spikes, and out-of-range input validation.
- `src/utils/cdsmpRules.test.ts`: Stanford CDSMP `< 7/10` confidence flagging, deterministic goal scale-down logic, weekly completion math, and empty/invalid log recovery.
- `src/hooks/useLocalStorageState.test.ts`: Browser storage synchronization and malformed JSON recovery.
- `src/App.test.tsx`: End-to-end user flows across the split hero, Quick Check-In drawer, Rehab logger, CDSMP Action Planner, and Symptom-vs-Medication filters.

---

## GitHub Pages Deployment

Automated deployment is configured via `.github/workflows/deploy.yml` on pushes to `main` using Node.js `22` and `npm install --legacy-peer-deps`. `vite.config.ts` automatically resolves the GitHub Pages repository `base` path from `GITHUB_REPOSITORY` during CI builds while keeping `/` for local and root-domain hosting.
