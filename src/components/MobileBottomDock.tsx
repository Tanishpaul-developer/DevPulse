import React from 'react';
import {
  LayoutGrid,
  Zap,
  Camera,
  Wrench,
  Key
} from 'lucide-react';
import { WorkspaceNavId } from './LeftSidebar';

interface MobileBottomDockProps {
  activeNav: WorkspaceNavId;
  onSelectNav: (id: WorkspaceNavId) => void;
  onOpenBentoHub: () => void;
  onOpenByokModal: () => void;
}

export default function MobileBottomDock({
  activeNav,
  onSelectNav,
  onOpenBentoHub,
  onOpenByokModal
}: MobileBottomDockProps) {
  const isToolsActive = activeNav.startsWith('tool-') || activeNav.startsWith('labs-');

  return (
    <nav
      aria-label="Mobile Bottom Navigation Dock"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-2 pt-1 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-md mx-auto rounded-2xl bg-[#06070B]/90 backdrop-blur-2xl border border-white/[0.14] shadow-2xl shadow-black/90 grid grid-cols-5 items-center px-1 py-1">
        <button
          onClick={onOpenBentoHub}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <span className="truncate">Bento Hub</span>
        </button>

        <button
          onClick={() => onSelectNav('studio-sandbox')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            activeNav === 'studio-sandbox'
              ? 'bg-indigo-600/25 text-white border border-indigo-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="truncate">AI Sandbox</span>
        </button>

        <button
          onClick={() => onSelectNav('studio-vision')}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            activeNav === 'studio-vision'
              ? 'bg-fuchsia-600/25 text-white border border-fuchsia-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-fuchsia-400" />
          <span className="truncate">Vision</span>
        </button>

        <button
          onClick={onOpenBentoHub}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            isToolsActive
              ? 'bg-cyan-600/25 text-white border border-cyan-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span className="truncate">12+ Tools</span>
        </button>

        <button
          onClick={onOpenByokModal}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-amber-300 hover:text-amber-200 active:scale-95 transition-all cursor-pointer"
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span className="truncate">API Keys</span>
        </button>
      </div>
    </nav>
  );
}
