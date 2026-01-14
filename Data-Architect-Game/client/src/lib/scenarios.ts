/**
 * Scenario definitions for Insight Empire
 */

import type { Scenario, GameNode, GameEdge, NodeCategory } from './gameTypes';

// Scenario presets
export const SCENARIOS: Scenario[] = [
  {
    id: 'speed-to-value',
    name: 'Speed to Value',
    description: 'Low governance start, high adoption pressure. Move fast but watch your trust.',
    initialMetrics: {
      adoption: 35,
      trust: 55,
      latency: 1800,
      cost: 80,
      governanceCoverage: 25,
      reliability: 60,
      politicalCapital: 70,
      supportLoad: 30,
    },
    nodeCount: 10,
    eventFrequency: 2, // Event every 2 turns
  },
  {
    id: 'governance-first',
    name: 'Governance First',
    description: 'Strict security, slower adoption, higher starting governance. Build trust first.',
    initialMetrics: {
      adoption: 20,
      trust: 70,
      latency: 1500,
      cost: 100,
      governanceCoverage: 65,
      reliability: 75,
      politicalCapital: 50,
      supportLoad: 20,
    },
    nodeCount: 10,
    eventFrequency: 2,
  },
  {
    id: 'scale-out',
    name: 'Scale-Out Enterprise',
    description: 'More nodes, higher concurrency pressure, more events. Complex but rewarding.',
    initialMetrics: {
      adoption: 30,
      trust: 50,
      latency: 2000,
      cost: 120,
      governanceCoverage: 40,
      reliability: 55,
      politicalCapital: 55,
      supportLoad: 45,
    },
    nodeCount: 14,
    eventFrequency: 1, // Event every turn
  },
];

// Node templates for generating the map
interface NodeTemplate {
  name: string;
  category: NodeCategory;
}

const BUSINESS_UNITS: NodeTemplate[] = [
  { name: 'Finance', category: 'business-unit' },
  { name: 'Operations', category: 'business-unit' },
  { name: 'Product', category: 'business-unit' },
  { name: 'Sales', category: 'business-unit' },
  { name: 'Marketing', category: 'business-unit' },
];

const APPLICATIONS: NodeTemplate[] = [
  { name: 'ERP', category: 'application' },
  { name: 'CRM', category: 'application' },
  { name: 'Support', category: 'application' },
  { name: 'HRIS', category: 'application' },
  { name: 'E-Commerce', category: 'application' },
];

const DATA_PLATFORMS: NodeTemplate[] = [
  { name: 'Data Warehouse', category: 'data-platform' },
  { name: 'Data Lake', category: 'data-platform' },
  { name: 'Query Engine', category: 'data-platform' },
  { name: 'Streaming Hub', category: 'data-platform' },
];

const DOMAINS: NodeTemplate[] = [
  { name: 'Orders', category: 'domain' },
  { name: 'Customers', category: 'domain' },
  { name: 'Revenue', category: 'domain' },
  { name: 'Tickets', category: 'domain' },
  { name: 'Inventory', category: 'domain' },
  { name: 'Employees', category: 'domain' },
];

