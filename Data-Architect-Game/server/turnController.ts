/**
 * Data Architect - Turn Controller
 * Server-side turn management and resolution
 */

import { storage } from './storage';
import { Server as SocketIOServer } from 'socket.io';
import {
  initializeMultiplayerGame,
  resolveTurn as resolveSimulation,
  getAvailableActions,
} from '../shared/multiplayerSimulation';
import type {
  MultiplayerGameState,
  PlannedAction as SimPlannedAction,
} from '../shared/multiplayerTypes';

let io: SocketIOServer | null = null;

export function setSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

/**
 * Start a new game in a room
 */
export async function startGame(roomId: string, scenarioId: string): Promise<MultiplayerGameState> {
  const room = await storage.getRoomById(roomId);
  if (!room) throw new Error('Room not found');
  
  const players = await storage.getPlayersByRoomId(roomId);
  if (players.length !== 2) throw new Error('Need 2 players to start');
  
  // Initialize game state
  const seed = Date.now();
  const gameState = initializeMultiplayerGame(scenarioId, seed);
  
  // Store initial state
  await storage.saveGameState(roomId, gameState, 1);
  
  // Update room status and phase (sync with simulation state)
  await storage.updateRoomStatus(roomId, 'playing');
  await storage.updateRoomPhase(roomId, 'planning');
  
  // Create initial turn record
  await storage.createTurn(roomId, 1);
  
  // Broadcast game start with phase
  if (io) {
    io.to(roomId).emit('game-started', { gameState, phase: 'planning' });
    io.to(roomId).emit('phase-change', { phase: 'planning', turn: 1 });
  }
  
  return gameState;
}

/**
 * Submit planned actions for a player
 */
export async function submitActions(
  roomId: string,
  userId: string,
  actions: { actionType: string; targetNodeId?: string; parameters?: Record<string, any> }[]
): Promise<{ success: boolean; waitingForOpponent: boolean }> {
  const room = await storage.getRoomById(roomId);
  if (!room) throw new Error('Room not found');
  
  const player = await storage.getPlayerByRoomAndUser(roomId, userId);
  if (!player) throw new Error('Player not found');
  
  const gameStateRecord = await storage.getGameState(roomId);
  if (!gameStateRecord) throw new Error('No game state');
  
  const gameState = gameStateRecord.stateJson as MultiplayerGameState;
  const turnNumber = gameState.currentTurn;
  
  // Submit planned action
  await storage.submitPlannedAction(
    roomId,
    turnNumber,
    userId,
    player.role,
    actions
  );
  
  // Check if both players have submitted
  const plannedActions = await storage.getPlannedActions(roomId, turnNumber);
  
  if (plannedActions.length === 2) {
    // Both players submitted - resolve turn
    await resolveTurnForRoom(roomId, turnNumber, gameState, plannedActions);
    return { success: true, waitingForOpponent: false };
  }
  
  // Notify other player that opponent submitted
  if (io) {
    io.to(roomId).emit('player-submitted', { role: player.role });
  }
  
  return { success: true, waitingForOpponent: true };
}

/**
 * Resolve a turn when both players have submitted
 */
