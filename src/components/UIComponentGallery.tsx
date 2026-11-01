import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Search,
  Zap,
  Code2,
  Eye,
} from 'lucide-react';
import {
  UI_COMPONENT_GALLERY,
  type GalleryComponentTemplate,
} from '../data/componentGalleryData.ts';
import { type ArtifactCodeState } from '../utils/urlHash.ts';

interface UIComponentGalleryProps {
  onOpenTemplateInSandbox?: (code: ArtifactCodeState, title: string) => void;
  onOpenInSandbox?: (html: string, promptLabel: string) => void;
}

const CATEGORIES = [
  'All',
  'Marketing & Bento',
  'SaaS & Dashboards',
  'AI & Chat',
  'Auth & FinTech',
] as const;

export const UIComponentGallery: React.FC<UIComponentGalleryProps> = ({
  onOpenTemplateInSandbox,
  onOpenInSandbox,
}) => {
  const handleOpenTemplate = (code: ArtifactCodeState, title: string) => {
    if (onOpenTemplateInSandbox) onOpenTemplateInSandbox(code, title);
    if (onOpenInSandbox) onOpenInSandbox(code.html, title);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return UI_COMPONENT_GALLERY.filter((tpl) => {
      const matchesCat =
        selectedCategory === 'All' || tpl.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        tpl.title.toLowerCase().includes(q) ||
        tpl.summary.toLowerCase().includes(q) ||
        tpl.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const activePreviewTemplate: GalleryComponentTemplate | undefined = useMemo(
    () => UI_COMPONENT_GALLERY.find((t) => t.id === previewId),
    [previewId]
  );

  return (
    <div className="flex-1 p-4 lg:p-6 theme-bg-base bg-[#090A0F] space-y-6 overflow-y-auto">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b theme-border border-[#1F2430] pb-4">
        <div>
          <div className="text-xs font-mono text-[#818CF8]">
            STUDIO · 12 PRODUCTION TAILWIND TEMPLATES
          </div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text-main text-white mt-0.5 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#4edea3]" />
            <span>UI Component Gallery</span>
          </h1>
          <p className="text-xs text-[#908fa0] mt-0.5">
            Hover over any component card to inspect a live preview window above it, or click &ldquo;Open in Sandbox&rdquo; to load its complete HTML, Tailwind CSS, and JS into the Live Preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#908fa0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search UI Templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 12 templates..."
              className="theme-bg-lowest bg-[#0d0e13] border theme-border border-[#2A3042] focus:border-[#6366F1] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono theme-text-main text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#6366F1] text-white font-semibold'
                    : 'text-[#c7c4d7] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Live Preview Modal/Drawer if a user clicks "Live Peek" */}
      {activePreviewTemplate && (
        <div className="p-4 rounded-xl theme-bg-lowest bg-[#0d0e13] border-2 border-[#6366F1] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-[#4edea3]">LIVE INTERACTIVE PREVIEW</span>
              <h2 className="text-base font-bold text-white">{activePreviewTemplate.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleOpenTemplate(activePreviewTemplate.code, activePreviewTemplate.title)
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Open in Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a1b21] text-xs font-mono text-[#c7c4d7] hover:text-white cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
          <div className="h-[340px] rounded-lg overflow-hidden border border-[#2A3042] bg-[#090A0F]">
            <iframe
              title={`Preview ${activePreviewTemplate.title}`}
              srcDoc={activePreviewTemplate.code.html}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* 12-Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-36">
        {filteredTemplates.map((tpl, idx) => {
          const isHovered = hoveredTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              data-testid={`gallery-card-${tpl.id}`}
              onMouseEnter={() => setHoveredTemplateId(tpl.id)}
              onMouseLeave={() =>
                setHoveredTemplateId((prev) => (prev === tpl.id ? null : prev))
              }
              className="relative p-5 rounded-xl theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] hover:border-[#6366F1] flex flex-col justify-between gap-4 transition-all"
            >
              {/* Small, non-interactive live preview window rendered above the hovered component card */}
              {isHovered && (
                <div
                  data-testid="gallery-hover-preview-window"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 right-2 bottom-[calc(100%-1.25rem)] z-40 rounded-xl bg-[#090A0F]/95 border-2 border-[#6366F1] shadow-2xl shadow-indigo-950/80 overflow-hidden backdrop-blur-xl transition-all duration-150"
                >
                  <div className="px-3 py-1.5 bg-[#12141D] border-b border-[#2A3042] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse shrink-0" />
                      <span className="text-[10px] font-mono font-bold text-white truncate">
                        LIVE HOVER PREVIEW · {tpl.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#818CF8] shrink-0 ml-2">
                      Non-Interactive
                    </span>
                  </div>
                  <div className="relative h-36 w-full overflow-hidden bg-[#090A0F]">
                    <iframe
                      title={`Hover Live Preview ${tpl.title}`}
                      srcDoc={tpl.code.html}
                      sandbox="allow-scripts"
                      tabIndex={-1}
                      className="pointer-events-none border-0 origin-top-left"
                      style={{
                        width: '200%',
                        height: '200%',
                        transform: 'scale(0.5)'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#908fa0]">
                  <span>
                    {String(idx + 1).padStart(2, '0')} · {tpl.category}
                  </span>
                  <span className="text-[#4edea3]">{tpl.tags.join(' · ')}</span>
                </div>

                <h2 className="text-base font-bold theme-text-main text-white">{tpl.title}</h2>
                <p className="text-xs text-[#908fa0] leading-relaxed">{tpl.summary}</p>
              </div>

              {/* Code Preview Snippet Strip */}
              <div className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1F2430] font-mono text-[10px] text-[#908fa0] truncate">
                <Code2 className="w-3 h-3 inline mr-1.5 text-[#818CF8]" />
                {tpl.code.seoTitle || tpl.title} · {(tpl.code.html.length / 1024).toFixed(1)} KB HTML5
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewId((prev) => (prev === tpl.id ? null : tpl.id))}
                  className="px-3 py-1.5 rounded-lg theme-bg-low bg-[#1a1b21] hover:bg-[#292a2f] border theme-border border-[#2A3042] text-xs font-mono text-[#c7c4d7] hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>{previewId === tpl.id ? 'Hide Peek' : 'Live Peek'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenTemplate(tpl.code, tpl.title)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Open in Sandbox</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UIComponentGallery;
