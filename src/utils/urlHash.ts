export interface CdnDependencyItem {
  id: string;
  name: string;
  version: string;
  description: string;
  tagType: 'script' | 'style';
  url: string;
}

export const CDN_DEPENDENCY_CATALOG: CdnDependencyItem[] = [
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    version: '3.4.17',
    description: 'Utility-first CSS framework via Play CDN',
    tagType: 'script',
    url: 'https://cdn.tailwindcss.com',
  },
  {
    id: 'lucide',
    name: 'Lucide Icons',
    version: '0.475.0',
    description: 'Crisp vector icon library (lucide.createIcons)',
    tagType: 'script',
    url: 'https://unpkg.com/lucide@latest',
  },
  {
    id: 'framer-motion',
    name: 'Framer Motion',
    version: '11.11.17',
    description: 'Production-ready declarative animations & spring physics',
    tagType: 'script',
    url: 'https://cdn.jsdelivr.net/npm/framer-motion@11.11.17/dist/framer-motion.js',
  },
  {
    id: 'react-umd',
    name: 'React 18 + ReactDOM',
    version: '18.3.1',
    description: 'React UMD runtime for interactive JSX components',
    tagType: 'script',
    url: 'https://unpkg.com/react@18/umd/react.production.min.js',
  },
  {
    id: 'chartjs',
    name: 'Chart.js',
    version: '4.4.7',
    description: 'Responsive HTML5 canvas charts & telemetry graphs',
    tagType: 'script',
    url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
  },
  {
    id: 'threejs',
    name: 'Three.js',
    version: '0.170.0',
    description: '3D WebGL scene graph, shaders & spatial rendering',
    tagType: 'script',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.min.js',
  },
  {
    id: 'confetti',
    name: 'Canvas Confetti',
    version: '1.9.3',
    description: 'High-performance particle celebration effects',
    tagType: 'script',
    url: 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
  },
];

export interface ArtifactCodeState {
  html: string;
  css: string;
  js: string;
  prompt?: string;
  dependencies?: Array<string | { id?: string; name?: string; url: string; type?: 'script' | 'style' }>;
  seoTitle?: string;
  seoDescription?: string;
}

