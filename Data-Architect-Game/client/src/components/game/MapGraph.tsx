/**
 * MapGraph - SVG visualization of the enterprise data estate
 */

import { useGameStore } from '@/lib/gameStore';
import type { GameNode, NodeCategory } from '@/lib/gameTypes';
import { 
  Building2, 
  AppWindow, 
  Database, 
  Boxes,
  Plug,
  Search,
  LayoutDashboard,
} from 'lucide-react';

// Node category colors
const CATEGORY_COLORS: Record<NodeCategory, { fill: string; stroke: string; text: string }> = {
  'business-unit': { 
    fill: 'fill-chart-1/20', 
    stroke: 'stroke-chart-1', 
    text: 'text-chart-1' 
  },
  'application': { 
    fill: 'fill-chart-2/20', 
    stroke: 'stroke-chart-2', 
    text: 'text-chart-2' 
  },
  'data-platform': { 
    fill: 'fill-chart-3/20', 
    stroke: 'stroke-chart-3', 
    text: 'text-chart-3' 
  },
  'domain': { 
    fill: 'fill-chart-4/20', 
    stroke: 'stroke-chart-4', 
    text: 'text-chart-4' 
  },
};

// Get icon for node category
function getNodeIcon(category: NodeCategory) {
  switch (category) {
    case 'business-unit': return Building2;
    case 'application': return AppWindow;
    case 'data-platform': return Database;
    case 'domain': return Boxes;
  }
}

// Get status color based on value (0-100 scale)
function getStatusColor(value: number): string {
  if (value >= 70) return '#22c55e'; // green
  if (value >= 40) return '#eab308'; // yellow
  return '#ef4444'; // red
}

// Get latency status color
function getLatencyColor(value: number): string {
  if (value <= 800) return '#22c55e';
  if (value <= 1500) return '#eab308';
  return '#ef4444';
}

interface NodeComponentProps {
  node: GameNode;
  isSelected: boolean;
  onClick: () => void;
}

