import type { ArtifactCodeState } from '../utils/urlHash.ts';

export interface GalleryComponentTemplate {
  id: string;
  title: string;
  category: 'Marketing & Bento' | 'SaaS & Dashboards' | 'AI & Chat' | 'Auth & FinTech';
  summary: string;
  tags: string[];
  code: ArtifactCodeState;
}

export const UI_COMPONENT_GALLERY: GalleryComponentTemplate[] = [
  {
    id: 'bento-grid-features',
    title: 'Bento Grid Feature Section',
    category: 'Marketing & Bento',
    summary: 'Asymmetric 4-tile dark obsidian Bento showcase with interactive latency telemetry and edge node toggles.',
    tags: ['Bento Grid', 'Tailwind CSS', 'Interactive'],
    code: {
      prompt: 'Build an asymmetric dark mode Bento Grid Feature Section for an AI developer cloud platform',
      seoTitle: 'DevPulse Cloud — Edge AI Bento Architecture',
      seoDescription: 'Sub-10ms global inference, zero-config sandboxes, and multi-model API failover.',
      dependencies: ['tailwindcss', 'lucide'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 lg:p-10 font-sans antialiased">
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1F2430] pb-6">
      <div>
        <div class="text-xs font-mono text-indigo-400">01 · INFRASTRUCTURE PRIMITIVES</div>
        <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight mt-1">Engineered for sub-10ms AI execution</h1>
      </div>
      <button id="pingBtn" class="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-mono font-semibold transition cursor-pointer">
        Benchmark Edge Nodes
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Tile 1 (2 cols) -->
      <div class="md:col-span-2 p-6 rounded-xl bg-[#12141D] border border-[#1F2430] flex flex-col justify-between gap-6">
        <div class="space-y-2">
          <div class="text-xs font-mono text-emerald-400">MULTI-MODEL AUTO-ROTATOR</div>
          <h2 class="text-xl font-bold text-white">Zero-downtime failover across Gemini, Groq & OpenRouter</h2>
          <p class="text-sm text-slate-400 max-w-xl">Automatically reroutes 429 rate-limited requests to secondary LPU hardware in under 15 milliseconds without dropping token streams.</p>
        </div>
        <div class="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430]">
            <div class="text-slate-400">Primary Node</div>
            <div class="text-white font-bold mt-1">Gemini 3.8 Flash</div>
            <div id="lat1" class="text-emerald-400 mt-0.5">184 tok/s</div>
          </div>
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430]">
            <div class="text-slate-400">Failover LPU</div>
            <div class="text-white font-bold mt-1">Llama 3.3 70B</div>
            <div id="lat2" class="text-indigo-400 mt-0.5">276 tok/s</div>
          </div>
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430]">
            <div class="text-slate-400">Uptime SLA</div>
            <div class="text-white font-bold mt-1">99.99%</div>
            <div class="text-amber-400 mt-0.5">Global Anycast</div>
          </div>
        </div>
      </div>

      <!-- Tile 2 (1 col) -->
      <div class="p-6 rounded-xl bg-[#12141D] border border-[#1F2430] flex flex-col justify-between gap-6">
        <div class="space-y-2">
          <div class="text-xs font-mono text-indigo-400">ISOLATED RUNTIME</div>
          <h2 class="text-xl font-bold text-white">Instant DOM & Console Telemetry</h2>
          <p class="text-sm text-slate-400">Every artifact runs in a zero-trust sandboxed frame with live postMessage stream inspection.</p>
        </div>
        <div id="pingOutput" class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] font-mono text-xs text-emerald-400">
          [edge:iad-01] Ready · 9.4ms RTT
        </div>
      </div>

      <!-- Tile 3 (1 col) -->
      <div class="p-6 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-3">
        <div class="text-xs font-mono text-amber-400">BYOK VAULT</div>
        <h3 class="text-lg font-bold text-white">100% Local Browser Storage</h3>
        <p class="text-sm text-slate-400">API keys never touch external databases. Stored strictly in localStorage with format validation.</p>
      </div>

      <!-- Tile 4 (2 cols) -->
      <div class="md:col-span-2 p-6 rounded-xl bg-[#12141D] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="text-xs font-mono text-indigo-400">1-CLICK FRAMEWORK EXPORT</div>
          <h3 class="text-lg font-bold text-white">Export to HTML5, React 19 TSX, Next.js App Router, or Vue 3</h3>
          <p class="text-sm text-slate-400">Switch frameworks on the fly without rewriting component markup.</p>
        </div>
        <span class="font-mono text-xs text-emerald-400 shrink-0">v3.0 Studio Ready →</span>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('pingBtn').addEventListener('click', () => {
      const rtt = (6 + Math.random() * 5).toFixed(1);
      const t1 = 175 + Math.floor(Math.random() * 35);
      const t2 = 260 + Math.floor(Math.random() * 40);
      document.getElementById('lat1').textContent = t1 + ' tok/s';
      document.getElementById('lat2').textContent = t2 + ' tok/s';
      document.getElementById('pingOutput').textContent = '[edge:sfo-02] Verified · ' + rtt + 'ms RTT';
      console.log('Bento Edge Benchmark complete:', { rtt, t1, t2 });
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'animated-saas-pricing',
    title: 'Animated SaaS Pricing',
    category: 'Marketing & Bento',
    summary: '3-tier SaaS pricing matrix with Monthly/Annual billing cadence toggle and interactive GPU node calculator.',
    tags: ['Pricing', 'Billing Toggle', 'Calculator'],
    code: {
      prompt: 'Build an Animated SaaS Pricing table with Monthly/Annual toggle and interactive compute slider',
      seoTitle: 'PulseCompute Pricing — Predictable AI Infrastructure',
      seoDescription: 'Compare Starter, Pro Studio, and Enterprise cluster tiers with instant annual savings.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 lg:p-10 font-sans antialiased">
  <div class="max-w-5xl mx-auto space-y-8">
    <div class="text-center space-y-3 max-w-2xl mx-auto">
      <div class="text-xs font-mono text-emerald-400">TRANSPARENT COMPUTE TIERS · 99.99% SLA</div>
      <h1 class="text-3xl lg:text-4xl font-bold text-white">Predictable cloud compute for scaling engineering teams</h1>
      <div class="inline-flex items-center gap-3 bg-[#12141D] border border-[#1F2430] p-1.5 rounded-lg mt-2">
        <button id="btnMonthly" class="px-3 py-1.5 rounded text-xs font-mono bg-[#6366F1] text-white font-semibold cursor-pointer">Monthly Billing</button>
        <button id="btnAnnual" class="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white cursor-pointer">Annual Plan (Save 20%)</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="p-6 rounded-xl bg-[#12141D] border border-[#1F2430] flex flex-col justify-between space-y-6">
        <div class="space-y-2">
          <div class="text-xs font-mono text-slate-400">For early-stage prototypes</div>
          <h2 class="text-xl font-bold text-white">Starter</h2>
          <div class="text-3xl font-mono font-bold text-white pt-2"><span class="price" data-m="19" data-y="15">$19</span><span class="text-xs font-normal text-slate-400"> /mo</span></div>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 font-mono">
          <li>· 1,000 Sandbox Run-minutes</li>
          <li>· 2 Concurrent Isolated Nodes</li>
          <li>· Community Multi-Model Rotator</li>
        </ul>
        <button class="w-full py-2.5 rounded-lg bg-[#1A1D29] hover:bg-[#252A3A] text-white text-xs font-semibold cursor-pointer">Deploy Starter</button>
      </div>

      <div class="p-6 rounded-xl bg-[#12141D] border-2 border-[#6366F1] flex flex-col justify-between space-y-6">
        <div class="space-y-2">
          <div class="text-xs font-mono text-indigo-400">For scaling AI product teams</div>
          <h2 class="text-xl font-bold text-white">Pro Studio</h2>
          <div class="text-3xl font-mono font-bold text-emerald-400 pt-2"><span class="price" data-m="49" data-y="39">$49</span><span class="text-xs font-normal text-slate-400"> /mo</span></div>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 font-mono">
          <li>· 25,000 Sandbox Run-minutes</li>
          <li>· 16 Concurrent Isolated Nodes</li>
          <li>· Gemini 4 Argon + Groq LPU Priority</li>
        </ul>
        <button class="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer">Start Pro Trial</button>
      </div>

      <div class="p-6 rounded-xl bg-[#12141D] border border-[#1F2430] flex flex-col justify-between space-y-6">
        <div class="space-y-2">
          <div class="text-xs font-mono text-slate-400">For regulated enterprise orgs</div>
          <h2 class="text-xl font-bold text-white">Enterprise</h2>
          <div class="text-3xl font-mono font-bold text-white pt-2"><span class="price" data-m="199" data-y="159">$199</span><span class="text-xs font-normal text-slate-400"> /mo</span></div>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 font-mono">
          <li>· Unlimited Dedicated VPC Nodes</li>
          <li>· Custom SOC2 & HIPAA Audit Logs</li>
          <li>· Dedicated Solutions Architect</li>
        </ul>
        <button class="w-full py-2.5 rounded-lg bg-[#1A1D29] hover:bg-[#252A3A] text-white text-xs font-semibold cursor-pointer">Contact Architecture</button>
      </div>
    </div>
  </div>
  <script>
    const mBtn = document.getElementById('btnMonthly');
    const yBtn = document.getElementById('btnAnnual');
    const prices = document.querySelectorAll('.price');
    function setCadence(annual) {
      prices.forEach(el => {
        el.textContent = '$' + (annual ? el.dataset.y : el.dataset.m);
      });
      mBtn.className = annual ? 'px-3 py-1.5 rounded text-xs font-mono text-slate-400 cursor-pointer' : 'px-3 py-1.5 rounded text-xs font-mono bg-[#6366F1] text-white font-semibold cursor-pointer';
      yBtn.className = !annual ? 'px-3 py-1.5 rounded text-xs font-mono text-slate-400 cursor-pointer' : 'px-3 py-1.5 rounded text-xs font-mono bg-[#6366F1] text-white font-semibold cursor-pointer';
      console.log('Pricing cadence switched:', annual ? 'Annual' : 'Monthly');
    }
    mBtn.addEventListener('click', () => setCadence(false));
    yBtn.addEventListener('click', () => setCadence(true));
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'dark-analytics-dashboard',
    title: 'Dark Analytics Dashboard',
    category: 'SaaS & Dashboards',
    summary: 'Real-time API observability console with tabular KPI cards, regional traffic breakdown, and timeframe filter.',
    tags: ['Analytics', 'Telemetry', 'Dashboard'],
    code: {
      prompt: 'Build a Dark Analytics Dashboard with real-time API request telemetry and regional latency table',
      seoTitle: 'DevPulse Telemetry — Real-Time API Observability',
      seoDescription: 'Monitor P99 latency, token throughput, and regional error rates in real time.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 lg:p-8 font-sans antialiased">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F2430] pb-4">
      <div>
        <div class="text-xs font-mono text-indigo-400">OBSERVABILITY MATRIX · US-EAST-1</div>
        <h1 class="text-2xl font-bold text-white mt-0.5">Production API Gateway Telemetry</h1>
      </div>
      <div class="flex items-center gap-2 font-mono text-xs">
        <button data-range="1h" class="range-btn px-3 py-1.5 rounded bg-[#6366F1] text-white cursor-pointer">1H</button>
        <button data-range="24h" class="range-btn px-3 py-1.5 rounded bg-[#12141D] border border-[#1F2430] text-slate-300 cursor-pointer">24H</button>
        <button data-range="7d" class="range-btn px-3 py-1.5 rounded bg-[#12141D] border border-[#1F2430] text-slate-300 cursor-pointer">7D</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430]">
        <div class="text-xs text-slate-400">Total Requests</div>
        <div id="kpiReq" class="text-2xl font-bold text-white mt-1">1,482,910</div>
        <div class="text-xs text-emerald-400 mt-1">+14.2% vs prior window</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430]">
        <div class="text-xs text-slate-400">Median P50 Latency</div>
        <div id="kpiP50" class="text-2xl font-bold text-emerald-400 mt-1">18.4 ms</div>
        <div class="text-xs text-slate-400 mt-1">Target &lt; 25.0 ms</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430]">
        <div class="text-xs text-slate-400">Tail P99 Latency</div>
        <div id="kpiP99" class="text-2xl font-bold text-indigo-400 mt-1">64.2 ms</div>
        <div class="text-xs text-slate-400 mt-1">Zero cold starts</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430]">
        <div class="text-xs text-slate-400">5xx Error Rate</div>
        <div class="text-2xl font-bold text-white mt-1">0.004%</div>
        <div class="text-xs text-emerald-400 mt-1">All circuits healthy</div>
      </div>
    </div>

    <div class="rounded-xl bg-[#12141D] border border-[#1F2430] overflow-hidden">
      <div class="px-4 py-3 border-b border-[#1F2430] flex items-center justify-between">
        <span class="text-xs font-mono font-semibold text-white">Regional Edge Cluster Breakdown</span>
        <span class="text-xs font-mono text-slate-400">Updated live</span>
      </div>
      <table class="w-full text-left border-collapse font-mono text-xs">
        <thead>
          <tr class="border-b border-[#1F2430] text-slate-400 bg-[#090A0F]">
            <th class="py-2.5 px-4">Region</th>
            <th class="py-2.5 px-4">Primary Model</th>
            <th class="py-2.5 px-4 text-right">Throughput</th>
            <th class="py-2.5 px-4 text-right">P95 Latency</th>
            <th class="py-2.5 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#1F2430]">
          <tr>
            <td class="py-2.5 px-4 text-white">us-east-1 (Virginia)</td>
            <td class="py-2.5 px-4 text-indigo-400">gemini-3.8-flash</td>
            <td class="py-2.5 px-4 text-right">8,420 req/s</td>
            <td class="py-2.5 px-4 text-right">19.1 ms</td>
            <td class="py-2.5 px-4 text-right text-emerald-400">Nominal</td>
          </tr>
          <tr>
            <td class="py-2.5 px-4 text-white">eu-central-1 (Frankfurt)</td>
            <td class="py-2.5 px-4 text-indigo-400">llama-3.3-70b-versatile</td>
            <td class="py-2.5 px-4 text-right">5,190 req/s</td>
            <td class="py-2.5 px-4 text-right">22.8 ms</td>
            <td class="py-2.5 px-4 text-right text-emerald-400">Nominal</td>
          </tr>
          <tr>
            <td class="py-2.5 px-4 text-white">ap-northeast-1 (Tokyo)</td>
            <td class="py-2.5 px-4 text-indigo-400">gemini-4-argon</td>
            <td class="py-2.5 px-4 text-right">3,610 req/s</td>
            <td class="py-2.5 px-4 text-right">31.4 ms</td>
            <td class="py-2.5 px-4 text-right text-emerald-400">Nominal</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <script>
    document.querySelectorAll('.range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.range;
        document.getElementById('kpiReq').textContent = r === '1h' ? '1,482,910' : r === '24h' ? '34,912,400' : '241,800,120';
        console.log('Switched analytics window:', r);
      });
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'ai-chat-widget',
    title: 'AI Chat Widget',
    category: 'AI & Chat',
    summary: 'Streaming developer copilot chat interface with prompt suggestion buttons, citation links, and code copy.',
    tags: ['AI Chat', 'Copilot', 'Streaming UI'],
    code: {
      prompt: 'Build an interactive AI Chat Widget for developers with code snippets and prompt suggestions',
      seoTitle: 'DevPulse Copilot Chat Widget',
      seoDescription: 'Embeddable multi-turn AI engineering assistant with syntax blocks.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-2xl w-full rounded-xl bg-[#12141D] border border-[#1F2430] overflow-hidden flex flex-col h-[520px] shadow-2xl">
    <div class="px-4 py-3 bg-[#181B26] border-b border-[#1F2430] flex items-center justify-between">
      <div>
        <div class="text-sm font-bold text-white">DevPulse AI Engineering Copilot</div>
        <div class="text-[11px] font-mono text-emerald-400">gemini-3.8-flash · Grounding Active</div>
      </div>
      <button id="clearChatBtn" class="text-xs font-mono text-slate-400 hover:text-white cursor-pointer">Reset Thread</button>
    </div>

    <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
      <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] text-slate-200 max-w-[88%]">
        <div class="font-mono text-[10px] text-indigo-400 mb-1">ASSISTANT</div>
        Ask me to generate TypeScript interfaces, SQL migrations, or Tailwind components.
      </div>
    </div>

    <form id="chatForm" class="p-3 bg-[#090A0F] border-t border-[#1F2430] flex items-center gap-2">
      <input id="chatInput" type="text" placeholder="Ask how to optimize React rendering or write a Redis lock..." class="flex-1 bg-[#12141D] border border-[#1F2430] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]" />
      <button type="submit" class="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer">Send</button>
    </form>
  </div>
  <script>
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const list = document.getElementById('chatMessages');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const u = document.createElement('div');
      u.className = 'p-3 rounded-lg bg-[#6366F1]/20 border border-[#6366F1]/40 text-white ml-auto max-w-[85%]';
      u.textContent = text;
      list.appendChild(u);
      input.value = '';
      setTimeout(() => {
        const a = document.createElement('div');
        a.className = 'p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] text-slate-200 max-w-[88%] font-mono';
        a.textContent = '// Synthesized solution for: ' + text + '\\nexport const executeTask = async () => ({ ok: true, ts: Date.now() });';
        list.appendChild(a);
        list.scrollTop = list.scrollHeight;
      }, 180);
    });
    document.getElementById('clearChatBtn').addEventListener('click', () => {
      list.innerHTML = '';
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'interactive-kanban-board',
    title: 'Kanban Board',
    category: 'SaaS & Dashboards',
    summary: 'Sprint engineering task board with Backlog, In Progress, and Shipped columns plus instant task creation.',
    tags: ['Kanban', 'Task Board', 'Productivity'],
    code: {
      prompt: 'Build an Interactive Kanban Board for engineering sprint tasks with instant card creation and column transitions',
      seoTitle: 'DevPulse Sprint Kanban Board',
      seoDescription: 'Track engineering tickets across Backlog, Active Sprint, and Production.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F2430] pb-4">
      <div>
        <div class="text-xs font-mono text-indigo-400">SPRINT 42 · CORE PLATFORM</div>
        <h1 class="text-2xl font-bold text-white">Engineering Issue Tracker</h1>
      </div>
      <form id="addTaskForm" class="flex items-center gap-2">
        <input id="taskTitle" type="text" placeholder="New ticket title..." class="bg-[#12141D] border border-[#1F2430] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#6366F1]" />
        <button type="submit" class="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer">+ Add Ticket</button>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-3">
        <div class="text-xs font-mono font-bold text-slate-300">01 · BACKLOG</div>
        <div id="col-todo" class="space-y-2.5">
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] space-y-1">
            <div class="text-[10px] font-mono text-indigo-400">DP-204 · INFRA</div>
            <div class="text-xs font-semibold text-white">Add WebSocket heartbeat compression</div>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-3">
        <div class="text-xs font-mono font-bold text-amber-400">02 · IN PROGRESS</div>
        <div class="space-y-2.5">
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] space-y-1">
            <div class="text-[10px] font-mono text-amber-400">DP-208 · AI ROUTER</div>
            <div class="text-xs font-semibold text-white">Multi-provider token bucket rate limiter</div>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-3">
        <div class="text-xs font-mono font-bold text-emerald-400">03 · SHIPPED</div>
        <div class="space-y-2.5">
          <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430] space-y-1">
            <div class="text-[10px] font-mono text-emerald-400">DP-199 · SANDBOX</div>
            <div class="text-xs font-semibold text-white">Zero-login localStorage snapshot engine</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('addTaskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('taskTitle');
      if (!input.value.trim()) return;
      const card = document.createElement('div');
      card.className = 'p-3 rounded-lg bg-[#090A0F] border border-[#6366F1]/50 space-y-1';
      card.innerHTML = '<div class="text-[10px] font-mono text-indigo-400">DP-NEW · SPRINT</div><div class="text-xs font-semibold text-white">' + input.value.trim() + '</div>';
      document.getElementById('col-todo').prepend(card);
      input.value = '';
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'glassmorphism-auth-card',
    title: 'Glassmorphism Auth Card',
    category: 'Auth & FinTech',
    summary: 'Zero-trust developer authentication card with Passkey, GitHub/GitLab OAuth, and real-time password entropy bar.',
    tags: ['Auth Card', 'Glassmorphism', 'OAuth'],
    code: {
      prompt: 'Build a Glassmorphism Auth Card with GitHub/GitLab OAuth buttons and live password strength meter',
      seoTitle: 'DevPulse Cloud Sign-In',
      seoDescription: 'Authenticate via Passkey, GitHub OAuth, or SSO.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-md w-full p-7 rounded-2xl bg-[#12141D]/90 backdrop-blur-xl border border-[#2A3042] shadow-2xl space-y-5">
    <div class="space-y-1">
      <div class="text-xs font-mono text-indigo-400">ZERO-TRUST WORKSPACE ACCESS</div>
      <h1 class="text-2xl font-bold text-white">Sign in to DevPulse OS</h1>
      <p class="text-xs text-slate-400">Use your hardware passkey or developer OAuth provider.</p>
    </div>

    <div class="grid grid-cols-2 gap-2.5">
      <button class="py-2 px-3 rounded-lg bg-[#1A1D29] hover:bg-[#252A3A] border border-[#2A3042] text-xs font-mono text-white cursor-pointer">GitHub OAuth</button>
      <button class="py-2 px-3 rounded-lg bg-[#1A1D29] hover:bg-[#252A3A] border border-[#2A3042] text-xs font-mono text-white cursor-pointer">GitLab OAuth</button>
    </div>

    <form id="authForm" class="space-y-3">
      <div>
        <label class="block text-xs font-mono text-slate-300 mb-1">Work Email</label>
        <input type="email" required value="architect@devpulse.dev" class="w-full bg-[#090A0F] border border-[#2A3042] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]" />
      </div>
      <div>
        <label class="block text-xs font-mono text-slate-300 mb-1">Passphrase</label>
        <input id="pwInput" type="password" required value="correct-horse-battery-staple" class="w-full bg-[#090A0F] border border-[#2A3042] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]" />
      </div>
      <div id="authStatus" class="text-xs font-mono text-emerald-400">Entropy: 128-bit hardware grade</div>
      <button type="submit" class="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer">Continue to Workspace →</button>
    </form>
  </div>
  <script>
    document.getElementById('authForm').addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('authStatus').textContent = 'Session verified · Redirecting to sandbox...';
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'crypto-orderbook-card',
    title: 'Crypto Analytics & Orderbook Card',
    category: 'Auth & FinTech',
    summary: 'Institutional perpetual futures orderbook and portfolio delta card with live price tick simulator.',
    tags: ['FinTech', 'Orderbook', 'Trading UI'],
    code: {
      prompt: 'Build a Crypto Analytics & Orderbook Card with live bid/ask depth and tick simulation',
      seoTitle: 'PulseDEX Orderbook & Liquidity Telemetry',
      seoDescription: 'Real-time L2 orderbook depth and perpetual funding telemetry.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-xl w-full p-6 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-5 font-mono">
    <div class="flex items-center justify-between border-b border-[#1F2430] pb-4">
      <div>
        <div class="text-xs text-slate-400">SOL-PERP · L2 ORDERBOOK</div>
        <div id="markPrice" class="text-2xl font-bold text-emerald-400 mt-0.5">$194.82</div>
      </div>
      <button id="tickBtn" class="px-3 py-1.5 rounded bg-[#6366F1] text-white text-xs cursor-pointer">Simulate Market Tick</button>
    </div>
    <div class="grid grid-cols-2 gap-4 text-xs">
      <div class="space-y-1">
        <div class="text-slate-400 pb-1">BIDS (BUY)</div>
        <div class="flex justify-between text-emerald-400"><span>194.80</span><span>420.5 SOL</span></div>
        <div class="flex justify-between text-emerald-400"><span>194.75</span><span>890.0 SOL</span></div>
      </div>
      <div class="space-y-1">
        <div class="text-slate-400 pb-1">ASKS (SELL)</div>
        <div class="flex justify-between text-rose-400"><span>194.85</span><span>310.2 SOL</span></div>
        <div class="flex justify-between text-rose-400"><span>194.90</span><span>740.8 SOL</span></div>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('tickBtn').addEventListener('click', () => {
      const next = (192 + Math.random() * 6).toFixed(2);
      document.getElementById('markPrice').textContent = '$' + next;
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'ai-agent-workflow-pipeline',
    title: 'AI Agent Workflow Pipeline',
    category: 'AI & Chat',
    summary: 'Multi-step autonomous agent execution DAG showing Planner, Web Grounding, Code Synthesizer, and Verifier nodes.',
    tags: ['AI Agents', 'Workflow DAG', 'Orchestration'],
    code: {
      prompt: 'Build an AI Agent Workflow Pipeline viewer with interactive node execution steps',
      seoTitle: 'DevPulse Autonomous Agent Pipeline',
      seoDescription: 'Inspect multi-agent tool calls, latency budgets, and verification gates.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 lg:p-10 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-[#1F2430] pb-4">
      <div>
        <div class="text-xs font-mono text-indigo-400">DAG ORCHESTRATOR · 4 NODES</div>
        <h1 class="text-2xl font-bold text-white">Autonomous Code Synthesis Pipeline</h1>
      </div>
      <button id="runDagBtn" class="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-mono font-semibold cursor-pointer">Execute Pipeline</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
      <div class="p-4 rounded-xl bg-[#12141D] border border-emerald-500/40 space-y-2">
        <div class="text-emerald-400">01 · PLANNER</div>
        <div class="text-white font-bold">Schema & Spec Parser</div>
        <div class="text-slate-400">112 ms · Completed</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-emerald-500/40 space-y-2">
        <div class="text-emerald-400">02 · GROUNDING</div>
        <div class="text-white font-bold">Google Search Context</div>
        <div class="text-slate-400">248 ms · 4 Citations</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-indigo-500/50 space-y-2">
        <div class="text-indigo-400">03 · SYNTHESIZER</div>
        <div class="text-white font-bold">Gemini 4 Argon AST</div>
        <div id="node3Status" class="text-amber-400">390 ms · Verified</div>
      </div>
      <div class="p-4 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-2">
        <div class="text-slate-400">04 · SANDBOX GATE</div>
        <div class="text-white font-bold">Unit & DOM Assertions</div>
        <div id="node4Status" class="text-emerald-400">11/11 Passed</div>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('runDagBtn').addEventListener('click', () => {
      document.getElementById('node3Status').textContent = (310 + Math.floor(Math.random() * 90)) + ' ms · Streamed';
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'stripe-checkout-modal',
    title: 'Stripe-Style Checkout Modal',
    category: 'Auth & FinTech',
    summary: 'High-conversion developer API credit top-up checkout with promo code applier and instant receipt summary.',
    tags: ['Checkout', 'FinTech', 'Billing'],
    code: {
      prompt: 'Build a Stripe-Style Checkout Modal for API compute credits with promo code calculation',
      seoTitle: 'DevPulse Compute Credit Checkout',
      seoDescription: 'Instant API credit top-up with zero platform fees.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-lg w-full p-6 rounded-2xl bg-[#12141D] border border-[#1F2430] space-y-5">
    <div class="flex items-center justify-between border-b border-[#1F2430] pb-4">
      <div>
        <div class="text-xs font-mono text-indigo-400">COMPUTE TOP-UP</div>
        <h1 class="text-xl font-bold text-white">50,000 Sandbox Execution Credits</h1>
      </div>
      <div id="totalAmount" class="text-2xl font-mono font-bold text-emerald-400">$29.00</div>
    </div>
    <div class="flex items-center gap-2">
      <input id="promoInput" type="text" placeholder="Promo code (try DEVPULSE20)" class="flex-1 bg-[#090A0F] border border-[#1F2430] rounded-lg px-3 py-2 text-xs font-mono text-white" />
      <button id="applyPromoBtn" class="px-3 py-2 rounded-lg bg-[#1A1D29] text-xs font-mono text-white cursor-pointer">Apply</button>
    </div>
    <button id="payBtn" class="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#818CF8] text-white text-xs font-semibold cursor-pointer">Complete Instant Top-Up</button>
  </div>
  <script>
    document.getElementById('applyPromoBtn').addEventListener('click', () => {
      document.getElementById('totalAmount').textContent = '$23.20';
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'realtime-api-status-page',
    title: 'Realtime API Uptime Status Page',
    category: 'SaaS & Dashboards',
    summary: '90-day uptime bar matrix for API Gateway, Sandbox Runner, and OAuth Broker with incident log.',
    tags: ['Status Page', 'SLA', 'Monitoring'],
    code: {
      prompt: 'Build a Realtime API Uptime Status Page with 90-day availability bars and incident history',
      seoTitle: 'DevPulse System Status — 99.99% Uptime',
      seoDescription: 'Live operational status across all AI inference and sandbox endpoints.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 lg:p-10 font-sans">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
      <span class="text-sm font-bold text-emerald-400">All Systems Operational</span>
      <span class="text-xs font-mono text-slate-300">99.994% 90-Day SLA</span>
    </div>
    <div class="p-5 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-4 font-mono text-xs">
      <div class="flex justify-between text-white"><span>Multi-Model AI Router</span><span class="text-emerald-400">100.00% Uptime</span></div>
      <div class="flex justify-between text-white"><span>Isolated Artifact Sandbox</span><span class="text-emerald-400">99.99% Uptime</span></div>
      <div class="flex justify-between text-white"><span>GitHub / GitLab OAuth Bridge</span><span class="text-emerald-400">100.00% Uptime</span></div>
    </div>
  </div>
</body>
</html>`,
    },
  },
  {
    id: 'developer-cli-command-palette',
    title: 'Developer CLI Command Palette',
    category: 'AI & Chat',
    summary: 'Raycast/Linear-style keyboard command palette (`Cmd+K`) with fuzzy filtering and instant action execution.',
    tags: ['Command Palette', 'Raycast UI', 'Keyboard'],
    code: {
      prompt: 'Build a Raycast-style Developer CLI Command Palette with live search filtering',
      seoTitle: 'DevPulse Command Palette',
      seoDescription: 'Keyboard-first developer action launcher.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-xl w-full rounded-2xl bg-[#12141D] border border-[#2A3042] overflow-hidden shadow-2xl">
    <div class="p-3.5 border-b border-[#1F2430]">
      <input id="cmdSearch" type="text" placeholder="Type a command or search tools..." class="w-full bg-transparent text-sm text-white focus:outline-none font-mono" />
    </div>
    <div id="cmdList" class="p-2 space-y-1 font-mono text-xs">
      <div class="cmd-item p-2.5 rounded-lg hover:bg-[#1A1D29] flex justify-between text-white cursor-pointer"><span>Synthesize New UI Artifact</span><span class="text-slate-400">⌘ + Enter</span></div>
      <div class="cmd-item p-2.5 rounded-lg hover:bg-[#1A1D29] flex justify-between text-white cursor-pointer"><span>Format & Indent Source Code</span><span class="text-slate-400">⇧ + ⌥ + F</span></div>
      <div class="cmd-item p-2.5 rounded-lg hover:bg-[#1A1D29] flex justify-between text-white cursor-pointer"><span>Export Artifact to Next.js App Router</span><span class="text-slate-400">⌘ + E</span></div>
      <div class="cmd-item p-2.5 rounded-lg hover:bg-[#1A1D29] flex justify-between text-white cursor-pointer"><span>Open BYOK API Key Vault</span><span class="text-slate-400">⌘ + K</span></div>
    </div>
  </div>
  <script>
    const input = document.getElementById('cmdSearch');
    const items = document.querySelectorAll('.cmd-item');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      items.forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    });
  </script>
</body>
</html>`,
    },
  },
  {
    id: 'finops-token-cost-calculator',
    title: 'LLM Token & FinOps Cost Calculator',
    category: 'SaaS & Dashboards',
    summary: 'Interactive LLM token pricing estimator comparing Gemini Flash, Groq Llama 3.3, and BYOK Pro workloads.',
    tags: ['FinOps', 'Calculator', 'LLM Pricing'],
    code: {
      prompt: 'Build an interactive LLM Token & FinOps Cost Calculator with daily request sliders',
      seoTitle: 'DevPulse FinOps LLM Token Calculator',
      seoDescription: 'Estimate monthly inference spend across Gemini Flash, Groq LPU, and OpenRouter.',
      dependencies: ['tailwindcss'],
      css: '',
      js: '',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0F] text-[#E3E1E9] min-h-screen p-6 flex items-center justify-center font-sans">
  <div class="max-w-xl w-full p-6 rounded-xl bg-[#12141D] border border-[#1F2430] space-y-5 font-mono">
    <div>
      <div class="text-xs text-indigo-400">FINOPS ESTIMATOR</div>
      <h1 class="text-xl font-bold text-white mt-0.5">Monthly AI Token Spend</h1>
    </div>
    <div class="space-y-2">
      <div class="flex justify-between text-xs"><span>Daily API Calls</span><span id="reqVal" class="text-emerald-400">50,000 / day</span></div>
      <input id="reqSlider" type="range" min="5000" max="500000" step="5000" value="50000" class="w-full accent-[#6366F1]" />
    </div>
    <div class="grid grid-cols-2 gap-3 text-xs">
      <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430]">
        <div class="text-slate-400">Auto-Rotator Free Tier</div>
        <div class="text-lg font-bold text-emerald-400 mt-1">$0.00 / mo</div>
      </div>
      <div class="p-3 rounded-lg bg-[#090A0F] border border-[#1F2430]">
        <div class="text-slate-400">Dedicated Enterprise Cluster</div>
        <div id="entCost" class="text-lg font-bold text-white mt-1">$112.50 / mo</div>
      </div>
    </div>
  </div>
  <script>
    const slider = document.getElementById('reqSlider');
    slider.addEventListener('input', () => {
      const v = Number(slider.value);
      document.getElementById('reqVal').textContent = v.toLocaleString() + ' / day';
      document.getElementById('entCost').textContent = '$' + ((v / 1000) * 2.25).toFixed(2) + ' / mo';
    });
  </script>
</body>
</html>`,
    },
  },
];
