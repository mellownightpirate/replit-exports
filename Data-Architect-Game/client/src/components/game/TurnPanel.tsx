/**
 * TurnPanel - Left panel showing turn info, objectives, and controls
 */

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ArrowRight,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Undo2,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { WIN_CONDITIONS } from '@/lib/gameTypes';
import { MissionBrief } from './MissionBrief';

interface ObjectiveItemProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  lowerIsBetter?: boolean;
}

function ObjectiveItem({ label, current, target, unit = '%', lowerIsBetter }: ObjectiveItemProps) {
  const progress = lowerIsBetter
    ? Math.max(0, Math.min(100, ((target * 2 - current) / target) * 100))
    : Math.max(0, Math.min(100, (current / target) * 100));
  
  const isMet = lowerIsBetter ? current <= target : current >= target;
  const isClose = lowerIsBetter 
    ? current <= target * 1.3 
    : current >= target * 0.7;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        {isMet ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : isClose ? (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate">{label}</span>
          <span className="font-mono font-medium text-foreground">
            {Math.round(current)}{unit === '£' ? '' : unit}
            {unit === '£' && '£'}
            <span className="text-muted-foreground">
              /{lowerIsBetter ? '≤' : '≥'}{target}{unit === '£' ? '£' : unit}
            </span>
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-1 mt-1"
        />
      </div>
    </div>
  );
}

export function TurnPanel() {
  const currentTurn = useGameStore((state) => state.currentTurn);
  const maxTurns = useGameStore((state) => state.maxTurns);
  const actionsRemaining = useGameStore((state) => state.actionsRemaining);
  const actionsPerTurn = useGameStore((state) => state.actionsPerTurn);
  const metrics = useGameStore((state) => state.metrics);
  const forcedAction = useGameStore((state) => state.forcedAction);
  const actionsThisTurn = useGameStore((state) => state.actionsThisTurn);
  const phase = useGameStore((state) => state.phase);
  const undoStack = useGameStore((state) => state.undoStack);
  const endTurn = useGameStore((state) => state.endTurn);
  const resetGame = useGameStore((state) => state.resetGame);
  const undoLastAction = useGameStore((state) => state.undoLastAction);
  
  const canEndTurn = phase === 'playing' && 
    (!forcedAction || actionsThisTurn.includes(forcedAction));
  const canUndo = phase === 'playing' && undoStack.length > 0;
  
  return (
    <div className="w-64 border-r border-border bg-card/30 flex flex-col p-4 gap-4">
      {/* Turn counter */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Turn</p>
        <p className="text-5xl font-bold text-foreground font-mono" data-testid="text-current-turn">
          {currentTurn}
          <span className="text-xl text-muted-foreground">/{maxTurns}</span>
        </p>
      </div>
      
      {/* Actions remaining */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Actions:</span>
        <div className="flex gap-1">
          {Array.from({ length: actionsPerTurn }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                i < actionsRemaining
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted bg-muted/30 text-muted-foreground'
              }`}
              data-testid={`action-slot-${i}`}
            >
              {i < actionsRemaining ? actionsPerTurn - i : ''}
            </div>
          ))}
        </div>
      </div>
      
      {/* Forced action warning */}
      {forcedAction && !actionsThisTurn.includes(forcedAction) && (
        <Card className="p-3 bg-destructive/10 border-destructive/30">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-medium">
              Must: Incident Response
            </span>
          </div>
        </Card>
      )}
      
      {/* Objectives */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Objectives
          </h3>
        </div>
        <div className="space-y-3">
          <ObjectiveItem
            label="Adoption"
            current={metrics.adoption}
            target={WIN_CONDITIONS.adoption}
          />
          <ObjectiveItem
            label="Trust"
            current={metrics.trust}
            target={WIN_CONDITIONS.trust}
          />
          <ObjectiveItem
            label="Governance"
            current={metrics.governanceCoverage}
            target={WIN_CONDITIONS.governanceCoverage}
          />
          <ObjectiveItem
            label="Reliability"
            current={metrics.reliability}
            target={WIN_CONDITIONS.reliability}
          />
          <ObjectiveItem
            label="Latency"
            current={metrics.latency}
            target={WIN_CONDITIONS.maxLatency}
            unit="ms"
            lowerIsBetter
          />
          <ObjectiveItem
            label="Cost"
            current={metrics.cost}
            target={WIN_CONDITIONS.maxCostPerTurn}
            unit="£"
            lowerIsBetter
          />
        </div>
      </div>
      
      {/* Mission Brief */}
      <MissionBrief />
      
      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          onClick={endTurn}
          disabled={!canEndTurn}
          className="w-full"
          size="lg"
          data-testid="button-end-turn"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          End Turn
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={undoLastAction}
            disabled={!canUndo}
            variant="outline"
            size="sm"
            className="flex-1"
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            size="sm"
            className="flex-1"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
