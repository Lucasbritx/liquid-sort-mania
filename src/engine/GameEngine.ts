/**
 * GameEngine.ts
 * 
 * Pure game logic - no React, no side effects
 * Handles all game mechanics including:
 * - Move validation
 * - Pour logic
 * - Win detection
 * - Undo stack management
 * - Level generation
 */

import type { Bottle, GameState, Move, LiquidColor, LevelConfig } from '../types';

/** Maximum layers per bottle */
export const MAX_LAYERS = 4;

/** Available liquid colors */
export const COLORS: LiquidColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'cyan'
];

/** Color to CSS class/hex mapping */
export const COLOR_MAP: Record<LiquidColor, string> = {
  red: '#FF6B6B',
  orange: '#FFA94D',
  yellow: '#FFD93D',
  green: '#6BCB77',
  blue: '#4ECDC4',
  purple: '#9B5DE5',
  pink: '#F15BB5',
  cyan: '#00BBF9',
};

/**
 * Get the top color of a bottle
 */
export function getTopColor(bottle: Bottle): LiquidColor | null {
  if (bottle.length === 0) return null;
  return bottle[bottle.length - 1];
}

/**
 * Get the count of contiguous top color segments
 * e.g., ['red', 'red', 'blue', 'blue'] returns 2 (two blues on top)
 */
