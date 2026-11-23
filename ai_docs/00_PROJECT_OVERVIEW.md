# 00 — Project Overview
## AWS Student Builder Group — COMSATS University Islamabad
### Premium Event Spin Wheel & Lucky Draw Platform

---

## 1. Executive Summary

The **AWS Student Builder Group — COMSATS University Islamabad** Lucky Draw Platform is a production-grade, cryptographically fair, visually immersive web application engineered for live university tech events, cloud workshops, and community gatherings.

During events, student attendees register via a Google Form. Responses flow automatically into a connected Google Spreadsheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`). This platform retrieves the live list of eligible participants, normalizes and deduplicates records using student registration numbers (`Reg No`) without exposing personally identifiable information (PII) on screen, and conducts an exciting, high-frame-rate lucky draw spin on stage projectors and mobile devices alike.

---

## 2. Core Objectives

1. **Event-Stage Visual Excellence**: Deliver an authentic AWS Cloud Club / Student Builder Group dark-purple aesthetic (`#090714` base, `#8B5CF6` / `#A855F7` accents) built for high-contrast visibility on university auditorium projectors as well as mobile viewports.
2. **Cryptographic Fairness**: Select winners using the Web Crypto API (`crypto.getRandomValues()`) with strict rejection sampling to eliminate modulo bias. Animation follows the pre-determined cryptographic selection rather than dictating it.
3. **Adaptive Large-Cohort Scaling**: Handle anywhere from 1 to 1,000+ participants smoothly by retaining the full eligible participant pool in memory for selection while intelligently adapting the visual wheel segment density when cohorts exceed direct readability thresholds.
4. **Live Google Sheets Synchronization**: Synchronize on demand with the event Google Spreadsheet, supporting configurable column names (`Name`, `Reg No`), graceful offline/error recovery (preserving last valid snapshot with a visible stale-data warning), and strict privacy filtering.
5. **Comprehensive Organizer Controls**: Provide a protected Organizer Drawer containing live refresh, repeat-winner exclusion toggle, session winner history with timestamps and spin sequence numbers, Web Audio API synthesized sound effects, Fullscreen Presentation Mode, and an explicitly demarcated Development/Test Sandbox dataset switcher.

---

## 3. Target Audience & Usage Context

- **Primary Operators**: Event organizers and faculty coordinators from the AWS Student Builder Group at COMSATS University Islamabad running live stage giveaways.
- **Primary Audience**: 50 to 500+ university students viewing the draw live on a 1080p/4K auditorium projector or following along on mobile devices.
- **Deployment Target**: GitHub repository (`https://github.com/ranaaalihaider/spinwheel.git`) connected to **AWS Amplify Hosting** for zero-maintenance CI/CD static hosting.

---

## 4. Key Architectural Highlights

| Dimension | Specification |
|---|---|
| **Organization** | AWS Student Builder Group — COMSATS University Islamabad |
| **Frontend Framework** | React 18 + TypeScript 5 + Vite 6 |
| **Styling & Motion** | Tailwind CSS + Framer Motion (`motion/react`) + HTML5 2D Canvas |
| **Brand Asset** | `https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg` (1200×675 aspect ratio preserved) |
| **Randomness Engine** | `window.crypto.getRandomValues(new Uint32Array(1))` with rejection sampling |
| **Data Integration** | Dual-mode: Google Apps Script Web App JSON endpoint + Google Visualization Query (`SELECT B, C`) read-only CSV stream |
| **Audio Engine** | Zero-dependency procedural Web Audio API synthesizer (mechanical ticks, spin whoosh, celebratory fanfare) |
| **Testing Suite** | Vitest + React Testing Library (unit & integration) + Playwright (E2E viewport & flow verification) |
