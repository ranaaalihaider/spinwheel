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
  shape: 'rect' | 'circle' | 'ribbon';
}

const CONFETTI_COLORS = [
  '#8B5CF6',
  '#A855F7',
  '#C084FC',
  '#E9D5FF',
  '#FBBF24',
  '#F59E0B',
  '#FEF08A',
  '#FFFFFF',
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
    const shapes: Array<'rect' | 'circle' | 'ribbon'> = ['rect', 'circle', 'ribbon'];

    // Center burst + left & right stage cannons
    for (let i = 0; i < 160; i++) {
      const originGroup = i % 3;
      let startX = width / 2 + (Math.random() - 0.5) * 180;
      let startY = height * 0.52;
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      let speed = 8 + Math.random() * 12;

      if (originGroup === 1) {
        startX = width * 0.12;
        startY = height * 0.78;
        angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.7;
        speed = 11 + Math.random() * 11;
      } else if (originGroup === 2) {
        startX = width * 0.88;
        startY = height * 0.78;
        angle = (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.7;
        speed = 11 + Math.random() * 11;
      }

      pieces.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        opacity: 1,
        shape: shapes[i % shapes.length],
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
        p.vy += 0.22; // Gravity
        p.vx *= 0.988; // Air resistance
        p.rotation += p.vRot;
        p.opacity = Math.max(0, p.opacity - 0.0038);

        if (p.y < height + 30 && p.opacity > 0.02) {
          anyVisible = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.fillRect(-p.size * 0.7, -p.size * 0.2, p.size * 1.4, p.size * 0.4);
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          }
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
