import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  prefersReducedMotion: boolean;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ prefersReducedMotion, onComplete }) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }
    const t1 = window.setTimeout(() => setPhase('hold'), 350);
    const t2 = window.setTimeout(() => setPhase('out'), 1650);
    const t3 = window.setTimeout(() => onComplete(), 2100);

    const interval = window.setInterval(() => {
      setProgress((p) => Math.min(p + 3, 100));
    }, 40);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [prefersReducedMotion, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'out' ? (
        <motion.div
          key="splash"
          data-testid="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, #1F1147 0%, #0B071A 60%, #060412 100%)',
          }}
        >
          {/* Ambient violet-gold spotlight halo */}
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [0.95, 1.06, 0.95], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[480px] h-[480px] rounded-full blur-[90px]"
            style={{
              background:
                'radial-gradient(circle, rgba(168,85,247,0.65) 0%, rgba(245,158,11,0.18) 55%, transparent 75%)',
            }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            {/* Official AWS Cloud Club Banner */}
            <motion.img
              src="/assets/Banner_Cloud_Club_Dark.svg"
              alt="AWS Student Builder Group"
              className="w-60 sm:w-72 aspect-[16/9] object-contain rounded-xl mb-6 border border-purple-300/20 bg-[#161D26]/90 shadow-[0_0_32px_rgba(139,92,246,0.35)]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              AWS Student{' '}
              <span className="bg-gradient-to-r from-[#C084FC] to-[#8B5CF6] bg-clip-text text-transparent">
                Builder Group
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-amber-200/90 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              COMSATS University Islamabad
            </motion.p>

            {/* Refined purple-gold loading bar */}
            <motion.div
              className="w-48 sm:w-64 h-1 rounded-full overflow-hidden bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 60%, #FBBF24 100%)',
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
