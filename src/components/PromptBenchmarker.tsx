import React, { useState } from 'react';
import {
  Play,
  SlidersHorizontal,
  Copy,
  ArrowUpRight,
  Clock,
  Zap,
  Coins,
  Brain,
  Sparkles,
} from 'lucide-react';
import {
  type BenchmarkCardResult,
  type AIModelParameters,
  runParallelModelBenchmark,
} from '../services/aiRouter.ts';
import { ModelParametersPanel } from './ModelParametersPanel.tsx';

interface PromptBenchmarkerProps {
  onSendToSandbox?: (code: string, prompt: string) => void;
  showToast?: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onTokenConsumed?: () => void;
  modelParameters?: AIModelParameters;
  modelParams?: AIModelParameters;
  onChangeModelParameters?: (next: AIModelParameters) => void;
  onUpdateModelParams?: (next: AIModelParameters) => void;
  onResetModelParams?: () => void;
  onOpenByokModal?: () => void;
  onRequireByok?: (reason?: string) => void;
}

const DEFAULT_BENCHMARK_PROMPT =
  'Write an ultra-fast token bucket rate limiter in TypeScript using Redis or in-memory atomic windows with zero external dependencies.';

const INITIAL_COLUMNS: BenchmarkCardResult[] = [
  {
    columnId: 'gemini',
    title: 'Gemini 3.8 Flash',
    subtitle: 'Google AI Studio • Auto-Rotator Primary',
    badge: '⚡ Low Latency Leader',
    latencyMs: 382,
    tokensPerSec: 184,
    estimatedTokens: 168,
    costLabel: '$0.00 (Free Tier)',
    providerUsed: 'Google Gemini Auto-Rotator',
    status: 'done',
    output: `export interface RateLimiterOptions {
  capacity: number;
  refillPerSecond: number;
}

export class GeminiTokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(private readonly opts: RateLimiterOptions) {
    this.tokens = opts.capacity;
    this.lastRefill = performance.now();
  }

  public tryAcquire(cost = 1): boolean {
    const now = performance.now();
    const elapsedSec = Math.max(0, (now - this.lastRefill) / 1000);
    this.tokens = Math.min(
      this.opts.capacity,
      this.tokens + elapsedSec * this.opts.refillPerSecond
    );
    this.lastRefill = now;

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }
}`,
  },
  {
    columnId: 'groq',
    title: 'Llama 3.3 70B Versatile',
    subtitle: 'Groq LPU Hardware Acceleration',
    badge: '🚀 High-Speed Speculative',
    latencyMs: 248,
    tokensPerSec: 276,
    estimatedTokens: 174,
    costLabel: '$0.00 (Free Tier)',
    providerUsed: 'Groq LPU (Llama 3.3 70B)',
    status: 'done',
    output: `export class GroqSlidingWindowLimiter {
  private readonly buckets = new Map<string, { tokens: number; ts: number }>();

  constructor(
    private readonly maxTokens = 10,
    private readonly refillIntervalMs = 60_000
  ) {}

  public consume(clientKey: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = this.buckets.get(clientKey) ?? {
      tokens: this.maxTokens,
      ts: now,
    };

    const elapsed = now - entry.ts;
    const refilled = Math.min(
      this.maxTokens,
      entry.tokens + (elapsed / this.refillIntervalMs) * this.maxTokens
    );

    if (refilled < 1) {
      this.buckets.set(clientKey, { tokens: refilled, ts: now });
      return { allowed: false, remaining: 0 };
    }

    const nextTokens = refilled - 1;
    this.buckets.set(clientKey, { tokens: nextTokens, ts: now });
    return { allowed: true, remaining: Math.floor(nextTokens) };
  }
}`,
  },
  {
    columnId: 'openrouter',
    title: 'Llama 3.3 70B Instruct (Free)',
    subtitle: 'OpenRouter Distributed Hub',
    badge: '🧠 Open Weights Reference',
    latencyMs: 694,
    tokensPerSec: 112,
    estimatedTokens: 162,
    costLabel: '$0.00 (Free Tier)',
    providerUsed: 'OpenRouter Free Tier',
    status: 'done',
    output: `export function createAtomicRateLimiter(limit: number, windowMs: number) {
  const state = new Map<string, number[]>();

  return function allowRequest(key: string, now = Date.now()): boolean {
    const windowStart = now - windowMs;
    const timestamps = (state.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      state.set(key, timestamps);
      return false;
    }

    timestamps.push(now);
    state.set(key, timestamps);
    return true;
  };
}`,
  },
];

