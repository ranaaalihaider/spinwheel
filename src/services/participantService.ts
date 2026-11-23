import { Participant, ParticipantFetchResult, SyncDiagnostics } from '../types';
import { parseCsvRows } from '../utils/csvParser';

export const DEFAULT_GOOGLE_SHEET_ID = '1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q';

export interface ParticipantServiceConfig {
  sheetId?: string;
  apiUrl?: string;
  nameColumn?: string;
  idColumn?: string;
  timeoutMs?: number;
  deduplicateByNameWhenIdMissing?: boolean;
}

/**
 * Fast, deterministic non-reversible 64-bit-inspired FNV-1a hash (hex string)
 * used to anonymize student Registration Numbers in memory so raw Reg No
 * is never exposed in React state, DOM, or localStorage.
 */
export function hashIdentifier(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code ^ (i & 0xff);
    h2 = Math.imul(h2, 0x811c9dc5);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `reg_${hex1}${hex2}`;
}

/**
 * Cleans and normalizes a participant display name:
 * - Strips ASCII control characters
 * - Trims leading/trailing whitespace
 * - Collapses multiple internal spaces into a single space
 * - Caps length at 80 characters
 */
export function sanitizeStudentName(rawName: unknown): string {
  if (typeof rawName !== 'string') return '';
  const cleaned = rawName
    .replace(/[\x00-\x1F\x7F]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleaned) return '';
  // Reject strings that contain zero alphabetic characters (e.g. "---", "12345")
  if (!/[a-zA-Z\u00C0-\u024F\u0600-\u06FF]/.test(cleaned)) {
    return '';
  }
  return cleaned.slice(0, 80);
}

/**
 * Normalizes a student registration number (e.g. " fa23-bcs-042 " -> "FA23BCS042")
 * for consistent deduplication across formatting variations.
 */
export function normalizeRegistrationNumber(rawRegNo: unknown): string {
  if (typeof rawRegNo !== 'string' && typeof rawRegNo !== 'number') return '';
  const str = String(rawRegNo).trim().toUpperCase();
  // Remove spaces, hyphens, underscores, slashes
  const compact = str.replace(/[\s\-_/\\.,]+/g, '');
  // Ignore placeholder values like "NA", "N/A", "NONE", "NIL", "-"
  if (!compact || ['NA', 'NONE', 'NIL', 'NULL', '0'].includes(compact)) {
    return '';
  }
  return compact;
}

export interface RawParticipantRow {
  name?: unknown;
  regNo?: unknown;
}

/**
 * Validates, sanitizes, and deduplicates an array of raw participant rows.
 * Policy:
 * 1. If a row has a valid Registration Number (`regNo`), deduplicate by normalized `regNo`.
 *    Two different students who share the exact same name (e.g. "Muhammad Ali") but have
 *    different Registration Numbers ("FA23-BCS-001" vs "FA23-BCS-099") are BOTH kept!
 * 2. If a row does not have a Registration Number, deduplicate by lowercase normalized name
 *    (when `deduplicateByNameWhenIdMissing` is true, default) or assign a row-level ID.
 */
export function processParticipantRecords(
  rawRows: RawParticipantRow[],
  options: {
    sourceLabel?: string;
    deduplicateByNameWhenIdMissing?: boolean;
  } = {}
): {
  participants: Participant[];
  diagnostics: SyncDiagnostics;
} {
  const {
    sourceLabel = 'Google Sheets Live Sync',
    deduplicateByNameWhenIdMissing = true,
  } = options;

  const seenRegHashes = new Set<string>();
  const seenKeylessNames = new Set<string>();
  const participants: Participant[] = [];

  let blankRowsIgnored = 0;
  let duplicatesRemoved = 0;
  let anyRegNoFound = false;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const cleanName = sanitizeStudentName(row?.name);

    if (!cleanName) {
      blankRowsIgnored++;
      continue;
    }

    const normalizedReg = normalizeRegistrationNumber(row?.regNo);

    if (normalizedReg) {
      anyRegNoFound = true;
      const hashedId = hashIdentifier(normalizedReg);
      if (seenRegHashes.has(hashedId)) {
        duplicatesRemoved++;
        continue;
      }
      seenRegHashes.add(hashedId);
      participants.push({
        id: hashedId,
        name: cleanName,
        hasDistinctId: true,
      });
    } else {
      const lowerName = cleanName.toLowerCase();
      if (deduplicateByNameWhenIdMissing) {
        if (seenKeylessNames.has(lowerName)) {
          duplicatesRemoved++;
          continue;
        }
        seenKeylessNames.add(lowerName);
      }
      participants.push({
        id: `name_${hashIdentifier(`${lowerName}_${deduplicateByNameWhenIdMissing ? 'uniq' : i}`)}`,
        name: cleanName,
        hasDistinctId: false,
      });
    }
  }

  return {
    participants,
    diagnostics: {
      totalRowsScanned: rawRows.length,
      validParticipants: participants.length,
      duplicatesRemoved,
      blankRowsIgnored,
      sourceLabel,
      deduplicationMode: anyRegNoFound
        ? 'registration_number_and_name_fallback'
        : 'name_only',
    },
  };
}

