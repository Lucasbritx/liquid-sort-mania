/**
 * GameEngine.ts
 * 
 * Advanced modular game engine for Liquid Sort Mania
 * 
 * Supports:
 * - Weighted liquids (heavier cannot pour on lighter)
 * - Frozen liquids (must unlock before pouring)
 * - Corrupted liquids (instant fail if poured wrong)
 * - Mutable liquids (change color after X moves)
 * 
 * Architecture:
 * - Pure functions (no side effects)
 * - Modular mechanics (toggleable per level)
 * - Immutable state updates
 */

import type { 
  Bottle, 
  GameState, 
  Move, 
  LiquidColor, 
  LiquidLayer,
  LevelConfig, 
  LevelMechanics,
  PourResult,
  PourError,
  GameMode,
  ModeConfig,
  GameData,
  RushState,
  ClassicModeConfig,
  ZenModeConfig,
  RushModeConfig,
} from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum layers per bottle */
export const MAX_LAYERS = 4;

/** Available liquid colors */
export const COLORS: LiquidColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'cyan'
];

/** Color to hex mapping */
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

/** Weight values for each color (used when weights mechanic is enabled) */
export const COLOR_WEIGHTS: Record<LiquidColor, number> = {
  cyan: 1,    // Lightest
  yellow: 2,
  pink: 2,
  orange: 3,
  green: 3,
  blue: 4,
  purple: 4,
  red: 5,     // Heaviest
};

// ============================================================================
// MODE CONFIGURATIONS
// ============================================================================

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  classic: {
    mode: 'classic',
    moveLimit: null,
    timeLimit: null,
    theme: 'default',
  } as ClassicModeConfig,
  
  zen: {
    mode: 'zen',
    moveLimit: null,
    timeLimit: null,
    disableMechanics: ['corrupted'],
    theme: 'calm',
  } as ZenModeConfig,
  
  rush: {
    mode: 'rush',
    timeLimit: 60,
    combosEnabled: true,
    baseScore: 100,
    comboMultiplier: 0.5,
    maxCombo: 10,
    theme: 'intense',
  } as RushModeConfig,
};

// ============================================================================
// LAYER UTILITIES
// ============================================================================

/**
 * Create a simple liquid layer (no modifiers)
 */
export function createLayer(color: LiquidColor): LiquidLayer {
  return { color };
}

/**
 * Create a weighted liquid layer
 */
export function createWeightedLayer(color: LiquidColor, weight?: number): LiquidLayer {
  return {
    color,
    modifiers: { weight: weight ?? COLOR_WEIGHTS[color] },
  };
}

/**
 * Create a frozen liquid layer
 */
export function createFrozenLayer(color: LiquidColor, movesToUnlock: number = 3): LiquidLayer {
  return {
    color,
    modifiers: { frozen: true, frozenMovesLeft: movesToUnlock },
  };
}

/**
 * Create a corrupted liquid layer
 */
export function createCorruptedLayer(color: LiquidColor): LiquidLayer {
  return {
    color,
    modifiers: { corrupted: true },
  };
}

/**
 * Create a mutable liquid layer
 */
export function createMutableLayer(
  color: LiquidColor, 
  mutatesTo: LiquidColor, 
  movesUntilMutation: number = 5
): LiquidLayer {
  return {
    color,
    modifiers: { 
      mutable: true, 
      mutatesTo, 
      mutationMovesLeft: movesUntilMutation,
    },
  };
}

/**
 * Get the effective weight of a layer
 */
export function getLayerWeight(layer: LiquidLayer): number {
  return layer.modifiers?.weight ?? COLOR_WEIGHTS[layer.color];
}

/**
 * Check if a layer is frozen
 */
export function isLayerFrozen(layer: LiquidLayer): boolean {
  return layer.modifiers?.frozen === true;
}

/**
 * Check if a layer is corrupted
 */
export function isLayerCorrupted(layer: LiquidLayer): boolean {
  return layer.modifiers?.corrupted === true;
}

/**
 * Check if a layer is mutable
 */
