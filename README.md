# CarePath — Gentle Recovery & Daily Habits

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-0284C7?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest_%26_RTL-6E9F18?logo=vitest&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-181717?logo=github&logoColor=white)

CarePath keeps **Gentle Recovery** and **Daily Habits** completely independent so users can track either—or both simultaneously—without intermingling recovery pacing with chronic habit logs.

1. **Gentle Recovery (Cyan Space)**:
   - Opens directly from the left hero panel (`Open Recovery`).
   - Features its own **Recovery 28-Day Waffle** (`Good / Steady / Rest`), tap-based daily check-ins for **Breathing**, **Heart**, and **Joints & Muscles**, and safe next-step pacing rules.
2. **Daily Habits (Lime Space)**:
   - Opens directly from the right hero panel (`Open Daily Habits`).
   - Features its own **Daily Habits 28-Day Waffle** (`On track / Moderate / Missed or Flare`) alongside **Weekly Goal** (`1–10` confidence taps & `M–S` check-offs) and **Symptoms & Medication** logging.

---

## Architecture Overview

```mermaid
flowchart TD
    Hero["50/50 Split Hero + Botanical Line-Art Face"] -->|Open Recovery| RecoverySpace["Gentle Recovery Space"]
    Hero -->|Open Daily Habits| HabitsSpace["Daily Habits Space"]
    Hero -->|Right-edge CHECK-IN| Drawer["Quick Check-In Drawer"]

    RecoverySpace --> RecWaffle["Recovery 28-Day Waffle"]
    RecoverySpace --> RecForm["Daily Recovery Check-In"]
    RecForm --> RehabRules["src/utils/rehabRules.ts"]
    RehabRules --> RecStore["carepath_rehab_logs_v1"]

    HabitsSpace --> HabWaffle["Daily Habits 28-Day Waffle"]
    HabitsSpace --> GoalTab["Weekly Goal (Confidence >= 7)"]
    HabitsSpace --> SymTab["Symptoms & Medication Log"]
    GoalTab --> CdsmpRules["src/utils/cdsmpRules.ts"]
    SymTab --> CdsmpRules
    CdsmpRules --> HabStore["carepath_action_plans_v1 & carepath_symptom_logs_v1"]
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

- `src/utils/rehabRules.test.ts`: Borg effort mapping, safe progression rules, 24-hour flare holds, and validation.
- `src/utils/cdsmpRules.test.ts`: `< 7/10` confidence coaching, frequency scale-down logic, weekly completion math, and empty/invalid log recovery.
- `src/hooks/useLocalStorageState.test.ts`: Local persistence and malformed JSON recovery.
- `src/components/trends/ProgressWaffle.test.tsx`: Independent Recovery vs. Daily Habits 28-day waffle rendering and empty-state safety.
- `src/App.test.tsx`: Dual hero routing into independent spaces, simultaneous independent tracking, Quick Check-In drawer, and validation/filter edge cases.
