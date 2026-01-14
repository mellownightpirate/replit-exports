/**
 * EventModal - Modal for event cards and player choices
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Zap } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { TURN_FLAVOUR } from '@/lib/gameStrings';
import { MascotAuto } from './Mascot';

export function EventModal() {
  const activeEvent = useGameStore((state) => state.activeEvent);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const resolveEvent = useGameStore((state) => state.resolveEvent);
  const phase = useGameStore((state) => state.phase);
  
  if (phase !== 'event' || !activeEvent) {
    return null;
  }
  
  const { card } = activeEvent;
  
  // Get flavour text for this turn
  const flavourText = TURN_FLAVOUR[(currentTurn - 1) % TURN_FLAVOUR.length];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="event-modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Modal content */}
      <Card className="relative max-w-2xl w-full p-8 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Mascot narrator */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <MascotAuto size="lg" />
        </div>
        
        {/* Turn flavour text */}
        <p className="text-center text-xs italic text-muted-foreground mt-6 mb-4">
          {flavourText}
        </p>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 
            className="text-2xl font-bold text-foreground mb-2"
            data-testid="text-event-title"
          >
            {card.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {card.description}
          </p>
        </div>
        
        {/* Choices */}
        <div className="space-y-3">
          {card.choices.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              className="w-full h-auto py-4 px-6 justify-start text-left"
              onClick={() => resolveEvent(choice.id)}
              data-testid={`button-choice-${choice.id}`}
            >
              <div className="w-full">
                <p className="font-semibold text-foreground text-base">
                  {choice.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {choice.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Warning footer */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>Choose carefully - this decision cannot be undone.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