export function isLayerMutable(layer: LiquidLayer): boolean {
  return layer.modifiers?.mutable === true;
}

// ============================================================================
// BOTTLE UTILITIES
// ============================================================================

/**
 * Get the top layer of a bottle
 */
export function getTopLayer(bottle: Bottle): LiquidLayer | null {
  if (bottle.length === 0) return null;
  return bottle[bottle.length - 1];
}

/**
 * Get the top color of a bottle
 */
export function getTopColor(bottle: Bottle): LiquidColor | null {
  const topLayer = getTopLayer(bottle);
  return topLayer?.color ?? null;
}

/**
 * Get the count of contiguous top color segments (ignoring modifiers)
 */
export function getTopSegmentCount(bottle: Bottle): number {
  if (bottle.length === 0) return 0;
  
  const topColor = bottle[bottle.length - 1].color;
  let count = 0;
  
  for (let i = bottle.length - 1; i >= 0; i--) {
    if (bottle[i].color === topColor) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

/**
 * Get the top contiguous layers (same color)
 */
export function getTopSegmentLayers(bottle: Bottle): LiquidLayer[] {
  if (bottle.length === 0) return [];
  
  const topColor = bottle[bottle.length - 1].color;
  const layers: LiquidLayer[] = [];
  
  for (let i = bottle.length - 1; i >= 0; i--) {
    if (bottle[i].color === topColor) {
      layers.unshift(bottle[i]);
    } else {
      break;
    }
  }
  
  return layers;
}

/**
 * Check if a bottle is complete (all same color, 4 layers, no frozen)
 */
export function isBottleComplete(bottle: Bottle): boolean {
  if (bottle.length !== MAX_LAYERS) return false;
  const firstColor = bottle[0].color;
  return bottle.every(layer => 
    layer.color === firstColor && !isLayerFrozen(layer)
  );
}

/**
 * Check if a bottle is empty
 */
export function isBottleEmpty(bottle: Bottle): boolean {
  return bottle.length === 0;
}

/**
 * Check if bottle has any frozen layers on top
 */
export function hasTopFrozenLayers(bottle: Bottle): boolean {
  const topLayer = getTopLayer(bottle);
  return topLayer ? isLayerFrozen(topLayer) : false;
}

// ============================================================================
// POUR VALIDATION (Modular Mechanics)
// ============================================================================

/**
 * Validate pour with all mechanics
 */
export function validatePour(
  source: Bottle, 
  target: Bottle,
  mechanics: LevelMechanics = {}
): { valid: boolean; error?: PourError; gameOver?: boolean } {
  // Basic validations
  if (source.length === 0) {
    return { valid: false, error: 'empty_source' };
  }
  
  if (target.length >= MAX_LAYERS) {
    return { valid: false, error: 'full_target' };
  }
  
  const sourceTopLayer = getTopLayer(source)!;
  const targetTopLayer = getTopLayer(target);
  
  // Check frozen (if enabled)
  if (mechanics.frozen && isLayerFrozen(sourceTopLayer)) {
    return { valid: false, error: 'frozen_source' };
  }
  
  // Can pour to empty bottle (skip color/weight checks)
  if (target.length === 0) {
    return { valid: true };
  }
  
  // Color match check
  if (sourceTopLayer.color !== targetTopLayer!.color) {
    // Check corrupted failure
    if (mechanics.corrupted && isLayerCorrupted(sourceTopLayer)) {
      return { valid: false, error: 'corrupted_failure', gameOver: true };
    }
    return { valid: false, error: 'color_mismatch' };
  }
  
  // Weight check (if enabled) - heavier cannot go on lighter
  if (mechanics.weights) {
    const sourceWeight = getLayerWeight(sourceTopLayer);
    const targetWeight = getLayerWeight(targetTopLayer!);
    
    if (sourceWeight > targetWeight) {
      return { valid: false, error: 'weight_violation' };
    }
  }
  
  return { valid: true };
}

/**
 * Calculate how many layers will be poured
 */
export function calculatePourCount(source: Bottle, target: Bottle): number {
  const validation = validatePour(source, target);
  if (!validation.valid) return 0;
  
  const sourceSegmentCount = getTopSegmentCount(source);
  const targetSpace = MAX_LAYERS - target.length;
  
  return Math.min(sourceSegmentCount, targetSpace);
}

// ============================================================================
// GAME STATE MUTATIONS
// ============================================================================

/**
 * Execute a pour and return the result
 */
export function executePour(
  state: GameState, 
  fromIndex: number, 
  toIndex: number,
  mechanics: LevelMechanics = {}
): PourResult {
  const source = state[fromIndex];
  const target = state[toIndex];
  
  const validation = validatePour(source, target, mechanics);
  
  if (!validation.valid) {
    return { 
      success: false, 
      error: validation.error,
      gameOver: validation.gameOver,
    };
  }
  
  const pourCount = calculatePourCount(source, target);
  const topLayers = getTopSegmentLayers(source).slice(-pourCount);
  
  // Create new state (immutable)
  const newState = state.map((bottle, index) => {
    if (index === fromIndex) {
      // Remove layers from source
      return bottle.slice(0, bottle.length - pourCount);
    }
    if (index === toIndex) {
      // Add layers to target (preserve modifiers except frozen on pour)
      const newLayers = topLayers.map(layer => ({
        ...layer,
        modifiers: layer.modifiers ? {
          ...layer.modifiers,
          // Clear frozen when poured (it was unlocked to pour)
          frozen: false,
          frozenMovesLeft: undefined,
        } : undefined,
      }));
      return [...bottle, ...newLayers];
    }
    return bottle.map(layer => ({ ...layer }));
  });
  
  const move: Move = {
    from: fromIndex,
    to: toIndex,
    layers: topLayers,
    count: pourCount,
  };
  
  return { success: true, newState, move };
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
      // Add layers back to source (restore original modifiers)
      return [...bottle, ...move.layers];
    }
    return bottle.map(layer => ({ ...layer }));
  });
}

