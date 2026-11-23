import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, RotateCw, Sparkles, X } from 'lucide-react';
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
      if (e.key === 'Escape') {
        onClose();
      }
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
          {/* Confetti celebration burst */}
          <ConfettiOverlay active={isOpen} prefersReducedMotion={prefersReducedMotion} />

          {/* Dark backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#090714]/85 backdrop-blur-xl"
          />

          {/* Modal Spotlight Container */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.88, y: 24 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, y: 12 }
            }
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#231842] via-[#1B1530] to-[#130E24] border-2 border-[#C4B5FD]/40 p-6 sm:p-10 text-center shadow-purple-glow-lg overflow-hidden"
          >
            {/* Purple Stage Spotlight */}
            <div
              aria-hidden="true"
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[90px] opacity-60 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(168, 85, 247, 0.75) 0%, rgba(139, 92, 246, 0.15) 70%, transparent 100%)',
              }}
            />

            {/* Close icon button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Winner Announcement"
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#090714]/50 hover:bg-[#8B5CF6]/30 text-[#C4B5FD] border border-[#C4B5FD]/20 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Spin sequence badge */}
            <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/25 border border-[#C4B5FD]/35 text-xs sm:text-sm font-mono uppercase tracking-widest text-[#C4B5FD] mb-5">
              <Sparkles className="w-4 h-4 text-[#A855F7]" />
              <span>Lucky Draw Winner #{winner.spinSequenceNumber}</span>
            </div>

            {/* Trophy icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] p-0.5 mx-auto mb-5 shadow-purple-glow">
              <div className="w-full h-full bg-[#151027] rounded-[14px] flex items-center justify-center">
                <Award className="w-9 h-9 sm:w-11 sm:h-11 text-[#C4B5FD]" />
              </div>
            </div>

            {/* CONGRATULATIONS! Heading */}
            <h2
              id="winner-modal-heading"
              className="text-xl sm:text-3xl font-extrabold uppercase tracking-[0.16em] text-[#C4B5FD] mb-3"
            >
              CONGRATULATIONS!
            </h2>

            {/* Selected Student Name (Projector-Grade Typography) */}
            <div className="my-5 px-4 py-5 sm:py-7 rounded-2xl bg-[#090714]/70 border border-[#C4B5FD]/25 shadow-inner">
              <p
                data-testid="winner-modal-name"
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight break-words leading-tight"
              >
                {winner.winnerName}
              </p>
            </div>

            <p className="text-base sm:text-xl font-medium text-[#A9A3BE] mb-2">
              You are our lucky winner!
            </p>
            <p className="text-xs font-mono text-[#C4B5FD]/70 mb-8">
              AWS Student Builder Group — COMSATS University Islamabad • Selected at{' '}
              {new Date(winner.selectedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                data-testid="winner-spin-again-btn"
                onClick={onSpinAgain}
                disabled={!canSpinAgain}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#8B5CF6] text-white shadow-purple-glow hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCw className="w-5 h-5" />
                <span>Spin Again</span>
              </button>

              <button
                type="button"
                data-testid="winner-close-btn"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg bg-[#151027] hover:bg-[#1B1530] text-[#C4B5FD] border border-[#C4B5FD]/30 transition"
              >
                <span>Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
