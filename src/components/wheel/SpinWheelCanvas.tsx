import React, { useEffect, useRef, useState } from 'react';
import { ActiveSpinPlan, DrawStatus, Participant } from '../../types';
import {
  evaluateWheelEasing,
  getSliceIndexAtPointer,
  normalizeAngle,
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

interface SliceTone {
  inner: string;
  mid: string;
  outer: string;
}

// Refined alternating Midnight Violet & Luminous Orchid Purple palette (matches finalized design reference)
const LIGHT_PURPLE_SLICE: SliceTone = {
  inner: '#7C3AED',
  mid: '#8B4BF6',
  outer: '#A855F7',
};

const DARK_PURPLE_SLICE: SliceTone = {
  inner: '#1F0D42',
  mid: '#2E145C',
  outer: '#431D7F',
};

const ODD_BRIDGE_SLICE: SliceTone = {
  inner: '#431987',
  mid: '#5B24B4',
  outer: '#7434D8',
};

function getSliceTone(index: number, totalSlices: number): SliceTone {
  if (totalSlices === 1) return LIGHT_PURPLE_SLICE;
  // Prevent first and last segment from sharing the same shade when totalSlices is odd
  if (totalSlices % 2 === 1 && index === totalSlices - 1) {
    return ODD_BRIDGE_SLICE;
  }
  return index % 2 === 0 ? LIGHT_PURPLE_SLICE : DARK_PURPLE_SLICE;
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
  const glowPulseRef = useRef<number>(0);
  const onSpinCompleteRef = useRef(onSpinComplete);

  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

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
      const width = rect.width || 360;
      const clamped = Math.max(280, Math.min(540, Math.floor(width)));
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

  const renderWheelFrame = (
    currentAngle: number,
    pointerDeflection: number,
    ledPhase: number,
    glowPulse: number
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
    const bezelWidth = Math.max(13, Math.floor(canvasSize * 0.036));
    const wheelRadius = outerRadius - bezelWidth;
    const hubRadius = Math.max(38, Math.floor(wheelRadius * 0.22));
    const isSpinning = drawStatus === 'spinning';
    const isCelebrating = drawStatus === 'winner_revealed';

    // === 1. SOFT OUTER ILLUMINATED HALO ===
    ctx.save();
    const haloGrad = ctx.createRadialGradient(
      cx,
      cy,
      outerRadius - 8,
      cx,
      cy,
      outerRadius + 16
    );
    haloGrad.addColorStop(
      0,
      isSpinning
        ? `rgba(192,132,252,${0.65 + glowPulse * 0.18})`
        : isCelebrating
        ? 'rgba(251,191,36,0.55)'
        : 'rgba(168,85,247,0.48)'
    );
    haloGrad.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius + 16, 0, TWO_PI);
    ctx.fillStyle = haloGrad;
    ctx.fill();
    ctx.restore();

    // === 2. DARK METALLIC OUTER BEZEL ===
    const bezelGrad = ctx.createLinearGradient(cx - outerRadius, cy - outerRadius, cx + outerRadius, cy + outerRadius);
    bezelGrad.addColorStop(0, '#3B1E6E');
    bezelGrad.addColorStop(0.5, '#190C33');
    bezelGrad.addColorStop(1, '#4C258C');

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, TWO_PI);
    ctx.fillStyle = bezelGrad;
    ctx.fill();

    // Luminous violet-white outer neon rim ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - 1.5, 0, TWO_PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = isCelebrating ? '#FDE68A' : '#E9D5FF';
    ctx.shadowColor = isCelebrating ? '#F59E0B' : '#C084FC';
    ctx.shadowBlur = isSpinning ? 18 + glowPulse * 6 : 12;
    ctx.stroke();
    ctx.restore();

    // Subtle inner dark groove on bezel
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius + bezelWidth * 0.48, 0, TWO_PI);
    ctx.lineWidth = Math.max(2, bezelWidth * 0.35);
    ctx.strokeStyle = 'rgba(10,5,24,0.85)';
    ctx.stroke();

    // === 3. ILLUMINATED PERIMETER LIGHT SEGMENTS (matching reference's sleek glowing bezel) ===
    const lightArcCount = 12;
    const lightOrbit = outerRadius - bezelWidth * 0.5;
    for (let i = 0; i < lightArcCount; i++) {
      const a = (i * TWO_PI) / lightArcCount;
      const isCardinal = i % 3 === 0;
      const pulse = 0.55 + 0.45 * Math.sin(ledPhase * 0.65 + i * 0.85);
      const isBright = isCardinal || pulse > 0.72;

      ctx.save();
      ctx.beginPath();
      const span = isCardinal ? 0.14 : 0.055;
      ctx.arc(cx, cy, lightOrbit, a - span, a + span);
      ctx.lineCap = 'round';
      ctx.lineWidth = isCardinal ? 3.5 : 2.5;
      const color = isCelebrating
        ? '#FDE68A'
        : isBright
        ? '#F5D0FE'
        : 'rgba(196,181,253,0.45)';
      ctx.strokeStyle = color;
      if (isBright) {
        ctx.shadowColor = isCelebrating ? '#F59E0B' : '#D8B4FE';
        ctx.shadowBlur = isCardinal ? 12 : 7;
      }
      ctx.stroke();
      ctx.restore();
    }

    // === 4. WHEEL SEGMENTS ===
    const totalSlices = slices.length;

    if (totalSlices === 0) {
      // Empty wheel state — refined dark alternating purple placeholder slices
      const placeholderCount = 8;
      const pArc = TWO_PI / placeholderCount;
      for (let i = 0; i < placeholderCount; i++) {
        const startA = i * pArc;
        const endA = startA + pArc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelRadius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#27124C' : '#180A33';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(196,181,253,0.12)';
        ctx.stroke();
      }
    } else {
      const sliceArc = TWO_PI / totalSlices;
      const activeIdx = getSliceIndexAtPointer(currentAngle, totalSlices);

      for (let i = 0; i < totalSlices; i++) {
        const startAngle = currentAngle + i * sliceArc;
        const endAngle = startAngle + sliceArc;
        const midAngle = startAngle + sliceArc / 2;
        const tone = getSliceTone(i, totalSlices);
        const isWinningSlice = i === activeIdx && isCelebrating;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
        ctx.closePath();

        // Rich radial depth gradient per slice
        const innerX = cx + Math.cos(midAngle) * hubRadius;
        const innerY = cy + Math.sin(midAngle) * hubRadius;
        const outerX = cx + Math.cos(midAngle) * wheelRadius;
        const outerY = cy + Math.sin(midAngle) * wheelRadius;

        const sliceGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
        sliceGrad.addColorStop(0.0, tone.inner);
        sliceGrad.addColorStop(0.55, tone.mid);
        sliceGrad.addColorStop(1.0, tone.outer);

        ctx.fillStyle = sliceGrad;
        ctx.fill();

        // Warm golden-lavender sheen on the winning slice upon reveal
        if (isWinningSlice) {
          ctx.fillStyle = `rgba(253,230,138,${0.18 + Math.abs(glowPulse) * 0.1})`;
          ctx.fill();
        }

        // Crisp subtle slice divider line (omit radial seam when only 1 participant exists)
        if (totalSlices > 1) {
          ctx.lineWidth = totalSlices > 32 ? 0.8 : 1.4;
          ctx.strokeStyle = 'rgba(233,213,255,0.22)';
          ctx.stroke();
        }
        ctx.restore();

        // === 5. CRISP, RIGHT-SIDE-UP SEGMENT NAME LABELS ===
        ctx.save();
        ctx.translate(cx, cy);

        const fontSize =
          totalSlices <= 6
            ? Math.max(17, Math.floor(wheelRadius * 0.095))
            : totalSlices <= 10
            ? Math.max(15, Math.floor(wheelRadius * 0.082))
            : totalSlices <= 16
            ? Math.max(13, Math.floor(wheelRadius * 0.068))
            : totalSlices <= 28
            ? Math.max(11, Math.floor(wheelRadius * 0.055))
            : Math.max(9, Math.floor(wheelRadius * 0.043));

        const maxChars =
          totalSlices <= 8 ? 18 : totalSlices <= 16 ? 15 : totalSlices <= 32 ? 12 : 10;
        const label = truncateLabel(slices[i].name, maxChars);
        const midRadius = hubRadius + (wheelRadius - hubRadius) * 0.50;
        const maxTextWidth = Math.max(38, (wheelRadius - hubRadius) * 0.68);

        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (totalSlices === 1) {
          // Single remaining participant: render cleanly upright in top half
          ctx.fillStyle = 'rgba(8,4,20,0.65)';
          ctx.fillText(label, 1.5, -midRadius + 1.5, wheelRadius * 1.25);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, 0, -midRadius, wheelRadius * 1.25);
        } else {
          // Automatically flip text 180deg on the left hemisphere so names are NEVER upside down
          const normMid = normalizeAngle(midAngle);
          const isLeftHemisphere = normMid > Math.PI * 0.5 && normMid < Math.PI * 1.5;

          if (isLeftHemisphere) {
            ctx.rotate(midAngle + Math.PI);
            ctx.fillStyle = 'rgba(8,4,20,0.62)';
            ctx.fillText(label, -midRadius + 1.2, 1.2, maxTextWidth);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(label, -midRadius, 0, maxTextWidth);
          } else {
            ctx.rotate(midAngle);
            ctx.fillStyle = 'rgba(8,4,20,0.62)';
            ctx.fillText(label, midRadius + 1.2, 1.2, maxTextWidth);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(label, midRadius, 0, maxTextWidth);
          }
        }
        ctx.restore();
      }

      // Subtle rim peg dots at slice boundaries
      if (totalSlices > 1) {
        for (let i = 0; i < totalSlices; i++) {
          const pegAngle = currentAngle + i * sliceArc;
          const px = cx + Math.cos(pegAngle) * (wheelRadius - 4);
          const py = cy + Math.sin(pegAngle) * (wheelRadius - 4);
          ctx.beginPath();
          ctx.arc(px, py, totalSlices > 36 ? 1.8 : 2.6, 0, TWO_PI);
          ctx.fillStyle = '#F3E8FF';
          ctx.fill();
        }
      }
    }

    // Inner rim luminous border around wheel face
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius, 0, TWO_PI);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(233,213,255,0.45)';
    ctx.stroke();

    // === 6. CENTER HUB WITH WARM GOLDEN ILLUMINATED RING & AWS BRANDING ===
    // Outer warm gold glow halo behind hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 5, 0, TWO_PI);
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = isSpinning ? 24 : 18;
    ctx.fillStyle = '#120A24';
    ctx.fill();
    ctx.restore();

    // Hub dark obsidian fill
    const hubGrad = ctx.createRadialGradient(
      cx - hubRadius * 0.25,
      cy - hubRadius * 0.25,
      2,
      cx,
      cy,
      hubRadius
    );
    hubGrad.addColorStop(0, '#271A46');
    hubGrad.addColorStop(0.55, '#130B26');
    hubGrad.addColorStop(1, '#090514');
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, TWO_PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Luminous warm gold-cream outer border on center hub
    ctx.save();
    const hubRingGrad = ctx.createLinearGradient(
      cx - hubRadius,
      cy - hubRadius,
      cx + hubRadius,
      cy + hubRadius
    );
    hubRingGrad.addColorStop(0, '#FEF08A');
    hubRingGrad.addColorStop(0.5, '#F59E0B');
    hubRingGrad.addColorStop(1, '#FDE68A');
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, TWO_PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = hubRingGrad;
    ctx.shadowColor = 'rgba(251,191,36,0.8)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // Center hub AWS Student Builder Group monogram (clean, no fabricated trademark icons)
    const hubFontSize = Math.max(13, Math.floor(hubRadius * 0.42));
    ctx.font = `800 ${hubFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AWS', cx, cy - hubRadius * 0.14);

    // Subtle golden accent divider arc under "AWS"
    ctx.beginPath();
    ctx.moveTo(cx - hubRadius * 0.36, cy + hubRadius * 0.12);
    ctx.quadraticCurveTo(cx, cy + hubRadius * 0.26, cx + hubRadius * 0.36, cy + hubRadius * 0.12);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    ctx.font = `700 ${Math.max(8, Math.floor(hubRadius * 0.22))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#DDD6FE';
    ctx.fillText('CUI', cx, cy + hubRadius * 0.44);

    // === 7. FIXED GOLDEN POINTER AT 12 O'CLOCK ===
    ctx.save();
    const ptrPivotX = cx;
    const ptrPivotY = cy - outerRadius - 2;
    ctx.translate(ptrPivotX, ptrPivotY);
    ctx.rotate(pointerDeflection);

    const ptrH = Math.max(30, Math.floor(canvasSize * 0.076));
    const ptrW = Math.max(24, Math.floor(canvasSize * 0.060));

    ctx.shadowColor = 'rgba(245,158,11,0.9)';
    ctx.shadowBlur = isSpinning ? 18 : 12;

    const ptrGrad = ctx.createLinearGradient(-ptrW / 2, 0, ptrW / 2, ptrH);
    ptrGrad.addColorStop(0.0, '#FEF08A');
    ptrGrad.addColorStop(0.35, '#FBBF24');
    ptrGrad.addColorStop(0.75, '#F59E0B');
    ptrGrad.addColorStop(1.0, '#D97706');

    ctx.beginPath();
    ctx.moveTo(0, ptrH);
    ctx.lineTo(-ptrW / 2, 4);
    ctx.quadraticCurveTo(-ptrW / 2, -4, -ptrW * 0.3, -4);
    ctx.lineTo(ptrW * 0.3, -4);
    ctx.quadraticCurveTo(ptrW / 2, -4, ptrW / 2, 4);
    ctx.closePath();
    ctx.fillStyle = ptrGrad;
    ctx.fill();

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#FEF9C3';
    ctx.stroke();

    // Small dark-gold jewel pin near pointer top
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 7, 3.2, 0, TWO_PI);
    ctx.fillStyle = '#92400E';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.8, 6.2, 1.2, 0, TWO_PI);
    ctx.fillStyle = '#FEF08A';
    ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  // Idle & celebration gentle illumination loop
  useEffect(() => {
    if (drawStatus === 'spinning') return;

    if (prefersReducedMotion) {
      renderWheelFrame(animatedRotationRef.current, 0, 0, 0);
      return;
    }

    let rafId: number | null = null;
    let cancelled = false;
    const ledSpeed = drawStatus === 'winner_revealed' ? 0.14 : 0.04;

    const animateIdle = (now: number) => {
      if (cancelled) return;
      ledPhaseRef.current += ledSpeed;
      glowPulseRef.current = Math.sin(now / (drawStatus === 'winner_revealed' ? 260 : 850));
      renderWheelFrame(
        animatedRotationRef.current,
        0,
        ledPhaseRef.current,
        glowPulseRef.current
      );
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

  // Smooth rAF spin animation loop (preserves exact cryptoRandom targetRotation math)
  useEffect(() => {
    if (drawStatus !== 'spinning' || !activeSpinPlan) return;

    const { startRotation, targetRotation, durationMs, displaySlices } = activeSpinPlan;
    const totalDelta = targetRotation - startRotation;
    const sliceCount = displaySlices.length;

    if (prefersReducedMotion || durationMs <= 160) {
      animatedRotationRef.current = targetRotation;
      renderWheelFrame(targetRotation, 0, 1, 0);
      const timer = window.setTimeout(() => {
        onSpinCompleteRef.current();
      }, Math.max(20, durationMs));
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
        pointerDeflectionRef.current = -Math.min(0.36, 0.08 + instantaneousVelocity * 0.28);
        soundService.playWheelTick(instantaneousVelocity);
      } else {
        pointerDeflectionRef.current *= 0.8;
      }

      ledPhaseRef.current += 0.14 + instantaneousVelocity * 0.36;
      glowPulseRef.current = Math.sin(now / 260);

      renderWheelFrame(
        currentAngle,
        pointerDeflectionRef.current,
        ledPhaseRef.current,
        glowPulseRef.current
      );

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

  const currentPointerIndex =
    slices.length > 0 ? getSliceIndexAtPointer(animatedRotationRef.current, slices.length) : -1;
  const currentPointerParticipant =
    currentPointerIndex >= 0 && currentPointerIndex < slices.length
      ? slices[currentPointerIndex]
      : null;

  return (
    <div className="relative w-full max-w-[330px] sm:max-w-[430px] lg:max-w-[490px] xl:max-w-[530px] mx-auto flex flex-col items-center select-none">
      {/* Wheel Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square flex items-center justify-center z-10"
      >
        {/* Subtle luminous violet aura behind wheel */}
        <div
          aria-hidden="true"
          className={`absolute inset-2 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
            drawStatus === 'spinning'
              ? 'opacity-85'
              : drawStatus === 'winner_revealed'
              ? 'opacity-90'
              : 'opacity-55 animate-aura'
          }`}
          style={{
            background:
              drawStatus === 'winner_revealed'
                ? 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(168,85,247,0.45) 55%, transparent 75%)'
                : 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(109,40,217,0.3) 55%, transparent 75%)',
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
          className="relative z-10 block"
        />
      </div>

      {/* Sculpted Metallic-Violet Stage Pedestal Base with Golden Accent Light (matches reference) */}
      <div
        aria-hidden="true"
        className="relative -mt-6 sm:-mt-8 w-[84%] max-w-[420px] flex flex-col items-center pointer-events-none z-0"
      >
        {/* Angled support struts connecting wheel to plinth */}
        <svg
          viewBox="0 0 360 72"
          fill="none"
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="pedestalBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B256B" />
              <stop offset="35%" stopColor="#1B1038" />
              <stop offset="100%" stopColor="#0C061D" />
            </linearGradient>
            <linearGradient id="pedestalRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="35%" stopColor="#DDD6FE" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#DDD6FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="goldBar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
              <stop offset="20%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Left & Right structural stand legs */}
          <path
            d="M 105 4 L 78 36 L 116 36 L 130 12 Z"
            fill="#1D113B"
            stroke="rgba(196,181,253,0.35)"
            strokeWidth="1.2"
          />
          <path
            d="M 255 4 L 282 36 L 244 36 L 230 12 Z"
            fill="#1D113B"
            stroke="rgba(196,181,253,0.35)"
            strokeWidth="1.2"
          />

          {/* Floor ambient glow shadow */}
          <ellipse cx="180" cy="64" rx="168" ry="12" fill="rgba(139,92,246,0.28)" />

          {/* Pedestal base cylinder body */}
          <path
            d="M 32 38 C 32 30, 328 30, 328 38 L 328 56 C 328 66, 32 66, 32 56 Z"
            fill="url(#pedestalBody)"
            stroke="rgba(196,181,253,0.28)"
            strokeWidth="1.2"
          />

          {/* Pedestal top elliptical surface */}
          <ellipse
            cx="180"
            cy="38"
            rx="148"
            ry="11"
            fill="#28174E"
            stroke="url(#pedestalRim)"
            strokeWidth="1.8"
          />

          {/* Glowing horizontal gold-amber light strip across pedestal front */}
          <rect x="76" y="49" width="208" height="3.2" rx="1.6" fill="url(#goldBar)" />
          <ellipse cx="180" cy="51" rx="88" ry="6" fill="rgba(245,158,11,0.24)" />
        </svg>
      </div>
    </div>
  );
};
