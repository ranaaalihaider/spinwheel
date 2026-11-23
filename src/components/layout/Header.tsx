import React, { useState } from 'react';
import {
  Crown,
  Maximize2,
  Minimize2,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  AlertCircle,
  FlaskConical,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { ConnectionState } from '../../types';

export const REMOTE_BANNER_URL = 'https://builder.aws.com/assets/Banner_Cloud%20Club_Dark-Dn6ZGEaT.svg';
export const LOCAL_BANNER_URL = '/assets/Banner_Cloud_Club_Dark.svg';

interface HeaderProps {
  totalParticipants: number;
  eligibleCount: number;
  connectionState: ConnectionState;
  isRefreshing: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  winnerCount: number;
  isHistoryViewActive: boolean;
  onToggleHistoryView: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenOrganizerPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalParticipants,
  eligibleCount,
  connectionState,
  isRefreshing,
  isMuted,
  isFullscreen,
  winnerCount,
  isHistoryViewActive,
  onToggleHistoryView,
  onToggleMute,
  onToggleFullscreen,
  onOpenOrganizerPanel,
}) => {
  const [bannerSrc, setBannerSrc] = useState(REMOTE_BANNER_URL);
  const [bannerFailed, setBannerFailed] = useState(false);

  const handleBannerError = () => {
    if (bannerSrc === REMOTE_BANNER_URL) setBannerSrc(LOCAL_BANNER_URL);
    else setBannerFailed(true);
  };

  const renderStatusDot = () => {
    if (isRefreshing || connectionState === 'loading') {
      return (
        <span
          data-testid="connection-status-badge"
          title="Syncing participants"
          className="inline-flex items-center gap-1 text-[10px] text-violet-300"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
        </span>
      );
    }
    if (connectionState === 'connected') {
      return (
        <span
          data-testid="connection-status-badge"
          title="Live Google Sheets Sync"
          className="inline-flex items-center"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
        </span>
      );
    }
    if (connectionState === 'sandbox') {
      return (
        <span
          data-testid="connection-status-badge"
          title="Sandbox Rehearsal Mode"
          className="inline-flex items-center text-amber-300"
        >
          <FlaskConical className="w-3 h-3" />
        </span>
      );
    }
    if (connectionState === 'stale_warning') {
      return (
        <span
          data-testid="connection-status-badge"
          title="Cached Participant List"
          className="inline-flex items-center text-amber-300"
        >
          <AlertCircle className="w-3 h-3" />
        </span>
      );
    }
    if (connectionState === 'error') {
      return (
        <span
          data-testid="connection-status-badge"
          title="Connection Error"
          className="inline-flex items-center text-rose-400"
        >
          <WifiOff className="w-3 h-3" />
        </span>
      );
    }
    return (
      <span
        data-testid="connection-status-badge"
        title="Connected (Empty Sheet)"
        className="inline-flex items-center"
      >
        <span className="w-2 h-2 rounded-full bg-violet-400" />
      </span>
    );
  };

  return (
    <header className="relative z-20 w-full">
      {/* Subtle luminous violet bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/35 to-transparent" />

      <div className="bg-[#0A0618]/80 backdrop-blur-xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: Official AWS Cloud Club Banner + Divider + Title Lockup */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div
              className="relative shrink-0 w-[52px] sm:w-[92px] aspect-[16/9] rounded-lg overflow-hidden bg-[#161D26] border border-purple-300/25 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.22)]"
            >
              {!bannerFailed ? (
                <img
                  src={bannerSrc}
                  alt="AWS Cloud Club"
                  onError={handleBannerError}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-purple-200 text-center px-1">
                  AWS Cloud Club
                </span>
              )}
            </div>

            <div className="hidden sm:block h-7 w-px bg-purple-300/20 shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base lg:text-[17px] font-extrabold text-white tracking-tight truncate leading-tight">
                  AWS Student Builder Group
                </h1>
                {renderStatusDot()}
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-[#B8B0CE] truncate mt-0.5">
                COMSATS University Islamabad
              </p>
            </div>
          </div>

          {/* RIGHT: Glass Pill Controls Cluster (matching design reference) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Participants Ready Pill */}
            <div
              data-testid="header-participant-count"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs bg-[#160E2E]/85 border border-purple-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <Users className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-mono text-[11px] font-bold leading-none">
                {eligibleCount}
              </span>
              <span className="hidden md:inline text-purple-100/90 font-medium">
                {eligibleCount === 1 ? 'Participant Ready' : 'Participants Ready'}
              </span>
              {totalParticipants > eligibleCount && (
                <span className="hidden xl:inline text-[10px] text-purple-300/60 font-mono">
                  ({totalParticipants} total)
                </span>
              )}
            </div>

            {/* History Pill Button */}
            <button
              type="button"
              onClick={onToggleHistoryView}
              aria-label="Toggle Winner History"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                isHistoryViewActive
                  ? 'bg-purple-500/25 border-purple-300/50 text-white'
                  : 'bg-[#160E2E]/85 border-purple-300/20 text-purple-100/90 hover:border-purple-300/40 hover:bg-purple-500/15'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>History</span>
              {winnerCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-mono text-[10px] font-bold leading-none">
                  {winnerCount}
                </span>
              )}
            </button>

            {/* Sound Toggle Pill */}
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className={`p-2 rounded-full border transition ${
                isMuted
                  ? 'bg-[#160E2E]/70 border-purple-300/15 text-purple-300/50 hover:text-purple-200'
                  : 'bg-[#160E2E]/85 border-purple-300/25 text-purple-200 hover:border-purple-300/45 hover:bg-purple-500/15'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Fullscreen Toggle Pill */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              className="hidden sm:inline-flex p-2 rounded-full bg-[#160E2E]/85 border border-purple-300/25 text-purple-200 hover:border-purple-300/45 hover:bg-purple-500/15 transition"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Organizer CTA Pill (matching vibrant purple Organizer button in reference) */}
            <button
              type="button"
              onClick={onOpenOrganizerPanel}
              aria-label="Open Organizer Controls"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)',
                boxShadow:
                  '0 0 20px rgba(168,85,247,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                border: '1px solid rgba(233,213,255,0.35)',
              }}
            >
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>Organizer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
