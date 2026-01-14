/**
 * NodePanel - Right panel showing selected node details and actions
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  AppWindow, 
  Database, 
  Boxes,
  Plug,
  Search,
  LayoutDashboard,
  GraduationCap,
  Scale,
  Gauge,
  AlertTriangle,
  Lock,
  TrendingUp,
  Shield,
  Zap,
  Coins,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { getAvailableActions, getActionDescription } from '@/lib/simulation';
import { CAPABILITY_INFO, type NodeCategory, type ActionType, type CapabilityType } from '@/lib/gameTypes';

// Get icon for node category
function getCategoryIcon(category: NodeCategory) {
  switch (category) {
    case 'business-unit': return Building2;
    case 'application': return AppWindow;
    case 'data-platform': return Database;
    case 'domain': return Boxes;
  }
}

// Get icon for action type
function getActionIcon(actionType: ActionType) {
  switch (actionType) {
    case 'deploy-simba': return Plug;
    case 'deploy-vdd': return Search;
    case 'deploy-dashboards': return LayoutDashboard;
    case 'run-enablement': return GraduationCap;
    case 'add-governance': return Scale;
    case 'performance-tuning': return Gauge;
    case 'incident-response': return AlertTriangle;
  }
}

// Get capability icon
function getCapabilityIcon(capability: CapabilityType) {
  switch (capability) {
    case 'simba-connectors': return Plug;
    case 'logi-vdd': return Search;
    case 'managed-dashboards': return LayoutDashboard;
  }
}

// Get status color
function getStatusColor(value: number): string {
  if (value >= 70) return 'text-green-500';
  if (value >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function NodePanel() {
  const nodes = useGameStore((state) => state.nodes);
  const selectedNodeId = useGameStore((state) => state.selectedNodeId);
  const actionsRemaining = useGameStore((state) => state.actionsRemaining);
  const phase = useGameStore((state) => state.phase);
  const forcedAction = useGameStore((state) => state.forcedAction);
  const performAction = useGameStore((state) => state.performAction);
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-border bg-card/30 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Select a Node
        </h3>
        <p className="text-sm text-muted-foreground">
          Click on any node in the map to view its details and available actions.
        </p>
      </div>
    );
  }
  
  const Icon = getCategoryIcon(selectedNode.category);
  const availableActions = getAvailableActions(
    useGameStore.getState(), 
    selectedNode.id
  );
  
  const canAct = phase === 'playing' && actionsRemaining > 0;
  
  return (
    <div className="w-80 border-l border-border bg-card/30 flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Node header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate" data-testid="text-node-name">
            {selectedNode.name}
          </h2>
          <Badge variant="secondary" size="sm">
            {selectedNode.category.split('-').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ')}
          </Badge>
        </div>
      </div>
      
      {/* Blocked warning */}
      {selectedNode.blocked && (
        <Card className="p-3 bg-destructive/10 border-destructive/30">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Blocked by Central IT
            </span>
          </div>
          <p className="text-xs text-destructive/80 mt-1">
            No deployments allowed this turn
          </p>
        </Card>
      )}
      
      {/* Node metrics */}
      <Card className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Node Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${getStatusColor(selectedNode.adoption)}`} />
            <div>
              <p className="text-xs text-muted-foreground">Adoption</p>
              <p className="text-sm font-mono font-semibold">{Math.round(selectedNode.adoption)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${getStatusColor(selectedNode.trust)}`} />
            <div>
              <p className="text-xs text-muted-foreground">Trust</p>
              <p className="text-sm font-mono font-semibold">{Math.round(selectedNode.trust)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${selectedNode.latency <= 1200 ? 'text-green-500' : selectedNode.latency <= 1800 ? 'text-yellow-500' : 'text-red-500'}`} />
            <div>
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className="text-sm font-mono font-semibold">{Math.round(selectedNode.latency)}ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-sm font-mono font-semibold">£{Math.round(selectedNode.cost)}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Active deployments */}
      {selectedNode.deployments.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Active Deployments
          </h3>
          <div className="space-y-2">
            {selectedNode.deployments.map((dep) => {
              const CapIcon = getCapabilityIcon(dep.capability);
              const info = CAPABILITY_INFO[dep.capability];
              return (
                <Card key={dep.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <CapIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {info.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deployed turn {dep.turnDeployed}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Available actions */}
      <div className="flex-1">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Available Actions
        </h3>
        <div className="space-y-2">
          {availableActions.map((actionType) => {
            const ActionIcon = getActionIcon(actionType);
            const info = getActionDescription(actionType);
            const isForced = forcedAction === actionType;
            const isDeployment = actionType.startsWith('deploy-');
            const isBlocked = selectedNode.blocked && isDeployment;
            
            return (
              <Button
                key={actionType}
                variant={isForced ? 'default' : 'outline'}
                className="w-full justify-start h-auto py-3 px-4"
                disabled={!canAct || isBlocked}
                onClick={() => performAction(actionType, isDeployment ? selectedNode.id : undefined)}
                data-testid={`button-action-${actionType}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <ActionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">
                      {info.name}
                      {isForced && <span className="text-destructive ml-1">(Required)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {info.effects}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Action hint */}
      {!canAct && phase === 'playing' && (
        <p className="text-xs text-muted-foreground text-center">
          No actions remaining. End your turn to continue.
        </p>
      )}
    </div>
  );
}
