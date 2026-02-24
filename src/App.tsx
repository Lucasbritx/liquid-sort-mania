/**
 * App.tsx
 *
 * Main application component
 * Integrates all game components and manages global state
 * Supports: Classic, Zen, and Rush game modes
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameBoard,
  TopBar,
  WinModal,
  BannerAd,
  InterstitialAd,
  ModeSelect,
  RushHUD,
  GameOverModal,
} from "./components";
import { useGame, useDarkMode, useSound } from "./hooks/useGame";
import { soundEngine } from "./engine/SoundEngine";
import type { GameMode, RushModeConfig } from "./types";
import { MODE_CONFIGS } from "./engine/GameEngine";

// Show interstitial ad every N levels
const INTERSTITIAL_INTERVAL = 3;

// Timer interval in milliseconds
const TIMER_INTERVAL = 1000;

function App() {
  // Game state and actions
  const {
    bottles,
    selectedIndex,
    moves,
    level,
    isWin,
    isGameOver,
    gameOverReason,
    canUndo,
    animationState,
    mode,
    rushState,
    selectBottle,
    pourBottle,
    undo,
    restart,
    nextLevel,
    setMode,
    updateTimer,
    onTimeUp,
  } = useGame();

  // Dark mode state
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  // Sound state
  const [isSoundEnabled, toggleSound] = useSound();

  // Show mode selection screen
  const [showModeSelect, setShowModeSelect] = useState(() => {
    // Show mode select if no mode has been played yet
    const saved = localStorage.getItem("liquid-sort-mania-state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return !data.mode;
      } catch {
        return true;
      }
    }
    return true;
  });

  // Interstitial ad state
  const [showInterstitial, setShowInterstitial] = useState(false);
  const pendingNextLevelRef = useRef(false);

  // Track previous win state to play sound only on transition
  const prevIsWinRef = useRef(isWin);

  // Timer ref for Rush mode
  const timerRef = useRef<number | null>(null);

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

  // Rush mode timer
  useEffect(() => {
    if (mode === "rush" && !isWin && !isGameOver && !showModeSelect) {
      timerRef.current = window.setInterval(() => {
        updateTimer(1);
      }, TIMER_INTERVAL);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    // Cleanup timer when not in rush mode or game ended
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [mode, isWin, isGameOver, showModeSelect, updateTimer]);

  // Handle mode selection
  const handleSelectMode = useCallback(
    (selectedMode: GameMode) => {
      soundEngine.init();
      soundEngine.play("select");
      setMode(selectedMode);
      setShowModeSelect(false);
    },
    [setMode]
  );

  // Handle back to mode selection
  const handleBackToModeSelect = useCallback(() => {
    soundEngine.init();
    soundEngine.play("select");
    setShowModeSelect(true);
  }, []);

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
    [selectBottle, selectedIndex, bottles]
  );

  const handlePourBottle = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Initialize sound on first user interaction
      soundEngine.init();
      pourBottle(fromIndex, toIndex);
    },
    [pourBottle]
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

  // Get theme-specific background
  const getBackgroundClasses = () => {
    if (mode === "zen") {
      return "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900";
    }
    if (mode === "rush") {
      return "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950 dark:to-gray-900";
    }
    return "bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800";
  };

  // Show mode selection screen
  if (showModeSelect) {
    return <ModeSelect onSelectMode={handleSelectMode} />;
  }

  return (
    <div
      className={`
        h-full
        flex flex-col
        ${getBackgroundClasses()}
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
        mode={mode}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onToggleDarkMode={toggleDarkMode}
        onToggleSound={toggleSound}
        onBackToMenu={handleBackToModeSelect}
      />

      {/* Rush mode HUD */}
      {mode === "rush" && rushState && (
        <RushHUD
          rushState={rushState}
          config={MODE_CONFIGS.rush as RushModeConfig}
          onTimeUp={onTimeUp}
          isPaused={isWin || isGameOver}
        />
      )}

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
          {mode === "zen"
            ? "Relax and sort at your own pace"
            : mode === "rush"
              ? "Pour fast and build combos!"
              : "Tap or drag bottles to pour"}
        </p>
      </footer>

      <BannerAd />

      {/* Win Modal */}
      {isWin && (
        <WinModal
          level={level}
          moves={moves}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && gameOverReason && (
        <GameOverModal
          mode={mode}
          level={level}
          reason={gameOverReason}
          rushState={rushState}
          onRestart={handleRestart}
          onChangeMode={handleBackToModeSelect}
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