/**
 * Process turn-based mechanics (frozen countdown, mutations)
 */
export function processTurnMechanics(
  state: GameState, 
  mechanics: LevelMechanics = {}
): GameState {
  return state.map(bottle => 
    bottle.map(layer => {
      const newLayer = { ...layer };
      
      // Process frozen countdown
      if (mechanics.frozen && layer.modifiers?.frozen) {
        const movesLeft = (layer.modifiers.frozenMovesLeft ?? 1) - 1;
        if (movesLeft <= 0) {
          // Unfreeze
          newLayer.modifiers = {
            ...layer.modifiers,
            frozen: false,
            frozenMovesLeft: undefined,
          };
        } else {
          newLayer.modifiers = {
            ...layer.modifiers,
            frozenMovesLeft: movesLeft,
          };
        }
      }
      
      // Process mutations
      if (mechanics.mutable && layer.modifiers?.mutable) {
        const movesLeft = (layer.modifiers.mutationMovesLeft ?? 1) - 1;
        if (movesLeft <= 0 && layer.modifiers.mutatesTo) {
          // Mutate color
          newLayer.color = layer.modifiers.mutatesTo;
          newLayer.modifiers = {
            ...layer.modifiers,
            mutable: false,
            mutatesTo: undefined,
            mutationMovesLeft: undefined,
          };
        } else {
          newLayer.modifiers = {
            ...layer.modifiers,
            mutationMovesLeft: movesLeft,
          };
        }
      }
      
      return newLayer;
    })
  );
}

// ============================================================================
// WIN/LOSE CONDITIONS
// ============================================================================

/**
 * Check if the game is won
 */
export function checkWin(state: GameState): boolean {
  return state.every(bottle => 
    isBottleEmpty(bottle) || isBottleComplete(bottle)
  );
}

/**
 * Check if game is stuck (no valid moves)
 */
export function isGameStuck(state: GameState, mechanics: LevelMechanics = {}): boolean {
  const validMoves = getValidMoves(state, mechanics);
  return validMoves.length === 0 && !checkWin(state);
}

/**
 * Get all valid moves from current state
 */
