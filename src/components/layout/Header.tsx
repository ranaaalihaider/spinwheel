import React, { useState } from 'react';
import {
  Maximize2, Minimize2, RefreshCw, SlidersHorizontal, Users,
  Volume2, VolumeX, Wifi, WifiOff, AlertCircle, FlaskConical, Zap,
} from 'lucide-react';
import { ConnectionState } from '../../types';

export const REMOTE_BANNER_URL = 'https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg';
export const LOCAL_BANNER_URL = '/assets/Banner_Cloud_Club_Dark.svg';

interface HeaderProps {
  totalParticipants: number;
  eligibleCount: number;
  connectionState: ConnectionState;
  isRefreshing: boolean;
  isSpinning: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  winnerCount: number;
  onRefresh: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenOrganizerPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalParticipants, eligibleCount, connectionState, isRefreshing, isSpinning,
  isMuted, isFullscreen, winnerCount,
  onRefresh, onToggleMute, onToggleFullscreen, onOpenOrganizerPanel,
}) => {
  const [bannerSrc, setBannerSrc] = useState(REMOTE_BANNER_URL);
  const [bannerFailed, setBannerFailed] = useState(false);

  const handleBannerError = () => {
    if (bannerSrc === REMOTE_BANNER_URL) setBannerSrc(LOCAL_BANNER_URL);
    else setBannerFailed(true);
  };

  const statusBadge = () => {
    switch (connectionState) {
      case 'connected': return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi className="w-3 h-3" /> Live
        </span>
      );
      case 'empty': return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
          <Wifi className="w-3 h-3" /> Connected (Empty)
        </span>
      );
      case 'stale_warning': return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <AlertCircle className="w-3 h-3" /> Cached
        </span>
      );
      case 'sandbox': return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40">
          <FlaskConical className="w-3 h-3" /> Sandbox
        </span>
      );
      case 'error': return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <WifiOff className="w-3 h-3" /> Offline
        </span>
      );
      default: return (
        <span data-testid="connection-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1B1530] text-violet-300 border border-violet-500/20">
          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
        </span>
      );
    }
  };

  return (
    <header className="relative z-20 w-full">
      {/* Gradient separator line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="bg-[#0A0718]/90 backdrop-blur-xl px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* LEFT: Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 w-20 sm:w-28 aspect-[16/9] rounded-lg overflow-hidden bg-[#161D26] border border-violet-500/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
              {!bannerFailed ? (
                <img src={bannerSrc} alt="AWS Cloud Club" onError={handleBannerError}
                  className="w-full h-full object-contain" />
              ) : (
                <span className="text-[9px] font-bold tracking-widest uppercase text-violet-300 text-center px-1">AWS Cloud Club</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Zap className="w-2.5 h-2.5" /> Official Lucky Draw
                </span>
                {statusBadge()}
              </div>
              <h1 className="text-sm sm:text-lg font-extrabold text-white tracking-tight truncate leading-tight">
                AWS Student Builder Group
              </h1>
              <p className="text-[11px] sm:text-xs font-medium text-violet-300/80 truncate">
                COMSATS University Islamabad
              </p>
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Participant Count (single responsive badge) */}
            <div data-testid="header-participant-count"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(168,85,247,0.1))',
                border: '1px solid rgba(139,92,246,0.35)',
              }}>
              <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="font-mono font-bold text-white">{eligibleCount}</span>
              <span className="hidden sm:inline text-violet-200/80 font-medium">
                {eligibleCount === 1 ? 'Participant Ready' : 'Participants Ready'}
              </span>
              {totalParticipants > eligibleCount && (
                <span className="hidden md:inline text-[10px] text-violet-300/60 font-mono">({totalParticipants} total)</span>
              )}
            </div>

            {/* Refresh */}
            <button type="button" onClick={onRefresh} disabled={isSpinning || isRefreshing}
              aria-label="Refresh Participants"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 bg-white/5 hover:bg-violet-500/20 hover:border-violet-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw className={`w-3.5 h-3.5 text-violet-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Mute */}
            <button type="button" onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className={`p-2 rounded-xl border transition ${isMuted ? 'bg-white/5 text-white/40 border-white/10' : 'bg-violet-500/15 text-violet-300 border-violet-500/30 hover:bg-violet-500/25'}`}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button type="button" onClick={onToggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-xl bg-white/5 hover:bg-violet-500/20 text-violet-300 border border-white/10 hover:border-violet-500/30 transition">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Organizer */}
            <button type="button" onClick={onOpenOrganizerPanel}
              aria-label="Open Organizer Controls"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.2))',
                border: '1px solid rgba(139,92,246,0.5)',
                color: '#E9D5FF',
                boxShadow: '0 0 12px rgba(139,92,246,0.2)',
              }}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Organizer</span>
              {winnerCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {winnerCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
