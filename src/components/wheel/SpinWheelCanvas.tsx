import React, { useEffect, useRef, useState } from 'react';
import { ActiveSpinPlan, DrawStatus, Participant } from '../../types';
import {
  evaluateWheelEasing,
  getSliceIndexAtPointer,
  TWO_PI,
} from '../../utils/cryptoRandom';
import { soundService } from '../../services/soundService';

interface SpinWheelCanvasProps {
  slices: Participant[];
  rotation: number;
  drawStatus: DrawStatus;
  activeSpinPlan: ActiveSpinPlan | null;
  prefersReducedMotion: boolean;
  onSpinComplete: () => void;
}

const SLICE_PALETTE = [
  '#1F143D', // Deep Indigo Violet
  '#4C1D95', // Royal AWS Purple
  '#6D28D9', // Vibrant Amethyst
  '#2E1065', // Midnight Plum
];

function getSliceColor(index: number, total: number): string {
  if (total > 1 && index === total - 1 && total % SLICE_PALETTE.length === 1) {
    return '#3B177E'; // Prevent first and last slice sharing shade 0
  }
  return SLICE_PALETTE[index % SLICE_PALETTE.length];
}

function truncateLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(4, maxChars - 1)).trimEnd() + '…';
}

export const SpinWheelCanvas: React.FC<SpinWheelCanvasProps> = ({
  slices,
  rotation,
  drawStatus,
  activeSpinPlan,
  prefersReducedMotion,
  onSpinComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<number>(480);

  const animatedRotationRef = useRef<number>(rotation);
  const pointerDeflectionRef = useRef<number>(0);
  const ledPhaseRef = useRef<number>(0);
  const onSpinCompleteRef = useRef(onSpinComplete);

  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  // Keep stationary rotation synced when idle
  useEffect(() => {
    if (drawStatus !== 'spinning') {
      animatedRotationRef.current = rotation;
    }
  }, [drawStatus, rotation]);

  // Responsive sizing via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const width = rect.width || 340;
      const clamped = Math.max(270, Math.min(540, Math.floor(width)));
      setCanvasSize(clamped);
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Core Canvas Renderer
  const renderWheelFrame = (
    currentAngle: number,
    pointerDeflection: number,
    ledPhase: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const targetPixelSize = Math.floor(canvasSize * dpr);
    if (canvas.width !== targetPixelSize || canvas.height !== targetPixelSize) {
      canvas.width = targetPixelSize;
      canvas.height = targetPixelSize;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const outerRadius = canvasSize / 2 - 16;
    const rimWidth = Math.max(12, Math.floor(canvasSize * 0.034));
    const wheelRadius = outerRadius - rimWidth;
    const hubRadius = Math.max(32, Math.floor(wheelRadius * 0.19));

    // 1. Outer ambient glow shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
    ctx.shadowColor = 'rgba(139, 92, 246, 0.55)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#120D24';
    ctx.fill();
    ctx.restore();

    // 2. Metallic Violet Outer Bezel Ring
    const bezelGrad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    bezelGrad.addColorStop(0, '#3B1D7A');
    bezelGrad.addColorStop(0.5, '#191130');
    bezelGrad.addColorStop(1, '#4C1D95');

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
    ctx.fillStyle = bezelGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.45)';
    ctx.stroke();

    // 3. Perimeter LED indicator lights on the bezel
    const ledCount = 24;
    const ledOrbitRadius = outerRadius - rimWidth / 2;
    for (let i = 0; i < ledCount; i++) {
      const ledAngle = (i * TWO_PI) / ledCount;
      const lx = cx + Math.cos(ledAngle) * ledOrbitRadius;
      const ly = cy + Math.sin(ledAngle) * ledOrbitRadius;
      const isLit = (i + Math.floor(ledPhase)) % 2 === 0;

      ctx.beginPath();
      ctx.arc(lx, ly, isLit ? 2.6 : 1.8, 0, TWO_PI);
      ctx.fillStyle = isLit ? '#E9D5FF' : 'rgba(196, 181, 253, 0.32)';
      ctx.fill();
    }

    // 4. Wheel Segments
    const totalSlices = slices.length;
    if (totalSlices === 0) {
      // Empty State Wheel Drum
      const emptyGrad = ctx.createRadialGradient(cx, cy, hubRadius, cx, cy, wheelRadius);
      emptyGrad.addColorStop(0, '#22183C');
      emptyGrad.addColorStop(1, '#120D24');

      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, TWO_PI);
      ctx.fillStyle = emptyGrad;
      ctx.fill();

      // Subtle placeholder radial lines
      const placeholderSpokes = 12;
      for (let i = 0; i < placeholderSpokes; i++) {
        const angle = (i * TWO_PI) / placeholderSpokes;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * hubRadius, cy + Math.sin(angle) * hubRadius);
        ctx.lineTo(cx + Math.cos(angle) * wheelRadius, cy + Math.sin(angle) * wheelRadius);
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      const sliceArc = TWO_PI / totalSlices;
      const activePointerIndex = getSliceIndexAtPointer(currentAngle, totalSlices);

      for (let i = 0; i < totalSlices; i++) {
        const startAngle = currentAngle + i * sliceArc;
        const endAngle = startAngle + sliceArc;
        const midAngle = startAngle + sliceArc / 2;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
        ctx.closePath();

        const baseColor = getSliceColor(i, totalSlices);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Highlight winning slice when revealed
        if (drawStatus === 'winner_revealed' && i === activePointerIndex) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.38)';
          ctx.fill();
        }

        // Segment border
        ctx.lineWidth = totalSlices > 32 ? 0.9 : 1.4;
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.26)';
        ctx.stroke();
        ctx.restore();

        // Participant Name Label along the slice radius
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midAngle);

        const fontSize =
          totalSlices <= 8
            ? Math.max(13, Math.floor(wheelRadius * 0.075))
            : totalSlices <= 16
            ? Math.max(12, Math.floor(wheelRadius * 0.064))
            : totalSlices <= 28
            ? Math.max(11, Math.floor(wheelRadius * 0.052))
            : Math.max(9.5, Math.floor(wheelRadius * 0.043));

        const maxChars =
          totalSlices <= 12 ? 22 : totalSlices <= 28 ? 19 : 16;

        const labelText = truncateLabel(slices[i].name, maxChars);

        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(9, 7, 20, 0.85)';
        ctx.shadowBlur = 4;

        const textRadius = wheelRadius - Math.max(14, Math.floor(wheelRadius * 0.065));
        ctx.fillText(labelText, textRadius, 0);
        ctx.restore();
      }

      // Perimeter pegs between slices
      for (let i = 0; i < totalSlices; i++) {
        const pegAngle = currentAngle + i * sliceArc;
        const px = cx + Math.cos(pegAngle) * (wheelRadius - 3);
        const py = cy + Math.sin(pegAngle) * (wheelRadius - 3);

        ctx.beginPath();
        ctx.arc(px, py, totalSlices > 32 ? 2 : 2.8, 0, TWO_PI);
        ctx.fillStyle = '#DDD6FE';
        ctx.fill();
      }
    }

    // 5. Inner Wheel Rim Shadow Ring
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius, 0, TWO_PI);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.5)';
    ctx.stroke();

    // 6. Central Hub Medallion
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 5, 0, TWO_PI);
    ctx.fillStyle = 'rgba(9, 7, 20, 0.7)';
    ctx.fill();

    const hubGrad = ctx.createRadialGradient(
      cx - hubRadius * 0.25,
      cy - hubRadius * 0.25,
      4,
      cx,
      cy,
      hubRadius
    );
    hubGrad.addColorStop(0, '#A855F7');
    hubGrad.addColorStop(0.55, '#5B21B6');
    hubGrad.addColorStop(1, '#1E113A');

    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, TWO_PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#DDD6FE';
    ctx.stroke();

    // Hub inner emblem text
    ctx.font = `800 ${Math.max(10, Math.floor(hubRadius * 0.34))}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AWS', cx, cy - hubRadius * 0.14);

    ctx.font = `600 ${Math.max(7.5, Math.floor(hubRadius * 0.22))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#DDD6FE';
    ctx.fillText('CUI', cx, cy + hubRadius * 0.24);
    ctx.restore();

    // 7. Fixed Top-Center (12 o'clock) Jewelled Pointer
    ctx.save();
    const pointerPivotX = cx;
    const pointerPivotY = cy - outerRadius + 4;
    ctx.translate(pointerPivotX, pointerPivotY);
    ctx.rotate(pointerDeflection);

    ctx.shadowColor = 'rgba(9, 7, 20, 0.85)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    // Pointer teardown triangle pointing downward into the wheel
    const pointerHeight = Math.max(28, Math.floor(canvasSize * 0.072));
    const pointerHalfWidth = Math.max(12, Math.floor(canvasSize * 0.03));

    const ptrGrad = ctx.createLinearGradient(0, -10, 0, pointerHeight);
    ptrGrad.addColorStop(0, '#F5D0FE');
    ptrGrad.addColorStop(0.45, '#A855F7');
    ptrGrad.addColorStop(1, '#6D28D9');

    ctx.beginPath();
    ctx.moveTo(0, pointerHeight); // Tip pointing at winning segment
    ctx.lineTo(-pointerHalfWidth, -4);
    ctx.quadraticCurveTo(0, -12, pointerHalfWidth, -4);
    ctx.closePath();

    ctx.fillStyle = ptrGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Jewelled rivet inside pointer mount
    ctx.beginPath();
    ctx.arc(0, 2, 4.5, 0, TWO_PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  // Repaint on stationary state or resize
  useEffect(() => {
    if (drawStatus !== 'spinning') {
      renderWheelFrame(animatedRotationRef.current, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, slices, rotation, drawStatus]);

  // High-precision requestAnimationFrame Spin Loop
  useEffect(() => {
    if (drawStatus !== 'spinning' || !activeSpinPlan) {
      return;
    }

    const { startRotation, targetRotation, durationMs, displaySlices } = activeSpinPlan;
    const totalDelta = targetRotation - startRotation;
    const sliceCount = displaySlices.length;

    // Fast path for reduced motion or ultra-short unit test durations
    if (prefersReducedMotion || durationMs <= 160) {
      animatedRotationRef.current = targetRotation;
      renderWheelFrame(targetRotation, 0, 1);
      const timer = window.setTimeout(() => {
        onSpinCompleteRef.current();
      }, Math.max(20, durationMs));
      return () => window.clearTimeout(timer);
    }

    let animationFrameId: number | null = null;
    let isCancelled = false;
    const startTime = performance.now();
    let previousSliceIndex = getSliceIndexAtPointer(startRotation, sliceCount);

    const step = (now: number) => {
      if (isCancelled) return;

      const elapsed = now - startTime;
      const rawProgress = Math.min(1, Math.max(0, elapsed / durationMs));
      const easedProgress = evaluateWheelEasing(rawProgress);

      const currentAngle = startRotation + totalDelta * easedProgress;
      animatedRotationRef.current = currentAngle;

      // Detect segment boundary crossing for pointer deflection & audio tick
      const currentSliceIndex = getSliceIndexAtPointer(currentAngle, sliceCount);
      const instantaneousVelocity = Math.max(0, 1 - rawProgress);

      if (currentSliceIndex !== previousSliceIndex) {
        previousSliceIndex = currentSliceIndex;
        // Deflect pointer in direction of clockwise motion
        pointerDeflectionRef.current = -Math.min(0.34, 0.12 + instantaneousVelocity * 0.24);
        soundService.playWheelTick(instantaneousVelocity);
      } else {
        // Spring relaxation back to 0
        pointerDeflectionRef.current *= 0.82;
      }

      ledPhaseRef.current += 0.08 + instantaneousVelocity * 0.25;

      renderWheelFrame(
        currentAngle,
        pointerDeflectionRef.current,
        ledPhaseRef.current
      );

      if (rawProgress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        animatedRotationRef.current = targetRotation;
        pointerDeflectionRef.current = 0;
        renderWheelFrame(targetRotation, 0, ledPhaseRef.current);
        onSpinCompleteRef.current();
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      isCancelled = true;
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpinPlan, drawStatus, prefersReducedMotion]);

  // Determine the participant currently under the pointer for accessibility & verification
  const currentPointerIndex =
    slices.length > 0 ? getSliceIndexAtPointer(animatedRotationRef.current, slices.length) : -1;
  const currentPointerParticipant =
    currentPointerIndex >= 0 && currentPointerIndex < slices.length
      ? slices[currentPointerIndex]
      : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[330px] sm:max-w-[440px] lg:max-w-[510px] aspect-square mx-auto flex items-center justify-center select-none"
    >
      {/* Backlight stage halo */}
      <div
        aria-hidden="true"
        className={`absolute inset-4 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${
          drawStatus === 'spinning' ? 'opacity-85' : 'opacity-45'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(139, 92, 246, 0.18) 60%, transparent 80%)',
        }}
      />

      <canvas
        ref={canvasRef}
        data-testid="spin-wheel-canvas"
        data-slice-count={slices.length}
        data-pointer-participant={currentPointerParticipant?.name ?? ''}
        width={canvasSize}
        height={canvasSize}
        style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
        aria-label={`Lucky draw spin wheel with ${slices.length} visible segments`}
        role="img"
        className="relative z-10 block rounded-full"
      />
    </div>
  );
};
