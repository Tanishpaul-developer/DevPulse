import React from 'react';
import { X, Coffee, Heart, ExternalLink } from 'lucide-react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coffee-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0B0D14] border border-amber-500/30 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h2 id="coffee-modal-title" className="text-base font-bold text-white flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span>☕ Support Zero-Login Open Dev Tools</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close Coffee Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          DevPulse AI is 100% free with zero signup walls or paywalls. Your coffee helps keep our multi-model AI rotator and 12+ developer utilities fast for builders worldwide.
        </p>

        <a
          href="https://www.chai4.me/blueauric"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Heart className="w-4 h-4 fill-black" />
          <span>Buy Me a Coffee (chai4.me/blueauric)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
