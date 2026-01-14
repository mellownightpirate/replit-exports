/**
 * Zustand store for Data Architect
 * Manages all game state with localStorage persistence and undo support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GameState, 
  Scenario, 
  ActionType, 
  EventCard,
  TimelineEntry,
  ActiveEvent,
} from './gameTypes';
import { createRNG } from './rng';
import { SCENARIOS, generateNodes, generateEdges } from './scenarios';
import { drawEvent } from './events';
import { applyAction, resolveTurn, checkWin, checkLose } from './simulation';

// Undo snapshot - stores state before each action
interface UndoSnapshot {
  nodes: GameState['nodes'];
  metrics: GameState['metrics'];
  actionsRemaining: number;
  actionsThisTurn: ActionType[];
  timeline: TimelineEntry[];
  forcedAction: ActionType | null;
  recentTuning: number[];
}

// Initial state before any game starts
const initialState: GameState = {
  phase: 'scenario-select',
  seed: Date.now(),
  scenario: null,
  currentTurn: 1,
  maxTurns: 12,
  actionsRemaining: 2,
  actionsPerTurn: 2,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  metrics: {
    adoption: 0,
    trust: 0,
    latency: 0,
    cost: 0,
    governanceCoverage: 0,
    reliability: 0,
    politicalCapital: 0,
    supportLoad: 0,
  },
  activeEvent: null,
  eventHistory: [],
  forcedAction: null,
  timeline: [],
  actionsThisTurn: [],
  recentTuning: [],
  showTutorial: true,
  showStoryIntro: true,
  tutorialStep: 0,
  loseReason: null,
  // Undo support
  undoStack: [],
};

interface GameActions {
  // Game flow
  startGame: (scenarioId: string) => void;
  resetGame: () => void;
  
  // Turn actions
  selectNode: (nodeId: string | null) => void;
  performAction: (actionType: ActionType, targetNodeId?: string) => void;
  undoLastAction: () => void;
  endTurn: () => void;
  
  // Event handling
  resolveEvent: (choiceId: string) => void;
  
  // Tutorial and story
  nextTutorialStep: () => void;
  skipTutorial: () => void;
  skipStoryIntro: () => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startGame: (scenarioId: string) => {
        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) return;
        
        const seed = Date.now();
        const nodes = generateNodes(scenario, seed);
        const edges = generateEdges(nodes, seed);
        
        set({
          phase: 'playing',
          seed,
          scenario,
          currentTurn: 1,
          maxTurns: 12,
          actionsRemaining: 2,
          actionsPerTurn: 2,
          nodes,
          edges,
          selectedNodeId: null,
          metrics: { ...scenario.initialMetrics },
          activeEvent: null,
          eventHistory: [],
          forcedAction: null,
          timeline: [{
            turn: 0,
            type: 'milestone',
            title: 'Game Started',
            description: `Scenario: ${scenario.name}`,
          }],
          actionsThisTurn: [],
          recentTuning: [],
          loseReason: null,
          undoStack: [], // Fresh undo stack for new game
        });
      },
      
      resetGame: () => {
        set({
          ...initialState,
          seed: Date.now(),
          showTutorial: get().showTutorial,
          tutorialStep: 0,
        });
      },
      
      selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },
      
      performAction: (actionType: ActionType, targetNodeId?: string) => {
        const state = get();
        
        if (state.actionsRemaining <= 0) return;
        if (state.phase !== 'playing') return;
        
        // Save snapshot for undo BEFORE applying action
        const snapshot = {
          nodes: structuredClone(state.nodes),
          metrics: structuredClone(state.metrics),
          actionsRemaining: state.actionsRemaining,
          actionsThisTurn: [...state.actionsThisTurn],
          timeline: [...state.timeline],
          forcedAction: state.forcedAction,
          recentTuning: [...state.recentTuning],
        };
        
        const updates = applyAction(state, actionType, targetNodeId);
        set({
          ...updates,
          undoStack: [...state.undoStack, snapshot],
        } as Partial<GameState>);
        
        // Check for lose condition after action
        const newState = get();
        const loseReason = checkLose(newState);
        if (loseReason) {
          set({ 
            phase: 'lost', 
            loseReason,
            timeline: [
              ...newState.timeline,
              {
                turn: newState.currentTurn,
                type: 'milestone' as const,
                title: 'Game Over',
                description: loseReason,
              },
            ],
          });
        }
      },
      
      undoLastAction: () => {
        const state = get();
        
        // Can only undo during playing phase with snapshots available
        if (state.phase !== 'playing') return;
        if (state.undoStack.length === 0) return;
        
        const snapshot = state.undoStack[state.undoStack.length - 1];
        const newStack = state.undoStack.slice(0, -1);
        
        set({
          nodes: snapshot.nodes,
          metrics: snapshot.metrics,
          actionsRemaining: snapshot.actionsRemaining,
          actionsThisTurn: snapshot.actionsThisTurn,
          timeline: snapshot.timeline,
          forcedAction: snapshot.forcedAction,
          recentTuning: snapshot.recentTuning,
          undoStack: newStack,
        });
      },
      
      endTurn: () => {
        const state = get();
        if (state.phase !== 'playing') return;
        
        // Can't end turn with forced action pending
        if (state.forcedAction && !state.actionsThisTurn.includes(state.forcedAction)) {
          return;
        }
        
        // Resolve turn (calculate metric changes) and clear undo stack for new turn
        const turnUpdates = resolveTurn(state);
        set({
          ...turnUpdates,
          undoStack: [], // Clear undo stack at turn end
        } as Partial<GameState>);
        
        const newState = get();
        
        // Check win condition first
        if (checkWin(newState)) {
          set({
            phase: 'won',
            timeline: [
              ...newState.timeline,
              {
                turn: newState.currentTurn,
                type: 'milestone' as const,
                title: 'Victory!',
                description: 'All objectives achieved',
              },
            ],
          });
          return;
        }
        
        // Check lose condition
        const loseReason = checkLose(newState);
        if (loseReason) {
          set({
            phase: 'lost',
            loseReason,
            timeline: [
              ...newState.timeline,
              {
                turn: newState.currentTurn,
                type: 'milestone' as const,
                title: 'Game Over',
                description: loseReason,
              },
            ],
          });
          return;
        }
        
        // Draw event based on scenario frequency
        const scenario = newState.scenario;
        if (scenario && newState.currentTurn % scenario.eventFrequency === 0) {
          const rng = createRNG(newState.seed + newState.currentTurn);
          const event = drawEvent(newState, rng);
          
          if (event) {
            set({
              phase: 'event',
              activeEvent: {
                card: event,
                turnDrawn: newState.currentTurn,
              },
            });
          }
        }
      },
      
      resolveEvent: (choiceId: string) => {
        const state = get();
        if (!state.activeEvent) return;
        
        const choice = state.activeEvent.card.choices.find(c => c.id === choiceId);
        if (!choice) return;
        
        // Apply choice effects
        const effects = choice.effect(state);
        
        // Add to timeline
        const timelineEntry: TimelineEntry = {
          turn: state.currentTurn,
          type: 'event',
          title: state.activeEvent.card.title,
          description: choice.label,
        };
        
        set({
          ...effects,
          phase: 'playing',
          activeEvent: null,
          eventHistory: [...state.eventHistory, state.activeEvent.card.id],
          timeline: [...state.timeline, timelineEntry],
        } as Partial<GameState>);
        
        // Check for lose after event
        const newState = get();
        const loseReason = checkLose(newState);
        if (loseReason) {
          set({
            phase: 'lost',
            loseReason,
            timeline: [
              ...newState.timeline,
              {
                turn: newState.currentTurn,
                type: 'milestone' as const,
                title: 'Game Over',
                description: loseReason,
              },
            ],
          });
        }
      },
      
      nextTutorialStep: () => {
        const state = get();
        if (state.tutorialStep >= 4) {
          set({ showTutorial: false, tutorialStep: 0 });
        } else {
          set({ tutorialStep: state.tutorialStep + 1 });
        }
      },
      
      skipTutorial: () => {
        set({ showTutorial: false, tutorialStep: 0 });
      },
      
      skipStoryIntro: () => {
        set({ showStoryIntro: false });
      },
    }),
    {
      name: 'data-architect-save',
      partialize: (state) => ({
        phase: state.phase,
        seed: state.seed,
        scenario: state.scenario,
        currentTurn: state.currentTurn,
        maxTurns: state.maxTurns,
        actionsRemaining: state.actionsRemaining,
        actionsPerTurn: state.actionsPerTurn,
        nodes: state.nodes,
        edges: state.edges,
        metrics: state.metrics,
        eventHistory: state.eventHistory,
        forcedAction: state.forcedAction,
        timeline: state.timeline,
        recentTuning: state.recentTuning,
        showTutorial: state.showTutorial,
        showStoryIntro: state.showStoryIntro,
        loseReason: state.loseReason,
        undoStack: state.undoStack,
      }),
    }
  )
);
