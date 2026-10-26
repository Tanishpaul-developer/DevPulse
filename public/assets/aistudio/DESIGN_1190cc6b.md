---
name: Obsidian Precision Engine
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-ui:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system channels the focused, high-performance atmosphere of developer utilities like Linear, Vercel, and Raycast. It prioritizes information density, razor-sharp visual clarity, and near-zero cognitive friction. 

The aesthetic leans on a hyper-refined **Dark Mode Minimalism** hybridized with **Architectural Layering**:
- **Personality:** Decisive, hyper-efficient, technical, unobtrusive.
- **Target Audience:** Software engineers, platform architects, DevOps practitioners, and technical founders who navigate high-frequency workflows.
- **Visual Tenets:** Flat optical tiers separated by micro-borders (1px), subdued charcoal canvases, high-contrast monospace metadata, and purposeful chromatic pings (electric indigo, emerald, amber) used exclusively to direct workflow attention.

## Colors

The color system is engineered for prolonged sessions in low-light environments, maximizing optical hierarchy without causing eye strain.

### Palette Architecture
- **Canvas Base (Obsidian):** `#090A0F` — The foundational backdrop for the entire viewport shell.
- **Surfaces & Tiers:**
  - `surface-base`: `#090A0F` (Root window, global canvas)
  - `surface-panel`: `#12141D` (Sidebars, file trees, status dock)
  - `surface-elevated`: `#161926` (Active editors, terminals, contextual popovers, command palettes)
  - `surface-active`: `#1E2335` (Row hovers, selected breadcrumbs)
- **Borders & Dividers:**
  - `border-subtle`: `#1F2430` (Structural interior panel divisions)
  - `border-interactive`: `#2A3042` (Input outlines, active window focus indicators, elevated card borders)
  - `border-highlight`: `#3E465E` (Selected states, keyboard-focused nodes)
- **Accent & Functional Signals:**
  - **Electric Indigo (`#6366F1` base, `#818CF8` light):** Used for primary commit triggers, active tab indicators, syntax identifiers, and selection carets.
  - **Emerald Pulse (`#10B981`):** Direct indicator of successful compilation, green tests, live worker instances, and operational health.
  - **Amber Spark (`#F59E0B`):** Warning states, resource quota notifications, team upgrades, and enterprise-tier indicators.
  - **Rose Flare (`#EF4444`):** Unhandled runtime exceptions, breaking git conflicts, and fatal build logs.

## Typography

Typography balances high-density utility with effortless readability. Two type families drive the entire interface:

- **Geist:** Handles primary prose, navigation hierarchies, modal titles, and action triggers. Chosen for its geometric precision, low stroke variation, and razor-sharp rendering on high-DPI displays.
- **JetBrains Mono:** Dedicated to raw data tables, log outputs, CLI terminals, variable chips, commit hashes, shortcuts, and syntax previews.

### Rules of Usage
- Keep text labels compact: standard UI copy defaults to `body-md` (13px).
- Restrict uppercase transformations strictly to `label-ui` (panel headers, table columns, tag labels).
- Tabular figures must be enabled by default across all numerical readouts (`font-feature-settings: "tnum"`).

## Layout & Spacing

The interface utilizes an engineered docking framework: a fluid multi-pane viewport anchored by fixed vertical rails (activity bars, file trees, inspector docks) and resizable interior panels (code editor, terminal output, trace graph).

### Shell Specifications
- **Activity Bar:** Fixed 48px width on the left-most edge.
- **Collapsible Rails:** Sidebar (240px–360px) and Inspector (280px–400px) with resize handles snapping to 8px intervals.
- **Editor Canvas:** Fluid flex layout taking up remaining viewport width with automatic split-pane grid support.
- **Mobile Reflow (< 768px):** Panels collapse entirely into overlay sheets accessed via a unified command trigger (`Cmd+K`) or bottom sheet tabs.

## Elevation & Depth

