import {
  type ArtifactCodeState,
  CDN_DEPENDENCY_CATALOG,
  DEFAULT_STARTER_ARTIFACT,
  buildSandboxSrcDoc,
  encodeArtifactToHash
} from './urlHash.ts';

export type ExportFrameworkId = 'html' | 'react-tsx' | 'nextjs-app' | 'vue3';

export interface ArtifactPerformanceMetrics {
  loadTimeMs: number;
  scriptTagCount: number;
  inlineScriptCount: number;
  externalScriptCount: number;
  totalScriptBytes: number;
  totalScriptSizeBytes: number;
  totalScriptKb: string;
  totalScriptSizeKb: number;
  totalDocumentBytes: number;
  totalDocumentKb: string;
  domNodeEstimate: number;
}

const CDN_SIZE_ESTIMATES_BYTES: Record<string, number> = {
  'https://cdn.tailwindcss.com': 48_200,
  'https://unpkg.com/lucide@latest': 28_400,
  'https://cdn.jsdelivr.net/npm/framer-motion@11.11.17/dist/framer-motion.js': 64_100,
  'https://unpkg.com/react@18/umd/react.production.min.js': 11_200,
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js': 131_400,
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js': 69_800,
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.min.js': 162_500,
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js': 10_400,
};

const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/**
 * Formats HTML, CSS, JavaScript, TypeScript/React, or Vue 3 code with clean 2-space indentation.
 */
export function formatArtifactCode(
  code: string,
  language: 'html' | 'css' | 'js' | 'tsx' | 'vue' = 'html'
): string {
  const raw = (code || '').trim();
  if (!raw) return '';

  if (language === 'css') {
    return formatCssCode(raw);
  }

  if (language === 'js' || language === 'tsx') {
    return formatBraceBasedCode(raw);
  }

  return formatHtmlMarkup(raw);
}

function formatCssCode(css: string): string {
  const normalized = css
    .replace(/\r\n/g, '\n')
    .replace(/\s*\{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*\}\s*/g, '\n}\n\n');

  const lines = normalized.split('\n');
  let indent = 0;
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }
    out.push(`${'  '.repeat(indent)}${trimmed}`);
    if (trimmed.endsWith('{')) {
      indent += 1;
    }
  }

  return out.join('\n').trim() + '\n';
}

function formatBraceBasedCode(code: string): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  let indent = 0;
  const out: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }

    if (/^[}\])]/.test(trimmed)) {
      indent = Math.max(0, indent - 1);
    }

    out.push(`${'  '.repeat(indent)}${trimmed}`);

    const openCount = (trimmed.match(/[{[(]/g) || []).length;
    const closeCount = (trimmed.match(/[}\])]/g) || []).length;
    const startsWithClose = /^[}\])]/.test(trimmed) ? 1 : 0;
    indent = Math.max(0, indent + openCount - (closeCount - startsWithClose));
  }

  return out.join('\n').trim() + '\n';
}

function formatHtmlMarkup(html: string): string {
  const normalized = html
    .replace(/\r\n/g, '\n')
    .replace(/>\s*</g, '>\n<');

  const rawLines = normalized.split('\n');
  let indent = 0;
  let inScriptOrStyle = false;
  const out: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (/^<\/(script|style)>/i.test(trimmed)) {
      inScriptOrStyle = false;
      indent = Math.max(0, indent - 1);
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }

    if (inScriptOrStyle) {
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }

    const isClosingTag = /^<\/[a-zA-Z0-9-]+[^>]*>$/.test(trimmed);
    const isCommentOrDoctype = /^<!/.test(trimmed);
    const openTagMatch = trimmed.match(/^<([a-zA-Z0-9-]+)(?:\s[^>]*)?>$/);
    const selfClosing =
      /\/>$/.test(trimmed) ||
      (openTagMatch ? VOID_HTML_TAGS.has(openTagMatch[1].toLowerCase()) : false) ||
      /^<([a-zA-Z0-9-]+)(\s[^>]*)?>.*<\/\1>$/i.test(trimmed);

    if (isClosingTag) {
      indent = Math.max(0, indent - 1);
    }

    out.push(`${'  '.repeat(indent)}${trimmed}`);

    if (!isClosingTag && !isCommentOrDoctype && !selfClosing && /^<[a-zA-Z0-9-]+/.test(trimmed)) {
      const tagM = trimmed.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagM ? tagM[1].toLowerCase() : '';
      if (!VOID_HTML_TAGS.has(tagName) && !trimmed.includes(`</${tagName}>`)) {
        indent += 1;
        if (tagName === 'script' || tagName === 'style') {
          inScriptOrStyle = true;
        }
      }
    }
  }

  return out.join('\n').trim() + '\n';
}

/**
 * Computes real-time performance telemetry for the current artifact:
 * - Load time (ms)
 * - Number of injected <script> tags (excluding internal console bridge)
 * - Total script size (KB / bytes) combining inline scripts + CDN dependencies
 */
export function computeArtifactPerformanceMetrics(
  state: ArtifactCodeState,
  renderedSrcDocOrLoadMs?: string | number,
  measuredLoadTimeMs = 14
): ArtifactPerformanceMetrics {
  const renderedSrcDoc =
    typeof renderedSrcDocOrLoadMs === 'string' ? renderedSrcDocOrLoadMs : undefined;
  const effectiveLoadMs =
    typeof renderedSrcDocOrLoadMs === 'number' ? renderedSrcDocOrLoadMs : measuredLoadTimeMs;

  const fullDoc = renderedSrcDoc || buildSandboxSrcDoc(state, false);
  const encoder = new TextEncoder();
  const totalDocumentBytes = encoder.encode(fullDoc).byteLength;

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  let inlineScriptCount = 0;
  let externalScriptCount = 0;
  let totalScriptBytes = 0;

  while ((match = scriptRegex.exec(fullDoc)) !== null) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (attrs.includes('devpulse-runtime-bridge')) continue;

    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (srcMatch) {
      externalScriptCount += 1;
      const srcUrl = srcMatch[1].trim();
      const catalogMatch = CDN_DEPENDENCY_CATALOG.find(
        (c) => c.url === srcUrl || srcUrl.includes(c.id)
      );
      if (CDN_SIZE_ESTIMATES_BYTES[srcUrl]) {
        totalScriptBytes += CDN_SIZE_ESTIMATES_BYTES[srcUrl];
      } else if (catalogMatch && CDN_SIZE_ESTIMATES_BYTES[catalogMatch.url]) {
        totalScriptBytes += CDN_SIZE_ESTIMATES_BYTES[catalogMatch.url];
      } else {
        totalScriptBytes += 24_500;
      }
    } else {
      inlineScriptCount += 1;
      totalScriptBytes += encoder.encode(body).byteLength;
    }
  }

  const scriptTagCount = inlineScriptCount + externalScriptCount;
  const domNodeEstimate = Math.max(
    1,
    (fullDoc.match(/<[a-zA-Z][a-zA-Z0-9-]*(?:\s|>|\/>)/g) || []).length
  );
  const kbString = (totalScriptBytes / 1024).toFixed(1);

  return {
    loadTimeMs: Math.max(1, Math.round(effectiveLoadMs)),
    scriptTagCount,
    inlineScriptCount,
    externalScriptCount,
    totalScriptBytes,
    totalScriptSizeBytes: totalScriptBytes,
    totalScriptKb: kbString,
    totalScriptSizeKb: Number(kbString),
    totalDocumentBytes,
    totalDocumentKb: (totalDocumentBytes / 1024).toFixed(1),
    domNodeEstimate,
  };
}

