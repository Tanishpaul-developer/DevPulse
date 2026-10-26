import React from 'react';
import { X, Rocket, CheckCircle2, ExternalLink, Server, ShieldCheck } from 'lucide-react';
import { trackConversionEvent } from '../config/analytics';

interface HostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HostingModal({ isOpen, onClose }: HostingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hosting-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0B0D14] border border-indigo-500/30 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="hosting-modal-title" className="text-base font-bold text-white">
                🚀 Deploy Your AI Artifact & Full-Stack App Live
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Exclusive Developer Cloud Deal — Starting at $2.99/mo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Hosting Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <p>
            Take your generated HTML/Tailwind components, Next.js App Router templates, and PostgreSQL backends live on a global NVMe edge network in under 60 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="https://www.hostinger.com/web-hosting"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackConversionEvent('affiliate_hosting_click', { partner: 'hostinger', price: '2.99' })
              }
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-indigo-500/15 border border-white/[0.1] hover:border-indigo-500/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-indigo-300">Hostinger Cloud NVMe</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  $2.99/mo
                </span>
              </div>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Free Domain + Wildcard SSL</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Node.js, React & Git Auto-Deploy</span>
                </li>
              </ul>
              <div className="pt-1 text-xs font-bold text-indigo-400 flex items-center gap-1">
                <span>Claim 75% Off Deal</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>

            <a
              href="https://www.cloudways.com/en/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackConversionEvent('affiliate_hosting_click', { partner: 'cloudways', price: '11.00' })
              }
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/15 border border-white/[0.1] hover:border-emerald-500/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-emerald-300">Cloudways Managed VPS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  $100 Credit
                </span>
              </div>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Dedicated DigitalOcean / AWS Nodes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Redis Cache + Staging Environments</span>
                </li>
              </ul>
              <div className="pt-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Launch Free Trial</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
