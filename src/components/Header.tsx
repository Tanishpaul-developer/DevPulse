import React from 'react';
import {
  Terminal,
  Key,
  Coffee,
  ChevronDown,
  Activity,
  Sun,
  Moon,
  Keyboard,
  MessageSquare,
  LayoutGrid,
  TrendingUp,
  History,
  MessageSquarePlus,
  Download
} from 'lucide-react';
import { ModelId } from '../types';
import { WorkspaceNavId, SIDEBAR_CATEGORIES } from './LeftSidebar';
import { usePWAInstall } from '../utils/pwa';

interface HeaderProps {
  activeNav: WorkspaceNavId;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onOpenByokModal: () => void;
  onOpenCoffeeModal: () => void;
  onOpenCryptoModal?: () => void;
  onOpenSupportModal?: (initialTab?: 'chai' | 'crypto') => void;
  onOpenShortcutsModal: () => void;
  onOpenAiChatModal?: () => void;
  onOpenBentoModal?: () => void;
  onOpenSeoHubModal?: () => void;
  onOpenFeedbackModal?: () => void;
  onOpenUsageHistory?: () => void;
  remainingQuota: number;
  hasCustomKey: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Header({
  activeNav,
  selectedModel,
  onSelectModel,
  onOpenByokModal,
  onOpenCoffeeModal,
  onOpenCryptoModal,
  onOpenSupportModal,
  onOpenShortcutsModal,
  onOpenAiChatModal,
  onOpenBentoModal,
  onOpenSeoHubModal,
  onOpenFeedbackModal,
  onOpenUsageHistory,
  remainingQuota,
  hasCustomKey,
  theme,
  onToggleTheme
}: HeaderProps) {
  const { isInstalled, installBannerMessage, dismissInstallBanner, triggerInstallPrompt } =
    usePWAInstall();

  let activeCategoryTitle = 'STUDIO';
  let activeModuleLabel = 'Visual Artifact Studio';
  for (const cat of SIDEBAR_CATEGORIES) {
    const found = cat.items.find((i) => i.id === activeNav);
    if (found) {
      activeCategoryTitle = cat.title;
      activeModuleLabel = found.label;
      break;
    }
  }

  const handleOpenSupport = (tab: 'chai' | 'crypto' = 'chai') => {
    if (onOpenSupportModal) {
      onOpenSupportModal(tab);
    } else if (onOpenCryptoModal) {
      onOpenCryptoModal();
    } else {
      onOpenCoffeeModal();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 border-b border-white/[0.08] bg-[#06070B]/85 backdrop-blur-2xl px-3 sm:px-5 flex items-center justify-between gap-2">
        {/* Left: Brand Identity + Bento Hub Launcher + Active Module Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-100 text-sm whitespace-nowrap">
                  DevPulse AI
                </span>
                <span className="hidden 2xl:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  2026 Liquid Glass
                </span>
              </div>
            </div>
          </div>

          {/* Ctrl+K Bento Hub Switcher Button */}
          {onOpenBentoModal && (
            <button
              type="button"
              onClick={onOpenBentoModal}
              title="Open 14-Tool Bento Grid Switcher (Cmd/Ctrl + K)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Bento Hub</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-black/50 text-indigo-300 rounded border border-indigo-500/30">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Active Module Breadcrumb */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-2 border-l border-white/[0.08] text-xs truncate">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
              {activeCategoryTitle}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 font-semibold truncate">{activeModuleLabel}</span>
          </div>
        </div>

        {/* Right: Model Selector + Install App + SEO Hub + AI Chat + Usage History + Feedback + BYOK + Theme + Shortcuts + Buy Chai / Crypto */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0">
          {/* Free Quota Indicator */}
          <div
            title="Free Auto-Rotator Rate Limiter (10 requests/minute)"
            className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 shrink-0 whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Quota:</span>
            <span className="font-mono font-semibold text-zinc-200">{remainingQuota}/10</span>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative min-w-0 shrink-0">
            <select
              aria-label="Select AI Model"
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value as ModelId)}
              className="appearance-none max-w-[112px] sm:max-w-[155px] truncate bg-white/[0.04] hover:bg-white/[0.08] text-zinc-100 text-xs font-medium rounded-xl pl-2.5 pr-6 py-1.5 border border-white/[0.1] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="gemini-flash">Gemini Flash (Free Auto-Rotator)</option>
              <option value="groq-llama">Llama 3.3 70B (Groq High-Speed)</option>
              <option value="gemini-4-argon">Gemini 4 Argon (BYOK Pro)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Native PWA Install App Button */}
          {!isInstalled && (
            <button
              type="button"
              data-testid="pwa-install-btn"
              onClick={triggerInstallPrompt}
              title="Install DevPulse AI as a standalone Desktop or Mobile App (Offline Ready)"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/35 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden lg:inline">Install App</span>
            </button>
          )}

          {/* SEO & IndexNow Hub Button */}
          {onOpenSeoHubModal && (
            <button
              type="button"
              onClick={onOpenSeoHubModal}
              title="Open SEO & Bing IndexNow Hub (robots.txt, llms.txt, sitemap.xml)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">SEO Hub</span>
            </button>
          )}

          {/* Quick AI Assistant Button */}
          {onOpenAiChatModal && (
            <button
              type="button"
              onClick={onOpenAiChatModal}
              title="Open AI Code Assistant"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden xl:inline">AI Chat</span>
            </button>
          )}

          {/* Usage History Navigation Tab Button */}
          {onOpenUsageHistory && (
            <button
              type="button"
              data-testid="header-usage-history-btn"
              onClick={onOpenUsageHistory}
              title="Open AI Usage History (Chronological interactions, token counts & latency)"
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeNav === 'labs-usage-history'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.08]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">Usage History</span>
            </button>
          )}

          {/* User Feedback Modal Button */}
          {onOpenFeedbackModal && (
            <button
              type="button"
              data-testid="open-feedback-modal-btn"
              onClick={onOpenFeedbackModal}
              title="Send Product Feedback (Bug report, feature request, or general feedback)"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span className="hidden lg:inline">Feedback</span>
            </button>
          )}

          {/* BYOK Settings Button (Mobile has dedicated API Keys in bottom dock) */}
          <button
            type="button"
            onClick={onOpenByokModal}
            title="Configure Bring-Your-Own-Key (BYOK) Settings"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shrink-0 ${
              hasCustomKey
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden 2xl:inline">BYOK</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
            className="hidden sm:flex p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer shrink-0"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Upgraded Hybrid Support Button: Buy Chai / Crypto (opens <SupportModal />) */}
          <button
            type="button"
            data-testid="header-support-modal-btn"
            onClick={() => handleOpenSupport('chai')}
            title="Support DevPulse AI via Indian UPI (Chai4Me) or Global Crypto (NOWPayments)"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Buy Chai / Crypto</span>
          </button>
        </div>
      </header>

      {/* PWA Install Status Banner when triggered in preview */}
      {installBannerMessage && (
        <div
          role="status"
          data-testid="pwa-install-banner"
          className="bg-indigo-950/90 border-b border-indigo-500/40 px-4 py-2 text-xs text-indigo-100 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{installBannerMessage}</span>
          </div>
          <button
            type="button"
            onClick={dismissInstallBanner}
            className="text-[11px] font-semibold text-indigo-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
