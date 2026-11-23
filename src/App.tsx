import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, RefreshCw, RotateCcw, SlidersHorizontal, Sparkles, Users, Zap } from 'lucide-react';
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

export const App: React.FC<AppProps> = ({ skipSplashForTests = false, spinDurationMs }) => {
  const prefersReducedMotion = useReducedMotion();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [showSplash, setShowSplash] = useState(!skipSplashForTests);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [confirmingInlineReset, setConfirmingInlineReset] = useState(false);

  const {
    allParticipants, eligibleParticipants, currentDisplaySlices,
    isAdaptiveModeActive, allParticipantsHaveWon,
    connectionState, isRefreshing, lastSyncedAt, syncError, diagnostics,
    settings, winnerHistory, drawStatus, currentRotation, activeSpinPlan, latestWinner,
    refreshParticipants, startSpin, handleSpinComplete, closeWinnerModal,
    toggleMute, setExcludePreviousWinners, setSandboxMode, resetEventSession,
  } = useLuckyDraw({ prefersReducedMotion, spinDurationMs });

  const isSpinning = drawStatus === 'spinning';
  const canSpin = !isSpinning && eligibleParticipants.length > 0;

  const handleSpinAgainFromModal = useCallback(() => {
    closeWinnerModal();
    window.setTimeout(() => { startSpin(); }, 30);
  }, [closeWinnerModal, startSpin]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060412] text-white overflow-x-hidden">
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen prefersReducedMotion={prefersReducedMotion} onComplete={() => setShowSplash(false)} />
      )}

      {/* Animated ambient background */}
      <AmbientBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Sandbox mode banner */}
      <AnimatePresence>
        {settings.sandboxMode && (
          <motion.div
            data-testid="sandbox-active-banner"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="relative z-30 overflow-hidden border-b border-amber-400/30 px-4 py-2 text-xs text-amber-100 flex flex-wrap items-center justify-center gap-3 text-center"
            style={{ background: 'linear-gradient(90deg, rgba(120,53,15,0.4), rgba(217,119,6,0.3), rgba(120,53,15,0.4))' }}
          >
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-200">
              <FlaskConical className="w-4 h-4 text-amber-300 animate-pulse" />
              REHEARSAL SANDBOX MODE — {allParticipants.length} Mock Participants
            </span>
            <button type="button" disabled={isSpinning} onClick={() => setSandboxMode(false)}
              className="px-3 py-0.5 rounded-full bg-amber-400 text-[#060412] font-bold text-xs hover:bg-amber-300 transition disabled:opacity-50">
              Switch to Live Sheet
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        totalParticipants={allParticipants.length} eligibleCount={eligibleParticipants.length}
        connectionState={connectionState} isRefreshing={isRefreshing} isSpinning={isSpinning}
        isMuted={settings.isMuted} isFullscreen={isFullscreen} winnerCount={winnerHistory.length}
        onRefresh={() => void refreshParticipants()} onToggleMute={toggleMute}
        onToggleFullscreen={() => void toggleFullscreen()} onOpenOrganizerPanel={() => setIsOrganizerOpen(true)}
      />

      {/* MAIN STAGE */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col">

        {/* Hero heading */}
        <div className="text-center mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-3">
              <span className="text-white">Let the </span>
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 35%, #FB923C 65%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Wheel Decide!</span>
            </h2>
            <p className="text-sm sm:text-base text-violet-200/60 font-medium max-w-lg mx-auto">
              Every participant has a chance. One spin, one lucky winner! 🎯
            </p>
          </motion.div>
        </div>

        {/* Stage Layout */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 xl:gap-10 flex-1">

          {/* WHEEL COLUMN */}
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center">

            {/* Wheel */}
            <SpinWheelCanvas
              slices={currentDisplaySlices}
              rotation={currentRotation}
              drawStatus={drawStatus}
              activeSpinPlan={activeSpinPlan}
              prefersReducedMotion={prefersReducedMotion}
              onSpinComplete={handleSpinComplete}
            />

            {/* Empty state */}
            <AnimatePresence>
              {allParticipants.length === 0 && connectionState !== 'loading' && (
                <motion.div
                  data-testid="empty-participants-state"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="w-full max-w-lg mt-5 p-6 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(168,85,247,0.06))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-violet-400" />
                  </div>
                  <p className="text-base font-bold text-white mb-2">
                    No participants available yet. Please check the registration sheet.
                  </p>
                  <p className="text-sm text-violet-200/60 mb-4 leading-relaxed">
                    Once students submit the Google Form, click&nbsp;
                    <strong className="text-violet-300">Refresh</strong> or test with Sandbox mode.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button type="button" onClick={() => void refreshParticipants()} disabled={isRefreshing}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Check Again
                    </button>
                    <button type="button" data-testid="empty-open-organizer-btn" onClick={() => setIsOrganizerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 transition">
                      <SlidersHorizontal className="w-4 h-4" />
                      Open Organizer / Sandbox
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All-winners exhausted state */}
            <AnimatePresence>
              {allParticipantsHaveWon && (
                <motion.div
                  data-testid="all-winners-exhausted-state"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="w-full max-w-lg mt-5 p-6 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(139,92,246,0.08))',
                    border: '1px solid rgba(168,85,247,0.4)',
                  }}
                >
                  <p className="text-lg font-black text-white mb-2">🏆 All {allParticipants.length} Participants Have Won!</p>
                  <p className="text-sm text-violet-200/70 mb-4">Repeat winner exclusion is active. Reset eligibility to run another round.</p>
                  {!confirmingInlineReset ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" data-testid="exhausted-reset-trigger-btn" onClick={() => setConfirmingInlineReset(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}>
                        <RotateCcw className="w-4 h-4" /> Reset Eligibility
                      </button>
                      <button type="button" onClick={() => setExcludePreviousWinners(false)}
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm text-violet-300 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 transition">
                        Allow Repeats
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" data-testid="exhausted-confirm-reset-btn"
                        onClick={() => { resetEventSession(); setConfirmingInlineReset(false); }}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition">
                        Confirm Reset
                      </button>
                      <button type="button" onClick={() => setConfirmingInlineReset(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 text-violet-300 text-sm font-semibold border border-white/10 hover:bg-white/10 transition">
                        Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== SPIN BUTTON ===== */}
            <div className="mt-5 w-full flex flex-col items-center gap-3">
              <motion.button
                type="button"
                data-testid="spin-wheel-button"
                onClick={startSpin}
                disabled={!canSpin}
                whileHover={canSpin ? { scale: 1.04, y: -2 } : {}}
                whileTap={canSpin ? { scale: 0.96 } : {}}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                className={`relative overflow-hidden inline-flex items-center justify-center gap-3 px-10 sm:px-16 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-2xl tracking-widest uppercase select-none ${
                  !canSpin
                    ? 'opacity-40 cursor-not-allowed bg-white/5 text-white/30 border border-white/10'
                    : 'text-white cursor-pointer'
                }`}
                style={canSpin ? {
                  background: isSpinning
                    ? 'linear-gradient(135deg, #5B21B6, #7C3AED)'
                    : 'linear-gradient(135deg, #6D28D9 0%, #9333EA 40%, #DB2777 80%, #EA580C 100%)',
                  boxShadow: isSpinning
                    ? '0 0 30px rgba(139,92,246,0.6)'
                    : '0 0 50px rgba(139,92,246,0.7), 0 0 100px rgba(168,85,247,0.35), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.2)',
                } : undefined}
              >
                {/* Animated shimmer sweep on hover */}
                {canSpin && !isSpinning && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-shimmer pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                      transform: 'skewX(-15deg)',
                    }}
                  />
                )}

                <Sparkles className={`w-6 h-6 sm:w-7 sm:h-7 ${isSpinning ? 'animate-spin' : ''} relative z-10`} />
                <span className="relative z-10">{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}</span>
                {!isSpinning && canSpin && <Zap className="w-6 h-6 relative z-10 fill-current" />}
              </motion.button>

              {/* Participant mini-counter */}
              {eligibleParticipants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-violet-300/60"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    <strong className="text-violet-200 font-mono">{eligibleParticipants.length}</strong> eligible participants in the draw
                  </span>
                </motion.div>
              )}
            </div>

            {/* Status telemetry bar */}
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

          {/* WINNER HISTORY SIDEBAR */}
          <WinnerHistoryCard winners={winnerHistory} onOpenOrganizerPanel={() => setIsOrganizerOpen(true)} />
        </div>
      </main>

      {/* Winner Modal */}
      <WinnerModal
        winner={latestWinner}
        isOpen={drawStatus === 'winner_revealed' && latestWinner !== null}
        canSpinAgain={eligibleParticipants.length > 0}
        prefersReducedMotion={prefersReducedMotion}
        onSpinAgain={handleSpinAgainFromModal}
        onClose={closeWinnerModal}
      />

      {/* Organizer Panel */}
      <OrganizerPanel
        isOpen={isOrganizerOpen}
        settings={settings} diagnostics={diagnostics}
        totalParticipants={allParticipants.length} eligibleCount={eligibleParticipants.length}
        winnerHistory={winnerHistory} isRefreshing={isRefreshing} isSpinning={isSpinning} isFullscreen={isFullscreen}
        onClose={() => setIsOrganizerOpen(false)} onRefresh={() => void refreshParticipants()}
        onToggleMute={toggleMute} onToggleFullscreen={() => void toggleFullscreen()}
        onSetExcludePreviousWinners={setExcludePreviousWinners}
        onSetSandboxMode={setSandboxMode} onResetSession={resetEventSession}
      />

      <Footer />
    </div>
  );
};

export default App;