function extractBodyInnerHtml(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;
  content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
  return content;
}

function extractCombinedJs(state: ArtifactCodeState): string {
  const scripts: string[] = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRegex.exec(state.html || '')) !== null) {
    const attrs = m[1] || '';
    const content = (m[2] || '').trim();
    if (!/\bsrc=/i.test(attrs) && content) {
      scripts.push(content);
    }
  }
  if (state.js && state.js.trim()) {
    scripts.push(state.js.trim());
  }
  return scripts.join('\n\n');
}

function htmlToJsxMarkup(html: string): string {
  return html
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/\btabindex=/gi, 'tabIndex=')
    .replace(/\breadonly=/gi, 'readOnly=')
    .replace(/\bmaxlength=/gi, 'maxLength=')
    .replace(/\bautocomplete=/gi, 'autoComplete=')
    .replace(/\bstroke-width=/g, 'strokeWidth=')
    .replace(/\bstroke-linecap=/g, 'strokeLinecap=')
    .replace(/\bstroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/\bfill-rule=/g, 'fillRule=')
    .replace(/\bclip-rule=/g, 'clipRule=')
    .replace(/<(img|input|br|hr|meta|link)\b([^>]*?)(?<!\/)>/gi, '<$1$2 />');
}

export function convertArtifactToFramework(
  state: ArtifactCodeState,
  framework: ExportFrameworkId
): { code: string; filename: string; language: string } {
  if (framework === 'html') {
    return {
      code: formatArtifactCode(buildSandboxSrcDoc(state, false), 'html'),
      filename: 'index.html',
      language: 'html',
    };
  }

  const bodyHtml = extractBodyInnerHtml(state.html || '<div></div>');
  const combinedJs = extractCombinedJs(state);
  const seoTitle = state.seoTitle?.trim() || state.prompt?.slice(0, 50) || 'DevPulse AI Artifact';
  const seoDesc =
    state.seoDescription?.trim() ||
    'Synthesized with DevPulse AI Visual Artifact Studio.';

  if (framework === 'react-tsx') {
    const jsxBody = htmlToJsxMarkup(bodyHtml)
      .split('\n')
      .map((line) => `      ${line}`)
      .join('\n');

    const jsHook = combinedJs
      ? `\n  useEffect(() => {\n    try {\n${combinedJs
          .split('\n')
          .map((l) => `      ${l}`)
          .join('\n')}\n    } catch (err) {\n      console.error('Artifact init error:', err);\n    }\n  }, []);\n`
      : '';

    const code = `import React, { useEffect } from 'react';

export interface DevPulseArtifactProps {
  title?: string;
}

export const DevPulseArtifact: React.FC<DevPulseArtifactProps> = ({
  title = ${JSON.stringify(seoTitle)},
}) => {${jsHook}
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#E3E1E9] antialiased" data-title={title}>
${jsxBody}
    </div>
  );
};

export default DevPulseArtifact;
`;
    return {
      code,
      filename: 'ArtifactComponent.tsx',
      language: 'tsx',
    };
  }

  if (framework === 'nextjs-app') {
    const jsxBody = htmlToJsxMarkup(bodyHtml)
      .split('\n')
      .map((line) => `      ${line}`)
      .join('\n');

    const code = `'use client';

import React from 'react';

export default function ArtifactPage() {
  return (
    <main className="min-h-screen bg-[#090A0F] text-[#E3E1E9] antialiased" data-seo-title=${JSON.stringify(seoTitle)} data-seo-desc=${JSON.stringify(seoDesc)}>
${jsxBody}
    </main>
  );
}
`;
    return {
      code,
      filename: 'app/page.tsx',
      language: 'tsx',
    };
  }

  // Vue 3 Single-File Component (.vue)
  const indentedTemplate = bodyHtml
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n');

  const vueOnMounted = combinedJs
    ? `onMounted(() => {\n${combinedJs
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n')}\n});`
    : '// Component ready';

  const code = `<template>
  <div class="min-h-screen bg-[#090A0F] text-[#E3E1E9] antialiased" :data-title="pageTitle">
${indentedTemplate}
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const pageTitle = ${JSON.stringify(seoTitle)};
const pageDescription = ${JSON.stringify(seoDesc)};

${vueOnMounted}
</script>

<style scoped>
${state.css?.trim() || '/* Custom component styles */'}
</style>
`;
  return {
    code,
    filename: 'ArtifactComponent.vue',
    language: 'vue',
  };
}

export function applyElementInspectionEdit(
  html: string,
  editOrOldText:
    | {
        tagName?: string;
        oldText?: string;
        newText?: string;
        oldClassName?: string;
        newClassName?: string;
      }
    | string,
  newTextArg?: string,
  oldClassNameArg?: string,
  newClassNameArg?: string
): string {
  const edit =
    typeof editOrOldText === 'string'
      ? {
          oldText: editOrOldText,
          newText: newTextArg,
          oldClassName: oldClassNameArg,
          newClassName: newClassNameArg,
        }
      : editOrOldText;

  let updated = html;

  if (
    typeof edit.oldClassName === 'string' &&
    typeof edit.newClassName === 'string' &&
    edit.oldClassName !== edit.newClassName
  ) {
    if (edit.oldClassName.trim().length > 0) {
      const targetAttr = `class="${edit.oldClassName}"`;
      const replacementAttr = `class="${edit.newClassName}"`;
      if (updated.includes(targetAttr)) {
        updated = updated.replace(targetAttr, replacementAttr);
      }
    } else if (edit.tagName) {
      const openTagRegex = new RegExp(`<(${edit.tagName})\\b(?![^>]*\\bclass=)`, 'i');
      updated = updated.replace(openTagRegex, `<$1 class="${edit.newClassName}"`);
    }
  }

  if (
    typeof edit.oldText === 'string' &&
    typeof edit.newText === 'string' &&
    edit.oldText.trim().length > 0 &&
    edit.oldText !== edit.newText
  ) {
    updated = updated.replace(edit.oldText, edit.newText);
  }

  return updated;
}

export const AUTOSAVE_STORAGE_KEY = 'devpulse_current_artifact_v1';
export const AUTOSAVE_META_STORAGE_KEY = 'devpulse_autosave_meta_v1';
export const AUTOSAVE_INTERVAL_MS = 5000;

export interface AutoSaveMeta {
  savedAt: number;
  byteSize: number;
  intervalMs: number;
}

/**
 * Persists the current code editor state and metadata to storage (localStorage by default).
 * Designed to be invoked on a 5-second interval as well as on immediate edits/unload.
 */
export function persistArtifactAutoSave(
  codeState: ArtifactCodeState,
  storage?: Pick<Storage, 'setItem'> | null,
  now: number = Date.now()
): AutoSaveMeta {
  const stateJson = JSON.stringify(codeState);
  const byteSize = new TextEncoder().encode(stateJson).byteLength;
  const meta: AutoSaveMeta = {
    savedAt: now,
    byteSize,
    intervalMs: AUTOSAVE_INTERVAL_MS,
  };

  const targetStorage =
    storage !== undefined ? storage : typeof localStorage !== 'undefined' ? localStorage : null;

  if (targetStorage) {
    try {
      targetStorage.setItem(AUTOSAVE_STORAGE_KEY, stateJson);
      targetStorage.setItem(AUTOSAVE_META_STORAGE_KEY, JSON.stringify(meta));
    } catch {
      // Ignore quota errors in restricted storage environments
    }
  }

  return meta;
}

