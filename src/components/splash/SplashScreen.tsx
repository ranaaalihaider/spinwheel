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
    const t1 = window.setTimeout(() => setPhase('hold'), 400);
    const t2 = window.setTimeout(() => setPhase('out'), 2000);
    const t3 = window.setTimeout(() => onComplete(), 2500);

    // Animate progress bar
    const interval = window.setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
    }, 35);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
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
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0845 0%, #090714 60%, #040210 100%)' }}
        >
          {/* Rotating rainbow halo */}
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[500px] h-[500px] rounded-full opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, #7C3AED, #DB2777, #D97706, #059669, #2563EB, #DC2626, #0891B2, #7C3AED)',
              filter: 'blur(60px)',
            }}
          />

          {/* Inner spotlight */}
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-8"
          >
            {/* AWS Banner */}
            <motion.img
              src="/assets/Banner_Cloud_Club_Dark.svg"
              alt="AWS Student Builder Group"
              className="w-64 sm:w-80 max-h-28 object-contain mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-5xl font-black tracking-tight mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #DDD6FE 50%, #C4B5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AWS Student Builder Group
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-sm sm:text-base font-semibold tracking-widest uppercase mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                background: 'linear-gradient(90deg, #F472B6, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              COMSATS University Islamabad
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="w-48 sm:w-64 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #DB2777, #D97706, #059669)',
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
