import React, { useEffect, useRef } from 'react';

interface ConfettiOverlayProps {
  active: boolean;
  prefersReducedMotion: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
}

const CONFETTI_COLORS = [
  '#8B5CF6',
  '#A855F7',
  '#C4B5FD',
  '#DDD6FE',
  '#F5D0FE',
  '#FBBF24',
  '#38BDF8',
];

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  active,
  prefersReducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const pieces: ConfettiPiece[] = [];
    const totalPieces = 95;

    for (let i = 0; i < totalPieces; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
      const speed = 7 + Math.random() * 11;
      pieces.push({
        x: width / 2 + (Math.random() - 0.5) * 180,
        y: height * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        opacity: 1,
      });
    }

    let rafId: number | null = null;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      let anyVisible = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24; // Gravity
        p.vx *= 0.99; // Air resistance
        p.rotation += p.vRot;
        p.opacity = Math.max(0, p.opacity - 0.0045);

        if (p.y < height + 30 && p.opacity > 0.02) {
          anyVisible = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          ctx.restore();
        }
      }

      if (anyVisible) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [active, prefersReducedMotion]);

  if (!active || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
