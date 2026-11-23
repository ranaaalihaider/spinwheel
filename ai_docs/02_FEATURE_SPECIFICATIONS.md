# 02 — Feature Specifications
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Feature Matrix

| ID | Feature | User Role | Default State | Persistence |
|---|---|---|---|---|
| **F-01** | Cinematic Splash Screen | All Users | Active on initial load (1.8s) | In-memory session flag |
| **F-02** | Branded Header & Banner Card | All Users | Always visible | Static / Live props |
| **F-03** | Live Google Sheets Sync | All / Organizer | Auto-fetch on boot | Cached in memory + fallback |
| **F-04** | High-DPI Canvas Spin Wheel | All Users | Interactive when `eligible >= 1` | Derived from eligible pool |
| **F-05** | Adaptive Cohort Virtualization | All Users | Auto-activates when `eligible > 48` | Dynamic per spin |
| **F-06** | Winner Celebration Modal | All Users | Hidden until spin completes | Ephemeral modal state |
| **F-07** | Session Winner History | All / Organizer | Visible in sidebar / drawer | `localStorage` (`aws_sbg_winners_v1`) |
| **F-08** | Exclude Previous Winners | Organizer | **Enabled (`true`)** | `localStorage` (`aws_sbg_settings_v1`) |
| **F-09** | Procedural Web Audio Engine | All / Organizer | Unmuted (activates on first click) | `localStorage` (`aws_sbg_settings_v1`) |
| **F-10** | Fullscreen Projector Mode | Organizer | Standard windowed mode | Browser Fullscreen state |
| **F-11** | Organizer Access Gate & Reset | Organizer | Locked for destructive actions | `sessionStorage` auth state |
| **F-12** | Explicit Test/Sandbox Mode | Developer / QA | **Disabled (`false`)** in production | Ephemeral / Toggle in Organizer panel |

---

## 2. Detailed Feature Behaviors

### 2.1 Header Brand Treatment (`Banner_Cloud Club_Dark-Dn6ZGEaT.svg`)
- **Asset Analysis**: The official banner (`https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg`) is a `1200×675` (`16:9`) graphic featuring the AWS Cloud Club isometric badge surrounded by pixel-art cloud motifs on a `#161D26` dark canvas.
- **Implementation**: Because a `16:9` banner is not a square standalone icon, squeezing it into a 40×40 circle would distort or crop it. Instead:
  1. In the **Splash Screen** and **Header Brand Showcase**, the banner is rendered inside a dedicated `16:9` aspect-ratio frame (`aspect-video`) with subtle violet border lighting and zero distortion.
  2. Next to the uncropped `16:9` banner thumbnail in the header sits the clean typographic lockup:
     - Eyebrow badge: `OFFICIAL COMMUNITY EVENT`
     - Title: **AWS Student Builder Group**
     - Subtitle: **COMSATS University Islamabad**
  3. A local copy of the SVG is bundled in `/assets/Banner_Cloud_Club_Dark.svg` and referenced as an automatic fallback if the external CDN is unreachable on university Wi-Fi.

### 2.2 Participant Deduplication & Privacy Pipeline
1. **Input Columns**: The live Google Sheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`) uses headers:
   - Column A: `Timestamp`
   - Column B: `Reg No`
   - Column C: `Name`
   - Column D: `Email`
   - Column E: `If you could invent one AI tool, what would it do?`
2. **Query Filtering**: When querying Google Sheets directly via the Visualization Query endpoint, the request specifies `tq=SELECT%20B%2C%20C` so Google's servers only transmit `Reg No` and `Name`. Column D (`Email`) and Column E are never transmitted over the wire.
3. **Deduplication Policy**:
   - **Case 1 (`Reg No` present)**: Normalize `Reg No` by trimming whitespace, converting to uppercase, and removing hyphens/spaces (e.g., `FA23-BCS-042` and `fa23bcs042` normalize to `FA23BCS042`). Compute a deterministic non-reversible hash ID (`id: "reg_" + fnv1aHash(normalizedRegNo)`). If the same `Reg No` submits the form multiple times, keep the **first** valid submission and increment the `duplicatesRemoved` counter.
   - **Case 2 (Two different students with the same `Name` but different `Reg No`)**: Because deduplication keys on `Reg No` when available, both students are preserved as separate eligible entries with distinct internal IDs!
   - **Case 3 (`Reg No` missing/empty in a row)**: Fall back to a row-indexed participant key (`name_row_${rowIndex}`) or configurable name-based deduplication policy, documented clearly in the UI sync diagnostics.

### 2.3 Adaptive Wheel Visualization for Large Cohorts
- **Direct Mode (`1 <= eligible <= 48`)**: Every eligible participant is rendered as an individual wedge on the wheel.
- **Adaptive Windowed Mode (`eligible > 48`)**:
  - Rendering 500 wedges on a single circle results in 0.72° slices where text overlaps into an unreadable blur.
  - When `eligible > 48`, the selection engine still picks the winner with exact `1 / N` cryptographic probability from the **entire** `N`-participant array.
  - The visual wheel constructs a **48-slice display window** containing the cryptographically chosen winner plus 47 uniformly sampled peers from the active pool (deterministically shuffled around the wheel for that spin).
  - A subtle badge beneath the wheel informs the audience: `"Adaptive Stage View: Showing 48 of N eligible participants (All N included in cryptographic draw)"`.
  - When the wheel stops, the winning slice under the pointer always displays the exact selected winner's name clearly.

### 2.4 Organizer Panel & Access Control
- Accessible via the **"Organizer Controls"** button in the header (or keyboard shortcut `Alt+O`).
- Viewing non-destructive status (Sync diagnostics, Winner History list, Fullscreen, Sound toggle) is available immediately.
- Modifying draw policy (**Exclude Previous Winners**, **Reset Session & Winner History**, or activating **Development/Test Sandbox Mode**) can be locked/unlocked with an Organizer PIN (default `2026`, configurable via `VITE_ORGANIZER_PIN`), preventing accidental clicks during live stage operation.
