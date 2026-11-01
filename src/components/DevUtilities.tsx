import React, { useState, useMemo, useEffect } from 'react';
import {
  FileJson,
  FileCode2,
  Bug,
  Palette,
  Hash,
  Clock,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Download,
  Globe,
  Regex,
  Database,
  ShieldCheck,
  FileText,
  Send,
  Table,
  FileCode,
  Calculator
} from 'lucide-react';
import { ModelId } from '../types';
import { calculateEngineeringRoi } from '../utils/studioEngine';
import { sanitizeBrokenJson, jsonToTypeScriptInterfaces } from '../utils/jsonTools';
import { diagnoseStackTraceWithAi, generateSvgAssetWithAi } from '../services/aiRouter';
import {
  parseCurlAndConvert,
  decodeJwtToken,
  describeCronExpression,
  evaluateRegexPattern,
  generateSqlFromNaturalLanguage,
  generateReadmeMarkdown,
  generateTailwindColorScale
} from '../utils/devToolsEngine';
import { optimizeSvgAndConvertToJsx, SeoToolSlug } from '../data/seoToolsCatalog';
import { WorkspaceNavId } from './LeftSidebar';

interface DevUtilitiesProps {
  selectedModel: ModelId;
  onRequireByok: (reason?: string) => void;
  activeToolId?: WorkspaceNavId;
  activeSeoSlug?: SeoToolSlug;
  onSelectToolId?: (id: WorkspaceNavId) => void;
}

const SAMPLE_BROKEN_JSON = `\`\`\`json
{
  user_id: 94812,
  fullName: 'Ada Lovelace',
  roles: ['admin', 'architect',],
  active: true,
  metrics: {
    requestsPerMin: 420,
    region: 'us-east-1',
  },
}
\`\`\``;

const SAMPLE_STACK_TRACE = `TypeError: Cannot read properties of undefined (reading 'map')
    at UserDirectoryList (src/components/UserDirectoryList.tsx:42:29)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16305:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:20074:13)

// Context snippet:
export function UserDirectoryList({ data }) {
  return (
    <ul>
      {data.users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}`;

const SAMPLE_CURL = `curl -X POST "https://jsonplaceholder.typicode.com/posts" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer devpulse_demo_token_2026" \\
  -d '{"title": "DevPulse AI v3.5", "body": "Zero-Login Liquid Glass AI Developer OS", "userId": 1}'`;

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfZGV2cHVsc2VfOTkxIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsInJvbGUiOiJwcmluY2lwYWxfZW5naW5lZXIiLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MTg5MzQ1NjAwMH0.devpulse_signature_verified_2026';

