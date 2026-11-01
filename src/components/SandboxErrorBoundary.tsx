import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface SandboxErrorBoundaryProps {
  children: ReactNode;
  onResetWorkspace?: () => void;
  workspaceName?: string;
}

interface SandboxErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class SandboxErrorBoundary extends Component<
  SandboxErrorBoundaryProps,
  SandboxErrorBoundaryState
> {
  public state: SandboxErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): SandboxErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected runtime exception in workspace component.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DevPulse SandboxErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onResetWorkspace) {
      this.props.onResetWorkspace();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          data-testid="sandbox-error-boundary-fallback"
          className="m-4 sm:m-6 p-6 sm:p-8 rounded-3xl bg-[#0B0D14] border border-rose-500/40 shadow-2xl text-zinc-100 max-w-2xl mx-auto space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Workspace Runtime Isolated Safely
              </h2>
              <p className="text-xs text-zinc-400">
                {this.props.workspaceName || 'The active tool workspace'} encountered a runtime error. Your saved snippets and settings are safe.
              </p>
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-black/70 border border-white/[0.08] font-mono text-xs text-rose-300 overflow-x-auto whitespace-pre-wrap">
            {this.state.errorMessage}
          </pre>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              data-testid="error-boundary-reset-btn"
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>1-Click Reset Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SandboxErrorBoundary;