function NodeComponent({ node, isSelected, onClick }: NodeComponentProps) {
  const colors = CATEGORY_COLORS[node.category];
  const Icon = getNodeIcon(node.category);
  const hasDeployments = node.deployments.length > 0;
  
  const nodeRadius = 28;
  const badgeRadius = 8;
  
  return (
    <g 
      className="cursor-pointer transition-transform"
      onClick={onClick}
      data-testid={`node-${node.id}`}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius + 6}
          className="fill-none stroke-primary"
          strokeWidth={3}
          strokeDasharray="4 2"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="12"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* Blocked indicator */}
      {node.blocked && (
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius + 4}
          className="fill-none stroke-destructive"
          strokeWidth={2}
          strokeDasharray="8 4"
        />
      )}
      
      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={nodeRadius}
        className={`${colors.fill} ${colors.stroke} ${isSelected ? 'stroke-[3]' : 'stroke-2'} transition-all hover:stroke-[3]`}
      />
      
      {/* Deployment pulse */}
      {hasDeployments && (
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          className="fill-none stroke-primary/50"
          strokeWidth={2}
        >
          <animate
            attributeName="r"
            from={nodeRadius}
            to={nodeRadius + 12}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* Node icon */}
      <foreignObject
        x={node.x - 10}
        y={node.y - 10}
        width={20}
        height={20}
        className="pointer-events-none"
      >
        <div className={`w-full h-full flex items-center justify-center ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </foreignObject>
      
      {/* Node name */}
      <text
        x={node.x}
        y={node.y + nodeRadius + 14}
        textAnchor="middle"
        className="text-xs font-medium fill-foreground"
      >
        {node.name}
      </text>
      
      {/* Status badges */}
      {/* Adoption badge (top-left) */}
      <circle
        cx={node.x - nodeRadius + 8}
        cy={node.y - nodeRadius + 8}
        r={badgeRadius}
        fill={getStatusColor(node.adoption)}
        className="stroke-background"
        strokeWidth={2}
      />
      <text
        x={node.x - nodeRadius + 8}
        y={node.y - nodeRadius + 11}
        textAnchor="middle"
        className="text-[8px] font-bold fill-white"
      >
        A
      </text>
      
      {/* Trust badge (top-right) */}
      <circle
        cx={node.x + nodeRadius - 8}
        cy={node.y - nodeRadius + 8}
        r={badgeRadius}
        fill={getStatusColor(node.trust)}
        className="stroke-background"
        strokeWidth={2}
      />
      <text
        x={node.x + nodeRadius - 8}
        y={node.y - nodeRadius + 11}
        textAnchor="middle"
        className="text-[8px] font-bold fill-white"
      >
        T
      </text>
      
      {/* Latency badge (bottom-right) */}
      <circle
        cx={node.x + nodeRadius - 8}
        cy={node.y + nodeRadius - 8}
        r={badgeRadius}
        fill={getLatencyColor(node.latency)}
        className="stroke-background"
        strokeWidth={2}
      />
      <text
        x={node.x + nodeRadius - 8}
        y={node.y + nodeRadius - 5}
        textAnchor="middle"
        className="text-[8px] font-bold fill-white"
      >
        L
      </text>
      
      {/* Deployment indicators */}
      {node.deployments.map((dep, i) => {
        const angle = (Math.PI / 4) + (i * Math.PI / 6);
        const depX = node.x - nodeRadius + 8 + (i * 12);
        const depY = node.y + nodeRadius - 8;
        
        let DepIcon = Plug;
        if (dep.capability === 'logi-vdd') DepIcon = Search;
        if (dep.capability === 'managed-dashboards') DepIcon = LayoutDashboard;
        
        return (
          <foreignObject
            key={dep.id}
            x={depX - 6}
            y={depY - 6}
            width={12}
            height={12}
            className="pointer-events-none"
          >
            <div className="w-full h-full flex items-center justify-center bg-primary rounded-full">
              <DepIcon className="w-2 h-2 text-primary-foreground" />
            </div>
          </foreignObject>
        );
      })}
    </g>
  );
}

export function MapGraph() {
  const nodes = useGameStore((state) => state.nodes);
  const edges = useGameStore((state) => state.edges);
  const selectedNodeId = useGameStore((state) => state.selectedNodeId);
  const selectNode = useGameStore((state) => state.selectNode);
  
  return (
    <div className="flex-1 bg-background/50 rounded-lg border border-border overflow-hidden">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectNode(null);
          }
        }}
        data-testid="map-graph"
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              className="stroke-border/30"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Category labels */}
        <text x="20" y="80" className="text-xs font-semibold fill-chart-1 uppercase tracking-wider">
          Business Units
        </text>
        <text x="20" y="180" className="text-xs font-semibold fill-chart-2 uppercase tracking-wider">
          Applications
        </text>
        <text x="20" y="300" className="text-xs font-semibold fill-chart-3 uppercase tracking-wider">
          Data Platforms
        </text>
        <text x="20" y="420" className="text-xs font-semibold fill-chart-4 uppercase tracking-wider">
          Domains
        </text>
        
        {/* Edges */}
        {edges.map((edge) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          
          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className="stroke-muted-foreground/30"
              strokeWidth={edge.strength === 'strong' ? 2 : 1}
              strokeDasharray={edge.strength === 'weak' ? '4 4' : undefined}
            />
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onClick={() => selectNode(node.id)}
          />
        ))}
        
        {/* Legend */}
        <g transform="translate(640, 20)">
          <rect
            x="0"
            y="0"
            width="150"
            height="80"
            rx="6"
            className="fill-card/90 stroke-border"
          />
          <text x="10" y="18" className="text-xs font-semibold fill-foreground">
            Badge Legend
          </text>
          <g transform="translate(10, 28)">
            <circle cx="8" cy="8" r="6" className="fill-muted" />
            <text x="8" y="11" textAnchor="middle" className="text-[7px] font-bold fill-foreground">A</text>
            <text x="20" y="11" className="text-[10px] fill-muted-foreground">Adoption</text>
          </g>
          <g transform="translate(80, 28)">
            <circle cx="8" cy="8" r="6" className="fill-muted" />
            <text x="8" y="11" textAnchor="middle" className="text-[7px] font-bold fill-foreground">T</text>
            <text x="20" y="11" className="text-[10px] fill-muted-foreground">Trust</text>
          </g>
          <g transform="translate(10, 48)">
            <circle cx="8" cy="8" r="6" className="fill-muted" />
            <text x="8" y="11" textAnchor="middle" className="text-[7px] font-bold fill-foreground">L</text>
            <text x="20" y="11" className="text-[10px] fill-muted-foreground">Latency</text>
          </g>
          <g transform="translate(10, 62)">
            <circle cx="6" cy="6" r="4" fill="#22c55e" />
            <text x="14" y="9" className="text-[9px] fill-muted-foreground">Good</text>
            <circle cx="50" cy="6" r="4" fill="#eab308" />
            <text x="58" y="9" className="text-[9px] fill-muted-foreground">Warn</text>
            <circle cx="94" cy="6" r="4" fill="#ef4444" />
            <text x="102" y="9" className="text-[9px] fill-muted-foreground">Bad</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