const SAMPLE_RAW_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Exported from Figma Design System v4.2 -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill-rule="evenodd" clip-rule="evenodd" />
</svg>`;

export default function DevUtilities({
  selectedModel,
  onRequireByok,
  activeToolId = 'tool-json',
  activeSeoSlug,
  onSelectToolId
}: DevUtilitiesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. JSON & TypeScript State
  const [jsonInput, setJsonInput] = useState(SAMPLE_BROKEN_JSON);
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonMode, setJsonMode] = useState<'json' | 'ts'>('json');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 2. REST & cURL Client State
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [curlCodeTab, setCurlCodeTab] = useState<'fetch' | 'axios' | 'python'>('fetch');
  const [httpResponse, setHttpResponse] = useState<{
    status?: number;
    latencyMs?: number;
    body?: string;
    error?: string;
  } | null>(null);
  const [isSendingHttp, setIsSendingHttp] = useState(false);

  // 3. Regex & Cron State
  const [regexCronSubTab, setRegexCronSubTab] = useState<'regex' | 'cron'>('regex');
  const [regexPattern, setRegexPattern] = useState('([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)');
  const [regexFlags, setRegexFlags] = useState('gi');
  const [regexTestText, setRegexTestText] = useState(
    'Contact engineering@devpulse.ai or support@google.com for enterprise API tokens.'
  );
  const [cronInput, setCronInput] = useState('*/15 * * * *');

  // Sync sub-tab when navigated via ?tool=cron-expression or ?tool=regex-generator
  useEffect(() => {
    if (activeSeoSlug === 'cron-expression') {
      setRegexCronSubTab('cron');
    } else if (activeSeoSlug === 'regex-generator') {
      setRegexCronSubTab('regex');
    }
  }, [activeSeoSlug]);

  // 4. AI SQL Architect State
  const [sqlDialect, setSqlDialect] = useState<'postgresql' | 'mysql' | 'supabase'>('postgresql');
  const [sqlPrompt, setSqlPrompt] = useState(
    'Calculate monthly recurring revenue (MRR), active subscriptions, and top enterprise customers over the last 12 months'
  );
  const [customSqlResult, setCustomSqlResult] = useState<string | null>(null);
  const [isGeneratingSql, setIsGeneratingSql] = useState(false);

  // 5. JWT & Base64 State
  const [jwtInput, setJwtInput] = useState(SAMPLE_JWT);
  const [base64Plain, setBase64Plain] = useState('DevPulse AI v3.5 — Zero-Login Browser Storage Workspace');
  const [base64Encoded, setBase64Encoded] = useState(
    'RGV2UHVsc2UgQUkgdjMuNSAtIFplcm8tTG9naW4gQnJvd3NlciBTdG9yYWdlIFdvcmtzcGFjZQ=='
  );

  // 6. Stack Trace Auto-Healer State
  const [stackInput, setStackInput] = useState(SAMPLE_STACK_TRACE);
  const [stackOutput, setStackOutput] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // 7. AI README Generator State
  const [readmeTitle, setReadmeTitle] = useState('DevPulse AI — Developer OS');
  const [readmeSummary, setReadmeSummary] = useState(
    'A Zero-Login AI Developer Workspace, Visual Artifact Studio, and 12+ Tool Suite.'
  );
  const [readmeStack, setReadmeStack] = useState('React 19, TypeScript, Tailwind CSS 4, Express, Gemini AI');
  const [readmeFeatures, setReadmeFeatures] = useState(
    'Visual Point-and-Click DOM Inspector\nScreenshot-to-Code Vision AI Cloner\n1-Click Framework Exporter (HTML, React, Next.js, Vue 3)\nMulti-Key AI Failover Rotator'
  );

  // 8. SVG Optimizer & JSX Converter State (?tool=svg-optimizer)
  const [rawSvgInput, setRawSvgInput] = useState(SAMPLE_RAW_SVG);
  const [svgComponentName, setSvgComponentName] = useState('ZapBoltIcon');
  const [svgOutputMode, setSvgOutputMode] = useState<'jsx' | 'minified'>('jsx');
  const [aiSvgPrompt, setAiSvgPrompt] = useState('');
  const [isGeneratingAiSvg, setIsGeneratingAiSvg] = useState(false);

  // 9. Tailwind Color Scale State
  const [hexColor, setHexColor] = useState('#6366F1');

  // 10. UUID & Hash State
  const [uuids, setUuids] = useState<string[]>(() => [
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID()
  ]);
  const [hashInput, setHashInput] = useState('devpulse-zero-login-2026');
  const [sha256Output, setSha256Output] = useState('');

  // 11. Epoch Timestamp State
  const [epochInput, setEpochInput] = useState(() => Math.floor(Date.now() / 1000).toString());

  // 12. AI Asset Generator State
  const [svgPrompt, setSvgPrompt] = useState(
    'Cyberpunk isometric server rack glowing with neon indigo and emerald data streams'
  );
  const [svgCode, setSvgCode] = useState<string>(`<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="initGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>
  </defs>
  <rect width="600" height="400" rx="20" fill="url(#initGrad)" />
  <circle cx="300" cy="200" r="110" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="10 6" opacity="0.7" />
  <polygon points="300,110 385,260 215,260" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="2.5" />
  <circle cx="300" cy="210" r="22" fill="#f8fafc" />
  <text x="300" y="345" text-anchor="middle" fill="#a1a1aa" font-family="monospace" font-size="13">DEVPULSE VECTOR STUDIO READY</text>
