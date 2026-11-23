import React from 'react';

interface AmbientBackgroundProps {
  prefersReducedMotion: boolean;
}

const AMBIENT_PARTICLES = [
  { id: 1, top: '14%', left: '10%', size: 3, duration: '8s', delay: '0s' },
  { id: 2, top: '26%', left: '84%', size: 4, duration: '11s', delay: '1.5s' },
  { id: 3, top: '68%', left: '12%', size: 2.5, duration: '9s', delay: '2.2s' },
  { id: 4, top: '75%', left: '88%', size: 3.5, duration: '12s', delay: '0.8s' },
  { id: 5, top: '42%', left: '6%', size: 2, duration: '10s', delay: '3.1s' },
  { id: 6, top: '52%', left: '92%', size: 3, duration: '9.5s', delay: '1.9s' },
  { id: 7, top: '18%', left: '48%', size: 2, duration: '13s', delay: '2.7s' },
  { id: 8, top: '86%', left: '42%', size: 3, duration: '10.5s', delay: '0.4s' },
];

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  prefersReducedMotion,
}) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Primary deep midnight canvas */}
      <div className="absolute inset-0 bg-[#090714]" />

      {/* Top radial crown spotlight */}
      <div
        className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-35 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(168, 85, 247, 0.12) 55%, transparent 80%)',
        }}
      />

      {/* Central wheel stage ambient halo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full opacity-25 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 75%)',
        }}
      />

      {/* Subtle architectural perspective grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #C4B5FD 1px, transparent 1px), linear-gradient(to bottom, #C4B5FD 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Restrained floating lavender particles */}
      {!prefersReducedMotion &&
        AMBIENT_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-[#C4B5FD] opacity-30 animate-pulse"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: p.duration,
              animationDelay: p.delay,
              boxShadow: '0 0 10px rgba(196, 181, 253, 0.8)',
            }}
          />
        ))}
    </div>
  );
};