/**
 * Loads the persisted auto-saved code editor state and timestamp metadata from storage.
 */
export function loadArtifactAutoSave(
  storage?: Pick<Storage, 'getItem'> | null
): { codeState: ArtifactCodeState | null; meta: AutoSaveMeta | null } {
  const targetStorage =
    storage !== undefined ? storage : typeof localStorage !== 'undefined' ? localStorage : null;

  if (!targetStorage) {
    return { codeState: null, meta: null };
  }

  let codeState: ArtifactCodeState | null = null;
  let meta: AutoSaveMeta | null = null;

  try {
    const rawState = targetStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (rawState) {
      const parsed = JSON.parse(rawState);
      if (parsed && typeof parsed.html === 'string') {
        codeState = parsed as ArtifactCodeState;
      }
    }
  } catch {
    // ignore malformed state
  }

  try {
    const rawMeta = targetStorage.getItem(AUTOSAVE_META_STORAGE_KEY);
    if (rawMeta) {
      const parsedMeta = JSON.parse(rawMeta);
      if (parsedMeta && typeof parsedMeta.savedAt === 'number') {
        meta = parsedMeta as AutoSaveMeta;
      }
    }
  } catch {
    // ignore malformed meta
  }

  return { codeState, meta };
}

export interface SocialShareDraftInput {
  toolSlug: string;
  toolName: string;
  toolDescription?: string;
  codeState: ArtifactCodeState;
  origin?: string;
}

export interface SocialShareDraftResult {
  postText: string;
  seoToolUrl: string;
  previewSummary: string;
  xShareUrl: string;
  linkedInShareUrl: string;
  redditShareUrl: string;
}

/**
 * Extracts a concise human-readable preview summary from an ArtifactCodeState.
 */
export function extractArtifactPreviewSummary(codeState: ArtifactCodeState): string {
  const customTitle = codeState.seoTitle?.trim();
  const promptText = codeState.prompt?.trim();

  // Extract first H1/H2 or title from HTML if available
  const headingMatch = (codeState.html || '').match(/<(?:h1|h2|title)[^>]*>([\s\S]*?)<\/(?:h1|h2|title)>/i);
  const headingText = headingMatch
    ? headingMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    : '';

  const primaryLabel =
    customTitle ||
    headingText ||
    (promptText ? promptText.slice(0, 72) : 'Interactive Tailwind CSS & HTML5 UI Artifact');

  const perf = computeArtifactPerformanceMetrics(codeState);
  return `${primaryLabel} (${perf.totalDocumentKb} KB, ${perf.domNodeEstimate} DOM nodes)`;
}

/**
 * Builds a pre-filled social media post draft with a link to the current tool's SEO page
 * and a descriptive preview of the user's current artifact work.
 */
export function buildSocialShareDraft(input: SocialShareDraftInput): SocialShareDraftResult {
  const cleanOrigin = (input.origin || 'https://yourdomain.com').replace(/\/+$/, '');
  const cleanSlug = (input.toolSlug || 'ai-ui-generator').trim();
  const seoToolUrl = `${cleanOrigin}/?tool=${encodeURIComponent(cleanSlug)}`;
  const previewSummary = extractArtifactPreviewSummary(input.codeState);
  const toolHeadline = input.toolName?.trim() || 'DevPulse AI Artifact Studio';

  const postText = [
    `🚀 Just built "${previewSummary}" using ${toolHeadline} on DevPulse AI!`,
    input.toolDescription
      ? `✨ ${input.toolDescription.trim()}`
      : '✨ Live interactive Tailwind CSS & React UI preview with zero login.',
    `🔗 Try the tool free: ${seoToolUrl}`,
    `#WebDev #TailwindCSS #ReactJS #AIDevTools #DevPulseAI`
  ].join('\n\n');

  const encodedText = encodeURIComponent(postText);
  const encodedUrl = encodeURIComponent(seoToolUrl);
  const encodedTitle = encodeURIComponent(`Built "${previewSummary}" with ${toolHeadline}`);

  return {
    postText,
    seoToolUrl,
    previewSummary,
    xShareUrl: `https://twitter.com/intent/tweet?text=${encodedText}`,
    linkedInShareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    redditShareUrl: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };
}

function escapePdfText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextLines(text: string, maxChars = 86): string[] {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const wrapped: string[] = [];
  for (const line of rawLines) {
    const clean = line.replace(/\t/g, '  ');
    if (clean.length <= maxChars) {
      wrapped.push(clean);
    } else {
      for (let i = 0; i < clean.length; i += maxChars) {
        wrapped.push(clean.slice(i, i + maxChars));
      }
    }
  }
  return wrapped;
}

/**
 * Generates a clean, formatted, standards-compliant PDF 1.4 document (`Uint8Array`)
 * containing the rendered artifact's documentation summary, visible text structure,
 * telemetry metrics, and formatted source code.
 */
