import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X } from 'lucide-react';
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
  winner, isOpen, canSpinAgain, prefersReducedMotion, onSpinAgain, onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && winner && (
        <div role="dialog" aria-modal="true" aria-labelledby="winner-modal-heading"
          data-testid="winner-modal"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <ConfettiOverlay active={isOpen} prefersReducedMotion={prefersReducedMotion} />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
          />

          {/* Modal card */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden text-center"
            style={{
              background: 'linear-gradient(145deg, #1A0D35 0%, #0D0820 50%, #180B30 100%)',
              border: '1px solid rgba(196,181,253,0.3)',
              boxShadow: '0 0 120px rgba(168,85,247,0.5), 0 0 60px rgba(236,72,153,0.3), 0 30px 80px rgba(0,0,0,0.9)',
            }}
          >
            {/* Rainbow top border — thick */}
            <div className="h-1.5 w-full" style={{
              background: 'linear-gradient(90deg, #7C3AED, #DB2777, #D97706, #059669, #2563EB, #0891B2, #7C3AED)',
            }} />

            {/* Close button */}
            <button type="button" onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white border border-white/10 transition z-20">
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-10">
              {/* Spin number badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.2))',
                  border: '1px solid rgba(196,181,253,0.4)',
                  color: '#DDD6FE',
                }}>
                ✨ Lucky Draw Winner #{winner.spinSequenceNumber}
              </div>

              {/* CONGRATULATIONS text */}
              <motion.h2
                id="winner-modal-heading"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-2xl sm:text-4xl font-black uppercase tracking-[0.2em] mb-5"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F472B6 50%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CONGRATULATIONS!
              </motion.h2>

              {/* Trophy emoji burst */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 14 }}
                className="text-5xl sm:text-8xl mb-5"
              >
                🏆
              </motion.div>

              {/* Winner Name — the star of the show */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="my-6 mx-auto px-6 py-6 sm:py-8 rounded-2xl max-w-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15), rgba(219,39,119,0.1))',
                  border: '2px solid rgba(196,181,253,0.5)',
                  boxShadow: '0 0 60px rgba(139,92,246,0.4), 0 0 30px rgba(236,72,153,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <p data-testid="winner-modal-name"
                  className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight break-words leading-tight">
                  {winner.winnerName}
                </p>
              </motion.div>

              <motion.p
                className="text-base sm:text-xl font-semibold mb-1"
                style={{ color: '#DDD6FE' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              >
                You are our lucky winner!
              </motion.p>
              <p className="text-xs font-mono text-violet-300/50 mb-8">
                AWS Student Builder Group — COMSATS University Islamabad •{' '}
                {new Date(winner.selectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button type="button" data-testid="winner-spin-again-btn" onClick={onSpinAgain}
                  disabled={!canSpinAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base sm:text-lg text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #A855F7, #DB2777)',
                    boxShadow: '0 0 40px rgba(139,92,246,0.6)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                  <RotateCw className="w-5 h-5" />
                  Spin Again
                </button>
                <button type="button" data-testid="winner-close-btn" onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg text-violet-300 bg-white/5 border border-white/10 hover:bg-white/10 transition">
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
