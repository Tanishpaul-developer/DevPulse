import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Copy,
  Check,
  Share2,
  Download,
  Rocket,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Code2,
  Eye,
  Clock,
  Trash2,
  ChevronRight,
  GitBranch,
  Wand2,
  Package,
  Terminal,
  History,
  Sliders,
  Plus,
  AlertTriangle,
  Info,
  XCircle,
  Globe,
  Crosshair,
  Gauge,
  FileCode2,
  Camera,
  Columns,
  Bug,
  Sun,
  Moon,
  FileDown,
  Megaphone,
  ExternalLink,
  Keyboard,
  Search,
  Layers,
  QrCode,
  FolderArchive,
  Activity,
  FlaskConical,
  Users,
  MousePointer2,
  CheckCircle2,
  Github
} from 'lucide-react';
import {
  ArtifactCodeState,
  SavedSnippet,
  ModelId,
  CdnDependency,
  ConsoleLogEntry,
  VersionSnapshot,
  ModelParameters
} from '../types';
import { buildSandboxSrcDoc, encodeArtifactToHash } from '../utils/urlHash';
import {
  generateArtifactCode,
  refactorCodeBlock,
  autoHealConsoleErrorWithAi,
  editElementWithAiInstruction
} from '../services/aiRouter';
import {
  formatArtifactCode,
  computeArtifactPerformanceMetrics,
  convertArtifactToFramework,
  applyElementInspectionEdit,
  persistArtifactAutoSave,
  buildSocialShareDraft,
  generateArtifactPdfDocument,
  resetArtifactToStarterTemplate,
  SANDBOX_SHORTCUTS_BAR_ITEMS,
  AUTOSAVE_INTERVAL_MS,
  ExportFrameworkId,
  filterConsoleLogs,
  cleanupAndFormatArtifactState,
  SavedStarterTemplate,
  loadSavedStarterTemplates,
  saveCustomStarterTemplate,
  deleteSavedStarterTemplate,
  computeCodeHealthMetrics,
  buildShareableArtifactUrl,
  generateUrlQrCodeSvg,
  generateProjectZipArchive,
  generateAllSavedSnippetsZipArchive,
  buildVercelDeploymentPayload,
  runArtifactJestSuite,
  ArtifactTestSuiteResult,
  CollaboratorPresence,
  CollabRealtimeEvent,
  createLocalCollaboratorProfile,
  applyCollaboratorCursorEvent,
  injectViralWatermarkBadge,
  submitIdeExportForm,
  deriveArtifactPresenceRoomId
} from '../utils/studioEngine';
import { formatArtifactWithPrettierWorker } from '../utils/prettierWorkerClient';
import GitRepoModal, { GITHUB_OAUTH_STORAGE_KEY, GitHubOAuthUser } from './GitRepoModal';

interface ArtifactSandboxProps {
  codeState: ArtifactCodeState;
  onChangeCode: (next: ArtifactCodeState) => void;
  selectedModel: ModelId;
  onRequireByok: (reason?: string) => void;
  onOpenHosting: () => void;
  onShareUrl: () => void;
  shareCopied: boolean;
  savedSnippets: SavedSnippet[];
  onSaveSnippet: (title: string) => void;
  onLoadSnippet: (snippet: SavedSnippet) => void;
  onDeleteSnippet: (id: string) => void;
  saveTriggerCount?: number;
  runTriggerCount?: number;
  gitTriggerCount?: number;
  refactorTriggerCount?: number;
  dependenciesTriggerCount?: number;
  historyTriggerCount?: number;
  consoleTriggerCount?: number;
  paramsTriggerCount?: number;
  modelParams: ModelParameters;
  onUpdateModelParams: (params: ModelParameters) => void;
  onResetModelParams: () => void;
  onOpenVisionCloner?: () => void;
  onOpenGallery?: () => void;
  onOpenAiChat?: () => void;
  activeToolSlug?: string;
  activeToolName?: string;
  activeToolDescription?: string;
  lastAutoSavedAt?: number;
}

const PRESET_PROMPTS = [
  {
    label: 'SaaS Pricing Table',
    prompt: 'Create a high-conversion SaaS pricing table with Monthly/Annual toggle, highlighted Pro tier, feature comparison checklist, and interactive FAQ accordion.'
  },
  {
    label: 'Pomodoro Focus Timer',
    prompt: 'Build a sleek Pomodoro productivity timer with 25m Focus / 5m Break modes, circular SVG progress ring, task queue manager, and session analytics.'
  },
  {
    label: 'Crypto Portfolio Tracker',
    prompt: 'Create a real-time cryptocurrency portfolio dashboard with interactive allocation bar, live simulated price ticker, P&L calculator, and transaction log.'
  },
  {
    label: 'Interactive Kanban Board',
    prompt: 'Build a drag-and-drop style Kanban board with Backlog, In Progress, Review, and Done columns, priority badges, and an Add Task modal.'
  }
];

const POPULAR_CDNS: CdnDependency[] = [
  {
    id: 'cdn-lucide',
    name: 'Lucide Icons (UMD)',
    url: 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js',
    type: 'script',
    description: 'Clean, consistent open-source icon toolkit'
  },
  {
    id: 'cdn-chartjs',
    name: 'Chart.js 4.4',
    url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    type: 'script',
    description: 'Simple yet flexible JavaScript charting library'
  },
  {
    id: 'cdn-canvas-confetti',
    name: 'Canvas Confetti',
    url: 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js',
    type: 'script',
    description: 'Performant confetti animation effects on canvas'
  },
  {
    id: 'cdn-gsap',
    name: 'GSAP 3.12 (GreenSock)',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    type: 'script',
    description: 'Professional-grade JavaScript animation library'
  },
  {
    id: 'cdn-alpine',
    name: 'Alpine.js 3.x',
    url: 'https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js',
    type: 'script',
    description: 'Rugged, minimal reactive framework for HTML markup'
  },
  {
    id: 'cdn-animate-css',
    name: 'Animate.css 4.1',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    type: 'style',
    description: 'Ready-to-use cross-browser CSS animations'
  },
  {
    id: 'cdn-fontawesome',
    name: 'Font Awesome 6.5',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    type: 'style',
    description: 'Iconic font and CSS toolkit'
  }
];

const HISTORY_STORAGE_KEY = 'devpulse_artifact_version_history_v1';

interface SelectedElementMeta {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
}

