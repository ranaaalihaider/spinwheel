import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../../src/App';
import * as participantService from '../../src/services/participantService';
import { ParticipantFetchResult } from '../../src/types';

function createMockFetchResult(names: string[]): ParticipantFetchResult {
  return {
    participants: names.map((name, idx) => ({
      id: `reg_mock_${idx + 1}`,
      name,
      hasDistinctId: true,
    })),
    fetchedAt: '2026-11-24T01:45:00.000Z',
    diagnostics: {
      totalRowsScanned: names.length,
      validParticipants: names.length,
      duplicatesRemoved: 0,
      blankRowsIgnored: 0,
      sourceLabel: 'Google Sheets Live Sync',
      deduplicationMode: 'registration_number_and_name_fallback',
    },
  };
}

describe('App — End-to-End Functional & Edge Case Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders the splash screen on initial load and transitions to the main interface', async () => {
    vi.spyOn(participantService, 'fetchLiveParticipants').mockResolvedValue(
      createMockFetchResult(['Areeba Khan', 'Hamza Tariq'])
    );

    render(<App skipSplashForTests={false} spinDurationMs={40} />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    expect(screen.getAllByText('AWS Student Builder Group').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('COMSATS University Islamabad').length).toBeGreaterThanOrEqual(1);
  });

  it('displays the required Empty Sheet message and disables spinning when 0 participants exist', async () => {
    vi.spyOn(participantService, 'fetchLiveParticipants').mockResolvedValue(
      createMockFetchResult([])
    );

    render(<App skipSplashForTests={true} spinDurationMs={40} />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-participants-state')).toBeInTheDocument();
    });

    expect(
      screen.getByText('No participants available yet. Please check the registration sheet.')
    ).toBeInTheDocument();

    const spinButton = screen.getByTestId('spin-wheel-button');
    expect(spinButton).toBeDisabled();
  });

  it('loads participants, updates the count badge, spins fairly, announces the winner, and excludes repeat winners', async () => {
    vi.spyOn(participantService, 'fetchLiveParticipants').mockResolvedValue(
      createMockFetchResult(['Areeba Khan', 'Hamza Tariq'])
    );

    render(<App skipSplashForTests={true} spinDurationMs={30} />);

    await waitFor(() => {
      expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
        '2Participants Ready'
      );
    });

    const spinButton = screen.getByTestId('spin-wheel-button');
    expect(spinButton).not.toBeDisabled();

    // Spin #1
    fireEvent.click(spinButton);

    await waitFor(() => {
      expect(screen.getByTestId('winner-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('CONGRATULATIONS!')).toBeInTheDocument();
    expect(screen.getByText('You are our lucky winner!')).toBeInTheDocument();

    const firstWinnerName = screen.getByTestId('winner-modal-name').textContent;
    expect(['Areeba Khan', 'Hamza Tariq']).toContain(firstWinnerName);

    // Close modal and verify winner #1 is recorded in history and excluded from eligible pool
    fireEvent.click(screen.getByTestId('winner-close-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('winner-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('winner-history-count')).toHaveTextContent('1');
    expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
      '1Participant Ready'
    );

    // Spin #2 must select the remaining eligible participant
    fireEvent.click(screen.getByTestId('spin-wheel-button'));

    await waitFor(() => {
      expect(screen.getByTestId('winner-modal')).toBeInTheDocument();
    });

    const secondWinnerName = screen.getByTestId('winner-modal-name').textContent;
    expect(secondWinnerName).not.toBe(firstWinnerName);
    expect(['Areeba Khan', 'Hamza Tariq']).toContain(secondWinnerName);

    fireEvent.click(screen.getByTestId('winner-close-btn'));

    // Now all 2 participants have won!
    await waitFor(() => {
      expect(screen.getByTestId('all-winners-exhausted-state')).toBeInTheDocument();
    });
    expect(screen.getByTestId('spin-wheel-button')).toBeDisabled();

    // Reset winner eligibility and confirm all 2 participants are eligible again
    fireEvent.click(screen.getByTestId('exhausted-reset-trigger-btn'));
    fireEvent.click(screen.getByTestId('exhausted-confirm-reset-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
        '2Participants Ready'
      );
    });
    expect(screen.getByTestId('winner-history-count')).toHaveTextContent('0');
  });

  it('preserves the last valid participant list and displays a warning if a subsequent refresh fails', async () => {
    const fetchSpy = vi
      .spyOn(participantService, 'fetchLiveParticipants')
      .mockResolvedValueOnce(
        createMockFetchResult(['Areeba Khan', 'Hamza Tariq', 'Zainab Ali'])
      )
      .mockRejectedValueOnce(new Error('Network timeout while connecting to Google Sheets'));

    render(<App skipSplashForTests={true} spinDurationMs={30} />);

    await waitFor(() => {
      expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
        '3Participants Ready'
      );
    });

    // Trigger manual refresh which will fail
    const refreshBtn = screen.getByRole('button', { name: /Refresh Participants/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByTestId('sync-warning-banner')).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    // All 3 participants remain loaded and playable!
    expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
      '3Participants Ready'
    );
    expect(screen.getByTestId('spin-wheel-button')).not.toBeDisabled();
  });

  it('supports unlocking the Organizer Panel with PIN 2026 and switching to 500-participant Adaptive Sandbox Mode', async () => {
    vi.spyOn(participantService, 'fetchLiveParticipants').mockResolvedValue(
      createMockFetchResult([])
    );

    render(<App skipSplashForTests={true} spinDurationMs={30} />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-participants-state')).toBeInTheDocument();
    });

    // Open Organizer Panel
    fireEvent.click(screen.getByTestId('empty-open-organizer-btn'));
    expect(screen.getByTestId('organizer-panel')).toBeInTheDocument();

    // Unlock with PIN 2026
    const pinInput = screen.getByTestId('organizer-pin-input');
    fireEvent.change(pinInput, { target: { value: '2026' } });
    fireEvent.click(screen.getByTestId('organizer-pin-unlock-btn'));

    // Enable Sandbox Mode & select 500 students
    fireEvent.click(screen.getByTestId('toggle-sandbox-mode'));
    fireEvent.click(screen.getByTestId('sandbox-size-500'));

    await waitFor(() => {
      expect(screen.getByTestId('header-participant-count')).toHaveTextContent(
        '500Participants Ready'
      );
    });

    // Adaptive cohort badge should be visible showing 48 visible segments for 500 eligible students
    expect(screen.getByTestId('adaptive-cohort-badge')).toBeInTheDocument();
    expect(screen.getByTestId('sandbox-active-banner')).toBeInTheDocument();
  });
});
