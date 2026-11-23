import React from 'react';
import { Trophy, Clock, Info, Star } from 'lucide-react';
import { WinnerRecord } from '../../types';

const WINNER_COLORS = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
];

interface WinnerHistoryCardProps {
  winners: WinnerRecord[];
  onOpenOrganizerPanel: () => void;
}

export const WinnerHistoryCard: React.FC<WinnerHistoryCardProps> = ({ winners, onOpenOrganizerPanel }) => {
  return (
    <aside
      aria-label="Session Winner History"
      className="w-full lg:w-72 xl:w-80 shrink-0 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(27,21,48,0.95), rgba(15,10,30,0.95))',
        border: '1px solid rgba(139,92,246,0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.1)',
      }}
    >
      {/* Card Header */}
      <div className="px-5 py-4" style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
      }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 15px rgba(139,92,246,0.5)' }}>
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Winner History</h2>
              <p className="text-[11px] text-violet-300/60">Current session</p>
            </div>
          </div>
          <span data-testid="winner-history-count"
            className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              color: 'white',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}>
            {winners.length}
          </span>
        </div>
      </div>

      {/* Winner List */}
      <div className="p-4">
        {winners.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-semibold text-white/70 mb-1">No winners yet</p>
            <p className="text-xs text-violet-300/50 leading-relaxed">
              Spin the wheel to announce and record your first lucky winner.
            </p>
          </div>
        ) : (
          <ul data-testid="winner-history-list" className="space-y-2 max-h-[380px] lg:max-h-[460px] overflow-y-auto pr-1">
            {winners.map((item) => {
              const colorClass = WINNER_COLORS[(item.spinSequenceNumber - 1) % WINNER_COLORS.length];
              return (
                <li key={item.id} data-testid="winner-history-item"
                  className="flex items-center gap-3 p-3 rounded-xl transition group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                  <span className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} text-white font-mono text-xs font-black flex items-center justify-center shadow-lg`}>
                    #{item.spinSequenceNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {item.spinSequenceNumber === 1 && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
                      {item.winnerName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-violet-300/50 font-mono mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(item.selectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      {item.isSandbox && (
                        <span className="px-1.5 rounded bg-amber-500/20 text-amber-300">Sandbox</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Disclaimer */}
        <div className="mt-3 pt-3 flex items-start gap-2 text-[11px] text-violet-300/40"
          style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Saved in this browser&apos;s <code className="font-mono">localStorage</code>.{' '}
            <button type="button" onClick={onOpenOrganizerPanel} className="text-violet-400 underline hover:text-violet-200">
              Manage in Organizer Panel
            </button>
          </p>
        </div>
      </div>
    </aside>
  );
};
