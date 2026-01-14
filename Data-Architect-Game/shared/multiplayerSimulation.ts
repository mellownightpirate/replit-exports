/**
 * Data Architect - Multiplayer Simulation Engine
 * Server-side deterministic game logic for 2-player asymmetric gameplay
 */

import {
  MultiplayerGameState,
  MultiplayerMetrics,
  ArchitectMetrics,
  ProspectMetrics,
  PlannedAction,
  ActionResult,
  TurnResolutionResult,
  ArchitectActionType,
  ProspectActionType,
  GameNode,
  GameEdge,
  Deployment,
  ActiveConstraint,
  TimelineEntry,
  MULTIPLAYER_WIN_CONDITIONS,
  DEFAULT_ARCHITECT_METRICS,
  DEFAULT_PROSPECT_METRICS,
  TurnPhase,
} from './multiplayerTypes';

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Seeded random number generator for deterministic simulation
function seededRandom(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Initialize a new multiplayer game state
 */
export function initializeMultiplayerGame(
  scenarioId: string,
  seed: number = Date.now()
): MultiplayerGameState {
  const random = seededRandom(seed);
  
  // Generate nodes based on scenario
  const { nodes, edges } = generateMap(scenarioId, random);
  
  // Get initial metrics based on scenario
  const metrics = getInitialMetrics(scenarioId);
  
  return {
    scenarioId,
    seed,
    currentTurn: 1,
    maxTurns: 12,
    phase: 'PLANNING',
    nodes,
    edges,
    metrics,
    activeConstraints: [],
    currentEvent: null,
    eventHistory: [],
    timeline: [],
    winConditions: { ...MULTIPLAYER_WIN_CONDITIONS },
    winner: null,
    gameOver: false,
    endReason: null,
  };
}

/**
 * Generate the game map based on scenario
 */
function generateMap(
  scenarioId: string,
  random: () => number
): { nodes: GameNode[]; edges: GameEdge[] } {
  const nodes: GameNode[] = [];
  const edges: GameEdge[] = [];
  
  // Business Units
  const businessUnits = ['Finance', 'Operations', 'Product', 'Sales', 'Marketing'];
  const applications = ['ERP', 'CRM', 'Support'];
  const dataPlatforms = ['Data Warehouse', 'Data Lake', 'Query Engine'];
  const domains = ['Orders', 'Customers', 'Revenue', 'Tickets'];
  
  let id = 0;
  const centerX = 400;
  const centerY = 300;
  const radius = 200;
  
  // Add business units in a circle on the left
  businessUnits.forEach((name, i) => {
    const angle = (i / businessUnits.length) * Math.PI - Math.PI / 2;
    nodes.push({
      id: `node-${id++}`,
      name,
      category: 'business-unit',
      x: centerX - radius + Math.cos(angle) * (radius * 0.6),
      y: centerY + Math.sin(angle) * (radius * 0.8),
      adoption: 20 + random() * 30,
      trust: 40 + random() * 20,
      latency: 800 + random() * 600,
      cost: 10 + random() * 20,
      deployments: [],
      blocked: false,
    });
  });
  
  // Add applications
  applications.forEach((name, i) => {
    nodes.push({
      id: `node-${id++}`,
      name,
      category: 'application',
      x: centerX + radius * 0.3,
      y: centerY - radius * 0.4 + i * (radius * 0.4),
      adoption: 30 + random() * 20,
      trust: 50 + random() * 20,
      latency: 600 + random() * 400,
      cost: 15 + random() * 15,
      deployments: [],
      blocked: false,
    });
  });
  
  // Add data platforms
  dataPlatforms.forEach((name, i) => {
    nodes.push({
      id: `node-${id++}`,
      name,
      category: 'data-platform',
      x: centerX + radius * 0.8,
      y: centerY - radius * 0.3 + i * (radius * 0.3),
      adoption: 25 + random() * 25,
      trust: 45 + random() * 25,
      latency: 500 + random() * 500,
      cost: 20 + random() * 25,
      deployments: [],
      blocked: false,
    });
  });
  
  // Add domains
  domains.forEach((name, i) => {
    nodes.push({
      id: `node-${id++}`,
      name,
      category: 'domain',
      x: centerX,
      y: centerY - radius * 0.5 + i * (radius * 0.33),
      adoption: 30 + random() * 20,
      trust: 50 + random() * 20,
      latency: 400 + random() * 300,
      cost: 5 + random() * 10,
      deployments: [],
      blocked: false,
    });
  });
  
  // Create edges connecting related nodes
  nodes.forEach((node, i) => {
    // Connect business units to domains
    if (node.category === 'business-unit') {
      const domainNodes = nodes.filter(n => n.category === 'domain');
      domainNodes.slice(0, 2).forEach(domain => {
        edges.push({
          id: `edge-${edges.length}`,
          source: node.id,
          target: domain.id,
          strength: random() > 0.5 ? 'strong' : 'weak',
        });
      });
    }
    // Connect applications to data platforms
    if (node.category === 'application') {
      const platforms = nodes.filter(n => n.category === 'data-platform');
      platforms.forEach(platform => {
        if (random() > 0.3) {
          edges.push({
            id: `edge-${edges.length}`,
            source: node.id,
            target: platform.id,
            strength: random() > 0.5 ? 'strong' : 'weak',
          });
        }
      });
    }
    // Connect domains to applications
    if (node.category === 'domain') {
      const apps = nodes.filter(n => n.category === 'application');
      apps.slice(0, 2).forEach(app => {
        if (random() > 0.4) {
          edges.push({
            id: `edge-${edges.length}`,
            source: node.id,
            target: app.id,
            strength: 'weak',
          });
        }
      });
    }
  });
  
  return { nodes, edges };
}

/**
 * Get initial metrics based on scenario
 */
function getInitialMetrics(scenarioId: string): MultiplayerMetrics {
  const baseArchitect = { ...DEFAULT_ARCHITECT_METRICS };
  const baseProspect = { ...DEFAULT_PROSPECT_METRICS };
  
  switch (scenarioId) {
    case 'speed-to-value':
      // High pressure for quick results
      return {
        architect: { ...baseArchitect, adoption: 20, politicalCapital: 60 },
        prospect: { ...baseProspect, patience: 50, businessValue: 20 },
      };
    case 'governance-first':
      // Strong governance requirements
      return {
        architect: { ...baseArchitect, governanceCoverage: 60, trust: 40 },
        prospect: { ...baseProspect, risk: 70, patience: 80 },
      };
    case 'scale-out':
      // Enterprise scale challenges
      return {
        architect: { ...baseArchitect, adoption: 40, reliability: 50 },
        prospect: { ...baseProspect, businessValue: 40, patience: 60 },
      };
    default:
      return { architect: baseArchitect, prospect: baseProspect };
  }
}

/**
 * Resolve a turn by applying all planned actions from both players
 */
export function resolveTurn(
  state: MultiplayerGameState,
  architectActions: PlannedAction[],
  prospectActions: PlannedAction[]
): TurnResolutionResult {
  const previousState = JSON.parse(JSON.stringify(state));
  let newState = JSON.parse(JSON.stringify(state)) as MultiplayerGameState;
  const actionResults: ActionResult[] = [];
  
  // First, process Prospect actions (they can block/constrain Architect)
  for (const action of prospectActions) {
    const result = applyProspectAction(newState, action);
    actionResults.push(result);
    if (result.success) {
      newState = applyActionEffects(newState, result);
    }
  }
  
  // Then, process Architect actions (may be blocked by constraints)
  for (const action of architectActions) {
    const result = applyArchitectAction(newState, action);
    actionResults.push(result);
    if (result.success) {
      newState = applyActionEffects(newState, result);
    }
  }
  
  // Natural metric drift and constraint expiry
  newState = resolveEndOfTurn(newState);
  
  // Check win/lose conditions
  newState = checkGameEnd(newState);
  
  // Build turn summary
  const turnSummary = buildTurnSummary(actionResults, architectActions, prospectActions);
  
  return {
    previousState,
    newState,
    architectActions,
    prospectActions,
    actionResults,
    turnSummary,
  };
}

/**
 * Apply a Prospect action
 */
function applyProspectAction(
  state: MultiplayerGameState,
  action: PlannedAction
): ActionResult {
  const actionType = action.actionType as ProspectActionType;
  const effects: string[] = [];
  const metricsChange: ActionResult['metricsChange'] = {
    architect: {},
    prospect: {},
  };
  
  switch (actionType) {
    case 'impose-constraint': {
      // Block a specific capability type for next turn
      const constraint: ActiveConstraint = {
        id: `constraint-${Date.now()}`,
        type: 'capability-block',
        turnImposed: state.currentTurn,
        duration: 2,
        targetCapability: action.parameters?.capability,
      };
      state.activeConstraints.push(constraint);
      effects.push(`Blocked ${action.parameters?.capability} deployments for 2 turns`);
      metricsChange.prospect.risk = -5;
      metricsChange.architect.politicalCapital = -10;
      break;
    }
    
    case 'demand-poc': {
      // Require proof-of-concept
      const constraint: ActiveConstraint = {
        id: `constraint-${Date.now()}`,
        type: 'poc-required',
        turnImposed: state.currentTurn,
        duration: 3,
        requirement: state.metrics.architect.adoption + 10,
      };
      state.activeConstraints.push(constraint);
      effects.push('Demanded proof-of-concept: adoption must increase by 10%');
      metricsChange.prospect.patience = -10;
      break;
    }
    
    case 'request-security-review': {
      // Increase governance requirement
      state.winConditions.architect.governanceCoverage = Math.min(100, 
        state.winConditions.architect.governanceCoverage + 10);
      effects.push('Increased governance requirement by 10%');
      metricsChange.prospect.risk = -10;
      metricsChange.architect.politicalCapital = -5;
      break;
    }
    
    case 'threaten-alternative': {
      // Decrease patience if objectives not met
      effects.push('Threatened to evaluate alternative solutions');
      metricsChange.prospect.patience = -15;
      metricsChange.architect.politicalCapital = -15;
      break;
    }
    
    case 'approve-budget': {
      // Increase cost allowance
      state.winConditions.architect.maxCostPerTurn += 20;
      effects.push('Approved additional budget: cost limit +20');
      metricsChange.prospect.businessValue = -5; // Spending more
      metricsChange.architect.politicalCapital = 10;
      break;
    }
    
    case 'set-deadline': {
      // Reduce remaining turns
      state.maxTurns = Math.max(state.currentTurn + 2, state.maxTurns - 2);
      effects.push(`Set tighter deadline: ${state.maxTurns - state.currentTurn} turns remaining`);
      metricsChange.prospect.patience = -5;
      break;
    }
    
    case 'share-requirements': {
      // Reveals hidden objectives (goodwill)
      effects.push('Shared detailed requirements with Architect');
      metricsChange.prospect.businessValue = 5;
      metricsChange.architect.politicalCapital = 10;
      break;
    }
    
    case 'acknowledge-progress': {
      // Shows good faith
      effects.push('Acknowledged progress made so far');
      metricsChange.prospect.patience = 10;
      metricsChange.prospect.businessValue = 5;
      metricsChange.architect.trust = 5;
      break;
    }
  }
  
  // Add to timeline
  state.timeline.push({
    turn: state.currentTurn,
    type: 'action',
    title: getProspectActionName(actionType),
    description: effects.join('. '),
    role: 'PROSPECT',
  });
  
  return {
    actionId: action.id,
    success: true,
    blocked: false,
    effects,
    metricsChange,
  };
}

/**
 * Apply an Architect action
 */
function applyArchitectAction(
  state: MultiplayerGameState,
  action: PlannedAction
): ActionResult {
  const actionType = action.actionType as ArchitectActionType;
  const effects: string[] = [];
  const metricsChange: ActionResult['metricsChange'] = {
    architect: {},
    prospect: {},
  };
  
  // Check if action is blocked by constraints
  const blockingConstraint = checkConstraintBlock(state, action);
  if (blockingConstraint) {
    return {
      actionId: action.id,
      success: false,
      blocked: true,
      blockReason: `Blocked by ${blockingConstraint.type}`,
      effects: [],
      metricsChange,
    };
  }
  
  switch (actionType) {
    case 'deploy-simba': {
      if (action.targetNodeId) {
        const node = state.nodes.find(n => n.id === action.targetNodeId);
        if (node && (node.category === 'application' || node.category === 'data-platform')) {
          const deployment: Deployment = {
            id: `dep-${Date.now()}`,
            capability: 'simba-connectors',
            turnDeployed: state.currentTurn,
            authStrength: state.metrics.architect.governanceCoverage >= 50 ? 'strong' : 'weak',
            templatesUsed: false,
          };
          node.deployments.push(deployment);
          node.latency = Math.max(200, node.latency - 200);
          effects.push(`Deployed Simba Connectors on ${node.name}`);
          metricsChange.architect.latency = -150;
          metricsChange.architect.cost = 15;
          metricsChange.prospect.businessValue = 5;
          
          if (state.metrics.architect.governanceCoverage < 50) {
            metricsChange.architect.supportLoad = 8;
            metricsChange.prospect.risk = 5;
          }
        }
      }
      break;
    }
    
    case 'deploy-vdd': {
      if (action.targetNodeId) {
        const node = state.nodes.find(n => n.id === action.targetNodeId);
        if (node && node.category === 'business-unit') {
          const deployment: Deployment = {
            id: `dep-${Date.now()}`,
            capability: 'logi-vdd',
            turnDeployed: state.currentTurn,
            authStrength: 'strong',
            templatesUsed: state.metrics.architect.governanceCoverage >= 60,
          };
          node.deployments.push(deployment);
          node.adoption = Math.min(100, node.adoption + 15);
          effects.push(`Enabled VDD Pilot on ${node.name}`);
          metricsChange.architect.adoption = 12;
          metricsChange.architect.supportLoad = 10;
          metricsChange.architect.cost = 10;
          metricsChange.prospect.businessValue = 8;
          
          if (state.metrics.architect.governanceCoverage < 50) {
            metricsChange.architect.trust = -5;
            metricsChange.prospect.risk = 10;
          }
        }
      }
      break;
    }
    
    case 'deploy-dashboards': {
      if (action.targetNodeId) {
        const node = state.nodes.find(n => n.id === action.targetNodeId);
        if (node && node.category === 'business-unit') {
          const deployment: Deployment = {
            id: `dep-${Date.now()}`,
            capability: 'managed-dashboards',
            turnDeployed: state.currentTurn,
            authStrength: 'strong',
            templatesUsed: true,
          };
          node.deployments.push(deployment);
          node.trust = Math.min(100, node.trust + 10);
          effects.push(`Published Managed Dashboards on ${node.name}`);
          metricsChange.architect.trust = 8;
          metricsChange.architect.reliability = 5;
          metricsChange.architect.adoption = 3;
          metricsChange.architect.supportLoad = -5;
          metricsChange.architect.cost = 25;
          metricsChange.prospect.businessValue = 10;
          metricsChange.prospect.risk = -5;
        }
      }
      break;
    }
    
    case 'run-enablement': {
      effects.push('Conducted training and deployed templates');
      metricsChange.architect.supportLoad = -12;
      metricsChange.architect.adoption = 6;
      metricsChange.architect.cost = 8;
      metricsChange.prospect.patience = 3;
      break;
    }
    
    case 'add-governance': {
      effects.push('Implemented new data governance controls');
      metricsChange.architect.governanceCoverage = 10;
      metricsChange.architect.trust = 6;
      metricsChange.architect.adoption = -3;
      metricsChange.architect.politicalCapital = -5;
      metricsChange.prospect.risk = -10;
      break;
    }
    
    case 'performance-tuning': {
      effects.push('Optimized query performance and reduced latency');
      metricsChange.architect.latency = -250;
      metricsChange.architect.reliability = 8;
      metricsChange.architect.politicalCapital = -8;
      metricsChange.architect.cost = 12;
      metricsChange.prospect.businessValue = 3;
      break;
    }
    
    case 'incident-response': {
      effects.push('Resolved critical incident and restored services');
      metricsChange.architect.reliability = 10;
      metricsChange.architect.supportLoad = -5;
      metricsChange.prospect.risk = -5;
      metricsChange.prospect.patience = -5;
      break;
    }
    
    case 'present-roadmap': {
      effects.push('Presented strategic roadmap to stakeholders');
      metricsChange.architect.politicalCapital = -10;
      metricsChange.prospect.patience = 15;
      metricsChange.prospect.businessValue = 5;
      break;
    }
    
    case 'executive-escalation': {
      // Remove one constraint
      if (state.activeConstraints.length > 0) {
        const removed = state.activeConstraints.shift();
        effects.push(`Escalated to remove constraint: ${removed?.type}`);
      }
      metricsChange.architect.politicalCapital = -20;
      metricsChange.prospect.patience = -10;
      break;
    }
  }
  
  // Add to timeline
  state.timeline.push({
    turn: state.currentTurn,
    type: 'action',
    title: getArchitectActionName(actionType),
    description: effects.join('. '),
    role: 'ARCHITECT',
  });
  
  return {
    actionId: action.id,
    success: true,
    blocked: false,
    effects,
    metricsChange,
  };
}

/**
 * Check if an action is blocked by active constraints
 */
function checkConstraintBlock(
  state: MultiplayerGameState,
  action: PlannedAction
): ActiveConstraint | null {
  const actionType = action.actionType as ArchitectActionType;
  
  for (const constraint of state.activeConstraints) {
    if (constraint.type === 'capability-block') {
      // Check if this deployment uses the blocked capability
      if (actionType === 'deploy-simba' && constraint.targetCapability === 'simba-connectors') {
        return constraint;
      }
      if (actionType === 'deploy-vdd' && constraint.targetCapability === 'logi-vdd') {
        return constraint;
      }
      if (actionType === 'deploy-dashboards' && constraint.targetCapability === 'managed-dashboards') {
        return constraint;
      }
    }
  }
  
  return null;
}

/**
 * Apply metric changes from action result
 */
function applyActionEffects(
  state: MultiplayerGameState,
  result: ActionResult
): MultiplayerGameState {
  const { architect, prospect } = result.metricsChange;
  
  // Apply architect metrics changes
  Object.entries(architect).forEach(([key, value]) => {
    const k = key as keyof ArchitectMetrics;
    if (k === 'latency') {
      state.metrics.architect[k] = clamp(state.metrics.architect[k] + (value || 0), 200, 3000);
    } else if (k === 'cost') {
      state.metrics.architect[k] += value || 0;
    } else {
      state.metrics.architect[k] = clamp(state.metrics.architect[k] + (value || 0), 0, 100);
    }
  });
  
  // Apply prospect metrics changes
  Object.entries(prospect).forEach(([key, value]) => {
    const k = key as keyof ProspectMetrics;
    state.metrics.prospect[k] = clamp(state.metrics.prospect[k] + (value || 0), 0, 100);
  });
  
  return state;
}

/**
 * Resolve end of turn: natural drift, constraint expiry
 */
function resolveEndOfTurn(state: MultiplayerGameState): MultiplayerGameState {
  // Count deployments
  let totalSimbaNodes = 0;
  let totalVddNodes = 0;
  let totalDashboardNodes = 0;
  
  state.nodes.forEach(node => {
    node.deployments.forEach(dep => {
      if (dep.capability === 'simba-connectors') totalSimbaNodes++;
      if (dep.capability === 'logi-vdd') totalVddNodes++;
      if (dep.capability === 'managed-dashboards') totalDashboardNodes++;
    });
  });
  
  // Natural architect metric drift
  const adoptionGrowth = totalVddNodes * 2 + totalDashboardNodes * 1;
  state.metrics.architect.adoption = clamp(state.metrics.architect.adoption + adoptionGrowth, 0, 100);
  
  const trustChange = totalDashboardNodes * 1.5 - (state.metrics.architect.governanceCoverage < 50 ? 2 : 0);
  state.metrics.architect.trust = clamp(state.metrics.architect.trust + trustChange, 0, 100);
  
  const latencyDrift = 50 - totalSimbaNodes * 30;
  state.metrics.architect.latency = clamp(state.metrics.architect.latency + latencyDrift, 200, 3000);
  
  const reliabilityChange = totalDashboardNodes * 2 - 1;
  state.metrics.architect.reliability = clamp(state.metrics.architect.reliability + reliabilityChange, 0, 100);
  
  // Political capital slowly regenerates
  state.metrics.architect.politicalCapital = clamp(state.metrics.architect.politicalCapital + 3, 0, 100);
  
  // Natural prospect metric drift
  // Patience decays slightly each turn
  state.metrics.prospect.patience = clamp(state.metrics.prospect.patience - 2, 0, 100);
  
  // Business value grows slowly if adoption increases
  if (state.metrics.architect.adoption > 50) {
    state.metrics.prospect.businessValue = clamp(state.metrics.prospect.businessValue + 2, 0, 100);
  }
  
  // Risk decreases with governance
  if (state.metrics.architect.governanceCoverage > 60) {
    state.metrics.prospect.risk = clamp(state.metrics.prospect.risk - 2, 0, 100);
  }
  
  // Expire constraints
  state.activeConstraints = state.activeConstraints.filter(c => {
    return state.currentTurn - c.turnImposed < c.duration;
  });
  
  // Unblock nodes
  state.nodes = state.nodes.map(n => ({ ...n, blocked: false }));
  
  // Advance turn
  state.currentTurn += 1;
  state.phase = 'PLANNING';
  
  return state;
}

/**
 * Check win/lose conditions
 */
function checkGameEnd(state: MultiplayerGameState): MultiplayerGameState {
  const { architect } = state.metrics;
  const { prospect } = state.metrics;
  const { winConditions } = state;
  
  // Immediate lose: patience exhausted
  if (prospect.patience <= winConditions.prospect.minPatience) {
    state.gameOver = true;
    state.winner = 'PROSPECT';
    state.endReason = 'Prospect ran out of patience and terminated the evaluation.';
    return state;
  }
  
  // Immediate lose: trust collapsed
  if (architect.trust <= 15) {
    state.gameOver = true;
    state.winner = 'PROSPECT';
    state.endReason = 'Trust collapsed. Stakeholders have lost faith in the platform.';
    return state;
  }
  
  // Immediate lose: reliability crisis
  if (architect.reliability <= 15) {
    state.gameOver = true;
    state.winner = 'PROSPECT';
    state.endReason = 'Reliability crisis. Constant incidents made the platform unusable.';
    return state;
  }
  
  // Check if game is over (max turns reached)
  if (state.currentTurn > state.maxTurns) {
    // Check if Architect met all win conditions
    const architectWon = (
      architect.adoption >= winConditions.architect.adoption &&
      architect.trust >= winConditions.architect.trust &&
      architect.governanceCoverage >= winConditions.architect.governanceCoverage &&
      architect.reliability >= winConditions.architect.reliability &&
      architect.latency <= winConditions.architect.maxLatency &&
      architect.cost <= winConditions.architect.maxCostPerTurn
    );
    
    // Check if Prospect conditions met (enough business value, low enough risk)
    const prospectSatisfied = (
      prospect.businessValue >= winConditions.prospect.businessValue &&
      prospect.risk <= winConditions.prospect.maxRisk
    );
    
    if (architectWon && prospectSatisfied) {
      state.gameOver = true;
      state.winner = 'ARCHITECT';
      state.endReason = 'Successfully delivered the analytics platform. Both parties satisfied!';
    } else if (!architectWon && !prospectSatisfied) {
      state.gameOver = true;
      state.winner = null; // Draw
      state.endReason = 'Neither party achieved their objectives. The evaluation ends inconclusively.';
    } else if (!architectWon) {
      state.gameOver = true;
      state.winner = 'PROSPECT';
      state.endReason = buildFailureReason(architect, winConditions.architect);
    } else {
      state.gameOver = true;
      state.winner = 'PROSPECT';
      state.endReason = 'Prospect requirements not met despite technical success.';
    }
  }
  
  return state;
}

function buildFailureReason(
  metrics: ArchitectMetrics,
  conditions: typeof MULTIPLAYER_WIN_CONDITIONS.architect
): string {
  const failures: string[] = [];
  if (metrics.adoption < conditions.adoption) failures.push('Adoption');
  if (metrics.trust < conditions.trust) failures.push('Trust');
  if (metrics.governanceCoverage < conditions.governanceCoverage) failures.push('Governance');
  if (metrics.reliability < conditions.reliability) failures.push('Reliability');
  if (metrics.latency > conditions.maxLatency) failures.push('Latency');
  if (metrics.cost > conditions.maxCostPerTurn) failures.push('Cost');
  return `Failed to meet: ${failures.join(', ')}`;
}

/**
 * Build a human-readable turn summary
 */
function buildTurnSummary(
  results: ActionResult[],
  architectActions: PlannedAction[],
  prospectActions: PlannedAction[]
): string {
  const parts: string[] = [];
  
  if (prospectActions.length > 0) {
    const pEffects = results
      .filter(r => prospectActions.some(a => a.id === r.actionId))
      .flatMap(r => r.effects);
    if (pEffects.length > 0) {
      parts.push(`Prospect: ${pEffects.join('. ')}`);
    }
  }
  
  if (architectActions.length > 0) {
    const aEffects = results
      .filter(r => architectActions.some(a => a.id === r.actionId))
      .flatMap(r => r.effects);
    const blocked = results.filter(r => r.blocked).length;
    if (aEffects.length > 0) {
      parts.push(`Architect: ${aEffects.join('. ')}`);
    }
    if (blocked > 0) {
      parts.push(`${blocked} action(s) were blocked by constraints.`);
    }
  }
  
  return parts.join(' | ');
}

/**
 * Get human-readable action names
 */
function getArchitectActionName(action: ArchitectActionType): string {
  const names: Record<ArchitectActionType, string> = {
    'deploy-simba': 'Deploy Simba Connectors',
    'deploy-vdd': 'Enable VDD Pilot',
    'deploy-dashboards': 'Publish Managed Dashboards',
    'run-enablement': 'Run Enablement',
    'add-governance': 'Add Governance Policy',
    'performance-tuning': 'Performance Tuning',
    'incident-response': 'Incident Response',
    'present-roadmap': 'Present Roadmap',
    'executive-escalation': 'Executive Escalation',
  };
  return names[action] || action;
}

function getProspectActionName(action: ProspectActionType): string {
  const names: Record<ProspectActionType, string> = {
    'impose-constraint': 'Impose Constraint',
    'demand-poc': 'Demand Proof-of-Concept',
    'request-security-review': 'Request Security Review',
    'threaten-alternative': 'Threaten Alternative',
    'approve-budget': 'Approve Budget',
    'set-deadline': 'Set Deadline',
    'share-requirements': 'Share Requirements',
    'acknowledge-progress': 'Acknowledge Progress',
  };
  return names[action] || action;
}

/**
 * Get available actions for a role
 */
export function getAvailableActions(
  state: MultiplayerGameState,
  role: 'ARCHITECT' | 'PROSPECT',
  nodeId?: string
): (ArchitectActionType | ProspectActionType)[] {
  if (role === 'PROSPECT') {
    return [
      'impose-constraint',
      'demand-poc',
      'request-security-review',
      'threaten-alternative',
      'approve-budget',
      'set-deadline',
      'share-requirements',
      'acknowledge-progress',
    ];
  }
  
  // Architect actions
  const actions: ArchitectActionType[] = [];
  const node = nodeId ? state.nodes.find(n => n.id === nodeId) : null;
  
  if (node) {
    const hasSimba = node.deployments.some(d => d.capability === 'simba-connectors');
    const hasVdd = node.deployments.some(d => d.capability === 'logi-vdd');
    const hasDashboards = node.deployments.some(d => d.capability === 'managed-dashboards');
    
    if ((node.category === 'application' || node.category === 'data-platform') && !hasSimba) {
      actions.push('deploy-simba');
    }
    if (node.category === 'business-unit' && !hasVdd) {
      actions.push('deploy-vdd');
    }
    if (node.category === 'business-unit' && !hasDashboards) {
      actions.push('deploy-dashboards');
    }
  }
  
  // Global actions always available
  actions.push(
    'run-enablement',
    'add-governance',
    'performance-tuning',
    'present-roadmap'
  );
  
  // Executive escalation only if there are constraints
  if (state.activeConstraints.length > 0 && state.metrics.architect.politicalCapital >= 20) {
    actions.push('executive-escalation');
  }
  
  return actions;
}
