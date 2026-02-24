/**
 * types/index.ts
 * 
 * Core type definitions for Liquid Sort Mania
 * Supports advanced mechanics: weighted, frozen, corrupted, mutable liquids
 */

// ============================================================================
// BASIC TYPES
// ============================================================================

/**
 * Color identifiers for liquid layers
 */
export type LiquidColor = 
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'cyan';

/**
 * Game mode types
 */
export type GameMode = 'classic' | 'zen' | 'rush';

// ============================================================================
// LIQUID LAYER (Advanced)
// ============================================================================

/**
 * Special states a liquid layer can have
 */
export interface LiquidModifiers {
  /** Weight value (1-5, higher = heavier, cannot pour on lighter) */
  weight?: number;
  
  /** Frozen state - cannot be poured until unlocked */
  frozen?: boolean;
  /** Moves remaining until frozen layer unlocks (if frozen) */
  frozenMovesLeft?: number;
  
  /** Corrupted - fails level if poured on wrong color */
  corrupted?: boolean;
  
  /** Mutable - changes color after X moves */
  mutable?: boolean;
  /** Target color after mutation */
  mutatesTo?: LiquidColor;
  /** Moves until mutation occurs */
  mutationMovesLeft?: number;
}

/**
 * A single liquid layer with color and optional modifiers
 */
export interface LiquidLayer {
  color: LiquidColor;
  modifiers?: LiquidModifiers;
}

/**
 * A bottle is an array of liquid layers (bottom to top)
 * Maximum 4 layers per bottle
 */
export type Bottle = LiquidLayer[];

/**
 * Legacy simple bottle type (just colors)
 */
export type SimpleBottle = LiquidColor[];

/**
 * Game state representing all bottles
 */
export type GameState = Bottle[];

// ============================================================================
// MOVES & HISTORY
// ============================================================================

/**
 * A move represents pouring from one bottle to another
 */
export interface Move {
  from: number;
  to: number;
  layers: LiquidLayer[];
  count: number;
}

/**
 * Result of attempting a pour
 */
export interface PourResult {
  success: boolean;
  newState?: GameState;
  move?: Move;
  error?: PourError;
  /** For corrupted liquid failure */
  gameOver?: boolean;
}

/**
 * Types of pour errors
 */
export type PourError = 
  | 'empty_source'
  | 'full_target'
  | 'color_mismatch'
  | 'frozen_source'
  | 'weight_violation'
  | 'corrupted_failure';

// ============================================================================
// LEVEL CONFIGURATION
// ============================================================================

/**
 * Mechanics that can be enabled/disabled per level
 */
export interface LevelMechanics {
  /** Enable weighted liquids */
  weights?: boolean;
  /** Enable frozen liquids */
  frozen?: boolean;
  /** Enable corrupted liquids */
  corrupted?: boolean;
  /** Enable mutable liquids */
  mutable?: boolean;
}

/**
 * Level configuration
 */
export interface LevelConfig {
  numColors: number;
  emptyBottles: number;
  mechanics?: LevelMechanics;
  /** Percentage of layers with modifiers (0-1) */
  modifierDensity?: number;
  /** Pre-defined bottle layout (optional, for hand-crafted levels) */
  predefinedBottles?: Bottle[];
}

// ============================================================================
// GAME MODE CONFIGURATION
// ============================================================================

/**
 * Zen mode configuration
 */
export interface ZenModeConfig {
  mode: 'zen';
  /** No move limit */
  moveLimit: null;
  /** No time limit */
  timeLimit: null;
  /** Relaxed mechanics (no corrupted liquids) */
  disableMechanics: ('corrupted')[];
  /** Visual style */
  theme: 'calm';
}

/**
 * Rush mode configuration
 */
export interface RushModeConfig {
  mode: 'rush';
  /** Time limit in seconds */
  timeLimit: number;
  /** Enable combo scoring */
  combosEnabled: boolean;
  /** Points per correct pour */
  baseScore: number;
  /** Combo multiplier increment */
  comboMultiplier: number;
  /** Max combo multiplier */
  maxCombo: number;
  /** Visual style */
  theme: 'intense';
}

/**
 * Classic mode configuration
 */
export interface ClassicModeConfig {
  mode: 'classic';
  /** Optional move limit */
  moveLimit: number | null;
  /** No time limit */
  timeLimit: null;
  /** Visual style */
  theme: 'default';
}

export type ModeConfig = ZenModeConfig | RushModeConfig | ClassicModeConfig;

// ============================================================================
// GAME DATA
// ============================================================================

/**
 * Rush mode specific state
 */
export interface RushState {
  score: number;
  combo: number;
  maxCombo: number;
  timeRemaining: number;
}

/**
 * Complete game data including state and metadata
 */
export interface GameData {
  bottles: GameState;
  moves: number;
  undoStack: Move[];
  level: number;
  isWin: boolean;
  isGameOver: boolean;
  mode: GameMode;
  modeConfig: ModeConfig;
  /** Rush mode state */
  rushState?: RushState;
  /** Global move counter for mutation/frozen tracking */
  globalMoveCount: number;
}

// ============================================================================
// ANIMATION
// ============================================================================

/**
 * Animation state for a bottle
 */
export interface BottleAnimationState {
  isPouringOut: boolean;
  isPouringIn: boolean;
  pouringLayers?: LiquidLayer[];
  pouringCount?: number;
}

/**
 * Global animation state
 */
export interface AnimationState {
  isAnimating: boolean;
  fromIndex: number | null;
  toIndex: number | null;
}

// ============================================================================
// STORAGE
// ============================================================================

/**
 * Storage key constants
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'liquid-sort-mania-state',
  DARK_MODE: 'liquid-sort-mania-dark-mode',
  SOUND_ENABLED: 'liquid-sort-mania-sound',
  HIGH_SCORES: 'liquid-sort-mania-high-scores',
  SELECTED_MODE: 'liquid-sort-mania-mode',
} as const;

// ============================================================================
// LEADERBOARD (Future Integration)
// ============================================================================

/**
 * Leaderboard entry structure
 */
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  mode: GameMode;
  timestamp: number;
}

/**
 * Local high scores
 */
export interface HighScores {
  classic: { level: number; moves: number }[];
  zen: { level: number; moves: number }[];
  rush: { score: number; level: number }[];
}