async function resolveTurnForRoom(
  roomId: string,
  turnNumber: number,
  gameState: MultiplayerGameState,
  plannedActions: any[]
): Promise<void> {
  // Separate actions by role
  const architectActionRecord = plannedActions.find(p => p.role === 'ARCHITECT');
  const prospectActionRecord = plannedActions.find(p => p.role === 'PROSPECT');
  
  const architectActions: SimPlannedAction[] = (architectActionRecord?.actionsJson || []).map((a: any, i: number) => ({
    id: `arch-${turnNumber}-${i}`,
    playerId: architectActionRecord.userId,
    role: 'ARCHITECT' as const,
    actionType: a.actionType,
    targetNodeId: a.targetNodeId,
    parameters: a.parameters,
  }));
  
  const prospectActions: SimPlannedAction[] = (prospectActionRecord?.actionsJson || []).map((a: any, i: number) => ({
    id: `pros-${turnNumber}-${i}`,
    playerId: prospectActionRecord.userId,
    role: 'PROSPECT' as const,
    actionType: a.actionType,
    targetNodeId: a.targetNodeId,
    parameters: a.parameters,
  }));
  
  // Resolve the turn using simulation engine
  const result = resolveSimulation(gameState, architectActions, prospectActions);
  
  // Store turn result
  await storage.saveTurnResult(roomId, turnNumber, result);
  
  // Log actions
  for (const actionResult of result.actionResults) {
    await storage.logAction(roomId, turnNumber, 
      architectActions.some(a => a.id === actionResult.actionId) ? 'ARCHITECT' : 'PROSPECT',
      actionResult
    );
  }
  
  // Update game state
  await storage.saveGameState(roomId, result.newState, turnNumber + 1);
  
  // Mark turn as resolved
  await storage.resolveTurn(roomId, turnNumber);
  
  // Update room phase
  await storage.updateRoomPhase(roomId, 'review', result.newState.currentTurn);
  
  // Broadcast turn resolution
  if (io) {
    io.to(roomId).emit('turn-resolved', {
      turnNumber,
      result: {
        summary: result.turnSummary,
        actionResults: result.actionResults,
        newState: result.newState,
      },
    });
  }
  
  // Check if game is over
  if (result.newState.gameOver) {
    await storage.updateRoomStatus(roomId, 'finished');
    if (io) {
      io.to(roomId).emit('game-over', {
        winner: result.newState.winner,
        reason: result.newState.endReason,
      });
    }
  } else {
    // Start next turn after a delay (for review)
    setTimeout(async () => {
      await startNextTurn(roomId, result.newState);
    }, 3000); // 3 second review phase
  }
}

/**
 * Start the next turn
 */
async function startNextTurn(roomId: string, gameState: MultiplayerGameState): Promise<void> {
  if (gameState.gameOver) return;
  
  // Clear planned actions from previous turn
  await storage.clearPlannedActions(roomId, gameState.currentTurn - 1);
  
  // Create new turn record
  await storage.createTurn(roomId, gameState.currentTurn);
  
  // Update room phase
  await storage.updateRoomPhase(roomId, 'planning', gameState.currentTurn);
  
  // Broadcast new turn
  if (io) {
    io.to(roomId).emit('phase-change', {
      turnNumber: gameState.currentTurn,
      phase: 'planning',
      gameState,
    });
  }
}

/**
 * Get current room state for a player
 */
export async function getRoomStateForPlayer(
  roomId: string,
  userId: string
): Promise<{
  room: any;
  player: any;
  players: any[];
  gameState: MultiplayerGameState | null;
  myPlannedAction: any;
  opponentSubmitted: boolean;
  availableActions: string[];
} | null> {
  const room = await storage.getRoomById(roomId);
  if (!room) return null;
  
  const players = await storage.getPlayersByRoomId(roomId);
  const player = players.find(p => p.userId === userId);
  if (!player) return null;
  
  const gameStateRecord = await storage.getGameState(roomId);
  const gameState = gameStateRecord?.stateJson as MultiplayerGameState | null;
  
  let myPlannedAction = null;
  let opponentSubmitted = false;
  let availableActions: string[] = [];
  
  if (gameState) {
    const plannedActions = await storage.getPlannedActions(roomId, gameState.currentTurn);
    myPlannedAction = plannedActions.find(a => a.userId === userId) || null;
    opponentSubmitted = plannedActions.some(a => a.userId !== userId);
    
    if (player.role) {
      availableActions = getAvailableActions(
        gameState,
        player.role as 'ARCHITECT' | 'PROSPECT'
      );
    }
  }
  
  return {
    room: {
      id: room.id,
      code: room.code,
      scenarioId: room.scenarioId,
      status: room.status,
      currentTurn: gameState?.currentTurn || 1,
      phase: room.phase,
    },
    player: {
      id: player.id,
      role: player.role,
    },
    players: players.map(p => ({
      id: p.id,
      role: p.role,
    })),
    gameState,
    myPlannedAction,
    opponentSubmitted,
    availableActions,
  };
}