</svg>`);
  const [isGeneratingSvg, setIsGeneratingSvg] = useState(false);

  // 13. AI Engineering ROI & Token Cost Calculator State (/tools/roi-calculator)
  const [roiDevelopersCount, setRoiDevelopersCount] = useState<number>(8);
  const [roiHourlyRateUsd, setRoiHourlyRateUsd] = useState<number>(85);
  const [roiHoursSavedPerWeek, setRoiHoursSavedPerWeek] = useState<number>(6.5);
  const [roiMonthlyPromptsPerDev, setRoiMonthlyPromptsPerDev] = useState<number>(450);

  const roiMetrics = useMemo(
    () =>
      calculateEngineeringRoi({
        developersCount: roiDevelopersCount,
        hourlyRateUsd: roiHourlyRateUsd,
        hoursSavedPerDevPerWeek: roiHoursSavedPerWeek,
        monthlyPromptsPerDev: roiMonthlyPromptsPerDev
      }),
    [roiDevelopersCount, roiHourlyRateUsd, roiHoursSavedPerWeek, roiMonthlyPromptsPerDev]
  );

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Derived states
  const parsedCurl = useMemo(() => parseCurlAndConvert(curlInput), [curlInput]);
  const decodedJwt = useMemo(() => decodeJwtToken(jwtInput), [jwtInput]);
  const regexEval = useMemo(
    () => evaluateRegexPattern(regexPattern, regexFlags, regexTestText),
    [regexPattern, regexFlags, regexTestText]
  );
  const cronEval = useMemo(() => describeCronExpression(cronInput), [cronInput]);
  const sqlEval = useMemo(
    () => generateSqlFromNaturalLanguage(sqlPrompt, sqlDialect),
    [sqlPrompt, sqlDialect]
  );
  const readmeMarkdown = useMemo(
    () =>
      generateReadmeMarkdown(
        readmeTitle,
        readmeSummary,
        readmeStack.split(',').map((s) => s.trim()).filter(Boolean),
        readmeFeatures.split('\n').map((s) => s.trim()).filter(Boolean)
      ),
    [readmeTitle, readmeSummary, readmeStack, readmeFeatures]
  );
  const svgOptimized = useMemo(
    () => optimizeSvgAndConvertToJsx(rawSvgInput, svgComponentName),
    [rawSvgInput, svgComponentName]
  );
  const colorScale = useMemo(() => generateTailwindColorScale(hexColor), [hexColor]);

  // Handlers
  const handleFixJson = () => {
    setJsonMode('json');
    const res = sanitizeBrokenJson(jsonInput);
    if (res.error) setJsonError(res.error);
    else {
      setJsonError(null);
      setJsonOutput(res.fixed);
    }
  };

  const handleConvertTs = () => {
    setJsonMode('ts');
    const res = jsonToTypeScriptInterfaces(jsonInput, 'ApiResponsePayload');
    if (res.error) setJsonError(res.error);
    else {
      setJsonError(null);
      setJsonOutput(res.interfaces);
    }
  };

  const handleExecuteLiveHttp = async () => {
    if (isSendingHttp) return;
    setIsSendingHttp(true);
    setHttpResponse(null);
    const start = performance.now();
    try {
      const response = await fetch('/api/tools/http-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: parsedCurl.url,
          method: parsedCurl.method,
          headers: parsedCurl.headers,
          body: parsedCurl.body
        })
      });
      const data = await response.json();
      setHttpResponse({
        status: data.status || response.status,
        latencyMs: Math.round(performance.now() - start),
        body: typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, 2),
        error: data.error
      });
    } catch (err: any) {
      setHttpResponse({
        status: 500,
        latencyMs: Math.round(performance.now() - start),
        error: err?.message || 'Request failed'
      });
    } finally {
      setIsSendingHttp(false);
    }
  };

  const handleDiagnoseStack = async () => {
    if (!stackInput.trim() || isDiagnosing) return;
    setIsDiagnosing(true);
    const res = await diagnoseStackTraceWithAi(stackInput, selectedModel);
    setIsDiagnosing(false);
    if (res.requiresByok) {
      onRequireByok(res.error);
      return;
    }
    setStackOutput(res.content);
  };

  const handleComputeSha256 = async (val: string) => {
    setHashInput(val);
    const msgBuffer = new TextEncoder().encode(val);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha256Output(hashHex);
  };

  useEffect(() => {
    handleComputeSha256(hashInput);
  }, []);

  const handleGenerateAiIconForSvgOptimizer = async () => {
    if (!aiSvgPrompt.trim() || isGeneratingAiSvg) return;
    setIsGeneratingAiSvg(true);
    const res = await generateSvgAssetWithAi(aiSvgPrompt, selectedModel);
    setIsGeneratingAiSvg(false);
    if (res.requiresByok) {
      onRequireByok(res.error);
      return;
    }
    if (res.content) {
      setRawSvgInput(res.content);
    }
  };

  const handleGenerateSvg = async () => {
    if (!svgPrompt.trim() || isGeneratingSvg) return;
    setIsGeneratingSvg(true);
    const res = await generateSvgAssetWithAi(svgPrompt, selectedModel);
    setIsGeneratingSvg(false);
    if (res.requiresByok) {
      onRequireByok(res.error);
      return;
    }
    if (res.content) {
      setSvgCode(res.content);
    }
  };

  const parsedDate = useMemo(() => {
    const num = Number(epochInput.trim());
    if (Number.isNaN(num)) return null;
    const ms = num < 1e11 ? num * 1000 : num;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [epochInput]);

  const TOOL_TABS: { id: WorkspaceNavId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tool-json', label: 'JSON & TypeScript', icon: FileJson },
    { id: 'tool-rest-curl', label: 'REST & cURL', icon: Globe },
    { id: 'tool-sql', label: 'AI SQL Architect', icon: Database },
    { id: 'tool-jwt-base64', label: 'JWT & Base64', icon: ShieldCheck },
    { id: 'tool-regex-cron', label: 'Regex & Cron', icon: Regex },
    { id: 'tool-stacktrace', label: 'Stack Trace Healer', icon: Bug },
    { id: 'tool-readme', label: 'README Generator', icon: FileText },
    { id: 'tool-svg-optimizer', label: 'SVG Optimizer & JSX', icon: FileCode },
    { id: 'tool-roi-calculator', label: 'AI ROI Calculator', icon: Calculator },
    { id: 'tool-color-scale', label: 'Tailwind Colors', icon: Palette },
    { id: 'tool-uuid-hash', label: 'UUID & Hash', icon: Hash },
    { id: 'tool-timestamp', label: 'Epoch Time', icon: Clock },
    { id: 'tool-image-gen', label: 'AI SVG Studio', icon: ImageIcon }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Liquid Glass Quick-Switch Bar across all 12 Developer Tools */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/[0.08] no-scrollbar">
        {TOOL_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeToolId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectToolId && onSelectToolId(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-fuchsia-600/20 text-white border-indigo-500/50 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. JSON SANITIZER & TYPESCRIPT GENERATOR */}
      {activeToolId === 'tool-json' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <span>JSON Sanitizer & TypeScript Interface Generator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Automatically repairs broken LLM JSON (trailing commas, unquoted keys, single quotes, markdown wrappers) or infers TypeScript interfaces.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFixJson}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  jsonMode === 'json'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sanitize & Format JSON</span>
              </button>
              <button
                onClick={handleConvertTs}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  jsonMode === 'ts'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Generate TypeScript Interfaces</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400">Raw / Broken JSON Input</span>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={13}
                spellCheck={false}
                className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">
                  {jsonMode === 'json' ? 'Clean Validated JSON' : 'TypeScript Interfaces'}
                </span>
                {jsonOutput && (
                  <button
                    onClick={() => copyText('json-out', jsonOutput)}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copiedId === 'json-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'json-out' ? 'Copied' : 'Copy Output'}</span>
                  </button>
                )}
              </div>
              <div className="relative h-[292px] bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs overflow-auto">
                {jsonError ? (
                  <div className="text-rose-400">{jsonError}</div>
                ) : jsonOutput ? (
                  <pre className="text-emerald-300 whitespace-pre-wrap">{jsonOutput}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                    Click &ldquo;Sanitize & Format JSON&rdquo; or &ldquo;Generate TypeScript Interfaces&rdquo; to process.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REST & cURL CLIENT */}
      {activeToolId === 'tool-rest-curl' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>cURL to Fetch / Axios / Python Converter & Live REST Client</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Paste any `curl` command to generate ready-to-run Fetch, Axios, and Python `requests` code—or fire a live HTTP request.
              </p>
            </div>
            <button
              onClick={handleExecuteLiveHttp}
              disabled={isSendingHttp}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingHttp ? 'Sending Request...' : 'Send Live Request'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">cURL Command Input</label>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {parsedCurl.method} {parsedCurl.url.slice(0, 38)}
                </span>
              </div>
              <textarea
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                rows={8}
                spellCheck={false}
                className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3 font-mono text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
              />

              {httpResponse && (
                <div className="p-3.5 rounded-2xl bg-black/70 border border-white/[0.1] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Live HTTP Response</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                          (httpResponse.status || 200) < 400
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        HTTP {httpResponse.status}
                      </span>
                      <span className="text-zinc-400 font-mono">{httpResponse.latencyMs} ms</span>
                    </div>
                  </div>
                  <pre className="text-xs font-mono text-emerald-300 max-h-44 overflow-auto whitespace-pre-wrap">
                    {httpResponse.error || httpResponse.body}
                  </pre>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.1]">
                  {(
                    [
                      { id: 'fetch', label: 'JavaScript Fetch' },
                      { id: 'axios', label: 'Axios' },
                      { id: 'python', label: 'Python Requests' }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCurlCodeTab(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        curlCodeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    copyText(
                      'curl-code',
                      curlCodeTab === 'fetch'
                        ? parsedCurl.fetchCode
                        : curlCodeTab === 'axios'
                        ? parsedCurl.axiosCode
                        : parsedCurl.pythonCode
                    )
                  }
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedId === 'curl-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'curl-code' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="h-[290px] bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs text-indigo-200 overflow-auto whitespace-pre-wrap">
                {curlCodeTab === 'fetch'
                  ? parsedCurl.fetchCode
                  : curlCodeTab === 'axios'
                  ? parsedCurl.axiosCode
                  : parsedCurl.pythonCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. REGEX & CRON BUILDER */}
      {activeToolId === 'tool-regex-cron' && (
        <div className="space-y-4">
          {/* Sub-Switch between Regex Tester and Cron Expression Generator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRegexCronSubTab('regex')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                regexCronSubTab === 'regex'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              🔍 AI Regex Generator & Live Pattern Tester
            </button>
            <button
              onClick={() => setRegexCronSubTab('cron')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                regexCronSubTab === 'cron'
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              ⏱️ Cron Expression Generator & Next Run Calculator
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regex Builder */}
            <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Regex className="w-4 h-4 text-indigo-400" />
                  <span>Live Regex Pattern Tester</span>
                </h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {regexEval.isValid ? `${regexEval.matchCount} matches` : 'Invalid Regex'}
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-black/60 border border-white/[0.1] rounded-xl px-3">
                  <span className="text-zinc-500 font-mono text-sm">/</span>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="flex-1 bg-transparent px-1.5 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                  />
                  <span className="text-zinc-500 font-mono text-sm">/</span>
                </div>
                <input
                  type="text"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="gi"
                  className="w-16 bg-black/60 border border-white/[0.1] rounded-xl px-2.5 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Email', pat: '([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)' },
                  { label: 'URL', pat: '(https?:\\/\\/[^\\s]+)' },
                  { label: 'IPv4', pat: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
                  { label: 'Date YYYY-MM-DD', pat: '\\b\\d{4}-\\d{2}-\\d{2}\\b' }
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setRegexPattern(p.pat)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Test String</label>
                <textarea
                  value={regexTestText}
                  onChange={(e) => setRegexTestText(e.target.value)}
                  rows={4}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400">Extracted Matches</span>
                {regexEval.error ? (
                  <div className="text-xs text-rose-400 font-mono">{regexEval.error}</div>
                ) : regexEval.matches.length === 0 ? (
                  <div className="text-xs text-zinc-500">No matches found.</div>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {regexEval.matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs font-mono"
                      >
                        <span className="text-emerald-300">{m.match}</span>
                        <span className="text-zinc-500">index: {m.index}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cron Schedule Builder */}
            <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Cron Schedule Builder & Human Explainer</span>
                </h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  5-Field Cron
                </span>
              </div>

              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-300 focus:outline-none"
              />

              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Every 5 mins', val: '*/5 * * * *' },
                  { label: 'Every hour', val: '0 * * * *' },
                  { label: 'Daily at midnight', val: '0 0 * * *' },
                  { label: 'Weekdays at 9 AM', val: '0 9 * * 1-5' }
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setCronInput(c.val)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] cursor-pointer"
                  >
                    {c.label} ({c.val})
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-1">
                  Human-Readable Schedule
                </div>
                <div className="text-sm font-bold text-zinc-100">{cronEval.summary}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400">Next Scheduled Executions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cronEval.nextRuns.map((run, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs font-mono text-zinc-300"
                    >
                      Run #{i + 1}: {run}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI SQL ARCHITECT */}
      {activeToolId === 'tool-sql' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>AI SQL Architect & Visual Schema Breakdown</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Convert plain English requirements into optimized PostgreSQL, MySQL, or Supabase SQL queries with index recommendations.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/[0.1]">
              {(['postgresql', 'mysql', 'supabase'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSqlDialect(d);
                    setCustomSqlResult(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                    sqlDialect === d ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sqlPrompt}
              onChange={(e) => {
                setSqlPrompt(e.target.value);
                setCustomSqlResult(null);
              }}
              placeholder="Describe the SQL query or schema you need..."
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={async () => {
                setIsGeneratingSql(true);
                const res = await diagnoseStackTraceWithAi(
                  `Generate an optimized ${sqlDialect.toUpperCase()} SQL query and index strategy for: ${sqlPrompt}`,
                  selectedModel
                );
                setIsGeneratingSql(false);
                if (res.content) setCustomSqlResult(res.content);
              }}
              disabled={isGeneratingSql}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingSql ? 'Synthesizing...' : 'AI Deep Refine'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">
                  Generated {sqlDialect.toUpperCase()} Query & Indexes
                </span>
                <button
                  onClick={() => copyText('sql-out', customSqlResult || sqlEval.sql)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedId === 'sql-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'sql-out' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="h-72 bg-black/60 border border-white/[0.1] rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-auto whitespace-pre-wrap">
                {customSqlResult || sqlEval.sql}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visual Schema Breakdown</span>
              </span>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {sqlEval.schemaBreakdown.map((tbl) => (
                  <div
                    key={tbl.table}
                    className="p-3 rounded-xl bg-black/50 border border-white/[0.08] space-y-1.5"
                  >
                    <div className="text-xs font-bold text-indigo-300 font-mono">{tbl.table}</div>
                    <div className="space-y-1">
                      {tbl.columns.map((col) => (
                        <div key={col} className="text-[11px] font-mono text-zinc-400">
                          • {col}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. JWT & BASE64 INSPECTOR */}
      {activeToolId === 'tool-jwt-base64' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>JWT Token Decoder & Payload Inspector (100% Client-Side)</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Inspect JWT headers, claims, issued-at, and expiration status locally without sending tokens over the network.
                </p>
              </div>
              {decodedJwt.isValid && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    decodedJwt.isExpired
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {decodedJwt.isExpired ? 'Token Expired' : `Valid (Exp: ${decodedJwt.expiresAt || 'No exp'})`}
                </span>
              )}
            </div>

            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-3 font-mono text-xs text-amber-300 focus:outline-none resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-1">Decoded Header (Algorithm & Type)</div>
                <pre className="h-44 bg-black/60 border border-white/[0.1] rounded-xl p-3 font-mono text-xs text-indigo-300 overflow-auto">
                  {JSON.stringify(decodedJwt.header, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-1">Decoded Payload (Claims & Permissions)</div>
                <pre className="h-44 bg-black/60 border border-white/[0.1] rounded-xl p-3 font-mono text-xs text-emerald-300 overflow-auto">
                  {JSON.stringify(decodedJwt.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* UTF-8 Base64 Converter */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-white">UTF-8 Safe Base64 Encoder / Decoder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Plain UTF-8 Text</label>
                <textarea
                  value={base64Plain}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBase64Plain(val);
                    try {
                      setBase64Encoded(btoa(unescape(encodeURIComponent(val))));
                    } catch {
                      // ignore
                    }
                  }}
                  rows={3}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Base64 Encoded String</label>
                <textarea
                  value={base64Encoded}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBase64Encoded(val);
                    try {
                      setBase64Plain(decodeURIComponent(escape(atob(val.trim()))));
                    } catch {
                      // ignore
                    }
                  }}
                  rows={3}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-2.5 font-mono text-xs text-emerald-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. STACK TRACE AUTO-HEALER */}
      {activeToolId === 'tool-stacktrace' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <span>Stack Trace & Terminal Error Auto-Healer</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Paste any terminal error or stack trace for instant root-cause analysis and a copy-ready code patch.
              </p>
            </div>
            <button
              onClick={handleDiagnoseStack}
              disabled={isDiagnosing || !stackInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Diagnosing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diagnose & Auto-Heal Error</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs text-rose-200/90 focus:outline-none resize-none"
            />
            <div className="h-[270px] bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs overflow-auto">
              {stackOutput ? (
                <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{stackOutput}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                  Click &ldquo;Diagnose & Auto-Heal Error&rdquo; to generate a root-cause breakdown and code patch.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. AI README GENERATOR */}
      {activeToolId === 'tool-readme' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>AI GitHub README.md & Documentation Generator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate professional open-source documentation with shields.io badges, architecture trees, and quickstart commands.
              </p>
            </div>
            <button
              onClick={() => copyText('readme-out', readmeMarkdown)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === 'readme-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'readme-out' ? 'Copied README.md!' : 'Copy Markdown'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={readmeTitle}
                  onChange={(e) => setReadmeTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">One-Sentence Summary</label>
                <input
                  type="text"
                  value={readmeSummary}
                  onChange={(e) => setReadmeSummary(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  value={readmeStack}
                  onChange={(e) => setReadmeStack(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Key Features (One per line)</label>
                <textarea
                  value={readmeFeatures}
                  onChange={(e) => setReadmeFeatures(e.target.value)}
                  rows={5}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-3 text-xs text-zinc-100 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Generated README.md Preview</label>
              <pre className="h-[310px] bg-black/60 border border-white/[0.1] rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-auto whitespace-pre-wrap">
                {readmeMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 8. SVG CODE MINIFIER, JSX CONVERTER & AI ICON GENERATOR (?tool=svg-optimizer) */}
      {activeToolId === 'tool-svg-optimizer' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <span>SVG Code Minifier, React JSX Converter & AI Icon Generator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Strip XML bloat, convert kebab-case SVG attributes (`stroke-width`, `fill-rule`) to React TSX camelCase, or generate custom icons with AI.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                Saved {svgOptimized.savingsPercent}% ({svgOptimized.originalBytes}B → {svgOptimized.minifiedBytes}B)
              </span>
            </div>
          </div>

          {/* Optional AI Icon Generator Bar */}
          <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-2xl bg-black/40 border border-white/[0.08]">
            <input
              type="text"
              value={aiSvgPrompt}
              onChange={(e) => setAiSvgPrompt(e.target.value)}
              placeholder="Or describe a custom SVG icon/illustration to generate with AI (e.g., Minimalist neon rocket icon)..."
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleGenerateAiIconForSvgOptimizer}
              disabled={isGeneratingAiSvg || !aiSvgPrompt.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAiSvg ? 'Generating SVG...' : '✨ AI Generate SVG'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Raw SVG Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Raw SVG Markup Input</label>
                <input
                  type="text"
                  value={svgComponentName}
                  onChange={(e) => setSvgComponentName(e.target.value)}
                  placeholder="ComponentName"
                  className="bg-black/60 border border-white/[0.1] rounded-lg px-2 py-0.5 text-xs font-mono text-indigo-300 w-32"
                />
              </div>
              <textarea
                value={rawSvgInput}
                onChange={(e) => setRawSvgInput(e.target.value)}
                rows={11}
                spellCheck={false}
                className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3 font-mono text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Center: Live Vector Canvas Preview */}
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold text-zinc-300">Live Vector Preview</span>
              <div className="flex-1 min-h-[240px] rounded-2xl bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-black/70 border border-white/[0.1] flex items-center justify-center p-6 text-indigo-400">
                <div
                  className="w-32 h-32 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svgOptimized.minifiedSvg }}
                />
              </div>
            </div>

            {/* Right: React TSX / Minified SVG Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.1]">
                  <button
                    onClick={() => setSvgOutputMode('jsx')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      svgOutputMode === 'jsx' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    React TSX
                  </button>
                  <button
                    onClick={() => setSvgOutputMode('minified')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      svgOutputMode === 'minified' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Minified SVG
                  </button>
                </div>
                <button
                  onClick={() =>
                    copyText(
                      'svg-opt-out',
                      svgOutputMode === 'jsx' ? svgOptimized.reactTsx : svgOptimized.minifiedSvg
                    )
                  }
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedId === 'svg-opt-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'svg-opt-out' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="h-[245px] bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 font-mono text-xs text-emerald-300 overflow-auto whitespace-pre-wrap">
                {svgOutputMode === 'jsx' ? svgOptimized.reactTsx : svgOptimized.minifiedSvg}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAILWIND & COLOR SCALE */}
      {activeToolId === 'tool-color-scale' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <span>Tailwind 50–900 Color Scale & Contrast Generator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pick any brand HEX color to generate a complete 9-stop Tailwind CSS palette.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded-xl bg-black border border-white/[0.1] cursor-pointer"
              />
              <input
                type="text"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 font-mono text-xs text-zinc-100 w-28"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2.5">
            {colorScale.map((item) => (
              <button
                key={item.shade}
                onClick={() => copyText(`shade-${item.shade}`, item.hex)}
                className="group p-2.5 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/[0.2] text-left space-y-2 transition-all cursor-pointer"
              >
                <div
                  className="w-full h-14 rounded-lg border border-white/10 shadow-inner"
                  style={{ backgroundColor: item.hex }}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-200">{item.shade}</div>
                  <div className="text-[10px] font-mono text-zinc-400">{item.hex}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 10. UUID & HASH FORGE */}
      {activeToolId === 'tool-uuid-hash' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-emerald-400" />
              <span>UUID v4 & WebCrypto SHA-256 Hash Forge</span>
            </h2>
            <button
              onClick={() =>
                setUuids([
                  crypto.randomUUID(),
                  crypto.randomUUID(),
                  crypto.randomUUID(),
                  crypto.randomUUID()
                ])
              }
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate UUIDs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400">Cryptographic UUID v4 Batch</span>
              {uuids.map((id, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-zinc-200"
                >
                  <span className="truncate">{id}</span>
                  <button
                    onClick={() => copyText(`uuid-${idx}`, id)}
                    className="text-zinc-400 hover:text-white ml-2 cursor-pointer"
                  >
                    {copiedId === `uuid-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400">Real-Time SHA-256 Digest</span>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => handleComputeSha256(e.target.value)}
                className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              />
              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-emerald-400 break-all flex items-center justify-between gap-2">
                <span>{sha256Output}</span>
                <button
                  onClick={() => copyText('sha-out', sha256Output)}
                  className="shrink-0 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {copiedId === 'sha-out' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. UNIX EPOCH & TIMEZONE */}
      {activeToolId === 'tool-timestamp' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Unix Epoch Timestamp & ISO-8601 Timezone Converter</span>
            </h2>
            <button
              onClick={() => setEpochInput(Math.floor(Date.now() / 1000).toString())}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-amber-300 cursor-pointer"
            >
              Set to Now
            </button>
          </div>

          <input
            type="text"
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            className="w-full max-w-md bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none"
          />

          {parsedDate ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08]">
                <div className="text-[10px] uppercase text-zinc-500 mb-1">ISO-8601 (UTC)</div>
                <div className="font-mono text-xs text-indigo-300">{parsedDate.toISOString()}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08]">
                <div className="text-[10px] uppercase text-zinc-500 mb-1">UTC String</div>
                <div className="font-mono text-xs text-zinc-200">{parsedDate.toUTCString()}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08]">
                <div className="text-[10px] uppercase text-zinc-500 mb-1">Milliseconds</div>
                <div className="font-mono text-xs text-emerald-400">{parsedDate.getTime()}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-rose-400">Invalid Unix timestamp</div>
          )}
        </div>
      )}

      {/* 12. AI ASSET GENERATOR */}
      {activeToolId === 'tool-image-gen' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <span>AI Vector & SVG Illustration Studio</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate scalable SVG hero graphics, badges, and illustrations for your web apps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyText('svg-code', svgCode)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'svg-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy SVG</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `devpulse-graphic-${Date.now()}.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .SVG</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={svgPrompt}
              onChange={(e) => setSvgPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateSvg();
              }}
              placeholder="Describe an icon, hero banner, or geometric illustration..."
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleGenerateSvg}
              disabled={isGeneratingSvg || !svgPrompt.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isGeneratingSvg ? 'Synthesizing...' : 'Generate Graphic'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full h-80 rounded-2xl bg-black/70 border border-white/[0.08] flex items-center justify-center overflow-hidden p-4">
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </div>
        </div>
      )}

      {/* 13. AI ENGINEERING ROI & TOKEN COST CALCULATOR (/tools/roi-calculator) */}
      {activeToolId === 'tool-roi-calculator' && (
        <div
          data-testid="roi-calculator-workbench"
          className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>AI Engineering ROI &amp; Token Cost Calculator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Model engineering hours saved, monthly &amp; annual payroll savings, and net ROI vs API token costs.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Net ROI: {roiMetrics.roiMultiple}x ({roiMetrics.paybackDays}d payback)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders / Inputs */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="roi-devs" className="font-semibold text-zinc-300">
                    Engineering Team Size
                  </label>
                  <span className="font-mono font-bold text-indigo-300">{roiDevelopersCount} devs</span>
                </div>
                <input
                  id="roi-devs"
                  type="range"
                  min={1}
                  max={100}
                  value={roiDevelopersCount}
                  onChange={(e) => setRoiDevelopersCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="roi-rate" className="font-semibold text-zinc-300">
                    Blended Developer Hourly Rate (USD)
                  </label>
                  <span className="font-mono font-bold text-emerald-300">${roiHourlyRateUsd}/hr</span>
                </div>
                <input
                  id="roi-rate"
                  type="range"
                  min={15}
                  max={250}
                  step={5}
                  value={roiHourlyRateUsd}
                  onChange={(e) => setRoiHourlyRateUsd(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="roi-hours" className="font-semibold text-zinc-300">
                    Hours Saved per Developer / Week
                  </label>
                  <span className="font-mono font-bold text-amber-300">{roiHoursSavedPerWeek} hrs/wk</span>
                </div>
                <input
                  id="roi-hours"
                  type="range"
                  min={1}
                  max={25}
                  step={0.5}
                  value={roiHoursSavedPerWeek}
                  onChange={(e) => setRoiHoursSavedPerWeek(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="roi-prompts" className="font-semibold text-zinc-300">
                    Monthly AI Prompts per Developer
                  </label>
                  <span className="font-mono font-bold text-fuchsia-300">{roiMonthlyPromptsPerDev} prompts</span>
                </div>
                <input
                  id="roi-prompts"
                  type="range"
                  min={50}
                  max={3000}
                  step={50}
                  value={roiMonthlyPromptsPerDev}
                  onChange={(e) => setRoiMonthlyPromptsPerDev(Number(e.target.value))}
                  className="w-full accent-fuchsia-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Output Telemetry Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Net Monthly Engineering Savings</span>
                <div
                  data-testid="roi-net-monthly-savings"
                  className="text-2xl font-extrabold font-mono text-emerald-400"
                >
                  ${roiMetrics.netMonthlySavingsUsd.toLocaleString()}/mo
                </div>
                <p className="text-[11px] text-zinc-400">
                  {roiMetrics.monthlyHoursSaved} engineering hours reclaimed per month
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Annualized Productivity Gain</span>
                <div
                  data-testid="roi-annual-savings"
                  className="text-2xl font-extrabold font-mono text-indigo-300"
                >
                  ${roiMetrics.annualSavingsUsd.toLocaleString()}/yr
                </div>
                <p className="text-[11px] text-zinc-400">
                  Equivalent to {(roiMetrics.monthlyHoursSaved / 160).toFixed(1)} full-time engineers added
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Est. Monthly BYOK API Token Spend</span>
                <div className="text-xl font-bold font-mono text-amber-300">
                  ${roiMetrics.estimatedMonthlyTokenCostUsd.toFixed(2)}/mo
                </div>
                <p className="text-[11px] text-zinc-400">
                  Zero seat markup on DevPulse AI (vs ${(roiDevelopersCount * 20).toLocaleString()}/mo SaaS seats)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Return Multiple &amp; Payback</span>
                <div className="text-xl font-bold font-mono text-white">
                  {roiMetrics.roiMultiple}x Return • {roiMetrics.paybackDays} Day Payback
                </div>
                <p className="text-[11px] text-zinc-400">
                  Immediate positive unit economics from day 1
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
