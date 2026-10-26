import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  encodeArtifactToHash,
  decodeArtifactFromHash,
  buildSeoHeadTags,
  buildSandboxSrcDoc,
  DEFAULT_STARTER_ARTIFACT
} from './urlHash';
import {
  sanitizeBrokenJson,
  jsonToTypeScriptInterfaces
} from './jsonTools';
import {
  formatArtifactCode,
  computeArtifactPerformanceMetrics,
  convertArtifactToFramework,
  applyElementInspectionEdit,
  persistArtifactAutoSave,
  loadArtifactAutoSave,
  AUTOSAVE_INTERVAL_MS,
  buildSocialShareDraft,
  generateArtifactPdfDocument,
  resetArtifactToStarterTemplate,
  SANDBOX_SHORTCUTS_BAR_ITEMS,
  filterConsoleLogs,
  cleanupAndFormatArtifactState,
  loadSavedStarterTemplates,
  saveCustomStarterTemplate,
  deleteSavedStarterTemplate,
  BUY_ME_A_COFFEE_URL,
  NOWPAYMENTS_CONFIG,
  DEFAULT_MONTHLY_DONATION_COUNT,
  DEFAULT_MONTHLY_TARGET_COUNT,
  computeMonthlyGoalProgress,
  loadCryptoDonationState,
  recordCryptoDonationAction,
  buildDedicatedToolUrl,
  computeCodeHealthMetrics,
  buildShareableArtifactUrl,
  generateUrlQrCodeSvg,
  generateProjectZipArchive
} from './studioEngine';
import {
  parseCurlAndConvert,
  decodeJwtToken,
  describeCronExpression,
  evaluateRegexPattern,
  generateSqlFromNaturalLanguage,
  generateReadmeMarkdown,
  generateTailwindColorScale
} from './devToolsEngine';
import {
  SEO_TOOLS_CATALOG,
  getSeoToolBySlug,
  getCanonicalToolPath,
  resolveToolRouteFromLocation,
  getToolLogicAndFormula,
  buildToolJsonLdSchema,
  updateRecentToolSlugs,
  filterSeoToolsCatalog,
  optimizeSvgAndConvertToJsx,
  buildRobotsTxt,
  buildLlmsTxt,
  buildSitemapXml,
  buildAdsTxt
} from '../data/seoToolsCatalog';

