/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import LeftSidebar, { WorkspaceNavId } from './components/LeftSidebar';
import ArtifactSandbox from './components/ArtifactSandbox';
import ScreenshotToCode from './components/ScreenshotToCode';
import UIComponentGallery from './components/UIComponentGallery';
import PromptBenchmarker from './components/PromptBenchmarker';
import SystemPromptOptimizer from './components/SystemPromptOptimizer';
import DevUtilities from './components/DevUtilities';
import ByokModal from './components/ByokModal';
import HostingModal from './components/HostingModal';
import CoffeeModal from './components/CoffeeModal';
import ShortcutsModal from './components/ShortcutsModal';
import SponsorModal from './components/SponsorModal';
import CryptoDonateModal from './components/CryptoDonateModal';
import SupportModal from './components/SupportModal';
import SandboxErrorBoundary from './components/SandboxErrorBoundary';
import FeedbackModal from './components/FeedbackModal';
import UsageHistoryView from './components/UsageHistoryView';
import SEOHead from './components/SEOHead';
import SemanticSeoArticle from './components/SemanticSeoArticle';
import SeoIndexNowModal from './components/SeoIndexNowModal';
import BentoCommandModal from './components/BentoCommandModal';
import MobileBottomDock from './components/MobileBottomDock';
import { initAnalyticsAndHeatmaps, trackConversionEvent } from './config/analytics';
import { getContextualAffiliateForTool } from './config/monetization';
import {
  ModelId,
  ArtifactCodeState,
  SavedSnippet,
  ByokConfig,
  ModelParameters
} from './types';
import {
  DEFAULT_STARTER_ARTIFACT,
  encodeArtifactToHash,
  decodeArtifactFromHash
} from './utils/urlHash';
import {
  persistArtifactAutoSave,
  loadArtifactAutoSave,
  AUTOSAVE_INTERVAL_MS,
  loadCryptoDonationState,
  recordCryptoDonationAction,
  CryptoDonationTransaction,
  DEFAULT_SAVED_SNIPPETS
} from './utils/studioEngine';
import {
  loadByokConfig,
  saveByokConfig,
  getRemainingFreeQuota,
  loadModelParameters,
  saveModelParameters,
  DEFAULT_MODEL_PARAMETERS
} from './services/aiRouter';
import {
  SEO_TOOLS_CATALOG,
  SeoToolSlug,
  getSeoToolBySlug,
  getSeoToolByNavId,
  updateRecentToolSlugs,
  DEFAULT_SEO_TOOL_SLUG,
  getCanonicalToolPath,
  resolveToolRouteFromLocation
} from './data/seoToolsCatalog';
import {
  Sparkles,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Rocket,
  Megaphone,
  Zap,
  CheckCircle2,
  X,
  ArrowUpRight,
  Coffee
} from 'lucide-react';

const SNIPPETS_STORAGE_KEY = 'devpulse_saved_snippets_v1';
const CURRENT_CODE_STORAGE_KEY = 'devpulse_current_artifact_v1';
const THEME_STORAGE_KEY = 'devpulse_theme_v1';
const RECENT_TOOLS_STORAGE_KEY = 'devpulse_recent_tools_v1';