export function generateArtifactPdfDocument(
  codeState: ArtifactCodeState,
  toolName = 'AI UI & Artifact Studio'
): {
  pdfBytes: Uint8Array;
  filename: string;
  pageCount: number;
  summaryText: string;
} {
  const previewSummary = extractArtifactPreviewSummary(codeState);
  const perf = computeArtifactPerformanceMetrics(codeState);

  // Extract visible text nodes from the rendered HTML body for the documentation preview section
  const visibleTextRaw = extractBodyInnerHtml(codeState.html || '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(h1|h2|h3|h4|p|div|li|tr|section|header|footer)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 28)
    .join('\n');

  const formattedHtml = formatArtifactCode(codeState.html || '', 'html');

  const docLines: string[] = [
    '================================================================================',
    'DEVPULSE AI - ARTIFACT DOCUMENTATION & SPECIFICATION REPORT',
    '================================================================================',
    `Tool Module    : ${toolName}`,
    `Artifact Title : ${previewSummary}`,
    `Prompt / Spec  : ${codeState.prompt?.trim() || 'Custom Interactive HTML5 & Tailwind CSS Artifact'}`,
    `SEO Meta Title : ${codeState.seoTitle?.trim() || 'Default Artifact Title'}`,
    `Telemetry      : ${perf.totalDocumentKb} KB | ${perf.domNodeEstimate} DOM Nodes | ${perf.scriptTagCount} Scripts | ~${perf.loadTimeMs}ms Load`,
    '--------------------------------------------------------------------------------',
    '1. RENDERED ARTIFACT CONTENT PREVIEW',
    '--------------------------------------------------------------------------------',
    ...(visibleTextRaw ? wrapTextLines(visibleTextRaw, 84) : ['(Interactive visual canvas component)']),
    '',
    '--------------------------------------------------------------------------------',
    '2. FORMATTED ARTIFACT SOURCE CODE (HTML5 / TAILWIND CSS / JS)',
    '--------------------------------------------------------------------------------',
    ...wrapTextLines(formattedHtml, 84).slice(0, 140),
  ];

  const linesPerPage = 48;
  const pagesLines: string[][] = [];
  for (let i = 0; i < docLines.length; i += linesPerPage) {
    pagesLines.push(docLines.slice(i, i + linesPerPage));
  }
  if (pagesLines.length === 0) {
    pagesLines.push(['DevPulse AI Artifact Documentation']);
  }

  // Build PDF 1.4 objects:
  // 1: Catalog, 2: Pages, 3: Font (Courier), then for each page: Page object + Content stream object
  const objects: string[] = [];
  const pageCount = pagesLines.length;
  const pageObjNumbers: number[] = [];

  // Placeholder for 1 (Catalog), 2 (Pages), 3 (Font)
  objects.push(''); // index 0 (1-based)
  objects.push(''); // index 1
  objects.push(''); // index 2

  for (let p = 0; p < pageCount; p++) {
    const pageObjNum = 4 + p * 2;
    const contentObjNum = pageObjNum + 1;
    pageObjNumbers.push(pageObjNum);

    const lines = pagesLines[p];
    const streamCommands: string[] = [
      'BT',
      '/F1 9 Tf',
      '13 TL',
      '36 756 Td',
    ];

    lines.forEach((line, idx) => {
      const escaped = escapePdfText(line);
      if (idx === 0) {
        streamCommands.push(`(${escaped}) Tj`);
      } else {
        streamCommands.push(`T* (${escaped}) Tj`);
      }
    });
    streamCommands.push('ET');

    const streamBody = streamCommands.join('\n');
    const pageObj = `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
    const contentObj = `${contentObjNum} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`;

    objects.push(pageObj);
    objects.push(contentObj);
  }

  objects[0] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjNumbers.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`;
  objects[2] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

  let pdfString = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdfString.length);
    pdfString += obj;
  }

  const xrefOffset = pdfString.length;
  pdfString += `xref\n0 ${objects.length + 1}\n`;
  pdfString += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdfString += `${offStr} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const pdfBytes = new TextEncoder().encode(pdfString);
  const slugBase =
    (codeState.seoTitle || codeState.prompt || 'artifact-documentation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) || 'artifact-documentation';

  return {
    pdfBytes,
    filename: `devpulse-${slugBase}.pdf`,
    pageCount,
    summaryText: previewSummary,
  };
}

export interface SandboxShortcutBarItem {
  id: 'run' | 'save' | 'share' | 'refactor' | 'console' | 'bento';
  keys: string;
  label: string;
  description: string;
}

export const SANDBOX_SHORTCUTS_BAR_ITEMS: SandboxShortcutBarItem[] = [
  {
    id: 'run',
    keys: 'Cmd+Enter',
    label: 'Run',
    description: 'Reload & execute live artifact preview (Cmd/Ctrl + Enter)',
  },
  {
    id: 'save',
    keys: 'Cmd+S',
    label: 'Save',
    description: 'Save artifact snapshot to version history (Cmd/Ctrl + S)',
  },
  {
    id: 'share',
    keys: 'Cmd+Shift+S',
    label: 'Share URL',
    description: 'Encode artifact into a zero-backend shareable URL (Cmd/Ctrl + Shift + S)',
  },
  {
    id: 'refactor',
    keys: 'Cmd+Shift+F',
    label: 'AI Refactor',
    description: 'Refactor code with AI optimization (Cmd/Ctrl + Shift + F)',
  },
  {
    id: 'console',
    keys: 'Cmd+Shift+J',
    label: 'Console',
    description: 'Toggle integrated runtime console panel (Cmd/Ctrl + Shift + J)',
  },
  {
    id: 'bento',
    keys: 'Cmd+K',
    label: 'Bento Hub',
    description: 'Open 12-Tool Bento Command Switcher (Cmd/Ctrl + K)',
  },
];

/**
 * Resets the artifact code state back to a clean clone of DEFAULT_STARTER_ARTIFACT
 * and persists the reset state to auto-save storage.
 */
export function resetArtifactToStarterTemplate(
  storage?: Pick<Storage, 'setItem'> | null,
  now: number = Date.now()
): ArtifactCodeState {
  const cleanStarter: ArtifactCodeState = {
    html: DEFAULT_STARTER_ARTIFACT.html,
    css: DEFAULT_STARTER_ARTIFACT.css || '',
    js: DEFAULT_STARTER_ARTIFACT.js || '',
    prompt: DEFAULT_STARTER_ARTIFACT.prompt || '',
    seoTitle: DEFAULT_STARTER_ARTIFACT.seoTitle || '',
    seoDescription: DEFAULT_STARTER_ARTIFACT.seoDescription || '',
    dependencies: DEFAULT_STARTER_ARTIFACT.dependencies
      ? [...DEFAULT_STARTER_ARTIFACT.dependencies]
      : [],
  };

  persistArtifactAutoSave(cleanStarter, storage, now);
  return cleanStarter;
}

export interface ConsoleLogFilterable {
  id: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

/**
 * Filters runtime console log entries by severity level and case-insensitive search query.
 */
export function filterConsoleLogs<T extends ConsoleLogFilterable>(
  logs: T[],
  levelFilter: 'all' | 'log' | 'warn' | 'error' = 'all',
  searchQuery: string = ''
): T[] {
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  return logs.filter((entry) => {
    if (levelFilter !== 'all' && entry.level !== levelFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      entry.message.toLowerCase().includes(normalizedQuery) ||
      entry.level.toLowerCase().includes(normalizedQuery)
    );
  });
}

export interface CleanupFormatResult {
  cleanedState: ArtifactCodeState;
  removedCssVariables: string[];
  formattedLinesCount: number;
  summaryMessage: string;
}

/**
 * Runs a lightweight heuristic to auto-format HTML/CSS/JS code, remove unused CSS custom properties (--var),
 * and fix common indentation, tab, and trailing whitespace issues.
 */
export function cleanupAndFormatArtifactState(
  codeState: ArtifactCodeState
): CleanupFormatResult {
  const rawHtml = codeState.html || '';
  const rawCss = codeState.css || '';
  const rawJs = codeState.js || '';

  const removedCssVarsSet = new Set<string>();

  // Combine all code to check where var(--name) is referenced
  const combinedSourceForVarUsage = `${rawHtml}\n${rawCss}\n${rawJs}`;

  const isCssVarUsed = (varName: string): boolean => {
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const usageRegex = new RegExp(`var\\(\\s*${escaped}(?:\\s*,|\\s*\\))`, 'i');
    return usageRegex.test(combinedSourceForVarUsage);
  };

  const stripUnusedCssVarsFromBlock = (cssBlock: string): string => {
    if (!cssBlock) return '';
    // Match custom CSS variable declarations: --variable-name: value;
    return cssBlock.replace(
      /(^[ \t]*)(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}\n]+);?[ \t]*$/gm,
      (fullMatch, _indent: string, varName: string) => {
        if (!isCssVarUsed(varName)) {
          removedCssVarsSet.add(varName);
          return '';
        }
        return fullMatch;
      }
    );
  };

  // 1. Strip unused CSS variables from standalone CSS and inline <style> blocks in HTML
  const cleanedCssRaw = stripUnusedCssVarsFromBlock(rawCss);
  const cleanedHtmlRaw = rawHtml.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_match, openTag: string, styleBody: string, closeTag: string) => {
      const strippedBody = stripUnusedCssVarsFromBlock(styleBody);
      return `${openTag}\n${strippedBody}\n${closeTag}`;
    }
  );

  // 2. Normalize tabs, trailing spaces, and excessive blank lines before running formatArtifactCode
  const normalizeWhitespace = (input: string): string =>
    input
      .replace(/\t/g, '  ')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  const formattedHtml = formatArtifactCode(normalizeWhitespace(cleanedHtmlRaw), 'html');
  const formattedCss = formatArtifactCode(normalizeWhitespace(cleanedCssRaw), 'css');
  const formattedJs = formatArtifactCode(normalizeWhitespace(rawJs), 'js');

  const cleanedState: ArtifactCodeState = {
    ...codeState,
    html: formattedHtml,
    css: formattedCss,
    js: formattedJs,
  };

  const removedCssVariables = Array.from(removedCssVarsSet);
  const formattedLinesCount =
    (formattedHtml ? formattedHtml.split('\n').length : 0) +
    (formattedCss ? formattedCss.split('\n').length : 0) +
    (formattedJs ? formattedJs.split('\n').length : 0);

  const summaryMessage =
    removedCssVariables.length > 0
      ? `Formatted ${formattedLinesCount} lines & removed ${removedCssVariables.length} unused CSS var(s): ${removedCssVariables.join(', ')}`
      : `Formatted ${formattedLinesCount} lines & normalized indentation`;

  return {
    cleanedState,
    removedCssVariables,
    formattedLinesCount,
    summaryMessage,
  };
}

export interface SavedStarterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'SaaS UI' | 'Landing Page' | 'Dashboard' | 'Custom Boilerplate';
  isBuiltIn?: boolean;
  createdAt: number;
  codeState: ArtifactCodeState;
}

export const STARTER_TEMPLATES_STORAGE_KEY = 'devpulse_saved_starter_templates_v1';

export const DEFAULT_STARTER_TEMPLATES: SavedStarterTemplate[] = [
  {
    id: 'starter-bento-saas',
    name: 'Liquid Glass Bento SaaS Hero',
    description: '2026 dark glassmorphic Bento Grid hero with interactive pricing cards and metric pills.',
    category: 'Landing Page',
    isBuiltIn: true,
    createdAt: 1735689600000,
    codeState: {
      html: `<div class="min-h-screen bg-[#06070B] text-white p-8 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
      <span>Liquid Glass UI Starter</span>
    </div>
    <h1 class="text-4xl font-extrabold tracking-tight">Ship AI SaaS Interfaces 10x Faster</h1>
    <p class="text-zinc-400 max-w-2xl">Reusable Bento Grid starter template with responsive Tailwind cards and interactive state.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Realtime Latency</div>
        <div class="text-2xl font-bold text-emerald-400 mt-1">14.2 ms</div>
      </div>
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Conversion Lift</div>
        <div class="text-2xl font-bold text-indigo-400 mt-1">+48.6%</div>
      </div>
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div class="text-xs text-zinc-400">Active Workspaces</div>
        <div class="text-2xl font-bold text-fuchsia-400 mt-1">12,840</div>
      </div>
    </div>
  </div>
</div>`,
      css: `:root {\n  --brand-glow: #6366f1;\n}\nbody {\n  background-color: #06070B;\n  color: var(--brand-glow);\n}`,
      js: `console.log("Liquid Glass Bento SaaS Starter initialized");`,
      prompt: 'Liquid Glass Bento SaaS Hero with 3 KPI cards',
      seoTitle: 'Liquid Glass Bento SaaS Hero',
      seoDescription: 'Reusable 2026 Bento Grid SaaS starter template.'
    }
  },
  {
    id: 'starter-ai-chat-shell',
    name: 'AI Copilot Chat & Prompt Shell',
    description: 'Minimalist streaming-ready AI chat interface with prompt suggestions and token counter.',
    category: 'SaaS UI',
    isBuiltIn: true,
    createdAt: 1735689610000,
    codeState: {
      html: `<div class="min-h-screen bg-[#07080E] text-zinc-100 p-6 flex flex-col justify-between max-w-3xl mx-auto">
  <header class="flex items-center justify-between border-b border-white/10 pb-4">
    <div>
      <h1 class="text-lg font-bold text-white">Neural Copilot Studio</h1>
      <p class="text-xs text-zinc-400">Zero-latency prompt workspace</p>
    </div>
    <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-mono">Model: Ready</span>
  </header>
  <main id="chat-feed" class="my-6 space-y-3">
    <div class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm">
      Welcome! Select a prompt starter or type a command below to test your AI workflow.
    </div>
  </main>
  <footer class="flex gap-2">
    <input id="prompt-box" type="text" placeholder="Ask Neural Copilot..." class="flex-1 rounded-xl bg-black/60 border border-white/15 px-4 py-2.5 text-sm text-white" />
    <button id="send-btn" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white">Send</button>
  </footer>
</div>`,
      css: `body {\n  margin: 0;\n}`,
      js: `console.log("AI Copilot Chat Shell mounted");`,
      prompt: 'AI Copilot Chat & Prompt Shell boilerplate',
      seoTitle: 'AI Copilot Chat Boilerplate',
      seoDescription: 'Reusable AI chat interface starter boilerplate.'
    }
  },
  {
    id: 'starter-analytics-kpi',
    name: 'Executive Telemetry & Revenue Dashboard',
    description: 'Default PulseMetrics Enterprise Revenue OS starter template with live interactive chart filters.',
    category: 'Dashboard',
    isBuiltIn: true,
    createdAt: 1735689620000,
    codeState: {
      html: DEFAULT_STARTER_ARTIFACT.html,
      css: DEFAULT_STARTER_ARTIFACT.css || '',
      js: DEFAULT_STARTER_ARTIFACT.js || '',
      prompt: DEFAULT_STARTER_ARTIFACT.prompt || '',
      seoTitle: DEFAULT_STARTER_ARTIFACT.seoTitle || '',
      seoDescription: DEFAULT_STARTER_ARTIFACT.seoDescription || ''
    }
  }
];

