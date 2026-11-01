import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Zap,
  Camera,
  FlaskConical,
  FileJson,
  Globe,
  Database,
  ShieldCheck,
  Regex,
  Bug,
  FileText,
  Clock,
  FileCode,
  Rocket,
  ArrowUpRight,
  Sparkles,
  LayoutGrid,
  History,
  HelpCircle,
  Calculator,
  Megaphone
} from 'lucide-react';
import {
  SEO_TOOLS_CATALOG,
  SeoToolSlug,
  SeoToolDefinition,
  getSeoToolBySlug,
  filterSeoToolsCatalog
} from '../data/seoToolsCatalog';
import { WorkspaceNavId } from './LeftSidebar';

interface BentoCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSlug: SeoToolSlug;
  recentToolSlugs?: SeoToolSlug[];
  recentSlugs?: SeoToolSlug[];
  onSelectToolSlug: (slug: SeoToolSlug) => void;
  onSelectExtraNav?: (navId: WorkspaceNavId) => void;
  onOpenHosting: () => void;
  onOpenSponsor?: () => void;
}

const SLUG_ICON_MAP: Record<SeoToolSlug, React.ComponentType<{ className?: string }>> = {
  'ai-ui-generator': Zap,
  'screenshot-to-code': Camera,
  'prompt-benchmarker': FlaskConical,
  'json-to-typescript': FileJson,
  'curl-to-code': Globe,
  'ai-sql-generator': Database,
  'jwt-decoder': ShieldCheck,
  'regex-generator': Regex,
  'error-explainer': Bug,
  'readme-generator': FileText,
  'cron-expression': Clock,
  'svg-optimizer': FileCode,
  'roi-calculator': Calculator,
  'free-templates': LayoutGrid
};

