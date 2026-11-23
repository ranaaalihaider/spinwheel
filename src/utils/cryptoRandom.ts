import { Participant } from '../types';

/**
 * Maximum number of segments displayed simultaneously on the visual wheel canvas.
 * Keeps individual slice arcs >= 7.5 degrees so names remain legible on projectors and phones,
 * while cryptographic selection always draws fairly from 100% of eligible participants.
 */
export const MAX_VISIBLE_SLICES = 48;

/**
 * Pointer angle in standard canvas coordinates (0 rad = 3 o'clock, clockwise positive).
 * Top center (12 o'clock) corresponds to 3 * PI / 2 (270 degrees).
 */
export const POINTER_ANGLE_RAD = 1.5 * Math.PI;
export const TWO_PI = 2 * Math.PI;

/**
 * Default cryptographically secure 32-bit unsigned integer generator using Web Crypto API.
 */
export function defaultCryptoUint32(): number {
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0];
}

/**
 * Selects a uniform random integer in [0, poolSize - 1] using rejection sampling
 * to eliminate modulo bias across the 2^32 unsigned integer space.
 */
export function selectRandomIndex(
  poolSize: number,
  getRandomUint32: () => number = defaultCryptoUint32
): number {
  if (!Number.isInteger(poolSize) || poolSize <= 0) {
    throw new Error(`Invalid poolSize: ${poolSize}. Must be a positive integer.`);
  }
  if (poolSize === 1) {
    return 0;
  }

  const MAX_RANGE = 0x100000000; // 2^32 = 4,294,967,296
  const limit = MAX_RANGE - (MAX_RANGE % poolSize);

  let sample = getRandomUint32() >>> 0;
  while (sample >= limit) {
    sample = getRandomUint32() >>> 0;
  }

  return sample % poolSize;
}

/**
 * Normalizes any angle in radians into [0, 2*PI).
 */
export function normalizeAngle(angleRad: number): number {
  const mod = angleRad % TWO_PI;
  return mod < 0 ? mod + TWO_PI : mod;
}

/**
 * Given a wheel cumulative rotation angle (in radians) and totalSlices,
 * returns the exact slice index currently sitting under the top-center pointer (3*PI/2).
 */
export function getSliceIndexAtPointer(rotationRad: number, totalSlices: number): number {
  if (totalSlices <= 0) {
    return 0;
  }
  if (totalSlices === 1) {
    return 0;
  }
  const sliceArc = TWO_PI / totalSlices;
  const relativePointerAngle = normalizeAngle(POINTER_ANGLE_RAD - normalizeAngle(rotationRad));
  const rawIndex = Math.floor(relativePointerAngle / sliceArc);
  return Math.min(totalSlices - 1, Math.max(0, rawIndex));
}

/**
 * Calculates the exact target cumulative rotation angle (in radians) so that
 * `targetSliceIndex` stops directly underneath the top-center pointer after
 * completing between `minSpins` and `maxSpins` full revolutions.
 */
export function calculateTargetRotation(params: {
  currentRotation: number;
  targetSliceIndex: number;
  totalSlices: number;
  minSpins?: number;
  maxSpins?: number;
  jitterFactor?: number;
  getRandomUint32?: () => number;
}): number {
  const {
    currentRotation,
    targetSliceIndex,
    totalSlices,
    minSpins = 7,
    maxSpins = 9,
    jitterFactor = 0.24,
    getRandomUint32 = defaultCryptoUint32,
  } = params;

  if (totalSlices <= 0) {
    throw new Error('totalSlices must be at least 1');
  }
  if (targetSliceIndex < 0 || targetSliceIndex >= totalSlices) {
    throw new Error(`targetSliceIndex (${targetSliceIndex}) out of range [0, ${totalSlices - 1}]`);
  }

  const sliceArc = TWO_PI / totalSlices;
  const sliceCenterAtZero = (targetSliceIndex + 0.5) * sliceArc;

  // Sub-slice jitter within [-jitterFactor * sliceArc, +jitterFactor * sliceArc]
  // Bounded strictly inside [-0.35, +0.35] of the slice so it never approaches boundary lines.
  const safeJitter = Math.min(0.35, Math.max(0, jitterFactor));
  const randomUnit = (getRandomUint32() >>> 0) / 0x100000000; // [0, 1)
  const jitterRad = totalSlices > 1 ? (randomUnit * 2 - 1) * safeJitter * sliceArc : 0;

  // We want: normalizeAngle(sliceCenterAtZero + finalRotation) = normalizeAngle(POINTER_ANGLE_RAD + jitterRad)
  const desiredModRotation = normalizeAngle(POINTER_ANGLE_RAD - sliceCenterAtZero + jitterRad);
  const currentModRotation = normalizeAngle(currentRotation);

  let forwardDelta = normalizeAngle(desiredModRotation - currentModRotation);
  if (forwardDelta < 0.001) {
    forwardDelta += TWO_PI;
  }

  const spinRange = Math.max(0, maxSpins - minSpins + 1);
  const extraSpins = spinRange > 1 ? selectRandomIndex(spinRange, getRandomUint32) : 0;
  const fullRevolutions = (minSpins + extraSpins) * TWO_PI;

  return currentRotation + fullRevolutions + forwardDelta;
}

