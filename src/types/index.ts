export interface Participant {
  /**
   * Anonymized unique internal identifier (derived from one-way hash of Reg No when present,
   * or deterministic row key when Reg No is absent). Raw Reg No is never stored or displayed.
   */
  id: string;
  /**
   * Trimmed, sanitized student full name for display on the wheel and winner announcement.
   */
  name: string;
  /**
   * Indicates whether this participant record had a distinct Registration Number in the sheet.
   */
  hasDistinctId: boolean;
}

export interface SyncDiagnostics {
  totalRowsScanned: number;
  validParticipants: number;
  duplicatesRemoved: number;
  blankRowsIgnored: number;
  sourceLabel: string;
  deduplicationMode: 'registration_number_and_name_fallback' | 'name_only';
}

export type ConnectionState =
  | 'loading'
  | 'connected'
  | 'empty'
  | 'stale_warning'
  | 'error'
  | 'sandbox';

export interface ParticipantFetchResult {
  participants: Participant[];
  fetchedAt: string;
  diagnostics: SyncDiagnostics;
}

export interface WinnerRecord {
  id: string;
  participantId: string;
  winnerName: string;
  selectedAt: string;
  spinSequenceNumber: number;
  poolSizeAtDraw: number;
  isSandbox?: boolean;
}

export type DrawStatus = 'idle' | 'spinning' | 'winner_revealed';

export type SandboxCohortSize = 1 | 2 | 12 | 24 | 128 | 500;

export interface EventSettings {
  excludePreviousWinners: boolean;
  isMuted: boolean;
  sandboxMode: boolean;
  sandboxCohortSize: SandboxCohortSize;
}

export interface ActiveSpinPlan {
  winner: Participant;
  winnerPoolIndex: number;
  totalEligibleCount: number;
  displaySlices: Participant[];
  targetSliceIndex: number;
  startRotation: number;
  targetRotation: number;
  durationMs: number;
  isAdaptiveWindow: boolean;
}
