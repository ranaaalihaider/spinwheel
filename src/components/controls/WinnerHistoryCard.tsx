import React from 'react';
import { Trophy, Clock, Info } from 'lucide-react';
import { WinnerRecord } from '../../types';

interface WinnerHistoryCardProps {
  winners: WinnerRecord[];
  onOpenOrganizerPanel: () => void;
}

export const WinnerHistoryCard: React.FC<WinnerHistoryCardProps> = ({
  winners,
  onOpenOrganizerPanel,
}) => {
  return (
    <aside
      aria-label="Session Winner History"
      className="w-full lg:w-80 xl:w-96 shrink-0 bg-[#1B1530]/85 backdrop-blur-xl border border-[#C4B5FD]/20 rounded-2xl p-5 shadow-card-glass flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-[#C4B5FD]/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Session Winner History
            </h2>
            <p className="text-[11px] text-[#A9A3BE]">
              Current event lucky draw log
            </p>
          </div>
        </div>

        <span
          data-testid="winner-history-count"
          className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#C4B5FD]/25"
        >
          {winners.length}
        </span>
      </div>

      {winners.length === 0 ? (
        <div className="py-10 px-4 text-center">
          <Trophy className="w-8 h-8 text-[#C4B5FD]/30 mx-auto mb-2.5" />
          <p className="text-sm font-medium text-[#A9A3BE]">
            No winners selected yet
          </p>
          <p className="text-xs text-[#A9A3BE]/70 mt-1">
            Spin the wheel to announce and record your first lucky winner.
          </p>
        </div>
      ) : (
        <ul
          data-testid="winner-history-list"
          className="space-y-2.5 max-h-[340px] lg:max-h-[420px] overflow-y-auto pr-1"
        >
          {winners.map((item) => (
            <li
              key={item.id}
              data-testid="winner-history-item"
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#151027]/90 border border-[#C4B5FD]/15 hover:border-[#C4B5FD]/30 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                  #{item.spinSequenceNumber}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {item.winnerName}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A9A3BE] font-mono">
                    <Clock className="w-3 h-3 text-[#C4B5FD]" />
                    <span>
                      {new Date(item.selectedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    {item.isSandbox && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                        Sandbox
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* LocalStorage device persistence disclaimer */}
      <div className="mt-4 pt-3 border-t border-[#C4B5FD]/10 flex items-start gap-2 text-[11px] text-[#A9A3BE]/80">
        <Info className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Saved in this browser&apos;s <code className="font-mono">localStorage</code> for session resilience (not synced across separate devices).{' '}
          <button
            type="button"
            onClick={onOpenOrganizerPanel}
            className="text-[#C4B5FD] underline hover:text-white"
          >
            Manage in Organizer Panel
          </button>
        </p>
      </div>
    </aside>
  );
};
