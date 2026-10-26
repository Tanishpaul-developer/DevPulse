import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Rocket,
  Coffee,
  Keyboard,
  Send,
  Globe,
  Brain,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  ByokKeyStore,
  ProviderId,
  KeyTestResponse,
  getByokKeys,
  saveByokKeys,
  validateApiKeyFormat,
  testProviderApiKey,
  ModelOptionId,
} from '../services/aiRouter.ts';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysSaved: (keys: ByokKeyStore) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ByokSettingsModal: React.FC<ByokModalProps> = ({
  isOpen,
  onClose,
  onKeysSaved,
  showToast,
}) => {
  const [keys, setKeys] = useState<ByokKeyStore>(() => getByokKeys());
  const [testingProvider, setTestingProvider] = useState<ProviderId | null>(null);
  const [testResults, setTestResults] = useState<Partial<Record<ProviderId, KeyTestResponse>>>({});

  useEffect(() => {
    if (isOpen) {
      setKeys(getByokKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const geminiValidation = keys.gemini ? validateApiKeyFormat('gemini', keys.gemini) : null;
  const groqValidation = keys.groq ? validateApiKeyFormat('groq', keys.groq) : null;
  const openrouterValidation = keys.openrouter
    ? validateApiKeyFormat('openrouter', keys.openrouter)
    : null;

  const handleTestSingleKey = async (provider: ProviderId) => {
    const rawKey = keys[provider];
    const check = validateApiKeyFormat(provider, rawKey);
    if (!check.valid) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          ok: false,
          provider,
          latencyMs: 0,
          modelTested: 'format-validation',
          message: check.message,
        },
      }));
      showToast(check.message, 'warning');
      return;
    }

    setTestingProvider(provider);
    try {
      const result = await testProviderApiKey(provider, rawKey);
      setTestResults((prev) => ({ ...prev, [provider]: result }));
      if (result.ok) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    for (const p of ['gemini', 'groq', 'openrouter'] as ProviderId[]) {
      if (keys[p].trim()) {
        const v = validateApiKeyFormat(p, keys[p]);
        if (!v.valid) {
          showToast(v.message, 'error');
          return;
        }
      }
    }
    saveByokKeys(keys);
    onKeysSaved(keys);
    showToast('Saved BYOK API keys to Browser Storage (localStorage)!', 'success');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="byok-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-2xl theme-bg-lowest bg-[#0d0e13] border border-[#2A3042] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 theme-bg-low bg-[#1a1b21] border-b border-[#1F2430] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#4edea3]" />
            <div>
              <h2 id="byok-modal-title" className="text-base font-bold text-white">
                🔑 BYOK Multi-Model API Rotator Settings
              </h2>
              <p className="text-xs font-mono text-[#908fa0]">
                100% Client-Side Browser Storage (`localStorage`) · Zero Server Persistence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close BYOK Settings Modal"
            className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#292a2f] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveAll} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. Google Gemini API Key */}
          <div className="p-4 rounded-xl theme-bg-low bg-[#1a1b21] border border-[#2A3042] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-white text-xs">
                  1. Google Gemini API Key (Primary Auto-Rotator & Gemini 4 Argon Pro)
                </span>
                <p className="text-[11px] text-[#c7c4d7] mt-0.5">
                  <strong>How to obtain:</strong> Visit Google AI Studio → Click{' '}
                  <em>"Get API key"</em> → Copy key starting with <code className="text-[#4edea3]">AIza...</code> (comma-separated rotation keys supported).
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#6366F1]/20 text-[#818CF8] hover:text-white font-mono text-[11px] flex items-center gap-1"
              >
                <span>Get Gemini Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                aria-label="Gemini API Key"
                value={keys.gemini}
                onChange={(e) => setKeys((prev) => ({ ...prev, gemini: e.target.value }))}
                placeholder="AIzaSy... (Paste one or comma-separated Gemini keys)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0d0e13] border border-[#2A3042] font-mono text-xs text-white focus:outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={() => handleTestSingleKey('gemini')}
                disabled={testingProvider === 'gemini'}
                className="px-3.5 py-2 rounded-lg bg-[#292a2f] hover:bg-[#34343a] text-white font-mono font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'gemini' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4edea3]" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                )}
                <span>Test Key</span>
              </button>
            </div>

            {geminiValidation && (
              <div
                className={`flex items-center gap-1.5 font-mono text-[11px] ${
                  geminiValidation.valid ? 'text-[#4edea3]' : 'text-amber-400'
                }`}
              >
                {geminiValidation.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{geminiValidation.message}</span>
              </div>
            )}
            {testResults.gemini && (
              <div
                className={`p-2 rounded bg-[#0d0e13] border font-mono text-[11px] ${
                  testResults.gemini.ok
                    ? 'border-[#4edea3]/40 text-[#4edea3]'
                    : 'border-rose-500/40 text-rose-400'
                }`}
              >
                [Test Result] {testResults.gemini.message}
              </div>
            )}
          </div>

          {/* 2. Groq Cloud API Key */}
          <div className="p-4 rounded-xl theme-bg-low bg-[#1a1b21] border border-[#2A3042] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-white text-xs">
                  2. Groq LPU API Key (Secondary Failover · Llama 3.3 70B Versatile)
                </span>
                <p className="text-[11px] text-[#c7c4d7] mt-0.5">
                  <strong>How to obtain:</strong> Open GroqCloud Console → Navigate to{' '}
                  <em>API Keys</em> → Create API Key and paste key starting with{' '}
                  <code className="text-[#4edea3]">gsk_...</code>
                </p>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#6366F1]/20 text-[#818CF8] hover:text-white font-mono text-[11px] flex items-center gap-1"
              >
                <span>Get Groq Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                aria-label="Groq API Key"
                value={keys.groq}
                onChange={(e) => setKeys((prev) => ({ ...prev, groq: e.target.value }))}
                placeholder="gsk_... (Groq LPU API Key)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0d0e13] border border-[#2A3042] font-mono text-xs text-white focus:outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={() => handleTestSingleKey('groq')}
                disabled={testingProvider === 'groq'}
                className="px-3.5 py-2 rounded-lg bg-[#292a2f] hover:bg-[#34343a] text-white font-mono font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'groq' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4edea3]" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                )}
                <span>Test Key</span>
              </button>
            </div>

            {groqValidation && (
              <div
                className={`flex items-center gap-1.5 font-mono text-[11px] ${
                  groqValidation.valid ? 'text-[#4edea3]' : 'text-amber-400'
                }`}
              >
                {groqValidation.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{groqValidation.message}</span>
              </div>
            )}
            {testResults.groq && (
              <div
                className={`p-2 rounded bg-[#0d0e13] border font-mono text-[11px] ${
                  testResults.groq.ok
                    ? 'border-[#4edea3]/40 text-[#4edea3]'
                    : 'border-rose-500/40 text-rose-400'
                }`}
              >
                [Test Result] {testResults.groq.message}
              </div>
            )}
          </div>

          {/* 3. OpenRouter API Key */}
          <div className="p-4 rounded-xl theme-bg-low bg-[#1a1b21] border border-[#2A3042] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-white text-xs">
                  3. OpenRouter API Key (Tertiary Free Failover · meta-llama/llama-3.3-70b-instruct:free)
                </span>
                <p className="text-[11px] text-[#c7c4d7] mt-0.5">
                  <strong>How to obtain:</strong> Visit OpenRouter Settings → Click{' '}
                  <em>Create Key</em> → Paste key starting with{' '}
                  <code className="text-[#4edea3]">sk-or-v1-...</code>
                </p>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#6366F1]/20 text-[#818CF8] hover:text-white font-mono text-[11px] flex items-center gap-1"
              >
                <span>Get OpenRouter Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                aria-label="OpenRouter API Key"
                value={keys.openrouter}
                onChange={(e) => setKeys((prev) => ({ ...prev, openrouter: e.target.value }))}
                placeholder="sk-or-v1-... (OpenRouter API Key)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0d0e13] border border-[#2A3042] font-mono text-xs text-white focus:outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={() => handleTestSingleKey('openrouter')}
                disabled={testingProvider === 'openrouter'}
                className="px-3.5 py-2 rounded-lg bg-[#292a2f] hover:bg-[#34343a] text-white font-mono font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testingProvider === 'openrouter' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4edea3]" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                )}
                <span>Test Key</span>
              </button>
            </div>

            {openrouterValidation && (
              <div
                className={`flex items-center gap-1.5 font-mono text-[11px] ${
                  openrouterValidation.valid ? 'text-[#4edea3]' : 'text-amber-400'
                }`}
              >
                {openrouterValidation.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{openrouterValidation.message}</span>
              </div>
            )}
            {testResults.openrouter && (
              <div
                className={`p-2 rounded bg-[#0d0e13] border font-mono text-[11px] ${
                  testResults.openrouter.ok
                    ? 'border-[#4edea3]/40 text-[#4edea3]'
                    : 'border-rose-500/40 text-rose-400'
                }`}
              >
                [Test Result] {testResults.openrouter.message}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1F2430]">
            <button
              type="button"
              onClick={() => {
                const cleared = { gemini: '', groq: '', openrouter: '' };
                setKeys(cleared);
                saveByokKeys(cleared);
                onKeysSaved(cleared);
                showToast('Cleared all BYOK keys from Browser Storage', 'info');
              }}
              className="px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 font-mono text-xs cursor-pointer"
            >
              Clear Stored Keys
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1a1b21] text-[#c7c4d7] hover:text-white font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white font-mono font-semibold text-xs cursor-pointer"
              >
                Save Keys to Browser Storage
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: '⌘ / Ctrl + S', desc: 'Save current artifact code snapshot to Browser Storage' },
    { keys: '⌘ / Ctrl + Shift + L', desc: 'Encode artifact into URL hash & copy shareable link' },
    { keys: '⌘ / Ctrl + Enter', desc: 'Run / synthesize AI artifact in Sandbox' },
    { keys: 'Alt + 1', desc: 'Switch to ⚡ Artifact Sandbox tab' },
    { keys: 'Alt + 2', desc: 'Switch to 🧪 Prompt Benchmarker tab' },
    { keys: 'Alt + 3', desc: 'Switch to 🛠️ Dev Utilities tab' },
    { keys: '⌘ / Ctrl + K', desc: 'Open 🔑 BYOK Multi-Model API Settings modal' },
    { keys: '⌘ / Ctrl + D', desc: 'Toggle Dark / Light Workspace Theme' },
    { keys: '?', desc: 'Open Keyboard Shortcuts Reference' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl theme-bg-lowest bg-[#0d0e13] border border-[#2A3042] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 theme-bg-low bg-[#1a1b21] border-b border-[#1F2430] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#818CF8]" />
            <h2 id="shortcuts-modal-title" className="text-base font-bold text-white">
              ⌨️ DevPulse AI Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Keyboard Shortcuts Modal"
            className="p-1.5 rounded-lg text-[#908fa0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-[#1a1b21] border border-[#2A3042]"
            >
              <span className="text-xs text-[#e3e1e9]">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-[#0d0e13] border border-[#3E465E] font-mono text-xs text-[#4edea3] shrink-0">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SimpleModalProps {
  type: 'deploy' | 'coffee' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const InfoActionModal: React.FC<SimpleModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl theme-bg-lowest bg-[#0d0e13] border border-[#2A3042] shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2430] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {type === 'deploy' && (
              <>
                <Rocket className="w-4 h-4 text-[#818CF8]" />
                <span>🚀 Deploy Artifact Live ($2.99/mo Partner Cloud)</span>
              </>
            )}
            {type === 'coffee' && (
              <>
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>☕ Support Zero-Login Open Dev Tools</span>
              </>
            )}
            {type === 'privacy' && <span>🔒 Zero-Login Privacy Architecture</span>}
            {type === 'terms' && <span>📜 Terms & Compliance Disclosure</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="text-[#908fa0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {type === 'deploy' && (
          <div className="space-y-3 text-xs text-[#c7c4d7]">
            <p>
              Deploy your synthesized HTML5 / Tailwind artifact to a global edge network with automatic SSL, custom domains, and zero cold starts.
            </p>
            <div className="p-3 rounded-lg bg-[#1a1b21] border border-[#2A3042] font-mono space-y-1">
              <div className="text-[#4edea3] font-bold">Edge Cloud Starter — $2.99/mo</div>
              <div>• Global Anycast CDN + Instant Rollbacks</div>
              <div>• Free Neon Serverless Postgres Branching</div>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white font-semibold flex items-center justify-center gap-2"
            >
              <span>Launch Edge Deployment</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {type === 'coffee' && (
          <div className="space-y-3 text-xs text-[#c7c4d7]">
            <p>
              DevPulse AI is 100% free with zero login walls. Your support keeps the multi-model API rotator and sandbox infrastructure fast for developers worldwide.
            </p>
            <a
              href="https://www.buymeacoffee.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>Buy the Maintainers a Coffee ($5)</span>
            </a>
          </div>
        )}

        {(type === 'privacy' || type === 'terms') && (
          <div className="space-y-2 text-xs text-[#c7c4d7] leading-relaxed">
            <p>
              <strong>Client-Side Storage Guarantee:</strong> All BYOK API keys, Git tokens, saved snippets, and prompt history are stored strictly inside your browser's local storage (`window.localStorage`).
            </p>
            <p>
              <strong>Affiliate & Partner Disclosure:</strong> DevPulse AI stays free without login walls via non-intrusive developer partner sponsorships.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: ModelOptionId;
}

export const CopilotChatDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  selectedModel,
}) => {
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      groundingUrls?: Array<{ title: string; uri: string }>;
    }>
  >([
    {
      role: 'assistant',
      content:
        'DevPulse AI Copilot online. Ask architectural questions, enable Google Search Grounding for live docs, or toggle High Thinking mode.',
    },
  ]);
  const [input, setInput] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [enableHighThinking, setEnableHighThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    const nextHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const keys = getByokKeys();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(keys.gemini ? { 'x-byok-gemini': keys.gemini } : {}),
        },
        body: JSON.stringify({
          messages: nextHistory,
          model: selectedModel,
          useGoogleSearch,
          enableHighThinking,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.text || 'Completed.',
          groundingUrls: data.groundingUrls || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error while reaching Copilot.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      aria-label="AI Copilot Drawer"
      className="fixed top-14 right-0 bottom-0 w-full max-w-md z-40 theme-bg-lowest bg-[#0d0e13] border-l border-[#2A3042] shadow-2xl flex flex-col"
    >
      <div className="p-3.5 theme-bg-low bg-[#1a1b21] border-b border-[#1F2430] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#818CF8]" />
          <span className="font-mono text-xs font-bold text-white">
            DevPulse Copilot (Search + High Thinking)
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Copilot Drawer"
          className="text-[#908fa0] hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3.5 py-2 bg-[#141620] border-b border-[#1F2430] flex items-center gap-2 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => setUseGoogleSearch((v) => !v)}
          className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
            useGoogleSearch ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'text-[#908fa0]'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Search Grounding: {useGoogleSearch ? 'ON' : 'OFF'}</span>
        </button>
        <button
          type="button"
          onClick={() => setEnableHighThinking((v) => !v)}
          className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
            enableHighThinking ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'text-[#908fa0]'
          }`}
        >
          <Brain className="w-3 h-3" />
          <span>Argon Thinking: {enableHighThinking ? 'HIGH' : 'STD'}</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl font-mono leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 text-white ml-6'
                : 'bg-[#1a1b21] border border-[#2A3042] text-[#e3e1e9] mr-4'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.groundingUrls && m.groundingUrls.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#2A3042] space-y-1">
                <div className="text-[10px] text-[#4edea3]">Google Search Citations:</div>
                {m.groundingUrls.map((u, idx) => (
                  <a
                    key={idx}
                    href={u.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[10px] text-[#818CF8] underline truncate"
                  >
                    {u.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 theme-bg-low bg-[#1a1b21] border-t border-[#1F2430] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot anything..."
          className="flex-1 px-3 py-2 rounded bg-[#0d0e13] border border-[#2A3042] font-mono text-xs text-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-2 rounded bg-[#6366F1] text-white font-mono text-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
