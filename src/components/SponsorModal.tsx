import React, { useState } from 'react';
import { X, Megaphone, Send, CheckCircle2, MessageCircle, Mail } from 'lucide-react';
import { trackConversionEvent } from '../config/analytics';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SponsorModal({ isOpen, onClose }: SponsorModalProps) {
  // Strictly 3 high-converting fields: Name, Email, What do you want to promote?
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [promotionDetails, setPromotionDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !promotionDetails.trim()) return;

    trackConversionEvent('sponsor_lead_submit', {
      name: name.trim(),
      email: email.trim()
    });

    const leadPayload = {
      name: name.trim(),
      email: email.trim(),
      promotionDetails: promotionDetails.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('devpulse_sponsor_leads_v1') || '[]');
      existing.unshift(leadPayload);
      localStorage.setItem('devpulse_sponsor_leads_v1', JSON.stringify(existing.slice(0, 25)));
    } catch {
      // ignore
    }

    fetch('/api/sponsor-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    }).catch(() => {});

    setSubmitted(true);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hi DevPulse AI! I'm ${name || 'a sponsor'} (${email || 'email'}). I want to promote: ${
      promotionDetails || 'DevPulse AI Bento Slot ($49/mo)'
    }`
  )}`;

  const mailtoUrl = `mailto:sponsors@devpulse.ai?subject=${encodeURIComponent(
    `Sponsor DevPulse AI ($49/mo) — ${name || 'New Inquiry'}`
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nWhat do you want to promote?:\n${promotionDetails}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sponsor-modal-title"
      data-testid="sponsor-lead-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0B0D14] border border-fuchsia-500/35 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <h2 id="sponsor-modal-title" className="text-sm sm:text-base font-bold text-white">
                Sponsor DevPulse AI — Reach 50k+ Devs ($49/mo)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Self-serve Bento Grid sponsorship slot &amp; custom developer tool placement
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-sponsor-modal-btn"
            onClick={onClose}
            aria-label="Close Sponsor Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {submitted ? (
            <div
              data-testid="sponsor-submit-confirmation"
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Sponsorship Lead Submitted! We’ll activate your slot within 4 hours.</span>
              </div>
              <p className="text-zinc-300">
                Want instant self-serve confirmation? Fast-track via WhatsApp or Email below:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={mailtoUrl}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="sponsor-name" className="font-semibold text-zinc-200 block">
                  1. Name *
                </label>
                <input
                  id="sponsor-name"
                  data-testid="sponsor-name-input"
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
                  2. Email *
                </label>
                <input
                  id="sponsor-email"
                  data-testid="sponsor-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sponsor-promote" className="font-semibold text-zinc-200 block">
                  3. What do you want to promote? *
                </label>
                <textarea
                  id="sponsor-promote"
                  data-testid="sponsor-promote-input"
                  rows={3}
                  required
                  value={promotionDetails}
                  onChange={(e) => setPromotionDetails(e.target.value)}
                  placeholder="e.g., Promote our Developer API / Cloud Hosting in the Bento Grid slot ($49/mo)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-fuchsia-500 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  data-testid="sponsor-submit-btn"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="sponsor-whatsapp-link"
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={mailtoUrl}
                  data-testid="sponsor-mailto-link"
                  className="py-2.5 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mailto</span>
                </a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