export const DEFAULT_STARTER_ARTIFACT: ArtifactCodeState = {
  prompt: 'Interactive SaaS Revenue & Telemetry Dashboard with live MRR simulator and cohort charts',
  seoTitle: 'PulseMetrics AI — Real-Time SaaS Revenue & Cohort Analytics',
  seoDescription: 'Interactive MRR, ARR, churn rate, and enterprise cohort telemetry dashboard built with DevPulse AI.',
  html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PulseMetrics AI — Real-Time SaaS Revenue & Cohort Analytics</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#06070B] text-zinc-100 min-h-screen p-6 font-sans antialiased">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
      <div>
        <span class="text-[11px] font-mono uppercase tracking-widest text-indigo-400">Live Telemetry Sandbox</span>
        <h1 class="text-2xl font-bold text-white mt-0.5">PulseMetrics Enterprise Revenue OS</h1>
      </div>
      <div class="flex items-center gap-2">
        <button id="simBtn" onclick="window.simulateGrowth()" class="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-600/25 cursor-pointer transition-all">
          ⚡ Simulate +15% MRR Spike
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Net Monthly Recurring Revenue</div>
        <div id="mrrValue" class="text-3xl font-extrabold text-white mt-2 font-mono">$148,920</div>
        <div class="text-xs text-emerald-400 mt-1 font-medium">▲ +24.8% vs last month</div>
      </div>
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Active Enterprise Seats</div>
        <div id="seatsValue" class="text-3xl font-extrabold text-white mt-2 font-mono">12,840</div>
        <div class="text-xs text-indigo-400 mt-1 font-medium">99.98% SLA Uptime</div>
      </div>
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Net Dollar Retention (NDR)</div>
        <div id="ndrValue" class="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">134.2%</div>
        <div class="text-xs text-zinc-400 mt-1"> Gross Churn: 0.8%</div>
      </div>
    </div>

    <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-white">Interactive Seat & Pricing Calculator</h2>
        <span id="calcBadge" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Annual Plan (20% Off)</span>
      </div>
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-zinc-300">
          <span>Team Size (<span id="seatCountLabel">25</span> developers)</span>
          <span id="estCostLabel" class="font-mono font-bold text-emerald-400">$725 / month</span>
        </div>
        <input id="seatSlider" type="range" min="5" max="250" value="25" oninput="window.updateSeatCalc(this.value)" class="w-full accent-indigo-500 cursor-pointer" />
      </div>
    </div>
  </div>

  <script>
    var currentMrr = 148920;
    var currentSeats = 12840;
    window.simulateGrowth = function() {
      currentMrr = Math.round(currentMrr * 1.15);
      currentSeats = Math.round(currentSeats * 1.08);
      document.getElementById('mrrValue').textContent = '$' + currentMrr.toLocaleString();
      document.getElementById('seatsValue').textContent = currentSeats.toLocaleString();
      console.log('Simulated MRR growth spike:', currentMrr);
    };
    window.updateSeatCalc = function(val) {
      var seats = Number(val) || 25;
      document.getElementById('seatCountLabel').textContent = seats;
      document.getElementById('estCostLabel').textContent = '$' + (seats * 29).toLocaleString() + ' / month';
    };
  </script>
</body>
</html>`,
  css: '',
  js: ''
};

/**
 * UTF-8 safe base64 encoding for URL hash sharing using btoa.
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * UTF-8 safe base64 decoding for URL hash sharing using atob.
 */
export function base64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes the current artifact state into a URL hash string (#code=...).
 */
export function encodeArtifactHash(state: ArtifactCodeState): string {
  const payload: Record<string, unknown> = {
    html: state.html,
    css: state.css,
    js: state.js,
    prompt: state.prompt || '',
  };
  if (state.dependencies && state.dependencies.length > 0) {
    payload.dependencies = state.dependencies;
  }
  if (state.seoTitle) {
    payload.seoTitle = state.seoTitle;
  }
  if (state.seoDescription) {
    payload.seoDescription = state.seoDescription;
  }
  return `#code=${encodeURIComponent(utf8ToBase64(JSON.stringify(payload)))}`;
}

export const encodeArtifactToHash = encodeArtifactHash;

/**
 * Decodes a URL hash string (#code=...) back into an ArtifactCodeState, or null if invalid.
 */
