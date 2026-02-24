/**
 * useGame.ts
 * 
 * React hook wrapping GameEngine with advanced mechanics
 * Supports: Classic, Zen, and Rush modes
 * Handles weighted, frozen, corrupted, and mutable liquids
 * Saves progress per mode to localStorage
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameData, GameMode, RushState, RushModeConfig, LevelMechanics } from '../types';
import { STORAGE_KEYS } from '../types';
import {
  createGame,
  executePour,
  undoMove,
  checkWin,
  validatePour,
  processTurnMechanics,
  updateRushScore,
  getLevelConfig,
  hasTopFrozenLayers,
} from '../engine/GameEngine';

interface AnimationState {
  fromIndex: number | null;
  toIndex: number | null;
  isAnimating: boolean;
}

/**
 * Progress data saved per mode
 */
interface ModeProgress {
  classic: { level: number };
  zen: { level: number };
  rush: { highScore: number; bestLevel: number };
}

interface UseGameReturn {
  // State
  bottles: GameState;
  selectedIndex: number | null;
  moves: number;
  level: number;
  isWin: boolean;
  isGameOver: boolean;
  gameOverReason: 'time_up' | 'corrupted' | 'stuck' | null;
  canUndo: boolean;
  animationState: AnimationState;
  mode: GameMode;
  rushState?: RushState;
  mechanics: LevelMechanics;
  highScores: { classic: number; zen: number; rush: number };
  frozenBlockIndex: number | null;
  
  // Actions
  selectBottle: (index: number) => void;
  pourBottle: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  restart: () => void;
  nextLevel: () => void;
  goToLevel: (level: number) => void;
  setMode: (mode: GameMode) => void;
  updateTimer: (delta: number) => void;
  onTimeUp: () => void;
}

/**
 * Load progress from localStorage
 */
function loadProgress(): ModeProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (saved) {
      const data = JSON.parse(saved) as ModeProgress;
      return {
        classic: { level: data.classic?.level || 1 },
        zen: { level: data.zen?.level || 1 },
        rush: { 
          highScore: data.rush?.highScore || 0, 
          bestLevel: data.rush?.bestLevel || 1 
        },
      };
    }
  } catch {
    console.warn('Failed to load progress');
  }
  return {
    classic: { level: 1 },
    zen: { level: 1 },
    rush: { highScore: 0, bestLevel: 1 },
  };
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress: ModeProgress): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(progress));
  } catch {
    console.warn('Failed to save progress');
  }
}

/**
 * Load game data from localStorage
 */
function loadGameData(): GameData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (saved) {
      const data = JSON.parse(saved) as GameData;
      // Basic validation
      if (data.bottles && Array.isArray(data.bottles) && typeof data.level === 'number') {
        return data;
      }
    }
  } catch {
    console.warn('Failed to load game state');
  }
  return null;
}

/**
 * Save game data to localStorage
 */
function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data));
  } catch {
    console.warn('Failed to save game state');
  }
}

/**
 * Main game hook with advanced mechanics
 */
