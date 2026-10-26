import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Copy,
  Check,
  Download,
  Send,
  Globe,
  FileCode2,
  Bot,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key
} from 'lucide-react';
import {
  SEO_TOOLS_CATALOG,
  buildRobotsTxt,
  buildLlmsTxt,
  buildSitemapXml,
  buildAdsTxt
} from '../data/seoToolsCatalog';

interface SeoIndexNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SeoHubTab = 'robots' | 'llms' | 'sitemap' | 'ads' | 'indexnow';

export default function SeoIndexNowModal({ isOpen, onClose }: SeoIndexNowModalProps) {
  const [activeTab, setActiveTab] = useState<SeoHubTab>('robots');
  const [domainInput, setDomainInput] = useState(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'https://yourdomain.com';
  });
  const [adsensePubId, setAdsensePubId] = useState('pub-0000000000000000');
  const [indexNowKey, setIndexNowKey] = useState('8f9d2a4b7c1e6f3a9d0b5e8c2a1f4d7b');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // IndexNow submission state
  const [isPingingIndexNow, setIsPingingIndexNow] = useState(false);
  const [indexNowResult, setIndexNowResult] = useState<{
    ok: boolean;
    status: number;
    message: string;
    submittedUrls: string[];
  } | null>(null);

  const robotsContent = useMemo(() => buildRobotsTxt(domainInput), [domainInput]);
  const llmsContent = useMemo(() => buildLlmsTxt(domainInput), [domainInput]);
  const sitemapContent = useMemo(() => buildSitemapXml(domainInput), [domainInput]);
  const adsContent = useMemo(() => buildAdsTxt(adsensePubId), [adsensePubId]);

  if (!isOpen) return null;

  const getActiveFileContent = () => {
    if (activeTab === 'robots') return { filename: 'robots.txt', content: robotsContent, mime: 'text/plain' };
    if (activeTab === 'llms') return { filename: 'llms.txt', content: llmsContent, mime: 'text/plain' };
    if (activeTab === 'sitemap') return { filename: 'sitemap.xml', content: sitemapContent, mime: 'application/xml' };
    return { filename: 'ads.txt', content: adsContent, mime: 'text/plain' };
  };

  const handleCopy = () => {
    const { filename, content } = getActiveFileContent();
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = () => {
    const { filename, content, mime } = getActiveFileContent();
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateRandomKey = () => {
    const chars = '0123456789abcdef';
    let next = '';
    for (let i = 0; i < 32; i++) {
      next += chars[Math.floor(Math.random() * chars.length)];
    }
    setIndexNowKey(next);
  };

  const handleSubmitIndexNow = async () => {
    if (isPingingIndexNow) return;
    setIsPingingIndexNow(true);
    setIndexNowResult(null);

    const cleanDomain = domainInput.replace(/\/+$/, '') || 'https://yourdomain.com';
    let host = 'yourdomain.com';
    try {
      host = new URL(cleanDomain).host;
    } catch {
      host = cleanDomain.replace(/^https?:\/\//, '');
    }

    const urlList = [
      `${cleanDomain}/`,
      ...SEO_TOOLS_CATALOG.map((t) => `${cleanDomain}/?tool=${t.slug}`)
    ];

    try {
      const response = await fetch('/api/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          key: indexNowKey.trim(),
          keyLocation: `${cleanDomain}/${indexNowKey.trim()}.txt`,
          urlList
        })
      });
      const data = await response.json();
      setIndexNowResult({
        ok: Boolean(data.ok),
        status: data.status || response.status,
        message: data.message || 'Submitted 13 URLs to Bing IndexNow API.',
        submittedUrls: urlList
      });
    } catch (err: any) {
      setIndexNowResult({
        ok: false,
        status: 500,
        message: err?.message || 'Network error while pinging IndexNow.',
        submittedUrls: urlList
      });
    } finally {
      setIsPingingIndexNow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-2xl bg-[#090B12] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📈 Technical SEO & Bing IndexNow Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  12 Programmatic Routes Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Download production `robots.txt`, `llms.txt`, `sitemap.xml`, `ads.txt` & ping Bing IndexNow in 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Domain Configuration Bar */}
        <div className="px-5 py-3 border-b border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-300 shrink-0">Production Domain:</span>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="https://yourdomain.com"
              className="flex-1 bg-black/50 border border-white/[0.1] focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
            {(
              [
                { id: 'robots', label: 'robots.txt', icon: Bot },
                { id: 'llms', label: 'llms.txt', icon: Sparkles },
                { id: 'sitemap', label: 'sitemap.xml', icon: FileCode2 },
                { id: 'ads', label: 'ads.txt', icon: DollarSign },
                { id: 'indexnow', label: '⚡ Bing IndexNow', icon: Send }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab !== 'indexnow' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    /{getActiveFileContent().filename}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {activeTab === 'robots' &&
                      'Explicitly allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot & ClaudeBot.'}
                    {activeTab === 'llms' &&
                      'Structured Markdown directory of all 12 tools for AI Answer Engine citations (ChatGPT, Perplexity, Claude).'}
                    {activeTab === 'sitemap' &&
                      'Auto-lists all 12+ programmatic ?tool=slug URLs with priority and changefreq metadata.'}
                    {activeTab === 'ads' &&
                      'Authorized Digital Sellers file ready for Google AdSense, Ezoic, and Carbon Ads verification.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'ads' && (
                    <input
                      type="text"
                      value={adsensePubId}
                      onChange={(e) => setAdsensePubId(e.target.value)}
                      placeholder="pub-0000000000000000"
                      className="bg-black/50 border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs font-mono text-zinc-200 w-48"
                    />
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] cursor-pointer"
                  >
                    {copiedFile === getActiveFileContent().filename ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {getActiveFileContent().filename}</span>
                  </button>
                </div>
              </div>

              <pre className="w-full h-80 p-4 rounded-2xl bg-black/70 border border-white/[0.08] font-mono text-xs text-emerald-300 overflow-auto leading-relaxed">
                {getActiveFileContent().content}
              </pre>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span>Bing & Yandex IndexNow 1-Click Instant URL Submitter</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  IndexNow notifies Bing, Yandex, Seznam, and Naver (which also power ChatGPT Search and Copilot citations) immediately whenever your 12 programmatic tool pages are published or updated—bypassing weeks of crawler wait time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    IndexNow 32-Char Hex API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={indexNowKey}
                      onChange={(e) => setIndexNowKey(e.target.value)}
                      className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleGenerateRandomKey}
                      className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-zinc-200 border border-white/[0.1] flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>New Key</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Key Verification File Location
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-400 truncate">
                    {domainInput.replace(/\/+$/, '')}/{indexNowKey}.txt
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400">
                  Ready to submit <strong className="text-white">13 URLs</strong> (Root + 12 `?tool=slug` pages) to{' '}
                  <code className="text-indigo-300">https://api.indexnow.org/indexnow</code>
                </span>
                <button
                  onClick={handleSubmitIndexNow}
                  disabled={isPingingIndexNow || !indexNowKey.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPingingIndexNow ? 'Pinging api.indexnow.org...' : '🚀 Ping Bing IndexNow Now'}</span>
                </button>
              </div>

              {indexNowResult && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    indexNowResult.ok
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {indexNowResult.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{indexNowResult.message}</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40">
                      HTTP {indexNowResult.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 max-h-28 overflow-y-auto space-y-0.5 pt-1">
                    {indexNowResult.submittedUrls.map((u) => (
                      <div key={u}>✓ {u}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
