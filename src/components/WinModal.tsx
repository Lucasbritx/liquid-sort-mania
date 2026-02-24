/**
 * WinModal.tsx
 * 
 * Victory celebration modal with confetti effect
 */

import { memo, useEffect, useState } from 'react';

interface WinModalProps {
  level: number;
  moves: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

/**
 * Confetti particle component
 */
const ConfettiParticle = memo(function ConfettiParticle({
  delay,
  color,
  left,
}: {
  delay: number;
  color: string;
  left: number;
}) {
  return (
    <div
      className="absolute w-3 h-3 rounded-sm animate-bounce"
      style={{
        left: `${left}%`,
        top: '-20px',
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        animationDuration: '1s',
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
});

/**
 * Star rating based on moves
 */
function getStarRating(moves: number, level: number): number {
  // Base optimal moves scales with level
  const optimalMoves = Math.floor(level * 4 + 8);
  
  if (moves <= optimalMoves) return 3;
  if (moves <= optimalMoves * 1.5) return 2;
  return 1;
}

/**
 * Star icon
 */
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-8 h-8 sm:w-10 sm:h-10 ${
      filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
    }`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const WinModal = memo(function WinModal({
  level,
  moves,
  onNextLevel,
  onRestart,
}: WinModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const stars = getStarRating(moves, level);
  
  // Confetti colors
  const confettiColors = [
    '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77',
    '#4ECDC4', '#9B5DE5', '#F15BB5', '#00BBF9',
  ];
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Generate confetti particles
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    delay: Math.random() * 1000,
    color: confettiColors[i % confettiColors.length],
    left: Math.random() * 100,
  }));
  
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((particle, index) => (
          <ConfettiParticle
            key={index}
            delay={particle.delay}
            color={particle.color}
            left={particle.left}
          />
        ))}
      </div>
      
      {/* Modal card */}
      <div
        className={`
          relative
          mx-4 p-6 sm:p-8
          bg-white dark:bg-gray-800
          rounded-3xl
          shadow-2xl
          max-w-sm w-full
          text-center
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}
        `}
      >
        {/* Trophy icon */}
        <div className="mb-4">
          <span className="text-6xl">🏆</span>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Level Complete!
        </h2>
        
        {/* Level info */}
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Level {level} completed in {moves} moves
        </p>
        
        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <StarIcon key={star} filled={star <= stars} />
          ))}
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onNextLevel}
            className="
              w-full py-3 px-6
              bg-gradient-to-r from-blue-500 to-cyan-500
              text-white font-semibold
              rounded-xl
              shadow-lg shadow-blue-500/30
              transition-all duration-200
              hover:shadow-xl hover:shadow-blue-500/40
              active:scale-95
              btn-press
            "
          >
            Next Level
          </button>
          
          <button
            onClick={onRestart}
            className="
              w-full py-3 px-6
              bg-gray-100 dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              font-medium
              rounded-xl
              transition-all duration-200
              hover:bg-gray-200 dark:hover:bg-gray-600
              active:scale-95
              btn-press
            "
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
});

export default WinModal;
