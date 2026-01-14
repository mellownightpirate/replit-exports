/**
 * ScenarioSelector - Choose a scenario to start the game
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Shield, 
  Building2,
  TrendingUp,
  Scale,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { SCENARIOS } from '@/lib/scenarios';
import type { ScenarioId } from '@/lib/gameTypes';
import { GAME_TITLE, GAME_SUBTITLE, GAME_TAGLINE, SCENARIO_INTROS } from '@/lib/gameStrings';
import { Mascot } from './Mascot';
import { StoryIntro } from './StoryIntro';

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  'speed-to-value': Rocket,
  'governance-first': Shield,
  'scale-out': Building2,
};

const SCENARIO_COLORS: Record<ScenarioId, string> = {
  'speed-to-value': 'bg-chart-1',
  'governance-first': 'bg-chart-2',
  'scale-out': 'bg-chart-3',
};

export function ScenarioSelector() {
  const phase = useGameStore((state) => state.phase);
  const showStoryIntro = useGameStore((state) => state.showStoryIntro);
  const skipStoryIntro = useGameStore((state) => state.skipStoryIntro);
  const startGame = useGameStore((state) => state.startGame);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  
  if (phase !== 'scenario-select') {
    return null;
  }
  
  // Show story intro first if not skipped
  if (showStoryIntro) {
    return (
      <StoryIntro 
        onComplete={skipStoryIntro} 
        scenarioId={selectedScenario || undefined}
      />
    );
  }
  
  // If scenario selected, show scenario intro then start
  if (selectedScenario) {
    return (
      <StoryIntro 
        onComplete={() => startGame(selectedScenario)} 
        scenarioId={selectedScenario}
      />
    );
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background"
      data-testid="scenario-selector"
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mascot expression="normal" size="lg" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {GAME_TITLE}
              </h1>
              <p className="text-sm text-muted-foreground">
                {GAME_SUBTITLE}
              </p>
            </div>
          </div>
          <p className="text-base italic text-muted-foreground mb-4">{GAME_TAGLINE}</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build and scale an enterprise analytics platform. Balance adoption, trust, 
            and governance to win. Choose your starting scenario:
          </p>
        </div>
        
        {/* Scenario cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {SCENARIOS.map((scenario) => {
            const Icon = SCENARIO_ICONS[scenario.id];
            const colorClass = SCENARIO_COLORS[scenario.id];
            
            return (
              <Card 
                key={scenario.id}
                className="p-6 hover-elevate cursor-pointer transition-all group"
                onClick={() => setSelectedScenario(scenario.id)}
                data-testid={`card-scenario-${scenario.id}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Title and description */}
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {scenario.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {scenario.description}
                </p>
                
                {/* Starting stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Adoption
                    </span>
                    <span className="font-mono font-medium">
                      {scenario.initialMetrics.adoption}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      Trust
                    </span>
                    <span className="font-mono font-medium">
                      {scenario.initialMetrics.trust}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Scale className="w-3 h-3" />
                      Governance
                    </span>
                    <span className="font-mono font-medium">
                      {scenario.initialMetrics.governanceCoverage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      Latency
                    </span>
                    <span className="font-mono font-medium">
                      {scenario.initialMetrics.latency}ms
                    </span>
                  </div>
                </div>
                
                {/* Difficulty badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {scenario.nodeCount} nodes
                  </Badge>
                  <Badge variant="outline" size="sm">
                    Event every {scenario.eventFrequency} turn{scenario.eventFrequency > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Scenario intro preview */}
                {SCENARIO_INTROS[scenario.id] && (
                  <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2">
                    {SCENARIO_INTROS[scenario.id].intro.slice(0, 100)}...
                  </p>
                )}
                
                {/* Play button */}
                <Button 
                  className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScenario(scenario.id);
                  }}
                >
                  Play
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            );
          })}
        </div>
        
        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            12 turns to reach your objectives. Watch your metrics - if Trust, Reliability, 
            or Political Capital drop too low, you lose immediately!
          </p>
        </div>
      </div>
    </div>
  );
}
