/**
 * Data Architect - Multiplayer Type Definitions
 * Types for 2-player asymmetric gameplay: Architect vs Prospect
 */

// Player roles
export type PlayerRole = 'ARCHITECT' | 'PROSPECT';

// Turn phases
export type TurnPhase = 'EVENT' | 'PLANNING' | 'COMMIT' | 'RESOLVE' | 'REVIEW';

// Base metrics from single player
export interface ArchitectMetrics {
  adoption: number;      // 0-100
  trust: number;         // 0-100
  latency: number;       // ms (target lower)
  cost: number;          // £ per turn
  governanceCoverage: number; // 0-100
  reliability: number;   // 0-100
  politicalCapital: number; // 0-100
  supportLoad: number;   // tickets per turn
}

// New metrics for Prospect role
export interface ProspectMetrics {
  businessValue: number;   // 0-100 - perceived value from platform
  risk: number;            // 0-100 - perceived risk/uncertainty
  patience: number;        // 0-100 - willingness to continue eval
}

// Combined metrics for multiplayer
export interface MultiplayerMetrics {
  architect: ArchitectMetrics;
  prospect: ProspectMetrics;
}

// Architect actions (from single player, plus new)
export type ArchitectActionType = 
  | 'deploy-simba' 
  | 'deploy-vdd' 
  | 'deploy-dashboards'
  | 'run-enablement'
  | 'add-governance'
  | 'performance-tuning'
  | 'incident-response'
  | 'present-roadmap'      // NEW: increases patience, costs political capital
  | 'executive-escalation'; // NEW: override constraint, high political cost

// Prospect actions (new)
export type ProspectActionType =
  | 'impose-constraint'     // Block specific deployment type next turn
  | 'demand-poc'            // Require proof-of-concept (adoption must increase)
  | 'request-security-review' // Increases governance requirement
  | 'threaten-alternative'  // Decreases patience if objectives not met
  | 'approve-budget'        // Increases cost allowance
  | 'set-deadline'          // Reduces remaining turns
  | 'share-requirements'    // Reveals hidden objectives
  | 'acknowledge-progress'; // Increases patience, shows good faith

// Combined action type
export type MultiplayerActionType = ArchitectActionType | ProspectActionType;

// Action with target
export interface PlannedAction {
  id: string;
  playerId: string;
  role: PlayerRole;
  actionType: MultiplayerActionType;
  targetNodeId?: string;
  parameters?: Record<string, any>;
}

// Node categories (same as single player)
export type NodeCategory = 'business-unit' | 'application' | 'data-platform' | 'domain';

// Capability types
export type CapabilityType = 'simba-connectors' | 'logi-vdd' | 'managed-dashboards';

// Deployment on a node
export interface Deployment {
  id: string;
  capability: CapabilityType;
  turnDeployed: number;
  authStrength: 'weak' | 'strong';
  templatesUsed: boolean;
}

// Node on the map
export interface GameNode {
  id: string;
  name: string;
  category: NodeCategory;
  x: number;
  y: number;
  adoption: number;
  trust: number;
  latency: number;
  cost: number;
  deployments: Deployment[];
  blocked: boolean;
  constraintType?: CapabilityType; // Prospect can block specific capability
}

// Edge between nodes
export interface GameEdge {
  id: string;
  source: string;
  target: string;
  strength: 'strong' | 'weak';
}

// Constraint imposed by Prospect
export interface ActiveConstraint {
  id: string;
  type: 'capability-block' | 'poc-required' | 'security-review' | 'deadline';
  turnImposed: number;
  duration: number; // turns until expiry
  targetCapability?: CapabilityType;
  targetNodeId?: string;
  requirement?: number; // e.g., governance must reach X
}

// Timeline entry
export interface TimelineEntry {
  turn: number;
  type: 'action' | 'event' | 'milestone' | 'constraint';
  title: string;
  description: string;
  role?: PlayerRole;
}

// Event card for multiplayer
export interface MultiplayerEvent {
  id: string;
  title: string;
  description: string;
  affectsRole: PlayerRole | 'BOTH';
  choices: MultiplayerEventChoice[];
}

export interface MultiplayerEventChoice {
  id: string;
  label: string;
  description: string;
  architectEffect: Partial<ArchitectMetrics>;
  prospectEffect: Partial<ProspectMetrics>;
}

// Win/lose conditions for multiplayer
export interface MultiplayerWinConditions {
  architect: {
    adoption: number;
    trust: number;
    governanceCoverage: number;
    reliability: number;
    maxLatency: number;
    maxCostPerTurn: number;
  };
  prospect: {
    businessValue: number;
    maxRisk: number;
    minPatience: number; // Game ends if patience drops below
  };
}

// Full multiplayer game state (stored in DB as JSON)
export interface MultiplayerGameState {
  // Meta
  scenarioId: string;
  seed: number;
  
  // Turn tracking
  currentTurn: number;
  maxTurns: number;
  phase: TurnPhase;
  
  // Map
  nodes: GameNode[];
  edges: GameEdge[];
  
  // Metrics
  metrics: MultiplayerMetrics;
  
  // Constraints
  activeConstraints: ActiveConstraint[];
  
  // Events
  currentEvent: MultiplayerEvent | null;
  eventHistory: string[];
  
  // History
  timeline: TimelineEntry[];
  
  // Win conditions (may be modified by prospect)
  winConditions: MultiplayerWinConditions;
  
  // Game outcome
  winner: PlayerRole | null;
  gameOver: boolean;
  endReason: string | null;
}

// Turn result (what happened this turn)
export interface TurnResolutionResult {
  previousState: MultiplayerGameState;
  newState: MultiplayerGameState;
  architectActions: PlannedAction[];
  prospectActions: PlannedAction[];
  actionResults: ActionResult[];
  turnSummary: string;
}

// Result of applying an action
export interface ActionResult {
  actionId: string;
  success: boolean;
  blocked: boolean;
  blockReason?: string;
  effects: string[];
  metricsChange: {
    architect: Partial<ArchitectMetrics>;
    prospect: Partial<ProspectMetrics>;
  };
}

// Default win conditions
export const MULTIPLAYER_WIN_CONDITIONS: MultiplayerWinConditions = {
  architect: {
    adoption: 75,
    trust: 75,
    governanceCoverage: 70,
    reliability: 70,
    maxLatency: 1200,
    maxCostPerTurn: 120,
  },
  prospect: {
    businessValue: 70,
    maxRisk: 30,
    minPatience: 10, // Game ends if below
  },
};

// Default architect metrics
export const DEFAULT_ARCHITECT_METRICS: ArchitectMetrics = {
  adoption: 30,
  trust: 50,
  latency: 1500,
  cost: 80,
  governanceCoverage: 40,
  reliability: 60,
  politicalCapital: 50,
  supportLoad: 40,
};

// Default prospect metrics
export const DEFAULT_PROSPECT_METRICS: ProspectMetrics = {
  businessValue: 30,
  risk: 50,
  patience: 70,
};
