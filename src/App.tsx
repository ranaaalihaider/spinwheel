import React, { useCallback, useState } from 'react';
import {
  FlaskConical,
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

export const App: React.FC<AppProps> = ({
  skipSplashForTests = false,
  spinDurationMs,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [showSplash, setShowSplash] = useState<boolean>(!skipSplashForTests);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState<boolean>(false);
  const [confirmingInlineReset, setConfirmingInlineReset] = useState<boolean>(false);

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
  } = useLuckyDraw({
    prefersReducedMotion,
    spinDurationMs,
  });

  const isSpinning = drawStatus === 'spinning';
  const canSpin = !isSpinning && eligibleParticipants.length > 0;

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleSpinAgainFromModal = useCallback(() => {
    closeWinnerModal();
    // Schedule next spin on microtask after modal closes if eligible participants remain
    window.setTimeout(() => {
      startSpin();
    }, 30);
  }, [closeWinnerModal, startSpin]);

  return (
    <div
      className={`relative min-h-screen flex flex-col bg-[#090714] text-white ${
        isFullscreen ? 'justify-between' : ''
      }`}
    >
      {/* Phase 3: Animated Introductory Splash Screen */}
      {showSplash && (
        <SplashScreen
          prefersReducedMotion={prefersReducedMotion}
          onComplete={handleSplashComplete}
        />
      )}

      {/* Ambient Purple Stage Lighting & Particles */}
      <AmbientBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Explicit Development / Test Sandbox Banner when active */}
      {settings.sandboxMode && (
        <div
          data-testid="sandbox-active-banner"
          className="relative z-30 bg-amber-500/20 border-b border-amber-400/40 px-4 py-2 text-xs text-amber-100 flex flex-wrap items-center justify-center gap-3 text-center"
        >
          <span className="inline-flex items-center gap-1.5 font-bold text-amber-200">
            <FlaskConical className="w-4 h-4 text-amber-300" />
            DEVELOPMENT / TEST SANDBOX MODE ACTIVE ({allParticipants.length} Mock Participants)
          </span>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => setSandboxMode(false)}
            className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-[#090714] font-bold hover:bg-amber-300 transition disabled:opacity-50"
          >
            Switch to Live Google Sheet
          </button>
        </div>
      )}

      {/* Top Navigation & Brand Header */}
      <Header
        totalParticipants={allParticipants.length}
        eligibleCount={eligibleParticipants.length}
        connectionState={connectionState}
        isRefreshing={isRefreshing}
        isSpinning={isSpinning}
        isMuted={settings.isMuted}
        isFullscreen={isFullscreen}
        winnerCount={winnerHistory.length}
        onRefresh={() => void refreshParticipants()}
        onToggleMute={toggleMute}
        onToggleFullscreen={() => void toggleFullscreen()}
        onOpenOrganizerPanel={() => setIsOrganizerOpen(true)}
      />

      {/* Main Event Stage */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        {/* Hero Heading Section */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Let the Wheel Decide!
          </h2>
          <p className="text-sm sm:text-lg text-[#A9A3BE] mt-2 font-medium">
            Every participant has a chance. One spin, one lucky winner!
          </p>
        </div>

        {/* Centerpiece Stage Grid: Wheel Centerpiece + Winner History Card */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 xl:gap-12">
          {/* Wheel & Primary Call-to-Action Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center">
            {/* Spin Wheel Canvas */}
            <SpinWheelCanvas
              slices={currentDisplaySlices}
              rotation={currentRotation}
              drawStatus={drawStatus}
              activeSpinPlan={activeSpinPlan}
              prefersReducedMotion={prefersReducedMotion}
              onSpinComplete={handleSpinComplete}
            />

            {/* Empty Google Sheet State */}
            {allParticipants.length === 0 && connectionState !== 'loading' && (
              <div
                data-testid="empty-participants-state"
                className="w-full max-w-lg mt-5 p-5 rounded-2xl bg-[#1B1530]/90 border border-[#C4B5FD]/25 text-center shadow-card-glass space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center mx-auto text-[#C4B5FD]">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm sm:text-base font-bold text-white">
                  No participants available yet. Please check the registration sheet.
                </p>
                <p className="text-xs text-[#A9A3BE] leading-relaxed">
                  Waiting for students to submit the Google Form linked to the event spreadsheet. Once responses arrive, click{' '}
                  <strong className="text-[#C4B5FD]">Refresh Participants</strong>.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => void refreshParticipants()}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#A855F7] text-white text-xs font-bold transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Check Sheet Again</span>
                  </button>
                  <button
                    type="button"
                    data-testid="empty-open-organizer-btn"
                    onClick={() => setIsOrganizerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#151027] hover:bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#C4B5FD]/25 text-xs font-semibold transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Organizer / Rehearsal Sandbox</span>
                  </button>
                </div>
              </div>
            )}

            {/* All Participants Have Won State */}
            {allParticipantsHaveWon && (
              <div
                data-testid="all-winners-exhausted-state"
                className="w-full max-w-lg mt-5 p-5 rounded-2xl bg-[#1B1530]/95 border border-[#A855F7]/40 text-center shadow-purple-glow space-y-3"
              >
                <p className="text-base font-extrabold text-white">
                  All {allParticipants.length} Eligible Participants Have Won!
                </p>
                <p className="text-xs text-[#A9A3BE]">
                  Because <strong className="text-[#C4B5FD]">Exclude Previous Winners</strong> is enabled, every registered student in the current pool has been selected once.
                </p>
                {!confirmingInlineReset ? (
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      data-testid="exhausted-reset-trigger-btn"
                      onClick={() => setConfirmingInlineReset(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white text-xs font-bold shadow-purple-glow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Winner Eligibility</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExcludePreviousWinners(false)}
                      className="px-4 py-2 rounded-xl bg-[#151027] text-[#C4B5FD] border border-[#C4B5FD]/25 text-xs font-semibold hover:text-white"
                    >
                      Allow Repeat Winners
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      data-testid="exhausted-confirm-reset-btn"
                      onClick={() => {
                        resetEventSession();
                        setConfirmingInlineReset(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                    >
                      Confirm Reset Session
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingInlineReset(false)}
                      className="px-4 py-2 rounded-xl bg-[#151027] text-[#C4B5FD] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary "SPIN THE WHEEL" Button */}
            <div className="mt-6 w-full flex flex-col items-center">
              <button
                type="button"
                data-testid="spin-wheel-button"
                onClick={startSpin}
                disabled={!canSpin}
                className={`group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-extrabold text-lg sm:text-xl tracking-wider uppercase transition-all duration-200 ${
                  canSpin
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#8B5CF6] text-white shadow-purple-glow-lg hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]'
                    : 'bg-[#1B1530] text-[#A9A3BE]/50 border border-[#C4B5FD]/15 cursor-not-allowed'
                }`}
              >
                <Sparkles
                  className={`w-6 h-6 ${
                    isSpinning
                      ? 'animate-spin text-white'
                      : canSpin
                      ? 'text-[#F5D0FE] group-hover:rotate-12 transition-transform'
                      : 'text-[#A9A3BE]/40'
                  }`}
                />
                <span>{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}</span>
              </button>
            </div>

            {/* Participant Status & Sync Telemetry Bar */}
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

          {/* Session Winner History Sidebar Card */}
          <WinnerHistoryCard
            winners={winnerHistory}
            onOpenOrganizerPanel={() => setIsOrganizerOpen(true)}
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

      {/* Discreet Organizer Controls Drawer */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
