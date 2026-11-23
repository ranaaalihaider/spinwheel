import { EventSettings, WinnerRecord } from '../types';

const WINNERS_STORAGE_KEY = 'aws_sbg_comsats_winners_v1';
const SETTINGS_STORAGE_KEY = 'aws_sbg_comsats_settings_v1';

export const DEFAULT_SETTINGS: EventSettings = {
  excludePreviousWinners: true,
  isMuted: false,
  sandboxMode: false,
  sandboxCohortSize: 24,
};

export function loadWinnerHistory(): WinnerRecord[] {
  try {
    const raw = window.localStorage.getItem(WINNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WinnerRecord =>
        item &&
        typeof item.id === 'string' &&
        typeof item.participantId === 'string' &&
        typeof item.winnerName === 'string' &&
        typeof item.selectedAt === 'string' &&
        typeof item.spinSequenceNumber === 'number'
    );
  } catch {
    return [];
  }
}

export function saveWinnerHistory(history: WinnerRecord[]): void {
  try {
    window.localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function clearWinnerHistoryStorage(): void {
  try {
    window.localStorage.removeItem(WINNERS_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function loadEventSettings(): EventSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
    return {
      excludePreviousWinners:
        typeof parsed.excludePreviousWinners === 'boolean'
          ? parsed.excludePreviousWinners
          : DEFAULT_SETTINGS.excludePreviousWinners,
      isMuted:
        typeof parsed.isMuted === 'boolean' ? parsed.isMuted : DEFAULT_SETTINGS.isMuted,
      // Always start in live mode on fresh page load unless explicitly toggled during session
      sandboxMode: false,
      sandboxCohortSize:
        parsed.sandboxCohortSize === 1 ||
        parsed.sandboxCohortSize === 2 ||
        parsed.sandboxCohortSize === 12 ||
        parsed.sandboxCohortSize === 24 ||
        parsed.sandboxCohortSize === 128 ||
        parsed.sandboxCohortSize === 500
          ? parsed.sandboxCohortSize
          : DEFAULT_SETTINGS.sandboxCohortSize,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveEventSettings(settings: EventSettings): void {
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        excludePreviousWinners: settings.excludePreviousWinners,
        isMuted: settings.isMuted,
        sandboxCohortSize: settings.sandboxCohortSize,
      })
    );
  } catch {
    // Ignore storage errors
  }
}