export function useGame(): UseGameReturn {
  // Load progress
  const [progress, setProgress] = useState<ModeProgress>(loadProgress);
  
  // Initialize from localStorage or create new game
  const [gameData, setGameData] = useState<GameData>(() => {
    const saved = loadGameData();
    if (saved && saved.mode) {
      return saved;
    }
    return createGame(1, 'classic');
  });
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    fromIndex: null,
    toIndex: null,
    isAnimating: false,
  });
  const [gameOverReason, setGameOverReason] = useState<'time_up' | 'corrupted' | 'stuck' | null>(null);
  const [frozenBlockIndex, setFrozenBlockIndex] = useState<number | null>(null);
  
  // Ref to track animation timeout
  const animationTimeoutRef = useRef<number | null>(null);
  const frozenBlockTimeoutRef = useRef<number | null>(null);
  
  // Get current level mechanics
  const mechanics = getLevelConfig(gameData.level, gameData.mode).mechanics || {};
  
  // Save to localStorage whenever game data changes
  useEffect(() => {
    saveGameData(gameData);
  }, [gameData]);
  
  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  
  // Update progress when level is won
  useEffect(() => {
    if (gameData.isWin) {
      setProgress(prev => {
        const newProgress = { ...prev };
        
        if (gameData.mode === 'classic') {
          // Save highest level reached in classic
          if (gameData.level >= prev.classic.level) {
            newProgress.classic = { level: gameData.level + 1 };
          }
        } else if (gameData.mode === 'zen') {
          // Save highest level reached in zen
          if (gameData.level >= prev.zen.level) {
            newProgress.zen = { level: gameData.level + 1 };
          }
        } else if (gameData.mode === 'rush' && gameData.rushState) {
          // Save high score and best level for rush
          const currentScore = gameData.rushState.score;
          if (currentScore > prev.rush.highScore) {
            newProgress.rush = { 
              highScore: currentScore,
              bestLevel: Math.max(prev.rush.bestLevel, gameData.level),
            };
          } else if (gameData.level > prev.rush.bestLevel) {
            newProgress.rush = {
              ...prev.rush,
              bestLevel: gameData.level,
            };
          }
        }
        
        return newProgress;
      });
    }
  }, [gameData.isWin, gameData.level, gameData.mode, gameData.rushState]);
  
  // Also save rush high score on game over (time up)
  useEffect(() => {
    if (gameData.isGameOver && gameData.mode === 'rush' && gameData.rushState) {
      setProgress(prev => {
        const currentScore = gameData.rushState!.score;
        if (currentScore > prev.rush.highScore) {
          return {
            ...prev,
            rush: {
              highScore: currentScore,
              bestLevel: Math.max(prev.rush.bestLevel, gameData.level),
            },
          };
        }
        return prev;
      });
    }
  }, [gameData.isGameOver, gameData.mode, gameData.rushState, gameData.level]);
  
  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (frozenBlockTimeoutRef.current) {
        clearTimeout(frozenBlockTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Show frozen block feedback briefly
   */
  const showFrozenBlock = useCallback((index: number) => {
    // Clear any existing timeout
    if (frozenBlockTimeoutRef.current) {
      clearTimeout(frozenBlockTimeoutRef.current);
    }
    
    setFrozenBlockIndex(index);
    
    // Clear after animation
    frozenBlockTimeoutRef.current = window.setTimeout(() => {
      setFrozenBlockIndex(null);
    }, 600);
  }, []);
  
  /**
   * Handle bottle selection
   */
  const selectBottle = useCallback((index: number) => {
    // Ignore during animation
    if (animationState.isAnimating) return;
    
    // Ignore if game is won or over
    if (gameData.isWin || gameData.isGameOver) return;
    
    // If no bottle selected, select this one
    if (selectedIndex === null) {
      // Don't select empty bottles as source
      if (gameData.bottles[index].length === 0) return;
      
      // Check if top layer is frozen (and frozen mechanic is enabled)
      if (mechanics.frozen && hasTopFrozenLayers(gameData.bottles[index])) {
        showFrozenBlock(index);
        return;
      }
      
      setSelectedIndex(index);
      return;
    }
    
    // If same bottle clicked, deselect
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    
    // Try to pour from selected to clicked
    const source = gameData.bottles[selectedIndex];
    const target = gameData.bottles[index];
    
    const validation = validatePour(source, target, mechanics);
    
    if (!validation.valid) {
      // Check for game over (corrupted failure)
      if (validation.gameOver) {
        setGameOverReason('corrupted');
        setGameData(prev => ({ ...prev, isGameOver: true }));
        setSelectedIndex(null);
        return;
      }
      
      // Invalid pour - if clicked bottle has liquid, select it instead
      if (target.length > 0) {
        setSelectedIndex(index);
      }
      return;
    }
    
    // Start animation
    setAnimationState({
      fromIndex: selectedIndex,
      toIndex: index,
      isAnimating: true,
    });
    
    // Execute pour
    const pourResult = executePour(gameData.bottles, selectedIndex, index, mechanics);
    
    if (!pourResult.success) {
      // Check for corrupted failure
      if (pourResult.gameOver) {
        setGameOverReason('corrupted');
        setGameData(prev => ({ ...prev, isGameOver: true }));
      }
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
      setSelectedIndex(null);
      return;
    }
    
    // Update state after animation
    animationTimeoutRef.current = window.setTimeout(() => {
      // Process turn-based mechanics (frozen countdown, mutations)
      const processedState = processTurnMechanics(pourResult.newState!, mechanics);
      const isWin = checkWin(processedState);
      
      setGameData(prev => {
        const newData: GameData = {
          ...prev,
          bottles: processedState,
          moves: prev.moves + 1,
          undoStack: [...prev.undoStack, pourResult.move!],
          isWin,
          globalMoveCount: prev.globalMoveCount + 1,
        };
        
        // Update rush score
        if (prev.mode === 'rush' && prev.rushState) {
          newData.rushState = updateRushScore(
            prev.rushState,
            prev.modeConfig as RushModeConfig,
            true
          );
        }
        
        return newData;
      });
      
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
      setSelectedIndex(null);
    }, 350);
    
  }, [selectedIndex, gameData, animationState.isAnimating, mechanics, showFrozenBlock]);
  
  /**
   * Direct pour from one bottle to another (for drag & drop)
   */
  const pourBottle = useCallback((fromIndex: number, toIndex: number) => {
    // Ignore during animation
    if (animationState.isAnimating) return;
    
    // Ignore if game is won or over
    if (gameData.isWin || gameData.isGameOver) return;
    
    // Check if source has frozen top layer
    const source = gameData.bottles[fromIndex];
    if (mechanics.frozen && hasTopFrozenLayers(source)) {
      showFrozenBlock(fromIndex);
      return;
    }
    
    // Validate pour
    const target = gameData.bottles[toIndex];
    
    const validation = validatePour(source, target, mechanics);
    
    if (!validation.valid) {
      // Check for game over (corrupted failure)
      if (validation.gameOver) {
        setGameOverReason('corrupted');
        setGameData(prev => ({ ...prev, isGameOver: true }));
      }
      return;
    }
    
    // Clear any selection
    setSelectedIndex(null);
    
    // Start animation
    setAnimationState({
      fromIndex,
      toIndex,
      isAnimating: true,
    });
    
    // Execute pour
    const pourResult = executePour(gameData.bottles, fromIndex, toIndex, mechanics);
    
    if (!pourResult.success) {
      if (pourResult.gameOver) {
        setGameOverReason('corrupted');
        setGameData(prev => ({ ...prev, isGameOver: true }));
      }
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
      return;
    }
    
    // Update state after animation
    animationTimeoutRef.current = window.setTimeout(() => {
      // Process turn-based mechanics
      const processedState = processTurnMechanics(pourResult.newState!, mechanics);
      const isWin = checkWin(processedState);
      
      setGameData(prev => {
        const newData: GameData = {
          ...prev,
          bottles: processedState,
          moves: prev.moves + 1,
          undoStack: [...prev.undoStack, pourResult.move!],
          isWin,
          globalMoveCount: prev.globalMoveCount + 1,
        };
        
        // Update rush score
        if (prev.mode === 'rush' && prev.rushState) {
          newData.rushState = updateRushScore(
            prev.rushState,
            prev.modeConfig as RushModeConfig,
            true
          );
        }
        
        return newData;
      });
      
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
    }, 350);
  }, [gameData, animationState.isAnimating, mechanics, showFrozenBlock]);
  
  /**
   * Undo last move
   */
  const undo = useCallback(() => {
    if (animationState.isAnimating) return;
    if (gameData.undoStack.length === 0) return;
    if (gameData.isGameOver) return;
    
    const lastMove = gameData.undoStack[gameData.undoStack.length - 1];
    const newState = undoMove(gameData.bottles, lastMove);
    
    setGameData(prev => {
      const newData: GameData = {
        ...prev,
        bottles: newState,
        moves: prev.moves + 1,
        undoStack: prev.undoStack.slice(0, -1),
        isWin: false,
        globalMoveCount: prev.globalMoveCount + 1,
      };
      
      // Reset combo on undo in rush mode
      if (prev.mode === 'rush' && prev.rushState) {
        newData.rushState = { ...prev.rushState, combo: 0 };
      }
      
      return newData;
    });
    
    setSelectedIndex(null);
  }, [gameData, animationState.isAnimating]);
  
  /**
   * Restart current level
   */
  const restart = useCallback(() => {
    if (animationState.isAnimating) return;
    
    setGameData(prev => createGame(prev.level, prev.mode));
    setSelectedIndex(null);
    setGameOverReason(null);
  }, [animationState.isAnimating]);
  
  /**
   * Go to next level
   */
  const nextLevel = useCallback(() => {
    const newLevel = gameData.level + 1;
    setGameData(createGame(newLevel, gameData.mode));
    setSelectedIndex(null);
    setGameOverReason(null);
  }, [gameData.level, gameData.mode]);
  
  /**
   * Go to specific level
   */
  const goToLevel = useCallback((level: number) => {
    setGameData(createGame(level, gameData.mode));
    setSelectedIndex(null);
    setGameOverReason(null);
  }, [gameData.mode]);
  
  /**
   * Change game mode - load saved progress for that mode
   */
  const setMode = useCallback((mode: GameMode) => {
    // Get saved level for this mode
    let startLevel = 1;
    if (mode === 'classic') {
      startLevel = progress.classic.level;
    } else if (mode === 'zen') {
      startLevel = progress.zen.level;
    }
    // Rush always starts at level 1
    
    setGameData(createGame(startLevel, mode));
    setSelectedIndex(null);
    setGameOverReason(null);
  }, [progress]);
  
  /**
   * Update timer (for Rush mode)
   */
  const updateTimer = useCallback((delta: number) => {
    if (gameData.mode !== 'rush' || !gameData.rushState) return;
    if (gameData.isWin || gameData.isGameOver) return;
    
    setGameData(prev => {
      if (!prev.rushState) return prev;
      
      const newTime = Math.max(0, prev.rushState.timeRemaining - delta);
      
      return {
        ...prev,
        rushState: {
          ...prev.rushState,
          timeRemaining: newTime,
        },
      };
    });
  }, [gameData.mode, gameData.rushState, gameData.isWin, gameData.isGameOver]);
  
  /**
   * Handle time up (for Rush mode)
   */
  const onTimeUp = useCallback(() => {
    if (gameData.mode !== 'rush') return;
    setGameOverReason('time_up');
    setGameData(prev => ({ ...prev, isGameOver: true }));
  }, [gameData.mode]);
  
  // Compute high scores for display
  const highScores = {
    classic: progress.classic.level,
    zen: progress.zen.level,
    rush: progress.rush.highScore,
  };
  
  return {
    bottles: gameData.bottles,
    selectedIndex,
    moves: gameData.moves,
    level: gameData.level,
    isWin: gameData.isWin,
    isGameOver: gameData.isGameOver,
    gameOverReason,
    canUndo: gameData.undoStack.length > 0,
    animationState,
    mode: gameData.mode,
    rushState: gameData.rushState,
    mechanics,
    highScores,
    frozenBlockIndex,
    selectBottle,
    pourBottle,
    undo,
    restart,
    nextLevel,
    goToLevel,
    setMode,
    updateTimer,
    onTimeUp,
  };
}

/**
 * Hook for dark mode management
 */
export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  const toggle = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  
  return [isDark, toggle];
}

/**
 * Hook for sound management
 */
export function useSound(): [boolean, () => void] {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return true; // Enabled by default
    } catch {
      return true;
    }
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(isEnabled));
  }, [isEnabled]);
  
  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);
  
  return [isEnabled, toggle];
}
