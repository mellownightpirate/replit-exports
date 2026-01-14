/**
 * Simulation engine for Insight Empire
 * Handles action effects, turn resolution, and win/lose conditions
 */

import type { 
  GameState, 
  ActionType, 
  GlobalMetrics, 
  GameNode, 
  Deployment,
  CapabilityType,
  TimelineEntry,
} from './gameTypes';
import { WIN_CONDITIONS, LOSE_THRESHOLDS } from './gameTypes';

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Apply an action to the game state
export function applyAction(
  state: GameState, 
  actionType: ActionType, 
  targetNodeId?: string
): Partial<GameState> {
  const updates: Partial<GameState> = {};
  const metrics = { ...state.metrics };
  let nodes = [...state.nodes];
  const timeline = [...state.timeline];
  const actionsThisTurn = [...state.actionsThisTurn, actionType];
  let recentTuning = [...state.recentTuning];
  let forcedAction = state.forcedAction;
  
  // Clear forced action if this is it
  if (forcedAction === actionType) {
    forcedAction = null;
  }
  
  switch (actionType) {
    case 'deploy-simba': {
      // Deploy Simba Connectors on application or data-platform node
      if (targetNodeId) {
        nodes = nodes.map(node => {
          if (node.id === targetNodeId) {
            const deployment: Deployment = {
              id: `dep-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              capability: 'simba-connectors',
              turnDeployed: state.currentTurn,
              authStrength: metrics.governanceCoverage >= 50 ? 'strong' : 'weak',
              templatesUsed: false,
            };
            return {
              ...node,
              deployments: [...node.deployments, deployment],
              latency: Math.max(200, node.latency - 200),
            };
          }
          return node;
        });
        // Effects: lower latency globally, potential governance risk
        metrics.latency = Math.max(200, metrics.latency - 150);
        if (metrics.governanceCoverage < 50) {
          metrics.supportLoad += 8;
        }
        metrics.cost += 15;
        
        const targetNode = nodes.find(n => n.id === targetNodeId);
        timeline.push({
          turn: state.currentTurn,
          type: 'action',
          title: 'Deployed Simba Connectors',
          description: `Installed ODBC/JDBC drivers on ${targetNode?.name || 'node'}`,
        });
      }
      break;
    }
    
    case 'deploy-vdd': {
      // Deploy VDD on business unit
      if (targetNodeId) {
        nodes = nodes.map(node => {
          if (node.id === targetNodeId) {
            const deployment: Deployment = {
              id: `dep-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              capability: 'logi-vdd',
              turnDeployed: state.currentTurn,
              authStrength: 'strong',
              templatesUsed: metrics.governanceCoverage >= 60,
            };
            return {
              ...node,
              deployments: [...node.deployments, deployment],
              adoption: Math.min(100, node.adoption + 15),
            };
          }
          return node;
        });
        // Effects: boost adoption, potential trust reduction
        metrics.adoption = Math.min(100, metrics.adoption + 12);
        if (metrics.governanceCoverage < 50) {
          metrics.trust = Math.max(0, metrics.trust - 5);
        }
        metrics.supportLoad += 10;
        metrics.cost += 10;
        
        const targetNode = nodes.find(n => n.id === targetNodeId);
        timeline.push({
          turn: state.currentTurn,
          type: 'action',
          title: 'Enabled VDD Pilot',
          description: `Self-service discovery on ${targetNode?.name || 'node'}`,
        });
      }
      break;
    }
    
    case 'deploy-dashboards': {
      // Deploy Managed Dashboards on business unit
      if (targetNodeId) {
        nodes = nodes.map(node => {
          if (node.id === targetNodeId) {
            const deployment: Deployment = {
              id: `dep-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              capability: 'managed-dashboards',
              turnDeployed: state.currentTurn,
              authStrength: 'strong',
              templatesUsed: true,
            };
            return {
              ...node,
              deployments: [...node.deployments, deployment],
              trust: Math.min(100, node.trust + 10),
            };
          }
          return node;
        });
        // Effects: increase trust and reliability, moderate adoption, reduce support long-term
        metrics.trust = Math.min(100, metrics.trust + 8);
        metrics.reliability = Math.min(100, metrics.reliability + 5);
        metrics.adoption = Math.min(100, metrics.adoption + 3);
        metrics.supportLoad = Math.max(0, metrics.supportLoad - 5);
        metrics.cost += 25;
        
        const targetNode = nodes.find(n => n.id === targetNodeId);
        timeline.push({
          turn: state.currentTurn,
          type: 'action',
          title: 'Published Managed Dashboards',
          description: `Governed dashboards on ${targetNode?.name || 'node'}`,
        });
      }
      break;
    }
    
    case 'run-enablement': {
      // Training and templates
      metrics.supportLoad = Math.max(0, metrics.supportLoad - 12);
      metrics.adoption = Math.min(100, metrics.adoption + 6);
      metrics.cost += 8;
      
      timeline.push({
        turn: state.currentTurn,
        type: 'action',
        title: 'Ran Enablement',
        description: 'Conducted training and deployed templates',
      });
      break;
    }
    
    case 'add-governance': {
      // Add governance policy
      metrics.governanceCoverage = Math.min(100, metrics.governanceCoverage + 10);
      metrics.trust = Math.min(100, metrics.trust + 6);
      metrics.adoption = Math.max(0, metrics.adoption - 3);
      metrics.politicalCapital = Math.max(0, metrics.politicalCapital - 5);
      
      timeline.push({
        turn: state.currentTurn,
        type: 'action',
        title: 'Added Governance Policy',
        description: 'Implemented new data governance controls',
      });
      break;
    }
    
    case 'performance-tuning': {
      // Performance optimization
      metrics.latency = Math.max(200, metrics.latency - 250);
      metrics.reliability = Math.min(100, metrics.reliability + 8);
      metrics.politicalCapital = Math.max(0, metrics.politicalCapital - 8);
      metrics.cost += 12;
      recentTuning = [...recentTuning, state.currentTurn];
      
      timeline.push({
        turn: state.currentTurn,
        type: 'action',
        title: 'Performance Tuning',
        description: 'Optimized query performance and reduced latency',
      });
      break;
    }
    
    case 'incident-response': {
      // Forced by P1 incident
      metrics.reliability = Math.min(100, metrics.reliability + 10);
      metrics.supportLoad = Math.max(0, metrics.supportLoad - 5);
      
      timeline.push({
        turn: state.currentTurn,
        type: 'action',
        title: 'Incident Response',
        description: 'Resolved critical incident and restored services',
      });
      break;
    }
  }
  
  return {
    metrics,
    nodes,
    timeline,
    actionsThisTurn,
    recentTuning,
    forcedAction,
    actionsRemaining: state.actionsRemaining - 1,
  };
}

// Calculate natural metric changes at end of turn
export function resolveTurn(state: GameState): Partial<GameState> {
  const metrics = { ...state.metrics };
  let nodes = [...state.nodes];
  
  // Calculate aggregate effects from all deployments
  let totalSimbaNodes = 0;
  let totalVddNodes = 0;
  let totalDashboardNodes = 0;
  
  nodes.forEach(node => {
    node.deployments.forEach(dep => {
      if (dep.capability === 'simba-connectors') totalSimbaNodes++;
      if (dep.capability === 'logi-vdd') totalVddNodes++;
      if (dep.capability === 'managed-dashboards') totalDashboardNodes++;
    });
  });
  
  // Natural metric drift based on deployments
  
  // Adoption: grows slowly with VDD, moderately with dashboards
  const adoptionGrowth = totalVddNodes * 2 + totalDashboardNodes * 1;
  metrics.adoption = clamp(metrics.adoption + adoptionGrowth, 0, 100);
  
  // Trust: grows with dashboards, decays slightly without governance
  const trustChange = totalDashboardNodes * 1.5 - (metrics.governanceCoverage < 50 ? 2 : 0);
  metrics.trust = clamp(metrics.trust + trustChange, 0, 100);
  
  // Support load: increases with VDD (if templates not used), decreases with dashboards
  const supportChange = totalVddNodes * 2 - totalDashboardNodes * 3;
  metrics.supportLoad = clamp(metrics.supportLoad + supportChange, 0, 100);
  
  // Latency: slight drift upward, countered by Simba connectors
  const latencyDrift = 50 - totalSimbaNodes * 30;
  metrics.latency = clamp(metrics.latency + latencyDrift, 200, 3000);
  
  // Reliability: slight decay unless maintained
  const reliabilityChange = totalDashboardNodes * 2 - 1;
  metrics.reliability = clamp(metrics.reliability + reliabilityChange, 0, 100);
  
  // Cost: base cost from all nodes plus deployment maintenance
  const deploymentCost = totalSimbaNodes * 3 + totalVddNodes * 2 + totalDashboardNodes * 4;
  const baseCost = nodes.reduce((sum, n) => sum + n.cost / 10, 0);
  metrics.cost = Math.round(baseCost + deploymentCost + 60);
  
  // Political capital: slowly regenerates
  metrics.politicalCapital = clamp(metrics.politicalCapital + 3, 0, 100);
  
  // Unblock nodes (veto only lasts one turn)
  nodes = nodes.map(n => ({ ...n, blocked: false }));
  
  // Update node metrics based on deployments
  nodes = nodes.map(node => {
    let { adoption, trust, latency } = node;
    
    node.deployments.forEach(dep => {
      if (dep.capability === 'logi-vdd') {
        adoption = clamp(adoption + 2, 0, 100);
      }
      if (dep.capability === 'managed-dashboards') {
        trust = clamp(trust + 1, 0, 100);
        adoption = clamp(adoption + 0.5, 0, 100);
      }
      if (dep.capability === 'simba-connectors') {
        latency = clamp(latency - 20, 200, 3000);
      }
    });
    
    return { ...node, adoption, trust, latency };
  });
  
  return {
    metrics,
    nodes,
    currentTurn: state.currentTurn + 1,
    actionsRemaining: state.actionsPerTurn,
    actionsThisTurn: [],
  };
}

// Check for win condition
export function checkWin(state: GameState): boolean {
  const { metrics, currentTurn, maxTurns } = state;
  
  if (currentTurn < maxTurns) {
    return false; // Can only win at end of game
  }
  
  return (
    metrics.adoption >= WIN_CONDITIONS.adoption &&
    metrics.trust >= WIN_CONDITIONS.trust &&
    metrics.governanceCoverage >= WIN_CONDITIONS.governanceCoverage &&
    metrics.reliability >= WIN_CONDITIONS.reliability &&
    metrics.latency <= WIN_CONDITIONS.maxLatency &&
    metrics.cost <= WIN_CONDITIONS.maxCostPerTurn
  );
}

// Check for lose condition
export function checkLose(state: GameState): string | null {
  const { metrics, currentTurn, maxTurns } = state;
  
  if (metrics.trust <= LOSE_THRESHOLDS.trust) {
    return 'Trust collapsed. Stakeholders have lost faith in your analytics platform.';
  }
  
  if (metrics.reliability <= LOSE_THRESHOLDS.reliability) {
    return 'Reliability crisis. Constant incidents have made the platform unusable.';
  }
  
  if (metrics.politicalCapital <= LOSE_THRESHOLDS.politicalCapital) {
    return 'Political defeat. You no longer have the support to continue.';
  }
  
  // Check if game is over and win conditions not met
  if (currentTurn >= maxTurns) {
    const failedConditions: string[] = [];
    
    if (metrics.adoption < WIN_CONDITIONS.adoption) {
      failedConditions.push(`Adoption (${Math.round(metrics.adoption)}% < ${WIN_CONDITIONS.adoption}%)`);
    }
    if (metrics.trust < WIN_CONDITIONS.trust) {
      failedConditions.push(`Trust (${Math.round(metrics.trust)}% < ${WIN_CONDITIONS.trust}%)`);
    }
    if (metrics.governanceCoverage < WIN_CONDITIONS.governanceCoverage) {
      failedConditions.push(`Governance (${Math.round(metrics.governanceCoverage)}% < ${WIN_CONDITIONS.governanceCoverage}%)`);
    }
    if (metrics.reliability < WIN_CONDITIONS.reliability) {
      failedConditions.push(`Reliability (${Math.round(metrics.reliability)}% < ${WIN_CONDITIONS.reliability}%)`);
    }
    if (metrics.latency > WIN_CONDITIONS.maxLatency) {
      failedConditions.push(`Latency (${Math.round(metrics.latency)}ms > ${WIN_CONDITIONS.maxLatency}ms)`);
    }
    if (metrics.cost > WIN_CONDITIONS.maxCostPerTurn) {
      failedConditions.push(`Cost (£${Math.round(metrics.cost)} > £${WIN_CONDITIONS.maxCostPerTurn})`);
    }
    
    if (failedConditions.length > 0) {
      return `Failed to meet objectives: ${failedConditions.join(', ')}`;
    }
  }
  
  return null;
}

// Get available actions for the current state
export function getAvailableActions(state: GameState, nodeId?: string): ActionType[] {
  const actions: ActionType[] = [];
  const node = nodeId ? state.nodes.find(n => n.id === nodeId) : null;
  
  // If there's a forced action, only that action is available
  if (state.forcedAction) {
    return [state.forcedAction];
  }
  
  // Check if node is blocked
  if (node?.blocked) {
    return ['run-enablement', 'add-governance', 'performance-tuning'];
  }
  
  // Node-specific deployment actions
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
  actions.push('run-enablement', 'add-governance', 'performance-tuning');
  
  return actions;
}

// Get action description
export function getActionDescription(actionType: ActionType): { name: string; description: string; effects: string } {
  switch (actionType) {
    case 'deploy-simba':
      return {
        name: 'Deploy Simba Connectors',
        description: 'Install ODBC/JDBC drivers for improved connectivity',
        effects: 'Latency -150ms, Cost +15. If governance <50: Support +8',
      };
    case 'deploy-vdd':
      return {
        name: 'Enable VDD Pilot',
        description: 'Self-service data discovery for business users',
        effects: 'Adoption +12, Support +10. If governance <50: Trust -5',
      };
    case 'deploy-dashboards':
      return {
        name: 'Publish Managed Dashboards',
        description: 'Deploy governed, curated dashboards',
        effects: 'Trust +8, Reliability +5, Adoption +3, Support -5, Cost +25',
      };
    case 'run-enablement':
      return {
        name: 'Run Enablement',
        description: 'Training sessions and template deployment',
        effects: 'Support -12, Adoption +6, Cost +8',
      };
    case 'add-governance':
      return {
        name: 'Add Governance Policy',
        description: 'Implement new data governance controls',
        effects: 'Governance +10, Trust +6, Adoption -3, Political -5',
      };
    case 'performance-tuning':
      return {
        name: 'Performance Tuning',
        description: 'Optimize queries and reduce latency',
        effects: 'Latency -250ms, Reliability +8, Political -8, Cost +12',
      };
    case 'incident-response':
      return {
        name: 'Incident Response',
        description: 'Address the critical P1 incident',
        effects: 'Reliability +10, Support -5 (Required)',
      };
  }
}