/**
 * Parses CSV text from Google Sheets and extracts only the configured Name and Registration Number
 * columns, discarding Email and all other personal data columns immediately.
 */
export function parseParticipantsFromCsv(
  csvText: string,
  config: {
    nameColumn?: string;
    idColumn?: string;
    sourceLabel?: string;
    deduplicateByNameWhenIdMissing?: boolean;
  } = {}
): ParticipantFetchResult {
  const trimmedText = csvText.trim();

  // Guard against Google Sign-In HTML redirect when a sheet is private
  if (
    trimmedText.startsWith('<!DOCTYPE html') ||
    trimmedText.startsWith('<html') ||
    trimmedText.includes('accounts.google.com/ServiceLogin')
  ) {
    throw new Error(
      'Google Sheet returned an HTML login page instead of participant data. Ensure link sharing is set to read-only viewer or configure a Google Apps Script Web App URL.'
    );
  }

  const allRows = parseCsvRows(trimmedText);
  if (allRows.length === 0) {
    return {
      participants: [],
      fetchedAt: new Date().toISOString(),
      diagnostics: {
        totalRowsScanned: 0,
        validParticipants: 0,
        duplicatesRemoved: 0,
        blankRowsIgnored: 0,
        sourceLabel: config.sourceLabel || 'Google Sheets Live Sync',
        deduplicationMode: 'registration_number_and_name_fallback',
      },
    };
  }

  const targetNameCol = (config.nameColumn || 'Name').trim().toLowerCase();
  const targetIdCol = (config.idColumn || 'Reg No').trim().toLowerCase();

  const headerRow = allRows[0].map((col) => col.trim().toLowerCase());

  // Locate Name column index
  let nameIdx = headerRow.findIndex((h) => h === targetNameCol);
  if (nameIdx === -1) {
    nameIdx = headerRow.findIndex((h) =>
      ['name', 'student name', 'full name', 'participant name', 'student full name'].some(
        (alias) => h === alias || h.includes(alias)
      )
    );
  }

  // Locate Reg No / Student ID column index
  let idIdx = headerRow.findIndex((h) => h === targetIdCol);
  if (idIdx === -1) {
    idIdx = headerRow.findIndex((h) =>
      [
        'reg no',
        'regno',
        'registration number',
        'registration no',
        'roll no',
        'student id',
        'cms id',
      ].some((alias) => h === alias || h.includes(alias))
    );
  }

  // Determine whether row 0 is actually a header row
  const hasRecognizedHeader = nameIdx !== -1 || idIdx !== -1;

  // Fallback column indices if headers are custom single/dual column without standard label
  if (nameIdx === -1) {
    nameIdx = allRows[0].length >= 3 ? 2 : allRows[0].length === 2 ? 1 : 0;
  }

  const dataRows = hasRecognizedHeader ? allRows.slice(1) : allRows;

  const rawRecords: RawParticipantRow[] = dataRows.map((cols) => ({
    name: nameIdx >= 0 && nameIdx < cols.length ? cols[nameIdx] : '',
    regNo: idIdx >= 0 && idIdx < cols.length && idIdx !== nameIdx ? cols[idIdx] : '',
  }));

  const { participants, diagnostics } = processParticipantRecords(rawRecords, {
    sourceLabel: config.sourceLabel || 'Google Sheets Live Sync',
    deduplicateByNameWhenIdMissing: config.deduplicateByNameWhenIdMissing,
  });

  return {
    participants,
    fetchedAt: new Date().toISOString(),
    diagnostics,
  };
}

