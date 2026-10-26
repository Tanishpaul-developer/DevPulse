import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { optimizeSystemPromptDeterministic } from '../utils/devToolsEngine.ts';
import {
  type ModelOptionId,
  type AIModelParameters,
  generateWithFailover,
} from '../services/aiRouter.ts';

interface SystemPromptOptimizerProps {
  selectedModel: ModelOptionId | string;
  modelParameters?: AIModelParameters;
  onSendToSandboxPrompt?: (optimizedPrompt: string) => void;
  onRequireByok?: (reason?: string) => void;
  onTokenConsumed?: () => void;
  showToast?: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const DOMAIN_PRESETS = [
  'Full-Stack TypeScript & UI Engineering',
  'PostgreSQL & Distributed Systems Architecture',
  'Autonomous AI Agent & Tool Calling',
  'Security Auditing & Zero-Trust Review',
];

export const SystemPromptOptimizer: React.FC<SystemPromptOptimizerProps> = ({
  selectedModel: rawModel,
  modelParameters = { temperature: 0.7, topP: 0.9, topK: 40 },
  onSendToSandboxPrompt = () => {},
  onTokenConsumed = () => {},
  showToast = () => {},
}) => {
  const selectedModel: ModelOptionId =
    rawModel === 'gemini-4-argon'
      ? 'gemini-4-argon'
      : rawModel === 'groq-llama' || rawModel === 'groq-llama-70b'
      ? 'groq-llama-70b'
      : 'gemini-3.8-flash';
  const [rawInstruction, setRawInstruction] = useState(
    'Create a real-time SaaS billing and subscription usage dashboard with seat limits, webhook logs, and upgrade modals.'
  );
  const [targetDomain, setTargetDomain] = useState(DOMAIN_PRESETS[0]);
  const [result, setResult] = useState(() =>
    optimizeSystemPromptDeterministic(rawInstruction, DOMAIN_PRESETS[0])
  );
  const [isSynthesizingAi, setIsSynthesizingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDeterministicOptimize = () => {
    const next = optimizeSystemPromptDeterministic(rawInstruction, targetDomain);
    setResult(next);
    showToast('Generated structured System Prompt specification!', 'success');
  };

  const handleAiDeepOptimize = async () => {
    setIsSynthesizingAi(true);
    try {
      const baseline = optimizeSystemPromptDeterministic(rawInstruction, targetDomain);
      const res = await generateWithFailover({
        prompt: `Upgrade this rough prompt into an elite, production-grade System Prompt for an LLM coding agent in the domain "${targetDomain}". Include Role, Constraints, Input Variables, and Output Contract:\n\n"${rawInstruction}"`,
        systemInstruction:
          'Return a structured, high-precision Markdown System Prompt with clear headings and zero conversational filler.',
        preferredModel: selectedModel,
        modelParameters,
      });
      onTokenConsumed();
      setResult({
        ...baseline,
        optimizedPrompt: res.text.trim() || baseline.optimizedPrompt,
      });
      showToast(`System Prompt optimized via ${res.providerUsed} (${res.latencyMs}ms)!`, 'success');
    } catch {
      handleDeterministicOptimize();
    } finally {
      setIsSynthesizingAi(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 theme-bg-base bg-[#090A0F] space-y-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b theme-border border-[#1F2430] pb-4">
        <div>
          <div className="text-xs font-mono text-[#818CF8]">
            AI LABS · PROMPT ARCHITECTURE COMPILER
          </div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text-main text-white mt-0.5 flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#4edea3]" />
            <span>System Prompt Optimizer</span>
          </h1>
          <p className="text-xs text-[#908fa0] mt-0.5">
            Transform a 1-line idea into a structured System Prompt with Persona, Guardrails, Template Variables, and Output Schema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDeterministicOptimize}
            className="px-3.5 py-2 rounded-lg theme-bg-low bg-[#1a1b21] hover:bg-[#292a2f] border theme-border border-[#2A3042] text-xs font-mono text-white cursor-pointer"
          >
            Compile Instant Spec
          </button>
          <button
            type="button"
            onClick={handleAiDeepOptimize}
            disabled={isSynthesizingAi}
            className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizingAi ? 'animate-spin' : ''}`} />
            <span>{isSynthesizingAi ? 'Optimizing with AI...' : '✨ AI Deep Optimize'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Input Column (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="prompt-domain-select" className="block text-xs font-mono text-[#c7c4d7]">
              Target Engineering Domain
            </label>
            <select
              id="prompt-domain-select"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="w-full rounded-lg theme-bg-low bg-[#1a1b21] border theme-border border-[#2A3042] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366F1]"
            >
              {DOMAIN_PRESETS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="raw-prompt-textarea" className="block text-xs font-mono text-[#c7c4d7]">
              Draft User Instruction / Goal
            </label>
            <textarea
              id="raw-prompt-textarea"
              rows={6}
              value={rawInstruction}
              onChange={(e) => setRawInstruction(e.target.value)}
              className="w-full rounded-lg theme-bg-low bg-[#1a1b21] border theme-border border-[#2A3042] focus:border-[#6366F1] p-3 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] space-y-2">
            <div className="text-[11px] font-mono font-semibold text-[#4edea3]">
              Injected Guardrails & Variables
            </div>
            <div className="text-xs font-mono text-[#908fa0] flex flex-wrap gap-2">
              {result.variables.map((v) => (
                <span key={v} className="text-[#818CF8]">
                  {v}
                </span>
              ))}
            </div>
            <ul className="space-y-1 text-[11px] text-[#c7c4d7]">
              {result.qualityChecklist.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Output Column (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-semibold text-white">
              Compiled System Prompt Output
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(result.optimizedPrompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                  showToast('Copied optimized System Prompt!', 'success');
                }}
                className="px-3 py-1 rounded bg-[#1a1b21] hover:bg-[#292a2f] border border-[#2A3042] text-xs font-mono text-[#c7c4d7] hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy System Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSendToSandboxPrompt(rawInstruction)}
                className="px-3 py-1 rounded bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Run in Artifact Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <pre className="flex-1 p-4 rounded-lg bg-[#090A0F] border border-[#1F2430] font-mono text-xs text-[#e3e1e9] whitespace-pre-wrap leading-relaxed overflow-y-auto min-h-[320px]">
            {result.optimizedPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptOptimizer;
