import { type ArtifactCodeState } from './urlHash.ts';

export type GitProviderId = 'github' | 'gitlab';

export interface GitFileStatus {
  path: 'index.html' | 'styles.css' | 'app.js';
  tabKey: 'html' | 'css' | 'js';
  status: 'unmodified' | 'modified' | 'added';
  staged: boolean;
  linesAdded: number;
  linesRemoved: number;
}

export interface GitCommitRecord {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  snapshot: ArtifactCodeState;
  pushed: boolean;
}

export interface GitAccountConnection {
  provider: GitProviderId;
  username: string;
  accessToken: string;
  connectedAt: string;
  avatarUrl?: string;
}

export interface GitOAuthClientConfig {
  githubClientId: string;
  githubClientSecret: string;
  gitlabClientId: string;
  gitlabClientSecret: string;
}

export interface GitRepoState {
  initialized: boolean;
  repoName: string;
  branch: string;
  remoteUrl: string;
  provider: GitProviderId;
  stagedFiles: Array<'index.html' | 'styles.css' | 'app.js'>;
  commits: GitCommitRecord[];
  lastPushUrl?: string;
  lastPushTimestamp?: string;
}

export const GIT_REPO_STORAGE_KEY = 'devpulse_git_repo_v1';
export const GIT_ACCOUNTS_STORAGE_KEY = 'devpulse_git_accounts_v1';
export const GIT_OAUTH_CONFIG_STORAGE_KEY = 'devpulse_git_oauth_config_v1';

/**
 * Generates a deterministic-looking 7-character Git short SHA from content & timestamp.
 */
export function generateGitSha(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  const suffix = Math.abs(seed.length * 2654435761 >>> 0).toString(16).slice(0, 3);
  return (hex + suffix).slice(0, 7);
}

/**
 * Initializes a new Git repository state for the current artifact.
 */
export function initGitRepository(
  repoName = 'devpulse-artifact',
  provider: GitProviderId = 'github',
  username = 'developer'
): GitRepoState {
  const cleanName = repoName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-') || 'devpulse-artifact';

  const domain = provider === 'github' ? 'github.com' : 'gitlab.com';
  return {
    initialized: true,
    repoName: cleanName,
    branch: 'main',
    remoteUrl: `https://${domain}/${username}/${cleanName}.git`,
    provider,
    stagedFiles: [],
    commits: [],
  };
}

/**
 * Computes working tree file changes by comparing current artifact code against HEAD commit.
 */
export function computeGitWorkingTree(
  currentCode: ArtifactCodeState,
  repoState: GitRepoState
): GitFileStatus[] {
  const headSnapshot: ArtifactCodeState | null =
    repoState.commits.length > 0 ? repoState.commits[0].snapshot : null;

  const fileDefs: Array<{
    path: 'index.html' | 'styles.css' | 'app.js';
    tabKey: 'html' | 'css' | 'js';
  }> = [
    { path: 'index.html', tabKey: 'html' },
    { path: 'styles.css', tabKey: 'css' },
    { path: 'app.js', tabKey: 'js' },
  ];

  return fileDefs.map(({ path, tabKey }) => {
    const currentContent = (currentCode[tabKey] || '').trim();
    const headContent = headSnapshot ? (headSnapshot[tabKey] || '').trim() : '';

    const currentLines = currentContent ? currentContent.split('\n') : [];
    const headLines = headContent ? headContent.split('\n') : [];

    let status: 'unmodified' | 'modified' | 'added' = 'unmodified';
    let linesAdded = 0;
    let linesRemoved = 0;

    if (!headSnapshot) {
      if (currentContent.length > 0 || path === 'index.html') {
        status = 'added';
        linesAdded = Math.max(1, currentLines.length);
      }
    } else if (currentContent !== headContent) {
      status = 'modified';
      const headSet = new Set(headLines);
      const currSet = new Set(currentLines);
      linesAdded = currentLines.filter((l) => !headSet.has(l)).length;
      linesRemoved = headLines.filter((l) => !currSet.has(l)).length;
      if (linesAdded === 0 && linesRemoved === 0) {
        linesAdded = 1;
      }
    }

    const staged = repoState.stagedFiles.includes(path) && status !== 'unmodified';

    return {
      path,
      tabKey,
      status,
      staged,
      linesAdded,
      linesRemoved,
    };
  });
}

