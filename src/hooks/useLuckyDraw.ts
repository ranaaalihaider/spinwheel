import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveSpinPlan,
  ConnectionState,
  DrawStatus,
  EventSettings,
  Participant,
  SandboxCohortSize,
  SyncDiagnostics,
  WinnerRecord,
} from '../types';
import { fetchLiveParticipants } from '../services/participantService';
import { soundService } from '../services/soundService';
import {
  buildAdaptiveSpinWindow,
  buildIdleDisplayWindow,
  calculateTargetRotation,
  MAX_VISIBLE_SLICES,
  selectRandomIndex,
} from '../utils/cryptoRandom';
import { generateSandboxParticipants } from '../utils/sandboxData';
import {
  clearWinnerHistoryStorage,
  loadEventSettings,
  loadWinnerHistory,
  saveEventSettings,
  saveWinnerHistory,
} from '../utils/storage';

const INITIAL_DIAGNOSTICS: SyncDiagnostics = {
  totalRowsScanned: 0,
  validParticipants: 0,
  duplicatesRemoved: 0,
  blankRowsIgnored: 0,
  sourceLabel: 'Google Sheets Live Sync',
  deduplicationMode: 'registration_number_and_name_fallback',
};

export interface UseLuckyDrawOptions {
  prefersReducedMotion?: boolean;
  spinDurationMs?: number;
}