export default function ArtifactSandbox({
  codeState,
  onChangeCode,
  selectedModel,
  onRequireByok,
  onOpenHosting,
  onShareUrl,
  shareCopied,
  savedSnippets,
  onSaveSnippet,
  onLoadSnippet,
  onDeleteSnippet,
  saveTriggerCount = 0,
  runTriggerCount = 0,
  gitTriggerCount = 0,
  refactorTriggerCount = 0,
  dependenciesTriggerCount = 0,
  historyTriggerCount = 0,
  consoleTriggerCount = 0,
  paramsTriggerCount = 0,
  modelParams,
  onUpdateModelParams,
  onResetModelParams,
  onOpenVisionCloner,
  activeToolSlug = 'ai-ui-generator',
  activeToolName = 'AI UI & Artifact Studio',
  activeToolDescription = 'Generate, inspect, and live-preview responsive HTML5, Tailwind CSS, and React TSX components in real time.',
  lastAutoSavedAt
}: ArtifactSandboxProps) {
  const [promptInput, setPromptInput] = useState(codeState.prompt || '');
  // CRITICAL UX FIX: Default view is ALWAYS 'preview' so users NEVER see a raw HTML code wall on load!
  const [studioMode, setStudioMode] = useState<'preview' | 'code' | 'split'>('preview');
  const [activeEditorTab, setActiveEditorTab] = useState<'combined' | 'html' | 'css' | 'js'>('combined');
  const [exportFramework, setExportFramework] = useState<ExportFrameworkId>('html');
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isAutoHealing, setIsAutoHealing] = useState(false);
  const [lastProviderBadge, setLastProviderBadge] = useState<string>('Ready');
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-save every 5 seconds inside ArtifactSandbox + status indicator
  const [internalAutoSavedAt, setInternalAutoSavedAt] = useState<number>(() => lastAutoSavedAt || Date.now());
  const latestCodeRef = useRef<ArtifactCodeState>(codeState);
  useEffect(() => {
    latestCodeRef.current = codeState;
  }, [codeState]);

  useEffect(() => {
    if (lastAutoSavedAt) {
      setInternalAutoSavedAt(lastAutoSavedAt);
    }
  }, [lastAutoSavedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const meta = persistArtifactAutoSave(latestCodeRef.current);
      setInternalAutoSavedAt(meta.savedAt);
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Social Share Modal, QR Code Share, Reset Confirmation Modal, PDF & ZIP Project Export State
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [socialDraftText, setSocialDraftText] = useState('');
  const [copiedSocialDraft, setCopiedSocialDraft] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [projectZipped, setProjectZipped] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccessBanner, setResetSuccessBanner] = useState(false);
  const [includeViralBadge, setIncludeViralBadge] = useState(true);
  const [isIdeExportOpen, setIsIdeExportOpen] = useState(false);

  // Side drawers & modals
  const [showDependenciesDrawer, setShowDependenciesDrawer] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showSavedSnippetsDrawer, setShowSavedSnippetsDrawer] = useState(false);
  const [allSnippetsZipped, setAllSnippetsZipped] = useState(false);
  const [showParamsDrawer, setShowParamsDrawer] = useState(false);
  const [showSeoDrawer, setShowSeoDrawer] = useState(false);
  const [showConsolePanel, setShowConsolePanel] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [gitModalInitialTarget, setGitModalInitialTarget] = useState<'repo' | 'gist'>('repo');
  const [isFormattingPrettier, setIsFormattingPrettier] = useState(false);
  const [connectedGitHubUser, setConnectedGitHubUser] = useState<GitHubOAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(GITHUB_OAUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user?.login) return parsed.user;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Save Snippet input
  const [snippetTitleInput, setSnippetTitleInput] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Custom CDN input
  const [customCdnName, setCustomCdnName] = useState('');
  const [customCdnUrl, setCustomCdnUrl] = useState('');
  const [customCdnType, setCustomCdnType] = useState<'script' | 'style'>('script');

  // Selection tracking for Refactor Code
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; text: string } | null>(null);
  const [refactorStatus, setRefactorStatus] = useState<string | null>(null);

  // Visual Point-and-Click Inspector State
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementMeta | null>(null);
  const [elementTextDraft, setElementTextDraft] = useState('');
  const [elementClassDraft, setElementClassDraft] = useState('');
  const [elementAiInstruction, setElementAiInstruction] = useState('');
  const [isUpdatingElementAi, setIsUpdatingElementAi] = useState(false);

  // Performance Metrics & Code Health State
  const [runtimeLoadTimeMs, setRuntimeLoadTimeMs] = useState<number | null>(null);
  const staticPerfMetrics = useMemo(
    () => computeArtifactPerformanceMetrics(codeState, runtimeLoadTimeMs ?? undefined),
    [codeState, runtimeLoadTimeMs]
  );
  const codeHealthMetrics = useMemo(
    () => computeCodeHealthMetrics(codeState),
    [codeState]
  );

  // Console logs captured from iframe
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [consoleSearchQuery, setConsoleSearchQuery] = useState('');

  // Cleanup & Format heuristic feedback state
  const [cleanupStatusBanner, setCleanupStatusBanner] = useState<string | null>(null);

  // Saved Starter Templates Modal state
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false);
  const [starterTemplates, setStarterTemplates] = useState<SavedStarterTemplate[]>(() =>
    loadSavedStarterTemplates()
  );
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [templateDescInput, setTemplateDescInput] = useState('');
  const [templateCategoryInput, setTemplateCategoryInput] =
    useState<SavedStarterTemplate['category']>('Custom Boilerplate');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateSavedBanner, setTemplateSavedBanner] = useState(false);

  // 1. Deploy to Vercel API State
  const [isDeployingVercel, setIsDeployingVercel] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [vercelTokenInput, setVercelTokenInput] = useState('');
  const [vercelDeployCopied, setVercelDeployCopied] = useState(false);
  const [vercelDeployResult, setVercelDeployResult] = useState<{
    id: string;
    name: string;
    url: string;
    vercelAliasUrl?: string;
    inspectorUrl: string;
    readyState: string;
    createdAt: number;
    mode: string;
    filesDeployed: string[];
  } | null>(null);

  // 2. Jest-Like Test Runner Suite State
  const [lastTestSuiteResult, setLastTestSuiteResult] = useState<ArtifactTestSuiteResult | null>(null);

  // 3. Real-Time Multi-User Presence & Cursor Tracking State (WebSocket + Server SSE + WebRTC BroadcastChannel)
  const localCollabProfile = useMemo(() => {
    let savedId = '';
    try {
      savedId = sessionStorage.getItem('devpulse_collab_client_id') || '';
      if (!savedId) {
        savedId = `peer-${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('devpulse_collab_client_id', savedId);
      }
    } catch {
      savedId = `peer-${Math.random().toString(36).slice(2, 8)}`;
    }
    return createLocalCollaboratorProfile(savedId);
  }, []);

  const shareableArtifactUrl = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://yourdomain.com';
    return buildShareableArtifactUrl(codeState, activeToolSlug, origin);
  }, [codeState, activeToolSlug]);

  const collabRoomId = useMemo(
    () => deriveArtifactPresenceRoomId(shareableArtifactUrl, activeToolSlug),
    [shareableArtifactUrl, activeToolSlug]
  );

  const [remotePeers, setRemotePeers] = useState<CollaboratorPresence[]>([]);
  const [showRemoteCursors, setShowRemoteCursors] = useState(true);
  const [presenceTransport, setPresenceTransport] = useState<'WebSocket' | 'SSE'>('WebSocket');
  const lastCursorEmitRef = useRef<number>(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const wsClientRef = useRef<WebSocket | null>(null);
  const sandboxContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      if (typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const qs = new URLSearchParams({
          roomId: collabRoomId,
          clientId: localCollabProfile.clientId,
          name: localCollabProfile.name,
          color: localCollabProfile.color
        });
        ws = new WebSocket(`${wsProto}//${window.location.host}/ws/collab?${qs.toString()}`);
        wsClientRef.current = ws;
        ws.onopen = () => {
          setPresenceTransport('WebSocket');
        };
        ws.onmessage = (evt) => {
          try {
            const parsed = JSON.parse(String(evt.data)) as CollabRealtimeEvent;
            setRemotePeers((prev) =>
              applyCollaboratorCursorEvent(prev, parsed, localCollabProfile.clientId)
            );
          } catch {
            // ignore malformed WebSocket frame
          }
        };
      }
    } catch {
      // fallback to SSE below
    }

    let eventSource: EventSource | null = null;
    try {
      const qs = new URLSearchParams({
        roomId: collabRoomId,
        clientId: localCollabProfile.clientId,
        name: localCollabProfile.name,
        color: localCollabProfile.color
      });
      eventSource = new EventSource(`/api/collab/stream?${qs.toString()}`);
      eventSource.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data) as CollabRealtimeEvent;
          setRemotePeers((prev) =>
            applyCollaboratorCursorEvent(prev, parsed, localCollabProfile.clientId)
          );
        } catch {
          // ignore malformed SSE frame
        }
      };
    } catch {
      // ignore SSE setup errors in offline environments
    }

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(`devpulse_collab_${collabRoomId}`);
        broadcastChannelRef.current = channel;
        channel.onmessage = (evt) => {
          const data = evt.data as CollabRealtimeEvent;
          if (data && data.type) {
            setRemotePeers((prev) =>
              applyCollaboratorCursorEvent(prev, data, localCollabProfile.clientId)
            );
          }
        };
        channel.postMessage({
          type: 'user:joined',
          roomId: collabRoomId,
          peer: localCollabProfile,
          timestamp: Date.now()
        } satisfies CollabRealtimeEvent);
      }
    } catch {
      // ignore BroadcastChannel errors
    }

    return () => {
      try {
        ws?.close();
      } catch {
        // ignore
      }
      wsClientRef.current = null;
      eventSource?.close();
      channel?.close();
      broadcastChannelRef.current = null;
    };
  }, [collabRoomId, localCollabProfile]);

  // Version history snapshots in localStorage
  const [versionHistory, setVersionHistory] = useState<VersionSnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'snap-initial',
        label: 'Initial SaaS Revenue Dashboard',
        timestamp: Date.now() - 120000,
        codeState
      }
    ];
  });

  const pushVersionSnapshot = (label: string, snapshotState: ArtifactCodeState) => {
    setVersionHistory((prev) => {
      const next: VersionSnapshot[] = [
        {
          id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label,
          timestamp: Date.now(),
          codeState: snapshotState
        },
        ...prev.slice(0, 24)
      ];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== 'devpulse-sandbox') return;

      if (data.type === 'console') {
        const level = (['log', 'warn', 'error', 'info'].includes(data.level) ? data.level : 'log') as ConsoleLogEntry['level'];
        const message = Array.isArray(data.args) ? data.args.join(' ') : String(data.args || '');
        setConsoleLogs((prev) => [
          ...prev.slice(-99),
          {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level,
            message,
            timestamp: data.timestamp || Date.now()
          }
        ]);
      } else if (data.type === 'element-selected' && data.element) {
        setSelectedElement(data.element);
        setElementTextDraft(data.element.textContent || '');
        setElementClassDraft(data.element.className || '');
      } else if (data.type === 'perf-metrics') {
        if (typeof data.loadTimeMs === 'number') {
          setRuntimeLoadTimeMs(data.loadTimeMs);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { target: 'devpulse-sandbox', type: 'toggle-inspect', enabled: inspectMode },
          '*'
        );
      } catch {
        // ignore cross-origin frame message error
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [inspectMode, refreshKey]);

  useEffect(() => {
    if (saveTriggerCount > 0) setShowSaveInput(true);
  }, [saveTriggerCount]);

  useEffect(() => {
    if (runTriggerCount > 0) {
      setConsoleLogs([]);
      setRefreshKey((k) => k + 1);
    }
  }, [runTriggerCount]);

  useEffect(() => {
    if (gitTriggerCount > 0) setIsGitModalOpen(true);
  }, [gitTriggerCount]);

  useEffect(() => {
    if (refactorTriggerCount > 0) handleRefactorSelection();
  }, [refactorTriggerCount]);

  useEffect(() => {
    if (dependenciesTriggerCount > 0) setShowDependenciesDrawer((v) => !v);
  }, [dependenciesTriggerCount]);

  useEffect(() => {
    if (historyTriggerCount > 0) setShowHistoryDrawer((v) => !v);
  }, [historyTriggerCount]);

  useEffect(() => {
    if (consoleTriggerCount > 0) setShowConsolePanel((v) => !v);
  }, [consoleTriggerCount]);

  useEffect(() => {
    if (paramsTriggerCount > 0) setShowParamsDrawer((v) => !v);
  }, [paramsTriggerCount]);

  const srcDoc = useMemo(
    () => buildSandboxSrcDoc(codeState, true, previewTheme),
    [codeState, refreshKey, previewTheme]
  );
  const exportedFrameworkView = useMemo(
    () => convertArtifactToFramework(codeState, exportFramework),
    [codeState, exportFramework]
  );

  const handleGenerate = async (overridePrompt?: string) => {
    const targetPrompt = (overridePrompt ?? promptInput).trim();
    if (!targetPrompt || isGenerating) return;

    setIsGenerating(true);
    setConsoleLogs([]);
    const res = await generateArtifactCode(targetPrompt, selectedModel, modelParams);
    setIsGenerating(false);

    if (res.requiresByok) {
      onRequireByok(res.error);
      return;
    }

    if (res.error) {
      setLastProviderBadge(`Error: ${res.error}`);
      return;
    }

    const nextState: ArtifactCodeState = {
      ...codeState,
      html: res.content,
      css: '',
      js: '',
      prompt: targetPrompt
    };
    onChangeCode(nextState);
    pushVersionSnapshot(`AI Generated: ${targetPrompt.slice(0, 32)}...`, nextState);
    setLastProviderBadge(res.providerUsed);
    setLastLatency(res.latencyMs);
  };

  const handleFormatCode = async () => {
    if (isFormattingPrettier) return;
    if (exportFramework !== 'html') {
      setExportFramework('html');
    }
    setIsFormattingPrettier(true);
    try {
      const result = await formatArtifactWithPrettierWorker(codeState);
      const nextState: ArtifactCodeState = {
        ...codeState,
        html: result.html,
        css: result.css,
        js: result.js
      };
      onChangeCode(nextState);
      pushVersionSnapshot(
        `Formatted Code (${result.formattedBy} in ${result.durationMs}ms)`,
        nextState
      );
      setLastProviderBadge(`Prettier Worker (${result.durationMs}ms)`);
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 1800);
    } catch {
      const nextState: ArtifactCodeState = {
        ...codeState,
        html: formatArtifactCode(codeState.html, 'html'),
        css: codeState.css ? formatArtifactCode(codeState.css, 'css') : '',
        js: codeState.js ? formatArtifactCode(codeState.js, 'js') : ''
      };
      onChangeCode(nextState);
      pushVersionSnapshot('Formatted Code (Prettier Engine)', nextState);
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 1800);
    } finally {
      setIsFormattingPrettier(false);
    }
  };

  const handleTextareaSelect = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      setSelectionRange({
        start,
        end,
        text: el.value.substring(start, end)
      });
    } else {
      setSelectionRange(null);
    }
  };

  const getActiveCodeValue = () => {
    if (exportFramework !== 'html') {
      return exportedFrameworkView.code;
    }
    if (activeEditorTab === 'combined' || activeEditorTab === 'html') return codeState.html;
    if (activeEditorTab === 'css') return codeState.css;
    return codeState.js;
  };

  const updateActiveCodeValue = (nextVal: string, snapshotLabel?: string) => {
    if (exportFramework !== 'html') {
      setExportFramework('html');
    }
    let nextState: ArtifactCodeState;
    if (activeEditorTab === 'combined' || activeEditorTab === 'html') {
      nextState = { ...codeState, html: nextVal };
    } else if (activeEditorTab === 'css') {
      nextState = { ...codeState, css: nextVal };
    } else {
      nextState = { ...codeState, js: nextVal };
    }
    onChangeCode(nextState);
    if (snapshotLabel) {
      pushVersionSnapshot(snapshotLabel, nextState);
    }
  };

  const handleRefactorSelection = async () => {
    if (isRefactoring) return;
    const fullCode = getActiveCodeValue();
    const hasSelection = selectionRange && selectionRange.text.trim().length > 0;
    const targetSnippet = hasSelection ? selectionRange!.text : fullCode;

    if (!targetSnippet.trim()) return;

    setIsRefactoring(true);
    setRefactorStatus(hasSelection ? 'Refactoring selected block...' : 'Refactoring entire file...');

    const languageLabel =
      activeEditorTab === 'css' ? 'CSS' : activeEditorTab === 'js' ? 'JavaScript' : 'HTML/Tailwind/JS';

    const res = await refactorCodeBlock(targetSnippet, languageLabel, selectedModel, modelParams);
    setIsRefactoring(false);

    if (res.requiresByok) {
      setRefactorStatus(null);
      onRequireByok(res.error);
      return;
    }

    if (res.error) {
      setRefactorStatus(`Error: ${res.error}`);
      setTimeout(() => setRefactorStatus(null), 3000);
      return;
    }

    const refactored = res.content.trim();
    if (hasSelection && selectionRange) {
      const updated =
        fullCode.substring(0, selectionRange.start) +
        refactored +
        fullCode.substring(selectionRange.end);
      updateActiveCodeValue(updated, 'AI Refactored Selection');
      setSelectionRange(null);
    } else {
      updateActiveCodeValue(refactored, 'AI Refactored Entire File');
    }

    setLastProviderBadge(res.providerUsed);
    setLastLatency(res.latencyMs);
    setRefactorStatus('Refactored cleanly!');
    setTimeout(() => setRefactorStatus(null), 2200);
  };

  const handleAutoHealErrors = async () => {
    const errorEntries = consoleLogs.filter((l) => l.level === 'error');
    if (errorEntries.length === 0 || isAutoHealing) return;

    setIsAutoHealing(true);
    const combinedErrorMsg = errorEntries.map((e) => e.message).join(' | ');
    const res = await autoHealConsoleErrorWithAi(codeState.html, combinedErrorMsg, selectedModel);
    setIsAutoHealing(false);

    if (res.requiresByok) {
      onRequireByok(res.error);
      return;
    }

    if (res.content && res.content.trim()) {
      const nextState: ArtifactCodeState = {
        ...codeState,
        html: res.content
      };
      onChangeCode(nextState);
      pushVersionSnapshot(`Auto-Healed Error: ${combinedErrorMsg.slice(0, 32)}`, nextState);
      setConsoleLogs([]);
      setRefreshKey((k) => k + 1);
      setLastProviderBadge(`${res.providerUsed} (Auto-Healed)`);
      setLastLatency(res.latencyMs);
    }
  };

  const handleApplyDirectElementEdit = () => {
    if (!selectedElement) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        {
          target: 'devpulse-sandbox',
          type: 'update-selected-element',
          textContent: elementTextDraft,
          className: elementClassDraft
        },
        '*'
      );
    } catch {
      // ignore
    }

    const updatedHtml = applyElementInspectionEdit(
      codeState.html,
      selectedElement.textContent,
      elementTextDraft,
      selectedElement.className,
      elementClassDraft
    );

    const nextState: ArtifactCodeState = {
      ...codeState,
      html: updatedHtml
    };
    onChangeCode(nextState);
    pushVersionSnapshot(`Edited <${selectedElement.tagName}> via Inspector`, nextState);
    setSelectedElement({
      ...selectedElement,
      textContent: elementTextDraft,
      className: elementClassDraft
    });
  };

  const handleApplyAiElementInstruction = async () => {
    if (!selectedElement || !elementAiInstruction.trim() || isUpdatingElementAi) return;
    setIsUpdatingElementAi(true);
    const res = await editElementWithAiInstruction(
      codeState.html,
      selectedElement,
      elementAiInstruction.trim(),
      selectedModel
    );
    setIsUpdatingElementAi(false);

    if (res.content && res.content.trim()) {
      const nextState: ArtifactCodeState = {
        ...codeState,
        html: res.content
      };
      onChangeCode(nextState);
      pushVersionSnapshot(`AI Element Edit: ${elementAiInstruction.slice(0, 28)}`, nextState);
      setElementAiInstruction('');
      setLastProviderBadge(res.providerUsed);
    }
  };

  const handleToggleDependency = (cdn: CdnDependency) => {
    const currentDeps = codeState.dependencies || [];
    const exists = currentDeps.some((d) => d.url === cdn.url);
    const nextDeps = exists
      ? currentDeps.filter((d) => d.url !== cdn.url)
      : [...currentDeps, cdn];
    const nextState = { ...codeState, dependencies: nextDeps };
    onChangeCode(nextState);
    pushVersionSnapshot(`${exists ? 'Removed' : 'Added'} CDN: ${cdn.name}`, nextState);
  };

  const handleAddCustomDependency = () => {
    if (!customCdnName.trim() || !customCdnUrl.trim()) return;
    const newDep: CdnDependency = {
      id: `custom-${Date.now()}`,
      name: customCdnName.trim(),
      url: customCdnUrl.trim(),
      type: customCdnType,
      description: 'Custom user-injected CDN resource'
    };
    const nextDeps = [...(codeState.dependencies || []), newDep];
    const nextState = { ...codeState, dependencies: nextDeps };
    onChangeCode(nextState);
    pushVersionSnapshot(`Added Custom CDN: ${newDep.name}`, nextState);
    setCustomCdnName('');
    setCustomCdnUrl('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportFramework === 'html' ? srcDoc : exportedFrameworkView.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const socialShareDraft = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://yourdomain.com';
    return buildSocialShareDraft({
      toolSlug: activeToolSlug,
      toolName: activeToolName,
      toolDescription: activeToolDescription,
      codeState,
      origin
    });
  }, [activeToolSlug, activeToolName, activeToolDescription, codeState]);

  const artifactQrCode = useMemo(
    () => generateUrlQrCodeSvg(shareableArtifactUrl, 140),
    [shareableArtifactUrl]
  );

  const handleOpenSocialShare = () => {
    setSocialDraftText(socialShareDraft.postText);
    setCopiedSocialDraft(false);
    setCopiedQrUrl(false);
    setIsSocialShareOpen(true);
  };

  const handleCopySocialDraft = () => {
    navigator.clipboard?.writeText(socialDraftText || socialShareDraft.postText)?.catch(() => {});
    setCopiedSocialDraft(true);
    setTimeout(() => setCopiedSocialDraft(false), 2000);
  };

  const handleCopyQrShareUrl = () => {
    navigator.clipboard?.writeText(shareableArtifactUrl)?.catch(() => {});
    setCopiedQrUrl(true);
    setTimeout(() => setCopiedQrUrl(false), 2000);
  };

  const handleDownloadQrCodeSvg = () => {
    const blob = new Blob([artifactQrCode.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devpulse-qr-${activeToolSlug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const { pdfBytes, filename } = generateArtifactPdfDocument(codeState, activeToolName);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 2500);
  };

  const handleExportProjectZip = () => {
    const { zipBytes, filename } = generateProjectZipArchive(codeState);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setProjectZipped(true);
    setTimeout(() => setProjectZipped(false), 2500);
  };

  const handleDownloadAllSavedSnippetsZip = () => {
    const snippetsToExport =
      savedSnippets.length > 0
        ? savedSnippets
        : [
            {
              id: 'current-artifact',
              title: codeState.seoTitle || codeState.prompt || 'Current Artifact',
              codeState,
              createdAt: Date.now()
            }
          ];
    const { zipBytes, filename } = generateAllSavedSnippetsZipArchive(snippetsToExport);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setAllSnippetsZipped(true);
    setTimeout(() => setAllSnippetsZipped(false), 2500);
  };

  const handleDownloadHtml = () => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://devpulse.ai';
    const rawHtmlDoc = exportFramework === 'html' ? srcDoc : exportedFrameworkView.code;
    const content =
      exportFramework === 'html'
        ? injectViralWatermarkBadge(rawHtmlDoc, origin, includeViralBadge)
        : rawHtmlDoc;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFramework === 'html' ? `devpulse-artifact-${Date.now()}.html` : exportedFrameworkView.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareLiveUrlWithWatermark = () => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://devpulse.ai';
    if (includeViralBadge) {
      const watermarkedState: ArtifactCodeState = {
        ...codeState,
        html: injectViralWatermarkBadge(codeState.html, origin, true)
      };
      const hash = encodeArtifactToHash(watermarkedState);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
      navigator.clipboard?.writeText(window.location.href)?.catch(() => {});
    }
    onShareUrl();
  };

  const handleExportToIde = (ide: 'codepen' | 'stackblitz' | 'jsfiddle') => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://devpulse.ai';
    submitIdeExportForm(ide, codeState, {
      includeViralBadge,
      origin,
      title: codeState.seoTitle || 'DevPulse AI Artifact'
    });
    setIsIdeExportOpen(false);
  };

  const handleConfirmSaveSnippet = () => {
    const title = snippetTitleInput.trim() || promptInput.slice(0, 40) || 'Untitled Artifact';
    onSaveSnippet(title);
    pushVersionSnapshot(`Saved Snapshot: ${title}`, codeState);
    setSnippetTitleInput('');
    setShowSaveInput(false);
  };

  const handleConfirmResetArtifact = () => {
    const starter = resetArtifactToStarterTemplate();
    onChangeCode(starter);
    setPromptInput(starter.prompt || '');
    setConsoleLogs([]);
    setSelectedElement(null);
    setInspectMode(false);
    setRefreshKey((k) => k + 1);
    pushVersionSnapshot('Reset to Default Starter Template', starter);
    setIsResetConfirmOpen(false);
    setResetSuccessBanner(true);
    setTimeout(() => setResetSuccessBanner(false), 2500);
  };

  const handleShortcutBarAction = (shortcutId: (typeof SANDBOX_SHORTCUTS_BAR_ITEMS)[number]['id']) => {
    if (shortcutId === 'run') {
      setConsoleLogs([]);
      setRefreshKey((k) => k + 1);
    } else if (shortcutId === 'save') {
      const title = promptInput.trim().slice(0, 40) || codeState.seoTitle || 'Quick Saved Artifact';
      onSaveSnippet(title);
      pushVersionSnapshot(`Quick Saved: ${title}`, codeState);
    } else if (shortcutId === 'share') {
      onShareUrl();
    } else if (shortcutId === 'refactor') {
      handleRefactorSelection();
    } else if (shortcutId === 'console') {
      setShowConsolePanel((v) => !v);
    } else if (shortcutId === 'bento') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    }
  };

  const handleCleanupAndFormat = () => {
    const result = cleanupAndFormatArtifactState(codeState);
    onChangeCode(result.cleanedState);
    pushVersionSnapshot(`Cleanup & Format (${result.summaryMessage})`, result.cleanedState);
    setCleanupStatusBanner(result.summaryMessage);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setCleanupStatusBanner(null), 3200);
  };

  const handleSaveCurrentAsStarterTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSave =
      templateNameInput.trim() ||
      codeState.seoTitle ||
      promptInput.trim().slice(0, 40) ||
      'Custom Boilerplate Starter';
    const result = saveCustomStarterTemplate({
      name: nameToSave,
      description: templateDescInput.trim() || codeState.prompt || 'Reusable custom starter boilerplate',
      category: templateCategoryInput,
      codeState
    });
    setStarterTemplates(result.templates);
    setTemplateNameInput('');
    setTemplateDescInput('');
    setTemplateSavedBanner(true);
    setTimeout(() => setTemplateSavedBanner(false), 2500);
  };

  const handleLoadStarterTemplate = (template: SavedStarterTemplate) => {
    const nextState: ArtifactCodeState = {
      html: template.codeState.html,
      css: template.codeState.css || '',
      js: template.codeState.js || '',
      prompt: template.codeState.prompt || template.name,
      seoTitle: template.codeState.seoTitle || template.name,
      seoDescription: template.codeState.seoDescription || template.description,
      dependencies: template.codeState.dependencies ? [...template.codeState.dependencies] : []
    };
    onChangeCode(nextState);
    setPromptInput(nextState.prompt || '');
    setConsoleLogs([]);
    setSelectedElement(null);
    setInspectMode(false);
    setRefreshKey((k) => k + 1);
    pushVersionSnapshot(`Loaded Starter Template: ${template.name}`, nextState);
    setIsStarterTemplatesOpen(false);
  };

  const handleDeleteStarterTemplate = (templateId: string) => {
    const remaining = deleteSavedStarterTemplate(templateId);
    setStarterTemplates(remaining);
  };

  const filteredStarterTemplates = useMemo(() => {
    const q = templateSearchQuery.trim().toLowerCase();
    if (!q) return starterTemplates;
    return starterTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [starterTemplates, templateSearchQuery]);

  const handleRunTestsSuite = () => {
    const suiteResult = runArtifactJestSuite(codeState);
    setLastTestSuiteResult(suiteResult);
    setShowConsolePanel(true);
    setConsoleFilter('all');
    setConsoleSearchQuery('');

    const now = Date.now();
    const newEntries: ConsoleLogEntry[] = suiteResult.consoleFormattedLines.map((line, idx) => ({
      id: `jest-${now}-${idx}`,
      level: line.level,
      message: line.message,
      timestamp: now + idx
    }));

    setConsoleLogs((prev) => [...prev, ...newEntries]);
  };

  const handleDeployToVercel = async (customToken?: string) => {
    if (isDeployingVercel) return;
    setIsDeployingVercel(true);
    const payload = buildVercelDeploymentPayload(codeState);

    try {
      const response = await fetch('/api/deploy-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          vercelToken: (customToken ?? vercelTokenInput).trim()
        })
      });
      const data = await response.json();
      if (data && data.deployment) {
        setVercelDeployResult(data.deployment);
        setIsVercelModalOpen(true);
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `vercel-deploy-${Date.now()}`,
            level: 'log',
            message: `[Vercel API v13] Deployed standalone project "${data.deployment.name}" (${data.deployment.filesDeployed.join(', ')}) → ${data.deployment.vercelAliasUrl || data.deployment.url}`,
            timestamp: Date.now()
          }
        ]);
      }
    } catch (err) {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `vercel-err-${Date.now()}`,
          level: 'error',
          message: `[Vercel Deploy Error] ${err instanceof Error ? err.message : 'Network error'}`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsDeployingVercel(false);
    }
  };

  const handleSandboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastCursorEmitRef.current < 80) return;
    lastCursorEmitRef.current = now;

    const rect = sandboxContainerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const updatedSelf: CollaboratorPresence = {
      ...localCollabProfile,
      xPercent: Math.min(98, Math.max(2, xPercent)),
      yPercent: Math.min(98, Math.max(2, yPercent)),
      activeTab: studioMode,
      lastUpdatedAt: now
    };

    try {
      if (wsClientRef.current && wsClientRef.current.readyState === WebSocket.OPEN) {
        wsClientRef.current.send(
          JSON.stringify({
            type: 'cursor:moved',
            roomId: collabRoomId,
            peer: updatedSelf,
            timestamp: now
          })
        );
      }
    } catch {
      // ignore
    }

    try {
      broadcastChannelRef.current?.postMessage({
        type: 'cursor:moved',
        roomId: collabRoomId,
        peer: updatedSelf,
        timestamp: now
      } satisfies CollabRealtimeEvent);
    } catch {
      // ignore
    }

    fetch('/api/collab/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: collabRoomId,
        type: 'cursor:moved',
        peer: updatedSelf
      })
    }).catch(() => {});
  };

  const handleSpawnCollaboratorCursor = async () => {
    const peerProfile = createLocalCollaboratorProfile(
      `peer-live-${Math.random().toString(36).slice(2, 6)}`
    );
    const positionedPeer: CollaboratorPresence = {
      ...peerProfile,
      xPercent: Math.floor(25 + Math.random() * 55),
      yPercent: Math.floor(28 + Math.random() * 48),
      activeTab: studioMode,
      lastUpdatedAt: Date.now()
    };

    setShowRemoteCursors(true);
    setRemotePeers((prev) =>
      applyCollaboratorCursorEvent(
        prev,
        {
          type: 'cursor:moved',
          roomId: collabRoomId,
          peer: positionedPeer,
          timestamp: Date.now()
        },
        localCollabProfile.clientId
      )
    );

    try {
      await fetch('/api/collab/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: collabRoomId,
          type: 'cursor:moved',
          peer: positionedPeer
        })
      });
    } catch {
      // ignore
    }
  };

  const activeDependencies = codeState.dependencies || [];
  const filteredLogs = filterConsoleLogs(consoleLogs, consoleFilter, consoleSearchQuery);
  const errorCount = consoleLogs.filter((l) => l.level === 'error').length;

  const showCodePane = !isFullscreen && (studioMode === 'code' || studioMode === 'split');
  const showPreviewPane = isFullscreen || studioMode === 'preview' || studioMode === 'split';

  return (
    <div
      ref={sandboxContainerRef}
      onMouseMove={handleSandboxMouseMove}
      className="flex flex-col min-h-[780px] bg-[#06070B] relative overflow-hidden"
    >
      {/* Liquid Glass Top Workspace Control Bar: Segmented Pill Switcher + Floating AI Prompt Bar */}
      <div className="px-3 sm:px-5 py-3 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl space-y-3">
        {/* Top Row: Segmented Pill Switcher + Studio Utility Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Sleek Floating Segmented Pill Switcher */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-black/60 border border-white/[0.1] shadow-inner">
            <button
              onClick={() => setStudioMode('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'preview'
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
            <button
              onClick={() => setStudioMode('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'code'
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => setStudioMode('split')}
              className={`hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'split'
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split Studio</span>
            </button>
          </div>

          {/* Quick Studio Drawers (Auto-Save Status, Toggle Preview Theme, Export to PDF, Vision AI, AI Params, SEO Head, CDN Deps, History, Git) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div
              data-testid="autosave-status-badge"
              title="Auto-save persists your current code editor state to browser localStorage every 5 seconds"
              className="text-[11px] font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-saved (5s)</span>
              <span className="hidden sm:inline text-emerald-400/80">
                {new Date(internalAutoSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Real-Time Shareable Artifact URL Presence Pill (WebSocket + SSE) */}
            <div
              data-testid="collab-presence-badge"
              title={`Real-time presence room for this shareable artifact URL (${collabRoomId}) via ${presenceTransport}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200"
            >
              <button
                type="button"
                data-testid="toggle-collab-cursors-btn"
                onClick={() => setShowRemoteCursors((prev) => !prev)}
                title="Toggle real-time multi-user presence & cursor tracking overlay for this shareable artifact URL"
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold" data-testid="presence-viewer-count">
                  {remotePeers.length + 1} Viewing Artifact URL
                </span>
                <span
                  data-testid="presence-room-pill"
                  className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-indigo-500/20 text-[10px] font-mono text-indigo-300"
                >
                  {presenceTransport} • #{collabRoomId.slice(-6)}
                </span>
              </button>
              <div className="flex items-center -space-x-1.5 ml-0.5">
                <span
                  title={`You: ${localCollabProfile.name}`}
                  style={{ backgroundColor: localCollabProfile.color }}
                  className="w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center ring-1 ring-black"
                >
                  {localCollabProfile.name.charAt(0)}
                </span>
                {remotePeers.slice(0, 3).map((peer) => (
                  <span
                    key={peer.clientId}
                    title={`${peer.name} (${peer.xPercent}%, ${peer.yPercent}%)`}
                    style={{ backgroundColor: peer.color }}
                    className="w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center ring-1 ring-black"
                  >
                    {peer.name.charAt(0)}
                  </span>
                ))}
              </div>
              <button
                type="button"
                data-testid="spawn-collab-peer-btn"
                onClick={handleSpawnCollaboratorCursor}
                title="Simulate/connect an additional real-time developer viewing this shareable artifact URL"
                className="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-500/25 hover:bg-indigo-500/40 text-[10px] font-mono font-bold text-indigo-200 transition-colors cursor-pointer"
              >
                + Peer
              </button>
            </div>

            {/* Run Tests (Jest-like Suite) Button */}
            <button
              type="button"
              data-testid="run-tests-btn"
              onClick={handleRunTestsSuite}
              title="Run a Jest-like unit & DOM assertion suite against the generated HTML, CSS, and JS code and display results in the Console Panel"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                lastTestSuiteResult
                  ? lastTestSuiteResult.allPassed
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-500/30'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run Tests</span>
              {lastTestSuiteResult && (
                <span
                  data-testid="run-tests-badge"
                  className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono font-bold"
                >
                  {lastTestSuiteResult.passedCount}/{lastTestSuiteResult.totalCount}
                </span>
              )}
            </button>

            {/* 1-Click Deploy to Vercel Button */}
            <button
              type="button"
              data-testid="deploy-vercel-btn"
              onClick={() => handleDeployToVercel()}
              disabled={isDeployingVercel}
              title="Deploy the current project structure (HTML, CSS, JS, vercel.json) as a standalone site via the Vercel v13 API"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold border border-white/80 shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <span className="text-[11px] leading-none">▲</span>
              <span>{isDeployingVercel ? 'Deploying...' : 'Deploy to Vercel'}</span>
            </button>

            <button
              type="button"
              data-testid="toggle-preview-theme-btn"
              onClick={() => setPreviewTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title="Switch between Dark and Light mode rendering for your generated UI artifact without changing the global application theme"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                previewTheme === 'light'
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.1]'
              }`}
            >
              {previewTheme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>Toggle Preview Theme</span>
              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                  previewTheme === 'light'
                    ? 'bg-amber-500/30 text-amber-100'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {previewTheme}
              </span>
            </button>

            <button
              type="button"
              data-testid="export-pdf-btn"
              onClick={handleExportPdf}
              title="Download your rendered artifact as a clean, formatted PDF document for documentation"
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 transition-colors cursor-pointer"
            >
              {pdfExported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PDF Exported!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export to PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="export-project-zip-btn"
              onClick={handleExportProjectZip}
              title="Zip current HTML, CSS, JS, and README.md into a local multi-file project archive (.zip)"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                projectZipped
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border-teal-500/30'
              }`}
            >
              {projectZipped ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Project Zipped!</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export Project</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="toolbar-prettier-format-btn"
              onClick={handleFormatCode}
              disabled={isFormattingPrettier}
              title="Run Worker-Based Prettier Formatter on HTML, CSS, and JS"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                formatSuccess
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-500/30'
              }`}
            >
              {formatSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prettier Formatted!</span>
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFormattingPrettier ? 'Formatting...' : 'Format Code'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="cleanup-format-btn"
              onClick={handleCleanupAndFormat}
              title="Auto-format HTML/CSS/JS code, remove unused CSS variables, and fix indentation issues"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                cleanupStatusBanner
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-500/30'
              }`}
            >
              {cleanupStatusBanner ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cleaned &amp; Formatted!</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cleanup &amp; Format</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="open-starter-templates-btn"
              onClick={() => setIsStarterTemplatesOpen(true)}
              title="Open Saved Starter Templates to save or load reusable boilerplate snippets"
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 border border-violet-500/30 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Starter Templates</span>
              <span className="px-1.5 py-0.2 rounded bg-violet-500/25 text-[10px] font-mono text-violet-200">
                {starterTemplates.length}
              </span>
            </button>

            <button
              type="button"
              data-testid="reset-artifact-btn"
              onClick={() => setIsResetConfirmOpen(true)}
              title="Clear current code state and revert to the default starter template"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                resetSuccessBanner
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border-rose-500/30'
              }`}
            >
              {resetSuccessBanner ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Complete!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset Artifact</span>
                </>
              )}
            </button>
            {onOpenVisionCloner && (
              <button
                onClick={onOpenVisionCloner}
                className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/30 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Vision AI</span>
              </button>
            )}
            <button
              onClick={() => {
                setShowSeoDrawer(!showSeoDrawer);
                setShowParamsDrawer(false);
                setShowDependenciesDrawer(false);
                setShowHistoryDrawer(false);
              }}
              className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showSeoDrawer || codeState.seoTitle || codeState.seoDescription
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>SEO Settings</span>
            </button>
            <button
              onClick={() => {
                setShowParamsDrawer(!showParamsDrawer);
                setShowSeoDrawer(false);
                setShowDependenciesDrawer(false);
                setShowHistoryDrawer(false);
              }}
              className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showParamsDrawer
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Params</span>
            </button>
            <button
              onClick={() => {
                setShowDependenciesDrawer(!showDependenciesDrawer);
                setShowParamsDrawer(false);
                setShowSeoDrawer(false);
                setShowHistoryDrawer(false);
              }}
              className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showDependenciesDrawer
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deps ({activeDependencies.length})</span>
            </button>
            <button
              type="button"
              data-testid="toggle-saved-snippets-drawer-btn"
              onClick={() => {
                setShowSavedSnippetsDrawer(!showSavedSnippetsDrawer);
                setShowHistoryDrawer(false);
                setShowDependenciesDrawer(false);
                setShowParamsDrawer(false);
                setShowSeoDrawer(false);
              }}
              title="Open Saved Snippets list to load saved artifacts or export all saved snippets as a single ZIP file"
              className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showSavedSnippetsDrawer
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <Save className="w-3.5 h-3.5 text-teal-400" />
              <span>Saved Snippets ({savedSnippets.length})</span>
            </button>
            <button
              onClick={() => {
                setShowHistoryDrawer(!showHistoryDrawer);
                setShowSavedSnippetsDrawer(false);
                setShowDependenciesDrawer(false);
                setShowParamsDrawer(false);
                setShowSeoDrawer(false);
              }}
              className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showHistoryDrawer
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>History ({versionHistory.length})</span>
            </button>
            <button
              type="button"
              data-testid="open-github-push-btn"
              onClick={() => setIsGitModalOpen(true)}
              title="Connect GitHub via OAuth and push your current code state to a GitHub repository"
              className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 transition-colors cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>GitHub Push</span>
            </button>
          </div>
        </div>

        {/* Liquid Glass AI Prompt Composer (Always accessible in Preview, Code, or Split Mode) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGenerate();
                }
              }}
              placeholder="Describe any Tailwind UI, SaaS dashboard, calculator, or interactive app to build live..."
              className="w-full bg-black/50 border border-white/[0.1] focus:border-indigo-500 rounded-2xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !promptInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Prompt Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 md:pb-0">
            {PRESET_PROMPTS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setPromptInput(preset.prompt);
                  handleGenerate(preset.prompt);
                }}
                className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{preset.label}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible Top Drawers (SEO Settings, AI Params, CDN Deps, Version History) */}
      {showSeoDrawer && (
        <div className="p-4 border-b border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Artifact SEO & OpenGraph Meta Injector</span>
            </span>
            <button
              onClick={() => setShowSeoDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-0.5 rounded-lg bg-white/[0.06] cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">Custom Page Title</label>
              <input
                type="text"
                value={codeState.seoTitle || ''}
                onChange={(e) => onChangeCode({ ...codeState, seoTitle: e.target.value })}
                placeholder="e.g., PulseMetrics — Real-Time SaaS Revenue Analytics"
                className="w-full bg-black/60 border border-white/[0.1] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">Meta Description</label>
              <input
                type="text"
                value={codeState.seoDescription || ''}
                onChange={(e) => onChangeCode({ ...codeState, seoDescription: e.target.value })}
                placeholder="e.g., Interactive MRR, churn rate, and enterprise cohort analytics dashboard."
                className="w-full bg-black/60 border border-white/[0.1] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {showParamsDrawer && (
        <div className="p-4 border-b border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Model Sampling Parameters</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onResetModelParams}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => setShowParamsDrawer(false)}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-0.5 rounded-lg bg-white/[0.06] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Temperature</span>
                <span className="font-mono text-indigo-400">{modelParams.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={modelParams.temperature}
                onChange={(e) =>
                  onUpdateModelParams({ ...modelParams, temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
            <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Top-P</span>
                <span className="font-mono text-indigo-400">{modelParams.topP.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={modelParams.topP}
                onChange={(e) =>
                  onUpdateModelParams({ ...modelParams, topP: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
            <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Top-K</span>
                <span className="font-mono text-indigo-400">{modelParams.topK}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={modelParams.topK}
                onChange={(e) =>
                  onUpdateModelParams({ ...modelParams, topK: parseInt(e.target.value, 10) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {showDependenciesDrawer && (
        <div className="p-4 border-b border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>CDN Dependencies (Auto-Injected into Artifact)</span>
            </span>
            <button
              onClick={() => setShowDependenciesDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-0.5 rounded-lg bg-white/[0.06] cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {POPULAR_CDNS.map((cdn) => {
              const isAdded = activeDependencies.some((d) => d.url === cdn.url);
              return (
                <button
                  key={cdn.id}
                  onClick={() => handleToggleDependency(cdn)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-black/50 border-white/[0.08] text-zinc-300 hover:border-white/[0.2]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate">{cdn.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{cdn.description}</div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      isAdded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {isAdded ? 'Active' : '+ Add'}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={customCdnName}
              onChange={(e) => setCustomCdnName(e.target.value)}
              placeholder="Library name"
              className="bg-black/60 border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-white w-36 focus:outline-none"
            />
            <input
              type="text"
              value={customCdnUrl}
              onChange={(e) => setCustomCdnUrl(e.target.value)}
              placeholder="https://cdn.jsdelivr.net/..."
              className="flex-1 min-w-[180px] bg-black/60 border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
            <select
              value={customCdnType}
              onChange={(e) => setCustomCdnType(e.target.value as 'script' | 'style')}
              className="bg-black/60 border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300"
            >
              <option value="script">JS Script</option>
              <option value="style">CSS Style</option>
            </select>
            <button
              onClick={handleAddCustomDependency}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inject</span>
            </button>
          </div>
        </div>
      )}

      {showHistoryDrawer && (
        <div className="p-4 border-b border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl max-h-60 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Version History Snapshots (localStorage)</span>
            </span>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-0.5 rounded-lg bg-white/[0.06] cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {versionHistory.map((snap, idx) => (
              <div
                key={snap.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/[0.2]"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-medium text-zinc-200 truncate flex items-center gap-1.5">
                    <span>{snap.label}</span>
                    {idx === 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {new Date(snap.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onChangeCode(snap.codeState);
                    setPromptInput(snap.codeState.prompt || '');
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSavedSnippetsDrawer && (
        <div
          data-testid="saved-snippets-drawer"
          className="p-4 border-b border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl max-h-72 overflow-y-auto space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-teal-400" />
                <span>Saved Snippets List ({savedSnippets.length})</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                Export all saved artifacts as a single ZIP containing separate HTML, CSS, and JS files
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="download-all-snippets-btn"
                onClick={handleDownloadAllSavedSnippetsZip}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  allSnippetsZipped
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                    : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border-teal-500/40'
                }`}
              >
                {allSnippetsZipped ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Downloaded All (.ZIP)!</span>
                  </>
                ) : (
                  <>
                    <FolderArchive className="w-3.5 h-3.5 text-teal-400" />
                    <span>Download All ({savedSnippets.length} Snippets .ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowSavedSnippetsDrawer(false)}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Quick Save Current Artifact Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={snippetTitleInput}
              onChange={(e) => setSnippetTitleInput(e.target.value)}
              placeholder="Name current artifact to add to Saved Snippets..."
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleConfirmSaveSnippet}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current Snippet</span>
            </button>
          </div>

          {/* Saved Snippets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {savedSnippets.map((snippet) => (
              <div
                key={snippet.id}
                data-testid={`saved-snippet-item-${snippet.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/[0.08] hover:border-teal-500/40"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-zinc-100 truncate">
                    {snippet.title}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    index.html + styles.css + app.js · {new Date(snippet.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadSnippet(snippet)}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSnippet(snippet.id)}
                    aria-label={`Delete ${snippet.title}`}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace Area: Preview-First Default, Code Editor, or Split Studio */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* CODE PANE (Only shown when user switches to '💻 Code Editor' or '⚡ Split Studio') */}
        {showCodePane && (
          <div
            className={`${
              studioMode === 'split' ? 'w-full xl:w-[44%] xl:border-r' : 'w-full'
            } flex flex-col border-b xl:border-b-0 border-white/[0.08] bg-[#06070B] h-[680px] xl:h-[720px] overflow-hidden`}
          >
            {/* 1-Click Framework Exporter Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Framework:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {(
                    [
                      { id: 'html', label: 'HTML + Tailwind' },
                      { id: 'react-tsx', label: 'React (TSX)' },
                      { id: 'nextjs-app', label: 'Next.js App Router' },
                      { id: 'vue3', label: 'Vue 3 SFC' }
                    ] as const
                  ).map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => setExportFramework(fw.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        exportFramework === fw.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      {fw.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                {exportedFrameworkView.filename}
              </span>
            </div>

            {/* Code Editor Toolbar (Tabs + Format Code + Refactor Code + Save) */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.08] bg-white/[0.01] shrink-0">
              <div className="flex items-center gap-1">
                {(['combined', 'html', 'css', 'js'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setExportFramework('html');
                      setActiveEditorTab(tab);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      exportFramework === 'html' && activeEditorTab === tab
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab === 'combined' ? 'Full HTML' : tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Format Code Button (Prettier Web Worker) */}
                <button
                  type="button"
                  data-testid="prettier-format-code-btn"
                  onClick={handleFormatCode}
                  disabled={isFormattingPrettier}
                  title="Format & Clean Up HTML, CSS, and JS in Background Prettier Web Worker"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  {formatSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Formatted!</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isFormattingPrettier ? 'Formatting...' : 'Format Code'}</span>
                    </>
                  )}
                </button>

                {/* Refactor Code Button */}
                <button
                  onClick={handleRefactorSelection}
                  disabled={isRefactoring}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isRefactoring ? 'animate-spin' : ''}`} />
                  <span>{isRefactoring ? 'Refactoring...' : selectionRange ? 'Refactor Selection' : 'Refactor Code'}</span>
                </button>

                {showSaveInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={snippetTitleInput}
                      onChange={(e) => setSnippetTitleInput(e.target.value)}
                      placeholder="Artifact name..."
                      className="bg-black border border-zinc-700 rounded-lg px-2 py-0.5 text-xs text-zinc-100 w-28 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleConfirmSaveSnippet}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                )}
              </div>
            </div>

            {refactorStatus && (
              <div className="px-3.5 py-1.5 bg-fuchsia-500/10 border-b border-fuchsia-500/20 text-[11px] text-fuchsia-300 flex items-center justify-between shrink-0">
                <span>{refactorStatus}</span>
                {selectionRange && <span className="font-mono">{selectionRange.text.length} chars selected</span>}
              </div>
            )}

            {/* Code Editor Textarea */}
            <div className="flex-1 relative overflow-hidden">
              <textarea
                ref={textareaRef}
                value={getActiveCodeValue()}
                onSelect={handleTextareaSelect}
                onKeyUp={handleTextareaSelect}
                onMouseUp={handleTextareaSelect}
                onChange={(e) => updateActiveCodeValue(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-[#050609] text-zinc-200 font-mono text-xs leading-relaxed p-4 focus:outline-none resize-none selection:bg-indigo-500/30"
                placeholder="Write or generate HTML, Tailwind CSS, and JavaScript..."
              />
            </div>

            {/* Editor Status Footer */}
            <div className="px-3.5 py-2 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Engine:</span>
                <span className="text-zinc-200 font-medium">{lastProviderBadge}</span>
              </div>
              <div className="flex items-center gap-3">
                {lastLatency !== null && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" />
                    {lastLatency}ms
                  </span>
                )}
                <span>{srcDoc.length.toLocaleString()} bytes</span>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW PANE (DEFAULT VIEW ON LOAD — Interactive Visual Preview Canvas) */}
        {showPreviewPane && (
          <div
            className={`${
              studioMode === 'split' ? 'w-full xl:w-[56%]' : 'w-full'
            } flex flex-col bg-[#06070B] h-[680px] xl:h-[720px] overflow-hidden`}
          >
            {/* Sticky Glass Action Bar above Preview */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shrink-0">
              {/* Left: Floating Glass Device Toggles + Click-to-Edit Element */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.1]">
                  <button
                    onClick={() => setViewportSize('desktop')}
                    title="Desktop Viewport (100%)"
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      viewportSize === 'desktop'
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setViewportSize('tablet')}
                    title="Tablet Viewport (768px)"
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      viewportSize === 'tablet'
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tablet</span>
                  </button>
                  <button
                    onClick={() => setViewportSize('mobile')}
                    title="Mobile Viewport (375px)"
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      viewportSize === 'mobile'
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setInspectMode((v) => !v)}
                  title="Hover and click any element inside the preview to inspect and edit classes, text, or apply AI styling"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    inspectMode
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.1]'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Click-to-Edit Element</span>
                </button>

                <button
                  onClick={() => setShowConsolePanel((v) => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    showConsolePanel
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.1]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Console ({consoleLogs.length})</span>
                </button>

                {errorCount > 0 && (
                  <button
                    onClick={handleAutoHealErrors}
                    disabled={isAutoHealing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 animate-pulse cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isAutoHealing ? 'Auto-Fixing...' : `1-Click Auto-Fix (${errorCount})`}</span>
                  </button>
                )}
              </div>

              {/* Right: Sticky Glass Monetization & Export Action Bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  data-testid="copy-code-btn"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  data-testid="social-share-btn"
                  onClick={handleOpenSocialShare}
                  title="Generate a pre-filled social media post draft with a link to this tool's SEO page and a preview of your work"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/30 transition-colors cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Social Share</span>
                </button>

                {/* Viral "Built with DevPulse AI" Watermark Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeViralBadge}
                  data-testid="viral-badge-toggle"
                  onClick={() => setIncludeViralBadge((prev) => !prev)}
                  title="When enabled, Download .HTML and Share URL automatically inject a floating 'Built Free on DevPulse AI' pill linking back to this workspace"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    includeViralBadge
                      ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/45'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.1]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Include Viral Badge</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      includeViralBadge ? 'bg-emerald-500/25 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {includeViralBadge ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 1-Click Export to IDE Dropdown (CodePen, StackBlitz, JSFiddle) */}
                <div className="relative">
                  <button
                    type="button"
                    data-testid="export-ide-dropdown-btn"
                    aria-expanded={isIdeExportOpen}
                    onClick={() => setIsIdeExportOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/35 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export to IDE ▾</span>
                  </button>

                  {isIdeExportOpen && (
                    <div
                      data-testid="export-ide-dropdown-menu"
                      className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-[#0B0D14]/98 backdrop-blur-2xl border border-white/[0.14] shadow-2xl p-1.5 z-50 space-y-1"
                    >
                      <button
                        type="button"
                        data-testid="export-ide-codepen-btn"
                        onClick={() => handleExportToIde('codepen')}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-indigo-500/20 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Open in CodePen</span>
                        <span className="text-[10px] font-mono text-indigo-300">POST</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-ide-stackblitz-btn"
                        onClick={() => handleExportToIde('stackblitz')}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-indigo-500/20 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Open in StackBlitz</span>
                        <span className="text-[10px] font-mono text-emerald-300">POST</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-ide-jsfiddle-btn"
                        onClick={() => handleExportToIde('jsfiddle')}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-indigo-500/20 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Open in JSFiddle</span>
                        <span className="text-[10px] font-mono text-amber-300">POST</span>
                      </button>

                      <div className="my-1 border-t border-white/[0.08]" />

                      <button
                        type="button"
                        data-testid="export-dropdown-connect-github-btn"
                        onClick={() => {
                          setIsIdeExportOpen(false);
                          setGitModalInitialTarget('repo');
                          setIsGitModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-100 hover:text-white hover:bg-indigo-500/25 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Github className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{connectedGitHubUser ? `GitHub (@${connectedGitHubUser.login})` : 'Connect GitHub'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300">
                          {connectedGitHubUser ? 'READY' : 'OAUTH'}
                        </span>
                      </button>

                      <button
                        type="button"
                        data-testid="export-dropdown-github-gist-btn"
                        onClick={() => {
                          setIsIdeExportOpen(false);
                          setGitModalInitialTarget('gist');
                          setIsGitModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-emerald-500/20 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Push to GitHub Gist</span>
                        <span className="text-[10px] font-mono text-emerald-300">GIST</span>
                      </button>

                      <button
                        type="button"
                        data-testid="export-dropdown-push-github-btn"
                        onClick={() => {
                          setIsIdeExportOpen(false);
                          setGitModalInitialTarget('repo');
                          setIsGitModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-indigo-500/20 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Push to GitHub Repo</span>
                        <span className="text-[10px] font-mono text-indigo-300">REPO</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-testid="download-html-btn"
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download .HTML</span>
                </button>

                <button
                  type="button"
                  data-testid="share-live-url-btn"
                  onClick={handleShareLiveUrlWithWatermark}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] transition-colors cursor-pointer"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareCopied ? 'Link Copied!' : 'Share URL'}</span>
                </button>

                <button
                  onClick={onOpenHosting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Deploy Live ($2.99/mo)</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleLogs([]);
                    setRefreshKey((k) => k + 1);
                  }}
                  title="Reload Sandbox Iframe"
                  className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.1] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Toggle Fullscreen Preview"
                  className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.1] transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Lightweight Performance Telemetry Strip */}
            <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.06] bg-black/50 text-[11px] text-zinc-400 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Performance Telemetry:</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-zinc-500">Load Time:</span>
                  <span className="font-mono font-semibold text-emerald-400">{staticPerfMetrics.loadTimeMs} ms</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-zinc-500">Injected Scripts:</span>
                  <span className="font-mono font-semibold text-indigo-400">{staticPerfMetrics.scriptTagCount} tags</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-zinc-500">Total Script Size:</span>
                  <span className="font-mono font-semibold text-amber-400">{staticPerfMetrics.totalScriptSizeKb} KB</span>
                </span>
              </div>
              <button
                onClick={() => setStudioMode(studioMode === 'code' ? 'preview' : 'code')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                <span>{studioMode === 'code' ? 'Back to Live Preview' : 'Format / Edit Source Code →'}</span>
              </button>
            </div>

            {/* Visual Point-and-Click Element Inspector Drawer */}
            {(inspectMode || selectedElement) && (
              <div className="p-3 border-b border-indigo-500/30 bg-indigo-950/30 backdrop-blur-xl space-y-2.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200">
                      Visual Point-and-Click Inspector{' '}
                      {selectedElement ? (
                        <code className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          &lt;{selectedElement.tagName}&gt;
                        </code>
                      ) : (
                        <span className="text-zinc-400 font-normal">
                          — Hover and click any element inside the live preview below to edit it
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setInspectMode(false);
                      setSelectedElement(null);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-black/50 cursor-pointer"
                  >
                    Exit Inspector
                  </button>
                </div>

                {selectedElement && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Element Text Content
                      </label>
                      <input
                        type="text"
                        value={elementTextDraft}
                        onChange={(e) => setElementTextDraft(e.target.value)}
                        className="w-full bg-black/60 border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Tailwind Classes
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={elementClassDraft}
                          onChange={(e) => setElementClassDraft(e.target.value)}
                          className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={handleApplyDirectElementEdit}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        AI Element Instruction
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={elementAiInstruction}
                          onChange={(e) => setElementAiInstruction(e.target.value)}
                          placeholder="e.g. Make this button gradient emerald"
                          className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={handleApplyAiElementInstruction}
                          disabled={isUpdatingElementAi || !elementAiInstruction.trim()}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          {isUpdatingElementAi ? '...' : 'AI Edit'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Preview Iframe Canvas */}
            <div
              className={`flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto transition-colors duration-300 ${
                previewTheme === 'light'
                  ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-slate-200/80 [background-size:18px_18px]'
                  : 'bg-[radial-gradient(#1f2437_1px,transparent_1px)] [background-size:18px_18px]'
              }`}
            >
              <div
                data-testid="artifact-preview-frame-wrapper"
                data-preview-theme={previewTheme}
                className={`h-full transition-all duration-300 rounded-2xl border shadow-2xl overflow-hidden ${
                  previewTheme === 'light'
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-zinc-950 border-white/[0.1]'
                } ${
                  viewportSize === 'mobile'
                    ? 'w-[375px]'
                    : viewportSize === 'tablet'
                    ? 'w-[768px]'
                    : 'w-full'
                }`}
              >
                <iframe
                  ref={iframeRef}
                  key={`${refreshKey}-${previewTheme}`}
                  title="DevPulse Live Artifact Preview"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  className="w-full h-full border-0"
                />
              </div>
            </div>

            {/* Integrated Runtime Console Panel */}
            {showConsolePanel && (
              <div
                className={`${
                  lastTestSuiteResult ? 'h-72' : 'h-52'
                } border-t border-white/[0.1] bg-[#06070B] flex flex-col shrink-0 transition-all`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 border-b border-white/[0.08] bg-white/[0.02]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Integrated Runtime Console</span>
                    <div className="flex items-center gap-1 ml-1">
                      {(['all', 'log', 'warn', 'error'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setConsoleFilter(lvl)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase cursor-pointer ${
                            consoleFilter === lvl
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {/* Console Log Search / Filter Input */}
                    <div className="relative flex items-center ml-1">
                      <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        data-testid="console-search-input"
                        aria-label="Filter console logs or search errors"
                        value={consoleSearchQuery}
                        onChange={(e) => setConsoleSearchQuery(e.target.value)}
                        placeholder="Search logs or errors..."
                        className="pl-7 pr-6 py-0.5 rounded-lg bg-black/60 border border-white/[0.12] focus:border-indigo-500 text-[11px] text-zinc-100 placeholder-zinc-500 w-44 sm:w-56 focus:outline-none"
                      />
                      {consoleSearchQuery && (
                        <button
                          type="button"
                          data-testid="clear-console-search-btn"
                          onClick={() => setConsoleSearchQuery('')}
                          aria-label="Clear console search query"
                          className="absolute right-1.5 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="simulate-console-error-btn"
                      onClick={() => {
                        setConsoleLogs((prev) => [
                          ...prev,
                          {
                            id: `err-sim-${Date.now()}`,
                            level: 'error',
                            message:
                              "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener') at line 42",
                            timestamp: Date.now()
                          }
                        ]);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                    >
                      <Bug className="w-3 h-3" />
                      <span>Simulate Error</span>
                    </button>
                    {errorCount > 0 && (
                      <button
                        onClick={handleAutoHealErrors}
                        disabled={isAutoHealing}
                        className="text-[11px] text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isAutoHealing ? 'Healing...' : '1-Click Auto-Fix with AI'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/[0.06] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={() => setShowConsolePanel(false)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded bg-white/[0.06] cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 font-mono text-xs space-y-2">
                  {/* Jest-Like Test Runner Results Summary Banner inside Console Panel */}
                  {lastTestSuiteResult && (
                    <div
                      data-testid="console-test-suite-summary"
                      className={`p-3 rounded-xl border space-y-2 ${
                        lastTestSuiteResult.allPassed
                          ? 'bg-emerald-950/25 border-emerald-500/35 text-emerald-200'
                          : 'bg-amber-950/25 border-amber-500/35 text-amber-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            data-testid="jest-suite-status-pill"
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              lastTestSuiteResult.allPassed
                                ? 'bg-emerald-500 text-black'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {lastTestSuiteResult.allPassed ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="font-bold text-white">{lastTestSuiteResult.suiteName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-emerald-400 font-bold">
                            {lastTestSuiteResult.passedCount} passed
                          </span>
                          {lastTestSuiteResult.failedCount > 0 && (
                            <span className="text-rose-400 font-bold">
                              {lastTestSuiteResult.failedCount} failed
                            </span>
                          )}
                          <span className="text-zinc-400">
                            {lastTestSuiteResult.totalCount} total ({lastTestSuiteResult.totalDurationMs} ms)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1">
                        {lastTestSuiteResult.results.map((tc) => (
                          <div
                            key={tc.id}
                            data-testid="jest-test-case-item"
                            className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 text-[11px] ${
                              tc.status === 'passed'
                                ? 'bg-black/40 border-emerald-500/20 text-zinc-200'
                                : 'bg-rose-950/40 border-rose-500/35 text-rose-200'
                            }`}
                          >
                            <span className="shrink-0 font-bold">
                              {tc.status === 'passed' ? (
                                <span className="text-emerald-400">✓</span>
                              ) : (
                                <span className="text-rose-400">✕</span>
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{tc.title}</div>
                              <div className="text-[10px] text-zinc-400 truncate">
                                {tc.status === 'passed' ? tc.assertionSummary : tc.failureMessage}
                              </div>
                            </div>
                            <span className="text-[10px] text-zinc-500 shrink-0">{tc.durationMs}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredLogs.length === 0 ? (
                    <div className="text-zinc-500 text-xs py-6 text-center" data-testid="console-empty-state">
                      {consoleSearchQuery.trim()
                        ? `No console logs matching "${consoleSearchQuery}". Try clearing your search filter.`
                        : 'No console output captured yet. Logs (`console.log`, `console.warn`, `console.error`) and Jest test results appear here in real time.'}
                    </div>
                  ) : (
                    filteredLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border ${
                          entry.level === 'error'
                            ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                            : entry.level === 'warn'
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                            : 'bg-white/[0.03] border-white/[0.08] text-zinc-200'
                        }`}
                      >
                        <span className="shrink-0 mt-0.5">
                          {entry.level === 'error' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          ) : entry.level === 'warn' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                        </span>
                        <span className="flex-1 break-all whitespace-pre-wrap">{entry.message}</span>
                        <span className="shrink-0 text-[10px] text-zinc-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Console Footer with Non-Intrusive Code Health Widget */}
                <div
                  data-testid="console-footer-code-health"
                  className="px-3.5 py-1.5 border-t border-white/[0.08] bg-[#040508] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">Code Health:</span>
                    <span className="text-zinc-300">{codeHealthMetrics.lineCount} lines</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300">{codeHealthMetrics.fileSizeFormatted}</span>
                    <span className="text-zinc-600">•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        codeHealthMetrics.performanceImpact === 'Low Impact'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : codeHealthMetrics.performanceImpact === 'Moderate Impact'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {codeHealthMetrics.performanceImpact}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {codeHealthMetrics.impactReason} (~{codeHealthMetrics.domElementEstimate} DOM nodes)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent Compact Keyboard Shortcuts & Code Health Footer Bar */}
      <footer
        data-testid="sandbox-shortcuts-footer"
        aria-label="Sandbox Keyboard Shortcuts and Code Health Bar"
        className="px-3.5 py-2 border-t border-white/[0.08] bg-[#05060A]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 shrink-0"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mr-1">
            <Keyboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Shortcuts:</span>
          </div>
          {SANDBOX_SHORTCUTS_BAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`shortcut-pill-${item.id}`}
              onClick={() => handleShortcutBarAction(item.id)}
              title={item.description}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {item.keys}
              </kbd>
              <span>({item.label})</span>
            </button>
          ))}
        </div>

        {/* Non-Intrusive Code Health Widget in Console / Sandbox Footer */}
        {!showConsolePanel && (
          <div
            data-testid="code-health-widget"
            title={codeHealthMetrics.impactReason}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-zinc-300"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-zinc-200">Code Health:</span>
            <span data-testid="code-health-lines">{codeHealthMetrics.lineCount} lines</span>
            <span className="text-zinc-600">•</span>
            <span data-testid="code-health-size">{codeHealthMetrics.fileSizeFormatted}</span>
            <span className="text-zinc-600">•</span>
            <span
              data-testid="code-health-impact"
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                codeHealthMetrics.performanceImpact === 'Low Impact'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : codeHealthMetrics.performanceImpact === 'Moderate Impact'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {codeHealthMetrics.performanceImpact}
            </span>
          </div>
        )}
      </footer>

      {/* Reset Artifact Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-artifact-modal-title"
          data-testid="reset-artifact-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#08090F] border border-rose-500/30 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 id="reset-artifact-modal-title" className="text-sm font-bold text-white">
                    Reset Artifact to Starter Template?
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Prevent accidental data loss before clearing your workspace
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will clear your current HTML, CSS, JavaScript, and custom prompt edits and revert the workspace back to the default <span className="text-white font-semibold">PulseMetrics Enterprise Revenue OS</span> starter template. A snapshot will also be recorded in your Version History drawer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                data-testid="cancel-reset-artifact-btn"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] cursor-pointer"
              >
                Cancel (Keep Work)
              </button>
              <button
                type="button"
                data-testid="confirm-reset-artifact-btn"
                onClick={handleConfirmResetArtifact}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Share & Mobile QR Code Menu Modal */}
      {isSocialShareOpen && (
        <div
          data-testid="social-share-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#08090F] border border-white/[0.12] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Share Menu &amp; Mobile QR Code Generator</h3>
                  <p className="text-[11px] text-zinc-400">
                    Scan QR code for instant mobile access or share a pre-filled social post
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-social-share-modal"
                onClick={() => setIsSocialShareOpen(false)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Left Column: Scannable Mobile QR Code Generator */}
              <div
                data-testid="artifact-qr-code-container"
                className="md:col-span-5 p-4 rounded-2xl bg-white/[0.03] border border-indigo-500/25 flex flex-col items-center justify-between text-center gap-3"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Scan for Mobile Preview</span>
                </div>

                <div
                  data-testid="artifact-qr-code-svg"
                  className="p-2.5 rounded-2xl bg-white shadow-lg border border-white/20 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: artifactQrCode.svgMarkup }}
                />

                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Encodes your live artifact URL (<span className="font-mono text-indigo-300">/?tool={activeToolSlug}#code=...</span>) for instant mobile preview.
                </p>

                <div className="flex items-center gap-1.5 w-full">
                  <button
                    type="button"
                    data-testid="copy-qr-url-btn"
                    onClick={handleCopyQrShareUrl}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-[11px] font-semibold text-indigo-200 cursor-pointer"
                  >
                    {copiedQrUrl ? 'URL Copied!' : 'Copy Artifact URL'}
                  </button>
                  <button
                    type="button"
                    data-testid="download-qr-svg-btn"
                    onClick={handleDownloadQrCodeSvg}
                    className="py-1.5 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] font-semibold text-zinc-200 cursor-pointer"
                  >
                    .SVG
                  </button>
                </div>
              </div>

              {/* Right Column: Social Share Draft & Work Preview */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-indigo-300">Work Preview Summary</span>
                    <span className="font-mono text-emerald-400" data-testid="social-share-seo-url">
                      {socialShareDraft.seoToolUrl}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 font-medium" data-testid="social-share-preview-summary">
                    {socialShareDraft.previewSummary}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Editable Social Post Draft
                  </label>
                  <textarea
                    data-testid="social-share-draft-textarea"
                    rows={5}
                    value={socialDraftText}
                    onChange={(e) => setSocialDraftText(e.target.value)}
                    className="w-full rounded-2xl bg-black/60 border border-white/[0.12] focus:border-fuchsia-500 p-3 text-xs text-zinc-100 leading-relaxed focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                data-testid="copy-social-draft-btn"
                onClick={handleCopySocialDraft}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/20 cursor-pointer"
              >
                {copiedSocialDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Draft Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Post Draft</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <a
                  href={socialShareDraft.xShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="share-x-link"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] flex items-center gap-1"
                >
                  <span>Post on X</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <a
                  href={socialShareDraft.linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="share-linkedin-link"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <a
                  href={socialShareDraft.redditShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="share-reddit-link"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] flex items-center gap-1"
                >
                  <span>Reddit</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Starter Templates Modal */}
      {isStarterTemplatesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="starter-templates-modal-title"
          data-testid="starter-templates-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-[#08090F] border border-violet-500/30 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <h3 id="starter-templates-modal-title" className="text-sm font-bold text-white">
                    Saved Starter Templates &amp; Boilerplate Library
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Save your current workspace as a reusable boilerplate or load a starter template for new projects
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-starter-templates-modal"
                onClick={() => setIsStarterTemplatesOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Save Current Code as Reusable Boilerplate Form */}
              <form
                onSubmit={handleSaveCurrentAsStarterTemplate}
                className="p-4 rounded-2xl bg-violet-500/[0.06] border border-violet-500/25 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-200">
                    Save Current Workspace as Reusable Starter Template
                  </span>
                  {templateSavedBanner && (
                    <span
                      data-testid="starter-template-saved-badge"
                      className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg"
                    >
                      Boilerplate Saved!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <input
                    type="text"
                    data-testid="starter-template-name-input"
                    aria-label="Starter template name"
                    value={templateNameInput}
                    onChange={(e) => setTemplateNameInput(e.target.value)}
                    placeholder="Template Name (e.g., Auth Pricing Shell)"
                    className="sm:col-span-4 rounded-xl bg-black/60 border border-white/[0.12] focus:border-violet-500 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none min-w-0"
                  />
                  <input
                    type="text"
                    data-testid="starter-template-desc-input"
                    aria-label="Starter template description"
                    value={templateDescInput}
                    onChange={(e) => setTemplateDescInput(e.target.value)}
                    placeholder="Short description of boilerplate..."
                    className="sm:col-span-4 rounded-xl bg-black/60 border border-white/[0.12] focus:border-violet-500 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none min-w-0"
                  />
                  <div className="sm:col-span-4 flex items-center gap-2 min-w-0">
                    <select
                      aria-label="Template category"
                      value={templateCategoryInput}
                      onChange={(e) =>
                        setTemplateCategoryInput(e.target.value as SavedStarterTemplate['category'])
                      }
                      className="flex-1 min-w-0 rounded-xl bg-black/60 border border-white/[0.12] px-2.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    >
                      <option value="Custom Boilerplate">Custom</option>
                      <option value="SaaS UI">SaaS UI</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="Dashboard">Dashboard</option>
                    </select>
                    <button
                      type="submit"
                      data-testid="save-starter-template-btn"
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-600/25 shrink-0 cursor-pointer"
                    >
                      + Save Template
                    </button>
                  </div>
                </div>
              </form>

              {/* Filter Search Bar for Starter Templates */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    data-testid="starter-template-search-input"
                    aria-label="Search saved starter templates"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder="Filter starter templates by name, category, or description..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.1] focus:border-violet-500 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {filteredStarterTemplates.length} template(s)
                </span>
              </div>

              {/* Starter Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredStarterTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    data-testid={`starter-template-card-${tmpl.id}`}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{tmpl.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            tmpl.isBuiltIn
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {tmpl.isBuiltIn ? tmpl.category : 'Saved Custom'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{tmpl.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {tmpl.codeState.html.split('\n').length} lines HTML
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!tmpl.isBuiltIn && (
                          <button
                            type="button"
                            data-testid={`delete-starter-template-btn-${tmpl.id}`}
                            onClick={() => handleDeleteStarterTemplate(tmpl.id)}
                            aria-label={`Delete ${tmpl.name}`}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          type="button"
                          data-testid={`load-starter-template-btn-${tmpl.id}`}
                          onClick={() => handleLoadStarterTemplate(tmpl)}
                          className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Multi-User Cursor Overlay */}
      {showRemoteCursors && remotePeers.length > 0 && (
        <div
          data-testid="remote-cursor-overlay"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        >
          {remotePeers.map((peer) => (
            <div
              key={peer.clientId}
              data-testid="remote-cursor-pointer"
              style={{
                left: `${peer.xPercent}%`,
                top: `${peer.yPercent}%`,
                transition: 'left 120ms cubic-bezier(0.22, 1, 0.36, 1), top 120ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              className="absolute flex flex-col items-start"
            >
              <MousePointer2
                className="w-4 h-4 -rotate-12 drop-shadow-md"
                style={{ color: peer.color, fill: peer.color }}
              />
              <div
                style={{ backgroundColor: peer.color }}
                className="mt-0.5 ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-950 shadow-lg whitespace-nowrap flex items-center gap-1"
              >
                <span>{peer.name}</span>
                <span className="opacity-75 font-mono text-[9px]">
                  ({peer.xPercent}%, {peer.yPercent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1-Click Deploy to Vercel Modal */}
      {isVercelModalOpen && vercelDeployResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vercel-deploy-modal-title"
          data-testid="vercel-deploy-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-xl rounded-3xl bg-[#08090F] border border-white/[0.15] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm">
                  ▲
                </div>
                <div>
                  <h3 id="vercel-deploy-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Vercel Standalone Deployment Ready</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {vercelDeployResult.readyState}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Deployed via Vercel REST API v13 (<code className="font-mono text-zinc-300">POST /v13/deployments</code>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-vercel-modal-btn"
                onClick={() => setIsVercelModalOpen(false)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Standalone Site URL:</span>
                <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SSL &amp; Edge Headers Active</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="vercel-deployed-url"
                  value={
                    vercelDeployResult.vercelAliasUrl ||
                    `${typeof window !== 'undefined' ? window.location.origin : ''}${vercelDeployResult.url}`
                  }
                  className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="copy-vercel-url-btn"
                  onClick={() => {
                    const targetUrl =
                      vercelDeployResult.vercelAliasUrl ||
                      `${typeof window !== 'undefined' ? window.location.origin : ''}${vercelDeployResult.url}`;
                    navigator.clipboard?.writeText(targetUrl)?.catch(() => {});
                    setVercelDeployCopied(true);
                    setTimeout(() => setVercelDeployCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white cursor-pointer"
                >
                  {vercelDeployCopied ? 'Copied!' : 'Copy URL'}
                </button>
                <a
                  href={vercelDeployResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="open-vercel-preview-link"
                  className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1"
                >
                  <span>Visit Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                <span>Deployment ID: {vercelDeployResult.id}</span>
                <span>•</span>
                <span>Files: {vercelDeployResult.filesDeployed.join(', ')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20 space-y-2">
              <label className="block text-[11px] font-semibold text-indigo-200">
                Optional: Deploy with Personal Vercel API Token (<code className="font-mono">VERCEL_API_TOKEN</code>)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  data-testid="vercel-token-input"
                  value={vercelTokenInput}
                  onChange={(e) => setVercelTokenInput(e.target.value)}
                  placeholder="Paste Vercel Bearer Token to push to your personal Vercel team..."
                  className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDeployToVercel(vercelTokenInput)}
                  disabled={!vercelTokenInput.trim() || isDeployingVercel}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white cursor-pointer"
                >
                  Re-Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Git Repository & Gist Export Modal */}
      <GitRepoModal
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
        codeState={codeState}
        initialTargetType={gitModalInitialTarget}
        onOAuthConnected={(user) => setConnectedGitHubUser(user)}
      />
    </div>
  );
}
