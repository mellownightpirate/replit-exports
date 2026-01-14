/**
 * Game Page - Main game interface
 */

import { MetricsBar } from '@/components/game/MetricsBar';
import { MapGraph } from '@/components/game/MapGraph';
import { TurnPanel } from '@/components/game/TurnPanel';
import { NodePanel } from '@/components/game/NodePanel';
import { EventModal } from '@/components/game/EventModal';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { EndScreen } from '@/components/game/EndScreen';
import { ScenarioSelector } from '@/components/game/ScenarioSelector';
import { useGameStore } from '@/lib/gameStore';

export default function GamePage() {
  const phase = useGameStore((state) => state.phase);
  
  // Show scenario selector when not in game
  if (phase === 'scenario-select') {
    return <ScenarioSelector />;
  }
  
  return (
    <div className="h-screen flex flex-col bg-background" data-testid="game-page">
      {/* Top metrics bar */}
      <MetricsBar />
      
      {/* Main game area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Turn info */}
        <TurnPanel />
        
        {/* Center - Map graph */}
        <div className="flex-1 flex flex-col p-4">
          <MapGraph />
        </div>
        
        {/* Right panel - Node details */}
        <NodePanel />
      </div>
      
      {/* Overlays */}
      <TutorialOverlay />
      <EventModal />
      <EndScreen />
    </div>
  );
}
