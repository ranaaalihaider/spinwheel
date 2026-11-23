import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOCAL_BANNER_URL, REMOTE_BANNER_URL } from '../layout/Header';

interface SplashScreenProps {
  prefersReducedMotion: boolean;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  prefersReducedMotion,
  onComplete,
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const [bannerSrc, setBannerSrc] = useState<string>(REMOTE_BANNER_URL);
  const [bannerFailed, setBannerFailed] = useState<boolean>(false);

  useEffect(() => {
    // Respect prefers-reduced-motion without artificial delay
    const durationMs = prefersReducedMotion ? 150 : 1750;
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, durationMs);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, durationMs + (prefersReducedMotion ? 50 : 350));

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  const handleBannerError = () => {
    if (bannerSrc === REMOTE_BANNER_URL) {
      setBannerSrc(LOCAL_BANNER_URL);
    } else {
      setBannerFailed(true);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash-screen"
          data-testid="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090714] px-6 select-none overflow-hidden"
        >
          {/* Ambient radial purple backlight */}
          <div
            aria-hidden="true"
            className="absolute w-[520px] h-[520px] rounded-full blur-[130px] opacity-45 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.55) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 80%)',
            }}
          />

          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center max-w-lg w-full text-center"
          >
            {/* Official 16:9 AWS Cloud Club Banner with preserved aspect ratio */}
            <div className="w-64 sm:w-80 aspect-[16/9] rounded-2xl overflow-hidden bg-[#161D26] border border-[#C4B5FD]/30 shadow-purple-glow-lg mb-6 flex items-center justify-center">
              {!bannerFailed ? (
                <img
                  src={bannerSrc}
                  alt="AWS Student Builder Group Official Banner"
                  onError={handleBannerError}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="px-4 py-2 text-sm font-extrabold tracking-widest uppercase text-[#C4B5FD]">
                  AWS Student Builder Group
                </div>
              )}
            </div>

            <motion.span
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-xs font-mono uppercase tracking-[0.25em] text-[#C4B5FD] px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 mb-3"
            >
              Official Community Event Platform
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
            >
              AWS Student Builder Group
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="text-sm sm:text-lg font-medium text-[#C4B5FD] mt-1.5"
            >
              COMSATS University Islamabad
            </motion.p>

            {/* Elegant animated progress line */}
            <div className="w-48 h-1 rounded-full bg-[#1B1530] overflow-hidden mt-7 border border-[#C4B5FD]/15">
              <motion.div
                initial={{ width: '15%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 1.45,
                  ease: 'easeInOut',
                }}
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#C4B5FD]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
