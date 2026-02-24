/**
 * App.tsx
 *
 * Main application component
 * Integrates all game components and manages global state
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameBoard,
  TopBar,
  WinModal,
  BannerAd,
  InterstitialAd,
} from "./components";
import { useGame, useDarkMode, useSound } from "./hooks/useGame";
import { soundEngine } from "./engine/SoundEngine";

// Show interstitial ad every N levels
const INTERSTITIAL_INTERVAL = 3;

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

  // Interstitial ad state
  const [showInterstitial, setShowInterstitial] = useState(false);
  const pendingNextLevelRef = useRef(false);

  // Track previous win state to play sound only on transition
  const prevIsWinRef = useRef(isWin);

  // Initialize sound engine and sync enabled state
  useEffect(() => {
    soundEngine.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Play win sound when game is won
  useEffect(() => {
    if (isWin && !prevIsWinRef.current) {
      soundEngine.play("win");
    }
    prevIsWinRef.current = isWin;
  }, [isWin]);

  // Play pour sound when animation starts
  useEffect(() => {
    if (animationState.isAnimating && animationState.fromIndex !== null) {
      soundEngine.play("pour");
    }
  }, [animationState.isAnimating, animationState.fromIndex]);

  // Handlers
  const handleSelectBottle = useCallback(
    (index: number) => {
      // Initialize sound on first user interaction
      soundEngine.init();

      // Play select sound if selecting a new bottle
      if (selectedIndex === null && bottles[index].length > 0) {
        soundEngine.play("select");
      }

      selectBottle(index);
    },
    [selectBottle, selectedIndex, bottles],
  );

  const handlePourBottle = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Initialize sound on first user interaction
      soundEngine.init();
      pourBottle(fromIndex, toIndex);
    },
    [pourBottle],
  );

  const handleUndo = useCallback(() => {
    soundEngine.init();
    soundEngine.play("drop");
    undo();
  }, [undo]);

  const handleRestart = useCallback(() => {
    soundEngine.init();
    soundEngine.play("select");
    restart();
  }, [restart]);

  const handleNextLevel = useCallback(() => {
    soundEngine.init();
    soundEngine.play("select");

    // Check if we should show interstitial ad (every 3 levels)
    // Show ad after completing levels 3, 6, 9, etc.
    if (level % INTERSTITIAL_INTERVAL === 0) {
      pendingNextLevelRef.current = true;
      setShowInterstitial(true);
    } else {
      nextLevel();
    }
  }, [nextLevel, level]);

  const handleCloseInterstitial = useCallback(() => {
    setShowInterstitial(false);
    if (pendingNextLevelRef.current) {
      pendingNextLevelRef.current = false;
      nextLevel();
    }
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
      <footer className="px-4 py-2 text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Tap or drag bottles to pour
        </p>
      </footer>

      <BannerAd />

      {isWin && (
        <WinModal
          level={level}
          moves={moves}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
        />
      )}

      {/* Interstitial Ad (every 3 levels) */}
      <InterstitialAd
        isVisible={showInterstitial}
        onClose={handleCloseInterstitial}
      />
    </div>
  );
}

export default App;