export default function BentoCommandModal({
  isOpen,
  onClose,
  activeSlug,
  recentToolSlugs = [],
  recentSlugs = [],
  onSelectToolSlug,
  onSelectExtraNav,
  onOpenHosting,
  onOpenSponsor
}: BentoCommandModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SeoToolDefinition['category']>('All');
  const [hoveredTipKey, setHoveredTipKey] = useState<string | null>(null);

  const recentTools = useMemo(() => {
    const tracked = recentToolSlugs.length > 0 ? recentToolSlugs : recentSlugs;
    const sourceSlugs: SeoToolSlug[] =
      tracked.length > 0
        ? tracked.slice(0, 3)
        : ([activeSlug, 'screenshot-to-code', 'prompt-benchmarker']
            .filter((s, idx, arr) => arr.indexOf(s) === idx)
            .slice(0, 3) as SeoToolSlug[]);
    return sourceSlugs.map((slug) => getSeoToolBySlug(slug));
  }, [recentToolSlugs, recentSlugs, activeSlug]);

  const filteredTools = useMemo(() => {
    return filterSeoToolsCatalog(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-6xl rounded-3xl bg-[#06070B]/95 border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Radial Aurora Mesh Gradient Background */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Real-Time Filter Search Bar & Command Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                data-testid="bento-search-input"
                aria-label="Filter 12 AI and developer tools by name or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 12 tools by name or description (e.g., Tailwind UI, Screenshot, SQL, JWT, Regex, SVG)..."
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-2xl pl-10 pr-28 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    data-testid="bento-search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Clear search filter"
                    className="px-1.5 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/[0.16] text-[10px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <span
                  data-testid="bento-search-count"
                  className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                >
                  {filteredTools.length}/{SEO_TOOLS_CATALOG.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
              {(['All', 'AI Studio', 'Code & Data', 'API & Backend', 'DevOps & Docs'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bento Grid Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 relative z-10">
          {/* Recent Section (Last 3 Tools Navigated To from recentToolSlugs) */}
          {recentTools.length > 0 && (
            <div
              data-testid="bento-recent-section"
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Recent
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Last {recentTools.length} visited tools for instant access
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {recentTools.length}/3 Recent
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {recentTools.map((tool, idx) => {
                  const Icon = SLUG_ICON_MAP[tool.slug] || Sparkles;
                  const isCurrent = tool.slug === activeSlug;
                  const tipKey = `recent-${tool.slug}`;
                  const isTipVisible = hoveredTipKey === tipKey;

                  return (
                    <button
                      key={`recent-${tool.slug}`}
                      data-testid={`bento-recent-item-${idx}`}
                      onClick={() => {
                        onSelectToolSlug(tool.slug);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-indigo-500/40 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate flex items-center gap-1.5">
                            <span className="truncate">{tool.shortName}</span>
                            <span
                              data-testid={`recent-tier-badge-${tool.slug}`}
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 ${
                                tool.tierBadge === 'Pro'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {tool.tierBadge}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 truncate">
                            /tools/{tool.slug}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          role="note"
                          tabIndex={0}
                          aria-label={`How to use ${tool.shortName}: ${tool.quickTip}`}
                          data-testid={`recent-help-trigger-${tool.slug}`}
                          onMouseEnter={() => setHoveredTipKey(tipKey)}
                          onMouseLeave={() => setHoveredTipKey((prev) => (prev === tipKey ? null : prev))}
                          onFocus={() => setHoveredTipKey(tipKey)}
                          onBlur={() => setHoveredTipKey((prev) => (prev === tipKey ? null : prev))}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredTipKey((prev) => (prev === tipKey ? null : tipKey));
                          }}
                          className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-indigo-500/30 border border-white/[0.14] hover:border-indigo-400/60 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                          title={tool.quickTip}
                        >
                          ?
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
                      </div>

                      {isTipVisible && (
                        <div
                          role="tooltip"
                          data-testid={`recent-help-tooltip-${tool.slug}`}
                          className="absolute left-2 right-2 bottom-full mb-2 z-30 p-2.5 rounded-xl bg-[#0B0D14]/98 border border-indigo-500/40 shadow-xl backdrop-blur-xl text-[11px] leading-snug text-zinc-100 pointer-events-none"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-0.5">
                            <HelpCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>2-Sec Quick Tip</span>
                          </div>
                          <p className="text-zinc-200 font-normal">{tool.quickTip}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredTools.length === 0 ? (
            <div
              data-testid="bento-empty-search"
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-3"
            >
              <p className="text-sm font-semibold text-zinc-200">
                No tools matched &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-zinc-400">
                Try searching for Tailwind, Screenshot, JSON, TypeScript, cURL, SQL, JWT, Regex, Cron, or SVG.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTools.map((tool, index) => {
                const Icon = SLUG_ICON_MAP[tool.slug] || Sparkles;
                const isSelected = tool.slug === activeSlug;
                const isFeatured = index < 2 && selectedCategory === 'All' && !searchQuery;
                const tipKey = `grid-${tool.slug}`;
                const isTipVisible = hoveredTipKey === tipKey;

                return (
                  <button
                    key={tool.slug}
                    data-testid={`bento-tool-card-${tool.slug}`}
                    onClick={() => {
                      onSelectToolSlug(tool.slug);
                      onClose();
                    }}
                    className={`group relative text-left p-4 rounded-2xl backdrop-blur-xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer ${
                      isFeatured ? 'sm:col-span-2 bg-gradient-to-br from-indigo-500/15 via-white/[0.03] to-fuchsia-500/10' : 'bg-white/[0.03]'
                    } ${
                      isSelected
                        ? 'border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
                        : 'border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            data-testid={`tool-tier-badge-${tool.slug}`}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              tool.tierBadge === 'Pro'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {tool.tierBadge}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              tool.badge === 'Hot'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : tool.badge === 'Vision AI'
                                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                                : tool.badge === 'Popular'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/[0.06] text-zinc-300 border-white/[0.1]'
                            }`}
                          >
                            {tool.badge}
                          </span>
                          {/* '?' Tooltip Trigger for 2-Second Usage Snippet */}
                          <span
                            role="note"
                            tabIndex={0}
                            aria-label={`How to use ${tool.shortName}: ${tool.quickTip}`}
                            data-testid={`tool-help-trigger-${tool.slug}`}
                            onMouseEnter={() => setHoveredTipKey(tipKey)}
                            onMouseLeave={() => setHoveredTipKey((prev) => (prev === tipKey ? null : prev))}
                            onFocus={() => setHoveredTipKey(tipKey)}
                            onBlur={() => setHoveredTipKey((prev) => (prev === tipKey ? null : prev))}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoveredTipKey((prev) => (prev === tipKey ? null : tipKey));
                            }}
                            className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-indigo-500/30 border border-white/[0.14] hover:border-indigo-400/60 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                            title={tool.quickTip}
                          >
                            ?
                          </span>
                        </div>
                      </div>

                      {isTipVisible && (
                        <div
                          role="tooltip"
                          data-testid={`tool-help-tooltip-${tool.slug}`}
                          className="p-2.5 rounded-xl bg-[#0B0D14]/98 border border-indigo-500/45 shadow-xl text-[11px] leading-snug text-zinc-100 animate-fadeIn"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-0.5">
                            <HelpCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>2-Sec Usage Tip</span>
                          </div>
                          <p className="text-zinc-200 font-normal">{tool.quickTip}</p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                          <span>{tool.shortName}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {tool.bentoDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-zinc-500">
                      <span>/tools/{tool.slug}</span>
                      <span className="text-emerald-400 font-semibold">Launch →</span>
                    </div>
                  </button>
                );
              })}

              {/* Native Bento Sponsor Card inside the Bento Switcher */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-white/[0.03] to-indigo-950/40 backdrop-blur-xl border border-emerald-500/30 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Sponsored Partner
                    </span>
                    <Rocket className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    1-Click Cloud Edge Hosting ($2.99/mo)
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Deploy generated Tailwind & React apps with global CDN, custom domain & free SSL in 30 seconds.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenHosting();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Deploy Live ($2.99/mo)</span>
                </button>
              </div>

              {/* Self-Serve Bento Sponsor Slot Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-950/40 via-white/[0.03] to-indigo-950/40 backdrop-blur-xl border border-fuchsia-500/35 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                      Self-Serve Sponsor Slot
                    </span>
                    <Megaphone className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Sponsor DevPulse AI — Reach 50k+ Devs ($49/mo)
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Feature your SaaS, AI API, or dev tool across all 14 tool routes with native glass cards.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenSponsor) onOpenSponsor();
                    else onOpenHosting();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Book Sponsor Slot ($49/mo)</span>
                </button>
              </div>
            </div>
          )}

          {/* Bonus Studio Modules Row */}
          {onSelectExtraNav && (
            <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                Bonus Studio Workbenches:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'studio-gallery', label: '🎨 12 UI Component Templates' },
                    { id: 'labs-prompt-optimizer', label: '🤖 System Prompt Optimizer' },
                    { id: 'tool-color-scale', label: '🎨 Tailwind Color Scale' },
                    { id: 'tool-uuid-hash', label: '🔑 UUID & SHA-256 Forge' },
                    { id: 'tool-timestamp', label: '⏱️ Unix Epoch Converter' },
                    { id: 'tool-image-gen', label: '🖼️ AI SVG Asset Generator' }
                  ] as const
                ).map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => {
                      onSelectExtraNav(extra.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    {extra.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
