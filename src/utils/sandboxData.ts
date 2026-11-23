import { Participant, ParticipantFetchResult, SandboxCohortSize } from '../types';

const SAMPLE_FIRST_NAMES = [
  'Areeba',
  'Hamza',
  'Zainab',
  'Muhammad',
  'Fatima',
  'Abdullah',
  'Ayesha',
  'Usman',
  'Hira',
  'Bilal',
  'Noor',
  'Saad',
  'Maryam',
  'Hassan',
  'Laiba',
  'Talha',
  'Khadija',
  'Ammar',
  'Sana',
  'Haris',
  'Momina',
  'Daniyal',
  'Eman',
  'Huzaifa',
];

const SAMPLE_LAST_NAMES = [
  'Khan',
  'Tariq',
  'Ali',
  'Raza',
  'Nadeem',
  'Ahmed',
  'Malik',
  'Qureshi',
  'Sheikh',
  'Chaudhry',
  'Farooq',
  'Javed',
  'Siddiqui',
  'Abbasi',
  'Baig',
  'Hashmi',
];

/**
 * Generates an explicitly marked Development / Test Sandbox participant list.
 * NEVER used silently as production data — only active when the organizer explicitly turns on
 * the Sandbox Mode switch inside the Organizer Panel.
 */
export function generateSandboxParticipants(count: SandboxCohortSize): ParticipantFetchResult {
  const participants: Participant[] = [];
  for (let i = 0; i < count; i++) {
    const first = SAMPLE_FIRST_NAMES[i % SAMPLE_FIRST_NAMES.length];
    const last = SAMPLE_LAST_NAMES[Math.floor(i / SAMPLE_FIRST_NAMES.length) % SAMPLE_LAST_NAMES.length];
    const suffix = count > 48 ? ` #${i + 1}` : '';
    participants.push({
      id: `sandbox_reg_${i + 1}`,
      name: `${first} ${last}${suffix}`,
      hasDistinctId: true,
    });
  }

  return {
    participants,
    fetchedAt: new Date().toISOString(),
    diagnostics: {
      totalRowsScanned: count,
      validParticipants: count,
      duplicatesRemoved: 0,
      blankRowsIgnored: 0,
      sourceLabel: `Development / Test Sandbox (${count} Mock Participants)`,
      deduplicationMode: 'registration_number_and_name_fallback',
    },
  };
}
