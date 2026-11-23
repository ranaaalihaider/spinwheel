import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Sparkles, Trophy, X } from 'lucide-react';
import { WinnerRecord } from '../../types';
import { ConfettiOverlay } from './ConfettiOverlay';

interface WinnerModalProps {
  winner: WinnerRecord | null;
  isOpen: boolean;
  canSpinAgain: boolean;
  prefersReducedMotion: boolean;
  onSpinAgain: () => void;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  isOpen,
  canSpinAgain,
  prefersReducedMotion,
  onSpinAgain,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && winner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-modal-heading"
          data-testid="winner-modal"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <ConfettiOverlay active={isOpen} prefersReducedMotion={prefersReducedMotion} />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#060412]/85 backdrop-blur-2xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.86, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden text-center"
            style={{
              background:
                'linear-gradient(150deg, #1E1142 0%, #100926 52%, #190E38 100%)',
              border: '1px solid rgba(253,230,138,0.35)',
              boxShadow:
                '0 0 110px rgba(139,92,246,0.45), 0 0 55px rgba(245,158,11,0.22), 0 30px 70px rgba(0,0,0,0.85)',
            }}
          >
            {/* Refined Purple-Gold Top Accent Strip */}
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  'linear-gradient(90deg, #7C3AED 0%, #A855F7 35%, #FBBF24 50%, #A855F7 65%, #7C3AED 100%)',
              }}
            />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Winner Dialog"
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-purple-200/75 hover:text-white border border-purple-300/20 transition z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-10">
              {/* Spin number badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-5"
                style={{
                  background: 'rgba(139,92,246,0.22)',
                  border: '1px solid rgba(253,230,138,0.35)',
                  color: '#FEF08A',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Lucky Draw Winner #{winner.spinSequenceNumber}</span>
              </div>

              {/* CONGRATULATIONS Heading */}
              <motion.h2
                id="winner-modal-heading"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.38 }}
                className="text-2xl sm:text-4xl font-black uppercase tracking-[0.2em] mb-5"
                style={{
                  background: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 48%, #E9D5FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CONGRATULATIONS!
              </motion.h2>

              {/* Golden Trophy Medallion */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.14, type: 'spring', stiffness: 300, damping: 16 }}
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(251,191,36,0.24), rgba(139,92,246,0.2))',
                  border: '1.5px solid rgba(253,230,138,0.5)',
                  boxShadow: '0 0 36px rgba(245,158,11,0.35)',
                }}
              >
                <Trophy className="w-10 h-10 text-amber-300" />
              </motion.div>

              {/* Winner Name Spotlight Box */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="my-5 mx-auto px-6 py-6 sm:py-8 rounded-2xl max-w-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.24), rgba(24,14,54,0.85), rgba(245,158,11,0.12))',
                  border: '1.5px solid rgba(216,180,254,0.45)',
                  boxShadow:
                    '0 0 50px rgba(139,92,246,0.35), inset 0 1px 0 rgba(253,230,138,0.25)',
                }}
              >
                <p
                  data-testid="winner-modal-name"
                  className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight break-words leading-tight"
                >
                  {winner.winnerName}
                </p>
              </motion.div>

              <motion.p
                className="text-base sm:text-xl font-semibold text-purple-100 mb-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                You are our lucky winner!
              </motion.p>
              <p className="text-xs font-mono text-[#B4ADC9]/70 mb-8">
                AWS Student Builder Group — COMSATS University Islamabad •{' '}
                {new Date(winner.selectedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  data-testid="winner-spin-again-btn"
                  onClick={onSpinAgain}
                  disabled={!canSpinAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg text-white transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)',
                    boxShadow:
                      '0 0 35px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.22)',
                    border: '1px solid rgba(233,213,255,0.35)',
                  }}
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Spin Again</span>
                </button>
                <button
                  type="button"
                  data-testid="winner-close-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg text-purple-200 bg-white/5 border border-purple-300/20 hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