// Generate nodes for a scenario
export function generateNodes(scenario: Scenario, seed: number): GameNode[] {
  const nodes: GameNode[] = [];
  const nodeCount = scenario.nodeCount;
  
  // Determine how many of each category based on nodeCount
  const buCount = Math.ceil(nodeCount * 0.25);
  const appCount = Math.ceil(nodeCount * 0.25);
  const dpCount = Math.ceil(nodeCount * 0.2);
  const domainCount = nodeCount - buCount - appCount - dpCount;
  
  // Seeded shuffle for consistent generation
  const seededShuffle = <T>(arr: T[], s: number): T[] => {
    const result = [...arr];
    let state = s;
    for (let i = result.length - 1; i > 0; i--) {
      state = (state * 1103515245 + 12345) % 2147483648;
      const j = state % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  
  const shuffledBU = seededShuffle(BUSINESS_UNITS, seed);
  const shuffledApps = seededShuffle(APPLICATIONS, seed + 1);
  const shuffledDP = seededShuffle(DATA_PLATFORMS, seed + 2);
  const shuffledDomains = seededShuffle(DOMAINS, seed + 3);
  
  // Layout constants - organized in rows by category
  const svgWidth = 800;
  const svgHeight = 500;
  const padding = 80;
  
  // Row positions
  const rowY = {
    'business-unit': 80,
    'application': 180,
    'data-platform': 300,
    'domain': 420,
  };
  
  let id = 0;
  
  // Add business units
  for (let i = 0; i < buCount && i < shuffledBU.length; i++) {
    const template = shuffledBU[i];
    const x = padding + ((svgWidth - 2 * padding) / (buCount + 1)) * (i + 1);
    nodes.push({
      id: `node-${id++}`,
      name: template.name,
      category: template.category,
      x,
      y: rowY['business-unit'],
      adoption: scenario.initialMetrics.adoption + (seed * (i + 1)) % 15 - 7,
      trust: scenario.initialMetrics.trust + (seed * (i + 2)) % 15 - 7,
      latency: scenario.initialMetrics.latency + (seed * (i + 3)) % 300 - 150,
      cost: 10 + (seed * (i + 4)) % 20,
      deployments: [],
      blocked: false,
    });
  }
  
  // Add applications
  for (let i = 0; i < appCount && i < shuffledApps.length; i++) {
    const template = shuffledApps[i];
    const x = padding + ((svgWidth - 2 * padding) / (appCount + 1)) * (i + 1);
    nodes.push({
      id: `node-${id++}`,
      name: template.name,
      category: template.category,
      x,
      y: rowY['application'],
      adoption: scenario.initialMetrics.adoption + (seed * (i + 5)) % 15 - 7,
      trust: scenario.initialMetrics.trust + (seed * (i + 6)) % 15 - 7,
      latency: scenario.initialMetrics.latency + (seed * (i + 7)) % 400 - 200,
      cost: 15 + (seed * (i + 8)) % 25,
      deployments: [],
      blocked: false,
    });
  }
  
  // Add data platforms
  for (let i = 0; i < dpCount && i < shuffledDP.length; i++) {
    const template = shuffledDP[i];
    const x = padding + ((svgWidth - 2 * padding) / (dpCount + 1)) * (i + 1);
    nodes.push({
      id: `node-${id++}`,
      name: template.name,
      category: template.category,
      x,
      y: rowY['data-platform'],
      adoption: scenario.initialMetrics.adoption + (seed * (i + 9)) % 15 - 7,
      trust: scenario.initialMetrics.trust + (seed * (i + 10)) % 15 - 7,
      latency: scenario.initialMetrics.latency + (seed * (i + 11)) % 500 - 250,
      cost: 20 + (seed * (i + 12)) % 30,
      deployments: [],
      blocked: false,
    });
  }
  
  // Add domains
  for (let i = 0; i < domainCount && i < shuffledDomains.length; i++) {
    const template = shuffledDomains[i];
    const x = padding + ((svgWidth - 2 * padding) / (domainCount + 1)) * (i + 1);
    nodes.push({
      id: `node-${id++}`,
      name: template.name,
      category: template.category,
      x,
      y: rowY['domain'],
      adoption: scenario.initialMetrics.adoption + (seed * (i + 13)) % 15 - 7,
      trust: scenario.initialMetrics.trust + (seed * (i + 14)) % 15 - 7,
      latency: scenario.initialMetrics.latency + (seed * (i + 15)) % 300 - 150,
      cost: 8 + (seed * (i + 16)) % 15,
      deployments: [],
      blocked: false,
    });
  }
  
  // Clamp node metrics
  nodes.forEach(node => {
    node.adoption = Math.max(0, Math.min(100, node.adoption));
    node.trust = Math.max(0, Math.min(100, node.trust));
    node.latency = Math.max(200, Math.min(3000, node.latency));
    node.cost = Math.max(5, Math.min(50, node.cost));
  });
  
  return nodes;
}

// Generate edges connecting nodes
export function generateEdges(nodes: GameNode[], seed: number): GameEdge[] {
  const edges: GameEdge[] = [];
  let edgeId = 0;
  
  // Connect business units to applications (most connections)
  const businessUnits = nodes.filter(n => n.category === 'business-unit');
  const applications = nodes.filter(n => n.category === 'application');
  const dataPlatforms = nodes.filter(n => n.category === 'data-platform');
  const domains = nodes.filter(n => n.category === 'domain');
  
  // Each BU connects to 1-2 applications
  businessUnits.forEach((bu, i) => {
    const appCount = 1 + ((seed + i) % 2);
    for (let j = 0; j < appCount && j < applications.length; j++) {
      const appIndex = (i + j) % applications.length;
      edges.push({
        id: `edge-${edgeId++}`,
        source: bu.id,
        target: applications[appIndex].id,
        strength: j === 0 ? 'strong' : 'weak',
      });
    }
  });
  
  // Applications connect to data platforms
  applications.forEach((app, i) => {
    if (dataPlatforms.length > 0) {
      const dpIndex = i % dataPlatforms.length;
      edges.push({
        id: `edge-${edgeId++}`,
        source: app.id,
        target: dataPlatforms[dpIndex].id,
        strength: 'strong',
      });
    }
  });
  
  // Data platforms connect to domains
  dataPlatforms.forEach((dp, i) => {
    const domainConnections = 1 + ((seed + i) % 2);
    for (let j = 0; j < domainConnections && j < domains.length; j++) {
      const domainIndex = (i + j) % domains.length;
      edges.push({
        id: `edge-${edgeId++}`,
        source: dp.id,
        target: domains[domainIndex].id,
        strength: j === 0 ? 'strong' : 'weak',
      });
    }
  });
  
  return edges;
}