/**
 * Builds an idle display window of up to MAX_VISIBLE_SLICES participants for rendering
 * when the wheel is stationary.
 */
export function buildIdleDisplayWindow(
  eligibleParticipants: Participant[],
  maxSlices: number = MAX_VISIBLE_SLICES
): Participant[] {
  if (eligibleParticipants.length <= maxSlices) {
    return [...eligibleParticipants];
  }
  // Evenly stride through the full cohort so the idle wheel represents the whole sheet
  const result: Participant[] = [];
  const step = eligibleParticipants.length / maxSlices;
  for (let i = 0; i < maxSlices; i++) {
    const idx = Math.min(eligibleParticipants.length - 1, Math.floor(i * step));
    result.push(eligibleParticipants[idx]);
  }
  return result;
}

/**
 * When the eligible pool exceeds MAX_VISIBLE_SLICES (e.g., 100 to 1,000+ students),
 * constructs a display window of `maxSlices` participants containing the cryptographically
 * selected winner at a random slice index alongside `maxSlices - 1` distinct peers sampled
 * uniformly from the remaining eligible pool.
 */
export function buildAdaptiveSpinWindow(params: {
  eligibleParticipants: Participant[];
  winnerPoolIndex: number;
  maxSlices?: number;
  getRandomUint32?: () => number;
}): {
  displaySlices: Participant[];
  targetSliceIndex: number;
  isAdaptiveWindow: boolean;
} {
  const {
    eligibleParticipants,
    winnerPoolIndex,
    maxSlices = MAX_VISIBLE_SLICES,
    getRandomUint32 = defaultCryptoUint32,
  } = params;

  const total = eligibleParticipants.length;
  if (total === 0) {
    throw new Error('Cannot build spin window from empty participant pool');
  }
  if (winnerPoolIndex < 0 || winnerPoolIndex >= total) {
    throw new Error(`winnerPoolIndex (${winnerPoolIndex}) out of bounds for pool size ${total}`);
  }

  if (total <= maxSlices) {
    return {
      displaySlices: [...eligibleParticipants],
      targetSliceIndex: winnerPoolIndex,
      isAdaptiveWindow: false,
    };
  }

  const winner = eligibleParticipants[winnerPoolIndex];

  // Sample (maxSlices - 1) distinct non-winner indices using partial Fisher-Yates
  const otherIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (i !== winnerPoolIndex) {
      otherIndices.push(i);
    }
  }

  const peerCount = maxSlices - 1;
  for (let i = 0; i < peerCount; i++) {
    const remaining = otherIndices.length - i;
    const pickOffset = selectRandomIndex(remaining, getRandomUint32);
    const swapIdx = i + pickOffset;
    const temp = otherIndices[i];
    otherIndices[i] = otherIndices[swapIdx];
    otherIndices[swapIdx] = temp;
  }

  const selectedPeers = otherIndices.slice(0, peerCount).map((idx) => eligibleParticipants[idx]);

  // Choose the target slice index on the 48-slice wheel where the winner will sit
  const targetSliceIndex = selectRandomIndex(maxSlices, getRandomUint32);
  const displaySlices: Participant[] = [];

  let peerCursor = 0;
  for (let slot = 0; slot < maxSlices; slot++) {
    if (slot === targetSliceIndex) {
      displaySlices.push(winner);
    } else {
      displaySlices.push(selectedPeers[peerCursor++]);
    }
  }

  return {
    displaySlices,
    targetSliceIndex,
    isAdaptiveWindow: true,
  };
}

/**
 * Smooth multi-stage deceleration easing curve for the 6-second wheel rotation.
 * Continuous velocity derivative with zero snap at completion (t = 1).
 */
export function evaluateWheelEasing(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  // Quintic smoothstep-inspired deceleration with energetic initial launch
  const oneMinusT = 1 - t;
  return 1 - Math.pow(oneMinusT, 4) * (1 + 0.32 * t);
}