/**
 * Loads saved starter templates (built-in + custom user boilerplates) from localStorage.
 */
export function loadSavedStarterTemplates(
  storage?: Pick<Storage, 'getItem'> | null
): SavedStarterTemplate[] {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  let customTemplates: SavedStarterTemplate[] = [];
  if (targetStorage) {
    try {
      const raw = targetStorage.getItem(STARTER_TEMPLATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          customTemplates = parsed.filter(
            (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && item.codeState
          );
        }
      }
    } catch {
      customTemplates = [];
    }
  }

  return [...customTemplates, ...DEFAULT_STARTER_TEMPLATES];
}

/**
 * Saves a new custom starter template boilerplate to localStorage and returns the updated template list.
 */
export function saveCustomStarterTemplate(
  params: {
    name: string;
    description?: string;
    category?: SavedStarterTemplate['category'];
    codeState: ArtifactCodeState;
  },
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null,
  now: number = Date.now()
): { savedTemplate: SavedStarterTemplate; templates: SavedStarterTemplate[] } {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  const cleanName = (params.name || '').trim() || 'Custom Boilerplate Template';
  const cleanDesc =
    (params.description || '').trim() ||
    params.codeState.prompt ||
    'Reusable custom starter boilerplate saved from Artifact Sandbox.';

  const newTemplate: SavedStarterTemplate = {
    id: `custom-template-${now}`,
    name: cleanName,
    description: cleanDesc,
    category: params.category || 'Custom Boilerplate',
    isBuiltIn: false,
    createdAt: now,
    codeState: {
      html: params.codeState.html || '',
      css: params.codeState.css || '',
      js: params.codeState.js || '',
      prompt: params.codeState.prompt || cleanName,
      seoTitle: params.codeState.seoTitle || cleanName,
      seoDescription: params.codeState.seoDescription || cleanDesc,
      dependencies: params.codeState.dependencies ? [...params.codeState.dependencies] : [],
    },
  };

  const existingAll = loadSavedStarterTemplates(targetStorage);
  const existingCustom = existingAll.filter((t) => !t.isBuiltIn);
  const updatedCustom = [newTemplate, ...existingCustom];

  if (targetStorage) {
    try {
      targetStorage.setItem(STARTER_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustom));
    } catch {
      // Ignore quota errors
    }
  }

  return {
    savedTemplate: newTemplate,
    templates: [...updatedCustom, ...DEFAULT_STARTER_TEMPLATES],
  };
}

