import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  Rocket,
  Globe,
  ShieldCheck,
  TrendingUp,
  FileCode2,
  ChevronDown,
  Cpu,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import {
  SeoToolDefinition,
  SEO_TOOLS_CATALOG,
  SeoToolSlug,
  getCanonicalToolPath,
  getToolLogicAndFormula,
  buildToolJsonLdSchema
} from '../data/seoToolsCatalog';
import { NOWPAYMENTS_CONFIG } from '../utils/studioEngine';

interface SemanticSeoArticleProps {
  tool: SeoToolDefinition;
  onSelectToolSlug: (slug: SeoToolSlug) => void;
  onOpenSeoHub: () => void;
  onOpenHosting: () => void;
  onTriggerDonationToast?: () => void;
}

export default function SemanticSeoArticle({
  tool,
  onSelectToolSlug,
  onOpenSeoHub,
  onOpenHosting,
  onTriggerDonationToast
}: SemanticSeoArticleProps) {
  const [schemaCopied, setSchemaCopied] = useState(false);
  const logicSection = getToolLogicAndFormula(tool.slug);
  const canonicalPath = getCanonicalToolPath(tool.slug);
  const jsonLdString = JSON.stringify(
    buildToolJsonLdSchema(
      tool,
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://devpulse.ai'
    ),
    null,
    2
  );

  const handleCopySchema = () => {
    try {
      navigator.clipboard.writeText(jsonLdString);
      setSchemaCopied(true);
      setTimeout(() => setSchemaCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <article
      data-testid="semantic-seo-article"
      aria-label={`Documentation and SEO Guide for ${tool.name}`}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-zinc-300 border-t border-white/[0.08]"
    >
      {/* Top Semantic Header & Overview */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] space-y-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {tool.category}
          </span>
          <span
            data-testid="active-tool-canonical-badge"
            className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
          >
            Route: {canonicalPath}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            100% Free • Zero Login Required
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
            ★ {tool.ratingValue}/5 ({tool.ratingCount} developer reviews)
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tool.h1Title}
        </h1>

        <div className="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
          {tool.overviewParagraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Step-by-Step Usage Guide (H2 + 3 Bento Cards) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>How to Use This Free {tool.shortName} (Step-by-Step)</span>
          </h2>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Instant browser execution • No account wall
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.steps.map((step) => (
            <div
              key={step.stepNumber}
              id={`step-${step.stepNumber}`}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STEP {step.stepNumber}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
              </div>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Users Need It & Formula / Logic Explanations */}
      <section
        data-testid="seo-formula-logic-section"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{logicSection.whyNeedTitle}</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {logicSection.whyUsersNeedParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Common Edge Cases Handled Automatically
            </h3>
            <ul className="space-y-2">
              {logicSection.edgeCasesCovered.map((edge, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{edge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#070911] border border-indigo-500/25 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Formula &amp; Core Algorithm
              </span>
              <Code2 className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white">
              {logicSection.formulaAndLogicTitle}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {logicSection.formulaAndLogicExplanation}
            </p>
          </div>

          <pre className="p-3.5 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            <code>{logicSection.formulaCodeSnippet}</code>
          </pre>
        </div>
      </section>

      {/* Key Features + Native Bento Sponsor Card (Zero CLS) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Key Technical Capabilities of {tool.shortName}</span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tool.features.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-xs sm:text-sm text-zinc-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Native Bento Sponsor Card (Non-intrusive, CLS = 0) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0B0D16] to-emerald-950/30 backdrop-blur-xl border border-indigo-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sponsored Developer Partner
              </span>
              <Rocket className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Deploy Your AI Artifacts &amp; Full-Stack Apps to Global Edge
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Launch static Tailwind UI components, Next.js App Router projects, and PostgreSQL databases with automatic SSL, custom domains, and DDoS protection for just $2.99/mo.
            </p>
          </div>
          <button
            onClick={onOpenHosting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Claim $2.99/mo Edge Hosting Deal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Frequently Asked Questions (<details><summary>) */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-fuchsia-400" />
          <span>Frequently Asked Questions &amp; Edge Cases — {tool.shortName}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tool.faqs.map((faq, idx) => (
            <details
              key={idx}
              open={idx < 2}
              className="group p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] open:border-indigo-500/40 transition-all"
            >
              <summary className="flex items-center justify-between gap-2 cursor-pointer list-none font-semibold text-sm sm:text-base text-white">
                <span>{faq.question}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <p className="mt-3 pt-3 border-t border-white/[0.06] text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Structured Data (JSON-LD SoftwareApplication & WebApplication) Inspector */}
      <section
        data-testid="seo-jsonld-inspector"
        className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Active Schema.org JSON-LD Markup (SoftwareApplication &amp; WebApplication)
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopySchema}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] transition-all cursor-pointer"
          >
            {schemaCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied JSON-LD</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Schema Markup</span>
              </>
            )}
          </button>
        </div>
        <details className="group">
          <summary className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer flex items-center gap-1.5">
            <span>
              Inspect live &lt;script type=&quot;application/ld+json&quot;&gt; injected into &lt;head&gt; for {canonicalPath}
            </span>
            <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
          </summary>
          <pre className="mt-3 p-3.5 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono text-zinc-300 max-h-60 overflow-y-auto">
            <code>{jsonLdString}</code>
          </pre>
        </details>
      </section>

      {/* Internal Links Grid: Explore All 12 Free Developer Tools */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>Explore All 12 Free AI &amp; Developer Tools (Dedicated Routes)</span>
          </h2>
          <button
            onClick={onOpenSeoHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open SEO &amp; Bing IndexNow Hub</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SEO_TOOLS_CATALOG.map((item) => {
            const isCurrent = item.slug === tool.slug;
            const itemPath = getCanonicalToolPath(item.slug);
            return (
              <a
                key={item.slug}
                href={itemPath}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectToolSlug(item.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group p-4 rounded-2xl backdrop-blur-xl border transition-all flex flex-col justify-between gap-2 ${
                  isCurrent
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/40'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.18] text-zinc-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.shortName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.bentoDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] font-mono text-indigo-400">
                  <span>{itemPath}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Crawler-Friendly Technical SEO & NOWPayments Crypto Footer */}
      <footer
        data-testid="seo-legal-footer"
        className="pt-6 border-t border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-zinc-500"
      >
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold">DevPulse AI v3.5</span>
          <span>— 2026 Liquid Glass &amp; Bento AI Developer OS</span>
        </div>

        {/* Official NOWPayments SVG Donation Button */}
        <div className="flex items-center justify-center">
          <a
            href={NOWPAYMENTS_CONFIG.directDonationUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="footer-nowpayments-button"
            onClick={() => {
              window.gtag?.('event', 'crypto_donate_click', { method: 'nowpayments_button' });
              onTriggerDonationToast?.();
            }}
            className="inline-block transition-transform hover:scale-105"
          >
            <img
              src={NOWPAYMENTS_CONFIG.officialButtonImageUrl}
              alt="Crypto donation button by NOWPayments"
              className="h-10 mx-auto"
            />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
          <button
            onClick={onOpenSeoHub}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>SEO &amp; IndexNow Hub (.txt / .xml)</span>
          </button>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 underline"
          >
            robots.txt
          </a>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 underline"
          >
            llms.txt
          </a>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 underline"
          >
            sitemap.xml
          </a>
          <a
            href="/ads.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 underline"
          >
            ads.txt
          </a>
          <span className="text-zinc-700">|</span>
          <a href="#privacy-policy" className="hover:text-zinc-300">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-zinc-300">
            Terms
          </a>
          <a href="#dmca" className="hover:text-zinc-300">
            DMCA
          </a>
        </div>
      </footer>
    </article>
  );
}
