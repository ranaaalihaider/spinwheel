# 09 — Progress Log
## AWS Student Builder Group — COMSATS University Islamabad

---

## Log Entry 1 — Phase 0: Project Planning, Discovery & Documentation
- **Timestamp**: `2026-11-24T01:46:00+05:00`
- **Completed Work**:
  1. Inspected the provided Google Spreadsheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`) and confirmed its schema (`Timestamp`, `Reg No`, `Name`, `Email`, `If you could invent one AI tool, what would it do?`).
  2. Verified that `gviz/tq?tqx=out:csv&tq=SELECT%20B%2C%20C` supports CORS (`Access-Control-Allow-Origin`) and filters out `Email` (Column D) and survey answers (Column E) at the Google server level.
  3. Inspected the official AWS Cloud Club dark banner (`Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg`) and confirmed its native `1200×675` (`16:9`) aspect ratio and `#161D26` dark background.
  4. Created all 14 project-specific engineering documentation files in `ai_docs/`.

---

## Log Entry 2 — Phases 1 to 4: Foundation, Branding, Splash Screen & Main Stage UI
- **Timestamp**: `2026-11-24T01:55:00+05:00`
- **Completed Work**:
  1. Initialized React 18 + TypeScript 5 + Vite 5 + Tailwind CSS + Framer Motion + Lucide React + Vitest + Playwright.
  2. Downloaded `Banner_Cloud_Club_Dark.svg` to `public/assets/Banner_Cloud_Club_Dark.svg` as a resilient local fallback for slow or offline university Wi-Fi.
  3. Implemented `SplashScreen.tsx` with a 1.8s animated intro sequence and automatic `prefers-reduced-motion: reduce` fast-path.
  4. Implemented `Header.tsx` preserving the 16:9 aspect ratio of the AWS Cloud Club banner alongside the title lockup (`AWS Student Builder Group` / `COMSATS University Islamabad`), live participant readiness counter, connection status pill, and quick controls.
  5. Built `SpinWheelCanvas.tsx` with high-DPI 2D `<canvas>` rendering, alternating 4-shade purple wedges, perimeter LED lights, central metallic hub, and a top-center jewelled pointer with physical spring deflection.

---

## Log Entry 3 — Phases 5 to 8: Google Sheets Integration, Cryptographic RNG, Audio & Organizer Controls
- **Timestamp**: `2026-11-24T01:59:00+05:00`
- **Completed Work**:
  1. Implemented `participantService.ts` with RFC-4180 CSV parsing, whitespace normalization, and one-way FNV-1a hashing of `Reg No` so distinct students sharing identical names are both preserved while duplicate `Reg No` submissions are merged and raw PII is never exposed.
  2. Added `google-apps-script/Code.gs` for optional private-sheet server-side deployment.
  3. Built `cryptoRandom.ts` using `window.crypto.getRandomValues(new Uint32Array(1))` with rejection sampling to eliminate modulo bias, paired with an exact final angle solver (`calculateTargetRotation`) and an Adaptive 48-Slice Display Window (`buildAdaptiveSpinWindow`) for 100–1,000+ student cohorts.
  4. Built `soundService.ts` using procedural Web Audio synthesis for peg ticks, spin start chimes, and winner celebration fanfare.
  5. Built `WinnerModal.tsx`, `ConfettiOverlay.tsx`, `WinnerHistoryCard.tsx`, and PIN-protected `OrganizerPanel.tsx` (default PIN `2026`) including `"Exclude Previous Winners"` (default enabled), Session Reset with confirmation, `.csv` export, and an explicitly demarcated Development/Test Sandbox Mode.

---

## Log Entry 4 — Phases 9 to 12: Automated Testing, E2E Verification, Build & GitHub Deployment
- **Timestamp**: `2026-11-24T02:06:30+05:00`
- **Completed Work**:
  1. Resolved a `window.matchMedia` mock restoration issue in `tests/setup.ts` where `vi.restoreAllMocks()` was resetting `vi.fn()` mocks between tests; switched to a permanent function implementation in `tests/setup.ts`.
  2. Executed `npm run build` (`tsc -b && vite build`): succeeded cleanly with zero TypeScript or bundler warnings (`dist/` generated).
  3. Executed `npm run test` (`vitest run`): all 20 unit and component integration tests across `cryptoRandom.test.ts`, `participantService.test.ts`, and `App.test.tsx` passed.
  4. Configured Playwright E2E suite against the production preview server (`127.0.0.1:4173`) with `waitUntil: 'domcontentloaded'` so external font/CDN latency never stalls test navigation; executed `npm run test:e2e` and verified 2/2 E2E suites passed across `360px`, `390px`, `768px`, `1024px`, `1440px`, and `1920px` viewports with zero horizontal overflow.
  5. Verified zero secrets or credentials exist in tracked files and pushed the repository to `https://github.com/ranaaalihaider/spinwheel.git`.

---

## Log Entry 5 — Phase 13: UI Visual Overhaul (v2), Race Condition Fix & Full Re-Verification
- **Timestamp**: `2026-11-24T02:36:00+05:00`
- **Problem Addressed**: Organizer feedback noted the initial dark-monochrome wheel and layout felt too subtle and basic for a live auditorium projector.
- **Completed Work**:
  1. **Wheel Visual Overhaul (`SpinWheelCanvas.tsx`)**: Replaced the monochrome purple segments with a bold, high-contrast 10-color palette (violet, pink, amber, emerald, blue, red, royal purple, cyan, orange, indigo) with radial slice depth gradients, conic metallic multi-color bezel, 36 live-chasing LED lights (idle chase, fast spin, winner celebration), rotating rainbow outer halo, improved label positioning with `maxWidth` hub protection, and upright seam-free rendering when only 1 participant remains.
  2. **Stage Atmosphere & Components**: Upgraded `AmbientBackground.tsx` with drifting canvas color orbs, twinkling stars, and stage spotlights; enhanced `App.tsx` with rainbow gradient hero typography and an animated shimmer `"SPIN THE WHEEL"` CTA; refreshed `SplashScreen.tsx`, `Header.tsx`, `WinnerHistoryCard.tsx`, `WinnerModal.tsx`, and upgraded `ConfettiOverlay.tsx` to a 160-piece 3-cannon celebration.
  3. **Concurrency Bug Fix (`useLuckyDraw.ts`)**: Added monotonic `fetchEpochRef` tracking so an in-flight Google Sheets fetch cannot overwrite Sandbox Mode data if the organizer switches modes before the initial network request completes.
  4. **Verification**: Confirmed `npm run build` (`tsc -b && vite build`), `npm run test` (20/20 Vitest tests), and `npm run test:e2e` (2/2 Playwright suites across `360px`–`1920px` viewports) all pass with zero errors.
  5. **Deployment**: Committed all verified changes locally on `main`; ready for `git push origin main` (GitHub authentication required) to trigger automatic AWS Amplify redeployment to `https://main.d2jqacu1gnle29.amplifyapp.com`.
