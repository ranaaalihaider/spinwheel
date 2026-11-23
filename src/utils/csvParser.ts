/**
 * RFC-4180 compliant CSV parser supporting quoted fields, escaped double-quotes (""),
 * embedded commas, and CRLF / LF line breaks.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  const length = csvText.length;
  for (let i = 0; i < length; i++) {
    const char = csvText[i];
    const nextChar = i + 1 < length ? csvText[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\r') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        if (nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
      } else if (char === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push trailing cell/row if non-empty
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}
