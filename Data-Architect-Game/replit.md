# Data Architect

**Enterprise Analytics Simulation**

*Unify. Govern. Scale.*

A grand strategy simulation game where the map is an enterprise data estate and the player deploys and scales an analytics stack. Built for Solutions Architect training.

## Overview

**Data Architect** is a turn-based strategy game where you play as a newly appointed Data and Analytics Solutions Architect. Your mission: unify a fragmented enterprise data estate under tight timelines, balancing adoption, trust, governance, and reliability while managing costs and responding to events.

## How to Play

### Getting Started
1. Watch the opening story cinematic (or skip it)
2. Choose one of three scenarios (Speed-to-Value, Governance-First, or Scale-Out Enterprise)
3. Read the scenario intro to understand your starting position
4. You have 12 turns to meet all objectives

### The Map
The map shows your enterprise data estate as a graph of nodes:
- **Business Units** (blue): Finance, Operations, Product, etc.
- **Applications** (teal): ERP, CRM, Support systems
- **Data Platforms** (purple): Data Warehouse, Lake, Query Engine
- **Domains** (orange): Orders, Customers, Revenue, Tickets

### Node Badges
Each node shows coloured badges indicating:
- **A** (Adoption): How much the node is being used
- **T** (Trust): Confidence in the node's data
- **L** (Latency): Query performance (lower is better)

Colours: Green (good) | Yellow (warning) | Red (critical)

### Actions (2 per turn)
Click a node to see available actions:

**Deployment Actions** (node-specific):
- **Simba Connectors**: Deploy on Applications/Data Platforms - reduces latency
- **VDD Pilot**: Deploy on Business Units - boosts adoption quickly
- **Managed Dashboards**: Deploy on Business Units - increases trust/reliability

**Global Actions**:
- **Run Enablement**: Training sessions - reduces support load, increases adoption
- **Add Governance Policy**: Increases governance/trust, reduces adoption temporarily
- **Performance Tuning**: Reduces latency, improves reliability

### Undo Feature
Made a mistake? Use the **Undo** button to revert your last action within the current turn. Undo restores all metrics, deployments, and costs to their previous state.

### Mission Brief
The Mission Brief panel (left side) shows:
- Win/lose conditions at a glance
- Dynamic **Coach Tips** from Archie based on your current metrics
- Hover over tips for detailed explanations

### Events
Random events occur (frequency depends on scenario) that require decisions. Each choice has trade-offs. Turn flavour text adds story context.

### Win Conditions (by Turn 12)
- Adoption ≥ 75%
- Trust ≥ 75%
- Governance ≥ 70%
- Reliability ≥ 70%
- Latency ≤ 1200ms
- Cost ≤ £120/turn

### Lose Conditions (immediate)
- Trust ≤ 15%
- Reliability ≤ 15%
- Political Capital ≤ 10%

## Characters

### Archie
Your pragmatic coach and data estate guide. Archie appears throughout the game with expressions that react to your performance:
- **Normal**: Steady state
- **Worried**: When Trust or Reliability are critically low
- **Stern**: When governance is low but adoption is high (reckless growth)
- **Excited**: When all metrics are trending well

## Technical Details

### Tech Stack
- React + TypeScript (Vite)
- Tailwind CSS for styling
- Zustand for state management
- localStorage for persistence
- Deterministic simulation with seeded RNG

### Project Structure
```
client/src/
├── components/game/    # Game UI components
│   ├── MapGraph.tsx    # SVG map visualisation
│   ├── MetricsBar.tsx  # Top metrics display
│   ├── TurnPanel.tsx   # Left panel - turn info/objectives
│   ├── NodePanel.tsx   # Right panel - node details/actions
│   ├── MissionBrief.tsx # Win/lose conditions + dynamic guidelines
│   ├── EventModal.tsx  # Event decision modal with flavour text
│   ├── TutorialOverlay.tsx
│   ├── EndScreen.tsx
│   ├── ScenarioSelector.tsx
│   ├── StoryIntro.tsx  # Opening cinematic + scenario intros
│   └── Mascot.tsx      # Archie with 4 expressions
├── lib/
│   ├── gameTypes.ts    # TypeScript type definitions
│   ├── gameStore.ts    # Zustand store with persistence + undo
│   ├── gameStrings.ts  # Centralised copy and dynamic guidelines
│   ├── simulation.ts   # Game logic (actions, turn resolution)
│   ├── events.ts       # Event card definitions
│   ├── scenarios.ts    # Scenario presets and node generation
│   └── rng.ts          # Seeded random number generator
└── pages/game.tsx      # Main game page
```

### Balance Tuning
Key files for balance adjustments:
- `lib/simulation.ts`: Action effects, turn resolution formulas
- `lib/events.ts`: Event triggers and outcomes
- `lib/scenarios.ts`: Starting metrics for each scenario
- `lib/gameTypes.ts`: Win/lose thresholds (WIN_CONDITIONS, LOSE_THRESHOLDS)
- `lib/gameStrings.ts`: Dynamic guideline conditions and text

## Running the Game

The game runs at the root URL. Start the development server with `npm run dev`.

## Recent Changes

- Renamed from "Insight Empire" to "Data Architect"
- Added Archie mascot with 4 reactive expressions
- Added Mission Brief panel with dynamic Coach Tips
- Implemented Undo action functionality (per-turn snapshots)
- Added Story Mode: opening cinematic, scenario intros, turn flavour text
- Centralised all game copy in gameStrings.ts for easy adjustment
- Dark/light theme support maintained
