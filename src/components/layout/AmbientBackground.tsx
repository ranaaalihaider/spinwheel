import React, { useEffect, useRef, useState } from 'react';

interface AmbientBackgroundProps {
  prefersReducedMotion: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ prefersReducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [campusLoaded, setCampusLoaded] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    let rafId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle refined floating ambient dust particles (violet, lavender, soft gold)
    const particleColors = ['#C4B5FD', '#A855F7', '#FDE68A', '#DDD6FE', '#8B5CF6'];
    const particles = Array.from({ length: 42 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -0.06 - Math.random() * 0.18,
      color: particleColors[i % particleColors.length],
      opacity: 0.18 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
    }));

    let t = 0;
    const draw = () => {
      rafId = requestAnimationFrame(draw);
      t += 0.01;
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;

        const twinkle = 0.45 + 0.55 * Math.sin(t * p.speed + p.phase);
        ctx.save();
        ctx.globalAlpha = p.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion]);

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#080515]">
      {/* Real COMSATS University Islamabad Campus Photograph */}
      {campusLoaded && (
        <img
          src="/assets/comsats-campus.png"
          alt=""
          onError={() => setCampusLoaded(false)}
          className="absolute inset-0 w-full h-full object-cover object-[28%_22%] sm:object-[25%_25%] opacity-50 scale-[1.03] saturate-[0.72] contrast-[1.08] brightness-[0.76]"
        />
      )}

      {/* Deep midnight-purple atmospheric color wash over campus */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,7,26,0.90) 0%, rgba(22,12,50,0.62) 28%, rgba(16,9,38,0.72) 56%, rgba(10,6,24,0.96) 80%, rgba(8,5,20,0.99) 100%)',
        }}
      />

      {/* Horizontal vignette to frame campus left-midground & deepen edges for card readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 24% 30%, rgba(139,92,246,0.10) 0%, rgba(10,6,25,0.45) 55%, rgba(8,5,20,0.88) 100%)',
        }}
      />

      {/* Central stage crown purple spotlight behind the wheel */}
      <div
        className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[720px] h-[520px] rounded-full blur-[110px] opacity-55"
        style={{
          background:
            'radial-gradient(ellipse, rgba(139,92,246,0.55) 0%, rgba(109,40,217,0.22) 50%, transparent 75%)',
        }}
      />

      {/* Stage floor luminous violet & warm gold reflection under wheel pedestal */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[900px] h-[340px] rounded-full blur-[90px] opacity-65"
        style={{
          background:
            'radial-gradient(ellipse, rgba(168,85,247,0.5) 0%, rgba(91,33,182,0.28) 45%, transparent 75%)',
        }}
      />

      {/* Sweeping neon purple-gold light ribbons (matching design reference) */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-75"
      >
        <defs>
          <linearGradient id="ribbonGoldVioletTop" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
            <stop offset="45%" stopColor="#A855F7" stopOpacity="0.65" />
            <stop offset="82%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="ribbonBottomRight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
            <stop offset="40%" stopColor="#A855F7" stopOpacity="0.7" />
            <stop offset="78%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="ribbonBottomLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top-right sweeping silk wave */}
        <path
          d="M 1020 320 C 1170 250, 1280 140, 1470 72"
          stroke="url(#ribbonGoldVioletTop)"
          strokeWidth="3"
          filter="url(#ribbonGlow)"
        />
        <path
          d="M 1080 355 C 1220 275, 1320 180, 1480 120"
          stroke="url(#ribbonGoldVioletTop)"
          strokeWidth="1.5"
          opacity="0.55"
        />

        {/* Bottom-left sweeping silk wave */}
        <path
          d="M -40 770 C 120 825, 220 875, 380 910"
          stroke="url(#ribbonBottomLeft)"
          strokeWidth="2.5"
          filter="url(#ribbonGlow)"
        />
        <path
          d="M -30 805 C 100 845, 210 890, 320 925"
          stroke="url(#ribbonBottomLeft)"
          strokeWidth="1.2"
          opacity="0.45"
        />

        {/* Bottom-right sweeping silk wave */}
        <path
          d="M 1040 915 C 1200 865, 1310 785, 1480 715"
          stroke="url(#ribbonBottomRight)"
          strokeWidth="2.8"
          filter="url(#ribbonGlow)"
        />
        <path
          d="M 1110 925 C 1255 870, 1350 810, 1490 760"
          stroke="url(#ribbonBottomRight)"
          strokeWidth="1.3"
          opacity="0.5"
        />
      </svg>

      {/* Subtle floating particle canvas */}
      {!prefersReducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
};
