import React from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Info,
  RefreshCw,
  Star,
  Trophy,
} from 'lucide-react';
import { WinnerRecord } from '../../types';

interface WinnerHistoryCardProps {
  winners: WinnerRecord[];
  showHistory: boolean;
  isRefreshing: boolean;
  isSpinning: boolean;
  isFullscreen: boolean;
  onToggleHistory: (show: boolean) => void;
  onRefresh: () => void;
  onToggleFullscreen: () => void;
  onOpenOrganizerPanel: () => void;
}

export const WinnerHistoryCard: React.FC<WinnerHistoryCardProps> = ({
  winners,
  showHistory,
  isRefreshing,
  isSpinning,
  isFullscreen,
  onToggleHistory,
  onRefresh,
  onToggleFullscreen,
  onOpenOrganizerPanel,
}) => {
  return (
    <aside
      aria-label="Lucky Draw Information & Winner History"
      className="relative w-full rounded-[26px] overflow-hidden"
      style={{
        background:
          'linear-gradient(155deg, rgba(28,18,62,0.82) 0%, rgba(16,10,38,0.88) 55%, rgba(20,12,46,0.84) 100%)',
        border: '1px solid rgba(216,180,254,0.24)',
        backdropFilter: 'blur(22px)',
        boxShadow:
          '0 24px 60px rgba(4,2,14,0.68), 0 0 38px rgba(139,92,246,0.14), inset 0 1px 0 rgba(253,230,138,0.22)',
      }}
    >
      {/* Subtle warm golden top-right edge gleam (matching reference) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.65) 0%, transparent 70%)',
        }}
      />

      {/* Card Header */}
      <div className="relative px-6 pt-6 pb-4 border-b border-purple-300/15">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  'linear-gradient(145deg, rgba(251,191,36,0.22) 0%, rgba(217,119,6,0.12) 100%)',
                border: '1px solid rgba(253,230,138,0.35)',
                boxShadow: '0 0 18px rgba(245,158,11,0.28)',
              }}
            >
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight leading-none">
                <span className="text-white">Lucky </span>
                <span className="bg-gradient-to-r from-[#C084FC] to-[#8B5CF6] bg-clip-text text-transparent">
                  Draw
                </span>
              </h3>
              <p className="text-[11px] text-[#B4ADC9] mt-1">
                {showHistory ? 'Session Winner History' : 'AWS Event Platform'}
              </p>
            </div>
          </div>

          {/* Persistent winner count pill (always mounted for quick visibility & testing) */}
          <button
            type="button"
            onClick={() => onToggleHistory(!showHistory)}
            title={showHistory ? 'Back to Lucky Draw overview' : 'View recorded winners'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition hover:brightness-110"
            style={{
              background:
                winners.length > 0
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(139,92,246,0.3))'
                  : 'rgba(139,92,246,0.18)',
              border:
                winners.length > 0
                  ? '1px solid rgba(253,230,138,0.4)'
                  : '1px solid rgba(196,181,253,0.25)',
              color: winners.length > 0 ? '#FEF08A' : '#DDD6FE',
            }}
          >
            <Trophy className="w-3 h-3" />
            <span data-testid="winner-history-count">{winners.length}</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative p-6 space-y-5">
        {!showHistory ? (
          <>
            {/* Feature Checklist (matching design reference) */}
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3 text-purple-50/95 font-medium">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
                <span>Live Participant List</span>
              </li>

              <li className="flex items-center gap-3 text-purple-50/95 font-medium">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
                <span>Fair &amp; Random Selection</span>
              </li>

              <li className="flex items-center gap-3 text-purple-50/95 font-medium">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
                <span>Winner History</span>
              </li>

              <li>
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  className="w-full flex items-center gap-3 text-purple-50/95 hover:text-white font-medium text-left group transition"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-105 transition">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </span>
                  <span className="flex-1">
                    {isFullscreen ? 'Exit Fullscreen Mode' : 'Fullscreen Event Mode'}
                  </span>
                </button>
              </li>
            </ul>

            {/* Compact Latest Winner Preview if winners exist */}
            {winners.length > 0 && (
              <div
                className="px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(245,158,11,0.08))',
                  border: '1px solid rgba(253,230,138,0.22)',
                }}
              >
                <div className="min-w-0">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-200/80">
                    Latest Winner #{winners[0].spinSequenceNumber}
                  </span>
                  <p className="text-sm font-bold text-white truncate">{winners[0].winnerName}</p>
                </div>
                <Star className="w-4 h-4 text-amber-300 shrink-0" />
              </div>
            )}

            {/* Two Sleek Pill Action Buttons (matching reference) */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                data-testid="view-winner-history-btn"
                onClick={() => onToggleHistory(true)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-white transition group hover:border-purple-300/45 hover:bg-purple-500/15"
                style={{
                  background: 'rgba(14,9,32,0.72)',
                  border: '1px solid rgba(196,181,253,0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="truncate">View Winner History</span>
                </span>
                <ChevronRight className="w-4 h-4 text-purple-300/75 group-hover:translate-x-0.5 transition shrink-0" />
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={isSpinning || isRefreshing}
                aria-label="Refresh Participants"
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-white transition group hover:border-purple-300/45 hover:bg-purple-500/15 disabled:opacity-45 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(14,9,32,0.72)',
                  border: '1px solid rgba(196,181,253,0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <RefreshCw
                    className={`w-4 h-4 text-purple-300 shrink-0 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="truncate">
                    {isRefreshing ? 'Syncing Participants...' : 'Refresh Participants'}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-purple-300/75 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            </div>
          </>
        ) : (
          /* WINNER HISTORY VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onToggleHistory(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </button>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isSpinning || isRefreshing}
                aria-label="Refresh Participants"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-white disabled:opacity-45 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {winners.length === 0 ? (
              <div className="py-7 px-3 text-center rounded-2xl bg-[#0D0820]/60 border border-purple-300/15">
                <Trophy className="w-8 h-8 text-amber-300/50 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-white/85 mb-1">No winners yet</p>
                <p className="text-xs text-[#B4ADC9] leading-relaxed">
                  Spin the wheel to announce and record your first lucky winner.
                </p>
              </div>
            ) : (
              <ul
                data-testid="winner-history-list"
                className="space-y-2 max-h-[260px] overflow-y-auto pr-1"
              >
                {winners.map((item) => (
                  <li
                    key={item.id}
                    data-testid="winner-history-item"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0D0820]/70 border border-purple-300/15"
                  >
                    <span
                      className="shrink-0 w-8 h-8 rounded-lg font-mono text-xs font-black flex items-center justify-center text-white"
                      style={{
                        background:
                          item.spinSequenceNumber === 1
                            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                            : 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      }}
                    >
                      #{item.spinSequenceNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {item.spinSequenceNumber === 1 && (
                          <Star className="w-3 h-3 text-amber-300 shrink-0" />
                        )}
                        {item.winnerName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#B4ADC9] font-mono mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(item.selectedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                        {item.isSandbox && (
                          <span className="px-1.5 rounded bg-amber-500/20 text-amber-200">
                            Sandbox
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Local storage note & Organizer shortcut */}
            <div className="pt-3 border-t border-purple-300/15 flex items-start gap-2 text-[11px] text-[#B4ADC9]/80">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-300/70" />
              <p>
                Saved in this browser&apos;s <code className="font-mono">localStorage</code>.{' '}
                <button
                  type="button"
                  onClick={onOpenOrganizerPanel}
                  className="text-purple-300 underline hover:text-white"
                >
                  Manage in Organizer Panel
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