export function useLuckyDraw(options: UseLuckyDrawOptions = {}) {
  const { prefersReducedMotion = false, spinDurationMs } = options;

  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [liveBackupParticipants, setLiveBackupParticipants] = useState<Participant[] | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<SyncDiagnostics>(INITIAL_DIAGNOSTICS);

  const [settings, setSettings] = useState<EventSettings>(() => loadEventSettings());
  const [winnerHistory, setWinnerHistory] = useState<WinnerRecord[]>(() => loadWinnerHistory());

  const [drawStatus, setDrawStatus] = useState<DrawStatus>('idle');
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [activeSpinPlan, setActiveSpinPlan] = useState<ActiveSpinPlan | null>(null);
  const [latestWinner, setLatestWinner] = useState<WinnerRecord | null>(null);

  const isSpinningRef = useRef<boolean>(false);
  const fetchEpochRef = useRef<number>(0);

  // Sync mute state with sound service
  useEffect(() => {
    soundService.setMuted(settings.isMuted);
    saveEventSettings(settings);
  }, [settings]);

  // Persist winner history changes
  useEffect(() => {
    saveWinnerHistory(winnerHistory);
  }, [winnerHistory]);

  // Eligible participants after applying "Exclude Previous Winners"
  const eligibleParticipants = useMemo(() => {
    if (!settings.excludePreviousWinners || winnerHistory.length === 0) {
      return allParticipants;
    }
    const wonIds = new Set(winnerHistory.map((w) => w.participantId));
    return allParticipants.filter((p) => !wonIds.has(p.id));
  }, [allParticipants, settings.excludePreviousWinners, winnerHistory]);

  const allParticipantsHaveWon =
    allParticipants.length > 0 &&
    settings.excludePreviousWinners &&
    eligibleParticipants.length === 0;

  // Idle display slices when not actively spinning
  const idleDisplaySlices = useMemo(
    () => buildIdleDisplayWindow(eligibleParticipants, MAX_VISIBLE_SLICES),
    [eligibleParticipants]
  );

  const currentDisplaySlices =
    activeSpinPlan && drawStatus !== 'idle' ? activeSpinPlan.displaySlices : idleDisplaySlices;

  const isAdaptiveModeActive = eligibleParticipants.length > MAX_VISIBLE_SLICES;

  /**
   * Synchronizes participant list from Google Sheets (or Sandbox when explicitly enabled).
   * Prevents mid-spin mutation and preserves last valid snapshot if a refresh request fails.
   */
  const refreshParticipants = useCallback(
    async (forceLive: boolean = false) => {
      if (isSpinningRef.current) {
        return;
      }

      if (settings.sandboxMode && !forceLive) {
        const sandboxResult = generateSandboxParticipants(settings.sandboxCohortSize);
        setAllParticipants(sandboxResult.participants);
        setDiagnostics(sandboxResult.diagnostics);
        setLastSyncedAt(sandboxResult.fetchedAt);
        setConnectionState('sandbox');
        setSyncError(null);
        setActiveSpinPlan(null);
        return;
      }

      const requestEpoch = ++fetchEpochRef.current;
      setIsRefreshing(true);
      if (allParticipants.length === 0) {
        setConnectionState('loading');
      }

      try {
        const result = await fetchLiveParticipants();
        // Discard stale response if user switched modes or triggered a newer refresh mid-flight
        if (requestEpoch !== fetchEpochRef.current) {
          return;
        }
        setAllParticipants(result.participants);
        setLiveBackupParticipants(result.participants);
        setDiagnostics(result.diagnostics);
        setLastSyncedAt(result.fetchedAt);
        setSyncError(null);
        setActiveSpinPlan(null);
        setConnectionState(result.participants.length > 0 ? 'connected' : 'empty');
      } catch (err) {
        if (requestEpoch !== fetchEpochRef.current) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to fetch latest participants from Google Sheets.';
        setSyncError(message);

        // Preserve last known valid participant data on refresh failure
        setAllParticipants((prev) => {
          const fallback = liveBackupParticipants ?? prev;
          if (fallback.length > 0) {
            setConnectionState('stale_warning');
            return fallback;
          } else {
            setConnectionState('error');
            return [];
          }
        });
      } finally {
        if (requestEpoch === fetchEpochRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [allParticipants.length, liveBackupParticipants, settings.sandboxCohortSize, settings.sandboxMode]
  );

  // Initial load on mount
  useEffect(() => {
    void refreshParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initiates a cryptographically fair spin from the frozen eligible participant pool.
   */
  const startSpin = useCallback(() => {
    if (isSpinningRef.current || drawStatus === 'spinning') {
      return;
    }
    if (eligibleParticipants.length === 0) {
      return;
    }

    isSpinningRef.current = true;

    // 1. Freeze eligible participant snapshot for this spin
    const frozenPool = [...eligibleParticipants];

    // 2. Cryptographically select winner index with rejection sampling
    const winnerPoolIndex = selectRandomIndex(frozenPool.length);
    const selectedWinner = frozenPool[winnerPoolIndex];

    // 3. Construct visual wheel slice window (1..48 slices) containing selected winner
    const { displaySlices, targetSliceIndex, isAdaptiveWindow } = buildAdaptiveSpinWindow({
      eligibleParticipants: frozenPool,
      winnerPoolIndex,
      maxSlices: MAX_VISIBLE_SLICES,
    });

    // 4. Calculate exact target cumulative rotation angle so pointer lands on targetSliceIndex
    const targetRotation = calculateTargetRotation({
      currentRotation,
      targetSliceIndex,
      totalSlices: displaySlices.length,
      minSpins: 7,
      maxSpins: 9,
    });

    const effectiveDuration =
      typeof spinDurationMs === 'number'
        ? spinDurationMs
        : prefersReducedMotion
        ? 120
        : 6000;

    const plan: ActiveSpinPlan = {
      winner: selectedWinner,
      winnerPoolIndex,
      totalEligibleCount: frozenPool.length,
      displaySlices,
      targetSliceIndex,
      startRotation: currentRotation,
      targetRotation,
      durationMs: effectiveDuration,
      isAdaptiveWindow,
    };

    setLatestWinner(null);
    setActiveSpinPlan(plan);
    setDrawStatus('spinning');
    soundService.playSpinStart();
  }, [currentRotation, drawStatus, eligibleParticipants, prefersReducedMotion, spinDurationMs]);

  /**
   * Invoked when the wheel canvas completes its rotation animation onto targetRotation.
   */
  const handleSpinComplete = useCallback(() => {
    if (!activeSpinPlan) {
      isSpinningRef.current = false;
      setDrawStatus('idle');
      return;
    }

    const finalRotation = activeSpinPlan.targetRotation;
    setCurrentRotation(finalRotation);

    const newRecord: WinnerRecord = {
      id: `win_${Date.now()}_${activeSpinPlan.winner.id}`,
      participantId: activeSpinPlan.winner.id,
      winnerName: activeSpinPlan.winner.name,
      selectedAt: new Date().toISOString(),
      spinSequenceNumber: winnerHistory.length + 1,
      poolSizeAtDraw: activeSpinPlan.totalEligibleCount,
      isSandbox: settings.sandboxMode,
    };

    setWinnerHistory((prev) => [newRecord, ...prev]);
    setLatestWinner(newRecord);
    isSpinningRef.current = false;
    setDrawStatus('winner_revealed');
    soundService.playWinnerFanfare();
  }, [activeSpinPlan, settings.sandboxMode, winnerHistory.length]);

  const closeWinnerModal = useCallback(() => {
    if (isSpinningRef.current) return;
    setDrawStatus('idle');
    setActiveSpinPlan(null);
  }, []);

  const toggleMute = useCallback(() => {
    setSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setExcludePreviousWinners = useCallback((exclude: boolean) => {
    if (isSpinningRef.current) return;
    setSettings((prev) => ({ ...prev, excludePreviousWinners: exclude }));
  }, []);

  const setSandboxMode = useCallback(
    (enabled: boolean, cohortSize?: SandboxCohortSize) => {
      if (isSpinningRef.current) return;
      const nextSize = cohortSize ?? settings.sandboxCohortSize;
      setSettings((prev) => ({
        ...prev,
        sandboxMode: enabled,
        sandboxCohortSize: nextSize,
      }));

      if (enabled) {
        // Invalidate any in-flight live Google Sheets request so it cannot overwrite sandbox data
        fetchEpochRef.current += 1;
        setIsRefreshing(false);
        const sandboxResult = generateSandboxParticipants(nextSize);
        setAllParticipants(sandboxResult.participants);
        setDiagnostics(sandboxResult.diagnostics);
        setLastSyncedAt(sandboxResult.fetchedAt);
        setConnectionState('sandbox');
        setSyncError(null);
        setActiveSpinPlan(null);
      } else {
        void refreshParticipants(true);
      }
    },
    [refreshParticipants, settings.sandboxCohortSize]
  );

  const resetEventSession = useCallback(() => {
    if (isSpinningRef.current) return;
    setWinnerHistory([]);
    clearWinnerHistoryStorage();
    setLatestWinner(null);
    setActiveSpinPlan(null);
    setDrawStatus('idle');
  }, []);

  return {
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
  };
}
