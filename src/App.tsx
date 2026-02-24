/**
 * App.tsx
 * 
 * Main application component
 * Integrates all game components and manages global state
 */

import { useCallback, useEffect, useRef } from 'react';
import { GameBoard, TopBar, WinModal } from './components';
import { useGame, useDarkMode, useSound } from './hooks/useGame';
import { soundEngine } from './engine/SoundEngine';

function App() {
  // Game state and actions
  const {
    bottles,
    selectedIndex,
    moves,
    level,
    isWin,
    canUndo,
    animationState,
    selectBottle,
    pourBottle,
    undo,
    restart,
    nextLevel,
  } = useGame();
  
  // Dark mode state
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  
  // Sound state
  const [isSoundEnabled, toggleSound] = useSound();
  
  // Track previous win state to play sound only on transition
  const prevIsWinRef = useRef(isWin);
  
  // Initialize sound engine and sync enabled state
  useEffect(() => {
    soundEngine.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);
  
  // Play win sound when game is won
  useEffect(() => {
    if (isWin && !prevIsWinRef.current) {
      soundEngine.play('win');
    }
    prevIsWinRef.current = isWin;
  }, [isWin]);
  
  // Play pour sound when animation starts
  useEffect(() => {
    if (animationState.isAnimating && animationState.fromIndex !== null) {
      soundEngine.play('pour');
    }
  }, [animationState.isAnimating, animationState.fromIndex]);
  
  // Handlers
  const handleSelectBottle = useCallback((index: number) => {
    // Initialize sound on first user interaction
    soundEngine.init();
    
    // Play select sound if selecting a new bottle
    if (selectedIndex === null && bottles[index].length > 0) {
      soundEngine.play('select');
    }
    
    selectBottle(index);
  }, [selectBottle, selectedIndex, bottles]);
  
  const handlePourBottle = useCallback((fromIndex: number, toIndex: number) => {
    // Initialize sound on first user interaction
    soundEngine.init();
    pourBottle(fromIndex, toIndex);
  }, [pourBottle]);
  
  const handleUndo = useCallback(() => {
    soundEngine.init();
    soundEngine.play('drop');
    undo();
  }, [undo]);
  
  const handleRestart = useCallback(() => {
    soundEngine.init();
    soundEngine.play('select');
    restart();
  }, [restart]);
  
  const handleNextLevel = useCallback(() => {
    soundEngine.init();
    soundEngine.play('select');
    nextLevel();
  }, [nextLevel]);
  
  return (
    <div
      className={`
        h-full
        flex flex-col
        bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50
        dark:from-gray-900 dark:via-slate-900 dark:to-gray-800
        transition-colors duration-300
      `}
    >
      {/* Top bar with controls */}
      <TopBar
        level={level}
        moves={moves}
        canUndo={canUndo}
        isDarkMode={isDarkMode}
        isSoundEnabled={isSoundEnabled}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onToggleDarkMode={toggleDarkMode}
        onToggleSound={toggleSound}
      />
      
      {/* Main game board */}
      <GameBoard
        bottles={bottles}
        selectedIndex={selectedIndex}
        animationState={animationState}
        onSelectBottle={handleSelectBottle}
        onPourBottle={handlePourBottle}
      />
      
      {/* Instructions footer */}
      <footer className="px-4 py-3 text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Tap or drag bottles to pour
        </p>
      </footer>
      
      {/* Win modal */}
      {isWin && (
        <WinModal
          level={level}
          moves={moves}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
