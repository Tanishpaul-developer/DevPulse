import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquarePlus,
  Bug,
  Sparkles,
  MessageCircle,
  Send,
  CheckCircle2,
  Trash2,
  Clock
} from 'lucide-react';
import {
  FeedbackCategory,
  UserFeedbackEntry,
  FEEDBACK_CATEGORIES,
  loadUserFeedbackEntries,
  submitUserFeedbackEntry,
  deleteUserFeedbackEntry
} from '../utils/studioEngine';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolSlug?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  activeToolSlug = 'ai-ui-generator'
}: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>('feature_request');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [entries, setEntries] = useState<UserFeedbackEntry[]>(() => loadUserFeedbackEntries());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationBanner, setConfirmationBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEntries(loadUserFeedbackEntries());
      setErrorBanner(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setErrorBanner('Please enter your feedback message before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    let syncedToBackend = false;
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: trimmed,
          email: email.trim() || undefined,
          activeTool: activeToolSlug
        })
      });
      if (response.ok) {
        syncedToBackend = true;
      }
    } catch {
      // Fallback gracefully to localStorage persistence if offline
    }

    try {
      const result = submitUserFeedbackEntry({
        category,
        message: trimmed,
        email: email.trim() || undefined,
        activeTool: activeToolSlug,
        syncedToBackend
      });
      setEntries(result.entries);
      setMessage('');
      const catLabel =
        FEEDBACK_CATEGORIES.find((c) => c.id === category)?.label || 'Feedback';
      setConfirmationBanner(
        `Thank you! Your ${catLabel.toLowerCase()} has been saved to localStorage${
          syncedToBackend ? ' and synced to /api/feedback' : ''
        }.`
      );
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to save feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const remaining = deleteUserFeedbackEntry(id);
    setEntries(remaining);
  };

  const getCategoryIcon = (cat: FeedbackCategory) => {
    if (cat === 'bug_report') return <Bug className="w-3.5 h-3.5 text-rose-400" />;
    if (cat === 'feature_request') return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    return <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getCategoryBadgeStyle = (cat: FeedbackCategory) => {
    if (cat === 'bug_report') {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    if (cat === 'feature_request') {
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      data-testid="user-feedback-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#0B0D14] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 id="feedback-modal-title" className="text-sm sm:text-base font-bold text-white">
                Send Product Feedback
              </h2>
              <p className="text-[11px] text-zinc-400">
                Report a bug, request a feature, or share general feedback for DevPulse AI
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-feedback-modal-btn"
            onClick={onClose}
            aria-label="Close Feedback Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {confirmationBanner && (
            <div
              data-testid="feedback-submit-confirmation"
              className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{confirmationBanner}</span>
            </div>
          )}

          {errorBanner && (
            <div
              data-testid="feedback-error-banner"
              className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300"
            >
              {errorBanner}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Feedback Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-testid={`feedback-category-${cat.id}`}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                          : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.18]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {getCategoryIcon(cat.id)}
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                        {cat.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-message-textarea"
                className="text-[11px] font-semibold text-zinc-300 block"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback-message-textarea"
                data-testid="feedback-message-input"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  category === 'bug_report'
                    ? 'Describe what happened, steps to reproduce, and expected behavior...'
                    : category === 'feature_request'
                    ? 'Describe the tool, workflow, or AI model capability you would like to see...'
                    : 'Share your thoughts on DevPulse AI...'
                }
                className="w-full rounded-xl bg-black/50 border border-white/[0.1] focus:border-indigo-500 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
              />
            </div>

            {/* Optional Email Input + Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="feedback-email-field"
                  className="text-[11px] text-zinc-400 block"
                >
                  Contact Email (Optional)
                </label>
                <input
                  id="feedback-email-field"
                  data-testid="feedback-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] focus:border-indigo-500 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                data-testid="submit-feedback-btn"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>

          {/* Stored Feedback Entries List */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Submitted Feedback History ({entries.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Persisted in localStorage &amp; /api/feedback
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-zinc-500">
                No feedback submitted yet. Share your first bug report, feature request, or general note above!
              </div>
            ) : (
              <div
                data-testid="feedback-entries-list"
                className="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                {entries.map((item) => {
                  const catMeta = FEEDBACK_CATEGORIES.find((c) => c.id === item.category);
                  return (
                    <div
                      key={item.id}
                      data-testid={`feedback-entry-${item.id}`}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 ${getCategoryBadgeStyle(
                              item.category
                            )}`}
                          >
                            {getCategoryIcon(item.category)}
                            <span>{catMeta?.label || item.category}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 break-words leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete feedback entry"
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
