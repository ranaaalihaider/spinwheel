import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Play,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SplashScreen } from './components/splash/SplashScreen';
import { SpinWheelCanvas } from './components/wheel/SpinWheelCanvas';
import { WheelStatusBar } from './components/wheel/WheelStatusBar';
import { WinnerModal } from './components/winner/WinnerModal';
import { WinnerHistoryCard } from './components/controls/WinnerHistoryCard';
import { OrganizerPanel } from './components/controls/OrganizerPanel';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useFullscreen } from './hooks/useFullscreen';
import { useLuckyDraw, UseLuckyDrawOptions } from './hooks/useLuckyDraw';

export interface AppProps extends UseLuckyDrawOptions {
  skipSplashForTests?: boolean;
}

function formatSyncLabel(lastSyncedAt: string | null, nowTick: number): string {
  if (!lastSyncedAt) return 'Syncing...';
  const diffSec = Math.max(0, Math.floor((nowTick - new Date(lastSyncedAt).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return new Date(lastSyncedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const App: React.FC<AppProps> = ({ skipSplashForTests = false, spinDurationMs }) => {
  const prefersReducedMotion = useReducedMotion();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [showSplash, setShowSplash] = useState(!skipSplashForTests);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [confirmingInlineReset, setConfirmingInlineReset] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const {
    allParticipants,
    eligibleParticipants,
    currentDisplaySlices,
    isAdaptiveModeActive,
    allParticipantsHaveWon,
    connectionState,
    isRefreshing,
    lastSyncedAt,
    syncError,
    diagnostics,
    settings,
    winnerHistory,
    drawStatus,
    currentRotation,
    activeSpinPlan,
    latestWinner,
    refreshParticipants,
    startSpin,
    handleSpinComplete,
    closeWinnerModal,
    toggleMute,
    setExcludePreviousWinners,
    setSandboxMode,
    resetEventSession,
  } = useLuckyDraw({ prefersReducedMotion, spinDurationMs });

  // Periodically update relative "Just now" sync label
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const isSpinning = drawStatus === 'spinning';
  const canSpin = !isSpinning && eligibleParticipants.length > 0;

  const handleSpinAgainFromModal = useCallback(() => {
    closeWinnerModal();
    window.setTimeout(() => {
      startSpin();
    }, 30);
  }, [closeWinnerModal, startSpin]);

  const syncDotClass =
    connectionState === 'connected'
      ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
      : connectionState === 'sandbox' || connectionState === 'stale_warning'
      ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24]'
      : connectionState === 'error'
      ? 'bg-rose-400 shadow-[0_0_8px_#FB7185]'
      : 'bg-purple-400';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080515] text-white overflow-x-hidden">
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          prefersReducedMotion={prefersReducedMotion}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* COMSATS Campus Photo + Dark Purple Atmospheric Overlay + Neon Ribbons */}
      <AmbientBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Explicit Rehearsal Sandbox Banner */}
      <AnimatePresence>
        {settings.sandboxMode && (
          <motion.div
            data-testid="sandbox-active-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-30 overflow-hidden border-b border-amber-400/30 px-4 py-2 text-xs text-amber-100 flex flex-wrap items-center justify-center gap-3 text-center"
            style={{
              background:
                'linear-gradient(90deg, rgba(120,53,15,0.45), rgba(217,119,6,0.32), rgba(120,53,15,0.45))',
            }}
          >
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-200">
              <FlaskConical className="w-4 h-4 text-amber-300 animate-pulse" />
              REHEARSAL SANDBOX MODE — {allParticipants.length} Mock Participants
            </span>
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => setSandboxMode(false)}
              className="px-3 py-0.5 rounded-full bg-amber-400 text-[#080515] font-bold text-xs hover:bg-amber-300 transition disabled:opacity-50"
            >
              Switch to Live Sheet
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Header */}
      <Header
        totalParticipants={allParticipants.length}
        eligibleCount={eligibleParticipants.length}
        connectionState={connectionState}
        isRefreshing={isRefreshing}
        isMuted={settings.isMuted}
        isFullscreen={isFullscreen}
        winnerCount={winnerHistory.length}
        isHistoryViewActive={showHistoryPanel}
        onToggleHistoryView={() => setShowHistoryPanel((prev) => !prev)}
        onToggleMute={toggleMute}
        onToggleFullscreen={() => void toggleFullscreen()}
        onOpenOrganizerPanel={() => setIsOrganizerOpen(true)}
      />

      {/* MAIN EVENT STAGE */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 flex flex-col justify-center">
        {/* Top Centered Event Title Lockup (matching design reference) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-5 sm:mb-7"
        >
          {/* Eyebrow pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-purple-100/95 bg-[#1B1138]/85 border border-purple-300/30 shadow-[0_0_24px_rgba(139,92,246,0.22)] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
            <span>Official Lucky Draw Event</span>
          </div>

          {/* Centered Brand Display Title */}
          <p className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight">
            <span className="text-white">AWS Student </span>
            <span className="bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-[#9333EA] bg-clip-text text-transparent">
              Builder Group
            </span>
          </p>

          {/* Flanking Hairline Subtitle */}
          <div className="mt-2 flex items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-sm font-medium tracking-[0.18em] uppercase text-[#C9C2DC]">
            <span className="hidden sm:block w-14 h-px bg-gradient-to-r from-transparent to-purple-300/45" />
            <span>COMSATS University Islamabad</span>
            <span className="hidden sm:block w-14 h-px bg-gradient-to-l from-transparent to-purple-300/45" />
          </div>
        </motion.div>

        {/* THREE-COLUMN DESKTOP / REORDERED MOBILE & TABLET STAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(265px,340px)_minmax(0,1fr)_minmax(290px,340px)] gap-6 lg:gap-6 xl:gap-10 items-center">
          {/* 1. LEFT COLUMN TOP — Hero Typography + Stat Tiles */}
          <div className="order-1 md:order-3 md:col-span-1 lg:col-start-1 lg:row-start-1 lg:self-end flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl xl:text-[54px] font-black tracking-tight leading-[1.04]">
              <span className="block text-white">Let the </span>
              <span className="block bg-gradient-to-r from-[#DDD6FE] via-[#C084FC] to-[#A855F7] bg-clip-text text-transparent">
                Wheel{' '}
              </span>
              <span className="relative inline-block bg-gradient-to-r from-[#DDD6FE] via-[#C084FC] to-[#A855F7] bg-clip-text text-transparent pb-2">
                Decide!
                {/* Golden hand-drawn curved accent underline (matching reference) */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 210 18"
                  fill="none"
                  className="absolute -bottom-1 left-0 w-full h-3.5 overflow-visible"
                >
                  <path
                    d="M 4 11 C 52 3, 138 2, 204 8"
                    stroke="#FBBF24"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 28 15 C 74 11, 126 10, 176 13"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.78"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-[15px] text-[#CFC9E2] leading-relaxed max-w-[300px]">
              Every participant has a chance. One spin, one lucky winner!
            </p>

            {/* Two Dark-Glass Stat Tiles (Participants + Last Synced) */}
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-[340px]">
              {/* Participants Tile */}
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left"
                style={{
                  background: 'rgba(19, 12, 42, 0.78)',
                  border: '1px solid rgba(196, 181, 253, 0.22)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-black font-mono text-white leading-none">
                    {eligibleParticipants.length}
                  </div>
                  <div className="text-[11px] text-[#B4ADC9] font-medium mt-1 truncate">
                    Participants
                  </div>
                </div>
              </div>

              {/* Last Synced Tile */}
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left"
                style={{
                  background: 'rgba(19, 12, 42, 0.78)',
                  border: '1px solid rgba(196, 181, 253, 0.22)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                  <RefreshCw
                    className={`w-4 h-4 text-purple-300 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-sm sm:text-[15px] font-bold text-white truncate">
                      {formatSyncLabel(lastSyncedAt, nowTick)}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${syncDotClass}`} />
                  </div>
                  <div className="text-[11px] text-[#B4ADC9] font-medium mt-1 truncate">
                    Last Synced
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CENTER COLUMN — Illuminated Spin Wheel & Pedestal */}
          <div className="order-2 md:order-1 md:col-span-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:col-span-1 flex flex-col items-center w-full">
            <SpinWheelCanvas
              slices={currentDisplaySlices}
              rotation={currentRotation}
              drawStatus={drawStatus}
              activeSpinPlan={activeSpinPlan}
              prefersReducedMotion={prefersReducedMotion}
              onSpinComplete={handleSpinComplete}
            />

            {/* Empty State Alert */}
            <AnimatePresence>
              {allParticipants.length === 0 && connectionState !== 'loading' && (
                <motion.div
                  data-testid="empty-participants-state"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-md mt-4 p-5 rounded-2xl text-center"
                  style={{
                    background: 'rgba(20, 12, 46, 0.88)',
                    border: '1px solid rgba(196, 181, 253, 0.3)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <p className="text-sm sm:text-base font-bold text-white mb-1.5">
                    No participants available yet. Please check the registration sheet.
                  </p>
                  <p className="text-xs text-[#B4ADC9] mb-4 leading-relaxed">
                    Once students submit the Google Form, click Refresh or test in Organizer Sandbox Mode.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => void refreshParticipants()}
                      disabled={isRefreshing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white transition hover:brightness-110"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Check Again
                    </button>
                    <button
                      type="button"
                      data-testid="empty-open-organizer-btn"
                      onClick={() => setIsOrganizerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-purple-200 bg-purple-500/15 border border-purple-400/30 hover:bg-purple-500/25 transition"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Open Organizer / Sandbox
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All-Winners Exhausted State */}
            <AnimatePresence>
              {allParticipantsHaveWon && (
                <motion.div
                  data-testid="all-winners-exhausted-state"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-md mt-4 p-5 rounded-2xl text-center"
                  style={{
                    background: 'rgba(24, 14, 52, 0.9)',
                    border: '1px solid rgba(253, 230, 138, 0.35)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <p className="text-base font-black text-amber-200 mb-1.5">
                    All {allParticipants.length} Participants Have Won!
                  </p>
                  <p className="text-xs text-[#CFC9E2] mb-4">
                    Repeat winner exclusion is active. Reset eligibility to run another round.
                  </p>
                  {!confirmingInlineReset ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        data-testid="exhausted-reset-trigger-btn"
                        onClick={() => setConfirmingInlineReset(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Eligibility
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcludePreviousWinners(false)}
                        className="px-4 py-2 rounded-xl font-semibold text-xs text-purple-200 bg-purple-500/15 border border-purple-400/30 hover:bg-purple-500/25 transition"
                      >
                        Allow Repeats
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        data-testid="exhausted-confirm-reset-btn"
                        onClick={() => {
                          resetEventSession();
                          setConfirmingInlineReset(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                      >
                        Confirm Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingInlineReset(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-purple-200 text-xs font-semibold border border-white/10 hover:bg-white/10 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. PRIMARY SPIN CTA BUTTON — Right below wheel on Mobile/Tablet; Left column bottom on Desktop */}
          <div className="order-3 md:order-2 md:col-span-2 lg:col-start-1 lg:row-start-2 lg:col-span-1 lg:self-start flex flex-col items-center lg:items-start w-full">
            <motion.button
              type="button"
              data-testid="spin-wheel-button"
              onClick={startSpin}
              disabled={!canSpin}
              whileHover={canSpin ? { scale: 1.025, y: -2 } : {}}
              whileTap={canSpin ? { scale: 0.975 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`relative overflow-hidden w-full max-w-[340px] inline-flex items-center justify-center gap-3 px-7 py-4 sm:py-[18px] rounded-2xl font-extrabold text-lg sm:text-xl tracking-wide select-none transition ${
                !canSpin
                  ? 'opacity-45 cursor-not-allowed bg-white/5 text-white/40 border border-purple-300/15'
                  : 'text-white cursor-pointer'
              }`}
              style={
                canSpin
                  ? {
                      background: isSpinning
                        ? 'linear-gradient(135deg, #5B21B6, #7C3AED)'
                        : 'linear-gradient(135deg, #7C3AED 0%, #9333EA 48%, #A855F7 100%)',
                      boxShadow: isSpinning
                        ? '0 0 28px rgba(139,92,246,0.5)'
                        : '0 0 42px rgba(168,85,247,0.58), 0 12px 32px rgba(6,4,18,0.65), inset 0 1px 0 rgba(255,255,255,0.28)',
                      border: '1px solid rgba(233,213,255,0.4)',
                    }
                  : undefined
              }
            >
              {/* Subtle shimmer sheen */}
              {canSpin && !isSpinning && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-shimmer pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)',
                  }}
                />
              )}

              <span className="relative z-10 w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <Play
                  className={`w-4 h-4 fill-current ${isSpinning ? 'animate-pulse' : 'ml-0.5'}`}
                />
              </span>
              <span className="relative z-10">
                {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
              </span>
            </motion.button>
          </div>

          {/* 4. RIGHT COLUMN — Glassmorphic Lucky Draw Info & Winner History Card */}
          <div className="order-4 md:order-4 md:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:self-center w-full max-w-[380px] mx-auto lg:max-w-none">
            <WinnerHistoryCard
              winners={winnerHistory}
              showHistory={showHistoryPanel}
              isRefreshing={isRefreshing}
              isSpinning={isSpinning}
              isFullscreen={isFullscreen}
              onToggleHistory={setShowHistoryPanel}
              onRefresh={() => void refreshParticipants()}
              onToggleFullscreen={() => void toggleFullscreen()}
              onOpenOrganizerPanel={() => setIsOrganizerOpen(true)}
            />
          </div>
        </div>

        {/* Status Warnings, Adaptive Large-Cohort Notice & Telemetry Strip */}
        <div className="mt-6">
          <WheelStatusBar
            totalParticipants={allParticipants.length}
            eligibleCount={eligibleParticipants.length}
            displayedSliceCount={currentDisplaySlices.length}
            isAdaptiveModeActive={isAdaptiveModeActive}
            lastSyncedAt={lastSyncedAt}
            connectionState={connectionState}
            syncError={syncError}
            diagnostics={diagnostics}
          />
        </div>
      </main>

      {/* Winner Celebration Modal */}
      <WinnerModal
        winner={latestWinner}
        isOpen={drawStatus === 'winner_revealed' && latestWinner !== null}
        canSpinAgain={eligibleParticipants.length > 0}
        prefersReducedMotion={prefersReducedMotion}
        onSpinAgain={handleSpinAgainFromModal}
        onClose={closeWinnerModal}
      />

      {/* PIN-Protected Organizer Settings Drawer */}
      <OrganizerPanel
        isOpen={isOrganizerOpen}
        settings={settings}
        diagnostics={diagnostics}
        totalParticipants={allParticipants.length}
        eligibleCount={eligibleParticipants.length}
        winnerHistory={winnerHistory}
        isRefreshing={isRefreshing}
        isSpinning={isSpinning}
        isFullscreen={isFullscreen}
        onClose={() => setIsOrganizerOpen(false)}
        onRefresh={() => void refreshParticipants()}
        onToggleMute={toggleMute}
        onToggleFullscreen={() => void toggleFullscreen()}
        onSetExcludePreviousWinners={setExcludePreviousWinners}
        onSetSandboxMode={setSandboxMode}
        onResetSession={resetEventSession}
      />

      <Footer />
    </div>
  );
};

export default App;