/**
 * Stages or unstages a specific file or all modified files.
 */
export function toggleStageFile(
  repoState: GitRepoState,
  filePath: 'index.html' | 'styles.css' | 'app.js'
): GitRepoState {
  const exists = repoState.stagedFiles.includes(filePath);
  const nextStaged = exists
    ? repoState.stagedFiles.filter((f) => f !== filePath)
    : [...repoState.stagedFiles, filePath];
  return {
    ...repoState,
    stagedFiles: nextStaged,
  };
}

/**
 * Stages all modified/added files in the working tree.
 */
export function stageAllModifiedFiles(
  currentCode: ArtifactCodeState,
  repoState: GitRepoState
): GitRepoState {
  const tree = computeGitWorkingTree(currentCode, repoState);
  const changedPaths = tree
    .filter((f) => f.status !== 'unmodified')
    .map((f) => f.path);
  return {
    ...repoState,
    stagedFiles: changedPaths,
  };
}

/**
 * Creates a new commit from staged changes.
 */
export function createGitCommit(
  currentCode: ArtifactCodeState,
  repoState: GitRepoState,
  commitMessage: string,
  author = 'developer'
): { nextState: GitRepoState; commit: GitCommitRecord } {
  const trimmedMsg = commitMessage.trim();
  if (!trimmedMsg) {
    throw new Error('Commit message is required.');
  }
  if (repoState.stagedFiles.length === 0) {
    throw new Error('No staged changes to commit. Stage files first.');
  }

  const prevSnapshot: ArtifactCodeState =
    repoState.commits.length > 0
      ? { ...repoState.commits[0].snapshot }
      : { html: '', css: '', js: '', prompt: currentCode.prompt };

  const nextSnapshot: ArtifactCodeState = {
    ...prevSnapshot,
    prompt: currentCode.prompt,
  };

  if (repoState.stagedFiles.includes('index.html')) {
    nextSnapshot.html = currentCode.html;
  }
  if (repoState.stagedFiles.includes('styles.css')) {
    nextSnapshot.css = currentCode.css;
  }
  if (repoState.stagedFiles.includes('app.js')) {
    nextSnapshot.js = currentCode.js;
  }

  const timestamp = new Date().toISOString();
  const sha = generateGitSha(`${trimmedMsg}:${timestamp}:${nextSnapshot.html.length}`);

  const commit: GitCommitRecord = {
    sha,
    message: trimmedMsg,
    author,
    timestamp,
    branch: repoState.branch,
    snapshot: nextSnapshot,
    pushed: false,
  };

  const nextState: GitRepoState = {
    ...repoState,
    stagedFiles: [],
    commits: [commit, ...repoState.commits],
  };

  return { nextState, commit };
}

/**
 * Marks all commits as pushed to the remote repository.
 */
export function markCommitsPushed(
  repoState: GitRepoState,
  remoteWebUrl?: string
): GitRepoState {
  return {
    ...repoState,
    commits: repoState.commits.map((c) => ({ ...c, pushed: true })),
    lastPushUrl: remoteWebUrl || repoState.remoteUrl.replace(/\.git$/, ''),
    lastPushTimestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Replaces a selected substring range [selectionStart, selectionEnd] inside source code
 * with refactored code returned by the AI. If selectionStart === selectionEnd, replaces the entire code.
 */
export function applyRefactoredCodeSelection(
  originalCode: string,
  refactoredSnippet: string,
  selectionStart: number,
  selectionEnd: number
): { updatedCode: string; newSelectionStart: number; newSelectionEnd: number } {
  const cleanRefactored = refactoredSnippet.trim();
  const start = Math.max(0, Math.min(selectionStart, originalCode.length));
  const end = Math.max(start, Math.min(selectionEnd, originalCode.length));

  if (start === end) {
    return {
      updatedCode: cleanRefactored,
      newSelectionStart: 0,
      newSelectionEnd: cleanRefactored.length,
    };
  }

  const before = originalCode.slice(0, start);
  const after = originalCode.slice(end);
  const updatedCode = `${before}${cleanRefactored}${after}`;

  return {
    updatedCode,
    newSelectionStart: start,
    newSelectionEnd: start + cleanRefactored.length,
  };
}
