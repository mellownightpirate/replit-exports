# Design Guidelines: Habit Tracker & Weekly Planner

## Design Approach
**System-Based Approach** inspired by productivity tools (Linear, Notion, Apple Reminders) with custom habit-tracking patterns. Focus on clarity, data density, and "calm productivity" aesthetic.

## Core Design Principles
1. **Information Clarity**: Dense data presentation without overwhelming
2. **Quick Interaction**: Immediate feedback on all toggles and checks
3. **Calm Focus**: Minimal distractions, purposeful use of accent color
4. **Responsive Data**: Seamless mobile-to-desktop experience

---

## Typography System

**Font Family**: 
- Primary: Inter or SF Pro Display (via Google Fonts CDN)
- Monospace: JetBrains Mono (for numbers/percentages)

**Hierarchy**:
- Page titles: text-2xl/3xl font-semibold
- Section headers: text-lg/xl font-medium
- Card titles: text-base font-medium
- Body/tasks: text-sm font-normal
- Metadata/counts: text-xs font-medium
- Numbers/percentages: Use monospace font-feature-settings for tabular nums

---

## Layout & Spacing System

**Tailwind Units**: Consistently use 2, 3, 4, 6, 8, 12, 16 for spacing
- Component padding: p-4 (cards), p-6 (sections)
- Gap between elements: gap-2 (tight lists), gap-4 (cards), gap-6 (sections)
- Section margins: mb-8 between major sections

**Grid Patterns**:
- Weekly planner: grid-cols-1 md:grid-cols-2 lg:grid-cols-7 (day cards)
- Monthly habit grid: Fixed left column (habit names) + scrollable right grid (days 1-31)
- Analytics: grid-cols-1 lg:grid-cols-2 for chart pairs

**Container Strategy**:
- Max width: max-w-7xl for main content
- Page padding: px-4 md:px-6 lg:px-8
- Sticky navigation: Top bar with week/month selector, stays fixed on scroll

---

## Component Library

### Navigation & Controls
**Top Bar**:
- Fixed header with app title (left), date/week/month selector (center), theme toggle + export (right)
- Height: h-16, backdrop-blur-md with subtle border-b
- Navigation tabs: Simple text links (Weekly | Monthly | Analytics) with active underline indicator

**Date Selectors**:
- Arrow buttons (‹ ›) + current period display
- Compact design: inline-flex items-center gap-2
- Today indicator: subtle badge or dot

### Cards & Containers
**Day Cards** (Weekly Planner):
- Rounded-xl with border, p-4
- Header: Day name + date (small), completion ring chart (60x60px) aligned right
- Task list: space-y-2 below header
- Footer: Completion counts (text-xs)

**Habit Grid** (Monthly):
- Left column: Habit list with emoji + name (w-48 min-width, sticky)
- Right grid: 31 columns, each cell 32x32px minimum
- Cell states: Empty border (not done), filled (done), subtle grey (skipped/future)
- Row hover: Highlight entire row for easier reading
- Daily totals row: Fixed at bottom showing percentage per day

**Task Items**:
- Checkbox (rounded-md) + text + optional tag badges
- Strikethrough on completion with subtle opacity reduction
- Hover: Show edit/delete icons (icons from Heroicons CDN)

### Data Visualization
**Ring/Doughnut Charts** (Recharts):
- Size: 60-80px for day cards, 120-160px for analytics
- Stroke width: Thin (6-8px)
- Center: Display percentage (text-xl font-medium monospace)

**Progress Bars**:
- Height: h-2, rounded-full
- Container: bg-gray-200 dark:bg-gray-700
- Fill: Smooth transition, green accent

**Charts** (Analytics):
- Line chart: Daily completion trend (full width, h-64)
- Bar chart: Habit comparison (h-48 per habit)
- Clean axes, minimal grid lines, tooltips on hover
- Legend: Only if multiple data series

### Forms & Inputs
**Add Task/Habit**:
- Inline input: border-b focus:border-accent transition
- Placeholder text with emoji suggestion
- Quick add button (+ icon) or Enter key submit

**Checkbox/Toggle**:
- Size: 20x20px for tasks, 32x32px for habit grid cells
- Rounded for tasks (rounded-md), square for grid (rounded-sm)
- Smooth scale transform on click (scale-95 → scale-100)
- Immediate visual feedback (no loading states needed)

### Empty States
- Icon (from Heroicons) + message + CTA button
- Centered in container, max-w-md
- Example: "No tasks yet. Add your first task to get started."

---

## Interactions & Animation

**Micro-interactions** (use sparingly):
- Checkbox check: Scale + fade (150ms ease-out)
- Progress updates: Smooth width transition (300ms)
- Card hover: Subtle lift (translate-y-0.5) and shadow increase
- NO elaborate page transitions or scroll animations

**Accessibility**:
- Focus rings on all interactive elements (ring-2 ring-accent ring-offset-2)
- Keyboard navigation for task list (arrow keys to move, space to toggle)
- ARIA labels for icon-only buttons

---

## Responsive Behavior

**Mobile** (< 768px):
- Stack day cards vertically (grid-cols-1)
- Habit grid: Horizontal scroll with sticky habit names
- Reduce chart heights (h-48 instead of h-64)
- Collapsible sections for analytics

**Tablet** (768-1024px):
- 2 column day cards
- Full habit grid visible with comfortable cell sizes

**Desktop** (> 1024px):
- 7 column week view
- Side-by-side analytics charts
- Larger chart sizes for better readability

---

## Dark Mode Strategy
- System preference detection on load
- Toggle in top bar (sun/moon icon)
- Color transitions: 200ms for smooth switching
- Ensure habit grid cells have good contrast in both modes

---

## Images
**No hero images needed** for this utility application. All visuals are data-driven (charts, progress indicators). 

If adding an "About" modal or onboarding:
- Screenshot of reference spreadsheet (max-w-2xl, rounded-lg, shadow-2xl)
- Placement: Centered in modal overlay

---

## Critical Layout Details
- **No forced viewport heights**: Let content breathe naturally
- **Fixed elements**: Only top navigation bar (with backdrop blur)
- **Scrolling**: Habit grid body scrolls independently, headers sticky
- **White space**: Generous padding within cards, tighter spacing in data grids for information density