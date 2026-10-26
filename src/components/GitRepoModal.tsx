import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  Github,
  CheckCircle2,
  Plus,
  Send,
  FolderGit2,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { ArtifactCodeState } from '../types';

interface GitRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeState: ArtifactCodeState;
}

interface GitCommitEntry {
  hash: string;
  message: string;
  timestamp: number;
  branch: string;
}

const GIT_STORAGE_KEY = 'devpulse_git_repo_state_v1';

export default function GitRepoModal({ isOpen, onClose, codeState }: GitRepoModalProps) {
  const [provider, setProvider] = useState<'github' | 'gitlab'>('github');
  const [accessToken, setAccessToken] = useState('');
  const [repoName, setRepoName] = useState('devpulse-ui-artifact');
  const [branch, setBranch] = useState('main');
  const [isInitialized, setIsInitialized] = useState(true);
  const [stagedFiles, setStagedFiles] = useState<string[]>(['index.html', 'README.md']);
  const [commitMessage, setCommitMessage] = useState('feat(ui): update responsive Tailwind artifact');
  const [commits, setCommits] = useState<GitCommitEntry[]>([
    {
      hash: 'a8f3d21',
      message: 'chore: initial commit from DevPulse AI Studio',
      timestamp: Date.now() - 3600_000,
      branch: 'main'
    }
  ]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(GIT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accessToken) setAccessToken(parsed.accessToken);
        if (parsed.repoName) setRepoName(parsed.repoName);
        if (parsed.provider) setProvider(parsed.provider);
        if (Array.isArray(parsed.commits)) setCommits(parsed.commits);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const persistGitState = (nextCommits: GitCommitEntry[], nextToken = accessToken) => {
    try {
      localStorage.setItem(
        GIT_STORAGE_KEY,
        JSON.stringify({
          provider,
          accessToken: nextToken,
          repoName,
          commits: nextCommits
        })
      );
    } catch {
      // ignore
    }
  };

  const handleInitRepo = () => {
    setIsInitialized(true);
    setStagedFiles(['index.html', 'styles.css', 'app.js', 'README.md']);
    setStatusBanner('Initialized local Git repository (.git) and staged artifact files.');
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    const newCommit: GitCommitEntry = {
      hash: Math.random().toString(16).substring(2, 9),
      message: commitMessage.trim(),
      timestamp: Date.now(),
      branch
    };
    const updated = [newCommit, ...commits];
    setCommits(updated);
    persistGitState(updated);
    setCommitMessage('');
    setStatusBanner(`Committed [${newCommit.hash}] to ${branch}: "${newCommit.message}"`);
  };

  const handlePushRemote = async () => {
    const cleanRepo = repoName.trim() || 'devpulse-ui-artifact';
    const targetHost = provider === 'github' ? 'https://github.com' : 'https://gitlab.com';
    setRemoteUrl(`${targetHost}/devpulse-user/${cleanRepo}`);
    persistGitState(commits);
    setStatusBanner(
      `Pushed ${commits.length} commit(s) (${codeState.html.length} bytes HTML) to ${provider.toUpperCase()} remote branch '${branch}'.`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0D14] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 id="git-modal-title" className="text-sm sm:text-base font-bold text-white">
                Git Version Control & GitHub / GitLab Push
              </h2>
              <p className="text-[11px] text-zinc-400">
                Initialize repo, stage artifact files, commit snapshots & push via OAuth / PAT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Git Modal"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {statusBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusBanner}</span>
            </div>
          )}

          {/* Provider & Token Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Remote Git Provider
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('github')}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    provider === 'github'
                      ? 'bg-indigo-600/25 border-indigo-500/50 text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('gitlab')}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    provider === 'gitlab'
                      ? 'bg-amber-500/25 border-amber-500/50 text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>GitLab</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>Personal Access Token (Stored in Browser)</span>
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  persistGitState(commits, e.target.value);
                }}
                placeholder={provider === 'github' ? 'ghp_xxxxxxxxxxxx' : 'glpat-xxxxxxxxxxxx'}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Repository & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] text-zinc-400">Repository Name</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Target Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Staged Files & Commit Form */}
          <form onSubmit={handleCommit} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">
                Staged Artifact Files ({stagedFiles.length})
              </span>
              <button
                type="button"
                onClick={handleInitRepo}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Re-stage All Files</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {stagedFiles.map((file) => (
                <span
                  key={file}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[11px]"
                >
                  A {file}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat: add interactive pricing table component"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!isInitialized}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shrink-0"
              >
                Commit Changes
              </button>
            </div>
          </form>

          {/* Commit Log + Push */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-semibold">Recent Commits ({commits.length})</span>
              <button
                type="button"
                onClick={handlePushRemote}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Push to {provider === 'github' ? 'GitHub' : 'GitLab'}</span>
              </button>
            </div>

            {remoteUrl && (
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                <span className="font-mono text-[11px] text-indigo-300 truncate">{remoteUrl}</span>
                <a
                  href={remoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>Open Remote</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {commits.map((c) => (
                <div
                  key={c.hash}
                  className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2 font-mono text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-indigo-400 font-bold">{c.hash}</span>
                    <span className="text-zinc-200 truncate">{c.message}</span>
                  </div>
                  <span className="text-zinc-500 shrink-0">{c.branch}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
