import React, { useEffect, useRef } from 'react';

interface AmbientBackgroundProps {
  prefersReducedMotion: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ prefersReducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext('2d'); } catch { return; }
    if (!ctx) return;

    let rafId: number;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Large glowing orbs floating in background
    const orbColors = ['#8B5CF6', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#14B8A6'];
    const orbs = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 60 + Math.random() * 140,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      color: orbColors[i % orbColors.length],
      opacity: 0.03 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    }));

    // Tiny star particles
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
    }));

    let t = 0;
    const draw = () => {
      rafId = requestAnimationFrame(draw);
      t += 0.008;

      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Draw large glowing orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r * 2) orb.x = w + orb.r;
        if (orb.x > w + orb.r * 2) orb.x = -orb.r;
        if (orb.y < -orb.r * 2) orb.y = h + orb.r;
        if (orb.y > h + orb.r * 2) orb.y = -orb.r;

        const pulse = 0.7 + 0.3 * Math.sin(t * 0.8 + orb.phase);
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color + 'FF');
        grad.addColorStop(0.5, orb.color + '55');
        grad.addColorStop(1, orb.color + '00');
        ctx.save();
        ctx.globalAlpha = orb.opacity * pulse;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // Draw twinkling stars
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.phase);
        ctx.save();
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#A78BFA';
        ctx.shadowBlur = 4;
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
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep dark base */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, #150d2e 0%, #090714 50%, #060412 100%)' }} />

      {/* Top purple crown spotlight */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-60 blur-[120px]"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.7) 0%, rgba(168,85,247,0.3) 40%, transparent 75%)' }}
      />

      {/* Bottom pink accent */}
      <div
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.5) 0%, transparent 70%)' }}
      />

      {/* Left blue accent */}
      <div
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-[400px] h-[700px] rounded-full opacity-15 blur-[80px]"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.6) 0%, transparent 70%)' }}
      />

      {/* Right emerald accent */}
      <div
        className="absolute top-1/2 -right-32 -translate-y-1/2 w-[400px] h-[700px] rounded-full opacity-15 blur-[80px]"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.5) 0%, transparent 70%)' }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #C4B5FD 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* Animated canvas for orbs + stars */}
      {!prefersReducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
};