export function getValidMoves(
  state: GameState, 
  mechanics: LevelMechanics = {}
): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  
  for (let from = 0; from < state.length; from++) {
    for (let to = 0; to < state.length; to++) {
      if (from !== to) {
        const validation = validatePour(state[from], state[to], mechanics);
        if (validation.valid) {
          moves.push({ from, to });
        }
      }
    }
  }
  
  return moves;
}

// ============================================================================
// LEVEL GENERATION
// ============================================================================

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
 * Apply random modifiers to layers based on level mechanics
 */
function applyRandomModifiers(
  layers: LiquidLayer[], 
  mechanics: LevelMechanics,
  density: number = 0.2
): LiquidLayer[] {
  const enabledMechanics: (keyof LevelMechanics)[] = [];
  if (mechanics.weights) enabledMechanics.push('weights');
  if (mechanics.frozen) enabledMechanics.push('frozen');
  if (mechanics.corrupted) enabledMechanics.push('corrupted');
  if (mechanics.mutable) enabledMechanics.push('mutable');
  
  if (enabledMechanics.length === 0) return layers;
  
  return layers.map(layer => {
    // Random chance to apply modifier
    if (Math.random() > density) return layer;
    
    // Pick random mechanic
    const mechanic = enabledMechanics[Math.floor(Math.random() * enabledMechanics.length)];
    
    switch (mechanic) {
      case 'weights':
        return createWeightedLayer(layer.color);
      case 'frozen':
        return createFrozenLayer(layer.color, Math.floor(Math.random() * 3) + 2);
      case 'corrupted':
        return createCorruptedLayer(layer.color);
      case 'mutable': {
        const otherColors = COLORS.filter(c => c !== layer.color);
        const mutatesTo = otherColors[Math.floor(Math.random() * otherColors.length)];
        return createMutableLayer(layer.color, mutatesTo, Math.floor(Math.random() * 4) + 3);
      }
      default:
        return layer;
    }
  });
}

/**
 * Generate a level with advanced mechanics
 */
export function generateLevel(config: LevelConfig): GameState {
  const { numColors, emptyBottles, mechanics = {}, modifierDensity = 0.15 } = config;
  
  // Use predefined bottles if provided
  if (config.predefinedBottles) {
    return config.predefinedBottles.map(bottle => 
      bottle.map(layer => ({ ...layer }))
    );
  }
  
  // Select colors for this level
  const selectedColors = shuffleArray(COLORS).slice(0, numColors);
  
  // Create all liquid layers (4 of each color)
  let allLayers: LiquidLayer[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < MAX_LAYERS; i++) {
      allLayers.push(createLayer(color));
    }
  }
  
  // Apply modifiers based on mechanics
  allLayers = applyRandomModifiers(allLayers, mechanics, modifierDensity);
  
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
  
  // Verify it's not already solved
  if (checkWin(bottles)) {
    return generateLevel(config);
  }
  
  return bottles;
}

/**
 * Get level configuration based on level number and mode
 */
export function getLevelConfig(level: number, mode: GameMode = 'classic'): LevelConfig {
  // Base difficulty scaling
  let numColors: number;
  let emptyBottles = 2;
  let mechanics: LevelMechanics = {};
  let modifierDensity = 0;
  
  // Color scaling - gradual increase
  if (level <= 2) {
    numColors = 4;
  } else if (level <= 4) {
    numColors = 5;
  } else if (level <= 6) {
    numColors = 6;
  } else if (level <= 10) {
    numColors = 7;
  } else {
    numColors = 8;
  }
  
  // Add mechanics progressively starting at level 3
  // Level 3: Introduce frozen liquids
  if (level >= 3) {
    mechanics.frozen = true;
    modifierDensity = 0.15;
  }
  
  // Level 4: Add corrupted liquids (not in Zen mode)
  if (level >= 4 && mode !== 'zen') {
    mechanics.corrupted = true;
    modifierDensity = 0.20;
  }
  
  // Level 5: Add mutable liquids - full mechanics unlocked
  if (level >= 5) {
    mechanics.mutable = true;
    modifierDensity = 0.25;
  }
  
  // Scale difficulty further at higher levels
  if (level >= 10) {
    modifierDensity = 0.28;
  }
  if (level >= 15) {
    modifierDensity = 0.30; // Cap at 30% to avoid frustration
  }
  
  // Rush mode: slightly easier but faster
  if (mode === 'rush') {
    emptyBottles = 3;
    modifierDensity *= 0.7; // Less modifiers
  }
  
  return { numColors, emptyBottles, mechanics, modifierDensity };
}