export function decodeArtifactHash(hash: string): ArtifactCodeState | null {
  if (!hash) return null;
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!cleaned.startsWith('code=')) return null;

  try {
    const encoded = decodeURIComponent(cleaned.slice('code='.length));
    const jsonStr = base64ToUtf8(encoded);
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null && typeof parsed.html === 'string') {
      const result: ArtifactCodeState = {
        html: parsed.html,
        css: typeof parsed.css === 'string' ? parsed.css : '',
        js: typeof parsed.js === 'string' ? parsed.js : '',
        prompt: typeof parsed.prompt === 'string' ? parsed.prompt : undefined,
      };
      if (Array.isArray(parsed.dependencies)) {
        result.dependencies = parsed.dependencies;
      }
      if (typeof parsed.seoTitle === 'string' && parsed.seoTitle) {
        result.seoTitle = parsed.seoTitle;
      }
      if (typeof parsed.seoDescription === 'string' && parsed.seoDescription) {
        result.seoDescription = parsed.seoDescription;
      }
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export const decodeArtifactFromHash = decodeArtifactHash;

/**
 * Builds HTML tags for the selected CDN dependencies (either catalog IDs, CdnDependency objects, or direct https:// URLs).
 */
export function buildDependencyTags(
  dependencies: Array<string | { id?: string; name?: string; url: string; type?: 'script' | 'style' }> = [],
  existingHtml = ''
): string {
  const tags: string[] = [];

  for (const dep of dependencies) {
    const depIdOrUrl = typeof dep === 'string' ? dep : dep.url;
    const explicitType = typeof dep === 'object' && dep !== null ? dep.type : undefined;
    const catalogItem = CDN_DEPENDENCY_CATALOG.find(
      (item) => item.id === depIdOrUrl || item.url === depIdOrUrl
    );
    const url = catalogItem ? catalogItem.url : (depIdOrUrl || '').trim();
    if (!url) continue;

    // Skip if the HTML already explicitly includes this exact CDN URL
    if (existingHtml.includes(url)) continue;

    if (explicitType === 'style' || catalogItem?.tagType === 'style' || url.endsWith('.css')) {
      tags.push(`<link rel="stylesheet" href="${url}" />`);
    } else {
      tags.push(`<script src="${url}"></script>`);
    }

    // If react-umd is selected, also inject react-dom if not already present
    if (
      catalogItem?.id === 'react-umd' &&
      !existingHtml.includes('react-dom.production.min.js')
    ) {
      tags.push(
        `<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>`
      );
    }
  }

  return tags.join('\n  ');
}

function escapeHtmlAttr(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Builds SEO <title> and <meta name="description"> tags for injection into the artifact <head>.
 */
export function buildSeoHeadTags(state: ArtifactCodeState): string {
  const tags: string[] = [];
  if (state.seoTitle && state.seoTitle.trim()) {
    const safeTitle = escapeHtmlAttr(state.seoTitle.trim());
    tags.push(`<title>${safeTitle}</title>`);
    tags.push(`<meta property="og:title" content="${safeTitle}" />`);
  }
  if (state.seoDescription && state.seoDescription.trim()) {
    const safeDesc = escapeHtmlAttr(state.seoDescription.trim());
    tags.push(`<meta name="description" content="${safeDesc}" />`);
    tags.push(`<meta property="og:description" content="${safeDesc}" />`);
  }
  return tags.join('\n  ');
}

/**
 * Combines HTML, CSS, JS, SEO Settings, and selected CDN Dependencies into a single self-contained HTML5 document
 * with embedded console.log / console.warn / console.error postMessage bridge AND Visual Point-and-Click Inspector.
 */
export function buildSandboxSrcDoc(
  state: ArtifactCodeState,
  includeConsoleBridge = true,
  previewTheme: 'dark' | 'light' = 'dark'
): string {
  const consoleBridgeScript = includeConsoleBridge
    ? `<script id="devpulse-runtime-bridge">
(function() {
  var t0 = performance.now();
  function sendLog(level, args) {
    try {
      var serialized = Array.prototype.slice.call(args).map(function(a) {
        if (typeof a === 'object' && a !== null) {
          try { return JSON.stringify(a); } catch (e) { return String(a); }
        }
        return String(a);
      }).join(' ');
      window.parent.postMessage({
        source: 'devpulse-sandbox',
        type: 'console',
        level: level,
        message: serialized,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (err) {}
  }
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;
  console.log = function() { sendLog('log', arguments); origLog.apply(console, arguments); };
  console.warn = function() { sendLog('warn', arguments); origWarn.apply(console, arguments); };
  console.error = function() { sendLog('error', arguments); origError.apply(console, arguments); };
  console.info = function() { sendLog('info', arguments); origInfo.apply(console, arguments); };
  window.addEventListener('error', function(e) {
    sendLog('error', [e.message + (e.lineno ? ' (line ' + e.lineno + ')' : '')]);
  });

  // Visual Point-and-Click Element Inspector State
  var inspectMode = false;
  var hoveredEl = null;
  var selectedEl = null;
  var badgeEl = null;

  function ensureBadge() {
    if (!badgeEl && document.body) {
      badgeEl = document.createElement('div');
      badgeEl.id = '__devpulse_inspector_badge__';
      badgeEl.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;background:#6366F1;color:#fff;font-family:monospace;font-size:11px;padding:2px 6px;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:none;white-space:nowrap;';
      document.body.appendChild(badgeEl);
    }
  }

  function clearHighlight(el) {
    if (!el || !el.style) return;
    if (el !== selectedEl) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
  }

  document.addEventListener('mouseover', function(e) {
    if (!inspectMode) return;
    var target = e.target;
    if (!target || target === document.body || target === document.documentElement || target.id === '__devpulse_inspector_badge__') return;
    if (hoveredEl && hoveredEl !== target) clearHighlight(hoveredEl);
    hoveredEl = target;
    if (target !== selectedEl) {
      target.style.outline = '2px dashed #818CF8';
      target.style.outlineOffset = '2px';
    }
    ensureBadge();
    if (badgeEl) {
      var rect = target.getBoundingClientRect();
      var tag = target.tagName.toLowerCase();
      var cls = (typeof target.className === 'string' && target.className.trim()) ? '.' + target.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
      badgeEl.textContent = '<' + tag + '>' + cls;
      badgeEl.style.display = 'block';
      badgeEl.style.top = Math.max(4, rect.top - 22) + 'px';
      badgeEl.style.left = Math.max(4, rect.left) + 'px';
    }
  }, true);

  document.addEventListener('mouseout', function(e) {
    if (!inspectMode) return;
    if (hoveredEl && hoveredEl !== selectedEl) {
      clearHighlight(hoveredEl);
    }
  }, true);

  document.addEventListener('click', function(e) {
    if (!inspectMode) return;
    var target = e.target;
    if (!target || target === document.body || target === document.documentElement || target.id === '__devpulse_inspector_badge__') return;
    e.preventDefault();
    e.stopPropagation();
    if (selectedEl && selectedEl !== target) {
      selectedEl.style.outline = '';
      selectedEl.style.outlineOffset = '';
    }
    selectedEl = target;
    selectedEl.style.outline = '2px solid #4EDEA3';
    selectedEl.style.outlineOffset = '2px';

    var directText = '';
    for (var i = 0; i < target.childNodes.length; i++) {
      if (target.childNodes[i].nodeType === 3) {
        directText += target.childNodes[i].nodeValue;
      }
    }
    var resolvedText = directText.trim() || (target.innerText || '').trim().slice(0, 160);

    window.parent.postMessage({
      source: 'devpulse-sandbox',
      type: 'element-selected',
      tagName: target.tagName.toLowerCase(),
      textContent: resolvedText,
      className: typeof target.className === 'string' ? target.className : '',
      outerHTML: (target.outerHTML || '').slice(0, 500)
    }, '*');
  }, true);

  window.addEventListener('load', function() {
    var loadMs = Math.max(1, Math.round(performance.now() - t0));
    var scripts = document.querySelectorAll('script:not(#devpulse-runtime-bridge)');
    window.parent.postMessage({
      source: 'devpulse-sandbox',
      type: 'perf-metrics',
      loadTimeMs: loadMs,
      domScriptCount: scripts.length,
      domElements: document.getElementsByTagName('*').length
    }, '*');
  });

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.source !== 'devpulse-host') return;
    if (e.data.type === 'eval') {
      try {
        var res = eval(e.data.code);
        sendLog('eval', ['> ' + e.data.code + ' → ' + (typeof res === 'object' ? JSON.stringify(res) : String(res))]);
      } catch (err) {
        sendLog('error', ['Eval Error: ' + err.message]);
      }
    } else if (e.data.type === 'toggle-inspect') {
      inspectMode = Boolean(e.data.enabled);
      if (!inspectMode) {
        if (hoveredEl) { hoveredEl.style.outline = ''; hoveredEl.style.outlineOffset = ''; }
        if (selectedEl) { selectedEl.style.outline = ''; selectedEl.style.outlineOffset = ''; selectedEl = null; }
        if (badgeEl) { badgeEl.style.display = 'none'; }
      }
    } else if (e.data.type === 'update-selected-element') {
      if (selectedEl) {
        if (typeof e.data.textContent === 'string') {
          selectedEl.textContent = e.data.textContent;
        }
        if (typeof e.data.className === 'string') {
          selectedEl.className = e.data.className;
        }
      }
    }
  });
})();
</script>`
    : '';

  const previewThemeStyle =
    previewTheme === 'light'
      ? `<style id="devpulse-preview-theme-override">
  :root, html, body {
    color-scheme: light !important;
    background-color: #F8FAFC !important;
    color: #0F172A !important;
  }
  body.bg-\\[\\#090A0F\\], body.bg-\\[\\#06070B\\], body.bg-slate-950, body.bg-zinc-950, body.bg-slate-900, body.bg-zinc-900,
  .bg-\\[\\#090A0F\\], .bg-\\[\\#06070B\\], .bg-slate-950, .bg-zinc-950 {
    background-color: #F8FAFC !important;
    color: #0F172A !important;
  }
  .bg-slate-900, .bg-zinc-900, .bg-slate-900\\/80, .bg-zinc-900\\/80, .bg-white\\/\\[0\\.03\\], .bg-white\\/\\[0\\.04\\], .bg-white\\/5, .bg-white\\/10 {
    background-color: #FFFFFF !important;
    border-color: #E2E8F0 !important;
    box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06) !important;
  }
  .text-white, .text-slate-100, .text-zinc-100, .text-slate-200, .text-zinc-200 {
    color: #0F172A !important;
  }
  .text-slate-300, .text-zinc-300, .text-slate-400, .text-zinc-400 {
    color: #475569 !important;
  }
  .border-white\\/10, .border-white\\/\\[0\\.08\\], .border-slate-800, .border-zinc-800 {
    border-color: #E2E8F0 !important;
  }
</style>`
      : `<style id="devpulse-preview-theme-override">
  :root, html { color-scheme: dark; }
</style>`;

  let doc = state.html || '';
  const hasHtmlTag = /<html[\s>]/i.test(doc);
  const dependencyTags = buildDependencyTags(
    state.dependencies ?? ['tailwindcss', 'lucide'],
    doc
  );
  const seoTags = buildSeoHeadTags(state);

  // If custom seoTitle is set and doc already has a <title>, replace the existing <title>
  if (state.seoTitle && state.seoTitle.trim() && /<title>[\s\S]*?<\/title>/i.test(doc)) {
    doc = doc.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtmlAttr(state.seoTitle.trim())}</title>`
    );
  }

  if (!hasHtmlTag) {
    const htmlThemeClass = previewTheme === 'light' ? 'light' : 'dark';
    const bodyThemeClasses =
      previewTheme === 'light'
        ? 'bg-slate-50 text-slate-900 min-h-screen antialiased'
        : 'bg-[#090A0F] text-slate-100 min-h-screen antialiased';
    doc = `<!DOCTYPE html>
<html lang="en" class="${htmlThemeClass}" data-preview-theme="${previewTheme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${seoTags}
  <script src="https://cdn.tailwindcss.com"></script>
  ${dependencyTags}
  ${previewThemeStyle}
  ${consoleBridgeScript}
  ${state.css ? `<style>\n${state.css}\n</style>` : ''}
</head>
<body class="${bodyThemeClasses}">
  ${doc}
  ${state.js ? `<script>\n${state.js}\n</script>` : ''}
</body>
</html>`;
    return doc;
  }

  // Update <html ...> tag with data-preview-theme attribute and theme class
  if (previewTheme === 'light') {
    doc = doc.replace(/<html([^>]*)class=(["'])dark\2/i, '<html$1class=$2light$2');
  }
  doc = doc.replace(/<html([^>]*)>/i, `<html$1 data-preview-theme="${previewTheme}">`);

  const headInjections = [seoTags, dependencyTags, previewThemeStyle, consoleBridgeScript]
    .filter(Boolean)
    .join('\n');
  if (headInjections) {
    if (/<head[\s>]/i.test(doc)) {
      doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n${headInjections}`);
    } else {
      doc = `${headInjections}\n${doc}`;
    }
  }

  if (state.css && state.css.trim().length > 0) {
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `<style>\n${state.css}\n</style>\n</head>`);
    } else {
      doc = `<style>\n${state.css}\n</style>\n${doc}`;
    }
  }

  if (state.js && state.js.trim().length > 0) {
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `<script>\n${state.js}\n</script>\n</body>`);
    } else {
      doc = `${doc}\n<script>\n${state.js}\n</script>`;
    }
  }

  return doc;
}
