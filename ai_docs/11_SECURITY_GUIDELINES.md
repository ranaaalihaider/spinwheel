# 11 — Security & Privacy Guidelines
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Data Privacy & PII Protection

University event registrations collected via Google Forms often contain personal student data (`Reg No`, `Email`, phone numbers, or free-text answers). Because the lucky draw wheel is projected onto a large screen in front of hundreds of attendees, strict PII minimization is enforced:

1. **Query-Level Column Restriction**:
   - The live spreadsheet (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`) contains columns: `Timestamp` (A), `Reg No` (B), `Name` (C), `Email` (D), and `AI Tool Survey` (E).
   - Our Google Visualization query explicitly requests `tq=SELECT%20B%2C%20C`. Google's servers strip `Email` (Column D) and `Survey` (Column E) before the response leaves Google Cloud.
2. **One-Way Identifier Hashing**:
   - Student registration numbers (`Reg No`) are used exclusively to distinguish different students who share the same name and to deduplicate repeat submissions by the same student.
   - Immediately upon parsing, `Reg No` is normalized and passed through a one-way hash function (`id: "reg_" + hash`). Raw registration numbers are never stored in React state, never persisted to `localStorage`, and never rendered in the DOM or Canvas.
3. **Read-Only Access**:
   - Both the `gviz` query endpoint and the Google Apps Script Web App (`doGet`) are strictly read-only (`GET`). The frontend application has zero write permissions to the Google Spreadsheet.

---

## 2. Frontend & Application Security Controls

### 2.1 XSS & Injection Prevention
- Student names retrieved from Google Sheets are treated as untrusted user input.
- Control characters (`\x00-\x1F`, `\x7F`) are stripped during normalization.
- All names are rendered solely through React text bindings (`{participant.name}`) and HTML5 Canvas `ctx.fillText(name, x, y)`.
- `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, and `eval()` are strictly prohibited across the entire codebase.

### 2.2 Secrets & Credential Hygiene
- **Zero Secrets in Bundle**: No Google service-account private keys, OAuth client secrets, or GitHub Personal Access Tokens are stored in source files, `.env` files committed to Git, or build artifacts.
- **Git History Protection**: `.gitignore` blocks `.env`, `.env.local`, `.env.*.local`, and temporary credential files.

### 2.3 Administrative Operation Protection
- Destructive or policy-changing organizer actions inside the Organizer Drawer (**Reset Event Session**, **Toggle Repeat Winner Policy**, **Enable/Disable Sandbox Test Data**) are protected by an Organizer PIN gate (default `2026`, configurable via `VITE_ORGANIZER_PIN`).
- A prominent architectural note in the Organizer Drawer explains that client-side `localStorage` history and PIN gating are designed for single-operator stage projection laptops; multi-operator remote draws should pair the frontend with an authenticated serverless session store.

### 2.4 Transport & Content Security
- All external endpoints (`https://docs.google.com`, `https://script.google.com`, `https://builder.aws.com`) use HTTPS exclusively.
- API requests enforce an 8-second timeout via `AbortController` and client-side rate-limit throttling (minimum cooldown between manual refreshes) to prevent accidental request flooding.
