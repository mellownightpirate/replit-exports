/**
 * EndScreen - Victory/defeat screen with results summary
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Skull, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Coins,
  Scale,
  Server,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { WIN_CONDITIONS } from '@/lib/gameTypes';
import { GAME_TITLE } from '@/lib/gameStrings';
import { Mascot } from './Mascot';

interface MetricCompareProps {
  label: string;
  initial: number;
  final: number;
  target: number;
  unit?: string;
  lowerIsBetter?: boolean;
  icon: React.ReactNode;
}

function MetricCompare({ label, initial, final, target, unit = '%', lowerIsBetter, icon }: MetricCompareProps) {
  const isMet = lowerIsBetter ? final <= target : final >= target;
  const change = final - initial;
  const changeText = change >= 0 ? `+${Math.round(change)}` : Math.round(change).toString();
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {isMet ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{Math.round(initial)}{unit}</span>
          <ArrowRight className="w-3 h-3" />
          <span className={isMet ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
            {Math.round(final)}{unit}
          </span>
          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
            ({changeText})
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Target: {lowerIsBetter ? '≤' : '≥'}{target}{unit}
      </div>
    </div>
  );
}

export function EndScreen() {
  const phase = useGameStore((state) => state.phase);
  const metrics = useGameStore((state) => state.metrics);
  const scenario = useGameStore((state) => state.scenario);
  const timeline = useGameStore((state) => state.timeline);
  const loseReason = useGameStore((state) => state.loseReason);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const resetGame = useGameStore((state) => state.resetGame);
  
  if (phase !== 'won' && phase !== 'lost') {
    return null;
  }
  
  const isVictory = phase === 'won';
  const initialMetrics = scenario?.initialMetrics || metrics;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
      data-testid="end-screen"
    >
      <Card className="max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header banner */}
        <div className={`p-8 text-center ${isVictory ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className="flex justify-center mb-4">
            <Mascot expression={isVictory ? 'excited' : 'worried'} size="lg" />
          </div>
          <h1 
            className={`text-4xl font-bold mb-2 ${
              isVictory ? 'text-green-500' : 'text-red-500'
            }`}
            data-testid="text-end-result"
          >
            {isVictory ? 'Victory!' : 'Defeat'}
          </h1>
          <p className="text-muted-foreground">
            {isVictory 
              ? `Well done! You unified the data estate and proved the value of ${GAME_TITLE}.`
              : loseReason || 'The data estate remains fragmented. Try a different approach.'}
          </p>
          <Badge variant="secondary" className="mt-4">
            {scenario?.name || 'Unknown'} - Turn {currentTurn}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Metrics comparison */}
          <div className="flex-1 p-6 border-r border-border">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
              Final Results
            </h3>
            <div className="space-y-1">
              <MetricCompare
                label="Adoption"
                initial={initialMetrics.adoption}
                final={metrics.adoption}
                target={WIN_CONDITIONS.adoption}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <MetricCompare
                label="Trust"
                initial={initialMetrics.trust}
                final={metrics.trust}
                target={WIN_CONDITIONS.trust}
                icon={<Shield className="w-4 h-4" />}
              />
              <MetricCompare
                label="Governance"
                initial={initialMetrics.governanceCoverage}
                final={metrics.governanceCoverage}
                target={WIN_CONDITIONS.governanceCoverage}
                icon={<Scale className="w-4 h-4" />}
              />
              <MetricCompare
                label="Reliability"
                initial={initialMetrics.reliability}
                final={metrics.reliability}
                target={WIN_CONDITIONS.reliability}
                icon={<Server className="w-4 h-4" />}
              />
              <MetricCompare
                label="Latency"
                initial={initialMetrics.latency}
                final={metrics.latency}
                target={WIN_CONDITIONS.maxLatency}
                unit="ms"
                lowerIsBetter
                icon={<Zap className="w-4 h-4" />}
              />
              <MetricCompare
                label="Cost"
                initial={initialMetrics.cost}
                final={metrics.cost}
                target={WIN_CONDITIONS.maxCostPerTurn}
                unit="£"
                lowerIsBetter
                icon={<Coins className="w-4 h-4" />}
              />
            </div>
          </div>
          
          {/* Timeline */}
          <div className="flex-1 p-6">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
              Timeline
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-3 pr-4">
                {timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 text-xs font-mono text-muted-foreground pt-0.5">
                      T{entry.turn}
                    </div>
                    <div className="flex-1">
                      <Badge 
                        variant={
                          entry.type === 'milestone' 
                            ? 'default' 
                            : entry.type === 'event' 
                            ? 'secondary' 
                            : 'outline'
                        }
                        size="sm"
                        className="mb-1"
                      >
                        {entry.type}
                      </Badge>
                      <p className="text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button
            onClick={resetGame}
            className="flex-1"
            size="lg"
            data-testid="button-play-again"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button
            variant="outline"
            onClick={resetGame}
            className="flex-1"
            size="lg"
            data-testid="button-change-scenario"
          >
            Change Scenario
          </Button>
        </div>
      </Card>
    </div>
  );
}