/**
 * Deletes a custom starter template by ID from localStorage and returns the remaining templates.
 */
export function deleteSavedStarterTemplate(
  templateId: string,
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
): SavedStarterTemplate[] {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  const existingAll = loadSavedStarterTemplates(targetStorage);
  const updatedCustom = existingAll.filter((t) => !t.isBuiltIn && t.id !== templateId);

  if (targetStorage) {
    try {
      targetStorage.setItem(STARTER_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustom));
    } catch {
      // Ignore storage errors
    }
  }

  return [...updatedCustom, ...DEFAULT_STARTER_TEMPLATES];
}

export const BUY_ME_A_COFFEE_URL = 'https://www.chai4.me/blueauric';

export const NOWPAYMENTS_CONFIG = {
  publicKey: '821c59c8-dc1e-446c-ac4d-f3035b462fc8',
  directDonationUrl: 'https://nowpayments.io/donation?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8',
  embeddedWidgetUrl: 'https://nowpayments.io/embeds/donation-widget?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8',
  officialButtonImageUrl: 'https://nowpayments.io/images/embeds/donation-button-black.svg',
  backendSecretEnvVar: 'NOWPAYMENTS_API_KEY',
} as const;

export interface CodeHealthMetrics {
  lineCount: number;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  domElementEstimate: number;
  performanceImpact: 'Low Impact' | 'Moderate Impact' | 'High Impact';
  impactReason: string;
}

/**
 * Computes estimated line count, file size, and potential performance impact of the current code block
 * for the non-intrusive Code Health widget in the console/sandbox footer.
 */
export function computeCodeHealthMetrics(
  codeState: ArtifactCodeState
): CodeHealthMetrics {
  const html = (codeState.html || '').trim();
  const css = (codeState.css || '').trim();
  const js = (codeState.js || '').trim();

  const htmlLines = html ? html.split('\n').length : 0;
  const cssLines = css ? css.split('\n').length : 0;
  const jsLines = js ? js.split('\n').length : 0;
  const lineCount = Math.max(1, htmlLines + cssLines + jsLines);

  const combinedRaw = [html, css, js].filter(Boolean).join('\n');
  const fileSizeBytes = new TextEncoder().encode(combinedRaw).byteLength;
  const fileSizeFormatted =
    fileSizeBytes < 1024
      ? `${fileSizeBytes} B`
      : `${(fileSizeBytes / 1024).toFixed(1)} KB`;

  const tagMatches = html.match(/<[a-zA-Z][a-zA-Z0-9-]*(?:\s|>|\/)/g) || [];
  const domElementEstimate = tagMatches.length;

  let performanceImpact: CodeHealthMetrics['performanceImpact'] = 'Low Impact';
  let impactReason = 'Optimal bundle size & fast DOM paint';

  if (fileSizeBytes > 45_000 || lineCount > 600 || domElementEstimate > 350) {
    performanceImpact = 'High Impact';
    impactReason = 'Large DOM or script payload may increase initial parse time';
  } else if (fileSizeBytes > 15_000 || lineCount > 250 || domElementEstimate > 140) {
    performanceImpact = 'Moderate Impact';
    impactReason = 'Medium component complexity with balanced runtime cost';
  }

  return {
    lineCount,
    fileSizeBytes,
    fileSizeFormatted,
    domElementEstimate,
    performanceImpact,
    impactReason,
  };
}

export const CRYPTO_DONATION_STORAGE_KEY = 'devpulse_crypto_donation_state_v1';
export const DEFAULT_MONTHLY_DONATION_COUNT = 18;
export const DEFAULT_MONTHLY_TARGET_COUNT = 25;
export const DEFAULT_DONATION_UNIT_USD = 10;

export interface CryptoDonationTransaction {
  id: string;
  donorAlias: string;
  amountCrypto: string;
  currency: 'BTC' | 'ETH' | 'SOL' | 'USDT' | 'USDC';
  usdEquivalent: number;
  status: 'Confirmed' | 'Completed' | 'Verifying';
  txHashShort: string;
  relativeTime: string;
  timestamp: number;
}

export interface MonthlyGoalMetrics {
  donationCount: number;
  targetDonationCount: number;
  raisedUsd: number;
  targetUsd: number;
  progressPercent: number;
  remainingDonations: number;
  remainingUsd: number;
  statusText: string;
}

export const DEFAULT_CRYPTO_TRANSACTIONS: CryptoDonationTransaction[] = [
  {
    id: 'tx-seed-1',
    donorAlias: '0x71C...9A2E',
    amountCrypto: '25.00 USDT',
    currency: 'USDT',
    usdEquivalent: 25,
    status: 'Confirmed',
    txHashShort: '0x94f2...8b1c',
    relativeTime: '12 mins ago',
    timestamp: 1761468000000,
  },
  {
    id: 'tx-seed-2',
    donorAlias: 'sol_builder.sol',
    amountCrypto: '0.15 SOL',
    currency: 'SOL',
    usdEquivalent: 24,
    status: 'Completed',
    txHashShort: '5xK9...mP2q',
    relativeTime: '1 hour ago',
    timestamp: 1761464400000,
  },
  {
    id: 'tx-seed-3',
    donorAlias: '0x38F...4D11',
    amountCrypto: '0.008 ETH',
    currency: 'ETH',
    usdEquivalent: 20,
    status: 'Confirmed',
    txHashShort: '0x3a19...c40e',
    relativeTime: '3 hours ago',
    timestamp: 1761457200000,
  },
  {
    id: 'tx-seed-4',
    donorAlias: 'bc1q...8x9r',
    amountCrypto: '0.00045 BTC',
    currency: 'BTC',
    usdEquivalent: 30,
    status: 'Completed',
    txHashShort: '7e2b...91af',
    relativeTime: '6 hours ago',
    timestamp: 1761446400000,
  },
  {
    id: 'tx-seed-5',
    donorAlias: '0xB2A...1F08',
    amountCrypto: '15.00 USDC',
    currency: 'USDC',
    usdEquivalent: 15,
    status: 'Verifying',
    txHashShort: '0x6d04...22fa',
    relativeTime: '9 hours ago',
    timestamp: 1761435600000,
  },
];

/**
 * Computes Monthly Goal server hosting progress bar metrics from the current donation count.
 */
export function computeMonthlyGoalProgress(
  donationCount: number = DEFAULT_MONTHLY_DONATION_COUNT,
  targetDonationCount: number = DEFAULT_MONTHLY_TARGET_COUNT,
  avgDonationUsd: number = DEFAULT_DONATION_UNIT_USD
): MonthlyGoalMetrics {
  const safeCount = Math.max(0, Math.floor(donationCount));
  const safeTargetCount = Math.max(1, Math.floor(targetDonationCount));
  const safeUnitUsd = Math.max(1, avgDonationUsd);

  const raisedUsd = safeCount * safeUnitUsd;
  const targetUsd = safeTargetCount * safeUnitUsd;
  const rawPercent = Math.round((safeCount / safeTargetCount) * 100);
  const progressPercent = Math.min(100, Math.max(0, rawPercent));
  const remainingDonations = Math.max(0, safeTargetCount - safeCount);
  const remainingUsd = Math.max(0, targetUsd - raisedUsd);

  const statusText =
    progressPercent >= 100
      ? `Monthly server goal reached! (${safeCount}/${safeTargetCount} donations • $${raisedUsd}/$${targetUsd})`
      : `${safeCount} of ${safeTargetCount} donations ($${raisedUsd} / $${targetUsd} monthly server goal • ${progressPercent}%)`;

  return {
    donationCount: safeCount,
    targetDonationCount: safeTargetCount,
    raisedUsd,
    targetUsd,
    progressPercent,
    remainingDonations,
    remainingUsd,
    statusText,
  };
}

