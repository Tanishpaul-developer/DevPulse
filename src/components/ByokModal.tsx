import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { ByokConfig } from '../types';
import {
  ProviderId,
  KeyTestResponse,
  validateApiKeyFormat,
  testProviderApiKey
} from '../services/aiRouter';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: ByokConfig;
  onSave: (config: ByokConfig) => void;
  alertReason?: string;
}

export default function ByokModal({
  isOpen,
  onClose,
  initialConfig,
  onSave,
  alertReason
}: ByokModalProps) {
  const [geminiKey, setGeminiKey] = useState(initialConfig.geminiKey || initialConfig.gemini || '');
  const [groqKey, setGroqKey] = useState(initialConfig.groqKey || initialConfig.groq || '');
  const [openRouterKey, setOpenRouterKey] = useState(
    initialConfig.openRouterKey || initialConfig.openrouter || ''
  );
  const [testingProvider, setTestingProvider] = useState<ProviderId | null>(null);
  const [testResults, setTestResults] = useState<Partial<Record<ProviderId, KeyTestResponse>>>({});
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(initialConfig.geminiKey || initialConfig.gemini || '');
      setGroqKey(initialConfig.groqKey || initialConfig.groq || '');
      setOpenRouterKey(initialConfig.openRouterKey || initialConfig.openrouter || '');
      setSavedBanner(false);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const geminiCheck = geminiKey ? validateApiKeyFormat('gemini', geminiKey) : null;
  const groqCheck = groqKey ? validateApiKeyFormat('groq', groqKey) : null;
  const openRouterCheck = openRouterKey ? validateApiKeyFormat('openrouter', openRouterKey) : null;

  const handleTestKey = async (provider: ProviderId, rawKey: string) => {
    const check = validateApiKeyFormat(provider, rawKey);
    if (!check.valid) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          ok: false,
          provider,
          latencyMs: 0,
          modelTested: 'format-check',
          message: check.message
        }
      }));
      return;
    }
    setTestingProvider(provider);
    try {
      const res = await testProviderApiKey(provider, rawKey);
      setTestResults((prev) => ({ ...prev, [provider]: res }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      gemini: geminiKey.trim(),
      groq: groqKey.trim(),
      openrouter: openRouterKey.trim(),
      geminiKey: geminiKey.trim(),
      groqKey: groqKey.trim(),
      openRouterKey: openRouterKey.trim()
    });
    setSavedBanner(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="byok-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0D14] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 id="byok-dialog-title" className="text-base font-bold text-white">
                🔑 Free API Keys (BYOK Multi-Model Rotator)
              </h2>
              <p className="text-xs text-zinc-400">
                100% Client-Side Browser Storage (`localStorage`) • Never stored on any server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close BYOK Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {alertReason && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{alertReason}</span>
            </div>
          )}

          {savedBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Saved API keys to Browser Storage!</span>
            </div>
          )}

          {/* 1. Gemini */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white">
                  1. Google Gemini API Key (Gemini Flash + Gemini 4 Argon Pro)
                </div>
                <p className="text-[11px] text-zinc-400">
                  Obtain free at Google AI Studio → Copy key starting with <code className="text-emerald-400">AIzaSy...</code>
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 hover:text-white font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Supports comma-separated rotation keys)"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleTestKey('gemini', geminiKey)}
                disabled={testingProvider === 'gemini'}
                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'gemini' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Test Key</span>
              </button>
            </div>
            {geminiCheck && (
              <p className={`text-[11px] font-mono ${geminiCheck.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {geminiCheck.message}
              </p>
            )}
            {testResults.gemini && (
              <p className={`text-[11px] font-mono ${testResults.gemini.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResults.gemini.message}
              </p>
            )}
          </div>

          {/* 2. Groq */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white">
                  2. Groq LPU API Key (Llama 3.3 70B Versatile Failover)
                </div>
                <p className="text-[11px] text-zinc-400">
                  Obtain free at GroqCloud Console → Copy key starting with <code className="text-emerald-400">gsk_...</code>
                </p>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 hover:text-white font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Get Groq Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleTestKey('groq', groqKey)}
                disabled={testingProvider === 'groq'}
                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'groq' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Test Key</span>
              </button>
            </div>
            {groqCheck && (
              <p className={`text-[11px] font-mono ${groqCheck.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {groqCheck.message}
              </p>
            )}
            {testResults.groq && (
              <p className={`text-[11px] font-mono ${testResults.groq.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResults.groq.message}
              </p>
            )}
          </div>

          {/* 3. OpenRouter */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white">
                  3. OpenRouter API Key (Llama 3.3 70B Free Instruct Failover)
                </div>
                <p className="text-[11px] text-zinc-400">
                  Obtain at OpenRouter Keys → Copy key starting with <code className="text-emerald-400">sk-or-v1-...</code>
                </p>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 hover:text-white font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Get OpenRouter Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleTestKey('openrouter', openRouterKey)}
                disabled={testingProvider === 'openrouter'}
                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'openrouter' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Test Key</span>
              </button>
            </div>
            {openRouterCheck && (
              <p className={`text-[11px] font-mono ${openRouterCheck.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {openRouterCheck.message}
              </p>
            )}
            {testResults.openrouter && (
              <p className={`text-[11px] font-mono ${testResults.openrouter.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResults.openrouter.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setGeminiKey('');
                setGroqKey('');
                setOpenRouterKey('');
                onSave({ gemini: '', groq: '', openrouter: '', geminiKey: '', groqKey: '', openRouterKey: '' });
              }}
              className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold cursor-pointer"
            >
              Clear Stored Keys
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
              >
                Save Keys Locally
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
