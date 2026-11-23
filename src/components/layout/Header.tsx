import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import { ConnectionState } from '../../types';

export const REMOTE_BANNER_URL =
  'https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg';
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
  totalParticipants,
  eligibleCount,
  connectionState,
  isRefreshing,
  isSpinning,
  isMuted,
  isFullscreen,
  winnerCount,
  onRefresh,
  onToggleMute,
  onToggleFullscreen,
  onOpenOrganizerPanel,
}) => {
  const [bannerSrc, setBannerSrc] = useState<string>(REMOTE_BANNER_URL);
  const [bannerFailed, setBannerFailed] = useState<boolean>(false);

  const handleBannerError = () => {
    if (bannerSrc === REMOTE_BANNER_URL) {
      setBannerSrc(LOCAL_BANNER_URL);
    } else {
      setBannerFailed(true);
    }
  };

  const renderConnectionBadge = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Wifi className="w-3.5 h-3.5" />
            <span>Live Sheet Synced</span>
          </span>
        );
      case 'empty':
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#C4B5FD]/25"
          >
            <Wifi className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Sheet Connected (0 Rows)</span>
          </span>
        );
      case 'stale_warning':
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Cached List (Sync Warning)</span>
          </span>
        );
      case 'sandbox':
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
            <span>Test Sandbox Mode</span>
          </span>
        );
      case 'error':
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30"
          >
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Sync Offline</span>
          </span>
        );
      case 'loading':
      default:
        return (
          <span
            data-testid="connection-status-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B1530] text-[#C4B5FD] border border-[#C4B5FD]/20"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A855F7]" />
            <span>Syncing Sheet...</span>
          </span>
        );
    }
  };

  return (
    <header className="relative z-20 w-full border-b border-[#C4B5FD]/15 bg-[#151027]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: AWS Cloud Club 16:9 Banner Thumbnail + Brand Title Lockup */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Official 1200x675 (16:9) Banner Container — Aspect Ratio Strictly Preserved */}
          <div className="relative shrink-0 w-24 sm:w-32 aspect-[16/9] rounded-lg overflow-hidden bg-[#161D26] border border-[#C4B5FD]/25 shadow-purple-glow flex items-center justify-center">
            {!bannerFailed ? (
              <img
                src={bannerSrc}
                alt="AWS Student Builder Group Cloud Club Official Banner"
                onError={handleBannerError}
                className="w-full h-full object-contain select-none"
              />
            ) : (
              <div className="text-[10px] font-bold tracking-wider uppercase text-[#C4B5FD] text-center px-1.5">
                AWS Cloud Club
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30">
                Official Lucky Draw
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight truncate mt-0.5">
              AWS Student Builder Group
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#C4B5FD] truncate">
              COMSATS University Islamabad
            </p>
          </div>
        </div>

        {/* Right: Live Participant Counter, Connection Status & Action Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 ml-auto">
          {/* Participant Count Pill */}
          <div
            data-testid="header-participant-count"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1B1530] border border-[#C4B5FD]/20 text-xs sm:text-sm"
          >
            <Users className="w-4 h-4 text-[#A855F7] shrink-0" />
            <span className="font-mono font-bold text-white">{eligibleCount}</span>
            <span className="text-[#A9A3BE]">
              {eligibleCount === 1 ? 'Participant Ready' : 'Participants Ready'}
            </span>
            {totalParticipants > eligibleCount && (
              <span className="hidden md:inline text-xs text-[#C4B5FD]/75 font-mono">
                ({totalParticipants} total)
              </span>
            )}
          </div>

          {/* Connection Status Badge */}
          <div className="hidden lg:block">{renderConnectionBadge()}</div>

          {/* Refresh Participants Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isSpinning || isRefreshing}
            aria-label="Refresh Participants"
            title="Fetch latest registrations from Google Sheets"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1B1530] hover:bg-[#8B5CF6]/25 text-white border border-[#C4B5FD]/25 transition disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#C4B5FD] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Syncing...' : 'Refresh Participants'}
            </span>
          </button>

          {/* Mute / Unmute Audio Button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'bg-[#1B1530]/60 text-[#A9A3BE] border-[#C4B5FD]/15 hover:text-white'
                : 'bg-[#1B1530] text-[#C4B5FD] border-[#C4B5FD]/25 hover:bg-[#8B5CF6]/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Projector Mode Button */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Presentation Mode'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation Mode'}
            className="p-2 rounded-xl bg-[#1B1530] hover:bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#C4B5FD]/25 transition"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Discreet Organizer Panel Button */}
          <button
            type="button"
            onClick={onOpenOrganizerPanel}
            aria-label="Open Organizer Controls"
            title="Organizer Controls & Winner History"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/35 text-[#C4B5FD] border border-[#8B5CF6]/40 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden md:inline">Organizer</span>
            {winnerCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-[#8B5CF6] text-white">
                {winnerCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile connection bar */}
      <div className="lg:hidden px-3 pb-2 flex items-center justify-between text-xs">
        {renderConnectionBadge()}
      </div>
    </header>
  );
};