export const PromptBenchmarker: React.FC<PromptBenchmarkerProps> = ({
  onSendToSandbox = () => {},
  showToast = () => {},
  onTokenConsumed = () => {},
  modelParameters: propModelParameters,
  modelParams,
  onChangeModelParameters: propOnChangeModelParameters,
  onUpdateModelParams,
  onOpenByokModal: propOnOpenByokModal,
  onRequireByok,
}) => {
  const modelParameters = propModelParameters || modelParams || { temperature: 0.7, topP: 0.9, topK: 40 };
  const onChangeModelParameters = propOnChangeModelParameters || onUpdateModelParams || (() => {});
  const onOpenByokModal = propOnOpenByokModal || (() => onRequireByok?.());
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_BENCHMARK_PROMPT);
  const [systemInstruction, setSystemInstruction] = useState(
    'Return clean, self-contained TypeScript or HTML5 code with zero external dependencies and concise inline comments.'
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showModelParams, setShowModelParams] = useState(true);
  const [enableHighThinking, setEnableHighThinking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [columns, setColumns] = useState<BenchmarkCardResult[]>(INITIAL_COLUMNS);

  const handleRunParallelBenchmark = async () => {
    const trimmed = masterPrompt.trim();
    if (!trimmed) {
      showToast('Enter a master prompt to run the parallel benchmark.', 'warning');
      return;
    }

    setIsRunning(true);
    setColumns((prev) => prev.map((c) => ({ ...c, status: 'running' })));

    try {
      const results = await runParallelModelBenchmark({
        prompt: trimmed,
        systemInstruction,
        enableHighThinking,
        modelParameters,
      });
      onTokenConsumed();
      setColumns(results);
      const fastest = [...results].sort((a, b) => a.latencyMs - b.latencyMs)[0];
      showToast(
        `Parallel benchmark finished! Fastest: ${fastest.title} (${fastest.latencyMs}ms)`,
        'success'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Parallel benchmark encountered an error',
        'error'
      );
      setColumns((prev) => prev.map((c) => ({ ...c, status: 'done' })));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyColumnOutput = async (col: BenchmarkCardResult) => {
    try {
      await navigator.clipboard.writeText(col.output);
      showToast(`Copied ${col.title} response to clipboard!`, 'success');
    } catch {
      showToast('Copied response to clipboard!', 'success');
    }
  };

  const maxSpeed = Math.max(300, ...columns.map((c) => c.tokensPerSec));

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-6.5rem)] theme-bg-base bg-[#090A0F]">
      {/* Master Prompt & System Instruction Control Deck */}
      <section className="px-4 lg:px-6 py-4 theme-bg-low bg-[#1a1b21] border-b theme-border border-[#1F2430] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#818CF8]" />
            <h1 className="text-xs font-mono font-bold uppercase tracking-wider theme-text-main text-white">
              Parallel Multi-Model Execution Matrix
            </h1>
            <span className="text-[11px] font-mono text-[#4edea3] px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30">
              3 Concurrent Nodes · performance.now() Telemetry
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowModelParams((v) => !v)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showModelParams
                  ? 'bg-[#6366F1]/20 border-[#6366F1] text-[#818CF8] font-semibold'
                  : 'theme-bg-lowest bg-[#0d0e13] border-[#2A3042] text-[#c7c4d7] hover:text-white'
              }`}
              title="Adjust temperature, topP, and topK sampling parameters for benchmark runs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>
                AI Model Parameters (T:{modelParameters.temperature} · P:{modelParameters.topP} · K:{modelParameters.topK})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEnableHighThinking((v) => !v)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                enableHighThinking
                  ? 'bg-[#6366F1]/20 border-[#6366F1] text-[#818CF8] font-semibold'
                  : 'theme-bg-lowest bg-[#0d0e13] border-[#2A3042] text-[#908fa0] hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Gemini 4 Argon High Thinking: {enableHighThinking ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSystemPrompt((v) => !v)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showSystemPrompt
                  ? 'bg-[#292a2f] border-[#6366F1] text-white'
                  : 'theme-bg-lowest bg-[#0d0e13] border-[#2A3042] text-[#c7c4d7] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>System Instruction</span>
            </button>
          </div>
        </div>

        {/* AI Model Parameters Control Panel (Temperature, Top-P, Top-K + Browser Keys Badge) */}
        {showModelParams && (
          <ModelParametersPanel
            modelParameters={modelParameters}
            onChangeModelParameters={onChangeModelParameters}
            selectedModel={enableHighThinking ? 'gemini-4-argon' : 'gemini-3.8-flash'}
            onOpenByokModal={onOpenByokModal}
          />
        )}

        {/* Master Prompt Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 theme-bg-lowest bg-[#0d0e13] border theme-border border-[#2A3042] focus-within:border-[#6366F1] rounded-lg p-2">
          <input
            type="text"
            aria-label="Master Benchmark Prompt"
            value={masterPrompt}
            onChange={(e) => setMasterPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunParallelBenchmark();
              }
            }}
            placeholder="Enter master prompt to benchmark across Gemini Flash, Groq Llama 3.3 70B, and OpenRouter..."
            className="flex-1 bg-transparent text-xs font-mono theme-text-main text-[#e3e1e9] px-2 py-1.5 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleRunParallelBenchmark}
            disabled={isRunning}
            className="bg-[#6366F1] hover:bg-[#818CF8] disabled:opacity-60 text-white font-semibold text-xs px-4 py-2 rounded flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Running Parallel Benchmark...' : 'Run Parallel Benchmark'}</span>
          </button>
        </div>

        {/* Collapsible System Instruction Input */}
        {showSystemPrompt && (
          <div className="p-2.5 rounded theme-bg-lowest bg-[#0d0e13] border theme-border border-[#2A3042] flex flex-col gap-1">
            <label
              htmlFor="benchmark-system-input"
              className="text-[11px] font-mono text-[#908fa0] uppercase"
            >
              Shared System Instruction (Applied to all 3 models)
            </label>
            <input
              id="benchmark-system-input"
              type="text"
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-transparent text-xs font-mono theme-text-main text-[#e3e1e9] focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* 3 Side-by-Side Comparison Columns */}
      <section className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-auto">
        {columns.map((col) => {
          const speedPct = Math.min(100, Math.round((col.tokensPerSec / maxSpeed) * 100));
          const isFastest =
            col.latencyMs === Math.min(...columns.map((c) => c.latencyMs)) &&
            col.status === 'done';

          return (
            <div
              key={col.columnId}
              className={`flex flex-col rounded-xl theme-bg-lowest bg-[#0d0e13] border transition-all overflow-hidden ${
                isFastest
                  ? 'border-[#4edea3]/70 shadow-[0_0_25px_rgba(16,185,129,0.08)]'
                  : 'theme-border border-[#1F2430]'
              }`}
            >
              {/* Model Column Header */}
              <div className="p-3.5 theme-bg-low bg-[#1a1b21] border-b theme-border border-[#1F2430] flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        col.status === 'running'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-[#4edea3]'
                      }`}
                    />
                    <h2 className="text-sm font-bold theme-text-main text-white">{col.title}</h2>
                  </div>
                  <p className="text-[11px] font-mono text-[#908fa0] mt-0.5">{col.subtitle}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#292a2f] border border-[#3E465E] text-[10px] font-mono text-[#c7c4d7] shrink-0">
                  {col.badge}
                </span>
              </div>

              {/* Real-Time Telemetry Strip */}
              <div className="p-3 theme-bg-container bg-[#141620] border-b theme-border border-[#1F2430] space-y-2">
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="p-2 rounded theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430]">
                    <div className="text-[10px] text-[#908fa0] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#818CF8]" />
                      <span>⏱️ Latency</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {col.status === 'running' ? '...' : `${col.latencyMs} ms`}
                    </div>
                  </div>

                  <div className="p-2 rounded theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430]">
                    <div className="text-[10px] text-[#908fa0] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#4edea3]" />
                      <span>⚡ Est. Speed</span>
                    </div>
                    <div className="text-xs font-bold text-[#4edea3] mt-0.5">
                      {col.status === 'running' ? '...' : `${col.tokensPerSec} tok/s`}
                    </div>
                  </div>

                  <div className="p-2 rounded theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430]">
                    <div className="text-[10px] text-[#908fa0] flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>💰 Cost</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 mt-0.5 truncate">
                      {col.costLabel}
                    </div>
                  </div>
                </div>

                {/* Throughput Proportional Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#292a2f] overflow-hidden">
                  <div
                    style={{ width: `${col.status === 'running' ? 45 : speedPct}%` }}
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#4edea3] transition-all duration-500"
                  />
                </div>
              </div>

              {/* Code Output Viewer */}
              <div className="flex-1 p-3.5 overflow-auto font-mono text-xs leading-relaxed theme-text-main text-[#e3e1e9] bg-[#0d0e13] min-h-[280px]">
                <pre className="whitespace-pre-wrap break-words">{col.output}</pre>
              </div>

              {/* Action Footer */}
              <div className="p-3 theme-bg-low bg-[#1a1b21] border-t theme-border border-[#1F2430] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyColumnOutput(col)}
                  className="px-3 py-1.5 rounded theme-bg-lowest bg-[#0d0e13] hover:bg-[#292a2f] border theme-border border-[#2A3042] text-xs font-mono theme-text-sub text-[#c7c4d7] hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Copy Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendToSandbox(col.output, masterPrompt)}
                  className="px-3 py-1.5 rounded bg-[#6366F1]/20 hover:bg-[#6366F1] border border-[#6366F1]/50 text-xs font-mono font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Send Output to Artifact Sandbox</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default PromptBenchmarker;