// ============================================================================
// GAME CREATION & MANAGEMENT
// ============================================================================

/**
 * Create initial rush state
 */
function createRushState(config: RushModeConfig): RushState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeRemaining: config.timeLimit,
  };
}

/**
 * Create a new game for a specific level and mode
 */
export function createGame(level: number, mode: GameMode = 'classic'): GameData {
  const modeConfig = MODE_CONFIGS[mode];
  const levelConfig = getLevelConfig(level, mode);
  const bottles = generateLevel(levelConfig);
  
  const gameData: GameData = {
    bottles,
    moves: 0,
    undoStack: [],
    level,
    isWin: false,
    isGameOver: false,
    mode,
    modeConfig,
    globalMoveCount: 0,
  };
  
  if (mode === 'rush') {
    gameData.rushState = createRushState(modeConfig as RushModeConfig);
  }
  
  return gameData;
}

/**
 * Update rush mode scoring
 */
export function updateRushScore(
  rushState: RushState, 
  config: RushModeConfig,
  pourSuccess: boolean
): RushState {
  if (!pourSuccess) {
    // Reset combo on failed pour
    return { ...rushState, combo: 0 };
  }
  
  const newCombo = Math.min(rushState.combo + 1, config.maxCombo);
  const multiplier = 1 + (newCombo * config.comboMultiplier);
  const scoreGain = Math.floor(config.baseScore * multiplier);
  
  return {
    ...rushState,
    score: rushState.score + scoreGain,
    combo: newCombo,
    maxCombo: Math.max(rushState.maxCombo, newCombo),
  };
}

/**
 * Deep clone game state
 */
export function cloneState(state: GameState): GameState {
  return state.map(bottle => 
    bottle.map(layer => ({
      ...layer,
      modifiers: layer.modifiers ? { ...layer.modifiers } : undefined,
    }))
  );
}

/**
 * Validate game state integrity
 */
export function validateState(state: GameState): boolean {
  for (const bottle of state) {
    if (bottle.length > MAX_LAYERS) return false;
    for (const layer of bottle) {
      if (!COLORS.includes(layer.color)) return false;
    }
  }
  return true;
}

// ============================================================================
// EXAMPLE LEVELS (Hand-crafted showcases)
// ============================================================================

/**
 * Example level showcasing all mechanics
 */
