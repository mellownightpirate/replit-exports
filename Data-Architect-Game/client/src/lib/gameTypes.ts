/**
 * Data Architect - Game Type Definitions
 * Enterprise analytics simulation for Solutions Architects
 */

// Node categories in the enterprise data estate
export type NodeCategory = 'business-unit' | 'application' | 'data-platform' | 'domain';

// Node represents a point on the game map
export interface GameNode {
  id: string;
  name: string;
  category: NodeCategory;
  x: number; // SVG position
  y: number;
  // Node-specific metrics (local to node)
  adoption: number; // 0-100
  trust: number; // 0-100
  latency: number; // ms
  cost: number; // £ per turn
  // Deployments on this node
  deployments: Deployment[];
  // Whether this node is blocked (e.g., by Central IT veto)
  blocked: boolean;
}

// Edge connects two nodes
export interface GameEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  strength: 'strong' | 'weak'; // Visual: solid vs dashed
}

// Capability types that can be deployed
export type CapabilityType = 'simba-connectors' | 'logi-vdd' | 'managed-dashboards';

// Deployment represents an active capability on a node
export interface Deployment {
  id: string;
  capability: CapabilityType;
  turnDeployed: number;
  authStrength: 'weak' | 'strong'; // For Simba Connectors
  templatesUsed: boolean; // For VDD
}

// Global game metrics
export interface GlobalMetrics {
  adoption: number; // 0-100
  trust: number; // 0-100
  latency: number; // ms (target lower)
  cost: number; // £ per turn
  governanceCoverage: number; // 0-100
  reliability: number; // 0-100
  politicalCapital: number; // 0-100
  supportLoad: number; // tickets per turn
}

// Actions the player can take
export type ActionType = 
  | 'deploy-simba' 
  | 'deploy-vdd' 
  | 'deploy-dashboards'
  | 'run-enablement'
  | 'add-governance'
  | 'performance-tuning'
  | 'incident-response'; // Forced by P1 incident event

export interface GameAction {
  id: string;
  type: ActionType;
  targetNodeId?: string;
  description: string;
  effects: string;
  costPolitical?: number;
  costMoney?: number;
}

// Event cards
export type EventId = 
  | 'auth-model-change'
  | 'schema-drift'
  | 'high-cardinality'
  | 'exec-ai-mandate'
  | 'central-it-veto'
  | 'licensing-surprise'
  | 'p1-incident'
  | 'stalled-adoption'
  | 'data-access-denied'
  | 'shadow-it-breakout';

export interface EventCard {
  id: EventId;
  title: string;
  description: string;
  triggerCondition?: (state: GameState) => boolean;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effect: (state: GameState) => Partial<GameState>;
}

// Active event that requires player decision
export interface ActiveEvent {
  card: EventCard;
  turnDrawn: number;
}

// Scenario presets
export type ScenarioId = 'speed-to-value' | 'governance-first' | 'scale-out';

export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  initialMetrics: GlobalMetrics;
  nodeCount: number;
  eventFrequency: number; // Events per N turns
}

// Timeline entry for end-game summary
export interface TimelineEntry {
  turn: number;
  type: 'action' | 'event' | 'milestone';
  title: string;
  description: string;
}

// Win conditions
export interface WinConditions {
  adoption: number;
  trust: number;
  governanceCoverage: number;
  reliability: number;
  maxLatency: number;
  maxCostPerTurn: number;
}

// Undo snapshot for reverting actions within a turn
export interface UndoSnapshot {
  nodes: GameNode[];
  metrics: GlobalMetrics;
  actionsRemaining: number;
  actionsThisTurn: ActionType[];
  timeline: TimelineEntry[];
  forcedAction: ActionType | null;
  recentTuning: number[];
}

// Game state
export type GamePhase = 'scenario-select' | 'story-intro' | 'playing' | 'event' | 'won' | 'lost';

export interface GameState {
  // Meta
  phase: GamePhase;
  seed: number;
  scenario: Scenario | null;
  
  // Turn tracking
  currentTurn: number;
  maxTurns: number;
  actionsRemaining: number;
  actionsPerTurn: number;
  
  // Map
  nodes: GameNode[];
  edges: GameEdge[];
  selectedNodeId: string | null;
  
  // Metrics
  metrics: GlobalMetrics;
  
  // Events
  activeEvent: ActiveEvent | null;
  eventHistory: EventId[];
  forcedAction: ActionType | null; // e.g., incident-response after P1
  
  // History
  timeline: TimelineEntry[];
  actionsThisTurn: ActionType[];
  recentTuning: number[]; // Turns when performance tuning was done (for event checks)
  
  // Tutorial and story
  showTutorial: boolean;
  showStoryIntro: boolean;
  tutorialStep: number;
  
  // Undo support - per-turn action snapshots
  undoStack: UndoSnapshot[];
  
  // Lose reason (if applicable)
  loseReason: string | null;
}

// Default win conditions
export const WIN_CONDITIONS: WinConditions = {
  adoption: 75,
  trust: 75,
  governanceCoverage: 70,
  reliability: 70,
  maxLatency: 1200,
  maxCostPerTurn: 120,
};

// Lose thresholds
export const LOSE_THRESHOLDS = {
  trust: 15,
  reliability: 15,
  politicalCapital: 10,
};

// Capability info for display
export const CAPABILITY_INFO: Record<CapabilityType, { name: string; icon: string; description: string; validNodes: NodeCategory[] }> = {
  'simba-connectors': {
    name: 'Simba Connectors',
    icon: 'plug',
    description: 'ODBC/JDBC drivers for connectivity. Improves performance, but increases governance risk if auth is weak.',
    validNodes: ['application', 'data-platform'],
  },
  'logi-vdd': {
    name: 'Logi Symphony VDD',
    icon: 'search',
    description: 'Self-service data discovery. Boosts adoption quickly, but may reduce trust if governance is low.',
    validNodes: ['business-unit'],
  },
  'managed-dashboards': {
    name: 'Managed Dashboards',
    icon: 'layout-dashboard',
    description: 'Governed dashboards. Increases trust and reliability, moderates adoption growth.',
    validNodes: ['business-unit'],
  },
};