This system avoids soft skeuomorphic shadows or thick ambient drop shadows, relying instead on structural **Tonal Layering** accompanied by **Subtle Inner Rings and Edge Lines**:

- **Ground Level (z-0 / Base):** `#090A0F` — Global app viewport wrapper.
- **Dock Level (z-1 / Panels):** `#12141D` inset with a `1px solid #1F2430` border.
- **Active Workspace (z-2 / Windows & Terminals):** `#161926` bounded by `1px solid #2A3042`.
- **Floating Overlays (z-50 / Command Palettes, Dropdowns):** `#161926` background, surrounded by `1px solid #3E465E`, backed by a directional micro-glow: `0 8px 32px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(99, 102, 241, 0.15)`.
- **Modal Backdrops:** `rgba(9, 10, 15, 0.75)` with `backdrop-filter: blur(4px)`.

## Shapes

The interface embraces a compact, technical geometry using **Level 1 (Soft)** rounding.

- **Base Controls (Buttons, Inputs, Badges, Tabs):** `0.25rem` (4px). Matches the dense line heights of source code and tabular layouts.
- **Containers & Flyouts (Cards, Dropdowns, Command Bar):** `0.5rem` (8px). Softens larger surface corners without wasting workspace real estate.
- **Avatars, Status Rings, and Dot Indicators:** Full radius (`9999px`).

## Components

### Buttons
- **Primary:** Background `#6366F1`, text `#FFFFFF`, font `Geist` medium (13px), height 32px, padding 0 12px. Hover: `#818CF8`. Focus: `box-shadow: 0 0 0 2px #090A0F, 0 0 0 4px #6366F1`.
- **Secondary / Ghost:** Background `transparent`, border `1px solid #2A3042`, text `#D1D5DB`. Hover: Background `#161926`, border `#3E465E`, text `#FFFFFF`.
- **Destructive:** Background `rgba(239, 68, 68, 0.1)`, border `1px solid rgba(239, 68, 68, 0.25)`, text `#F87171`. Hover: Background `rgba(239, 68, 68, 0.2)`.

### Command Palette (Raycast / Linear style)
- Centered overlay, max-width 640px, background `#161926`, border `1px solid #3E465E`, corner radius 8px.
- Integrated search input: 44px height, no outer border, text `Geist` 15px, placeholder `#6B7280`.
- Result row: 36px height, rounded 4px, layout horizontal flex with `JetBrains Mono` shortcut hints aligned to the right edge. Active row: background `#1E2335`, text `#FFFFFF`.

### Chips & Badges
- **Status Pills:** Height 20px, font `JetBrains Mono` 11px, border radius 4px, padding 0 6px.
  - *Success (Operational):* Text `#10B981`, background `rgba(16, 185, 129, 0.1)`, border `1px solid rgba(16, 185, 129, 0.2)`.
  - *Warning (Quota/Billing):* Text `#F59E0B`, background `rgba(245, 158, 11, 0.1)`, border `1px solid rgba(245, 158, 11, 0.2)`.
  - *Neutral (Branch / Git Commit):* Text `#9CA3AF`, background `#12141D`, border `1px solid #1F2430`.

### Input Fields & Search Bars
- Background `#12141D`, border `1px solid #1F2430`, color `#F3F4F6`, border radius 4px, height 32px.
- Transitions: Border color transitions to `#6366F1` on focus, paired with an inner box-shadow `0 0 0 1px #6366F1`.

### Data Cards & Metric Tiles
- Background `#12141D`, border `1px solid #1F2430`, padding 16px, border radius 8px.
- Hover state: Border shifts to `#2A3042`, background moves to `#161926` with a smooth 150ms ease.

### Code Blocks & Console Drawers
- Background `#090A0F`, border `1px solid #1F2430`, border radius 6px.
- Monospace styling (`JetBrains Mono`, 12px, line-height 20px), text color `#D1D5DB`.
- Active line highlight: `rgba(99, 102, 241, 0.08)` spanning the full width with a 2px vertical border in `#6366F1` anchored on the left gutter edge.