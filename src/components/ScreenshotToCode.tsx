import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import {
  type ModelOptionId,
  generateVisionCloneFromImage,
} from '../services/aiRouter.ts';
import { type ArtifactCodeState } from '../utils/urlHash.ts';

interface ScreenshotToCodeProps {
  selectedModel: ModelOptionId | string;
  onLoadCloneIntoStudio?: (code: ArtifactCodeState) => void;
  onApplyToSandbox?: (html: string, promptLabel: string) => void;
  onOpenByokModal?: () => void;
  onRequireByok?: (reason?: string) => void;
  onTokenConsumed?: () => void;
  showToast?: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

interface SampleWireframe {
  id: string;
  title: string;
  subtitle: string;
  instructions: string;
  svgDataUri: string;
}

function createWireframeDataUri(title: string, accent: string, layoutType: 'dashboard' | 'checkout' | 'chat'): string {
  const inner =
    layoutType === 'dashboard'
      ? `<rect x="30" y="65" width="160" height="75" rx="8" fill="#12141D" stroke="#2A3042"/>
         <rect x="210" y="65" width="160" height="75" rx="8" fill="#12141D" stroke="#2A3042"/>
         <rect x="390" y="65" width="180" height="75" rx="8" fill="#12141D" stroke="${accent}"/>
         <rect x="30" y="158" width="540" height="175" rx="10" fill="#12141D" stroke="#2A3042"/>
         <path d="M55 290 L145 240 L240 265 L350 200 L455 220 L545 180" fill="none" stroke="${accent}" stroke-width="3"/>`
      : layoutType === 'checkout'
      ? `<rect x="130" y="60" width="340" height="270" rx="14" fill="#12141D" stroke="${accent}" stroke-width="2"/>
         <rect x="155" y="90" width="290" height="36" rx="6" fill="#090A0F" stroke="#2A3042"/>
         <rect x="155" y="140" width="290" height="36" rx="6" fill="#090A0F" stroke="#2A3042"/>
         <rect x="155" y="195" width="138" height="36" rx="6" fill="#090A0F" stroke="#2A3042"/>
         <rect x="307" y="195" width="138" height="36" rx="6" fill="#090A0F" stroke="#2A3042"/>
         <rect x="155" y="255" width="290" height="44" rx="8" fill="${accent}"/>`
      : `<rect x="40" y="65" width="150" height="265" rx="10" fill="#12141D" stroke="#2A3042"/>
         <rect x="205" y="65" width="355" height="210" rx="10" fill="#12141D" stroke="#2A3042"/>
         <rect x="205" y="290" width="355" height="40" rx="8" fill="#12141D" stroke="${accent}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
    <rect width="600" height="360" fill="#090A0F"/>
    <rect x="16" y="16" width="568" height="328" rx="12" fill="#0D0E13" stroke="#1F2430"/>
    <text x="32" y="44" fill="#FFFFFF" font-family="monospace" font-size="13" font-weight="bold">${title}</text>
    ${inner}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const SAMPLE_WIREFRAMES: SampleWireframe[] = [
  {
    id: 'wireframe-dashboard',
    title: 'SaaS Telemetry Dashboard Wireframe',
    subtitle: '3 KPI cards + interactive time-series latency table',
    instructions:
      'Clone this SaaS Telemetry Dashboard wireframe into a dark mode Tailwind UI with 3 KPI cards (Requests, P95 Latency, Error Rate), an interactive filter bar, and a regional node table.',
    svgDataUri: createWireframeDataUri('WIREFRAME 01 · SAAS TELEMETRY DASHBOARD', '#6366F1', 'dashboard'),
  },
  {
    id: 'wireframe-checkout',
    title: 'FinTech API Credit Checkout Card',
    subtitle: 'Centered modal with promo code & instant calculation',
    instructions:
      'Clone this FinTech Checkout modal wireframe into a Tailwind CSS dark glassmorphism card with credit tier selector, promo code input, and live total calculation.',
    svgDataUri: createWireframeDataUri('WIREFRAME 02 · FINTECH CHECKOUT MODAL', '#10B981', 'checkout'),
  },
  {
    id: 'wireframe-chat',
    title: 'AI Developer Copilot Split Layout',
    subtitle: 'Left thread list + main streaming code assistant',
    instructions:
      'Clone this AI Copilot split layout wireframe with a left prompt history panel, streaming message feed, and interactive prompt bar.',
    svgDataUri: createWireframeDataUri('WIREFRAME 03 · AI COPILOT WORKSPACE', '#818CF8', 'chat'),
  },
];

export const ScreenshotToCode: React.FC<ScreenshotToCodeProps> = ({
  selectedModel: rawModel,
  onLoadCloneIntoStudio,
  onApplyToSandbox,
  onOpenByokModal,
  onRequireByok,
  onTokenConsumed = () => {},
  showToast = () => {},
}) => {
  const selectedModel: ModelOptionId =
    rawModel === 'gemini-4-argon'
      ? 'gemini-4-argon'
      : rawModel === 'groq-llama' || rawModel === 'groq-llama-70b'
      ? 'groq-llama-70b'
      : 'gemini-3.8-flash';
  const handleLoadIntoStudio = (code: ArtifactCodeState) => {
    if (onLoadCloneIntoStudio) onLoadCloneIntoStudio(code);
    if (onApplyToSandbox) onApplyToSandbox(code.html, code.prompt || 'Cloned UI from Screenshot');
  };
  void onOpenByokModal;
  void onRequireByok;
  const [imageDataUri, setImageDataUri] = useState<string>(SAMPLE_WIREFRAMES[0].svgDataUri);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [instructions, setInstructions] = useState<string>(SAMPLE_WIREFRAMES[0].instructions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [lastProvider, setLastProvider] = useState<string>('Gemini 3.8 Flash Vision');
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUri(reader.result);
        setMimeType(file.type || 'image/png');
        showToast(`Loaded screenshot "${file.name}" (${Math.round(file.size / 1024)} KB)`, 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setImageDataUri(reader.result);
            setMimeType(file.type || 'image/png');
            showToast('Pasted screenshot from clipboard!', 'success');
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleSelectSampleWireframe = (sample: SampleWireframe) => {
    setImageDataUri(sample.svgDataUri);
    setMimeType('image/png');
    setInstructions(sample.instructions);
    showToast(`Selected "${sample.title}" reference snapshot`, 'info');
  };

  const handleCloneScreenshot = async () => {
    if (!imageDataUri) {
      showToast('Upload, paste, or select a UI screenshot first.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateVisionCloneFromImage(
        imageDataUri,
        mimeType,
        instructions,
        selectedModel,
        () => onOpenByokModal()
      );
      onTokenConsumed();
      setGeneratedHtml(res.html);
      setLastProvider(res.providerUsed);
      setLastLatencyMs(res.latencyMs);
      showToast(
        `Cloned screenshot into Tailwind HTML via ${res.providerUsed} (${res.latencyMs}ms)!`,
        'success'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Vision screenshot cloning failed',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      onPaste={handlePasteImage}
      className="flex-1 p-4 lg:p-6 theme-bg-base bg-[#090A0F] space-y-6 overflow-y-auto"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b theme-border border-[#1F2430] pb-4">
        <div>
          <div className="text-xs font-mono text-[#818CF8]">
            STUDIO · VISION AI UI CLONER
          </div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text-main text-white mt-0.5">
            Screenshot & Wireframe to Tailwind Code
          </h1>
          <p className="text-xs text-[#908fa0] mt-0.5">
            Upload or paste any UI screenshot (Ctrl+V) to synthesize a pixel-accurate, interactive HTML5 + Tailwind CSS clone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg theme-bg-low bg-[#1a1b21] hover:bg-[#292a2f] border theme-border border-[#2A3042] text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>Upload Screenshot</span>
          </button>

          <button
            type="button"
            onClick={handleCloneScreenshot}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating ? 'Cloning UI with Vision AI...' : 'Generate Tailwind UI from Image'}
            </span>
          </button>
        </div>
      </div>

      {/* Reference Wireframe Presets */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-[#908fa0]">
          Or test immediately with a Reference UI Wireframe Snapshot:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_WIREFRAMES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSampleWireframe(sample)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                instructions === sample.instructions
                  ? 'bg-[#6366F1]/15 border-[#6366F1] text-white'
                  : 'theme-bg-lowest bg-[#0d0e13] theme-border border-[#1F2430] hover:border-[#3E465E] text-[#c7c4d7]'
              }`}
            >
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{sample.title}</span>
                <ImageIcon className="w-3.5 h-3.5 text-[#818CF8]" />
              </div>
              <p className="text-[11px] font-mono text-[#908fa0] mt-1">{sample.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Split Workspace: Left Reference Image & Prompt | Right Cloned Preview & Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Uploaded / Selected Screenshot + Custom Vision Instructions */}
        <div className="p-4 rounded-xl theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>Source UI Screenshot / Wireframe</span>
            </span>
            <span className="text-[11px] font-mono text-[#908fa0]">
              Supports PNG, JPG, WebP & Clipboard Paste
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border theme-border border-[#2A3042] bg-[#090A0F] flex items-center justify-center min-h-[240px]">
            <img
              src={imageDataUri}
              alt="UI Screenshot Reference for Vision Cloning"
              referrerPolicy="no-referrer"
              className="max-h-[300px] w-auto object-contain"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="vision-instructions-input"
              className="block text-xs font-mono text-[#c7c4d7]"
            >
              Vision Styling & Interactivity Instructions
            </label>
            <textarea
              id="vision-instructions-input"
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specify custom color palette, interactive states, or data density..."
              className="w-full rounded-lg theme-bg-low bg-[#1a1b21] border theme-border border-[#2A3042] focus:border-[#6366F1] p-2.5 text-xs font-mono theme-text-main text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Generated Tailwind Clone Output & 1-Click Open in Sandbox */}
        <div className="p-4 rounded-xl theme-bg-lowest bg-[#0d0e13] border theme-border border-[#1F2430] flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-semibold text-white">
                Synthesized Tailwind HTML5 Clone
              </span>
              {lastLatencyMs > 0 && (
                <span className="ml-2 text-[11px] font-mono text-[#4edea3]">
                  · {lastProvider} ({lastLatencyMs}ms)
                </span>
              )}
            </div>

            {generatedHtml && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedHtml);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                    showToast('Copied Vision HTML clone to clipboard!', 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#1a1b21] hover:bg-[#292a2f] border border-[#2A3042] text-xs font-mono text-[#c7c4d7] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleLoadIntoStudio({
                      html: generatedHtml,
                      css: '',
                      js: '',
                      prompt: instructions,
                      seoTitle: 'Vision AI Cloned UI Artifact',
                      seoDescription: instructions.slice(0, 140),
                    })
                  }
                  className="px-3 py-1 rounded bg-[#4edea3] hover:bg-[#10B981] text-[#002919] font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡ Open in Sandbox</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {generatedHtml ? (
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="rounded-lg overflow-hidden border border-[#2A3042] bg-[#090A0F] h-[250px]">
                <iframe
                  title="Vision Clone Live Preview"
                  srcDoc={generatedHtml}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                />
              </div>
              <pre className="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] font-mono text-[11px] text-[#c7c4d7] overflow-x-auto max-h-[140px]">
                {generatedHtml}
              </pre>
            </div>
          ) : (
            <div className="flex-1 min-h-[320px] rounded-lg border border-dashed border-[#2A3042] flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Camera className="w-8 h-8 text-[#818CF8]" />
              <div className="space-y-1 max-w-md">
                <div className="text-sm font-semibold text-white">
                  Ready to Clone Screenshot to Code
                </div>
                <p className="text-xs text-[#908fa0]">
                  Click &ldquo;Generate Tailwind UI from Image&rdquo; above to send the selected wireframe or uploaded screenshot to Gemini Flash Vision and render the live clone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloneScreenshot}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer"
              >
                Generate Tailwind UI from Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotToCode;
