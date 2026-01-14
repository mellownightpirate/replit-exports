/**
 * TutorialOverlay - Step-by-step tutorial for new players
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronRight, 
  X, 
  Target,
  MousePointer,
  Zap,
  Trophy,
  HelpCircle,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { GAME_TITLE, MASCOT_NAME } from '@/lib/gameStrings';
import { MascotAuto } from './Mascot';

const TUTORIAL_STEPS = [
  {
    title: `Welcome to ${GAME_TITLE}`,
    description: `${MASCOT_NAME} here. You are the newly appointed Data and Analytics Solutions Architect. Your mission: unify the enterprise data estate, build stakeholder trust, and prove value before time runs out.`,
    icon: HelpCircle,
    highlight: null,
  },
  {
    title: 'Your Objectives',
    description: 'Check the left panel to see your win conditions. You need to reach specific targets for Adoption, Trust, Governance, Reliability, Latency, and Cost by Turn 12.',
    icon: Target,
    highlight: 'left',
  },
  {
    title: 'Select Nodes',
    description: 'Click on nodes in the map to select them. Each node represents a part of your data estate - Business Units, Applications, Data Platforms, and Domains.',
    icon: MousePointer,
    highlight: 'center',
  },
  {
    title: 'Take Actions',
    description: 'With a node selected, use the right panel to deploy capabilities or take other actions. You have 2 actions per turn. Choose wisely!',
    icon: Zap,
    highlight: 'right',
  },
  {
    title: 'Win the Game',
    description: 'End your turn when ready. Events may occur that require decisions. Balance speed vs. governance to win. Watch out for critical thresholds that can cause instant defeat!',
    icon: Trophy,
    highlight: null,
  },
];

export function TutorialOverlay() {
  const showTutorial = useGameStore((state) => state.showTutorial);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const phase = useGameStore((state) => state.phase);
  const nextTutorialStep = useGameStore((state) => state.nextTutorialStep);
  const skipTutorial = useGameStore((state) => state.skipTutorial);
  
  if (!showTutorial || phase !== 'playing') {
    return null;
  }
  
  const step = TUTORIAL_STEPS[tutorialStep];
  const Icon = step.icon;
  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;
  
  return (
    <div 
      className="fixed inset-0 z-40 pointer-events-none"
      data-testid="tutorial-overlay"
    >
      {/* Spotlight overlay */}
      <div className="absolute inset-0 bg-background/60">
        {/* Cutouts for highlighted areas */}
        {step.highlight === 'left' && (
          <div className="absolute left-0 top-20 bottom-0 w-64 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
        )}
        {step.highlight === 'center' && (
          <div className="absolute left-64 right-80 top-20 bottom-0 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
        )}
        {step.highlight === 'right' && (
          <div className="absolute right-0 top-20 bottom-0 w-80 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
        )}
      </div>
      
      {/* Tutorial card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <Card className="max-w-md w-full mx-4 p-6 shadow-xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipTutorial}
              className="w-8 h-8"
              data-testid="button-skip-tutorial"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex items-start gap-4 mb-6">
            {tutorialStep === 0 ? (
              <MascotAuto size="lg" className="flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === tutorialStep
                    ? 'bg-primary'
                    : i < tutorialStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={skipTutorial}
            >
              Skip Tutorial
            </Button>
            <Button
              className="flex-1"
              onClick={nextTutorialStep}
              data-testid="button-next-tutorial"
            >
              {isLastStep ? 'Start Playing' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
