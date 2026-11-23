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

// Bold 10-color palette — maximum contrast, projector-safe, eye-catching
const SLICE_PALETTE = [
  { bg: '#7C3AED', light: '#A78BFA', dark: '#4C1D95', text: '#FFFFFF' }, // Violet
  { bg: '#DB2777', light: '#F9A8D4', dark: '#831843', text: '#FFFFFF' }, // Pink
  { bg: '#D97706', light: '#FCD34D', dark: '#78350F', text: '#FFFFFF' }, // Amber
  { bg: '#059669', light: '#6EE7B7', dark: '#064E3B', text: '#FFFFFF' }, // Emerald
  { bg: '#2563EB', light: '#93C5FD', dark: '#1E3A8A', text: '#FFFFFF' }, // Blue
  { bg: '#DC2626', light: '#FCA5A5', dark: '#7F1D1D', text: '#FFFFFF' }, // Red
  { bg: '#7E22CE', light: '#D8B4FE', dark: '#3B0764', text: '#FFFFFF' }, // Purple
  { bg: '#0891B2', light: '#67E8F9', dark: '#164E63', text: '#FFFFFF' }, // Cyan
  { bg: '#EA580C', light: '#FDBA74', dark: '#7C2D12', text: '#FFFFFF' }, // Orange
  { bg: '#4F46E5', light: '#A5B4FC', dark: '#1E1B4B', text: '#FFFFFF' }, // Indigo
];

