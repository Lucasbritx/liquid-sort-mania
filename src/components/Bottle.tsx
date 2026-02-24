/**
 * Bottle.tsx
 * 
 * Visual representation of a liquid bottle with advanced mechanics
 * Supports: weighted, frozen, corrupted, and mutable liquids
 */

import { memo, useMemo } from 'react';
import type { Bottle as BottleType, LiquidLayer as LiquidLayerType } from '../types';
import { COLOR_MAP, getLayerWeight, isLayerFrozen, isLayerCorrupted, isLayerMutable } from '../engine/GameEngine';

interface BottleProps {
  bottle: BottleType;
  index: number;
  isSelected: boolean;
  isDragOver: boolean;
  isPouringOut: boolean;
  isPouringIn: boolean;
  isDragging: boolean;
  isInvalidTarget?: boolean;
  isBlocked?: boolean;
  showWeights?: boolean;
  onClick: () => void;
}

/**
 * Get CSS color for a liquid layer
 */
function getLiquidColor(layer: LiquidLayerType): string {
  return COLOR_MAP[layer.color];
}

/**
 * Individual liquid layer component with modifier visuals
 */
const LiquidLayer = memo(function LiquidLayer({
  layer,
  index,
  isPouringOut,
  isPouringIn,
  totalLayers,
  showWeight,
}: {
  layer: LiquidLayerType;
  index: number;
  isPouringOut: boolean;
  isPouringIn: boolean;
  totalLayers: number;
  showWeight?: boolean;
}) {
  const bgColor = getLiquidColor(layer);
  const isTopLayer = index === totalLayers - 1;
  const isFrozen = isLayerFrozen(layer);
  const isCorrupted = isLayerCorrupted(layer);
  const isMutable = isLayerMutable(layer);
  const weight = getLayerWeight(layer);
  
  // Only animate the top layer during pour
  const animationClass = isTopLayer
    ? isPouringOut
      ? 'pour-out'
      : isPouringIn
      ? 'pour-in'
      : ''
    : '';
  
  return (
    <div
      className={`
        liquid-layer
        absolute left-1 right-1
        transition-all duration-200
        ${animationClass}
        ${isFrozen ? 'frozen-layer' : ''}
        ${isCorrupted ? 'corrupted-layer' : ''}
        ${isMutable ? 'mutable-layer' : ''}
      `}
      style={{
        bottom: `${index * 25}%`,
        height: '25%',
        backgroundColor: bgColor,
        borderRadius: index === 0 ? '0 0 12px 12px' : '0',
        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)`,
      }}
    >
      {/* Highlight effect */}
      <div
        className="absolute top-1 left-2 w-3 h-1 rounded-full opacity-50"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
      />
      
      {/* Frozen overlay */}
      {isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/60 via-white/40 to-blue-200/60" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+')] opacity-50" />
          {/* Frozen counter */}
          {layer.modifiers?.frozenMovesLeft && (
            <span className="relative z-10 text-[10px] font-bold text-blue-800 bg-white/80 rounded-full w-4 h-4 flex items-center justify-center shadow">
              {layer.modifiers.frozenMovesLeft}
            </span>
          )}
        </div>
      )}
      
      {/* Corrupted overlay */}
      {isCorrupted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/20 to-red-900/30" />
          <span className="relative z-10 text-sm">💀</span>
        </div>
      )}
      
      {/* Mutable indicator */}
      {isMutable && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-br from-transparent via-white/10 to-transparent" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px]">🔄</span>
            {layer.modifiers?.mutationMovesLeft && (
              <span className="text-[8px] font-bold text-white drop-shadow-lg">
                {layer.modifiers.mutationMovesLeft}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Weight indicator */}
      {showWeight && layer.modifiers?.weight && (
        <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-bold text-white drop-shadow-lg bg-black/30 rounded-full w-3 h-3 flex items-center justify-center">
            {weight}
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * Main Bottle component
 */
const Bottle = memo(function Bottle({
  bottle,
  index,
  isSelected,
  isDragOver,
  isPouringOut,
  isPouringIn,
  isDragging,
  isInvalidTarget,
  isBlocked,
  showWeights,
  onClick,
}: BottleProps) {
  // Memoize bottle content to prevent unnecessary re-renders
  const liquidLayers = useMemo(() => {
    return bottle.map((layer, layerIndex) => (
      <LiquidLayer
        key={`${index}-${layerIndex}-${layer.color}`}
        layer={layer}
        index={layerIndex}
        isPouringOut={isPouringOut && layerIndex === bottle.length - 1}
        isPouringIn={isPouringIn && layerIndex === bottle.length - 1}
        totalLayers={bottle.length}
        showWeight={showWeights}
      />
    ));
  }, [bottle, index, isPouringOut, isPouringIn, showWeights]);
  
  return (
    <div
      data-bottle-index={index}
      onClick={onClick}
      className={`
        relative
        flex flex-col items-center
        transition-transform duration-200 ease-out
        focus:outline-none
        cursor-pointer
        select-none
        ${isSelected ? 'bottle-selected' : ''}
        ${isDragging ? 'opacity-50 scale-95 z-50' : ''}
        ${isDragOver ? 'scale-110 brightness-110' : ''}
        ${isInvalidTarget ? 'shake-error' : ''}
        ${isBlocked ? 'frozen-block-shake' : ''}
      `}
      style={{
        width: 'var(--bottle-width)',
        height: 'var(--bottle-height)',
        touchAction: 'none',
      }}
      aria-label={`Bottle ${index + 1} with ${bottle.length} layers`}
      role="button"
      tabIndex={0}
    >
      {/* Bottle neck */}
      <div
        className="
          w-6 h-3
          bg-gradient-to-r from-white/30 via-white/10 to-white/5
          dark:from-white/20 dark:via-white/5 dark:to-white/2
          border-2 border-white/40 dark:border-white/20
          border-b-0
          rounded-t-lg
          pointer-events-none
        "
      />
      
      {/* Bottle body */}
      <div
        className="
          bottle-glass
          relative
          flex-1
          w-full
          overflow-hidden
          pointer-events-none
        "
      >
        {/* Liquid layers */}
        {liquidLayers}
        
        {/* Empty state indicator */}
        {bottle.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-30" />
          </div>
        )}
        
        {/* Glass reflection */}
        <div
          className="
            absolute top-0 left-0 right-0
            h-full
            pointer-events-none
            bg-gradient-to-r from-white/20 via-transparent to-transparent
          "
          style={{ width: '30%' }}
        />
      </div>
      
      {/* Selection glow ring */}
      {isSelected && (
        <div
          className="
            absolute -inset-2
            rounded-2xl
            border-2 border-blue-400
            animate-pulse-glow
            pointer-events-none
          "
        />
      )}
      
      {/* Drag over indicator */}
      {isDragOver && !isInvalidTarget && (
        <div
          className="
            absolute -inset-2
            rounded-2xl
            border-2 border-green-400
            bg-green-400/20
            pointer-events-none
          "
        />
      )}
      
      {/* Invalid target indicator */}
      {isInvalidTarget && (
        <div
          className="
            absolute -inset-2
            rounded-2xl
            border-2 border-red-400
            bg-red-400/20
            pointer-events-none
          "
        />
      )}
      
      {/* Frozen block overlay - shows when trying to use a frozen bottle */}
      {isBlocked && (
        <div
          className="
            absolute inset-0
            flex items-center justify-center
            pointer-events-none
            z-20
          "
        >
          <div className="absolute inset-0 bg-cyan-500/30 rounded-b-2xl" />
          <div
            className="
              relative
              w-10 h-10
              flex items-center justify-center
              bg-cyan-600
              rounded-full
              shadow-lg
              border-2 border-white
            "
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});

export default Bottle;
