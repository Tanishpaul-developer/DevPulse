import React, { useState } from 'react';
import { Sliders, RotateCcw, Info, KeyRound, ShieldCheck } from 'lucide-react';
import {
  AIModelParameters,
  DEFAULT_MODEL_PARAMETERS,
  ModelOptionId,
  getByokKeys,
} from '../services/aiRouter.ts';

interface ModelParametersPanelProps {
  modelParameters: AIModelParameters;
  onChangeModelParameters: (next: AIModelParameters) => void;
  selectedModel?: ModelOptionId;
  onOpenByokModal?: () => void;
  compact?: boolean;
}

const PARAMETER_TOOLTIPS = {
  temperature:
    'Temperature (0.0 – 2.0, Default: 0.3): Controls randomness in token generation. Lower values (0.0–0.3) yield deterministic, precise code; higher values (0.7–1.2) increase creative exploration.',
  topP:
    'Top-P / Nucleus Sampling (0.0 – 1.0, Default: 0.95): Limits token selection to the smallest cumulative probability mass P. Lowering Top-P narrows output to high-confidence tokens.',
  topK:
    'Top-K Sampling (1 – 100, Default: 40): Restricts each decoding step to the K most likely next tokens. Lower K prevents improbable syntax hallucinations.',
};

export const ModelParametersPanel: React.FC<ModelParametersPanelProps> = ({
  modelParameters = DEFAULT_MODEL_PARAMETERS,
  onChangeModelParameters,
  selectedModel,
  onOpenByokModal,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<'temperature' | 'topP' | 'topK' | null>(null);
  const byok = getByokKeys();

  const handleReset = () => {
    onChangeModelParameters({ ...DEFAULT_MODEL_PARAMETERS });
  };

  return (
    <div
      aria-label="AI Model Parameters"
      className="p-3 rounded-lg theme-bg-lowest bg-[#0d0e13] border border-[#6366F1]/40 space-y-3 text-xs"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b theme-border border-[#1F2430] pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#818CF8]" />
          <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
            AI Model Parameters (Browser Storage Persisted)
          </span>
          {selectedModel && (
            <span className="px-1.5 py-0.5 rounded bg-[#6366F1]/15 text-[#818CF8] font-mono text-[10px]">
              Target: {selectedModel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenByokModal && (
            <button
              type="button"
              onClick={onOpenByokModal}
              className="px-2 py-0.5 rounded bg-[#1a1b21] hover:bg-[#292a2f] border border-[#2A3042] text-[#4edea3] font-mono text-[10px] flex items-center gap-1 cursor-pointer"
              title="Enter your Gemini, Groq, or OpenRouter API keys — safely saved inside your browser localStorage"
            >
              <KeyRound className="w-3 h-3" />
              <span>
                Browser Keys: Gemini {byok.gemini ? '✓' : '·'} | Groq {byok.groq ? '✓' : '·'} | OpenRouter{' '}
                {byok.openrouter ? '✓' : '·'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-0.5 rounded bg-[#1a1b21] hover:bg-[#292a2f] text-[#c7c4d7] hover:text-white font-mono text-[10px] flex items-center gap-1 cursor-pointer"
            title="Reset temperature (0.3), topP (0.95), and topK (40) to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 3 Sampling Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Temperature */}
        <div className="p-2.5 rounded-lg bg-[#141620] border border-[#2A3042] space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <label
              htmlFor="param-temperature"
              className="flex items-center gap-1 text-white font-semibold cursor-help"
              title={PARAMETER_TOOLTIPS.temperature}
            >
              <span>temperature</span>
              <button
                type="button"
                aria-label="Temperature parameter info"
                onClick={() =>
                  setActiveTooltip((prev) => (prev === 'temperature' ? null : 'temperature'))
                }
                title={PARAMETER_TOOLTIPS.temperature}
                className="text-[#818CF8] hover:text-white cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </label>
            <input
              id="param-temperature-num"
              type="number"
              min={0}
              max={2}
              step={0.05}
              aria-label="Temperature Value"
              value={modelParameters.temperature}
              onChange={(e) =>
                onChangeModelParameters({
                  ...modelParameters,
                  temperature: Number(e.target.value),
                })
              }
              className="w-14 px-1.5 py-0.5 rounded bg-[#0d0e13] border border-[#2A3042] text-right font-mono text-[11px] text-[#4edea3]"
            />
          </div>
          <input
            id="param-temperature"
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={modelParameters.temperature}
            onChange={(e) =>
              onChangeModelParameters({
                ...modelParameters,
                temperature: Number(e.target.value),
              })
            }
            title={PARAMETER_TOOLTIPS.temperature}
            className="w-full accent-[#6366F1] cursor-pointer"
          />
          <p className="text-[10px] font-mono text-[#908fa0] leading-snug">
            Controls randomness (0.0 deterministic – 2.0 creative). Default: 0.3
          </p>
        </div>

        {/* 2. Top-P */}
        <div className="p-2.5 rounded-lg bg-[#141620] border border-[#2A3042] space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <label
              htmlFor="param-topP"
              className="flex items-center gap-1 text-white font-semibold cursor-help"
              title={PARAMETER_TOOLTIPS.topP}
            >
              <span>topP</span>
              <button
                type="button"
                aria-label="Top-P parameter info"
                onClick={() => setActiveTooltip((prev) => (prev === 'topP' ? null : 'topP'))}
                title={PARAMETER_TOOLTIPS.topP}
                className="text-[#818CF8] hover:text-white cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </label>
            <input
              id="param-topP-num"
              type="number"
              min={0}
              max={1}
              step={0.05}
              aria-label="Top-P Value"
              value={modelParameters.topP}
              onChange={(e) =>
                onChangeModelParameters({
                  ...modelParameters,
                  topP: Number(e.target.value),
                })
              }
              className="w-14 px-1.5 py-0.5 rounded bg-[#0d0e13] border border-[#2A3042] text-right font-mono text-[11px] text-[#4edea3]"
            />
          </div>
          <input
            id="param-topP"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={modelParameters.topP}
            onChange={(e) =>
              onChangeModelParameters({
                ...modelParameters,
                topP: Number(e.target.value),
              })
            }
            title={PARAMETER_TOOLTIPS.topP}
            className="w-full accent-[#6366F1] cursor-pointer"
          />
          <p className="text-[10px] font-mono text-[#908fa0] leading-snug">
            Nucleus cumulative probability mass (0.0 – 1.0). Default: 0.95
          </p>
        </div>

        {/* 3. Top-K */}
        <div className="p-2.5 rounded-lg bg-[#141620] border border-[#2A3042] space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <label
              htmlFor="param-topK"
              className="flex items-center gap-1 text-white font-semibold cursor-help"
              title={PARAMETER_TOOLTIPS.topK}
            >
              <span>topK</span>
              <button
                type="button"
                aria-label="Top-K parameter info"
                onClick={() => setActiveTooltip((prev) => (prev === 'topK' ? null : 'topK'))}
                title={PARAMETER_TOOLTIPS.topK}
                className="text-[#818CF8] hover:text-white cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </label>
            <input
              id="param-topK-num"
              type="number"
              min={1}
              max={100}
              step={1}
              aria-label="Top-K Value"
              value={modelParameters.topK}
              onChange={(e) =>
                onChangeModelParameters({
                  ...modelParameters,
                  topK: Number(e.target.value),
                })
              }
              className="w-14 px-1.5 py-0.5 rounded bg-[#0d0e13] border border-[#2A3042] text-right font-mono text-[11px] text-[#4edea3]"
            />
          </div>
          <input
            id="param-topK"
            type="range"
            min={1}
            max={100}
            step={1}
            value={modelParameters.topK}
            onChange={(e) =>
              onChangeModelParameters({
                ...modelParameters,
                topK: Number(e.target.value),
              })
            }
            title={PARAMETER_TOOLTIPS.topK}
            className="w-full accent-[#6366F1] cursor-pointer"
          />
          <p className="text-[10px] font-mono text-[#908fa0] leading-snug">
            Candidate pool size per token step (1 – 100). Default: 40
          </p>
        </div>
      </div>

      {/* Expanded Tooltip Explanation Banner if clicked */}
      {activeTooltip && (
        <div className="p-2 rounded bg-[#1a1b21] border border-[#818CF8]/40 text-[11px] font-mono text-[#e3e1e9] flex items-center justify-between gap-2">
          <span>{PARAMETER_TOOLTIPS[activeTooltip]}</span>
          <button
            type="button"
            onClick={() => setActiveTooltip(null)}
            className="text-[#908fa0] hover:text-white cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Browser Storage Security Notice for Groq / OpenRouter / Gemini BYOK */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-[#908fa0]">
        <span className="flex items-center gap-1 text-[#4edea3]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          Parameters & user-entered API keys (OpenRouter, Groq, Gemini 4 Argon) are safely saved in browser localStorage.
        </span>
        <span>
          Active: temp={modelParameters.temperature} · topP={modelParameters.topP} · topK={modelParameters.topK}
        </span>
      </div>
    </div>
  );
};
