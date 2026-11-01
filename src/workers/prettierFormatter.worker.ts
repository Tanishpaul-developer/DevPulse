import * as prettier from 'prettier/standalone';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserBabel from 'prettier/plugins/babel';
import * as pluginEstree from 'prettier/plugins/estree';
import { formatArtifactCode } from '../utils/studioEngine';

export interface PrettierWorkerRequest {
  id: string;
  html: string;
  css: string;
  js: string;
}

export interface PrettierWorkerResponse {
  id: string;
  ok: boolean;
  html: string;
  css: string;
  js: string;
  formattedBy: 'prettier-worker';
  durationMs: number;
  error?: string;
}

async function formatSingleSnippet(
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

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<PrettierWorkerRequest>) => void) | null;
  postMessage: (message: PrettierWorkerResponse) => void;
};

workerScope.onmessage = async (event: MessageEvent<PrettierWorkerRequest>) => {
  const t0 = performance.now();
  const { id, html = '', css = '', js = '' } = event.data || {
    id: 'unknown',
    html: '',
    css: '',
    js: '',
  };

  try {
    const [formattedHtml, formattedCss, formattedJs] = await Promise.all([
      formatSingleSnippet(html, 'html'),
      formatSingleSnippet(css, 'css'),
      formatSingleSnippet(js, 'js'),
    ]);

    workerScope.postMessage({
      id,
      ok: true,
      html: formattedHtml,
      css: formattedCss,
      js: formattedJs,
      formattedBy: 'prettier-worker',
      durationMs: Math.max(1, Math.round(performance.now() - t0)),
    });
  } catch (err) {
    workerScope.postMessage({
      id,
      ok: false,
      html: formatArtifactCode(html, 'html'),
      css: css ? formatArtifactCode(css, 'css') : '',
      js: js ? formatArtifactCode(js, 'js') : '',
      formattedBy: 'prettier-worker',
      durationMs: Math.max(1, Math.round(performance.now() - t0)),
      error: err instanceof Error ? err.message : 'Worker formatting fallback applied',
    });
  }
};
