import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FlaskConical,
  KeyRound,
  Lock,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  EventSettings,
  SandboxCohortSize,
  SyncDiagnostics,
  WinnerRecord,
} from '../../types';
import { DEFAULT_GOOGLE_SHEET_ID } from '../../services/participantService';

interface OrganizerPanelProps {
  isOpen: boolean;
  settings: EventSettings;
  diagnostics: SyncDiagnostics;
  totalParticipants: number;
  eligibleCount: number;
  winnerHistory: WinnerRecord[];
  isRefreshing: boolean;
  isSpinning: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onSetExcludePreviousWinners: (exclude: boolean) => void;
  onSetSandboxMode: (enabled: boolean, size?: SandboxCohortSize) => void;
  onResetSession: () => void;
}

const DEFAULT_ORGANIZER_PIN =
  (import.meta.env.VITE_ORGANIZER_PIN as string | undefined) || '2026';

const SANDBOX_SIZES: SandboxCohortSize[] = [1, 2, 12, 24, 128, 500];

export const OrganizerPanel: React.FC<OrganizerPanelProps> = ({
  isOpen,
  settings,
  diagnostics,
  totalParticipants,
  eligibleCount,
  winnerHistory,
  isRefreshing,
  isSpinning,
  isFullscreen,
  onClose,
  onRefresh,
  onToggleMute,
  onToggleFullscreen,
  onSetExcludePreviousWinners,
  onSetSandboxMode,
  onResetSession,
}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_ORGANIZER_PIN) {
      setIsAuthorized(true);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Incorrect Organizer PIN. Default event PIN is 2026.');
    }
  };

  const handleConfirmReset = () => {
    onResetSession();
    setConfirmingReset(false);
  };

  const handleExportCsv = () => {
    if (winnerHistory.length === 0) return;
    const header = 'Spin Sequence,Winner Name,Selected At,Pool Size,Mode\n';
    const rows = winnerHistory
      .slice()
      .reverse()
      .map(
        (w) =>
          `${w.spinSequenceNumber},"${w.winnerName.replace(/"/g, '""')}",${w.selectedAt},${
            w.poolSizeAtDraw
          },${w.isSandbox ? 'Sandbox' : 'Live'}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aws-sbg-comsats-winners-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Organizer Controls Panel"
      data-testid="organizer-panel"
      className="fixed inset-0 z-40 flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#090714]/75 backdrop-blur-sm"
      />

      {/* Drawer Content */}
      <div className="relative z-10 w-full max-w-md bg-[#151027] border-l border-[#C4B5FD]/25 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#C4B5FD]/15">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4B5FD] px-2 py-0.5 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/35">
                Event Administration
              </span>
              <h2 className="text-lg font-extrabold text-white mt-1">
                Organizer Controls
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Organizer Controls"
              className="p-2 rounded-xl bg-[#1B1530] hover:bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#C4B5FD]/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Quick Presentation & Sync Controls */}
          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#C4B5FD]">
              Stage & Synchronization
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isSpinning || isRefreshing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1B1530] hover:bg-[#8B5CF6]/25 text-white text-xs font-semibold border border-[#C4B5FD]/20 transition disabled:opacity-45"
              >
                <RefreshCw className={`w-4 h-4 text-[#C4B5FD] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Sheet</span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1B1530] hover:bg-[#8B5CF6]/25 text-white text-xs font-semibold border border-[#C4B5FD]/20 transition"
              >
                {settings.isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-300" />
                    <span>Sound: Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-300" />
                    <span>Sound: Active</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleFullscreen}
                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1B1530] hover:bg-[#8B5CF6]/25 text-white text-xs font-semibold border border-[#C4B5FD]/20 transition"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-[#C4B5FD]" />
                    <span>Exit Fullscreen Projector Mode</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-[#C4B5FD]" />
                    <span>Enter Fullscreen Projector Mode</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 2. Data Source & Sync Diagnostics */}
          <section className="p-4 rounded-2xl bg-[#1B1530] border border-[#C4B5FD]/15 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Google Sheet Diagnostics</span>
              <span className="font-mono text-[11px] text-[#C4B5FD]">
                ID: ...{DEFAULT_GOOGLE_SHEET_ID.slice(-8)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[#A9A3BE]">
              <div className="p-2 rounded-lg bg-[#151027]">
                <span className="block text-[10px] uppercase">Total Registered</span>
                <strong className="text-sm font-mono text-white">{totalParticipants}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[#151027]">
                <span className="block text-[10px] uppercase">Currently Eligible</span>
                <strong className="text-sm font-mono text-emerald-300">{eligibleCount}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[#151027]">
                <span className="block text-[10px] uppercase">Duplicates Merged</span>
                <strong className="text-sm font-mono text-[#C4B5FD]">
                  {diagnostics.duplicatesRemoved}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-[#151027]">
                <span className="block text-[10px] uppercase">Blank Rows Ignored</span>
                <strong className="text-sm font-mono text-[#A9A3BE]">
                  {diagnostics.blankRowsIgnored}
                </strong>
              </div>
            </div>
            <p className="text-[11px] text-[#A9A3BE] leading-relaxed pt-1">
              Deduplication uses student <code className="font-mono">Reg No</code> hashes so different students sharing identical names remain separate entries while PII (<code className="font-mono">Reg No</code>, <code className="font-mono">Email</code>) is never displayed.
            </p>
          </section>

          {/* 3. Protected Organizer Draw Policies & Reset */}
          <section className="p-4 rounded-2xl bg-[#1B1530] border border-[#C4B5FD]/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAuthorized ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-300" />
                )}
                <h3 className="text-xs font-mono uppercase tracking-wider text-white">
                  Administrative Draw Controls
                </h3>
              </div>
              {isAuthorized && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthorized(false);
                    setConfirmingReset(false);
                  }}
                  className="text-[11px] text-[#C4B5FD] hover:underline"
                >
                  Lock
                </button>
              )}
            </div>

            {!isAuthorized ? (
              <form onSubmit={handleUnlock} className="space-y-2.5">
                <p className="text-xs text-[#A9A3BE]">
                  Enter the Organizer PIN to modify repeat-winner exclusion, reset session history, or toggle rehearsal sandbox data.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-[#A9A3BE] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      data-testid="organizer-pin-input"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Organizer PIN (e.g. 2026)"
                      aria-label="Organizer PIN"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090714] border border-[#C4B5FD]/25 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <button
                    type="submit"
                    data-testid="organizer-pin-unlock-btn"
                    className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#A855F7] text-white text-xs font-bold transition"
                  >
                    Unlock
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-rose-400">{pinError}</p>
                )}
              </form>
            ) : (
              <div className="space-y-4">
                {/* Exclude Previous Winners Toggle */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#151027] border border-[#C4B5FD]/15">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <UserCheck className="w-4 h-4 text-[#A855F7]" />
                      <span>Exclude Previous Winners</span>
                    </div>
                    <p className="text-[11px] text-[#A9A3BE] mt-0.5">
                      Prevent the same participant from winning twice in this session
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.excludePreviousWinners}
                    data-testid="toggle-exclude-winners"
                    disabled={isSpinning}
                    onClick={() =>
                      onSetExcludePreviousWinners(!settings.excludePreviousWinners)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      settings.excludePreviousWinners ? 'bg-[#8B5CF6]' : 'bg-[#090714]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        settings.excludePreviousWinners ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Development / Test Sandbox Mode (Explicitly Identified) */}
                <div className="p-3 rounded-xl bg-[#151027] border border-amber-400/25 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                      <FlaskConical className="w-4 h-4 text-amber-400" />
                      <span>Development / Test Sandbox Mode</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.sandboxMode}
                      data-testid="toggle-sandbox-mode"
                      disabled={isSpinning}
                      onClick={() => onSetSandboxMode(!settings.sandboxMode)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        settings.sandboxMode ? 'bg-amber-500' : 'bg-[#090714]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          settings.sandboxMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#A9A3BE]">
                    Use explicitly labeled mock participants to rehearse stage audio & test large cohorts (100+ / 500+) without modifying the live Google Sheet.
                  </p>
                  {settings.sandboxMode && (
                    <div className="pt-1">
                      <span className="block text-[10px] font-mono uppercase text-amber-300 mb-1.5">
                        Select Sandbox Cohort Size:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {SANDBOX_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            data-testid={`sandbox-size-${size}`}
                            disabled={isSpinning}
                            onClick={() => onSetSandboxMode(true, size)}
                            className={`py-1.5 px-2 rounded-lg font-mono text-xs font-bold border transition ${
                              settings.sandboxCohortSize === size
                                ? 'bg-amber-500/25 text-amber-200 border-amber-400'
                                : 'bg-[#090714] text-[#A9A3BE] border-[#C4B5FD]/15 hover:text-white'
                            }`}
                          >
                            {size} {size === 1 ? 'Student' : 'Students'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Session & Winner History */}
                <div className="pt-2 border-t border-[#C4B5FD]/15">
                  {!confirmingReset ? (
                    <button
                      type="button"
                      data-testid="initiate-reset-btn"
                      disabled={isSpinning || winnerHistory.length === 0}
                      onClick={() => setConfirmingReset(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Event Session & Winner History</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-2.5">
                      <p className="text-xs text-rose-200 font-medium">
                        Are you sure? This will clear all {winnerHistory.length} recorded winners and restore full eligibility.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          data-testid="confirm-reset-btn"
                          onClick={handleConfirmReset}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingReset(false)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#1B1530] text-[#C4B5FD] text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 4. Winner History & CSV Export inside Drawer */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#C4B5FD]">
                Recorded Winners ({winnerHistory.length})
              </h3>
              {winnerHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {winnerHistory.length === 0 ? (
              <p className="text-xs text-[#A9A3BE] p-3 rounded-xl bg-[#1B1530]/60 border border-[#C4B5FD]/10">
                No winners recorded in the current session.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {winnerHistory.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B1530] border border-[#C4B5FD]/15 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[#C4B5FD]">#{w.spinSequenceNumber}</span>
                      <span className="font-bold text-white truncate">{w.winnerName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A9A3BE] shrink-0">
                      {new Date(w.selectedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer note */}
        <div className="mt-6 pt-4 border-t border-[#C4B5FD]/15 flex items-start gap-2 text-[11px] text-[#A9A3BE]">
          <ShieldCheck className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <p>
            Session state is persisted locally for the stage projection device. For multi-device distributed draws, pair with a server-authorized history API.
          </p>
        </div>
      </div>
    </div>
  );
};