/**
 * Fetches live eligible participants from the configured Google Apps Script endpoint
 * or directly from the connected Google Spreadsheet via scoped Google Visualization query.
 */
export async function fetchLiveParticipants(
  customConfig: ParticipantServiceConfig = {}
): Promise<ParticipantFetchResult> {
  const envSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID as string | undefined;
  const envApiUrl = import.meta.env.VITE_PARTICIPANTS_API_URL as string | undefined;
  const envNameCol = import.meta.env.VITE_SHEET_NAME_COLUMN as string | undefined;
  const envIdCol = import.meta.env.VITE_SHEET_ID_COLUMN as string | undefined;

  const sheetId = (customConfig.sheetId ?? envSheetId ?? DEFAULT_GOOGLE_SHEET_ID).trim();
  const apiUrl = (customConfig.apiUrl ?? envApiUrl ?? '').trim();
  const nameColumn = (customConfig.nameColumn ?? envNameCol ?? 'Name').trim();
  const idColumn = (customConfig.idColumn ?? envIdCol ?? 'Reg No').trim();
  const timeoutMs = customConfig.timeoutMs ?? 8000;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Mode 1: Dedicated Google Apps Script Web App or Serverless API Endpoint
    if (apiUrl) {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/csv, text/plain' },
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Participant API responded with HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        const payload = JSON.parse(rawText);
        const rowsArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.participants)
          ? payload.participants
          : Array.isArray(payload?.data)
          ? payload.data
          : null;

        if (!rowsArray) {
          throw new Error('Malformed JSON payload from Participant API');
        }

        const rawRecords: RawParticipantRow[] = rowsArray.map((item: Record<string, unknown>) => ({
          name: item.name ?? item[nameColumn] ?? item.studentName ?? '',
          regNo: item.id ?? item.regNo ?? item[idColumn] ?? item.registrationNumber ?? '',
        }));

        const { participants, diagnostics } = processParticipantRecords(rawRecords, {
          sourceLabel: 'Google Apps Script API',
          deduplicateByNameWhenIdMissing: customConfig.deduplicateByNameWhenIdMissing,
        });

        return {
          participants,
          fetchedAt: new Date().toISOString(),
          diagnostics,
        };
      }

      return parseParticipantsFromCsv(rawText, {
        nameColumn,
        idColumn,
        sourceLabel: 'Participant API (CSV)',
        deduplicateByNameWhenIdMissing: customConfig.deduplicateByNameWhenIdMissing,
      });
    }

    // Mode 2: Scoped Read-Only Google Visualization Query against the Event Spreadsheet
    if (!sheetId) {
      throw new Error('No Google Sheet ID or Participant API URL configured.');
    }

    // For the official event sheet (Cols: A=Timestamp, B=Reg No, C=Name, D=Email, E=Survey),
    // SELECT B, C ensures Email (Col D) and Survey (Col E) are excluded at the Google server level.
    const isDefaultSchema =
      sheetId === DEFAULT_GOOGLE_SHEET_ID &&
      nameColumn.toLowerCase() === 'name' &&
      idColumn.toLowerCase() === 'reg no';

    const queryParam = isDefaultSchema ? '&tq=SELECT%20B%2C%20C' : '';
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
      sheetId
    )}/gviz/tq?tqx=out:csv${queryParam}`;

    const response = await fetch(gvizUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Google Sheets sync failed with HTTP ${response.status}`);
    }

    const csvText = await response.text();
    return parseParticipantsFromCsv(csvText, {
      nameColumn,
      idColumn,
      sourceLabel: 'Google Sheets Live Sync',
      deduplicateByNameWhenIdMissing: customConfig.deduplicateByNameWhenIdMissing,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Connection timed out while fetching participants from Google Sheets.');
    }
    throw err instanceof Error ? err : new Error('Failed to synchronize participants.');
  } finally {
    window.clearTimeout(timer);
  }
}
