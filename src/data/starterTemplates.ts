import { ArtifactCodeState } from '../utils/urlHash.ts';

export interface StarterTemplate {
  id: string;
  label: string;
  prompt: string;
  code: ArtifactCodeState;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'saas-landing',
    label: 'SaaS Landing Page',
    prompt: 'Build a high-converting obsidian dark mode SaaS Pricing & Cloud Compute Dashboard with Monthly/Annual billing toggle and live telemetry',
    code: {
      prompt: 'Build a high-converting obsidian dark mode SaaS Pricing & Cloud Compute Dashboard with Monthly/Annual billing toggle and live telemetry',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body class="bg-[#090A0F] text-[#e3e1e9] min-h-screen p-6 lg:p-10 antialiased selection:bg-indigo-500 selection:text-white">
  <div class="max-w-5xl mx-auto">
    <!-- Hero Header -->
    <div class="text-center max-w-2xl mx-auto mb-10">
      <div class="inline-flex items-center gap-2 bg-[#1a1b21] border border-[#2A3042] px-3 py-1 rounded text-xs font-mono text-indigo-300 mb-3">
        <span>PULSE CORE PRICING v2.5</span>
        <span>·</span>
        <span class="text-emerald-400">99.99% Edge SLA</span>
      </div>
      <h1 class="text-3xl lg:text-4xl font-bold tracking-tight text-white">
        Predictable cloud compute for scaling engineering teams
      </h1>
      <p class="text-sm text-slate-400 mt-2">
        Instant sandbox branches, isolated container pools, and sub-10ms global edge delivery.
      </p>

      <!-- Billing Cadence Toggle -->
      <div class="mt-6 inline-flex items-center gap-3 bg-[#12141D] border border-[#1F2430] p-1.5 rounded-lg">
        <button id="btnMonthly" type="button" class="px-3 py-1 rounded text-xs font-medium text-slate-400 transition-colors cursor-pointer">
          Monthly Billing
        </button>
        <button id="billingSwitch" type="button" aria-label="Toggle annual billing" class="w-11 h-6 bg-indigo-600 rounded-full p-1 relative flex items-center transition-colors cursor-pointer">
          <span id="switchKnob" class="w-4 h-4 rounded-full bg-white transition-transform translate-x-5"></span>
        </button>
        <button id="btnAnnual" type="button" class="px-3 py-1 rounded text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer">
          <span>Annual Plan</span>
          <span class="text-emerald-400 font-mono text-[11px]">Save 20%</span>
        </button>
      </div>
    </div>

    <!-- 3-Tier Pricing Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Starter -->
      <div class="bg-[#12141D] border border-[#1F2430] rounded-xl p-6 flex flex-col justify-between hover:border-[#2A3042] transition-all">
        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Starter</h2>
            <span class="font-mono text-[11px] text-slate-400">For early-stage prototypes</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Isolated sandboxes for independent builders.</p>
          <div class="mt-5 flex items-baseline gap-1 font-mono">
            <span id="priceStarter" class="text-3xl font-bold text-white">$15</span>
            <span id="periodStarter" class="text-xs text-slate-400">/mo billed yearly</span>
          </div>
          <ul class="mt-6 space-y-2.5 text-xs text-slate-300 border-t border-[#1F2430] pt-4">
            <li>✓ 1,000 Sandbox Run-minutes</li>
            <li>✓ 2 Concurrent Isolated Nodes</li>
            <li>✓ Shared Community GPUs</li>
            <li class="text-slate-500">· Custom Edge SSL Domains</li>
          </ul>
        </div>
        <button onclick="selectTier('Starter')" class="mt-7 w-full py-2.5 bg-[#1E2335] hover:bg-[#292a2f] text-white text-xs font-semibold rounded transition-colors cursor-pointer">
          Start Free 14-Day Trial
        </button>
      </div>

      <!-- Pro Scale -->
      <div class="bg-[#161926] border border-indigo-500/50 rounded-xl p-6 flex flex-col justify-between relative shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">Most Popular · Scaling Teams</span>
            <h2 class="text-lg font-bold text-white mt-0.5">Pro Scale</h2>
          </div>
        </div>
        <p class="text-xs text-slate-300 mt-1">Full-stack deployment with live edge telemetry.</p>
        <div class="mt-5 flex items-baseline gap-1 font-mono">
          <span id="pricePro" class="text-3xl font-bold text-indigo-400">$39</span>
          <span id="periodPro" class="text-xs text-slate-400">/mo billed yearly</span>
        </div>
        <ul class="mt-6 space-y-2.5 text-xs text-slate-200 border-t border-indigo-500/20 pt-4">
          <li>✓ Unlimited DevPulse Syntheses</li>
          <li>✓ Dedicated Argon & Groq Llama Pipes</li>
          <li>✓ Persistent Serverless DB Branches</li>
          <li>✓ Zero-latency Custom SSL Domains</li>
        </ul>
        <button onclick="selectTier('Pro Scale')" class="mt-7 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-all cursor-pointer">
          Upgrade to Pro Scale →
        </button>
      </div>

      <!-- Enterprise -->
      <div class="bg-[#12141D] border border-[#1F2430] rounded-xl p-6 flex flex-col justify-between hover:border-[#2A3042] transition-all">
        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Enterprise</h2>
            <span class="font-mono text-[11px] text-amber-400">Custom Cluster</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">For mission-critical production workloads.</p>
          <div class="mt-5 flex items-baseline gap-1 font-mono">
            <span id="priceEnt" class="text-3xl font-bold text-white">$159</span>
            <span id="periodEnt" class="text-xs text-slate-400">/mo billed yearly</span>
          </div>
          <ul class="mt-6 space-y-2.5 text-xs text-slate-300 border-t border-[#1F2430] pt-4">
            <li>✓ Air-gapped VPC Peering</li>
            <li>✓ SSO, SAML & SOC2 Audit Logs</li>
            <li>✓ Custom LLM Fine-tune Adapters</li>
            <li>✓ 99.99% Dedicated SLA</li>
          </ul>
        </div>
        <button onclick="selectTier('Enterprise')" class="mt-7 w-full py-2.5 bg-[#1E2335] hover:bg-[#292a2f] text-white text-xs font-semibold rounded transition-colors cursor-pointer">
          Contact Architecture Team
        </button>
      </div>
    </div>

    <!-- Live Selection Banner -->
    <div id="selectionStatus" class="mt-8 p-3.5 rounded-lg bg-[#12141D] border border-[#1F2430] flex items-center justify-between text-xs font-mono text-slate-300">
      <span>Active Configuration: <strong class="text-emerald-400">Pro Scale (Annual Billing · 20% Discount Applied)</strong></span>
      <span class="text-slate-500">AES-256 Encrypted · Sub-second Cold Starts</span>
    </div>
  </div>
</body>
</html>`,
      css: `body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}`,
      js: `let isAnnual = true;

function renderPricing() {
  const knob = document.getElementById('switchKnob');
  const priceStarter = document.getElementById('priceStarter');
  const periodStarter = document.getElementById('periodStarter');
  const pricePro = document.getElementById('pricePro');
  const periodPro = document.getElementById('periodPro');
  const priceEnt = document.getElementById('priceEnt');
  const periodEnt = document.getElementById('periodEnt');

  if (isAnnual) {
    knob.style.transform = 'translateX(20px)';
    priceStarter.textContent = '$15';
    periodStarter.textContent = '/mo billed yearly';
    pricePro.textContent = '$39';
    periodPro.textContent = '/mo billed yearly';
    priceEnt.textContent = '$159';
    periodEnt.textContent = '/mo billed yearly';
  } else {
    knob.style.transform = 'translateX(0px)';
    priceStarter.textContent = '$19';
    periodStarter.textContent = '/mo billed monthly';
    pricePro.textContent = '$49';
    periodPro.textContent = '/mo billed monthly';
    priceEnt.textContent = '$199';
    periodEnt.textContent = '/mo billed monthly';
  }
  console.log('[PricingMatrix] Billing mode switched to:', isAnnual ? 'ANNUAL (20% off)' : 'MONTHLY');
}

document.getElementById('billingSwitch')?.addEventListener('click', () => {
  isAnnual = !isAnnual;
  renderPricing();
});
document.getElementById('btnMonthly')?.addEventListener('click', () => {
  isAnnual = false;
  renderPricing();
});
document.getElementById('btnAnnual')?.addEventListener('click', () => {
  isAnnual = true;
  renderPricing();
});

window.selectTier = function(tierName) {
  const status = document.getElementById('selectionStatus');
  if (status) {
    status.innerHTML = '<span>Selected Plan: <strong class="text-indigo-400">' + tierName + ' (' + (isAnnual ? 'Annual' : 'Monthly') + ')</strong> — Ready to provision cluster.</span><span class="text-emerald-400">✓ Node Reserved</span>';
  }
  console.log('[PricingMatrix] Provisioning requested for tier:', tierName);
};

console.log('[Sandbox] Pulse Core Pricing v2.5 hydrated.');`,
    },
  },
  {
    id: 'kanban-board',
    label: 'Interactive Kanban Board',
    prompt: 'Create an interactive engineering sprint Kanban Board with task creation, column transitions, and story point counters',
    code: {
      prompt: 'Create an interactive engineering sprint Kanban Board with task creation, column transitions, and story point counters',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="bg-[#090A0F] text-slate-100 min-h-screen p-6 antialiased">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F2430] pb-4">
      <div>
        <span class="text-xs font-mono text-indigo-400">SPRINT 42 · CORE PLATFORM</span>
        <h1 class="text-2xl font-bold text-white">Engineering Kanban Workspace</h1>
      </div>
      <div class="flex items-center gap-2">
        <input id="newTaskInput" type="text" placeholder="New issue title..." class="bg-[#12141D] border border-[#2A3042] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
        <button id="addTaskBtn" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors cursor-pointer">
          + Add Issue
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="kanbanGrid"></div>
  </div>
</body>
</html>`,
      css: `body { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }`,
      js: `const tasks = [
  { id: 'DEV-101', title: 'Implement multi-key Gemini failover router', status: 'todo', pts: 5 },
  { id: 'DEV-102', title: 'Add UTF-8 URL hash state serializer', status: 'inprogress', pts: 3 },
  { id: 'DEV-103', title: 'Configure sandboxed iframe console bridge', status: 'done', pts: 8 },
  { id: 'DEV-104', title: 'Optimize Three.js InstancedMesh packet nodes', status: 'inprogress', pts: 5 }
];

const columns = [
  { key: 'todo', label: 'Backlog', accent: 'text-slate-400' },
  { key: 'inprogress', label: 'In Progress', accent: 'text-indigo-400' },
  { key: 'done', label: 'Shipped', accent: 'text-emerald-400' }
];

function renderKanban() {
  const grid = document.getElementById('kanbanGrid');
  grid.innerHTML = columns.map(col => {
    const colTasks = tasks.filter(t => t.status === col.key);
    const cards = colTasks.map(t => \`
      <div class="p-3.5 rounded-lg bg-[#090A0F] border border-[#1F2430] hover:border-[#3E465E] transition-all space-y-2">
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-indigo-400">\${t.id}</span>
          <span class="text-slate-400">\${t.pts} pts</span>
        </div>
        <p class="text-xs font-medium text-white">\${t.title}</p>
        <div class="flex items-center justify-end gap-1.5 pt-1">
          \${col.key !== 'todo' ? \`<button onclick="moveTask('\${t.id}', 'prev')" class="px-2 py-0.5 rounded bg-[#161926] text-[10px] text-slate-300 hover:text-white cursor-pointer">←</button>\` : ''}
          \${col.key !== 'done' ? \`<button onclick="moveTask('\${t.id}', 'next')" class="px-2 py-0.5 rounded bg-indigo-600/20 text-[10px] text-indigo-300 hover:bg-indigo-600 hover:text-white cursor-pointer">Advance →</button>\` : ''}
        </div>
      </div>
    \`).join('');

    return \`
      <div class="bg-[#12141D] border border-[#1F2430] rounded-xl p-4 flex flex-col gap-3 min-h-[320px]">
        <div class="flex items-center justify-between border-b border-[#1F2430] pb-2">
          <span class="text-xs font-semibold \${col.accent}">\${col.label}</span>
          <span class="text-xs font-mono text-slate-400">\${colTasks.length}</span>
        </div>
        <div class="space-y-2.5 flex-1">\${cards}</div>
      </div>
    \`;
  }).join('');
}

window.moveTask = function(id, dir) {
  const order = ['todo', 'inprogress', 'done'];
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const idx = order.indexOf(task.status);
  task.status = dir === 'next' ? order[Math.min(2, idx + 1)] : order[Math.max(0, idx - 1)];
  console.log('[Kanban] Moved', id, 'to', task.status);
  renderKanban();
};

document.getElementById('addTaskBtn')?.addEventListener('click', () => {
  const input = document.getElementById('newTaskInput');
  const val = input.value.trim();
  if (!val) return;
  const newId = 'DEV-' + (100 + tasks.length + 1);
  tasks.push({ id: newId, title: val, status: 'todo', pts: 3 });
  input.value = '';
  console.log('[Kanban] Created issue:', newId, val);
  renderKanban();
});

renderKanban();`,
    },
  },
  {
    id: 'crypto-analytics',
    label: 'Crypto Analytics Card',
    prompt: 'Create an ultra-dense real-time Crypto Analytics terminal card with live order-book depth and SVG price chart',
    code: {
      prompt: 'Create an ultra-dense real-time Crypto Analytics terminal card with live order-book depth and SVG price chart',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#090A0F] text-slate-200 min-h-screen p-6 flex items-center justify-center antialiased font-mono">
  <div class="max-w-2xl w-full bg-[#12141D] border border-[#1F2430] rounded-xl p-6 shadow-2xl space-y-6">
    <div class="flex items-center justify-between border-b border-[#1F2430] pb-4">
      <div>
        <span class="text-[11px] text-slate-400">PERPETUAL DEX ORDERBOOK</span>
        <h2 class="text-base font-bold text-white">ETH / USDC · 20x Isolated</h2>
      </div>
      <span id="deltaTag" class="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">+4.82% (24h)</span>
    </div>

    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <div id="spotPrice" class="text-3xl font-bold text-white">$3,489.12</div>
        <p class="text-xs text-slate-400 mt-1">24h High: $3,520.00 · Low: $3,310.40</p>
      </div>
      <div class="text-right">
        <span class="text-xs text-slate-400">Liquidity Depth</span>
        <p class="text-xs text-emerald-400 font-semibold">$14.2M Bid Wall</p>
      </div>
    </div>

    <div class="w-full h-28 bg-[#090A0F] rounded-lg p-3 border border-[#1F2430] flex items-end">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline id="sparkPoly" fill="none" stroke="#10B981" stroke-width="2" points="0,25 15,20 30,22 45,14 60,18 75,8 90,12 100,4" />
      </svg>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button onclick="placeOrder('LONG')" class="py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
        Execute Market Long
      </button>
      <button onclick="placeOrder('SHORT')" class="py-2.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
        Execute Market Short
      </button>
    </div>
    <div id="orderLog" class="text-xs text-slate-400 pt-1">Ready for low-latency order execution.</div>
  </div>
</body>
</html>`,
      css: `body { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }`,
      js: `let currentPrice = 3489.12;
window.placeOrder = function(side) {
  const jitter = (Math.random() - 0.45) * 18;
  currentPrice = Math.max(2000, currentPrice + jitter);
  document.getElementById('spotPrice').textContent = '$' + currentPrice.toFixed(2);
  const log = document.getElementById('orderLog');
  log.textContent = '[FILLED] ' + side + ' 2.5 ETH @ $' + currentPrice.toFixed(2) + ' (latency: 4.2ms)';
  log.className = side === 'LONG' ? 'text-xs text-emerald-400 pt-1' : 'text-xs text-rose-400 pt-1';
  console.log('[CryptoFeed] Order executed:', side, currentPrice.toFixed(2));
};`,
    },
  },
  {
    id: 'python-calculator',
    label: 'Python Data Calculator',
    prompt: 'Build an interactive Python-style Statistical Data & Regression Calculator with live standard deviation, quartiles, and histogram bars',
    code: {
      prompt: 'Build an interactive Python-style Statistical Data & Regression Calculator with live standard deviation, quartiles, and histogram bars',
      html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#090A0F] text-slate-100 min-h-screen p-6 flex items-center justify-center antialiased">
  <div class="max-w-3xl w-full bg-[#12141D] border border-[#1F2430] rounded-xl p-6 shadow-2xl space-y-5">
    <div class="flex items-center justify-between border-b border-[#1F2430] pb-3">
      <div>
        <span class="text-xs font-mono text-amber-400">NUMPY / PANDAS ENGINE SIMULATOR</span>
        <h2 class="text-xl font-bold text-white">Vector Statistical Data Calculator</h2>
      </div>
      <button id="computeBtn" class="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold cursor-pointer">
        ▶ Run Vector Pipeline
      </button>
    </div>

    <div>
      <label class="block text-xs font-mono text-slate-400 mb-1.5">Dataset Series (comma-separated floats):</label>
      <input id="dataSeries" type="text" value="14.2, 18.6, 22.1, 19.4, 25.8, 31.0, 28.4, 34.2, 29.7, 41.5" class="w-full bg-[#090A0F] border border-[#2A3042] rounded px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500" />
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
      <div class="p-3 rounded bg-[#090A0F] border border-[#1F2430]">
        <span class="text-[11px] text-slate-400">Mean (μ)</span>
        <div id="statMean" class="text-lg font-bold text-white mt-0.5">26.49</div>
      </div>
      <div class="p-3 rounded bg-[#090A0F] border border-[#1F2430]">
        <span class="text-[11px] text-slate-400">Median (Q2)</span>
        <div id="statMedian" class="text-lg font-bold text-indigo-400 mt-0.5">27.10</div>
      </div>
      <div class="p-3 rounded bg-[#090A0F] border border-[#1F2430]">
        <span class="text-[11px] text-slate-400">Std Dev (σ)</span>
        <div id="statStd" class="text-lg font-bold text-emerald-400 mt-0.5">7.78</div>
      </div>
      <div class="p-3 rounded bg-[#090A0F] border border-[#1F2430]">
        <span class="text-[11px] text-slate-400">Sum (Σx)</span>
        <div id="statSum" class="text-lg font-bold text-amber-400 mt-0.5">264.90</div>
      </div>
    </div>

    <div id="barsContainer" class="h-32 bg-[#090A0F] border border-[#1F2430] rounded-lg p-3 flex items-end gap-2"></div>
  </div>
</body>
</html>`,
      css: `body { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }`,
      js: `function computeStats() {
  const raw = document.getElementById('dataSeries').value;
  const nums = raw.split(',').map(s => parseFloat(s.trim())).filter(n => !Number.isNaN(n));
  if (!nums.length) return;

  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const variance = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
  const std = Math.sqrt(variance);

  document.getElementById('statMean').textContent = mean.toFixed(2);
  document.getElementById('statMedian').textContent = median.toFixed(2);
  document.getElementById('statStd').textContent = std.toFixed(2);
  document.getElementById('statSum').textContent = sum.toFixed(2);

  const maxVal = Math.max(...nums, 1);
  const barsContainer = document.getElementById('barsContainer');
  barsContainer.innerHTML = nums.map(n => {
    const pct = Math.max(12, Math.round((n / maxVal) * 100));
    return \`<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end">
      <span class="text-[10px] font-mono text-slate-400">\${n}</span>
      <div class="w-full bg-indigo-500/80 hover:bg-emerald-400 rounded-t transition-all" style="height: \${pct}%"></div>
    </div>\`;
  }).join('');
  console.log('[DataCalc] Computed vector stats:', { count: nums.length, mean: mean.toFixed(2), std: std.toFixed(2) });
}

document.getElementById('computeBtn')?.addEventListener('click', computeStats);
computeStats();`,
    },
  },
];
