# 05 — Google Sheets Integration Specification
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Connected Spreadsheet Profile

- **Spreadsheet URL**: `https://docs.google.com/spreadsheets/d/1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q/edit?usp=sharing`
- **Spreadsheet ID**: `1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`
- **Observed Schema (Row 1 Headers)**:

| Column Letter | Header Title | Purpose in Platform | Privacy Classification |
|---|---|---|---|
| **A** | `Timestamp` | Form submission timestamp | Internal metadata (Not displayed) |
| **B** | `Reg No` | Student Registration Number (e.g., `FA23-BCS-001`) | **Sensitive Identifier** (Used ONLY for deduplication hash; never displayed in UI) |
| **C** | `Name` | Student Full Name | **Public Display Field** (Rendered on wheel & winner modal) |
| **D** | `Email` | Student Email Address | **Strict PII** (Excluded from query & never fetched/stored) |
| **E** | `If you could invent one AI tool, what would it do?` | Event registration prompt response | Non-draw metadata (Excluded from query) |

---

## 2. Read-Only Data Retrieval Modes

The platform supports two production retrieval modes configured via environment variables:

### Mode A: Direct Read-Only Google Visualization Query (Default Configured)
When `VITE_GOOGLE_SHEET_ID` is configured (`1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q`), the application constructs a scoped Google Visualization API query:

```text
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&tq=SELECT%20B%2C%20C
```

**Why `tq=SELECT B, C` is critical:**
1. **Server-Side PII Filtering**: Google's server evaluates the query `SELECT B, C` before generating the HTTP response. Columns D (`Email`) and E (`Survey Response`) are never transmitted over the network.
2. **Native CORS Support**: Google's `gviz/tq` endpoint returns `Access-Control-Allow-Origin: <Requesting-Origin>` with `200 OK` and `text/csv; charset=utf-8`.
3. **Flexible Column Fallback**: If a custom spreadsheet uses different column positions, the service also supports fetching by configured column headers (`VITE_SHEET_NAME_COLUMN=Name`, `VITE_SHEET_ID_COLUMN=Reg No`) and immediately discarding all unreferenced columns during stream parsing.

### Mode B: Google Apps Script Web App / Serverless Proxy (`VITE_PARTICIPANTS_API_URL`)
For events where the Google Sheet itself is restricted to private organizer accounts only:
1. Deploy the included `google-apps-script/Code.gs` script attached to the spreadsheet.
2. Set `VITE_PARTICIPANTS_API_URL` to the deployed `https://script.google.com/macros/s/.../exec` URL.
3. The Apps Script reads the sheet server-side, hashes `Reg No` with SHA-256 so raw registration numbers never leave Google's servers, and returns a clean JSON payload:

```json
{
  "status": "ok",
  "fetchedAt": "2026-11-24T01:45:00.000Z",
  "participants": [
    { "id": "reg_8f3d9a1c", "name": "Areeba Khan", "hasDistinctId": true },
    { "id": "reg_2c7b4e90", "name": "Hamza Tariq", "hasDistinctId": true }
  ],
  "stats": {
    "totalRows": 2,
    "validParticipants": 2,
    "duplicatesRemoved": 0,
    "blankRowsIgnored": 0
  }
}
```

---

## 3. Data Validation, Normalization & Deduplication Policy

Every synchronization request runs through the deterministic pipeline in `src/services/participantService.ts`:

1. **Network & Timeout Guard**:
   - Uses `AbortController` with an 8,000ms timeout.
   - Verifies HTTP `200 OK` and validates non-HTML payload (detecting if a sheet was accidentally made private and redirected to a Google Sign-In HTML page).
2. **Field Extraction & Sanitization**:
   - Extracts `Name` and optional `Reg No`.
   - Trims leading/trailing whitespace and collapses internal runs of whitespace (`"  Ali   Haider \n "` → `"Ali Haider"`).
   - Strips control characters and enforces a reasonable display length cap (max 80 characters) while rendering exclusively via safe text primitives (never `innerHTML`).
   - Ignores header rows (`Name`, `Student Name`) and rows where the normalized name is empty or consists solely of punctuation/numbers.
3. **Deduplication Rules**:
   - **Rule 1 (Primary — Registration Number Key)**: When `Reg No` is non-empty, normalize it by converting to uppercase and stripping spaces/dashes (`"fa23-bcs-104 "` → `"FA23BCS104"`). Generate an internal anonymized hash key `id = "id_" + hash(normalizedRegNo)`.
     - If another row has the **same** normalized `Reg No`, it is treated as a duplicate submission by the same student: the first submission is kept and `duplicatesRemoved` is incremented.
     - If two rows have the **same `Name`** (e.g., `"Muhammad Ali"`) but **different `Reg No`** values (`FA23-BCS-010` vs `SP24-BSE-088`), **both students are kept** as distinct eligible participants!
   - **Rule 2 (Fallback — Missing Registration Number)**: If a row has a valid `Name` but a blank `Reg No`, the deduplication policy checks `deduplicateByNameWhenIdMissing` (default `true` for identical keyless names, or row-scoped if configured), ensuring no student is silently dropped when an ID exists.

---

## 4. Error Recovery & Stale Data Policy

- If a refresh fails due to network timeout, offline Wi-Fi, or HTTP error:
  1. If the application already holds a previously loaded valid participant list in state, **that list is preserved** so the live event is not interrupted.
  2. The connection status transitions to `"warning"` (`Stale Data — Using cached list from HH:MM:SS`) and a dismissible warning toast alerts the organizer.
  3. Stale data is **never** silently disguised as a fresh sync; the exact timestamp of the last successful sync remains prominently displayed.
- If the spreadsheet contains 0 participant rows (header only):
  1. The application enters the **Empty Sheet State**.
  2. Displays: `"No participants available yet. Please check the registration sheet."`
  3. The `"SPIN THE WHEEL"` button is disabled until participants register or the organizer explicitly enables the labeled Development/Test Sandbox in the Organizer Drawer.
