import React from 'react';
import { Clock, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { ConnectionState, SyncDiagnostics } from '../../types';
import { MAX_VISIBLE_SLICES } from '../../utils/cryptoRandom';

interface WheelStatusBarProps {
  totalParticipants: number;
  eligibleCount: number;
  displayedSliceCount: number;
  isAdaptiveModeActive: boolean;
  lastSyncedAt: string | null;
  connectionState: ConnectionState;
  syncError: string | null;
  diagnostics: SyncDiagnostics;
}

export const WheelStatusBar: React.FC<WheelStatusBarProps> = ({
  totalParticipants,
  eligibleCount,
  displayedSliceCount,
  isAdaptiveModeActive,
  lastSyncedAt,
  connectionState,
  syncError,
  diagnostics,
}) => {
  const formattedTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Never';

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 space-y-2.5">
      {/* Stale data or connection error warning banner */}
      {(connectionState === 'stale_warning' || connectionState === 'error') && syncError && (
        <div
          role="alert"
          data-testid="sync-warning-banner"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs sm:text-sm"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">
              {connectionState === 'stale_warning'
                ? 'Refresh Failed — Preserving Last Valid Participant List: '
                : 'Google Sheets Connection Issue: '}
            </span>
            <span className="text-amber-100/90">{syncError}</span>
          </div>
        </div>
      )}

      {/* Adaptive Large-Cohort Fairness Notice */}
      {isAdaptiveModeActive && (
        <div
          data-testid="adaptive-cohort-badge"
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#8B5CF6]/15 border border-[#C4B5FD]/25 text-xs text-[#C4B5FD] text-center"
        >
          <Layers className="w-3.5 h-3.5 text-[#A855F7] shrink-0" />
          <span>
            <strong>Adaptive Stage View:</strong> Displaying {displayedSliceCount} legible segments on wheel •{' '}
            <strong>All {eligibleCount} eligible participants</strong> have an equal{' '}
            <code className="font-mono">1/{eligibleCount}</code> cryptographic chance!
          </span>
        </div>
      )}

      {/* Telemetry metadata bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-[#A9A3BE] px-3 py-2 rounded-xl bg-[#151027]/70 border border-[#C4B5FD]/10">
        <div className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
          <span>Eligible Pool:</span>
          <strong data-testid="status-eligible-count" className="text-white font-mono">
            {eligibleCount}
          </strong>
          {totalParticipants !== eligibleCount && (
            <span className="text-[#A9A3BE]">/ {totalParticipants} registered</span>
          )}
        </div>

        <span className="hidden sm:inline text-[#C4B5FD]/25">•</span>

        <div className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#C4B5FD]" />
          <span>Last Sync:</span>
          <strong data-testid="last-synced-time" className="text-white font-mono">
            {formattedTime}
          </strong>
        </div>

        {diagnostics.duplicatesRemoved > 0 && (
          <>
            <span className="hidden sm:inline text-[#C4B5FD]/25">•</span>
            <div className="inline-flex items-center gap-1 text-[#C4B5FD]">
              <span className="font-mono">{diagnostics.duplicatesRemoved}</span>
              <span>duplicate Reg No merged</span>
            </div>
          </>
        )}

        {eligibleCount > MAX_VISIBLE_SLICES && (
          <>
            <span className="hidden sm:inline text-[#C4B5FD]/25">•</span>
            <span className="text-[#C4B5FD] font-mono">
              Window: {MAX_VISIBLE_SLICES} slices
            </span>
          </>
        )}
      </div>
    </div>
  );
};