function getSliceTheme(index: number) {
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
  const [canvasSize, setCanvasSize] = useState<number>(500);

  const animatedRotationRef = useRef<number>(rotation);
  const pointerDeflectionRef = useRef<number>(0);
  const ledPhaseRef = useRef<number>(0);
  const glowPulseRef = useRef<number>(0);
  const onSpinCompleteRef = useRef(onSpinComplete);

  useEffect(() => { onSpinCompleteRef.current = onSpinComplete; }, [onSpinComplete]);

  useEffect(() => {
    if (drawStatus !== 'spinning') {
      animatedRotationRef.current = rotation;
    }
  }, [drawStatus, rotation]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const width = rect.width || 400;
      const clamped = Math.max(300, Math.min(620, Math.floor(width)));
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

  const renderWheelFrame = (currentAngle: number, pointerDeflection: number, ledPhase: number, glowPulse: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext('2d'); } catch { ctx = null; }
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
    const outerRadius = canvasSize / 2 - 14;
    const bezelWidth = Math.max(18, Math.floor(canvasSize * 0.055));
    const wheelRadius = outerRadius - bezelWidth;
    const hubRadius = Math.max(40, Math.floor(wheelRadius * 0.21));
    const isSpinning = drawStatus === 'spinning';

    // === OUTER GLOW HALOS ===
    // Multi-layer glow rings
    const glowColors = isSpinning
      ? ['rgba(168,85,247,0.6)', 'rgba(236,72,153,0.4)', 'rgba(59,130,246,0.3)']
      : ['rgba(139,92,246,0.4)', 'rgba(168,85,247,0.2)', 'rgba(109,40,217,0.15)'];
    const glowSizes = [outerRadius + 24 + glowPulse * 8, outerRadius + 14, outerRadius + 6];

    for (let g = 0; g < 3; g++) {
      const gGrad = ctx.createRadialGradient(cx, cy, outerRadius - 4, cx, cy, glowSizes[g]);
      gGrad.addColorStop(0, glowColors[g]);
      gGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, glowSizes[g], 0, TWO_PI);
      ctx.fillStyle = gGrad;
      ctx.fill();
      ctx.restore();
    }

    // === OUTER CHROME BEZEL ===
    // Shadow ring behind bezel
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius + 2, 0, TWO_PI);
    ctx.shadowColor = isSpinning ? 'rgba(168,85,247,1)' : 'rgba(139,92,246,0.7)';
    ctx.shadowBlur = isSpinning ? 30 + glowPulse * 15 : 20;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fill();
    ctx.restore();

    // Bezel with metallic conic gradient
    const bezelGrad = ctx.createConicGradient(-Math.PI / 4, cx, cy);
    bezelGrad.addColorStop(0.00, '#7C3AED');
    bezelGrad.addColorStop(0.10, '#C4B5FD');
    bezelGrad.addColorStop(0.20, '#4C1D95');
    bezelGrad.addColorStop(0.35, '#DB2777');
    bezelGrad.addColorStop(0.45, '#F9A8D4');
    bezelGrad.addColorStop(0.55, '#D97706');
    bezelGrad.addColorStop(0.65, '#FCD34D');
    bezelGrad.addColorStop(0.75, '#059669');
    bezelGrad.addColorStop(0.85, '#6EE7B7');
    bezelGrad.addColorStop(0.90, '#2563EB');
    bezelGrad.addColorStop(1.00, '#7C3AED');

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
    ctx.fillStyle = bezelGrad;
    ctx.fill();

    // Inner edge of bezel (dark ring)
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius + bezelWidth * 0.3, 0, TWO_PI);
    ctx.lineWidth = bezelWidth * 0.5;
    ctx.strokeStyle = 'rgba(10,5,25,0.9)';
    ctx.stroke();

    // Bezel outer rim highlight
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - 1, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // === LED DOTS ON BEZEL ===
    const ledCount = 36;
    const ledOrbit = outerRadius - bezelWidth / 2;
    for (let i = 0; i < ledCount; i++) {
      const ledAngle = (i * TWO_PI) / ledCount;
      const lx = cx + Math.cos(ledAngle) * ledOrbit;
      const ly = cy + Math.sin(ledAngle) * ledOrbit;
      const cyclePos = (ledPhase * 0.5 + i) % ledCount;
      const isLit = cyclePos % 2.5 < 1.8;
      const paletteIdx = Math.floor((ledPhase / 3 + i * 0.5)) % SLICE_PALETTE.length;
      const ledColor = isLit ? SLICE_PALETTE[paletteIdx].light : 'rgba(80,60,120,0.3)';
      const ledR = isLit ? 3.5 : 2;

      ctx.beginPath();
      ctx.arc(lx, ly, ledR, 0, TWO_PI);
      if (isLit) {
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = ledColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // === WHEEL SEGMENTS ===
    const totalSlices = slices.length;

    if (totalSlices === 0) {
      // Empty wheel placeholder
      const emptyGrad = ctx.createRadialGradient(cx, cy, hubRadius, cx, cy, wheelRadius);
      emptyGrad.addColorStop(0, '#1E0D4E');
      emptyGrad.addColorStop(0.6, '#0F0629');
      emptyGrad.addColorStop(1, '#060412');
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, TWO_PI);
      ctx.fillStyle = emptyGrad;
      ctx.fill();

      // Dashed spokes
      for (let i = 0; i < 8; i++) {
        const a = (i * TWO_PI) / 8;
        ctx.beginPath();
        ctx.setLineDash([6, 8]);
        ctx.moveTo(cx + Math.cos(a) * hubRadius, cy + Math.sin(a) * hubRadius);
        ctx.lineTo(cx + Math.cos(a) * wheelRadius, cy + Math.sin(a) * wheelRadius);
        ctx.strokeStyle = 'rgba(167,139,250,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Center text
      ctx.font = `bold ${Math.max(12, wheelRadius * 0.07)}px sans-serif`;
      ctx.fillStyle = 'rgba(167,139,250,0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No participants', cx, cy);
    } else {
      const sliceArc = TWO_PI / totalSlices;
      const activeIdx = getSliceIndexAtPointer(currentAngle, totalSlices);

      // === DRAW SEGMENTS ===
      for (let i = 0; i < totalSlices; i++) {
        const startAngle = currentAngle + i * sliceArc;
        const endAngle = startAngle + sliceArc;
        const midAngle = startAngle + sliceArc / 2;
        const theme = getSliceTheme(i);
        const isActive = i === activeIdx && drawStatus === 'winner_revealed';

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
        ctx.closePath();

        // Layered radial gradient — bright center, rich dark edge
        const innerX = cx + Math.cos(midAngle) * hubRadius * 1.1;
        const innerY = cy + Math.sin(midAngle) * hubRadius * 1.1;
        const outerX = cx + Math.cos(midAngle) * wheelRadius;
        const outerY = cy + Math.sin(midAngle) * wheelRadius;

        const sliceGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
        sliceGrad.addColorStop(0.0, theme.light + 'CC');
        sliceGrad.addColorStop(0.3, theme.bg + 'FF');
        sliceGrad.addColorStop(0.7, theme.bg + 'EE');
        sliceGrad.addColorStop(1.0, theme.dark + 'CC');

        ctx.fillStyle = sliceGrad;
        ctx.fill();

        // Winner golden shimmer
        if (isActive) {
          ctx.fillStyle = 'rgba(255,215,0,0.25)';
          ctx.fill();
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 30;
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Segment divider line (omit awkward radial seam when only 1 participant remains)
        if (totalSlices > 1) {
          ctx.lineWidth = totalSlices > 30 ? 1 : 2;
          ctx.strokeStyle = 'rgba(255,255,255,0.28)';
          ctx.stroke();
        }

        // Edge arc highlight (brighter outer edge)
        ctx.beginPath();
        ctx.arc(cx, cy, wheelRadius - 2, startAngle, endAngle);
        ctx.lineWidth = totalSlices > 30 ? 1 : 2.5;
        ctx.strokeStyle = theme.light + '66';
        ctx.stroke();

        ctx.restore();

        // === LABEL ===
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(totalSlices === 1 ? -Math.PI / 2 : midAngle);

        const fontSize =
          totalSlices <= 4  ? Math.max(18, Math.floor(wheelRadius * 0.10)) :
          totalSlices <= 8  ? Math.max(16, Math.floor(wheelRadius * 0.085)) :
          totalSlices <= 14 ? Math.max(14, Math.floor(wheelRadius * 0.072)) :
          totalSlices <= 24 ? Math.max(12, Math.floor(wheelRadius * 0.058)) :
          totalSlices <= 36 ? Math.max(10, Math.floor(wheelRadius * 0.048)) :
                              Math.max(9,  Math.floor(wheelRadius * 0.040));

        const maxChars = totalSlices <= 10 ? 22 : totalSlices <= 20 ? 18 : totalSlices <= 36 ? 14 : 11;
        const label = truncateLabel(slices[i].name, maxChars);
        const textRadius = totalSlices === 1 ? wheelRadius * 0.62 : wheelRadius * 0.87;
        const maxTextWidth = Math.max(40, wheelRadius * 0.87 - hubRadius - 18);

        ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
        ctx.textAlign = totalSlices === 1 ? 'center' : 'right';
        ctx.textBaseline = 'middle';

        if (totalSlices === 1) {
          // Draw cleanly upright in the top half when 1 participant remains
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillText(label, 2, -textRadius + 2, wheelRadius * 1.3);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          ctx.strokeText(label, 0, -textRadius, wheelRadius * 1.3);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 4;
          ctx.fillText(label, 0, -textRadius, wheelRadius * 1.3);
        } else {
          // Drop shadow for readability
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillText(label, textRadius + 1.5, 1.5, maxTextWidth);

          // Subtle outline
          ctx.strokeStyle = 'rgba(0,0,0,0.55)';
          ctx.lineWidth = 2.5;
          ctx.lineJoin = 'round';
          ctx.strokeText(label, textRadius, 0, maxTextWidth);

          // Main text — crisp white
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 3;
          ctx.fillText(label, textRadius, 0, maxTextWidth);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Rim segment divider dots
      for (let i = 0; i < totalSlices; i++) {
        const pegAngle = currentAngle + i * sliceArc;
        const px = cx + Math.cos(pegAngle) * (wheelRadius - 4);
        const py = cy + Math.sin(pegAngle) * (wheelRadius - 4);
        const dotTheme = getSliceTheme(i);
        ctx.beginPath();
        ctx.arc(px, py, totalSlices > 36 ? 2 : 3.5, 0, TWO_PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = dotTheme.light;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // === INNER RIM HIGHLIGHT RING ===
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius, 0, TWO_PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();

    // === CENTER HUB ===
    // Outer shadow disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 10, 0, TWO_PI);
    ctx.shadowColor = isSpinning ? 'rgba(196,181,253,1)' : 'rgba(168,85,247,0.8)';
    ctx.shadowBlur = isSpinning ? 30 : 20;
    ctx.fillStyle = '#0F0629';
    ctx.fill();
    ctx.restore();

    // Hub gradient fill — bright purple
    const hubGrad = ctx.createRadialGradient(
      cx - hubRadius * 0.3, cy - hubRadius * 0.3, 2,
      cx, cy, hubRadius,
    );
    hubGrad.addColorStop(0, '#C4B5FD');
    hubGrad.addColorStop(0.3, '#A855F7');
    hubGrad.addColorStop(0.65, '#7C3AED');
    hubGrad.addColorStop(1, '#2D1B69');
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, TWO_PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Hub rim
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#E9D5FF';
    ctx.shadowColor = '#C4B5FD';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hub text
    const hubFontSize = Math.max(11, Math.floor(hubRadius * 0.38));
    ctx.font = `900 ${hubFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText('AWS', cx, cy - hubRadius * 0.18);
    ctx.font = `600 ${Math.max(7, Math.floor(hubRadius * 0.26))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#DDD6FE';
    ctx.fillText('CUI', cx, cy + hubRadius * 0.28);
    ctx.shadowBlur = 0;

    // === TOP POINTER (12 o'clock) ===
    ctx.save();
    const ptrPivotX = cx;
    const ptrPivotY = cy - outerRadius + 2;
    ctx.translate(ptrPivotX, ptrPivotY);
    ctx.rotate(pointerDeflection);

    const ptrH = Math.max(42, Math.floor(canvasSize * 0.09));
    const ptrW = Math.max(16, Math.floor(canvasSize * 0.038));

    // Pointer outer glow
    ctx.shadowColor = '#F0ABFC';
    ctx.shadowBlur = isSpinning ? 20 + glowPulse * 8 : 14;

    // Pointer gradient — bright fuchsia to violet
    const ptrGrad = ctx.createLinearGradient(0, -10, 0, ptrH);
    ptrGrad.addColorStop(0.0, '#FFFFFF');
    ptrGrad.addColorStop(0.15, '#F0ABFC');
    ptrGrad.addColorStop(0.5, '#D946EF');
    ptrGrad.addColorStop(1.0, '#7C3AED');

    ctx.beginPath();
    ctx.moveTo(0, ptrH);
    ctx.lineTo(-ptrW / 2, 0);
    ctx.quadraticCurveTo(0, -16, ptrW / 2, 0);
    ctx.closePath();
    ctx.fillStyle = ptrGrad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.stroke();

    // Jewel on pointer tip
    ctx.beginPath();
    ctx.arc(0, ptrH - 6, 7, 0, TWO_PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, ptrH - 6, 4, 0, TWO_PI);
    ctx.fillStyle = '#D946EF';
    ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  useEffect(() => {
    if (drawStatus === 'spinning') return;

    if (prefersReducedMotion) {
      renderWheelFrame(animatedRotationRef.current, 0, 0, 0);
      return;
    }

    // Gentle live LED chase & breathing halo when idle or celebrating a winner
    let rafId: number | null = null;
    let cancelled = false;
    const ledSpeed = drawStatus === 'winner_revealed' ? 0.14 : 0.045;

    const animateIdle = (now: number) => {
      if (cancelled) return;
      ledPhaseRef.current += ledSpeed;
      glowPulseRef.current = Math.sin(now / (drawStatus === 'winner_revealed' ? 260 : 750));
      renderWheelFrame(animatedRotationRef.current, 0, ledPhaseRef.current, glowPulseRef.current);
      rafId = window.requestAnimationFrame(animateIdle);
    };

    renderWheelFrame(animatedRotationRef.current, 0, ledPhaseRef.current, 0);
    rafId = window.requestAnimationFrame(animateIdle);

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, slices, rotation, drawStatus, prefersReducedMotion]);

  // rAF spin loop
  useEffect(() => {
    if (drawStatus !== 'spinning' || !activeSpinPlan) return;

    const { startRotation, targetRotation, durationMs, displaySlices } = activeSpinPlan;
    const totalDelta = targetRotation - startRotation;
    const sliceCount = displaySlices.length;

    if (prefersReducedMotion || durationMs <= 160) {
      animatedRotationRef.current = targetRotation;
      renderWheelFrame(targetRotation, 0, 1, 0);
      const timer = window.setTimeout(() => { onSpinCompleteRef.current(); }, Math.max(20, durationMs));
      return () => window.clearTimeout(timer);
    }

    let rafId: number | null = null;
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

      const currentSliceIndex = getSliceIndexAtPointer(currentAngle, sliceCount);
      const instantaneousVelocity = Math.max(0, 1 - rawProgress);

      if (currentSliceIndex !== previousSliceIndex) {
        previousSliceIndex = currentSliceIndex;
        pointerDeflectionRef.current = -Math.min(0.40, 0.08 + instantaneousVelocity * 0.32);
        soundService.playWheelTick(instantaneousVelocity);
      } else {
        pointerDeflectionRef.current *= 0.78;
      }

      ledPhaseRef.current += 0.12 + instantaneousVelocity * 0.35;
      glowPulseRef.current = Math.sin(now / 280);

      renderWheelFrame(currentAngle, pointerDeflectionRef.current, ledPhaseRef.current, glowPulseRef.current);

      if (rawProgress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        animatedRotationRef.current = targetRotation;
        pointerDeflectionRef.current = 0;
        renderWheelFrame(targetRotation, 0, ledPhaseRef.current, 0);
        onSpinCompleteRef.current();
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      isCancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpinPlan, drawStatus, prefersReducedMotion]);

  const currentPointerIndex = slices.length > 0 ? getSliceIndexAtPointer(animatedRotationRef.current, slices.length) : -1;
  const currentPointerParticipant = currentPointerIndex >= 0 && currentPointerIndex < slices.length ? slices[currentPointerIndex] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[580px] xl:max-w-[620px] aspect-square mx-auto flex items-center justify-center select-none"
    >
      {/* Rainbow spinning glow ring — behind the wheel */}
      <div
        aria-hidden="true"
        className={`absolute inset-[-8px] rounded-full transition-all duration-700 pointer-events-none ${drawStatus === 'spinning' ? 'opacity-80 scale-105' : 'opacity-40 scale-100'}`}
        style={{
          background: 'conic-gradient(from 0deg, #7C3AED, #DB2777, #D97706, #059669, #2563EB, #DC2626, #0891B2, #7C3AED)',
          filter: 'blur(20px)',
          animation: drawStatus === 'spinning' ? 'spin 3s linear infinite' : 'none',
        }}
      />

      {/* Soft dark mask so only rim glows */}
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, transparent 55%, rgba(6,4,18,0.9) 100%)' }}
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
        className="relative z-10 block"
      />
    </div>
  );
};