export const SHOWCASE_LEVELS: Record<string, LevelConfig> = {
  weightedIntro: {
    numColors: 4,
    emptyBottles: 2,
    mechanics: { weights: true },
    predefinedBottles: [
      [
        createWeightedLayer('red', 5),
        createWeightedLayer('blue', 4),
        createWeightedLayer('green', 3),
        createWeightedLayer('yellow', 2),
      ],
      [
        createWeightedLayer('yellow', 2),
        createWeightedLayer('green', 3),
        createWeightedLayer('blue', 4),
        createWeightedLayer('red', 5),
      ],
      [
        createWeightedLayer('green', 3),
        createWeightedLayer('red', 5),
        createWeightedLayer('yellow', 2),
        createWeightedLayer('blue', 4),
      ],
      [
        createWeightedLayer('blue', 4),
        createWeightedLayer('yellow', 2),
        createWeightedLayer('red', 5),
        createWeightedLayer('green', 3),
      ],
      [],
      [],
    ],
  },
  
  frozenChallenge: {
    numColors: 4,
    emptyBottles: 2,
    mechanics: { frozen: true },
    predefinedBottles: [
      [
        createLayer('red'),
        createFrozenLayer('blue', 3),
        createLayer('red'),
        createLayer('green'),
      ],
      [
        createLayer('green'),
        createLayer('blue'),
        createFrozenLayer('red', 2),
        createLayer('yellow'),
      ],
      [
        createLayer('yellow'),
        createLayer('green'),
        createLayer('blue'),
        createFrozenLayer('yellow', 4),
      ],
      [
        createLayer('blue'),
        createLayer('yellow'),
        createLayer('green'),
        createLayer('red'),
      ],
      [],
      [],
    ],
  },
  
  corruptedRisk: {
    numColors: 4,
    emptyBottles: 2,
    mechanics: { corrupted: true },
    predefinedBottles: [
      [
        createLayer('red'),
        createCorruptedLayer('blue'),
        createLayer('red'),
        createLayer('green'),
      ],
      [
        createLayer('green'),
        createLayer('blue'),
        createCorruptedLayer('red'),
        createLayer('yellow'),
      ],
      [
        createLayer('yellow'),
        createLayer('green'),
        createLayer('blue'),
        createLayer('yellow'),
      ],
      [
        createLayer('blue'),
        createLayer('yellow'),
        createLayer('green'),
        createLayer('red'),
      ],
      [],
      [],
    ],
  },
  
  mutableMadness: {
    numColors: 4,
    emptyBottles: 2,
    mechanics: { mutable: true },
    predefinedBottles: [
      [
        createLayer('red'),
        createMutableLayer('blue', 'red', 3),
        createLayer('red'),
        createLayer('green'),
      ],
      [
        createLayer('green'),
        createLayer('blue'),
        createMutableLayer('green', 'yellow', 4),
        createLayer('yellow'),
      ],
      [
        createLayer('yellow'),
        createMutableLayer('red', 'blue', 2),
        createLayer('blue'),
        createLayer('yellow'),
      ],
      [
        createLayer('blue'),
        createLayer('yellow'),
        createLayer('green'),
        createLayer('red'),
      ],
      [],
      [],
    ],
  },
  
  ultimateChallenge: {
    numColors: 5,
    emptyBottles: 2,
    mechanics: { weights: true, frozen: true, corrupted: true, mutable: true },
    modifierDensity: 0.25,
  },
};

// ============================================================================
// BALANCING STRATEGY
// ============================================================================

/**
 * Balancing Strategy Documentation:
 * 
 * 1. PROGRESSIVE INTRODUCTION
 *    - Levels 1-4: Classic mechanics only (learn basics)
 *    - Levels 5-7: Introduce weighted liquids (strategic depth)
 *    - Levels 8-11: Add frozen liquids (timing element)
 *    - Levels 12-14: Corrupted liquids (risk/reward)
 *    - Levels 15+: Mutable liquids (dynamic planning)
 * 
 * 2. MODIFIER DENSITY
 *    - Early: 10% of layers have modifiers
 *    - Mid: 15-18% of layers have modifiers
 *    - Late: 20-25% of layers have modifiers
 *    - Never exceed 30% to avoid frustration
 * 
 * 3. WEIGHT BALANCE
 *    - Weights range 1-5
 *    - Equal distribution ensures solvability
 *    - Lighter colors (cyan, yellow) appear more on top
 * 
 * 4. FROZEN TIMING
 *    - Unlock timers: 2-4 moves
 *    - Never freeze more than 2 layers per bottle
 *    - Always ensure alternate paths exist
 * 
 * 5. CORRUPTED PLACEMENT
 *    - Max 1-2 corrupted layers per level
 *    - Never place corrupted on top initially
 *    - Always solvable without touching corrupted wrongly
 * 
 * 6. MUTATION PREDICTABILITY
 *    - Clear visual countdown (3-5 moves)
 *    - Mutations should enable solutions, not block
 *    - Colors mutate to colors already in play
 * 
 * 7. MODE ADJUSTMENTS
 *    - Zen: No corrupted, extra empty bottles, no penalties
 *    - Rush: Less modifiers, more empty bottles, score focus
 *    - Classic: Balanced experience with all mechanics
 */
