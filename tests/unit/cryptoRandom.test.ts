import { describe, expect, it } from 'vitest';
import {
  buildAdaptiveSpinWindow,
  calculateTargetRotation,
  evaluateWheelEasing,
  getSliceIndexAtPointer,
  MAX_VISIBLE_SLICES,
  selectRandomIndex,
} from '../../src/utils/cryptoRandom';
import { Participant } from '../../src/types';

describe('cryptoRandom — Cryptographic Selection & Wheel Angle Solver', () => {
  it('throws on invalid pool sizes (<= 0 or non-integer)', () => {
    expect(() => selectRandomIndex(0)).toThrow();
    expect(() => selectRandomIndex(-5)).toThrow();
    expect(() => selectRandomIndex(2.5)).toThrow();
  });

  it('always returns 0 when poolSize is 1', () => {
    expect(selectRandomIndex(1)).toBe(0);
  });

  it('can select every eligible index in range [0, N-1] using deterministic RNG', () => {
    const poolSize = 7;
    for (let expectedIdx = 0; expectedIdx < poolSize; expectedIdx++) {
      const selected = selectRandomIndex(poolSize, () => expectedIdx);
      expect(selected).toBe(expectedIdx);
    }
  });

  it('applies rejection sampling to eliminate modulo bias near 2^32 boundary', () => {
    const poolSize = 10;
    // 2^32 = 4,294,967,296. Limit = 4,294,967,290.
    // Values 4,294,967,290..4,294,967,295 must be rejected!
    const samples = [4294967295, 4294967291, 4294967290, 27];
    let cursor = 0;
    const result = selectRandomIndex(poolSize, () => samples[cursor++]);
    expect(cursor).toBe(4); // First 3 biased samples rejected, 4th accepted
    expect(result).toBe(7); // 27 % 10 === 7
  });

  it('always keeps selected index in range across diverse cohort sizes (2, 48, 128, 500)', () => {
    for (const size of [2, 15, 48, 128, 500, 1000]) {
      for (let i = 0; i < 50; i++) {
        const idx = selectRandomIndex(size);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(size);
      }
    }
  });

  it('computes a target rotation angle that lands precisely on targetSliceIndex under the top pointer', () => {
    const sliceCounts = [1, 2, 3, 7, 12, 24, 37, 48];
    for (const totalSlices of sliceCounts) {
      let currentRotation = 0;
      for (let targetIdx = 0; targetIdx < totalSlices; targetIdx++) {
        const nextRotation = calculateTargetRotation({
          currentRotation,
          targetSliceIndex: targetIdx,
          totalSlices,
          minSpins: 7,
          maxSpins: 9,
        });

        expect(nextRotation).toBeGreaterThan(currentRotation);
        const landedIndex = getSliceIndexAtPointer(nextRotation, totalSlices);
        expect(landedIndex).toBe(targetIdx);
        currentRotation = nextRotation;
      }
    }
  });

  it('constructs an adaptive 48-slice display window for 500+ participants with the winner guaranteed at targetSliceIndex', () => {
    const largePool: Participant[] = Array.from({ length: 500 }, (_, i) => ({
      id: `reg_${i + 1}`,
      name: `Student #${i + 1}`,
      hasDistinctId: true,
    }));

    const winnerPoolIndex = 347; // Student #348
    const { displaySlices, targetSliceIndex, isAdaptiveWindow } = buildAdaptiveSpinWindow({
      eligibleParticipants: largePool,
      winnerPoolIndex,
      maxSlices: MAX_VISIBLE_SLICES,
    });

    expect(isAdaptiveWindow).toBe(true);
    expect(displaySlices).toHaveLength(MAX_VISIBLE_SLICES);
    expect(targetSliceIndex).toBeGreaterThanOrEqual(0);
    expect(targetSliceIndex).toBeLessThan(MAX_VISIBLE_SLICES);
    expect(displaySlices[targetSliceIndex]).toEqual(largePool[winnerPoolIndex]);

    // Verify all 48 displayed participants are unique
    const uniqueIds = new Set(displaySlices.map((p) => p.id));
    expect(uniqueIds.size).toBe(MAX_VISIBLE_SLICES);
  });

  it('evaluates smooth deceleration easing curve with E(0) = 0 and E(1) = 1', () => {
    expect(evaluateWheelEasing(0)).toBeCloseTo(0, 6);
    expect(evaluateWheelEasing(1)).toBeCloseTo(1, 6);
    expect(evaluateWheelEasing(0.5)).toBeGreaterThan(0.8); // Fast initial spin, gradual deceleration
  });
});
