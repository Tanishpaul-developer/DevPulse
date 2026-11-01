import React, { useState } from 'react';
import {
  X,
  Zap,
  Coffee,
  ShieldCheck,
  Sparkles,
  Heart,
  Server,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import {
  CHAI4ME_UPI_URL,
  NOWPAYMENTS_DONATE_URL,
  NOWPAYMENTS_WIDGET_URL,
  NOWPAYMENTS_OFFICIAL_BUTTON_SVG,
  CHAI_SUPPORT_TIERS,
  ChaiSupportTier
} from '../config/monetization';
import {
  CryptoDonationTransaction,
  MonthlyGoalMetrics
} from '../utils/studioEngine';
import { trackConversionEvent } from '../config/analytics';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chai' | 'crypto';
  goalMetrics: MonthlyGoalMetrics;
  transactions: CryptoDonationTransaction[];
  onRecordDonation: (params?: {
    donorAlias?: string;
    amountCrypto?: string;
    currency?: CryptoDonationTransaction['currency'];
    usdEquivalent?: number;
    status?: CryptoDonationTransaction['status'];
  }) => void;
}

export default function SupportModal({
  isOpen,
  onClose,
  initialTab = 'chai',
  goalMetrics,
  transactions,
  onRecordDonation
}: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'chai' | 'crypto'>(initialTab);
  const [selectedChaiTier, setSelectedChaiTier] = useState<ChaiSupportTier>(CHAI_SUPPORT_TIERS[1]);

  if (!isOpen) return null;

  const handleChaiUpiClick = () => {
    window.gtag?.('event', 'chai_upi_donate_click', {
      method: 'chai4me_upi',
      tier: selectedChaiTier.id,
      amount_inr: selectedChaiTier.amountInr
    });
    trackConversionEvent('chai_upi_donate_click', {
      method: 'chai4me_upi',
      tier: selectedChaiTier.label,
      amountInr: selectedChaiTier.amountInr,
      url: CHAI4ME_UPI_URL
    });
    onRecordDonation({
      donorAlias: 'in-upi-supporter.dev',
      amountCrypto: `${selectedChaiTier.label} (UPI)`,
      currency: 'USDT',
      usdEquivalent: Math.max(2, Math.round(selectedChaiTier.amountInr / 84)),
      status: 'Confirmed'
    });
  };

  const handleOfficialCryptoButtonClick = () => {
    window.gtag?.('event', 'crypto_donate_click', { method: 'nowpayments_button' });
    trackConversionEvent('crypto_donate_click', { method: 'nowpayments_button' });
    onRecordDonation({
      amountCrypto: '15.00 USDT',
      currency: 'USDT',
      usdEquivalent: 10,
      status: 'Confirmed'
    });
  };

  const handleRecordSampleDonation = () => {
    window.gtag?.('event', 'crypto_donate_click', { method: 'verify_crypto_tx' });
    trackConversionEvent('crypto_donate_click', { method: 'verify_crypto_tx' });
    onRecordDonation({
      amountCrypto: '0.10 SOL',
      currency: 'SOL',
      usdEquivalent: 10,
      status: 'Confirmed'
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      data-testid="support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div
        data-testid="crypto-donate-modal"
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#08090F] border border-amber-500/35 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 id="support-modal-title" className="text-sm font-bold text-white">
                Support DevPulse AI — Keep All 14+ Tools 100% Free
              </h2>
              <p className="text-[11px] text-zinc-400">
                Instant Indian UPI (Chai4Me) &amp; Global Crypto (NOWPayments 300+ Coins)
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-support-modal"
            onClick={onClose}
            aria-label="Close Support Modal"
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Server Hosting Goal Progress Bar */}
        <div
          data-testid="monthly-goal-progress-section"
          className="px-5 py-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-white/[0.08]"
        >
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-200">
              <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Monthly Goal: Server &amp; Edge Hosting Costs</span>
            </div>
            <span
              data-testid="monthly-goal-count-badge"
              className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30"
            >
              {goalMetrics.donationCount}/{goalMetrics.targetDonationCount} Donations ({goalMetrics.progressPercent}%)
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Monthly Server Hosting Goal Progress"
            aria-valuenow={goalMetrics.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            data-testid="monthly-goal-progress-bar"
            className="w-full h-2.5 rounded-full bg-black/60 border border-white/[0.1] overflow-hidden p-0.5"
          >
            <div
              data-testid="monthly-goal-progress-fill"
              style={{ width: `${goalMetrics.progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
            <span>
              Raised: <strong className="text-zinc-200 font-mono">${goalMetrics.raisedUsd}</strong> / ${goalMetrics.targetUsd} mo
            </span>
            <span>
              {goalMetrics.remainingDonations > 0
                ? `${goalMetrics.remainingDonations} more donations to reach 100%`
                : '100% Monthly Server Goal Funded!'}
            </span>
          </div>
        </div>

        {/* 2-Tab Switcher: Tab 1 (Indian UPI Chai4Me) | Tab 2 (Global Crypto 300+ Coins) */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/[0.08]">
            <button
              type="button"
              data-testid="support-tab-chai"
              onClick={() => setActiveTab('chai')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chai'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Buy Me a Chai (Instant UPI)</span>
            </button>
            <button
              type="button"
              data-testid="support-tab-crypto"
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Global Crypto (300+ Coins)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'chai' ? (
            <div data-testid="support-panel-chai" className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Zero-Commission Indian UPI Developer Support</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    GPay • PhonePe • Paytm • BHIM
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Pick a Chai tier below to support DevPulse AI’s free multi-model inference rotator and zero-login developer tools via instant UPI checkout.
                </p>
              </div>

              {/* Preset Chai Tiers: 1 Chai ₹49, 3 Chais ₹149, Pro Supporter ₹499 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CHAI_SUPPORT_TIERS.map((tier) => {
                  const isSelected = selectedChaiTier.id === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      data-testid={`chai-tier-btn-${tier.id}`}
                      onClick={() => setSelectedChaiTier(tier)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-950/40'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] text-zinc-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {tier.badge}
                        </span>
                        <div className="text-sm font-extrabold text-white pt-0.5">
                          {tier.label}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        {tier.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Primary Glowing Chai4Me UPI CTA Button */}
              <div className="pt-1 space-y-2">
                <a
                  href={CHAI4ME_UPI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="chai4me-upi-cta-link"
                  onClick={handleChaiUpiClick}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Coffee className="w-4 h-4 shrink-0" />
                  <span>Tip Instantly via Chai4Me UPI ({selectedChaiTier.label})</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
                <p className="text-[11px] text-center text-zinc-400 font-mono">
                  Redirects securely to {CHAI4ME_UPI_URL} • Instant Supporter Badge Unlocked
                </p>
              </div>
            </div>
          ) : (
            <div data-testid="support-panel-crypto" className="space-y-4">
              {/* Lazy-loaded NOWPayments iframe */}
              <div className="flex flex-col items-center space-y-2">
                <iframe
                  src={NOWPAYMENTS_WIDGET_URL}
                  width="350"
                  height="620"
                  frameBorder="0"
                  scrolling="no"
                  className="mx-auto rounded-xl overflow-y-hidden border border-white/[0.08] bg-black/40"
                  title="NOWPayments Crypto Donation Widget"
                  data-testid="nowpayments-widget-iframe"
                />
              </div>

              {/* Official NOWPayments Black SVG Button + Direct Checkout */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Keep DevPulse AI 100% Free &amp; Zero-Login (300+ Coins)</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={NOWPAYMENTS_DONATE_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-testid="nowpayments-direct-button-link"
                    onClick={handleOfficialCryptoButtonClick}
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <img
                      src={NOWPAYMENTS_OFFICIAL_BUTTON_SVG}
                      alt="Crypto donation button by NOWPayments"
                      className="h-11 mx-auto"
                    />
                  </a>
                  <button
                    type="button"
                    data-testid="simulate-crypto-donation-btn"
                    onClick={handleRecordSampleDonation}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>I Completed a Crypto Donation</span>
                  </button>
                </div>
              </div>

              {/* Transaction History Section */}
              <div
                data-testid="crypto-transaction-history"
                className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-left space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Transaction History</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Transparency Ledger
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      data-testid="crypto-transaction-item"
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white truncate">{tx.amountCrypto}</span>
                          <span className="text-[10px] font-mono text-zinc-400">(${tx.usdEquivalent})</span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                            {tx.donorAlias}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          Tx: {tx.txHashShort} • {tx.relativeTime}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.status === 'Confirmed' || tx.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {tx.status === 'Confirmed' || tx.status === 'Completed' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{tx.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
