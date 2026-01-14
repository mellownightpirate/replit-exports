/**
 * MissionBrief - Persistent panel showing win/lose conditions and dynamic guidelines
 */

import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, 
  AlertTriangle, 
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { WIN_CONDITIONS, LOSE_THRESHOLDS } from '@/lib/gameTypes';
import { getActiveGuidelines } from '@/lib/gameStrings';
import { MascotAuto } from './Mascot';

export function MissionBrief() {
  const metrics = useGameStore((state) => state.metrics);
  const phase = useGameStore((state) => state.phase);
  
  // Don't show during scenario selection or end screens
  if (phase === 'scenario-select' || phase === 'won' || phase === 'lost') {
    return null;
  }
  
  // Calculate which guidelines are active
  const guidelines = getActiveGuidelines(metrics);
  
  // Check current status against conditions
  const winStatus = {
    adoption: metrics.adoption >= WIN_CONDITIONS.adoption,
    trust: metrics.trust >= WIN_CONDITIONS.trust,
    governance: metrics.governanceCoverage >= WIN_CONDITIONS.governanceCoverage,
    reliability: metrics.reliability >= WIN_CONDITIONS.reliability,
    latency: metrics.latency <= WIN_CONDITIONS.maxLatency,
    cost: metrics.cost <= WIN_CONDITIONS.maxCostPerTurn,
  };
  
  const loseRisks = {
    trust: metrics.trust <= LOSE_THRESHOLDS.trust + 15,
    reliability: metrics.reliability <= LOSE_THRESHOLDS.reliability + 15,
    politicalCapital: metrics.politicalCapital <= LOSE_THRESHOLDS.politicalCapital + 15,
  };
  
  const metObjectives = Object.values(winStatus).filter(Boolean).length;
  
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20" data-testid="mission-brief">
      {/* Header with mascot */}
      <div className="flex items-center gap-3 mb-4">
        <MascotAuto size="sm" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">Mission Brief</h3>
          <p className="text-xs text-muted-foreground">
            {metObjectives}/6 objectives met
          </p>
        </div>
      </div>
      
      {/* Win conditions */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <Target className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Win Conditions
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <WinConditionItem 
            label="Adoption" 
            target={`${WIN_CONDITIONS.adoption}%`}
            met={winStatus.adoption}
          />
          <WinConditionItem 
            label="Trust" 
            target={`${WIN_CONDITIONS.trust}%`}
            met={winStatus.trust}
          />
          <WinConditionItem 
            label="Governance" 
            target={`${WIN_CONDITIONS.governanceCoverage}%`}
            met={winStatus.governance}
          />
          <WinConditionItem 
            label="Reliability" 
            target={`${WIN_CONDITIONS.reliability}%`}
            met={winStatus.reliability}
          />
          <WinConditionItem 
            label="Latency" 
            target={`≤${WIN_CONDITIONS.maxLatency}ms`}
            met={winStatus.latency}
          />
          <WinConditionItem 
            label="Cost" 
            target={`≤£${WIN_CONDITIONS.maxCostPerTurn}`}
            met={winStatus.cost}
          />
        </div>
      </div>
      
      {/* Lose conditions */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Lose Conditions
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <LoseConditionItem 
            label="Trust collapse" 
            threshold={`≤${LOSE_THRESHOLDS.trust}%`}
            atRisk={loseRisks.trust}
            current={metrics.trust}
          />
          <LoseConditionItem 
            label="Reliability crisis" 
            threshold={`≤${LOSE_THRESHOLDS.reliability}%`}
            atRisk={loseRisks.reliability}
            current={metrics.reliability}
          />
          <LoseConditionItem 
            label="Political failure" 
            threshold={`≤${LOSE_THRESHOLDS.politicalCapital}%`}
            atRisk={loseRisks.politicalCapital}
            current={metrics.politicalCapital}
          />
        </div>
      </div>
      
      {/* Dynamic guidelines */}
      {guidelines.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Lightbulb className="w-3 h-3 text-chart-4" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Coach Tips
            </span>
          </div>
          <div className="space-y-2">
            {guidelines.map((g) => (
              <Tooltip key={g.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/50 cursor-help">
                    <HelpCircle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{g.guideline}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{g.coachTip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface WinConditionItemProps {
  label: string;
  target: string;
  met: boolean;
}

function WinConditionItem({ label, target, met }: WinConditionItemProps) {
  return (
    <div className="flex items-center gap-1">
      {met ? (
        <CheckCircle2 className="w-3 h-3 text-green-500" />
      ) : (
        <XCircle className="w-3 h-3 text-muted-foreground" />
      )}
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>
        {label}: {target}
      </span>
    </div>
  );
}

interface LoseConditionItemProps {
  label: string;
  threshold: string;
  atRisk: boolean;
  current: number;
}

function LoseConditionItem({ label, threshold, atRisk, current }: LoseConditionItemProps) {
  return (
    <div className={`flex items-center justify-between ${atRisk ? 'text-destructive' : 'text-muted-foreground'}`}>
      <span>{label} {threshold}</span>
      {atRisk && (
        <span className="font-mono text-destructive">
          (now: {Math.round(current)}%)
        </span>
      )}
    </div>
  );
}
