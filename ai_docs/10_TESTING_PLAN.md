# 10 — Testing & Quality Assurance Plan
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Testing Strategy Overview

Quality assurance is divided into three automated tiers plus manual stage verification:
1. **Unit Tests (Vitest)**: Cryptographic RNG bounds, rejection sampling fairness, target rotation angle accuracy, CSV parsing, whitespace trimming, and `Reg No` vs `Name` deduplication rules.
2. **Component & Integration Tests (Vitest + React Testing Library)**: Splash screen lifecycle, Empty sheet state, Participant loading, Refresh error fallback, Spin concurrency locking, Winner modal announcement, Repeat-winner exclusion, and Organizer PIN reset flow.
3. **End-to-End Viewport & Interaction Tests (Playwright)**: Live Chromium verification across mobile (`360px`, `390px`), tablet (`768px`), desktop (`1024px`, `1440px`), and full HD projector (`1920px`) resolutions.

---

## 2. Unit Test Matrix (`tests/unit/`)

| Test Suite | Test Case | Expected Outcome |
|---|---|---|
| `cryptoRandom.test.ts` | Boundary & Range Validation | `selectRandomIndex(N)` always returns integer $k \in [0, N-1]$ for $N \in \{1, 2, 3, 48, 128, 500, 1000\}$ |
| `cryptoRandom.test.ts` | Rejection Sampling Modulo Bias | Values $\ge 2^{32} - (2^{32} \bmod N)$ are rejected; subsequent valid draw is accepted |
| `cryptoRandom.test.ts` | Target Angle Alignment | For 1,000 random trials across $M \in [1, 48]$, `getSliceIndexAtPointer(finalAngle, M)` strictly equals `targetSliceIndex` |
| ` cryptoRandom.test.ts` | Adaptive Cohort Windowing | When $N = 500$, winner is selected from all 500 participants and guaranteed to appear at `displaySlices[targetSliceIndex]` |
| `participantService.test.ts` | Empty & Blank Row Filtering | Blank rows, whitespace-only rows, and header rows are ignored |
| `participantService.test.ts` | Identical Names with Different `Reg No` | Two students named `"Muhammad Ali"` with `FA23-BCS-001` and `FA23-BCS-002` are **both preserved** as distinct eligible participants |
| `participantService.test.ts` | Duplicate `Reg No` Submissions | Two rows with `FA23-BCS-001` and `fa23bcs001` deduplicate to 1 participant (`duplicatesRemoved: 1`) |
| `participantService.test.ts` | PII Stripping | Returned `Participant` objects contain only `{ id, name, hasDistinctId }` and never expose raw `Reg No` or `Email` |

---

## 3. Component & Integration Test Matrix (`tests/unit/App.test.tsx`)

| Scenario | Verification |
|---|---|
| **Empty Spreadsheet State** | Renders `"No participants available yet. Please check the registration sheet."` and disables `"SPIN THE WHEEL"` |
| **Single & Dual Participant Edge Cases** | Wheel renders and selects accurately with `N = 1` and `N = 2` participants |
| **Refresh Failure Recovery** | When initial load succeeds with 10 participants and subsequent refresh returns HTTP 500 / network error, all 10 participants remain playable and a stale-data warning is shown |
| **Spin Concurrency Lock** | Clicking `"SPIN THE WHEEL"` disables both `"SPIN THE WHEEL"` and `"Refresh Participants"` until the spin completes |
| **Winner Modal & History** | Upon spin completion, `"CONGRATULATIONS!"` modal displays the selected winner, increments spin sequence `#1`, and appends to Winner History |
| **Exclude Previous Winners** | With exclusion enabled (default), winner `#1` is excluded from spin `#2`; when all participants have won, displays the All Participants Won state with reset option |

---

## 4. Responsive Viewport Matrix (Playwright E2E)

| Device Class | Viewport (`W × H`) | Verification Criteria |
|---|---|---|
| Compact Android | `360 × 740` | Zero horizontal overflow (`scrollWidth <= clientWidth`), wheel scales cleanly, touch-friendly spin button |
| iPhone 14 / 15 | `390 × 844` | Compact header, legible slice names, properly fitted winner modal |
| iPad / Tablet | `768 × 1024` | Balanced vertical stack, drawer navigation accessible |
| Laptop | `1024 × 768` | Two-column stage layout with wheel and live session stats |
| Desktop Monitor | `1440 × 900` | Expansive wheel size, clear typography hierarchy |
| Auditorium Projector | `1920 × 1080` | Maximum stage presence, high-contrast winner announcement readable from 20+ meters |
