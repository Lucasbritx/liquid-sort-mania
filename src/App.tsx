/**
 * App.tsx
 * 
 * Main application component
 * Integrates all game components and manages global state
 */

import { useCallback } from 'react';
import { GameBoard, TopBar, WinModal } from './components';
import { useGame, useDarkMode } from './hooks/useGame';

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
  
  // Handlers
  const handleSelectBottle = useCallback((index: number) => {
    selectBottle(index);
  }, [selectBottle]);
  
  const handlePourBottle = useCallback((fromIndex: number, toIndex: number) => {
    pourBottle(fromIndex, toIndex);
  }, [pourBottle]);
  
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);
  
  const handleRestart = useCallback(() => {
    restart();
  }, [restart]);
  
  const handleNextLevel = useCallback(() => {
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
        onUndo={handleUndo}
        onRestart={handleRestart}
        onToggleDarkMode={toggleDarkMode}
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