export default function App() {
  // Determine initial SEO slug & WorkspaceNavId from /tools/:slug (or aliases like /tools/json-formatter) or ?tool=slug
  const initialRoute = useMemo(() => {
    if (typeof window !== 'undefined') {
      const resolved = resolveToolRouteFromLocation(window.location.pathname, window.location.search);
      return { slug: resolved.tool.slug, navId: resolved.tool.navId };
    }
    return { slug: DEFAULT_SEO_TOOL_SLUG, navId: 'studio-sandbox' as WorkspaceNavId };
  }, []);

  const [activeSeoSlug, setActiveSeoSlug] = useState<SeoToolSlug>(initialRoute.slug);
  const [activeNav, setActiveNav] = useState<WorkspaceNavId>(initialRoute.navId);
  const [recentToolSlugs, setRecentToolSlugs] = useState<SeoToolSlug[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_TOOLS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return updateRecentToolSlugs(parsed as SeoToolSlug[], initialRoute.slug, 3);
        }
      }
    } catch {
      // ignore
    }
    return updateRecentToolSlugs(
      ['screenshot-to-code', 'prompt-benchmarker'],
      initialRoute.slug,
      3
    );
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTopBentoStrip, setShowTopBentoStrip] = useState(true);

  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-flash');
  const [byokConfig, setByokConfig] = useState<ByokConfig>(() => loadByokConfig());
  const [remainingQuota, setRemainingQuota] = useState<number>(() => getRemainingFreeQuota());

  // AI Sampling Parameters persisted in localStorage
  const [modelParams, setModelParams] = useState<ModelParameters>(() => loadModelParameters());

  // Theme state ('dark' | 'light') persisted in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // Modals
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [byokAlertReason, setByokAlertReason] = useState<string | undefined>(undefined);
  const [isHostingOpen, setIsHostingOpen] = useState(false);
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBentoModalOpen, setIsBentoModalOpen] = useState(false);
  const [isSeoHubOpen, setIsSeoHubOpen] = useState(false);
  const [isSponsorOpen, setIsSponsorOpen] = useState(false);
  const [isCryptoDonateOpen, setIsCryptoDonateOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportModalInitialTab, setSupportModalInitialTab] = useState<'chai' | 'crypto'>('chai');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Crypto Donation Monthly Goal, Transaction History & Thank You Toast State
  const [cryptoDonationState, setCryptoDonationState] = useState(() => loadCryptoDonationState());
  const [thankYouToastMessage, setThankYouToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRecordCryptoDonation = useCallback(
    (params?: {
      donorAlias?: string;
      amountCrypto?: string;
      currency?: CryptoDonationTransaction['currency'];
      usdEquivalent?: number;
      status?: CryptoDonationTransaction['status'];
    }) => {
      const updated = recordCryptoDonationAction(params);
      setCryptoDonationState({
        donationCount: updated.donationCount,
        transactions: updated.transactions,
        goalMetrics: updated.goalMetrics
      });
      setThankYouToastMessage(updated.toastMessage);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        setThankYouToastMessage(null);
      }, 6500);
    },
    []
  );

  useEffect(() => {
    initAnalyticsAndHeatmaps();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Trigger counters for keyboard shortcuts inside ArtifactSandbox
  const [saveTriggerCount, setSaveTriggerCount] = useState(0);
  const [runTriggerCount, setRunTriggerCount] = useState(0);
  const [gitTriggerCount, setGitTriggerCount] = useState(0);
  const [refactorTriggerCount, setRefactorTriggerCount] = useState(0);
  const [dependenciesTriggerCount, setDependenciesTriggerCount] = useState(0);
  const [historyTriggerCount, setHistoryTriggerCount] = useState(0);
  const [consoleTriggerCount, setConsoleTriggerCount] = useState(0);
  const [paramsTriggerCount, setParamsTriggerCount] = useState(0);

  // Artifact Code State (hydrated from URL hash or localStorage auto-save)
  const [codeState, setCodeState] = useState<ArtifactCodeState>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#code=')) {
      const decoded = decodeArtifactFromHash(window.location.hash);
      if (decoded) return decoded;
    }
    const loaded = loadArtifactAutoSave();
    if (loaded.codeState) {
      return loaded.codeState;
    }
    try {
      const saved = localStorage.getItem(CURRENT_CODE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.html === 'string') return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STARTER_ARTIFACT;
  });

  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<number>(() => {
    const loaded = loadArtifactAutoSave();
    return loaded.meta?.savedAt || Date.now();
  });
  const codeStateRef = useRef<ArtifactCodeState>(codeState);
  useEffect(() => {
    codeStateRef.current = codeState;
  }, [codeState]);

  const [shareCopied, setShareCopied] = useState(false);

  // Saved Snippets in localStorage (seeded with DEFAULT_SAVED_SNIPPETS on first load)
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>(() => {
    try {
      const raw = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SAVED_SNIPPETS;
  });

  // Keep recentToolSlugs synced and persisted in localStorage whenever activeSeoSlug changes
  useEffect(() => {
    setRecentToolSlugs((prev) => {
      const next = updateRecentToolSlugs(prev, activeSeoSlug, 3);
      try {
        localStorage.setItem(RECENT_TOOLS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [activeSeoSlug]);

  // Navigate to a specific programmatic SEO tool slug (`/tools/:slug`)
  const handleNavigateToSeoSlug = useCallback((slug: SeoToolSlug) => {
    const toolDef = getSeoToolBySlug(slug);
    setActiveSeoSlug(toolDef.slug);
    setActiveNav(toolDef.navId);
    setRecentToolSlugs((prev) => {
      const next = updateRecentToolSlugs(prev, toolDef.slug, 3);
      try {
        localStorage.setItem(RECENT_TOOLS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const nextPath = `${getCanonicalToolPath(toolDef.slug)}${hash}`;
      window.history.pushState({ slug: toolDef.slug }, '', nextPath);
    }
  }, []);

  // Navigate to a WorkspaceNavId (from Sidebar or Quick Switcher)
  const handleNavigateToNavId = useCallback((navId: WorkspaceNavId) => {
    setActiveNav(navId);
    const matchedTool = SEO_TOOLS_CATALOG.find((t) => t.navId === navId);
    if (matchedTool) {
      setActiveSeoSlug(matchedTool.slug);
      setRecentToolSlugs((prev) => {
        const next = updateRecentToolSlugs(prev, matchedTool.slug, 3);
        try {
          localStorage.setItem(RECENT_TOOLS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const nextPath = `${getCanonicalToolPath(matchedTool.slug)}${hash}`;
        window.history.pushState({ slug: matchedTool.slug }, '', nextPath);
      }
    }
  }, []);

  // Listen to browser back/forward navigation (`popstate`)
  useEffect(() => {
    const onPopState = () => {
      const resolved = resolveToolRouteFromLocation(window.location.pathname, window.location.search);
      setActiveSeoSlug(resolved.tool.slug);
      setActiveNav(resolved.tool.navId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync theme class to document root and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleUpdateModelParams = useCallback((next: ModelParameters) => {
    setModelParams(next);
    saveModelParameters(next);
  }, []);

  const handleResetModelParams = useCallback(() => {
    setModelParams(DEFAULT_MODEL_PARAMETERS);
    saveModelParameters(DEFAULT_MODEL_PARAMETERS);
  }, []);

  // Sync current artifact to localStorage immediately on change AND every 5 seconds via auto-save timer
  useEffect(() => {
    const meta = persistArtifactAutoSave(codeState);
    setLastAutoSavedAt(meta.savedAt);
  }, [codeState]);

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      const meta = persistArtifactAutoSave(codeStateRef.current);
      setLastAutoSavedAt(meta.savedAt);
    }, AUTOSAVE_INTERVAL_MS);

    const handleBeforeUnload = () => {
      persistArtifactAutoSave(codeStateRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Listen for URL hash changes (#code=...)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash.startsWith('#code=')) {
        const decoded = decodeArtifactFromHash(window.location.hash);
        if (decoded) {
          setCodeState(decoded);
          setActiveNav('studio-sandbox');
          setActiveSeoSlug('ai-ui-generator');
        }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Refresh quota counter periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingQuota(getRemainingFreeQuota());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleShareUrl = useCallback(() => {
    const hash = encodeArtifactToHash(codeState);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  }, [codeState]);

  // Global keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K: Open 12-Tool Bento Grid Command Switcher
      if (isMod && e.key.toLowerCase() === 'k' && !e.shiftKey) {
        e.preventDefault();
        setIsBentoModalOpen((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + B: Toggle Collapsible Left Sidebar
      if (isMod && e.key.toLowerCase() === 'b' && !e.shiftKey) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + S: Save Artifact Snapshot
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setSaveTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + S: Share Artifact URL
      if (isMod && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleShareUrl();
        return;
      }

      // Cmd/Ctrl + Shift + G: Open Git Repository Modal
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setGitTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + F: Refactor Selected Code with AI
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setRefactorTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + D: Toggle CDN Dependencies Drawer
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setDependenciesTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + H: Toggle Version History Drawer
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setHistoryTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + J: Toggle Integrated Console Panel
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setConsoleTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Shift + P: Toggle AI Model Parameters Drawer
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleNavigateToSeoSlug('ai-ui-generator');
        setParamsTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl + Enter: Run / Reload Artifact Preview
      if (isMod && e.key === 'Enter' && !isInputFocused) {
        e.preventDefault();
        setRunTriggerCount((c) => c + 1);
        return;
      }

      // Cmd/Ctrl +Shift + L: Toggle Dark / Light Theme
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      // ?: Open Keyboard Shortcuts Modal (when not typing in an input)
      if (!isInputFocused && e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleShareUrl, handleToggleTheme, handleNavigateToSeoSlug]);

  const handleSelectModel = (model: ModelId) => {
    if (model === 'gemini-4-argon') {
      const cfg = loadByokConfig();
      if (!cfg.geminiKey || !cfg.geminiKey.trim()) {
        setByokAlertReason(
          '💎 Gemini 4 Argon (Pro) requires your own Gemini API key. Paste your key below to unlock Pro reasoning.'
        );
        setIsByokOpen(true);
      }
    }
    setSelectedModel(model);
  };

  const handleRequireByok = (reason?: string) => {
    setByokAlertReason(reason);
    setIsByokOpen(true);
  };

  const handleSaveByok = (nextConfig: ByokConfig) => {
    saveByokConfig(nextConfig);
    setByokConfig(nextConfig);
    setByokAlertReason(undefined);
  };

  const handleSaveSnippet = (title: string) => {
    const newSnippet: SavedSnippet = {
      id: crypto.randomUUID(),
      title,
      codeState,
      createdAt: Date.now()
    };
    const updated = [newSnippet, ...savedSnippets].slice(0, 30);
    setSavedSnippets(updated);
    try {
      localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLoadSnippet = (snippet: SavedSnippet) => {
    setCodeState(snippet.codeState);
  };

  const handleDeleteSnippet = (id: string) => {
    const updated = savedSnippets.filter((s) => s.id !== id);
    setSavedSnippets(updated);
    try {
      localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleApplyCodeToSandbox = (html: string, promptLabel: string) => {
    setCodeState((prev) => ({
      ...prev,
      html,
      css: '',
      js: '',
      prompt: promptLabel
    }));
    handleNavigateToSeoSlug('ai-ui-generator');
  };

  const hasCustomKey = Boolean(
    byokConfig.geminiKey?.trim() || byokConfig.groqKey?.trim() || byokConfig.openRouterKey?.trim()
  );

  // Active SEO Tool definition for <SEOHead /> and <SemanticSeoArticle />
  const activeSeoTool = useMemo(() => {
    const bySlug = getSeoToolBySlug(activeSeoSlug);
    if (bySlug.navId === activeNav || (activeSeoSlug === 'cron-expression' && activeNav === 'tool-regex-cron')) {
      return bySlug;
    }
    return getSeoToolByNavId(activeNav);
  }, [activeSeoSlug, activeNav]);

  // Contextual affiliate offer dynamically matched to the active tool route
  const contextualAffiliate = useMemo(
    () => getContextualAffiliateForTool(activeSeoTool.slug),
    [activeSeoTool.slug]
  );

  const handleResetWorkspaceOnCrash = useCallback(() => {
    setCodeState(DEFAULT_STARTER_ARTIFACT);
    persistArtifactAutoSave(DEFAULT_STARTER_ARTIFACT);
  }, []);

  return (
    <div
      data-testid="app-root-container"
      className="min-h-screen flex flex-col bg-[#06070B] text-zinc-100 selection:bg-indigo-500/30 pb-32 md:pb-0 relative overflow-x-hidden"
    >
      {/* Dynamic Google & Bing SEO Head + JSON-LD Schema Injector */}
      <SEOHead tool={activeSeoTool} />

      {/* Radial Aurora Mesh Gradient Backdrop */}
      <div className="fixed -top-40 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[450px] h-[450px] bg-fuchsia-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Top Global Header */}
      <Header
        activeNav={activeNav}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onOpenByokModal={() => {
          setByokAlertReason(undefined);
          setIsByokOpen(true);
        }}
        onOpenCoffeeModal={() => {
          setSupportModalInitialTab('chai');
          setIsSupportModalOpen(true);
        }}
        onOpenCryptoModal={() => {
          trackConversionEvent('crypto_donate_modal_open', { zone: 'top_header' });
          setSupportModalInitialTab('crypto');
          setIsSupportModalOpen(true);
        }}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        onOpenAiChatModal={() => handleNavigateToNavId('labs-prompt-optimizer')}
        onOpenBentoModal={() => setIsBentoModalOpen(true)}
        onOpenSeoHubModal={() => setIsSeoHubOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackOpen(true)}
        onOpenUsageHistory={() => handleNavigateToNavId('labs-usage-history')}
        remainingQuota={remainingQuota}
        hasCustomKey={hasCustomKey}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main OS Body: Left Collapsible Sidebar + Right Scrollable Workspace & Below-the-Fold SEO Article */}
      <div className="flex-1 flex flex-col md:flex-row relative z-10">
        <LeftSidebar
          activeNav={activeNav}
          onSelectNav={handleNavigateToNavId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          onOpenCommandModal={() => setIsBentoModalOpen(true)}
        />

        <main data-testid="main-workspace-container" className="flex-1 min-w-0 flex flex-col pb-32 md:pb-0">
          {/* Collapsible 2026 Liquid Glass Bento Grid Hero / 12-Tool Switcher Strip */}
          <section
            aria-label="12-Tool Liquid Glass Bento Switcher"
            className="border-b border-white/[0.08] bg-white/[0.015] backdrop-blur-xl px-3 sm:px-5 py-2.5"
          >
            <div className="max-w-7xl mx-auto space-y-2.5">
              {/* 5-Second Value Proposition + Live Social Proof Counter + 3-Zone CTAs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-emerald-300 bg-clip-text text-transparent">
                    Build, Debug &amp; Deploy AI Code in Seconds — 100% Free, Zero Login
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                    <span>18,400+ Components Built</span>
                    <span>•</span>
                    <span>6,200+ Dev Hours Saved</span>
                    <span>•</span>
                    <span>15+ Countries</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    data-testid="hero-deploy-live-btn"
                    onClick={() => {
                      trackConversionEvent('affiliate_hosting_click', { zone: 'hero_header' });
                      setIsHostingOpen(true);
                    }}
                    className="text-[11px] font-bold text-white px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Rocket className="w-3 h-3" />
                    <span>Deploy Live ($2.99/mo)</span>
                  </button>
                  <button
                    type="button"
                    data-testid="hero-sponsor-tool-btn"
                    onClick={() => {
                      trackConversionEvent('sponsor_modal_open', { zone: 'hero_header' });
                      setIsSponsorOpen(true);
                    }}
                    className="text-[11px] font-semibold text-fuchsia-300 hover:text-white px-2.5 py-1 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Megaphone className="w-3 h-3" />
                    <span>Sponsor This Tool</span>
                  </button>
                  <button
                    type="button"
                    data-testid="midpage-donate-crypto-btn"
                    onClick={() => {
                      trackConversionEvent('crypto_donate_modal_open', { zone: 'midpage_bar' });
                      setSupportModalInitialTab('crypto');
                      setIsSupportModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-amber-300 hover:text-white px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Coffee className="w-3 h-3 text-amber-400" />
                    <span>Buy Chai / Crypto</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Tool-Specific Affiliate Injection Strip */}
              <div
                data-testid="contextual-affiliate-bar"
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-[#0C0F1D] to-emerald-950/40 border border-indigo-500/25"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span
                    data-testid="contextual-affiliate-badge"
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 shrink-0"
                  >
                    {contextualAffiliate.badge}
                  </span>
                  <span
                    data-testid="contextual-affiliate-headline"
                    className="text-xs font-semibold text-zinc-200 truncate"
                  >
                    {contextualAffiliate.headline}
                  </span>
                </div>
                <a
                  href={contextualAffiliate.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid="contextual-affiliate-cta"
                  onClick={() =>
                    trackConversionEvent('contextual_affiliate_click', {
                      category: contextualAffiliate.category,
                      tool: activeSeoTool.slug
                    })
                  }
                  className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>{contextualAffiliate.ctaText}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    14 High-Traffic AI &amp; Developer Tools
                  </span>
                  <span
                    data-testid="bento-strip-active-route-pill"
                    className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                  >
                    /tools/{activeSeoTool.slug}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSeoHubOpen(true)}
                    className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 cursor-pointer"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>robots.txt / llms.txt / sitemap.xml</span>
                  </button>
                  <button
                    onClick={() => setIsBentoModalOpen(true)}
                    className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 cursor-pointer whitespace-nowrap"
                  >
                    <LayoutGrid className="w-3 h-3 shrink-0" />
                    <span>Full Bento Grid (Ctrl+K)</span>
                  </button>
                  <button
                    onClick={() => setShowTopBentoStrip((v) => !v)}
                    className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.08] cursor-pointer"
                    title={showTopBentoStrip ? 'Collapse Bento Cards' : 'Expand Bento Cards'}
                  >
                    {showTopBentoStrip ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {showTopBentoStrip && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
                  {SEO_TOOLS_CATALOG.slice(0, 5).map((tool) => {
                    const isCurrent = tool.slug === activeSeoTool.slug;
                    return (
                      <a
                        key={tool.slug}
                        href={getCanonicalToolPath(tool.slug)}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigateToSeoSlug(tool.slug);
                        }}
                        className={`group p-2.5 rounded-2xl backdrop-blur-xl border transition-all flex flex-col justify-between gap-1.5 ${
                          isCurrent
                            ? 'bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-transparent border-indigo-500/50 text-white shadow-md shadow-indigo-950/50'
                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.18] text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate group-hover:text-indigo-300">
                            {tool.shortName}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${
                                tool.tierBadge === 'Pro'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {tool.tierBadge}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                                tool.badge === 'Hot'
                                  ? 'bg-indigo-500/25 text-indigo-300'
                                  : tool.badge === 'Vision AI'
                                  ? 'bg-fuchsia-500/25 text-fuchsia-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {tool.badge}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {tool.bentoDescription}
                        </p>
                      </a>
                    );
                  })}

                  {/* Permanent Glowing Self-Serve Sponsor Slot Card in Bento Grid */}
                  <button
                    type="button"
                    data-testid="bento-sponsor-slot-card"
                    onClick={() => {
                      trackConversionEvent('sponsor_modal_open', { zone: 'bento_grid_slot' });
                      setIsSponsorOpen(true);
                    }}
                    className="group p-2.5 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 via-indigo-600/15 to-emerald-500/10 hover:from-fuchsia-600/30 hover:to-indigo-600/25 border border-fuchsia-500/45 shadow-md shadow-fuchsia-950/40 text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-fuchsia-300 shrink-0" />
                        <span>Sponsor DevPulse AI</span>
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/40 shrink-0">
                        $49/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-fuchsia-100/90 line-clamp-1">
                      Sponsor DevPulse AI — Reach 50k+ Devs ($49/mo)
                    </p>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Interactive Tool Workspace wrapped in SandboxErrorBoundary */}
          <div className="flex-1">
            <SandboxErrorBoundary
              workspaceName={activeSeoTool.shortName}
              onResetWorkspace={handleResetWorkspaceOnCrash}
            >
            {activeNav === 'studio-sandbox' && (
              <ArtifactSandbox
                codeState={codeState}
                onChangeCode={(next) => {
                  setCodeState(next);
                  setRemainingQuota(getRemainingFreeQuota());
                }}
                selectedModel={selectedModel}
                onRequireByok={handleRequireByok}
                onOpenHosting={() => setIsHostingOpen(true)}
                onShareUrl={handleShareUrl}
                shareCopied={shareCopied}
                savedSnippets={savedSnippets}
                onSaveSnippet={handleSaveSnippet}
                onLoadSnippet={handleLoadSnippet}
                onDeleteSnippet={handleDeleteSnippet}
                saveTriggerCount={saveTriggerCount}
                runTriggerCount={runTriggerCount}
                gitTriggerCount={gitTriggerCount}
                refactorTriggerCount={refactorTriggerCount}
                dependenciesTriggerCount={dependenciesTriggerCount}
                historyTriggerCount={historyTriggerCount}
                consoleTriggerCount={consoleTriggerCount}
                paramsTriggerCount={paramsTriggerCount}
                modelParams={modelParams}
                onUpdateModelParams={handleUpdateModelParams}
                onResetModelParams={handleResetModelParams}
                onOpenVisionCloner={() => handleNavigateToSeoSlug('screenshot-to-code')}
                onOpenGallery={() => handleNavigateToNavId('studio-gallery')}
                onOpenAiChat={() => handleNavigateToNavId('labs-prompt-optimizer')}
                activeToolSlug={activeSeoTool.slug}
                activeToolName={activeSeoTool.shortName}
                activeToolDescription={activeSeoTool.bentoDescription}
                lastAutoSavedAt={lastAutoSavedAt}
              />
            )}

            {activeNav === 'studio-vision' && (
              <ScreenshotToCode
                selectedModel={selectedModel}
                onRequireByok={handleRequireByok}
                onApplyToSandbox={handleApplyCodeToSandbox}
              />
            )}

            {activeNav === 'studio-gallery' && (
              <UIComponentGallery onOpenInSandbox={handleApplyCodeToSandbox} />
            )}

            {activeNav === 'labs-benchmarker' && (
              <PromptBenchmarker
                onRequireByok={handleRequireByok}
                modelParams={modelParams}
                onUpdateModelParams={handleUpdateModelParams}
                onResetModelParams={handleResetModelParams}
              />
            )}

            {activeNav === 'labs-prompt-optimizer' && (
              <SystemPromptOptimizer
                selectedModel={selectedModel}
                onRequireByok={handleRequireByok}
              />
            )}

            {activeNav === 'labs-usage-history' && (
              <UsageHistoryView
                onReplayPromptInSandbox={(prompt) => {
                  setCodeState((prev) => ({ ...prev, prompt }));
                  handleNavigateToSeoSlug('ai-ui-generator');
                }}
              />
            )}

            {activeNav.startsWith('tool-') && (
              <DevUtilities
                selectedModel={selectedModel}
                onRequireByok={handleRequireByok}
                activeToolId={activeNav}
                activeSeoSlug={activeSeoSlug}
                onSelectToolId={handleNavigateToNavId}
              />
            )}
            </SandboxErrorBoundary>
          </div>

          {/* Below-the-Fold Semantic SEO Content Block (600+ words, H1/H2, Steps, Formula/Logic, FAQs, Internal Links) */}
          <SemanticSeoArticle
            tool={activeSeoTool}
            onSelectToolSlug={handleNavigateToSeoSlug}
            onOpenSeoHub={() => setIsSeoHubOpen(true)}
            onOpenHosting={() => setIsHostingOpen(true)}
            onOpenSupportModal={() => {
              setSupportModalInitialTab('chai');
              setIsSupportModalOpen(true);
            }}
            onTriggerDonationToast={() => handleRecordCryptoDonation()}
          />
        </main>
      </div>

      {/* Global Donation "Thank You" Toast Notification */}
      {thankYouToastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="donation-thank-you-toast"
          className="fixed bottom-20 md:bottom-6 right-4 z-[60] max-w-md flex items-start gap-3 p-4 rounded-2xl bg-[#0B0E17]/95 backdrop-blur-2xl border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 text-white"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-300">
              Thank You for Your Support!
            </div>
            <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">
              {thankYouToastMessage}
            </p>
          </div>
          <button
            type="button"
            data-testid="dismiss-thank-you-toast"
            onClick={() => setThankYouToastMessage(null)}
            aria-label="Dismiss Thank You notification"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile-First Floating Glass Bottom Navigation Dock (< 768px) */}
      <MobileBottomDock
        activeNav={activeNav}
        onSelectNav={handleNavigateToNavId}
        onOpenBentoHub={() => setIsBentoModalOpen(true)}
        onOpenByokModal={() => {
          setByokAlertReason(undefined);
          setIsByokOpen(true);
        }}
      />

      {/* Modals */}
      <BentoCommandModal
        isOpen={isBentoModalOpen}
        onClose={() => setIsBentoModalOpen(false)}
        activeSlug={activeSeoTool.slug}
        recentToolSlugs={recentToolSlugs}
        recentSlugs={recentToolSlugs}
        onSelectToolSlug={handleNavigateToSeoSlug}
        onSelectExtraNav={handleNavigateToNavId}
        onOpenHosting={() => setIsHostingOpen(true)}
        onOpenSponsor={() => setIsSponsorOpen(true)}
      />

      <SeoIndexNowModal
        isOpen={isSeoHubOpen}
        onClose={() => setIsSeoHubOpen(false)}
      />

      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        initialConfig={byokConfig}
        onSave={handleSaveByok}
        alertReason={byokAlertReason}
      />

      <HostingModal isOpen={isHostingOpen} onClose={() => setIsHostingOpen(false)} />
      <CoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        initialTab={supportModalInitialTab}
        goalMetrics={cryptoDonationState.goalMetrics}
        transactions={cryptoDonationState.transactions}
        onRecordDonation={handleRecordCryptoDonation}
      />
      <CryptoDonateModal
        isOpen={isCryptoDonateOpen}
        onClose={() => setIsCryptoDonateOpen(false)}
        goalMetrics={cryptoDonationState.goalMetrics}
        transactions={cryptoDonationState.transactions}
        onRecordDonation={handleRecordCryptoDonation}
      />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <SponsorModal isOpen={isSponsorOpen} onClose={() => setIsSponsorOpen(false)} />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        activeToolSlug={activeSeoTool.slug}
      />
    </div>
  );
}
