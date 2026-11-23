import { describe, expect, it } from 'vitest';
import {
  parseParticipantsFromCsv,
  processParticipantRecords,
  sanitizeStudentName,
} from '../../src/services/participantService';

describe('participantService — Google Sheets Parsing, Deduplication & Privacy', () => {
  it('trims whitespace, collapses internal spaces, and ignores blank or invalid names', () => {
    expect(sanitizeStudentName('   Areeba   Khan  \n ')).toBe('Areeba Khan');
    expect(sanitizeStudentName('   ')).toBe('');
    expect(sanitizeStudentName('---')).toBe('');
    expect(sanitizeStudentName('12345')).toBe('');
  });

  it('preserves different students who share the same Name when their Registration Numbers differ', () => {
    const csv = [
      '"Reg No","Name"',
      '"FA23-BCS-010","Muhammad Ali"',
      '"SP24-BSE-088","Muhammad Ali"',
      '"FA23-BCS-015","Zainab Tariq"',
    ].join('\n');

    const result = parseParticipantsFromCsv(csv, {
      nameColumn: 'Name',
      idColumn: 'Reg No',
    });

    expect(result.participants).toHaveLength(3);
    expect(result.diagnostics.duplicatesRemoved).toBe(0);
    expect(result.participants.filter((p) => p.name === 'Muhammad Ali')).toHaveLength(2);
    expect(result.participants[0].id).not.toBe(result.participants[1].id);
  });

  it('deduplicates repeat form submissions from the same student Registration Number (case/hyphen insensitive)', () => {
    const csv = [
      '"Timestamp","Reg No","Name","Email"',
      '"2026-11-24 10:00","FA23-BCS-042","Hamza Tariq","hamza@example.com"',
      '"2026-11-24 10:05"," fa23bcs042 ","Hamza Tariq","hamza@example.com"',
      '"2026-11-24 10:08","FA23-BCS-099","Areeba Khan","areeba@example.com"',
    ].join('\n');

    const result = parseParticipantsFromCsv(csv, {
      nameColumn: 'Name',
      idColumn: 'Reg No',
    });

    expect(result.participants).toHaveLength(2);
    expect(result.diagnostics.duplicatesRemoved).toBe(1);
    expect(result.participants.map((p) => p.name)).toEqual(['Hamza Tariq', 'Areeba Khan']);
  });

  it('never exposes raw Registration Numbers or Email addresses in participant records', () => {
    const csv = [
      '"Timestamp","Reg No","Name","Email"',
      '"2026-11-24 10:00","FA23-BCS-777","Usman Qureshi","usman.secret@comsats.edu.pk"',
    ].join('\n');

    const result = parseParticipantsFromCsv(csv);
    const serialized = JSON.stringify(result.participants);

    expect(serialized).toContain('Usman Qureshi');
    expect(serialized).not.toContain('FA23-BCS-777');
    expect(serialized).not.toContain('FA23BCS777');
    expect(serialized).not.toContain('usman.secret@comsats.edu.pk');
  });

  it('returns an empty list when the spreadsheet contains only the header row', () => {
    const csv = '"Timestamp","Reg No","Name","Email","If you could invent one AI tool, what would it do?"\r\n';
    const result = parseParticipantsFromCsv(csv);

    expect(result.participants).toHaveLength(0);
    expect(result.diagnostics.validParticipants).toBe(0);
  });

  it('handles 500+ participants and ultra-long student names gracefully', () => {
    const rows = Array.from({ length: 520 }, (_, i) => ({
      name: `Student ${i + 1} ${'A'.repeat(90)}`,
      regNo: `FA23-BCS-${i + 1}`,
    }));

    const { participants, diagnostics } = processParticipantRecords(rows);
    expect(participants).toHaveLength(520);
    expect(diagnostics.validParticipants).toBe(520);
    expect(participants[0].name.length).toBeLessThanOrEqual(80);
  });

  it('throws a clear error if Google Sheets returns a sign-in HTML page instead of CSV', () => {
    const htmlRedirect = '<!DOCTYPE html><html><head><title>Google Accounts</title></head></html>';
    expect(() => parseParticipantsFromCsv(htmlRedirect)).toThrow(/HTML login page/i);
  });
});
