/**
 * useGame.ts
 * 
 * React hook wrapping GameEngine
 * Manages game state with React, handles animations, and exposes game actions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameData } from '../types';
import { STORAGE_KEYS } from '../types';
import {
  createGame,
  executePour,
  undoMove,
  checkWin,
  isValidPour,
} from '../engine/GameEngine';

interface AnimationState {
  fromIndex: number | null;
  toIndex: number | null;
  isAnimating: boolean;
}

interface UseGameReturn {
  // State
  bottles: GameState;
  selectedIndex: number | null;
  moves: number;
  level: number;
  isWin: boolean;
  canUndo: boolean;
  animationState: AnimationState;
  
  // Actions
  selectBottle: (index: number) => void;
  undo: () => void;
  restart: () => void;
  nextLevel: () => void;
  goToLevel: (level: number) => void;
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
 * Main game hook
 */
export function useGame(): UseGameReturn {
  // Initialize from localStorage or create new game
  const [gameData, setGameData] = useState<GameData>(() => {
    const saved = loadGameData();
    if (saved) {
      return saved;
    }
    return {
      bottles: createGame(1),
      moves: 0,
      undoStack: [],
      level: 1,
      isWin: false,
    };
  });
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    fromIndex: null,
    toIndex: null,
    isAnimating: false,
  });
  
  // Ref to track animation timeout
  const animationTimeoutRef = useRef<number | null>(null);
  
  // Save to localStorage whenever game data changes
  useEffect(() => {
    saveGameData(gameData);
  }, [gameData]);
  
  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Handle bottle selection
   */
  const selectBottle = useCallback((index: number) => {
    // Ignore during animation
    if (animationState.isAnimating) return;
    
    // Ignore if game is won
    if (gameData.isWin) return;
    
    // If no bottle selected, select this one
    if (selectedIndex === null) {
      // Don't select empty bottles as source
      if (gameData.bottles[index].length === 0) return;
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
    
    if (!isValidPour(source, target)) {
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
    
    // Execute pour after brief delay for animation
    const pourResult = executePour(gameData.bottles, selectedIndex, index);
    if (!pourResult) {
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
      setSelectedIndex(null);
      return;
    }
    
    // Update state after animation
    animationTimeoutRef.current = window.setTimeout(() => {
      const isWin = checkWin(pourResult.newState);
      
      setGameData(prev => ({
        ...prev,
        bottles: pourResult.newState,
        moves: prev.moves + 1,
        undoStack: [...prev.undoStack, pourResult.move],
        isWin,
      }));
      
      setAnimationState({ fromIndex: null, toIndex: null, isAnimating: false });
      setSelectedIndex(null);
    }, 350);
    
  }, [selectedIndex, gameData, animationState.isAnimating]);
  
  /**
   * Undo last move
   */
  const undo = useCallback(() => {
    if (animationState.isAnimating) return;
    if (gameData.undoStack.length === 0) return;
    
    const lastMove = gameData.undoStack[gameData.undoStack.length - 1];
    const newState = undoMove(gameData.bottles, lastMove);
    
    setGameData(prev => ({
      ...prev,
      bottles: newState,
      moves: prev.moves + 1, // Undo also counts as a move
      undoStack: prev.undoStack.slice(0, -1),
      isWin: false,
    }));
    
    setSelectedIndex(null);
  }, [gameData, animationState.isAnimating]);
  
  /**
   * Restart current level
   */
  const restart = useCallback(() => {
    if (animationState.isAnimating) return;
    
    setGameData(prev => ({
      bottles: createGame(prev.level),
      moves: 0,
      undoStack: [],
      level: prev.level,
      isWin: false,
    }));
    
    setSelectedIndex(null);
  }, [animationState.isAnimating]);
  
  /**
   * Go to next level
   */
  const nextLevel = useCallback(() => {
    const newLevel = gameData.level + 1;
    
    setGameData({
      bottles: createGame(newLevel),
      moves: 0,
      undoStack: [],
      level: newLevel,
      isWin: false,
    });
    
    setSelectedIndex(null);
  }, [gameData.level]);
  
  /**
   * Go to specific level
   */
  const goToLevel = useCallback((level: number) => {
    setGameData({
      bottles: createGame(level),
      moves: 0,
      undoStack: [],
      level,
      isWin: false,
    });
    
    setSelectedIndex(null);
  }, []);
  
  return {
    bottles: gameData.bottles,
    selectedIndex,
    moves: gameData.moves,
    level: gameData.level,
    isWin: gameData.isWin,
    canUndo: gameData.undoStack.length > 0,
    animationState,
    selectBottle,
    undo,
    restart,
    nextLevel,
    goToLevel,
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
