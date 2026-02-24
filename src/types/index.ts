/**
 * Color identifiers for liquid layers
 * Using string literals for better debugging and serialization
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
 * A bottle is an array of liquid layers (bottom to top)
 * Maximum 4 layers per bottle
 * Empty array = empty bottle
 */
export type Bottle = LiquidColor[];

/**
 * Game state representing all bottles
 */
export type GameState = Bottle[];

/**
 * A move represents pouring from one bottle to another
 */
export interface Move {
  from: number;
  to: number;
  color: LiquidColor;
  count: number;
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
}

/**
 * Level configuration
 */
export interface LevelConfig {
  numColors: number;
  emptyBottles: number;
}

/**
 * Animation state for a bottle
 */
export interface BottleAnimationState {
  isPouringOut: boolean;
  isPouringIn: boolean;
  pouringColor?: LiquidColor;
  pouringCount?: number;
}

/**
 * Storage key constants
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'liquid-sort-mania-state',
  DARK_MODE: 'liquid-sort-mania-dark-mode',
  SOUND_ENABLED: 'liquid-sort-mania-sound',
} as const;
