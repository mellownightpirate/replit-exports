/**
 * StoryIntro - Opening cinematic and scenario intro screens
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, SkipForward } from 'lucide-react';
import { GAME_TITLE, GAME_TAGLINE, STORY_INTRO, SCENARIO_INTROS } from '@/lib/gameStrings';
import { Mascot } from './Mascot';

interface StoryIntroProps {
  onComplete: () => void;
  scenarioId?: string;
}

export function StoryIntro({ onComplete, scenarioId }: StoryIntroProps) {
  // If we have a scenario ID, start directly on scenario stage (skip opening for scenario-specific intros)
  const hasScenario = scenarioId && SCENARIO_INTROS[scenarioId];
  const [stage, setStage] = useState<'opening' | 'scenario'>(hasScenario ? 'scenario' : 'opening');
  
  const handleNext = () => {
    if (stage === 'opening' && hasScenario) {
      setStage('scenario');
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  if (stage === 'scenario' && hasScenario) {
    const scenarioInfo = SCENARIO_INTROS[scenarioId];
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
        data-testid="scenario-intro"
      >
        <Card className="max-w-2xl w-full p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <Mascot expression="normal" size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{scenarioInfo.title}</h2>
              <p className="text-sm text-muted-foreground">{GAME_TITLE}</p>
            </div>
          </div>
          
          <p className="text-base text-foreground leading-relaxed mb-8">
            {scenarioInfo.intro}
          </p>
          
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button onClick={handleNext} data-testid="button-start-mission">
              Begin Mission
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Opening cinematic
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background"
      data-testid="story-intro"
    >
      <Card className="max-w-3xl w-full p-8 shadow-xl">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Mascot expression="normal" size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{GAME_TITLE}</h1>
              <p className="text-sm text-muted-foreground italic">{GAME_TAGLINE}</p>
            </div>
          </div>
        </div>
        
        {/* Story text */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
          {STORY_INTRO.split('\n\n').map((paragraph, i) => (
            <p 
              key={i} 
              className="text-base text-foreground leading-relaxed mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            <SkipForward className="w-4 h-4 mr-2" />
            Skip Story
          </Button>
          <Button onClick={handleNext} data-testid="button-continue-story">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
