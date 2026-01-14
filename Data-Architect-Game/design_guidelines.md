# Insight Empire - Design Guidelines

## Design Approach

**Hybrid System**: Material Design foundation + Strategy Game UI patterns

This application combines enterprise data tooling with grand strategy gameplay. Draw inspiration from:
- **Primary**: Civilization VI, Stellaris (information-dense strategy UIs)
- **Secondary**: Linear, Notion (clean data presentation)
- **Tertiary**: Material Design (component consistency)

**Core Principles**:
- Information density without clutter
- Instant metric readability
- Clear hierarchy between game state and actions
- Professional enterprise aesthetic with gaming functionality

---

## Typography

**Font Stack**:
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for metrics/numbers)

**Type Scale**:
- Game Title: text-3xl font-bold (36px)
- Section Headers: text-xl font-semibold (20px)
- Metric Labels: text-sm font-medium uppercase tracking-wide (12px)
- Metric Values: text-2xl font-mono font-bold (24px)
- Body Text: text-base (16px)
- Node Labels: text-xs font-medium (12px)
- Event Text: text-base leading-relaxed (16px)
- Button Text: text-sm font-semibold (14px)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8 (p-2, m-4, gap-6, h-8)

**Main Layout Structure**:
```
┌─────────────────────────────────────┐
│  Top Metrics Bar (h-20)             │ ← Global metrics cards
├──────┬─────────────────┬────────────┤
│ Left │                 │   Right    │
│Panel │   Map Graph     │   Panel    │
│(w-64)│   (flex-1)      │   (w-80)   │
│      │                 │            │
│Turn  │   SVG Visual    │   Node     │
│Info  │   Network       │   Details  │
│      │                 │   Actions  │
└──────┴─────────────────┴────────────┘
```

**Grid System**: 
- Metrics bar: grid grid-cols-6 gap-4
- Node details: flex flex-col gap-6
- Action buttons: grid grid-cols-2 gap-3

---

## Component Library

### Metrics Cards (Top Bar)
- Card container: rounded-lg border p-4
- Label: text-xs uppercase tracking-wider opacity-70
- Value: text-2xl font-mono font-bold
- Delta indicator: small badge with +/- trend
- Status color stripe on left edge (3px) showing health

### Map Graph (SVG Center Panel)
- Canvas: viewBox with pan/zoom capability
- Nodes: 
  - Circles (r=24-32) with category-based icons
  - Status badges in corners (adoption/trust/latency/cost)
  - Pulse animation on active deployments
- Edges: Stroke-width 2, dashed for weak connections
- Selected node: thick stroke outline, slight glow

### Node Detail Panel (Right)
- Header: Node type icon + name (text-lg font-semibold)
- Stats grid: 2-column layout for metrics
- Deployment status: chips showing active capabilities
- Available actions: stacked button list with icons

### Action Buttons
- Primary: Full-width, h-12, rounded-md, font-semibold
- Secondary: Outlined variant, h-10
- Disabled: Reduced opacity with tooltip on hover explaining why
- Icons: Left-aligned, from Heroicons (CDN)

### Event Modal
- Overlay: backdrop-blur-sm with dark overlay
- Card: max-w-2xl, rounded-xl, p-8
- Event title: text-2xl font-bold mb-4
- Event description: text-base leading-relaxed mb-6
- Choice buttons: Large, full-width, gap-3, show consequences preview
- Dismiss corner X: absolute top-4 right-4

### Tutorial Overlay
- Dark overlay with spotlight effect on teaching elements
- Step indicator: "Step 1 of 5" at top
- Instruction card: Positioned near relevant UI element
- Navigation: "Next" and "Skip Tutorial" buttons

### End Screen
- Full-screen modal with results
- Victory/defeat banner at top
- Metrics comparison: Start vs Final in 2 columns
- Timeline: Scrollable list of turn events
- Actions: "Play Again" (primary), "Change Scenario" (secondary)

### Turn Controls (Left Panel)
- Current turn: Large text-4xl font-bold
- Objectives checklist: Compact list with progress bars
- Actions remaining: Badge counter (2/2)
- "End Turn" button: Large, primary style
- "Reset Run" button: Small, secondary, at bottom

---

## Animations

**Minimal, Purposeful Only**:
- Metric changes: 300ms number count-up (use react-countup or similar)
- Event modal: 200ms fade-in
- Node selection: 150ms scale + glow
- Turn transition: 400ms fade for metric updates
- Deployment pulse: Subtle 2s infinite pulse on active nodes

**No animations on**:
- Button hovers/clicks (rely on native states)
- Panel transitions
- Graph panning/zooming (immediate response preferred)

---

## Visual Patterns

**Status Indicators**:
- Green threshold: ≥70
- Yellow threshold: 40-69  
- Red threshold: <40
- Use stroke/border, not fills

**Badges**: Rounded-full, px-2 py-1, text-xs font-medium

**Iconography**: Heroicons Outline (CDN), 20px for inline, 24px for standalone

**Borders**: border opacity-20 for subtle separation

**Shadows**: Drop-shadows only on modals/overlays (shadow-xl)