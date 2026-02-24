/**
 * RushHUD.tsx
 * 
 * Heads-up display for Rush mode
 * Shows timer, score, and combo multiplier
 */

import { memo, useEffect, useState } from 'react';
import type { RushState, RushModeConfig } from '../types';

interface RushHUDProps {
  rushState: RushState;
  config: RushModeConfig;
  highScore?: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const RushHUD = memo(function RushHUD({
  rushState,
  config,
  highScore = 0,
  onTimeUp,
  isPaused = false,
}: RushHUDProps) {
  const [displayTime, setDisplayTime] = useState(rushState.timeRemaining);
  const [comboFlash, setComboFlash] = useState(false);
  
  // Update display time
  useEffect(() => {
    setDisplayTime(rushState.timeRemaining);
  }, [rushState.timeRemaining]);
  
  // Flash combo on change
  useEffect(() => {
    if (rushState.combo > 0) {
      setComboFlash(true);
      const timer = setTimeout(() => setComboFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [rushState.combo]);
  
  // Check for time up
  useEffect(() => {
    if (displayTime <= 0 && !isPaused) {
      onTimeUp();
    }
  }, [displayTime, isPaused, onTimeUp]);
  
  const isLowTime = displayTime <= 10;
  const isCriticalTime = displayTime <= 5;
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate combo multiplier display
  const multiplier = 1 + (rushState.combo * config.comboMultiplier);
  
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30">
      {/* Score */}
      <div className="flex flex-col items-start">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</span>
        <span className="text-xl font-bold text-gray-800 dark:text-white tabular-nums">
          {rushState.score.toLocaleString()}
        </span>
        {highScore > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            Best: {highScore.toLocaleString()}
          </span>
        )}
      </div>
      
      {/* Timer */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</span>
        <span 
          className={`
            text-2xl font-bold tabular-nums transition-colors
            ${isCriticalTime 
              ? 'text-red-500 timer-warning' 
              : isLowTime 
                ? 'text-orange-500' 
                : 'text-gray-800 dark:text-white'
            }
          `}
        >
          {formatTime(displayTime)}
        </span>
        {/* Timer bar */}
        <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${
              isCriticalTime 
                ? 'bg-red-500' 
                : isLowTime 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${(displayTime / config.timeLimit) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Combo */}
      <div className="flex flex-col items-end">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Combo</span>
        <div className={`flex items-baseline gap-1 ${comboFlash ? 'combo-flash' : ''}`}>
          <span 
            className={`
              text-xl font-bold tabular-nums
              ${rushState.combo >= config.maxCombo 
                ? 'text-yellow-500' 
                : rushState.combo > 0 
                  ? 'text-green-500' 
                  : 'text-gray-400'
              }
            `}
          >
            {rushState.combo}x
          </span>
          {rushState.combo > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({multiplier.toFixed(1)}x)
            </span>
          )}
        </div>
        {rushState.combo >= config.maxCombo && (
          <span className="text-xs text-yellow-500 font-medium animate-pulse">
            MAX!
          </span>
        )}
      </div>
    </div>
  );
});

export default RushHUD;
