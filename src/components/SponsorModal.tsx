import React, { useState } from 'react';
import { X, Megaphone, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { trackConversionEvent } from '../config/analytics';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SponsorModal({ isOpen, onClose }: SponsorModalProps) {
  // Strictly 3 high-converting fields: Name, Email, What do you need?
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !requirement.trim()) return;

    trackConversionEvent('sponsor_lead_submit', {
      name: name.trim(),
      email: email.trim()
    });

    try {
      const existing = JSON.parse(localStorage.getItem('devpulse_sponsor_leads_v1') || '[]');
      existing.unshift({
        name: name.trim(),
        email: email.trim(),
        requirement: requirement.trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('devpulse_sponsor_leads_v1', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hi DevPulse AI Team! I'm ${name || 'a founder/sponsor'} (${email || 'email'}). Inquiry: ${
      requirement || 'Sponsorship / Custom AI Build'
    }`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sponsor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0B0D14] border border-fuchsia-500/30 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <h2 id="sponsor-modal-title" className="text-sm sm:text-base font-bold text-white">
                📢 Sponsor This Tool / Custom AI Build
              </h2>
              <p className="text-[11px] text-zinc-400">
                Reach 18,400+ AI developers or request a custom full-stack AI app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Sponsor Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Inquiry Received! We’ll reply within 4 hours.</span>
              </div>
              <p className="text-zinc-300">
                Want instant priority response on WhatsApp? Click below to send your brief directly:
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Fast-Track via WhatsApp</span>
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="sponsor-name" className="font-semibold text-zinc-200 block">
                  1. Your Name *
                </label>
                <input
                  id="sponsor-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sponsor-email" className="font-semibold text-zinc-200 block">
                  2. Work Email *
                </label>
                <input
                  id="sponsor-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sponsor-need" className="font-semibold text-zinc-200 block">
                  3. What do you need? (Sponsorship slot or Custom AI Build) *
                </label>
                <textarea
                  id="sponsor-need"
                  rows={3}
                  required
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="e.g., Sponsor the Bento Grid header for our DevTool launch, or build a custom Next.js + Supabase AI agent..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-fuchsia-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
