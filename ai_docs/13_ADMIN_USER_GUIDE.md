# 13 — Admin & Event Organizer User Guide
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Pre-Event Checklist

1. **Verify the Google Form & Linked Spreadsheet**:
   - Open the connected Google Sheet: `https://docs.google.com/spreadsheets/d/1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q/edit?usp=sharing`
   - Ensure the header row contains `Reg No` (Column B) and `Name` (Column C).
   - If using direct sheet sync, ensure link sharing is set to **"Anyone with the link -> Viewer"**. (Remember: only `Reg No` and `Name` are queried; `Email` is excluded at the query level and `Reg No` is hashed in memory so neither appears on screen.)
2. **Projector & Audio Check**:
   - Connect the stage laptop to the auditorium projector (`1920×1080` recommended) and room audio system.
   - Open the Lucky Draw website.
   - Click the **Fullscreen** icon in the top-right header (or press `F11`) to enter Projector Mode.
   - Click the **Sound** icon to ensure audio is unmuted.

---

## 2. Running the Live Lucky Draw

1. **Sync Latest Registrations**:
   - Once you close or pause Google Form registrations, click **"Refresh Participants"** in the top header.
   - Verify the status badge reads e.g. `"128 Participants Ready"` with a green `"Live Connected"` indicator.
2. **Spin the Wheel**:
   - Click the glowing **"SPIN THE WHEEL"** button beneath the wheel (or press `Space` / `Enter` when focused).
   - The wheel accelerates and rotates for ~6 seconds before decelerating smoothly onto the cryptographically selected winner.
3. **Announce the Winner**:
   - The **"CONGRATULATIONS!"** modal appears automatically with celebratory confetti and fanfare audio.
   - After the winner comes on stage, click **"Spin Again"** to immediately start the next draw, or **"Close"** to return to the stage view.
   - Because **"Exclude Previous Winners"** is enabled by default, the winner is automatically recorded in the **Session Winner History** and removed from the active pool for subsequent spins.

---

## 3. Using the Organizer Controls Drawer

Click the **"Organizer"** button (gear/sliders icon) in the top header to open the slide-over panel:

- **Sync Diagnostics**: View total rows scanned, unique eligible participants, duplicate `Reg No` submissions removed, and the last sync timestamp.
- **Session Winner History**: View the chronological list of winners with spin sequence numbers (`#1`, `#2`, ...) and timestamps. You can also export the session winners to a `.csv` file for event record-keeping.
- **Protected Administrative Actions (Unlock with Organizer PIN — default `2026`)**:
  - **Exclude Previous Winners Toggle**: Keep enabled (default) so each student can only win once per event, or disable if you want all participants eligible on every spin.
  - **Reset Event Session**: Clears the current session's Winner History and restores all participants to eligible status (requires confirmation).
  - **Development / Test Sandbox Mode**: If your live Google Sheet is currently empty before the event starts and you want to test the projector setup or rehearse the stage flow, you can switch to the clearly labeled **Sandbox Test Mode** (with presets for 12, 48, 128, or 500 mock participants). Switch back to **Live Google Sheet Mode** before the actual draw begins.

---

## 4. Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| `"No participants available yet. Please check the registration sheet."` | The Google Sheet currently has only the header row and 0 student submissions. | Submit a form response or verify that responses are flowing into the first sheet tab. For rehearsal, open Organizer Controls → enable **Sandbox Test Mode**. |
| Amber badge: `"Using Cached List (Sync Failed)"` | Temporary auditorium Wi-Fi drop during refresh. | You can continue spinning safely using the cached participant list! Reconnect Wi-Fi and click **Refresh Participants** when ready. |
| `"All Eligible Participants Have Won!"` | Every registered student has already been selected once in this session. | Click **"Reset Winner Eligibility"** inside the notice or Organizer Drawer to start a new round. |
