# 04 — System Architecture
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart LR
    subgraph GoogleCloud["Google Workspace Layer"]
        GF["Google Form\n(Student Registration)"]
        GS["Google Spreadsheet\n1hOghDs...1ga_Q"]
        GAS["Google Apps Script\nRead-Only Web App API"]
        GF -->|Auto-Appends Row| GS
        GS -->|Read & Hash PII| GAS
    end

    subgraph AWSCloud["AWS Amplify Hosting"]
        CDN["Amazon CloudFront CDN\n(Static SPA Assets)"]
    end

    subgraph ClientBrowser["Event Stage / Client Browser"]
        PS["Participant Service\n(Adapter + Validator + Deduplicator)"]
        STATE["Lucky Draw State Hook\n(useLuckyDraw)"]
        RNG["Crypto RNG Engine\n(crypto.getRandomValues)"]
        WHEEL["HTML5 2D Canvas Wheel\n(60 FPS rAF Renderer)"]
        AUDIO["Web Audio Synthesizer\n(Procedural Sound Engine)"]
        LS["LocalStorage\n(Session Winner History)"]

        PS -->|Validated Participant[]| STATE
        STATE -->|Eligible Pool Snapshot| RNG
        RNG -->|Winner Index + Target Angle| WHEEL
        WHEEL -->|Peg Crossing & Stop Events| AUDIO
        STATE <-->|Persist History & Settings| LS
    end

    CDN -->|Serves React SPA| ClientBrowser
    GAS -->|HTTPS JSON Response| PS
    GS -->|HTTPS gviz SELECT B,C Fallback| PS
```

---

## 2. Layered Component Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # AWS Cloud Club banner lockup, live count, status pill, quick tools
│   │   ├── AmbientBackground.tsx   # Subtle purple radial glows & low-overhead floating particles
│   │   ├── ErrorBoundary.tsx       # React error boundary with graceful recovery
│   │   └── Footer.tsx              # Event attribution & privacy assurance notice
│   ├── splash/
│   │   └── SplashScreen.tsx        # 1.8s cinematic intro with prefers-reduced-motion bypass
│   ├── wheel/
│   │   ├── SpinWheelCanvas.tsx     # High-DPI 2D Canvas wheel, pointer deflection, 60fps rAF loop
│   │   └── WheelStatusBar.tsx      # Eligible vs total count, adaptive mode notice, sync timestamp
│   ├── winner/
│   │   ├── WinnerModal.tsx         # Projector-grade winner spotlight, confetti canvas, Spin Again CTA
│   │   └── ConfettiOverlay.tsx     # Lightweight particle burst on winner reveal
│   └── controls/
│       ├── OrganizerPanel.tsx      # Slide-over organizer drawer (History, Repeat Policy, Sandbox, Reset)
│       └── WinnerHistoryCard.tsx   # Live session winner feed visible alongside or below the wheel
├── hooks/
│   ├── useLuckyDraw.ts             # Core state machine: idle -> spinning -> winner_revealed
│   ├── useFullscreen.ts            # Fullscreen API wrapper with CSS theater fallback
│   └── useReducedMotion.ts         # MediaQuery listener for prefers-reduced-motion
├── services/
│   ├── participantService.ts       # Fetches, validates, sanitizes, and deduplicates Google Sheet rows
│   └── soundService.ts             # Procedural Web Audio API sound effects (tick, spin, fanfare)
├── utils/
│   ├── cryptoRandom.ts             # Rejection-sampled uniform random integer generator & angle solver
│   ├── csvParser.ts                # RFC-4180 compliant CSV parser for Google Visualization responses
│   └── storage.ts                  # Type-safe localStorage wrapper with schema validation
└── types/
    └── index.ts                    # Strict TypeScript interfaces for Participants, Winners, and Config
```

---

## 3. Key Architectural Decisions & Reasoning

### ADR-01: HTML5 2D Canvas vs. DOM/SVG for the Spin Wheel
- **Decision**: Render the wheel drum, segments, text labels, outer LED bezel, and central hub on a high-DPI HTML5 `<canvas>` driven by `requestAnimationFrame`, while keeping the surrounding UI in React + Framer Motion.
- **Reasoning**: A wheel with up to 48 visible slices rotating at 60 FPS requires zero layout thrashing. Updating a single rotation matrix inside a 2D canvas drawing context takes `< 0.4ms` per frame on integrated laptop GPUs and mobile phones, whereas animating 48+ SVG text nodes can drop frames on 4K stage projectors.

### ADR-02: Decoupling Selection Mathematics from Visual Slice Count
- **Decision**: Separate the **Eligible Selection Pool** (`eligibleParticipants: Participant[]`, unrestricted size `N`) from the **Visual Wheel Slice Array** (`displaySlices: Participant[]`, capped at `MAX_VISIBLE_SLICES = 48`).
- **Reasoning**: Guaranteeing fairness requires that participant #312 in a 500-person workshop has the exact same `1 / 500` probability as participant #1. However, drawing 500 labels simultaneously on a circle makes every label unreadable (`< 2px` tall). By selecting the winner cryptographically from all `N` eligible records first, and then constructing a 48-slice display window containing the selected winner and 47 peers when `N > 48`, we preserve 100% mathematical fairness AND 100% stage legibility.

### ADR-03: Dual-Path Google Sheets Integration (Apps Script + Direct `gviz` Query)
- **Decision**: Support a dedicated Google Apps Script Web App JSON endpoint (`VITE_PARTICIPANTS_API_URL`) as well as direct read-only Google Visualization SQL querying (`tq=SELECT B, C`) against `VITE_GOOGLE_SHEET_ID`.
- **Reasoning**:
  - The provided Google Sheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`) is configured for read-only link sharing and supports `gviz/tq?tqx=out:csv&tq=SELECT%20B%2C%20C` with browser CORS headers enabled (`Access-Control-Allow-Origin`).
  - Querying `SELECT B, C` ensures Column D (`Email`) and Column E (`AI Tool Question`) are stripped at Google's servers before leaving Google Cloud.
  - Furthermore, we include the ready-to-deploy Google Apps Script (`google-apps-script/Code.gs`) so organizers who prefer keeping the sheet completely private can publish a read-only JSON endpoint that hashes `Reg No` server-side.

### ADR-04: Zero-Asset Procedural Web Audio Synthesizer
- **Decision**: Generate wheel ticks, rotation hum, and winner celebration chords programmatically using the browser's native `AudioContext` (`OscillatorNode` + `GainNode` + `BiquadFilterNode`).
- **Reasoning**: External `.mp3` or `.wav` files can fail to buffer on congested auditorium Wi-Fi or suffer from mobile Safari audio sprite lag. Procedural Web Audio synthesis requires 0 KB of network transfer, has sub-millisecond trigger latency synced to wheel slice crossings, and never fails offline.
