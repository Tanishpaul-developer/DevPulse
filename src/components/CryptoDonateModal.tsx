import React, { useState } from 'react';
import {
  X,
  Zap,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Heart,
  Server,
  CheckCircle2,
  Clock,
  PlusCircle
} from 'lucide-react';
import {
  NOWPAYMENTS_CONFIG,
  CryptoDonationTransaction,
  MonthlyGoalMetrics
} from '../utils/studioEngine';
import { trackConversionEvent } from '../config/analytics';

interface CryptoDonateModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function CryptoDonateModal({
  isOpen,
  onClose,
  goalMetrics,
  transactions,
  onRecordDonation
}: CryptoDonateModalProps) {
  const [activeTab, setActiveTab] = useState<'widget' | 'direct'>('widget');

  if (!isOpen) return null;

  const handleOfficialButtonClick = () => {
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
      aria-labelledby="crypto-donate-modal-title"
      data-testid="crypto-donate-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-[#08090F] border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 id="crypto-donate-modal-title" className="text-sm font-bold text-white">
                Support DevPulse AI with Crypto
              </h2>
              <p className="text-[11px] text-zinc-400">
                Powered by NOWPayments • 300+ Cryptocurrencies Supported
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-crypto-donate-modal"
            onClick={onClose}
            aria-label="Close Crypto Donate Modal"
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

        {/* 2-Tab Switcher */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/[0.08]">
            <button
              type="button"
              data-testid="crypto-tab-btn-widget"
              onClick={() => setActiveTab('widget')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'widget'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Crypto Widget</span>
            </button>
            <button
              type="button"
              data-testid="crypto-tab-btn-direct"
              onClick={() => setActiveTab('direct')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Checkout &amp; Official Button</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'widget' ? (
            <div data-testid="crypto-tab-panel-widget" className="flex flex-col items-center space-y-3">
              <iframe
                src={NOWPAYMENTS_CONFIG.embeddedWidgetUrl}
                width="350"
                height="620"
                frameBorder="0"
                scrolling="no"
                className="mx-auto rounded-xl overflow-y-hidden border border-white/[0.08] bg-black/40"
                title="NOWPayments Crypto Donation Widget"
                data-testid="nowpayments-widget-iframe"
              />
            </div>
          ) : (
            <div data-testid="crypto-tab-panel-direct" className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Keep DevPulse AI 100% Free &amp; Zero-Login</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  DevPulse AI provides 12+ instant AI and developer tools with zero signup walls, no paywalls, and full client-side privacy. Your crypto contribution directly funds our high-speed multi-model inference rotator and edge infrastructure.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-300 pt-0.5">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Supports BTC, ETH, SOL, USDT, USDC, and 300+ tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>100% of donations go toward free developer quota &amp; server uptime</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 py-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Official NOWPayments Direct Checkout
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={NOWPAYMENTS_CONFIG.directDonationUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-testid="nowpayments-direct-button-link"
                    onClick={handleOfficialButtonClick}
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <img
                      src={NOWPAYMENTS_CONFIG.officialButtonImageUrl}
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

              {/* Transaction History Section for Donor Trust & Transparency */}
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

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
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
