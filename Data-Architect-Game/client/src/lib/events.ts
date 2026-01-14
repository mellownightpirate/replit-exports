/**
 * Event cards for Insight Empire
 * 10 cards with trigger conditions and outcomes
 */

import type { EventCard, GameState } from './gameTypes';

// Check if managed dashboards are deployed anywhere
function hasManagedDashboards(state: GameState): boolean {
  return state.nodes.some(node => 
    node.deployments.some(d => d.capability === 'managed-dashboards')
  );
}

// Check if performance tuning was done in last N turns
function recentTuning(state: GameState, turns: number): boolean {
  const minTurn = state.currentTurn - turns;
  return state.recentTuning.some(t => t >= minTurn);
}

export const EVENT_CARDS: EventCard[] = [
  {
    id: 'auth-model-change',
    title: 'OAuth Scope Shift',
    description: 'The security team is changing the authentication model. All OAuth scopes need review. This could disrupt connectivity across your data estate.',
    choices: [
      {
        id: 'accept-disruption',
        label: 'Accept Temporary Disruption',
        description: 'Support load +15, Reliability -10 unless governance coverage is 60+',
        effect: (state) => {
          const protected_ = state.metrics.governanceCoverage >= 60;
          return {
            metrics: {
              ...state.metrics,
              supportLoad: state.metrics.supportLoad + 15,
              reliability: protected_ ? state.metrics.reliability : state.metrics.reliability - 10,
            },
          };
        },
      },
      {
        id: 'expedite-review',
        label: 'Expedite Review',
        description: 'Spend 15 political capital to minimize impact',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            politicalCapital: state.metrics.politicalCapital - 15,
            supportLoad: state.metrics.supportLoad + 5,
          },
        }),
      },
    ],
  },
  {
    id: 'schema-drift',
    title: 'Schema Drift Detected',
    description: 'Upstream data sources have changed their schemas without notice. Dashboards may break and trust could suffer.',
    choices: [
      {
        id: 'let-it-ride',
        label: 'Ride It Out',
        description: 'Trust -12 unless Managed Dashboards deployed or governance 70+',
        effect: (state) => {
          const protected_ = hasManagedDashboards(state) || state.metrics.governanceCoverage >= 70;
          return {
            metrics: {
              ...state.metrics,
              trust: protected_ ? state.metrics.trust - 3 : state.metrics.trust - 12,
            },
          };
        },
      },
      {
        id: 'emergency-fix',
        label: 'Emergency Schema Fix',
        description: 'Cost +20 this turn, Trust -3',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            cost: state.metrics.cost + 20,
            trust: state.metrics.trust - 3,
          },
        }),
      },
    ],
  },
  {
    id: 'high-cardinality',
    title: 'High-Cardinality Dashboard Pain',
    description: 'Users are complaining about slow-loading dashboards. The data volume is overwhelming the query engine.',
    choices: [
      {
        id: 'do-nothing',
        label: 'Acknowledge and Monitor',
        description: 'Latency +300ms unless performance tuning was done recently',
        effect: (state) => {
          const protected_ = recentTuning(state, 2);
          return {
            metrics: {
              ...state.metrics,
              latency: protected_ ? state.metrics.latency + 50 : state.metrics.latency + 300,
            },
          };
        },
      },
      {
        id: 'add-caching',
        label: 'Implement Caching Layer',
        description: 'Cost +25, Latency reduced by 200ms',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            cost: state.metrics.cost + 25,
            latency: Math.max(200, state.metrics.latency - 200),
          },
        }),
      },
    ],
  },
  {
    id: 'exec-ai-mandate',
    title: 'Executive AI Search Mandate',
    description: 'The C-suite wants AI-powered search capabilities across the data estate. This is a visibility opportunity.',
    choices: [
      {
        id: 'embrace-ai',
        label: 'Embrace the Mandate',
        description: 'Political capital +20, Trust -10 if governance < 60',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            politicalCapital: state.metrics.politicalCapital + 20,
            trust: state.metrics.governanceCoverage < 60 
              ? state.metrics.trust - 10 
              : state.metrics.trust,
          },
        }),
      },
      {
        id: 'cautious-pilot',
        label: 'Propose Controlled Pilot',
        description: 'Political capital +5, Governance coverage +5',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            politicalCapital: state.metrics.politicalCapital + 5,
            governanceCoverage: Math.min(100, state.metrics.governanceCoverage + 5),
          },
        }),
      },
    ],
  },
  {
    id: 'central-it-veto',
    title: 'Central IT Veto Threat',
    description: 'Central IT is threatening to block new deployments due to security concerns. Political capital is critical here.',
    choices: [
      {
        id: 'accept-veto',
        label: 'Accept the Veto',
        description: 'No new deployments next turn, but Trust +5',
        effect: (state) => {
          // Block all nodes for one turn
          const blockedNodes = state.nodes.map(n => ({ ...n, blocked: true }));
          return {
            nodes: blockedNodes,
            metrics: {
              ...state.metrics,
              trust: Math.min(100, state.metrics.trust + 5),
            },
          };
        },
      },
      {
        id: 'fight-veto',
        label: 'Fight the Veto',
        description: 'Requires political capital 60+. Spend 20 political capital.',
        effect: (state) => {
          if (state.metrics.politicalCapital >= 60) {
            return {
              metrics: {
                ...state.metrics,
                politicalCapital: state.metrics.politicalCapital - 20,
              },
            };
          }
          // If not enough political capital, veto happens anyway
          const blockedNodes = state.nodes.map(n => ({ ...n, blocked: true }));
          return {
            nodes: blockedNodes,
            metrics: {
              ...state.metrics,
              politicalCapital: state.metrics.politicalCapital - 10,
            },
          };
        },
      },
    ],
  },
  {
    id: 'licensing-surprise',
    title: 'Licensing Surprise',
    description: 'A vendor audit has revealed licensing discrepancies. Costs are about to spike.',
    choices: [
      {
        id: 'pay-up',
        label: 'Pay the Bill',
        description: 'Cost +40 this turn',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            cost: state.metrics.cost + 40,
          },
        }),
      },
      {
        id: 'cut-scope',
        label: 'Cut Scope',
        description: 'Adoption -10, Cost +10',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            adoption: Math.max(0, state.metrics.adoption - 10),
            cost: state.metrics.cost + 10,
          },
        }),
      },
    ],
  },
  {
    id: 'p1-incident',
    title: 'P1 Incident',
    description: 'A critical production incident has occurred. Data pipelines are down and users are impacted. You must respond.',
    choices: [
      {
        id: 'incident-response',
        label: 'Full Incident Response',
        description: 'Reliability -15, Must spend an action on incident response next turn',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            reliability: Math.max(0, state.metrics.reliability - 15),
          },
          forcedAction: 'incident-response' as const,
        }),
      },
    ],
  },
  {
    id: 'stalled-adoption',
    title: 'Stalled Adoption',
    description: 'Users are not engaging with the analytics tools. Growth has flatlined.',
    choices: [
      {
        id: 'accept-stall',
        label: 'Accept for Now',
        description: 'Adoption growth stops this turn',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            // Adoption won't grow naturally this turn - handled in resolveTurn
          },
        }),
      },
      {
        id: 'push-enablement',
        label: 'Push Emergency Enablement',
        description: 'Cost +15, Adoption +8',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            cost: state.metrics.cost + 15,
            adoption: Math.min(100, state.metrics.adoption + 8),
          },
        }),
      },
    ],
  },
  {
    id: 'data-access-denied',
    title: 'Data Access Denied',
    description: 'A key data owner has revoked access to critical datasets. One of your nodes is now blocked.',
    choices: [
      {
        id: 'negotiate-access',
        label: 'Negotiate Access',
        description: 'Spend 15 political capital to restore access',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            politicalCapital: state.metrics.politicalCapital - 15,
          },
        }),
      },
      {
        id: 'work-around',
        label: 'Work Around It',
        description: 'One random node blocked, Reliability -5',
        effect: (state) => {
          const unblocked = state.nodes.filter(n => !n.blocked);
          if (unblocked.length > 0) {
            const targetIndex = state.currentTurn % unblocked.length;
            const targetId = unblocked[targetIndex].id;
            return {
              nodes: state.nodes.map(n => 
                n.id === targetId ? { ...n, blocked: true } : n
              ),
              metrics: {
                ...state.metrics,
                reliability: Math.max(0, state.metrics.reliability - 5),
              },
            };
          }
          return {};
        },
      },
    ],
  },
  {
    id: 'shadow-it-breakout',
    title: 'Shadow IT Breakout',
    description: 'Users have started building their own analytics solutions outside your governance. Adoption is at risk.',
    choices: [
      {
        id: 'crack-down',
        label: 'Crack Down',
        description: 'Political capital -10, Adoption -8',
        effect: (state) => ({
          metrics: {
            ...state.metrics,
            politicalCapital: Math.max(0, state.metrics.politicalCapital - 10),
            adoption: Math.max(0, state.metrics.adoption - 8),
          },
        }),
      },
      {
        id: 'embrace-extend',
        label: 'Embrace and Extend',
        description: 'If Managed Dashboards deployed: Adoption +5. Otherwise: Trust -10',
        effect: (state) => {
          if (hasManagedDashboards(state)) {
            return {
              metrics: {
                ...state.metrics,
                adoption: Math.min(100, state.metrics.adoption + 5),
              },
            };
          }
          return {
            metrics: {
              ...state.metrics,
              trust: Math.max(0, state.metrics.trust - 10),
            },
          };
        },
      },
    ],
  },
];

// Draw an event based on current game state
export function drawEvent(state: GameState, rng: { randomInt: (min: number, max: number) => number }): EventCard | null {
  // Filter out events already drawn this game (prevent repeats)
  const availableEvents = EVENT_CARDS.filter(e => !state.eventHistory.includes(e.id));
  
  if (availableEvents.length === 0) {
    return null;
  }
  
  // Pick a random event
  const index = rng.randomInt(0, availableEvents.length);
  return availableEvents[index];
}
