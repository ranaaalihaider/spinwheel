/**
 * ============================================================================
 * AWS Student Builder Group — COMSATS University Islamabad
 * Google Apps Script Read-Only Participant Web App API (Code.gs)
 * ============================================================================
 *
 * OPTIONAL SERVER-SIDE INTEGRATION:
 * Attach this script to the Google Sheet (Extensions -> Apps Script) and
 * deploy as a Web App (Execute as: Me, Who has access: Anyone).
 *
 * Security & Privacy Benefits:
 * - Reads the sheet server-side inside Google Workspace
 * - Hashes "Reg No" with SHA-256 on Google's servers so raw Reg No and Email
 *   never leave Google Cloud
 * - Returns read-only JSON containing only { id, name, hasDistinctId }
 */

const SHEET_ID = '1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q';
const NAME_COLUMN_HEADER = 'Name';
const REG_NO_COLUMN_HEADER = 'Reg No';

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];
    const rows = sheet.getDataRange().getDisplayValues();

    if (!rows || rows.length <= 1) {
      return createJsonResponse({
        status: 'ok',
        fetchedAt: new Date().toISOString(),
        participants: [],
      });
    }

    const headers = rows[0].map(function (h) {
      return String(h || '').trim().toLowerCase();
    });

    const nameIdx = headers.indexOf(NAME_COLUMN_HEADER.toLowerCase());
    const regIdx = headers.indexOf(REG_NO_COLUMN_HEADER.toLowerCase());

    if (nameIdx === -1) {
      return createJsonResponse({
        status: 'error',
        message: 'Name column not found in spreadsheet header.',
      });
    }

    const seenHashes = {};
    const participants = [];

    for (var i = 1; i < rows.length; i++) {
      var rawName = String(rows[i][nameIdx] || '').trim().replace(/\s+/g, ' ');
      if (!rawName) continue;

      var rawReg = regIdx !== -1 ? String(rows[i][regIdx] || '').trim().toUpperCase().replace(/[\s\-_]+/g, '') : '';
      var idKey = rawReg ? sha256Hex(rawReg) : sha256Hex('name_' + rawName.toLowerCase());

      if (seenHashes[idKey]) {
        continue;
      }
      seenHashes[idKey] = true;

      participants.push({
        id: 'reg_' + idKey.substring(0, 16),
        name: rawName.substring(0, 80),
        hasDistinctId: Boolean(rawReg),
      });
    }

    return createJsonResponse({
      status: 'ok',
      fetchedAt: new Date().toISOString(),
      participants: participants,
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err && err.message ? err.message : 'Internal Apps Script error',
    });
  }
}

function sha256Hex(input) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return digest
    .map(function (byte) {
      var v = (byte < 0 ? byte + 256 : byte).toString(16);
      return v.length === 1 ? '0' + v : v;
    })
    .join('');
}

function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