export function getTopSegmentCount(bottle: Bottle): number {
  if (bottle.length === 0) return 0;
  
  const topColor = bottle[bottle.length - 1];
  let count = 0;
  
  for (let i = bottle.length - 1; i >= 0; i--) {
    if (bottle[i] === topColor) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

/**
 * Check if a bottle is complete (all same color, 4 layers)
 */
export function isBottleComplete(bottle: Bottle): boolean {
  if (bottle.length !== MAX_LAYERS) return false;
  const firstColor = bottle[0];
  return bottle.every(color => color === firstColor);
}

/**
 * Check if a bottle is empty
 */
export function isBottleEmpty(bottle: Bottle): boolean {
  return bottle.length === 0;
}

/**
 * Check if a pour is valid from source to target
 */
export function isValidPour(source: Bottle, target: Bottle): boolean {
  // Can't pour from empty bottle
  if (source.length === 0) return false;
  
  // Can't pour to full bottle
  if (target.length >= MAX_LAYERS) return false;
  
  // Can pour to empty bottle
  if (target.length === 0) return true;
  
  // Can only pour if colors match
  const sourceTopColor = getTopColor(source);
  const targetTopColor = getTopColor(target);
  
  if (sourceTopColor !== targetTopColor) return false;
  
  // Check if there's enough space for at least one layer
  const sourceSegmentCount = getTopSegmentCount(source);
  const targetSpace = MAX_LAYERS - target.length;
  
  // At least one layer must be able to transfer
  return targetSpace >= 1 && sourceSegmentCount >= 1;
}

/**
 * Calculate how many layers will be poured
 */
export function calculatePourCount(source: Bottle, target: Bottle): number {
  if (!isValidPour(source, target)) return 0;
  
  const sourceSegmentCount = getTopSegmentCount(source);
  const targetSpace = MAX_LAYERS - target.length;
  
  return Math.min(sourceSegmentCount, targetSpace);
}

/**
 * Execute a pour and return the new state
 * Returns null if pour is invalid
 */
export function executePour(
  state: GameState, 
  fromIndex: number, 
  toIndex: number
): { newState: GameState; move: Move } | null {
  const source = state[fromIndex];
  const target = state[toIndex];
  
  if (!isValidPour(source, target)) return null;
  
  const pourCount = calculatePourCount(source, target);
  const topColor = getTopColor(source)!;
  
  // Create new state (immutable)
  const newState = state.map((bottle, index) => {
    if (index === fromIndex) {
      // Remove layers from source
      return bottle.slice(0, bottle.length - pourCount);
    }
    if (index === toIndex) {
      // Add layers to target
      return [...bottle, ...Array(pourCount).fill(topColor)];
    }
    return [...bottle];
  });
  
  const move: Move = {
    from: fromIndex,
    to: toIndex,
    color: topColor,
    count: pourCount,
  };
  
  return { newState, move };
}

/**
 * Undo a move and return the previous state
 */
export function undoMove(state: GameState, move: Move): GameState {
  return state.map((bottle, index) => {
    if (index === move.to) {
      // Remove layers from target
      return bottle.slice(0, bottle.length - move.count);
    }
    if (index === move.from) {
      // Add layers back to source
      return [...bottle, ...Array(move.count).fill(move.color)];
    }
    return [...bottle];
  });
}

/**
 * Check if the game is won
 * Win condition: each bottle is either empty or complete (single color, full)
 */
export function checkWin(state: GameState): boolean {
  return state.every(bottle => 
    isBottleEmpty(bottle) || isBottleComplete(bottle)
  );
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a solvable level
 * Strategy: Start from a solved state and shuffle backwards
 */
export function generateLevel(config: LevelConfig): GameState {
  const { numColors, emptyBottles } = config;
  
  // Select colors for this level
  const selectedColors = shuffleArray(COLORS).slice(0, numColors);
  
  // Create all liquid layers (4 of each color)
  const allLayers: LiquidColor[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < MAX_LAYERS; i++) {
      allLayers.push(color);
    }
  }
  
  // Shuffle all layers
  const shuffledLayers = shuffleArray(allLayers);
  
  // Distribute into bottles
  const bottles: GameState = [];
  for (let i = 0; i < numColors; i++) {
    const startIdx = i * MAX_LAYERS;
    bottles.push(shuffledLayers.slice(startIdx, startIdx + MAX_LAYERS));
  }
  
  // Add empty bottles
  for (let i = 0; i < emptyBottles; i++) {
    bottles.push([]);
  }
  
  // Verify it's not already solved (very rare but possible)
  if (checkWin(bottles)) {
    return generateLevel(config);
  }
  
  return bottles;
}

/**
 * Get level configuration based on level number
 */
export function getLevelConfig(level: number): LevelConfig {
  // Progressive difficulty
  if (level <= 3) {
    return { numColors: 4, emptyBottles: 2 };
  } else if (level <= 6) {
    return { numColors: 5, emptyBottles: 2 };
  } else if (level <= 10) {
    return { numColors: 6, emptyBottles: 2 };
  } else if (level <= 15) {
    return { numColors: 7, emptyBottles: 2 };
  } else {
    return { numColors: 8, emptyBottles: 2 };
  }
}

/**
 * Create a new game for a specific level
 */
export function createGame(level: number): GameState {
  const config = getLevelConfig(level);
  return generateLevel(config);
}

/**
 * Deep clone game state
 */
export function cloneState(state: GameState): GameState {
  return state.map(bottle => [...bottle]);
}

/**
 * Validate game state integrity
 */
export function validateState(state: GameState): boolean {
  // Check each bottle has at most MAX_LAYERS
  for (const bottle of state) {
    if (bottle.length > MAX_LAYERS) return false;
    // Check all colors are valid
    for (const color of bottle) {
      if (!COLORS.includes(color)) return false;
    }
  }
  return true;
}

/**
 * Get all valid moves from current state
 * Useful for hint system or AI
 */
export function getValidMoves(state: GameState): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  
  for (let from = 0; from < state.length; from++) {
    for (let to = 0; to < state.length; to++) {
      if (from !== to && isValidPour(state[from], state[to])) {
        moves.push({ from, to });
      }
    }
  }
  
  return moves;
}

/**
 * Check if game is stuck (no valid moves)
 */
export function isGameStuck(state: GameState): boolean {
  return getValidMoves(state).length === 0 && !checkWin(state);
}
