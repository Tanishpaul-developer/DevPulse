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
  Zap
} from 'lucide-react';
import { ModelId } from '../types';
import { WorkspaceNavId, SIDEBAR_CATEGORIES } from './LeftSidebar';
import { BUY_ME_A_COFFEE_URL } from '../utils/studioEngine';

interface HeaderProps {
  activeNav: WorkspaceNavId;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onOpenByokModal: () => void;
  onOpenCoffeeModal: () => void;
  onOpenCryptoModal?: () => void;
  onOpenShortcutsModal: () => void;
  onOpenAiChatModal?: () => void;
  onOpenBentoModal?: () => void;
  onOpenSeoHubModal?: () => void;
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
  onOpenCoffeeModal: _onOpenCoffeeModal,
  onOpenCryptoModal,
  onOpenShortcutsModal,
  onOpenAiChatModal,
  onOpenBentoModal,
  onOpenSeoHubModal,
  remainingQuota,
  hasCustomKey,
  theme,
  onToggleTheme
}: HeaderProps) {
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

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.08] bg-[#06070B]/85 backdrop-blur-2xl px-3 sm:px-5 flex items-center justify-between gap-2">
      {/* Left: Brand Identity + Bento Hub Launcher + Active Module Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-zinc-100 text-sm">DevPulse AI</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                2026 Liquid Glass
              </span>
            </div>
          </div>
        </div>

        {/* Ctrl+K Bento Hub Switcher Button */}
        {onOpenBentoModal && (
          <button
            onClick={onOpenBentoModal}
            title="Open 12-Tool Bento Grid Switcher (Cmd/Ctrl + K)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Bento Hub</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-black/50 text-indigo-300 rounded border border-indigo-500/30">
              Ctrl+K
            </kbd>
          </button>
        )}

        {/* Active Module Breadcrumb */}
        <div className="hidden 2xl:flex items-center gap-1.5 pl-2.5 border-l border-white/[0.08] text-xs truncate">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            {activeCategoryTitle}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-semibold truncate">{activeModuleLabel}</span>
        </div>

        {/* Active Local Session Badge */}
        <div
          title="Zero-Login Architecture: All code, snippets, and keys persist locally in your browser."
          className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium shrink-0 whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Session Active</span>
        </div>
      </div>

      {/* Right: Model Selector + SEO Hub + AI Chat + BYOK + Theme + Shortcuts + Donate Crypto + Buy Me a Coffee */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
        {/* Free Quota Indicator */}
        <div
          title="Free Auto-Rotator Rate Limiter (10 requests/minute)"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 shrink-0 whitespace-nowrap"
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
            className="appearance-none max-w-[145px] sm:max-w-[210px] truncate bg-white/[0.04] hover:bg-white/[0.08] text-zinc-100 text-xs font-medium rounded-xl pl-2.5 pr-6 py-1.5 border border-white/[0.1] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="gemini-flash">Gemini Flash (Free Auto-Rotator)</option>
            <option value="groq-llama">Llama 3.3 70B (Groq High-Speed)</option>
            <option value="gemini-4-argon">Gemini 4 Argon (BYOK Pro)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* SEO & IndexNow Hub Button */}
        {onOpenSeoHubModal && (
          <button
            onClick={onOpenSeoHubModal}
            title="Open SEO & Bing IndexNow Hub (robots.txt, llms.txt, sitemap.xml)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden lg:inline">SEO &amp; IndexNow</span>
          </button>
        )}

        {/* Quick AI Assistant Button */}
        {onOpenAiChatModal && (
          <button
            onClick={onOpenAiChatModal}
            title="Open AI Code Assistant"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden md:inline">AI Chat</span>
          </button>
        )}

        {/* BYOK Settings Button */}
        <button
          onClick={onOpenByokModal}
          title="Configure Bring-Your-Own-Key (BYOK) Settings (Ctrl/Cmd + K)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shrink-0 ${
            hasCustomKey
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
              : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:bg-white/[0.08]'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">BYOK</span>
        </button>

        {/* Theme Toggle Button */}
        <button
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
          onClick={onOpenShortcutsModal}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
          className="hidden sm:flex p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer shrink-0"
        >
          <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {/* Donate Crypto Button */}
        {onOpenCryptoModal && (
          <button
            type="button"
            data-testid="header-donate-crypto-btn"
            onClick={onOpenCryptoModal}
            title="Donate Crypto via NOWPayments"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Donate Crypto</span>
          </button>
        )}

        {/* Buy Me a Coffee Link Button (Redirects to https://www.chai4.me/blueauric) */}
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="buy-me-a-coffee-link"
          title="Support on Chai4Me (https://www.chai4.me/blueauric)"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shrink-0"
        >
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Buy Me a Coffee</span>
        </a>
      </div>
    </header>
  );
}
