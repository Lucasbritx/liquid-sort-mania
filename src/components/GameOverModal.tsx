/**
 * GameOverModal.tsx
 * 
 * Game over screen for failure states
 * - Rush mode time up
 * - Corrupted liquid failure
 */

import { memo, useEffect, useState } from 'react';
import type { GameMode, RushState } from '../types';

interface GameOverModalProps {
  mode: GameMode;
  level: number;
  reason: 'time_up' | 'corrupted' | 'stuck';
  rushState?: RushState;
  highScore?: number;
  onRestart: () => void;
  onChangeMode: () => void;
}

const GameOverModal = memo(function GameOverModal({
  mode,
  level,
  reason,
  rushState,
  highScore = 0,
  onRestart,
  onChangeMode,
}: GameOverModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const getTitle = () => {
    switch (reason) {
      case 'time_up': return "Time's Up!";
      case 'corrupted': return 'Corrupted!';
      case 'stuck': return 'No Moves Left';
      default: return 'Game Over';
    }
  };
  
  const getIcon = () => {
    switch (reason) {
      case 'time_up': return '⏱️';
      case 'corrupted': return '💀';
      case 'stuck': return '🔒';
      default: return '😢';
    }
  };
  
  const getMessage = () => {
    switch (reason) {
      case 'time_up': 
        return 'You ran out of time! Try to pour faster and build combos.';
      case 'corrupted': 
        return 'A corrupted liquid was poured onto the wrong color!';
      case 'stuck': 
        return 'No valid moves remaining. Try a different strategy!';
      default: 
        return 'Better luck next time!';
    }
  };
  
  const isNewHighScore = mode === 'rush' && rushState && rushState.score > highScore;
  
  const bgColor = reason === 'corrupted' 
    ? 'from-purple-900/50 via-red-900/50 to-purple-900/50' 
    : 'from-gray-900/50 via-gray-800/50 to-gray-900/50';
  
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${reason === 'corrupted' ? 'corrupted-flash' : ''}
      `}
    >
      <div
        className={`
          relative
          mx-4 p-6 sm:p-8
          bg-gradient-to-br ${bgColor}
          backdrop-blur-xl
          rounded-3xl
          shadow-2xl
          max-w-sm w-full
          text-center
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}
          ${reason === 'corrupted' ? 'game-over-shake' : ''}
        `}
      >
        {/* Icon */}
        <div className="text-6xl mb-4">{getIcon()}</div>
        
        {/* New High Score Badge */}
        {isNewHighScore && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
            <span className="text-yellow-400 text-sm font-bold animate-pulse">NEW HIGH SCORE!</span>
          </div>
        )}
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {getTitle()}
        </h2>
        
        {/* Message */}
        <p className="text-gray-300 mb-4 text-sm">
          {getMessage()}
        </p>
        
        {/* Stats */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xs text-gray-400 uppercase">Level</p>
              <p className="text-xl font-bold text-white">{level}</p>
            </div>
            {mode === 'rush' && rushState && (
              <>
                <div className="w-px bg-gray-600" />
                <div>
                  <p className="text-xs text-gray-400 uppercase">Score</p>
                  <p className="text-xl font-bold text-white">{rushState.score.toLocaleString()}</p>
                </div>
                <div className="w-px bg-gray-600" />
                <div>
                  <p className="text-xs text-gray-400 uppercase">Max Combo</p>
                  <p className="text-xl font-bold text-white">{rushState.maxCombo}x</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="
              w-full py-3 px-6
              bg-gradient-to-r from-blue-500 to-cyan-500
              text-white font-semibold
              rounded-xl
              shadow-lg shadow-blue-500/30
              transition-all duration-200
              hover:shadow-xl hover:shadow-blue-500/40
              active:scale-95
            "
          >
            Try Again
          </button>
          
          <button
            onClick={onChangeMode}
            className="
              w-full py-3 px-6
              bg-white/10
              text-white
              font-medium
              rounded-xl
              transition-all duration-200
              hover:bg-white/20
              active:scale-95
            "
          >
            Change Mode
          </button>
        </div>
      </div>
    </div>
  );
});

export default GameOverModal;
