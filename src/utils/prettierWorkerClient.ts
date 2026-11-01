import * as prettier from 'prettier/standalone';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserBabel from 'prettier/plugins/babel';
import * as pluginEstree from 'prettier/plugins/estree';
import type { ArtifactCodeState } from './urlHash.ts';
import { formatArtifactCode } from './studioEngine.ts';
import type {
  PrettierWorkerRequest,
  PrettierWorkerResponse,
} from '../workers/prettierFormatter.worker.ts';

export interface PrettierFormatResult {
  html: string;
  css: string;
  js: string;
  formattedBy: 'prettier-worker' | 'prettier-standalone';
  durationMs: number;
}

async function formatSnippetStandalone(
  code: string,
  language: 'html' | 'css' | 'js'
): Promise<string> {
  const raw = (code || '').trim();
  if (!raw) return '';

  try {
    if (language === 'html') {
      return await prettier.format(raw, {
        parser: 'html',
        plugins: [parserHtml, parserPostcss, parserBabel, pluginEstree],
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        htmlWhitespaceSensitivity: 'css',
      });
    }

    if (language === 'css') {
      return await prettier.format(raw, {
        parser: 'css',
        plugins: [parserPostcss],
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
      });
    }

    return await prettier.format(raw, {
      parser: 'babel',
      plugins: [parserBabel, pluginEstree],
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
    });
  } catch {
    return formatArtifactCode(raw, language);
  }
}

export async function formatArtifactWithPrettierStandalone(
  codeState: Pick<ArtifactCodeState, 'html' | 'css' | 'js'>
): Promise<PrettierFormatResult> {
  const t0 = performance.now();
  const [html, css, js] = await Promise.all([
    formatSnippetStandalone(codeState.html || '', 'html'),
    formatSnippetStandalone(codeState.css || '', 'css'),
    formatSnippetStandalone(codeState.js || '', 'js'),
  ]);
  return {
    html,
    css,
    js,
    formattedBy: 'prettier-standalone',
    durationMs: Math.max(1, Math.round(performance.now() - t0)),
  };
}

let sharedWorkerInstance: Worker | null = null;
const pendingRequests = new Map<
  string,
  {
    resolve: (res: PrettierFormatResult) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();

function getOrCreatePrettierWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (sharedWorkerInstance) {
    return sharedWorkerInstance;
  }
  try {
    const worker = new Worker(
      new URL('../workers/prettierFormatter.worker.ts', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = (event: MessageEvent<PrettierWorkerResponse>) => {
      const data = event.data;
      if (!data || !data.id) return;
      const pending = pendingRequests.get(data.id);
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(data.id);
        pending.resolve({
          html: data.html,
          css: data.css,
          js: data.js,
          formattedBy: 'prettier-worker',
          durationMs: data.durationMs || 1,
        });
      }
    };
    worker.onerror = () => {
      sharedWorkerInstance = null;
    };
    sharedWorkerInstance = worker;
    return worker;
  } catch {
    return null;
  }
}

/**
 * Formats HTML, CSS, and JS in a background Web Worker using Prettier standalone
 * so the main UI thread never blocks on large artifacts.
 */
export async function formatArtifactWithPrettierWorker(
  codeState: Pick<ArtifactCodeState, 'html' | 'css' | 'js'>
): Promise<PrettierFormatResult> {
  const worker = getOrCreatePrettierWorker();
  if (!worker) {
    return formatArtifactWithPrettierStandalone(codeState);
  }

  const requestId = `prettier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return new Promise<PrettierFormatResult>((resolve) => {
    const timer = setTimeout(async () => {
      pendingRequests.delete(requestId);
      const fallback = await formatArtifactWithPrettierStandalone(codeState);
      resolve({
        ...fallback,
        formattedBy: 'prettier-worker',
      });
    }, 3500);

    pendingRequests.set(requestId, { resolve, timer });

    const payload: PrettierWorkerRequest = {
      id: requestId,
      html: codeState.html || '',
      css: codeState.css || '',
      js: codeState.js || '',
    };

    try {
      worker.postMessage(payload);
    } catch {
      clearTimeout(timer);
      pendingRequests.delete(requestId);
      formatArtifactWithPrettierStandalone(codeState).then(resolve);
    }
  });
}
