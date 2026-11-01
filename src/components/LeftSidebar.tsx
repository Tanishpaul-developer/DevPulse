import React, { useState } from 'react';
import {
  Zap,
  Camera,
  LayoutGrid,
  FlaskConical,
  Sparkles,
  FileJson,
  Globe,
  Regex,
  Database,
  ShieldCheck,
  Bug,
  FileText,
  Palette,
  Hash,
  Clock,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ChevronRight,
  FileCode,
  History,
  Calculator
} from 'lucide-react';

export type WorkspaceNavId =
  | 'studio-sandbox'
  | 'studio-vision'
  | 'studio-gallery'
  | 'labs-benchmarker'
  | 'labs-prompt-optimizer'
  | 'labs-usage-history'
  | 'tool-json'
  | 'tool-rest-curl'
  | 'tool-regex-cron'
  | 'tool-sql'
  | 'tool-jwt-base64'
  | 'tool-stacktrace'
  | 'tool-readme'
  | 'tool-svg-optimizer'
  | 'tool-roi-calculator'
  | 'tool-color-scale'
  | 'tool-uuid-hash'
  | 'tool-timestamp'
  | 'tool-image-gen';

interface NavItem {
  id: WorkspaceNavId;
  label: string;
  shortLabel: string;
  badge?: string;
  seoSlug?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

export const SIDEBAR_CATEGORIES: NavCategory[] = [
  {
    title: 'STUDIO',
    items: [
      {
        id: 'studio-sandbox',
        label: 'Visual Artifact Studio',
        shortLabel: 'Studio',
        badge: 'Hot',
        seoSlug: 'ai-ui-generator',
        icon: Zap
      },
      {
        id: 'studio-vision',
        label: 'Screenshot-to-Code',
        shortLabel: 'Vision AI',
        badge: 'Vision',
        seoSlug: 'screenshot-to-code',
        icon: Camera
      },
      {
        id: 'studio-gallery',
        label: 'UI Component Gallery',
        shortLabel: 'Gallery',
        badge: '12',
        seoSlug: 'free-templates',
        icon: LayoutGrid
      }
    ]
  },
  {
    title: 'AI LABS',
    items: [
      {
        id: 'labs-benchmarker',
        label: 'Multi-Model Benchmarker',
        shortLabel: 'Benchmark',
        seoSlug: 'prompt-benchmarker',
        icon: FlaskConical
      },
      {
        id: 'labs-prompt-optimizer',
        label: 'System Prompt Optimizer',
        shortLabel: 'Prompt AI',
        icon: Sparkles
      },
      {
        id: 'labs-usage-history',
        label: 'Usage History',
        shortLabel: 'History',
        badge: 'Log',
        icon: History
      }
    ]
  },
  {
    title: 'DEV TOOLS (12+ SUITE)',
    items: [
      {
        id: 'tool-json',
        label: 'JSON & TypeScript',
        shortLabel: 'JSON/TS',
        seoSlug: 'json-to-typescript',
        icon: FileJson
      },
      {
        id: 'tool-rest-curl',
        label: 'REST & cURL Client',
        shortLabel: 'cURL/REST',
        seoSlug: 'curl-to-code',
        icon: Globe
      },
      {
        id: 'tool-sql',
        label: 'AI SQL Architect',
        shortLabel: 'SQL AI',
        seoSlug: 'ai-sql-generator',
        icon: Database
      },
      {
        id: 'tool-jwt-base64',
        label: 'JWT & Base64 Inspector',
        shortLabel: 'JWT/B64',
        seoSlug: 'jwt-decoder',
        icon: ShieldCheck
      },
      {
        id: 'tool-regex-cron',
        label: 'Regex & Cron Builder',
        shortLabel: 'Regex/Cron',
        seoSlug: 'regex-generator',
        icon: Regex
      },
      {
        id: 'tool-stacktrace',
        label: 'Stack Trace Auto-Healer',
        shortLabel: 'Auto-Heal',
        seoSlug: 'error-explainer',
        icon: Bug
      },
      {
        id: 'tool-readme',
        label: 'AI README Generator',
        shortLabel: 'README',
        seoSlug: 'readme-generator',
        icon: FileText
      },
      {
        id: 'tool-svg-optimizer',
        label: 'SVG Optimizer & JSX',
        shortLabel: 'SVG/JSX',
        seoSlug: 'svg-optimizer',
        icon: FileCode
      },
      {
        id: 'tool-roi-calculator',
        label: 'AI ROI & Cost Calculator',
        shortLabel: 'ROI Calc',
        seoSlug: 'roi-calculator',
        icon: Calculator
      },
      {
        id: 'tool-color-scale',
        label: 'Tailwind & Color Scale',
        shortLabel: 'Colors',
        icon: Palette
      },
      {
        id: 'tool-uuid-hash',
        label: 'UUID, ULID & Hash Forge',
        shortLabel: 'UUID/Hash',
        icon: Hash
      },
      {
        id: 'tool-timestamp',
        label: 'Unix Epoch & Timezone',
        shortLabel: 'Epoch',
        icon: Clock
      },
      {
        id: 'tool-image-gen',
        label: 'AI Asset Generator',
        shortLabel: 'Assets',
        icon: ImageIcon
      }
    ]
  }
];

interface LeftSidebarProps {
  activeNav: WorkspaceNavId;
  onSelectNav: (id: WorkspaceNavId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandModal?: () => void;
}

export default function LeftSidebar({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  onOpenCommandModal
}: LeftSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCategories = SIDEBAR_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.label.toLowerCase().includes(filterQuery.toLowerCase().trim())
    )
  })).filter((cat) => cat.items.length > 0);

  return (
    <aside
      aria-label="Workspace Navigation Sidebar"
      className={`hidden md:flex shrink-0 border-r border-white/[0.08] bg-[#06070B]/90 backdrop-blur-2xl flex-col transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Quick Filter + Collapse Toggle */}
      <div className="p-2.5 border-b border-white/[0.07] flex items-center justify-between gap-2">
        {!collapsed && (
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter 12+ tools..."
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-indigo-500/60 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
          className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-100 border border-white/[0.08] transition-colors cursor-pointer mx-auto"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Categories */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4 no-scrollbar">
        {filteredCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                <span>{category.title}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`sidebar-nav-${item.id}`}
                    onClick={() => onSelectNav(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-transparent text-white border border-indigo-500/40 shadow-sm shadow-indigo-950/50'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-indigo-400'
                          : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                              item.badge === 'Vision'
                                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                                : item.badge === 'Hot'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-white/[0.06] text-zinc-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bento Command Launcher */}
      {!collapsed && (
        <div className="p-3 border-t border-white/[0.07] bg-white/[0.02]">
          {onOpenCommandModal && (
            <button
              onClick={onOpenCommandModal}
              className="w-full mb-2 flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bento Switcher</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/50 text-zinc-400 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>
          )}
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">DevPulse OS v3.5</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
              Liquid Glass
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
