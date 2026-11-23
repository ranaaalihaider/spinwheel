# 01 — Requirements Specification
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Functional Requirements (FR)

### FR-01: Animated Introductory Splash Screen
- **FR-01.1**: Display a 1.5–2.0 second cinematic splash screen upon initial application load.
- **FR-01.2**: Reveal the official AWS Cloud Club dark banner (`Banner_Cloud Club_Dark-Dn6ZGEaT.svg`) at its native 16:9 aspect ratio alongside "AWS Student Builder Group" and "COMSATS University Islamabad".
- **FR-01.3**: Respect `prefers-reduced-motion: reduce` by bypassing artificial delays and scale transitions when requested by the operating system.
- **FR-01.4**: Render resilient text branding even if external image assets fail or load slowly.
- **FR-01.5**: Only show once per page load (do not re-trigger on participant refresh or state changes).

### FR-02: Main Event Interface & Branding
- **FR-02.1**: Display a responsive header featuring the AWS Student Builder Group branding, COMSATS University Islamabad subtitle, live participant count badge, connection health pill, and quick-action buttons (Refresh, Sound, Fullscreen, Organizer Panel).
- **FR-02.2**: Render the hero heading `"Let the Wheel Decide!"` and subtitle `"Every participant has a chance. One spin, one lucky winner!"`.
- **FR-02.3**: Present the interactive spin wheel as the centerpiece alongside a high-impact `"SPIN THE WHEEL"` primary call-to-action button.

### FR-03: Google Sheets Participant Integration
- **FR-03.1**: Fetch live participant records from the configured Google Sheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`) or Google Apps Script Web App endpoint.
- **FR-03.2**: Support configurable column names (defaulting to `Name` / `Student Name` for display name and `Reg No` / `Registration Number` for deduplication key).
- **FR-03.3**: Trim leading/trailing whitespace, collapse internal multi-spaces, and discard blank rows.
- **FR-03.4**: Deduplicate registrations by normalized `Reg No` when present. Retain distinct participants who share identical names if their `Reg No` values differ.
- **FR-03.5**: Strip and never display PII (`Reg No`, `Email`, survey answers, phone numbers) in the public user interface.
- **FR-03.6**: Preserve the last known valid participant list if a subsequent refresh fails, surfacing a clear warning banner indicating stale data and timestamp.
- **FR-03.7**: When no valid participants exist in the live sheet, display `"No participants available yet. Please check the registration sheet."` and disable the spin button.

### FR-04: Cryptographic Selection & Wheel Animation
- **FR-04.1**: Use `crypto.getRandomValues()` with rejection sampling to guarantee uniform probability `1 / N` across all `N` eligible participants.
- **FR-04.2**: Freeze the eligible participant snapshot at the moment a spin begins so mid-spin background events cannot corrupt the outcome.
- **FR-04.3**: Compute the exact final angle so the wheel pointer lands precisely inside the selected winner's segment.
- **FR-04.4**: Animate the rotation over 5.5–6.5 seconds (or instant settle under `prefers-reduced-motion`) using a custom cubic-bezier deceleration curve with 6–9 full revolutions.
- **FR-04.5**: Support large participant pools (100 to 1,000+ students) via an Adaptive Windowed Wheel strategy that selects from 100% of eligible participants while keeping rendered canvas slices legible.

### FR-05: Winner Announcement & Audio Feedback
- **FR-05.1**: Launch a projector-optimized Winner Modal upon spin completion showing `"CONGRATULATIONS!"`, the winner's name, and `"You are our lucky winner!"`.
- **FR-05.2**: Trigger celebratory particle confetti and spotlight illumination.
- **FR-05.3**: Provide `"Spin Again"` and `"Close"` actions in the modal.
- **FR-05.4**: Synthesize optional sound effects (segment boundary tick, spin acceleration hum, and winner chord fanfare) via the Web Audio API with a global Mute/Unmute toggle.

### FR-06: Event Management & Organizer Controls
- **FR-06.1**: Track session Winner History (`winnerName`, `selectedAt`, `spinSequenceNumber`) with `localStorage` persistence and an informational disclaimer that browser storage is local to the current device.
- **FR-06.2**: Default `"Exclude Previous Winners"` to enabled (`true`), removing already-selected participants from the active pool for subsequent spins.
- **FR-06.3**: Handle pool exhaustion gracefully when all participants have won, prompting the organizer to reset eligibility or disable exclusion.
- **FR-06.4**: Provide Fullscreen Presentation Mode via the browser Fullscreen API with a CSS Theater Mode fallback if restricted.
- **FR-06.5**: Gate destructive or administrative organizer controls (Reset Event Session, Repeat Winner Policy, Development Sandbox Mode) behind an Organizer PIN / Passcode lock so public viewers cannot accidentally clear event state.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-01 (Performance)**: Maintain 60 FPS wheel rotation using HTML5 `<canvas>` and `requestAnimationFrame` without triggering React state re-renders on every frame.
- **NFR-02 (Responsiveness)**: Render cleanly without horizontal overflow across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports.
- **NFR-03 (Accessibility)**: Provide keyboard accessibility (`Enter`/`Space` to spin, `Escape` to close modals), ARIA live announcements for winners, high contrast ratios (WCAG AAA on primary text), and `prefers-reduced-motion` support.
- **NFR-04 (Security)**: Zero secrets in frontend code or Git history, strict input sanitization (React text nodes + Canvas `fillText`), HTTPS-only API requests, and read-only data consumption.
- **NFR-05 (Deployability)**: Zero-config compatibility with AWS Amplify Hosting (`amplify.yml`, `dist/` output, SPA rewrite rule).