describe('DevPulse AI v3.5 Core Logic & SEO Suite Unit Tests', () => {
  it('encodes and decodes UTF-8 artifact state via URL hash accurately', () => {
    const sample = {
      html: '<div class="p-4">Hello 🚀 DevPulse</div>',
      css: 'body { background: #000; }',
      js: 'console.log("loaded");',
      prompt: 'Test prompt',
      seoTitle: 'Custom App Title',
      seoDescription: 'Custom Meta Description'
    };
    const hash = encodeArtifactToHash(sample);
    assert.ok(hash.startsWith('#code='));
    const decoded = decodeArtifactFromHash(hash);
    assert.ok(decoded);
    assert.equal(decoded.html, sample.html);
    assert.equal(decoded.seoTitle, 'Custom App Title');
    assert.equal(decoded.seoDescription, 'Custom Meta Description');
  });

  it('injects custom SEO title and meta description into artifact <head>', () => {
    const seoTags = buildSeoHeadTags({
      html: '<html><head><title>Old</title></head><body>Hi</body></html>',
      css: '',
      js: '',
      seoTitle: 'PulseAnalytics Pro',
      seoDescription: 'Enterprise telemetry & MRR dashboard.'
    });
    assert.ok(seoTags.includes('<title>PulseAnalytics Pro</title>'));
    assert.ok(seoTags.includes('content="Enterprise telemetry &amp; MRR dashboard."'));

    const fullDoc = buildSandboxSrcDoc({
      html: '<!DOCTYPE html><html><head><title>Old</title></head><body><h1>App</h1></body></html>',
      css: '',
      js: '',
      seoTitle: 'PulseAnalytics Pro',
      seoDescription: 'Enterprise telemetry & MRR dashboard.'
    });
    assert.ok(fullDoc.includes('<title>PulseAnalytics Pro</title>'));
    assert.ok(!fullDoc.includes('<title>Old</title>'));
  });

  it('formats HTML, CSS, and JS artifact code cleanly via formatArtifactCode', () => {
    const messyHtml = '<div><span>Hello</span><p>World</p></div>';
    const formatted = formatArtifactCode(messyHtml, 'html');
    assert.ok(formatted.includes('\n'));
    assert.ok(formatted.includes('  <span>Hello</span>'));
  });

  it('computes artifact performance telemetry metrics accurately', () => {
    const metrics = computeArtifactPerformanceMetrics({
      html: '<div><script>const x = 10;</script><p>Test</p></div>',
      css: '',
      js: 'console.log("extra");',
      dependencies: [
        { id: '1', name: 'Chart.js', url: 'https://cdn.jsdelivr.net/chart.js', type: 'script', description: '' }
      ]
    });
    assert.ok(metrics.scriptTagCount >= 3); // inline + js tab + CDN script (+ Tailwind CDN wrapper)
    assert.ok(metrics.totalScriptSizeBytes > 0);
    assert.ok(metrics.loadTimeMs > 0);
  });

  it('exports HTML artifact to React TSX, Next.js App Router, and Vue 3 SFC', () => {
    const state = {
      html: '<div class="bg-zinc-900 text-white"><label for="email">Email</label></div>',
      css: '',
      js: ''
    };
    const reactOut = convertArtifactToFramework(state, 'react-tsx');
    assert.ok(reactOut.code.includes('className="bg-zinc-900 text-white"'));
    assert.ok(reactOut.code.includes('htmlFor="email"'));

    const nextOut = convertArtifactToFramework(state, 'nextjs-app');
    assert.ok(nextOut.code.startsWith("'use client';"));

    const vueOut = convertArtifactToFramework(state, 'vue3');
    assert.ok(vueOut.code.includes('<template>'));
    assert.ok(vueOut.code.includes('<script setup lang="ts">'));
  });

  it('applies direct element inspection edits to HTML source', () => {
    const original = '<button class="bg-indigo-600 text-white">Launch App</button>';
    const updated = applyElementInspectionEdit(
      original,
      'Launch App',
      'Deploy Now',
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white font-bold'
    );
    assert.ok(updated.includes('Deploy Now'));
    assert.ok(updated.includes('bg-emerald-600 text-white font-bold'));
  });

  it('verifies all 12 Programmatic SEO Tools (?tool=slug) exist with rich metadata', () => {
    const expectedSlugs = [
      'ai-ui-generator',
      'screenshot-to-code',
      'prompt-benchmarker',
      'json-to-typescript',
      'curl-to-code',
      'ai-sql-generator',
      'jwt-decoder',
      'regex-generator',
      'error-explainer',
      'readme-generator',
      'cron-expression',
      'svg-optimizer'
    ];
    assert.equal(SEO_TOOLS_CATALOG.length, 12);
    for (const slug of expectedSlugs) {
      const tool = getSeoToolBySlug(slug);
      assert.equal(tool.slug, slug);
      assert.ok(tool.metaTitle.includes('DevPulse AI'));
      assert.ok(tool.tierBadge === 'New' || tool.tierBadge === 'Pro');
      assert.ok(tool.steps.length === 3);
      assert.ok(tool.faqs.length === 4);
    }
  });

  it('minifies SVG and converts kebab-case attributes to React TSX camelCase', () => {
    const rawSvg = `<?xml version="1.0"?>
      <!-- comment -->
      <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" fill-rule="evenodd" class="icon">
        <path d="M12 2L2 22h20L12 2z" />
      </svg>`;
    const res = optimizeSvgAndConvertToJsx(rawSvg, 'TriangleIcon');
    assert.ok(!res.minifiedSvg.includes('<!-- comment -->'));
    assert.ok(res.minifiedBytes < res.originalBytes);
    assert.ok(res.reactTsx.includes('export function TriangleIcon'));
    assert.ok(res.reactTsx.includes('strokeWidth="2"'));
    assert.ok(res.reactTsx.includes('strokeLinecap="round"'));
    assert.ok(res.reactTsx.includes('fillRule="evenodd"'));
    assert.ok(res.reactTsx.includes('className="icon"'));
  });

  it('generates valid robots.txt, llms.txt, sitemap.xml, and ads.txt content', () => {
    const robots = buildRobotsTxt('https://yourdomain.com');
    assert.ok(robots.includes('User-agent: Googlebot'));
    assert.ok(robots.includes('User-agent: Bingbot'));
    assert.ok(robots.includes('User-agent: OAI-SearchBot'));
    assert.ok(robots.includes('User-agent: PerplexityBot'));
    assert.ok(robots.includes('Sitemap: https://yourdomain.com/sitemap.xml'));

    const llms = buildLlmsTxt('https://yourdomain.com');
    assert.ok(llms.includes('# DevPulse AI — Free No-Login AI Developer Workspace & Artifact Studio'));
    assert.ok(llms.includes('?tool=ai-ui-generator'));

    const sitemap = buildSitemapXml('https://yourdomain.com');
    assert.ok(sitemap.includes('<loc>https://yourdomain.com/?tool=svg-optimizer</loc>'));

    const ads = buildAdsTxt('pub-1234567890');
    assert.ok(ads.includes('google.com, pub-1234567890, DIRECT'));
  });

  it('parses cURL commands and decodes JWT tokens accurately', () => {
    const parsedCurl = parseCurlAndConvert(
      `curl -X POST "https://api.example.com/v1/items" -H "Authorization: Bearer secret123" -d '{"name":"widget"}'`
    );
    assert.equal(parsedCurl.method, 'POST');
    assert.equal(parsedCurl.url, 'https://api.example.com/v1/items');
    assert.equal(parsedCurl.headers['Authorization'], 'Bearer secret123');
    assert.ok(parsedCurl.fetchCode.includes('fetch("https://api.example.com/v1/items"'));

    const sampleJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMSIsImV4cCI6MTg5MzQ1NjAwMH0.sig';
    const jwtRes = decodeJwtToken(sampleJwt);
    assert.equal(jwtRes.isValid, true);
    assert.equal(jwtRes.payload?.sub, 'usr_1');
    assert.equal(jwtRes.isExpired, false);
  });

  it('evaluates Cron expressions, Regex patterns, SQL generation, and JSON sanitization', () => {
    const cron = describeCronExpression('*/15 * * * *');
    assert.equal(cron.isValid, true);
    assert.ok(cron.summary.includes('15 minutes'));

    const regex = evaluateRegexPattern('(\\d+)', 'g', 'Order 42 and 99');
    assert.equal(regex.isValid, true);
    assert.equal(regex.matchCount, 2);

    const sql = generateSqlFromNaturalLanguage('Calculate MRR revenue', 'postgresql');
    assert.ok(sql.sql.includes('SELECT'));
    assert.ok(sql.schemaBreakdown.length > 0);

    const jsonFixed = sanitizeBrokenJson("{ name: 'Ada', skills: ['math',], }");
    assert.equal(jsonFixed.error, undefined);
    const tsInterfaces = jsonToTypeScriptInterfaces(jsonFixed.fixed, 'Developer');
    assert.ok(tsInterfaces.interfaces.includes('export interface Developer'));
  });

  it('tracks the last 3 tools navigated to for BentoCommandModal Recent section', () => {
    let recents = updateRecentToolSlugs([], 'ai-ui-generator', 3);
    assert.deepEqual(recents, ['ai-ui-generator']);

    recents = updateRecentToolSlugs(recents, 'json-to-typescript', 3);
    recents = updateRecentToolSlugs(recents, 'jwt-decoder', 3);
    assert.deepEqual(recents, ['jwt-decoder', 'json-to-typescript', 'ai-ui-generator']);

    // Navigating to a 4th tool keeps only the 3 most recent
    recents = updateRecentToolSlugs(recents, 'svg-optimizer', 3);
    assert.deepEqual(recents, ['svg-optimizer', 'jwt-decoder', 'json-to-typescript']);

    // Re-visiting an existing tool moves it to index 0 without duplicates
    recents = updateRecentToolSlugs(recents, 'json-to-typescript', 3);
    assert.deepEqual(recents, ['json-to-typescript', 'svg-optimizer', 'jwt-decoder']);
  });

  it('switches artifact sandbox preview rendering between Dark and Light mode without mutating source', () => {
    const state = {
      html: '<!DOCTYPE html><html class="dark"><head></head><body class="bg-[#090A0F] text-white"><h1>Dashboard</h1></body></html>',
      css: '',
      js: ''
    };
    const darkDoc = buildSandboxSrcDoc(state, true, 'dark');
    assert.ok(darkDoc.includes('data-preview-theme="dark"'));
    assert.ok(darkDoc.includes('color-scheme: dark'));

    const lightDoc = buildSandboxSrcDoc(state, true, 'light');
    assert.ok(lightDoc.includes('data-preview-theme="light"'));
    assert.ok(lightDoc.includes('color-scheme: light !important'));
    assert.ok(lightDoc.includes('class="light"'));
  });

  it('provides a 2-second quickTip snippet on all 12 tools and filters tools in real time by name or description', () => {
    for (const tool of SEO_TOOLS_CATALOG) {
      assert.ok(tool.quickTip && tool.quickTip.length >= 20, `Missing quickTip on ${tool.slug}`);
    }

    // Empty query returns all 12 tools
    assert.equal(filterSeoToolsCatalog('', 'All').length, 12);

    // Search by tool name ("JWT")
    const jwtMatches = filterSeoToolsCatalog('JWT', 'All');
    assert.equal(jwtMatches.length, 1);
    assert.equal(jwtMatches[0].slug, 'jwt-decoder');

    // Search by description keyword ("unquoted keys" in json-to-typescript bentoDescription)
    const descMatches = filterSeoToolsCatalog('unquoted keys', 'All');
    assert.equal(descMatches.length, 1);
    assert.equal(descMatches[0].slug, 'json-to-typescript');

    // Search combined with category filter
    const apiTools = filterSeoToolsCatalog('', 'API & Backend');
    assert.ok(apiTools.length >= 3);
    assert.ok(apiTools.every((t) => t.category === 'API & Backend'));
  });

  it('persists and loads code editor state via 5-second localStorage auto-save', () => {
    assert.equal(AUTOSAVE_INTERVAL_MS, 5000);
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, val);
      }
    };

    const sampleState = {
      html: '<main><h1>Auto-Saved SaaS Dashboard</h1></main>',
      css: 'body { color: #fff; }',
      js: 'console.log("autosaved");',
      prompt: 'SaaS Dashboard',
      seoTitle: 'Pulse SaaS'
    };

    const meta = persistArtifactAutoSave(sampleState, mockStorage, 1730000005000);
    assert.equal(meta.savedAt, 1730000005000);
    assert.equal(meta.intervalMs, 5000);
    assert.ok(meta.byteSize > 50);

    const loaded = loadArtifactAutoSave(mockStorage);
    assert.ok(loaded.codeState);
    assert.equal(loaded.codeState.html, sampleState.html);
    assert.equal(loaded.codeState.seoTitle, 'Pulse SaaS');
    assert.equal(loaded.meta?.savedAt, 1730000005000);
  });

  it('generates a pre-filled Social Share post draft with tool SEO page link and work preview', () => {
    const draft = buildSocialShareDraft({
      toolSlug: 'ai-ui-generator',
      toolName: 'AI UI & Artifact Studio',
      toolDescription: 'Generate and preview Tailwind & React UI components.',
      origin: 'https://devpulse.ai',
      codeState: {
        html: '<section><h1>Enterprise Revenue Analytics</h1><p>MRR +42%</p></section>',
        css: '',
        js: '',
        prompt: 'Build an enterprise revenue dashboard',
        seoTitle: 'Enterprise Revenue Analytics'
      }
    });

    assert.equal(draft.seoToolUrl, 'https://devpulse.ai/?tool=ai-ui-generator');
    assert.ok(draft.previewSummary.includes('Enterprise Revenue Analytics'));
    assert.ok(draft.postText.includes('https://devpulse.ai/?tool=ai-ui-generator'));
    assert.ok(draft.postText.includes('Enterprise Revenue Analytics'));
    assert.ok(draft.xShareUrl.startsWith('https://twitter.com/intent/tweet?text='));
  });

  it('exports rendered artifact to a valid PDF 1.4 binary document for documentation', () => {
    const pdfOut = generateArtifactPdfDocument(
      {
        html: '<div><h1>Fintech Payment Gateway</h1><p>Instant settlement across 40 currencies.</p></div>',
        css: '',
        js: '',
        prompt: 'Fintech Payment Gateway UI',
        seoTitle: 'Fintech Gateway Spec'
      },
      'AI UI & Artifact Studio'
    );

    assert.ok(pdfOut.filename.endsWith('.pdf'));
    assert.ok(pdfOut.filename.includes('fintech-gateway-spec'));
    assert.ok(pdfOut.pageCount >= 1);
    assert.ok(pdfOut.pdfBytes instanceof Uint8Array);
    assert.ok(pdfOut.pdfBytes.byteLength > 400);

    const pdfText = new TextDecoder().decode(pdfOut.pdfBytes);
    assert.ok(pdfText.startsWith('%PDF-1.4\n'));
    assert.ok(pdfText.includes('DEVPULSE AI - ARTIFACT DOCUMENTATION & SPECIFICATION REPORT'));
    assert.ok(pdfText.includes('Fintech Gateway Spec'));
    assert.ok(pdfText.includes('Instant settlement across 40 currencies.'));
    assert.ok(pdfText.includes('xref'));
    assert.ok(pdfText.trim().endsWith('%%EOF'));
  });

  it('reverts code state to DEFAULT_STARTER_ARTIFACT via resetArtifactToStarterTemplate and exposes common shortcuts', () => {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, val);
      }
    };

    // First save custom modified state
    persistArtifactAutoSave(
      {
        html: '<div>Custom Modified App</div>',
        css: 'body { background: red; }',
        js: 'alert(1);',
        prompt: 'Modified prompt'
      },
      mockStorage,
      1730000010000
    );

    // Now reset to starter template
    const resetState = resetArtifactToStarterTemplate(mockStorage, 1730000020000);
    assert.equal(resetState.html, DEFAULT_STARTER_ARTIFACT.html);
    assert.equal(resetState.prompt, DEFAULT_STARTER_ARTIFACT.prompt);

    const loadedAfterReset = loadArtifactAutoSave(mockStorage);
    assert.ok(loadedAfterReset.codeState);
    assert.equal(loadedAfterReset.codeState.html, DEFAULT_STARTER_ARTIFACT.html);
    assert.equal(loadedAfterReset.meta?.savedAt, 1730000020000);

    // Verify persistent Keyboard Shortcuts footer items include Run (Cmd+Enter) and Save (Cmd+S)
    assert.ok(SANDBOX_SHORTCUTS_BAR_ITEMS.some((i) => i.id === 'run' && i.keys.includes('Enter')));
    assert.ok(SANDBOX_SHORTCUTS_BAR_ITEMS.some((i) => i.id === 'save' && i.keys.includes('S')));
  });

  it('filters integrated console logs by level and search query via filterConsoleLogs', () => {
    const sampleLogs = [
      { id: '1', level: 'log' as const, message: 'App initialized with 3 KPI cards', timestamp: 1000 },
      { id: '2', level: 'warn' as const, message: 'Deprecated Tailwind class warning', timestamp: 2000 },
      {
        id: '3',
        level: 'error' as const,
        message: "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')",
        timestamp: 3000
      }
    ];

    assert.equal(filterConsoleLogs(sampleLogs, 'all', '').length, 3);
    assert.equal(filterConsoleLogs(sampleLogs, 'error', '').length, 1);
    assert.equal(filterConsoleLogs(sampleLogs, 'all', 'TypeError').length, 1);
    assert.equal(filterConsoleLogs(sampleLogs, 'all', 'tailwind').length, 1);
    assert.equal(filterConsoleLogs(sampleLogs, 'error', 'tailwind').length, 0);
  });

  it('runs cleanupAndFormatArtifactState to remove unused CSS variables and fix indentation', () => {
    const messyState = {
      html: '<div><section><h1>Clean Header</h1></section></div>',
      css: ':root {\n  --used-accent: #6366f1;\n  --unused-orphan-var: #ff0055;\n  --another-unused: 16px;\n}\n.card {\ncolor: var(--used-accent);\n}',
      js: 'function init(){\nconsole.log("ready");\n}',
      prompt: 'Cleanup test'
    };

    const result = cleanupAndFormatArtifactState(messyState);
    assert.deepEqual(result.removedCssVariables.sort(), ['--another-unused', '--unused-orphan-var']);
    assert.ok(result.cleanedState.css.includes('--used-accent'));
    assert.ok(!result.cleanedState.css.includes('--unused-orphan-var'));
    assert.ok(result.cleanedState.html.includes('  <section>'));
    assert.ok(result.cleanedState.js.includes('  console.log("ready");'));
  });

  it('saves, loads, and deletes custom starter templates in localStorage', () => {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, val);
      }
    };

    const initialTemplates = loadSavedStarterTemplates(mockStorage);
    assert.ok(initialTemplates.length >= 3);

    const saved = saveCustomStarterTemplate(
      {
        name: 'Fintech Checkout Starter',
        description: 'Reusable Stripe-inspired checkout boilerplate',
        category: 'SaaS UI',
        codeState: {
          html: '<main><h1>Fintech Checkout</h1></main>',
          css: '',
          js: '',
          prompt: 'Fintech Checkout'
        }
      },
      mockStorage,
      1735699999000
    );

    assert.equal(saved.savedTemplate.name, 'Fintech Checkout Starter');
    assert.equal(saved.templates.length, initialTemplates.length + 1);

    const afterDelete = deleteSavedStarterTemplate(saved.savedTemplate.id, mockStorage);
    assert.equal(afterDelete.length, initialTemplates.length);
  });

  it('configures Buy Me a Coffee button redirect URL to https://www.chai4.me/blueauric', () => {
    assert.equal(BUY_ME_A_COFFEE_URL, 'https://www.chai4.me/blueauric');
  });

  it('computes Code Health metrics (line count, file size, and performance impact) accurately', () => {
    const compactMetrics = computeCodeHealthMetrics({
      html: '<div>\n  <h1>Hello</h1>\n</div>',
      css: 'body { margin: 0; }',
      js: 'console.log("ok");',
      prompt: 'Compact test'
    });

    assert.equal(compactMetrics.lineCount, 5);
    assert.ok(compactMetrics.fileSizeBytes > 30);
    assert.ok(compactMetrics.fileSizeFormatted.endsWith(' B'));
    assert.equal(compactMetrics.performanceImpact, 'Low Impact');

    const heavyHtml = Array.from({ length: 650 }, (_, i) => `<div class="row-${i}">Item ${i}</div>`).join('\n');
    const heavyMetrics = computeCodeHealthMetrics({
      html: heavyHtml,
      css: '',
      js: '',
      prompt: 'Heavy test'
    });
    assert.equal(heavyMetrics.performanceImpact, 'High Impact');
    assert.ok(heavyMetrics.lineCount >= 650);
  });

  it('generates a scannable QR code SVG representing the current artifact shareable URL', () => {
    const shareUrl = buildShareableArtifactUrl(
      {
        html: '<section><h1>QR Mobile Preview</h1></section>',
        css: '',
        js: '',
        prompt: 'QR Test'
      },
      'ai-ui-generator',
      'https://devpulse.ai'
    );

    assert.ok(shareUrl.startsWith('https://devpulse.ai/?tool=ai-ui-generator#code='));

    const qr = generateUrlQrCodeSvg(shareUrl, 160);
    assert.equal(qr.matrixSize, 25);
    assert.equal(qr.sizePx, 160);
    assert.ok(qr.svgMarkup.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(qr.svgMarkup.includes('shape-rendering="crispEdges"'));
    // Verify top-left finder pattern corner (0,0) and center (3,3) are dark modules
    assert.equal(qr.matrix[0][0], true);
    assert.equal(qr.matrix[3][3], true);
  });

  it('packages HTML, CSS, JS, and README.md into a valid PKZIP (.zip) project archive', () => {
    const zipResult = generateProjectZipArchive({
      html: '<main><h1>Exported Project</h1></main>',
      css: 'body { background: #06070B; }',
      js: 'console.log("Exported ZIP");',
      prompt: 'Exported SaaS Starter',
      seoTitle: 'Exported SaaS Starter'
    });

    assert.equal(zipResult.filename, 'devpulse-project-exported-saas-starter.zip');
    assert.equal(zipResult.files.length, 4);
    assert.deepEqual(
      zipResult.files.map((f) => f.name),
      ['index.html', 'styles.css', 'app.js', 'README.md']
    );
    assert.ok(zipResult.files[0].content.includes('<link rel="stylesheet" href="./styles.css" />'));
    assert.ok(zipResult.files[0].content.includes('<script src="./app.js" defer></script>'));

    // Verify PKZIP Local File Header signature (0x04034b50 => 'PK\x03\x04')
    assert.equal(zipResult.zipBytes[0], 0x50);
    assert.equal(zipResult.zipBytes[1], 0x4b);
    assert.equal(zipResult.zipBytes[2], 0x03);
    assert.equal(zipResult.zipBytes[3], 0x04);
  });

  it('configures live NOWPayments Crypto Donation credentials and embed URLs accurately', () => {
    assert.equal(NOWPAYMENTS_CONFIG.publicKey, '821c59c8-dc1e-446c-ac4d-f3035b462fc8');
    assert.equal(
      NOWPAYMENTS_CONFIG.directDonationUrl,
      'https://nowpayments.io/donation?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8'
    );
    assert.equal(
      NOWPAYMENTS_CONFIG.embeddedWidgetUrl,
      'https://nowpayments.io/embeds/donation-widget?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8'
    );
    assert.equal(
      NOWPAYMENTS_CONFIG.officialButtonImageUrl,
      'https://nowpayments.io/images/embeds/donation-button-black.svg'
    );
    assert.equal(NOWPAYMENTS_CONFIG.backendSecretEnvVar, 'NOWPAYMENTS_API_KEY');
  });

  it('computes Monthly Goal progress bar metrics and records new crypto donation transactions in history', () => {
    const initialProgress = computeMonthlyGoalProgress(
      DEFAULT_MONTHLY_DONATION_COUNT,
      DEFAULT_MONTHLY_TARGET_COUNT
    );
    assert.equal(initialProgress.donationCount, 18);
    assert.equal(initialProgress.targetDonationCount, 25);
    assert.equal(initialProgress.progressPercent, 72);
    assert.equal(initialProgress.raisedUsd, 180);
    assert.equal(initialProgress.targetUsd, 250);
    assert.equal(initialProgress.remainingDonations, 7);

    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, val);
      }
    };

    const defaultState = loadCryptoDonationState(mockStorage);
    assert.equal(defaultState.donationCount, 18);
    assert.ok(defaultState.transactions.length >= 5);
    assert.equal(defaultState.transactions[0].status, 'Confirmed');

    const updated = recordCryptoDonationAction(
      {
        currency: 'SOL',
        amountCrypto: '0.12 SOL',
        usdEquivalent: 18,
        donorAlias: 'sol_validator.eth',
        status: 'Confirmed'
      },
      mockStorage
    );

    assert.equal(updated.donationCount, 19);
    assert.equal(updated.latestTransaction.currency, 'SOL');
    assert.equal(updated.latestTransaction.status, 'Confirmed');
    assert.ok(updated.toastMessage.includes('Thank You'));
    assert.equal(updated.transactions[0].id, updated.latestTransaction.id);
    assert.equal(updated.goalMetrics.progressPercent, 76);
  });

  it('resolves dedicated /tools/:slug URLs (including /tools/json-formatter and /tools/word-counter) and builds SoftwareApplication + WebApplication JSON-LD schema', () => {
    assert.equal(getCanonicalToolPath('json-to-typescript'), '/tools/json-to-typescript');
    assert.equal(
      buildDedicatedToolUrl('json-to-typescript', 'https://devpulse.ai'),
      'https://devpulse.ai/tools/json-to-typescript'
    );

    // Direct /tools/:slug route resolution
    const directRoute = resolveToolRouteFromLocation('/tools/jwt-decoder', '');
    assert.equal(directRoute.tool.slug, 'jwt-decoder');
    assert.equal(directRoute.canonicalPath, '/tools/jwt-decoder');
    assert.equal(directRoute.matchedFromPath, true);

    // Popular SEO alias routes (/tools/json-formatter and /tools/word-counter)
    const jsonFormatterRoute = resolveToolRouteFromLocation('/tools/json-formatter', '');
    assert.equal(jsonFormatterRoute.tool.slug, 'json-to-typescript');
    assert.equal(jsonFormatterRoute.canonicalPath, '/tools/json-to-typescript');

    const wordCounterRoute = resolveToolRouteFromLocation('/tools/word-counter', '');
    assert.equal(wordCounterRoute.tool.slug, 'readme-generator');
    assert.equal(wordCounterRoute.canonicalPath, '/tools/readme-generator');

    // Verify every tool has 300-500+ words of SEO content including Why Users Need It, Formula/Logic, Steps, and FAQs
    for (const tool of SEO_TOOLS_CATALOG) {
      const logic = getToolLogicAndFormula(tool.slug);
      assert.ok(logic.whyUsersNeedParagraphs.length >= 2, `Expected >=2 whyUsersNeedParagraphs for ${tool.slug}`);
      assert.ok(logic.formulaAndLogicTitle.length > 10);
      assert.ok(logic.formulaCodeSnippet.length > 20);
      assert.ok(logic.formulaAndLogicExplanation.length > 20);
      assert.ok(logic.edgeCasesCovered.length >= 3);

      const schema = buildToolJsonLdSchema(tool, 'https://devpulse.ai') as {
        '@context': string;
        '@graph': Array<Record<string, unknown>>;
      };
      assert.equal(schema['@context'], 'https://schema.org');
      const types = schema['@graph'].flatMap((node) =>
        Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
      );
      assert.ok(types.includes('SoftwareApplication'), `Missing SoftwareApplication schema for ${tool.slug}`);
      assert.ok(types.includes('WebApplication'), `Missing WebApplication schema for ${tool.slug}`);
      assert.ok(types.includes('HowTo'), `Missing HowTo schema for ${tool.slug}`);
      assert.ok(types.includes('FAQPage'), `Missing FAQPage schema for ${tool.slug}`);
    }
  });
});
