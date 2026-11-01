import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Cpu,
  Clock,
  Zap,
  Trash2,
  Plus,
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  UsageHistoryEntry,
  loadAiUsageHistory,
  recordAiUsageHistoryEntry,
  clearAiUsageHistory,
  filterAiUsageHistory
} from '../utils/studioEngine';

interface UsageHistoryViewProps {
  onReplayPromptInSandbox?: (prompt: string) => void;
}

export default function UsageHistoryView({
  onReplayPromptInSandbox
}: UsageHistoryViewProps) {
  const [entries, setEntries] = useState<UsageHistoryEntry[]>(() => loadAiUsageHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [quickPromptInput, setQuickPromptInput] = useState('');
  const [selectedModelInput, setSelectedModelInput] = useState('gemini-3.8-flash');

  useEffect(() => {
    const syncHistory = () => {
      setEntries(loadAiUsageHistory());
    };
    window.addEventListener('devpulse-usage-history-updated', syncHistory);
    window.addEventListener('storage', syncHistory);
    return () => {
      window.removeEventListener('devpulse-usage-history-updated', syncHistory);
      window.removeEventListener('storage', syncHistory);
    };
  }, []);

  const filteredEntries = useMemo(
    () => filterAiUsageHistory(entries, searchQuery, modelFilter),
    [entries, searchQuery, modelFilter]
  );

  const summaryStats = useMemo(() => {
    const totalInteractions = entries.length;
    const totalTokens = entries.reduce((sum, item) => sum + item.estimatedTokens, 0);
    const avgLatencyMs =
      totalInteractions > 0
        ? Math.round(entries.reduce((sum, item) => sum + item.latencyMs, 0) / totalInteractions)
        : 0;
    const avgTokensPerSec =
      totalInteractions > 0
        ? Math.round(
            entries.reduce((sum, item) => sum + item.tokensPerSec, 0) / totalInteractions
          )
        : 0;
    return { totalInteractions, totalTokens, avgLatencyMs, avgTokensPerSec };
  }, [entries]);

  const handleRecordManualInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    const promptText =
      quickPromptInput.trim() ||
      'Synthesize a responsive Tailwind CSS analytics card with sparkline telemetry and dark glassmorphic surface.';
    const simulatedResponse = `<div class="p-6 rounded-2xl bg-[#12141D] border border-[#2A3042] text-white"><h3>${promptText.slice(
      0,
      48
    )}</h3><p class="text-emerald-400 font-mono">Throughput: 1,420 req/s · P99: 12ms</p></div>`;

    const providerLabel =
      selectedModelInput === 'groq-llama-70b'
        ? 'Groq Cloud LPU (Llama 3.3 70B)'
        : selectedModelInput === 'gemini-4-argon'
        ? 'Google Gemini 4 Argon (Pro)'
        : 'Google Gemini Auto-Rotator';

    const { history } = recordAiUsageHistoryEntry({
      modelUsed: selectedModelInput,
      providerUsed: providerLabel,
      prompt: promptText,
      responseText: simulatedResponse,
      latencyMs: selectedModelInput === 'groq-llama-70b' ? 195 : 310,
      category: 'Interactive Prompt Log'
    });
    setEntries(history);
    setQuickPromptInput('');
  };

  const handleClearHistory = () => {
    const cleared = clearAiUsageHistory();
    setEntries(cleared);
  };

  return (
    <div
      data-testid="usage-history-section"
      className="flex-1 p-4 lg:p-6 bg-[#06070B] text-zinc-100 space-y-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            AI TELEMETRY &amp; AUDIT LOG · LOCALSTORAGE PERSISTED
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Usage History</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Chronological log of all AI interactions across DevPulse AI, displaying the model used, prompt, response snippet, estimated token count, and execution time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              data-testid="usage-history-search-input"
              aria-label="Search Usage History"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter prompts, responses, models..."
              className="bg-[#0D0E13] border border-white/[0.1] focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter by AI Model"
            data-testid="usage-history-model-filter"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-[#0D0E13] border border-white/[0.1] focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Models ({entries.length})</option>
            <option value="gemini-3.8-flash">Gemini Flash</option>
            <option value="groq-llama-70b">Groq Llama 3.3 70B</option>
            <option value="gemini-4-argon">Gemini 4 Argon</option>
          </select>

          <button
            type="button"
            data-testid="clear-usage-history-btn"
            onClick={handleClearHistory}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Summary Telemetry KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="text-[11px] text-zinc-400 font-medium">Total AI Interactions</div>
          <div
            data-testid="usage-history-total-count"
            className="text-2xl font-mono font-bold text-white mt-1"
          >
            {summaryStats.totalInteractions}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="text-[11px] text-zinc-400 font-medium">Estimated Total Tokens</div>
          <div
            data-testid="usage-history-total-tokens"
            className="text-2xl font-mono font-bold text-indigo-400 mt-1"
          >
            {summaryStats.totalTokens.toLocaleString()} tok
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="text-[11px] text-zinc-400 font-medium">Average Execution Latency</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {summaryStats.avgLatencyMs} ms
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="text-[11px] text-zinc-400 font-medium">Average Throughput</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {summaryStats.avgTokensPerSec} tok/s
          </div>
        </div>
      </div>

      {/* Quick Record / Test AI Interaction Bar */}
      <form
        onSubmit={handleRecordManualInteraction}
        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Log Interaction:</span>
        </div>
        <select
          aria-label="Model for Quick Log"
          value={selectedModelInput}
          onChange={(e) => setSelectedModelInput(e.target.value)}
          className="bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
        >
          <option value="gemini-3.8-flash">gemini-3.8-flash</option>
          <option value="groq-llama-70b">groq-llama-70b</option>
          <option value="gemini-4-argon">gemini-4-argon</option>
        </select>
        <input
          type="text"
          data-testid="usage-history-quick-prompt-input"
          value={quickPromptInput}
          onChange={(e) => setQuickPromptInput(e.target.value)}
          placeholder="Enter a prompt to log a new chronological AI interaction..."
          className="flex-1 bg-black/60 border border-white/[0.1] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          data-testid="usage-history-add-entry-btn"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Interaction</span>
        </button>
      </form>

      {/* Chronological AI Interactions List */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-2">
          <History className="w-8 h-8 text-zinc-500 mx-auto" />
          <div className="text-sm font-bold text-white">No AI Interactions Found</div>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Generate a UI component in the Visual Artifact Studio or use the Quick Log bar above to record new AI interactions in localStorage.
          </p>
        </div>
      ) : (
        <div data-testid="usage-history-list" className="space-y-3">
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              data-testid={`usage-history-item-${entry.id}`}
              className="p-4 rounded-2xl bg-[#0D0E13] border border-white/[0.08] hover:border-indigo-500/40 transition-all space-y-3"
            >
              {/* Top Metadata Row: Model Used, Provider, Token Count, Latency, Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-500">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    data-testid="usage-entry-model"
                    className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold inline-flex items-center gap-1.5"
                  >
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    <span>{entry.modelUsed}</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {entry.providerUsed}
                  </span>
                  {entry.category && (
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-300">
                      {entry.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span
                    data-testid="usage-entry-tokens"
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-emerald-400" />
                    <span>~{entry.estimatedTokens} tokens</span>
                  </span>
                  <span
                    data-testid="usage-entry-latency"
                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>
                      {entry.latencyMs} ms ({entry.tokensPerSec} tok/s)
                    </span>
                  </span>
                  <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Prompt & Response Snippet */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                    Prompt
                  </div>
                  <p
                    data-testid="usage-entry-prompt"
                    className="text-xs text-zinc-100 leading-relaxed break-words"
                  >
                    {entry.prompt}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Response Snippet
                    </span>
                    {onReplayPromptInSandbox && (
                      <button
                        type="button"
                        onClick={() => onReplayPromptInSandbox(entry.prompt)}
                        className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Load in Studio</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p
                    data-testid="usage-entry-response-snippet"
                    className="text-xs font-mono text-zinc-300 leading-relaxed break-words"
                  >
                    {entry.responseSnippet}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
