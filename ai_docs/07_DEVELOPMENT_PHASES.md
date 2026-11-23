# 07 — Development Phases & Execution Plan
## AWS Student Builder Group — COMSATS University Islamabad

---

## Phase Breakdown

### Phase 0: Project Planning & Documentation (Complete)
- Author all 14 project-specific engineering documents inside `ai_docs/`.
- Establish data privacy rules, cryptographic math invariants, and AWS Cloud Club design tokens.

### Phase 1: Technology Stack & Project Foundation
- Initialize Vite + React 18 + TypeScript 5 + Tailwind CSS + Framer Motion + Lucide React + Vitest + Playwright.
- Configure strict TypeScript compilation, path aliases, and error boundaries.
- Download and verify the official AWS Cloud Club dark banner (`Banner_Cloud_Club_Dark.svg`) into `public/assets/`.

### Phase 2: Branding & Visual Design System
- Implement custom Tailwind theme palette (`#090714`, `#151027`, `#1B1530`, `#8B5CF6`, `#A855F7`, `#C4B5FD`).
- Create `AmbientBackground.tsx` with subtle GPU-accelerated purple lighting and restrained floating particles.
- Build `Header.tsx` preserving the 16:9 aspect ratio of the official banner alongside the AWS Student Builder Group — COMSATS University Islamabad title lockup.

### Phase 3: Animated Splash Screen
- Implement `SplashScreen.tsx` with a 1.8s sequence: dark background glow -> 16:9 AWS Cloud Club banner reveal -> animated title & COMSATS subtitle -> smooth fade transition.
- Add `useReducedMotion` hook to bypass delay when `prefers-reduced-motion: reduce` is enabled.

### Phase 4: Main Website Interface & Wheel Canvas
- Implement `SpinWheelCanvas.tsx` with high-DPI `<canvas>` rendering, alternating 4-shade purple segments, dynamic font scaling, radial metallic hub, glowing perimeter bezel, and physical pointer deflection.
- Build the hero section (`"Let the Wheel Decide!"`), status pills, and tactile `"SPIN THE WHEEL"` primary button.

### Phase 5: Google Forms & Google Sheets Integration
- Build `participantService.ts` supporting both `VITE_GOOGLE_SHEET_ID` (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q` via `gviz/tq?tqx=out:csv&tq=SELECT%20B%2C%20C`) and `VITE_PARTICIPANTS_API_URL` (Apps Script Web App).
- Implement RFC-4180 CSV parsing, whitespace normalization, `Reg No`-based deduplication (preserving identical names with distinct IDs), stale-cache fallback on error, and the Empty Sheet state (`"No participants available yet. Please check the registration sheet."`).
- Author `google-apps-script/Code.gs` for optional private-sheet deployment.

### Phase 6: Spin Wheel & Random Selection Algorithm
- Implement `cryptoRandom.ts` with `crypto.getRandomValues()` rejection sampling and deterministic target angle solver.
- Build adaptive 48-slice cohort windowing for large participant lists (`100+` / `500+` students).
- Enforce concurrency locks during active spins.

### Phase 7: Winner Announcement & Procedural Audio
- Build `WinnerModal.tsx` and `ConfettiOverlay.tsx` with purple spotlight, high-contrast typography, `"Spin Again"`, and `"Close"` actions.
- Implement `soundService.ts` using Web Audio API for mechanical slice ticks, spin hum, and winner celebration fanfare with mute/unmute persistence.

### Phase 8: Event Management Features
- Build `OrganizerPanel.tsx` and `WinnerHistoryCard.tsx`.
- Implement session Winner History (`localStorage`), `"Exclude Previous Winners"` toggle (enabled by default), all-winners-exhausted state, Fullscreen Presentation Mode (`useFullscreen.ts`), PIN-protected session reset, and an explicitly labeled Development/Test Sandbox dataset loader.

### Phase 9: Responsive Design & Projector Optimization
- Optimize layouts across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports.
- Verify dynamic wheel sizing so mobile screens never clip or scroll horizontally.

### Phase 10: Quality Assurance & Security Verification
- Execute Vitest unit and component tests covering cryptographic selection bounds, modulo-bias rejection sampling, target angle verification, duplicate handling, and UI states.
- Execute Playwright E2E browser tests across mobile and desktop viewports.

### Phase 11: GitHub & AWS Amplify Deployment Readiness
- Configure `amplify.yml`, `.env.example`, `.gitignore`, and production build (`npm run build`).
- Push the verified repository to `https://github.com/ranaaalihaider/spinwheel.git` without exposing any tokens or secrets in Git history.