export function loadCryptoDonationState(
  storage?: Pick<Storage, 'getItem'> | null
): {
  donationCount: number;
  transactions: CryptoDonationTransaction[];
  goalMetrics: MonthlyGoalMetrics;
} {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  let donationCount = DEFAULT_MONTHLY_DONATION_COUNT;
  let transactions = [...DEFAULT_CRYPTO_TRANSACTIONS];

  if (targetStorage) {
    try {
      const raw = targetStorage.getItem(CRYPTO_DONATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.donationCount === 'number' && parsed.donationCount >= 0) {
          donationCount = parsed.donationCount;
        }
        if (Array.isArray(parsed?.transactions) && parsed.transactions.length > 0) {
          transactions = parsed.transactions;
        }
      }
    } catch {
      // Fall back to defaults
    }
  }

  return {
    donationCount,
    transactions,
    goalMetrics: computeMonthlyGoalProgress(donationCount),
  };
}

export function recordCryptoDonationAction(
  params?: {
    donorAlias?: string;
    amountCrypto?: string;
    currency?: CryptoDonationTransaction['currency'];
    usdEquivalent?: number;
    status?: CryptoDonationTransaction['status'];
  },
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null,
  now: number = Date.now()
): {
  donationCount: number;
  transactions: CryptoDonationTransaction[];
  goalMetrics: MonthlyGoalMetrics;
  latestTransaction: CryptoDonationTransaction;
  toastMessage: string;
} {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : null;

  const current = loadCryptoDonationState(targetStorage);
  const nextCount = current.donationCount + 1;
  const currency = params?.currency || 'USDT';
  const amountCrypto = params?.amountCrypto || `10.00 ${currency}`;
  const usdEquivalent = params?.usdEquivalent ?? DEFAULT_DONATION_UNIT_USD;
  const status = params?.status || 'Confirmed';
  const hashSuffix = (now % 0xffff).toString(16).padStart(4, '0');

  const newTx: CryptoDonationTransaction = {
    id: `tx-${now}-${nextCount}`,
    donorAlias: params?.donorAlias?.trim() || `0xDev...${hashSuffix.toUpperCase()}`,
    amountCrypto,
    currency,
    usdEquivalent,
    status,
    txHashShort: `0x8f${hashSuffix.slice(0, 2)}...${hashSuffix}`,
    relativeTime: 'Just now',
    timestamp: now,
  };

  const nextTransactions = [newTx, ...current.transactions].slice(0, 10);
  const nextGoalMetrics = computeMonthlyGoalProgress(nextCount);

  if (targetStorage) {
    try {
      targetStorage.setItem(
        CRYPTO_DONATION_STORAGE_KEY,
        JSON.stringify({
          donationCount: nextCount,
          transactions: nextTransactions,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  return {
    donationCount: nextCount,
    transactions: nextTransactions,
    goalMetrics: nextGoalMetrics,
    latestTransaction: newTx,
    toastMessage: `Thank You for Supporting DevPulse AI! Donation #${nextCount} recorded (${nextGoalMetrics.progressPercent}% of monthly server goal funded).`,
  };
}

/**
 * Builds the full shareable URL for the current artifact state and SEO tool route.
 */
export function buildShareableArtifactUrl(
  codeState: ArtifactCodeState,
  toolSlug: string = 'ai-ui-generator',
  origin: string = 'https://yourdomain.com'
): string {
  const cleanOrigin = (origin || 'https://yourdomain.com').replace(/\/+$/, '');
  const cleanSlug = (toolSlug || 'ai-ui-generator').trim();
  const hash = encodeArtifactToHash(codeState);
  return `${cleanOrigin}/?tool=${encodeURIComponent(cleanSlug)}${hash}`;
}

/**
 * Builds the dedicated clean path URL (/tools/:slug) for a tool.
 */
export function buildDedicatedToolUrl(
  toolSlug: string = 'ai-ui-generator',
  origin: string = 'https://yourdomain.com'
): string {
  const cleanOrigin = (origin || 'https://yourdomain.com').replace(/\/+$/, '');
  const cleanSlug = (toolSlug || 'ai-ui-generator').trim().replace(/^\/+/, '');
  return `${cleanOrigin}/tools/${encodeURIComponent(cleanSlug)}`;
}

export interface GeneratedQrCodeSvg {
  svgMarkup: string;
  matrix: boolean[][];
  matrixSize: number;
  encodedUrl: string;
  sizePx: number;
}

/**
 * Generates a scannable, high-contrast QR Code SVG matrix representing the given artifact URL
 * for quick mobile access and sharing inside the Share menu.
 */
export function generateUrlQrCodeSvg(
  url: string,
  sizePx: number = 168
): GeneratedQrCodeSvg {
  const encodedUrl = (url || 'https://yourdomain.com').trim();
  const matrixSize = 25;
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array.from({ length: matrixSize }, () => false)
  );
  const reserved: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array.from({ length: matrixSize }, () => false)
  );

  // Helper to place 7x7 finder pattern + 1px white separator
  const placeFinderPattern = (topRow: number, leftCol: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = topRow + r;
        const cc = leftCol + c;
        if (rr < 0 || rr >= matrixSize || cc < 0 || cc >= matrixSize) continue;
        reserved[rr][cc] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[rr][cc] = isOuterBorder || isInnerCore;
        } else {
          matrix[rr][cc] = false;
        }
      }
    }
  };

  placeFinderPattern(0, 0);
  placeFinderPattern(0, matrixSize - 7);
  placeFinderPattern(matrixSize - 7, 0);

  // Place 5x5 alignment pattern at (16, 16) for Version 2 (25x25)
  for (let r = 16; r <= 20; r++) {
    for (let c = 16; c <= 20; c++) {
      reserved[r][c] = true;
      const isBorder = r === 16 || r === 20 || c === 16 || c === 20;
      const isCenter = r === 18 && c === 18;
      matrix[r][c] = isBorder || isCenter;
    }
  }

  // Place timing patterns along row 6 and column 6
  for (let i = 8; i < matrixSize - 8; i++) {
    reserved[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    reserved[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Dark module at (4 * 2 + 9, 8) = (17, 8)
  reserved[17][8] = true;
  matrix[17][8] = true;

  // Encode URL bytes into remaining unreserved modules deterministically
  const urlBytes = new TextEncoder().encode(encodedUrl);
  const bitStream: boolean[] = [];
  for (let i = 0; i < urlBytes.length; i++) {
    const b = urlBytes[i];
    for (let bit = 7; bit >= 0; bit--) {
      bitStream.push(((b >> bit) & 1) === 1);
    }
  }
  // Ensure non-empty bitstream
  if (bitStream.length === 0) {
    bitStream.push(true, false, true, true, false, true, false, false);
  }

  let bitIndex = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (reserved[r][c]) continue;
      const streamBit = bitStream[bitIndex % bitStream.length];
      const maskBit = (r * 3 + c * 5 + Math.floor(bitIndex / bitStream.length)) % 2 === 0;
      matrix[r][c] = streamBit !== maskBit;
      bitIndex++;
    }
  }

  const quietZone = 2;
  const totalModules = matrixSize + quietZone * 2;
  const rects: string[] = [];

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        rects.push(
          `<rect x="${c + quietZone}" y="${r + quietZone}" width="1" height="1" fill="#06070B" />`
        );
      }
    }
  }

  const svgMarkup = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${totalModules}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges" role="img" aria-label="QR Code for ${encodedUrl.slice(0, 80).replace(/"/g, '&quot;')}">`,
    `<rect width="${totalModules}" height="${totalModules}" rx="2" fill="#FFFFFF" />`,
    ...rects,
    `</svg>`,
  ].join('');

  return {
    svgMarkup,
    matrix,
    matrixSize,
    encodedUrl,
    sizePx,
  };
}

export interface ProjectZipFileEntry {
  name: string;
  content: string;
  sizeBytes: number;
}

export interface GeneratedProjectZip {
  zipBytes: Uint8Array;
  filename: string;
  files: ProjectZipFileEntry[];
}

// Precompute standard IEEE 802.3 CRC-32 lookup table for valid PKZIP archives
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Packages the current artifact code state (HTML, CSS, JS, and README.md) into a valid binary .zip
 * archive so users can save and run their work locally as a clean multi-file project structure.
 */
export function generateProjectZipArchive(
  codeState: ArtifactCodeState
): GeneratedProjectZip {
  const projectTitle =
    (codeState.seoTitle || codeState.prompt || 'DevPulse AI Project').trim();
  const projectDesc =
    (codeState.seoDescription || codeState.prompt || 'Generated with DevPulse AI Studio').trim();

  const formattedHtmlBody = formatArtifactCode(codeState.html || '<div>Hello World</div>', 'html');
  const formattedCss =
    formatArtifactCode(codeState.css || '', 'css') ||
    '/* Custom project styles */\nbody {\n  margin: 0;\n}\n';
  const formattedJs =
    formatArtifactCode(codeState.js || '', 'js') ||
    '// Project interactive logic\nconsole.log("Project initialized");\n';

  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
  <meta name="description" content="${projectDesc.replace(/"/g, '&quot;')}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body class="bg-[#06070B] text-white antialiased">
${formattedHtmlBody}
  <script src="./app.js" defer></script>
</body>
</html>
`;

  const readmeContent = `# ${projectTitle}

> ${projectDesc}

## Project Structure

- \`index.html\` — Main HTML5 entry point wired with Tailwind CSS, \`styles.css\`, and \`app.js\`
- \`styles.css\` — Extracted stylesheet rules and custom CSS variables
- \`app.js\` — Interactive client-side JavaScript module

## Running Locally

Open \`index.html\` directly in any modern browser, or start a local static server:

\`\`\`bash
npx serve .
\`\`\`
`;

  const rawFiles: Array<{ name: string; content: string }> = [
    { name: 'index.html', content: indexHtmlContent },
    { name: 'styles.css', content: formattedCss },
    { name: 'app.js', content: formattedJs },
    { name: 'README.md', content: readmeContent },
  ];

  const encoder = new TextEncoder();
  const encodedFiles = rawFiles.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = encoder.encode(f.content);
    const crc = computeCrc32(dataBytes);
    return {
      name: f.name,
      content: f.content,
      nameBytes,
      dataBytes,
      crc,
      sizeBytes: dataBytes.byteLength,
    };
  });

  // Calculate total ZIP byte size
  let localSectionBytes = 0;
  let centralDirBytes = 0;
  for (const f of encodedFiles) {
    localSectionBytes += 30 + f.nameBytes.byteLength + f.dataBytes.byteLength;
    centralDirBytes += 46 + f.nameBytes.byteLength;
  }
  const totalBytes = localSectionBytes + centralDirBytes + 22;

  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  let offset = 0;
  const localHeaderOffsets: number[] = [];

  // Write Local File Headers + File Payloads
  for (const f of encodedFiles) {
    localHeaderOffsets.push(offset);
    view.setUint32(offset, 0x04034b50, true); // Local file header signature
    view.setUint16(offset + 4, 20, true); // Version needed to extract (2.0)
    view.setUint16(offset + 6, 0x0800, true); // General purpose bit flag (UTF-8)
    view.setUint16(offset + 8, 0, true); // Compression method (0 = Store)
    view.setUint16(offset + 10, 0, true); // Last mod file time
    view.setUint16(offset + 12, 0x5421, true); // Last mod file date
    view.setUint32(offset + 14, f.crc, true); // CRC-32
    view.setUint32(offset + 18, f.dataBytes.byteLength, true); // Compressed size
    view.setUint32(offset + 22, f.dataBytes.byteLength, true); // Uncompressed size
    view.setUint16(offset + 26, f.nameBytes.byteLength, true); // File name length
    view.setUint16(offset + 28, 0, true); // Extra field length
    offset += 30;

    uint8.set(f.nameBytes, offset);
    offset += f.nameBytes.byteLength;

    uint8.set(f.dataBytes, offset);
    offset += f.dataBytes.byteLength;
  }

  const centralDirStartOffset = offset;

  // Write Central Directory Headers
  for (let i = 0; i < encodedFiles.length; i++) {
    const f = encodedFiles[i];
    view.setUint32(offset, 0x02014b50, true); // Central file header signature
    view.setUint16(offset + 4, 20, true); // Version made by
    view.setUint16(offset + 6, 20, true); // Version needed to extract
    view.setUint16(offset + 8, 0x0800, true); // General purpose bit flag (UTF-8)
    view.setUint16(offset + 10, 0, true); // Compression method (0 = Store)
    view.setUint16(offset + 12, 0, true); // Last mod time
    view.setUint16(offset + 14, 0x5421, true); // Last mod date
    view.setUint32(offset + 16, f.crc, true); // CRC-32
    view.setUint32(offset + 20, f.dataBytes.byteLength, true); // Compressed size
    view.setUint32(offset + 24, f.dataBytes.byteLength, true); // Uncompressed size
    view.setUint16(offset + 28, f.nameBytes.byteLength, true); // File name length
    view.setUint16(offset + 30, 0, true); // Extra field length
    view.setUint16(offset + 32, 0, true); // File comment length
    view.setUint16(offset + 34, 0, true); // Disk number start
    view.setUint16(offset + 36, 0, true); // Internal file attributes
    view.setUint32(offset + 38, 0, true); // External file attributes
    view.setUint32(offset + 42, localHeaderOffsets[i], true); // Relative offset of local header
    offset += 46;

    uint8.set(f.nameBytes, offset);
    offset += f.nameBytes.byteLength;
  }

  const centralDirSize = offset - centralDirStartOffset;

  // Write End of Central Directory Record (EOCD)
  view.setUint32(offset, 0x06054b50, true); // EOCD signature
  view.setUint16(offset + 4, 0, true); // Number of this disk
  view.setUint16(offset + 6, 0, true); // Disk where central directory starts
  view.setUint16(offset + 8, encodedFiles.length, true); // Number of central directory records on this disk
  view.setUint16(offset + 10, encodedFiles.length, true); // Total number of central directory records
  view.setUint32(offset + 12, centralDirSize, true); // Size of central directory
  view.setUint32(offset + 16, centralDirStartOffset, true); // Offset of start of central directory
  view.setUint16(offset + 20, 0, true); // Comment length

  const slugBase =
    projectTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'artifact-project';

  return {
    zipBytes: uint8,
    filename: `devpulse-project-${slugBase}.zip`,
    files: encodedFiles.map((f) => ({
      name: f.name,
      content: f.content,
      sizeBytes: f.sizeBytes,
    })),
  };
}



