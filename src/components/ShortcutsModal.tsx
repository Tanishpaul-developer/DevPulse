import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS_LIST = [
  { keys: '⌘ / Ctrl + K', desc: 'Open 12+ Tool Liquid Glass Bento Grid Switcher' },
  { keys: '⌘ / Ctrl + B', desc: 'Collapse / Expand Left Workspace Sidebar' },
  { keys: '⌘ / Ctrl + Enter', desc: 'Run / Reload Live Artifact Preview' },
  { keys: '⌘ / Ctrl + S', desc: 'Save Artifact Snapshot to Version History' },
  { keys: '⌘ / Ctrl + Shift + S', desc: 'Copy Shareable Compressed Artifact URL' },
  { keys: '⌘ / Ctrl + Shift + F', desc: 'AI Refactor Selected Code Block in Editor' },
  { keys: '⌘ / Ctrl + Shift + G', desc: 'Open Git Repository & GitHub/GitLab Push Modal' },
  { keys: '⌘ / Ctrl + Shift + J', desc: 'Toggle Integrated Runtime Console & Auto-Healer' },
  { keys: '⌘ / Ctrl + Shift + L', desc: 'Toggle Dark / Light Workspace Theme' },
  { keys: '?', desc: 'Open Keyboard Shortcuts Reference' }
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0B0D14] border border-white/[0.12] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h2 id="shortcuts-modal-heading" className="text-base font-bold text-white">
              ⌨️ DevPulse AI Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Keyboard Shortcuts Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2 max-h-[75vh] overflow-y-auto">
          {SHORTCUTS_LIST.map((item) => (
            <div
              key={item.keys}
              className="flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]"
            >
              <span className="text-xs text-zinc-200">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-indigo-500/30 font-mono text-[11px] text-emerald-300 shrink-0">
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
