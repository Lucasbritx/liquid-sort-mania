/**
 * Bottle.tsx
 * 
 * Visual representation of a liquid bottle
 * Handles selection state, pour animations, and drag & drop
 */

import { memo, useMemo } from 'react';
import type { Bottle as BottleType, LiquidColor } from '../types';
import { COLOR_MAP } from '../engine/GameEngine';

interface BottleProps {
  bottle: BottleType;
  index: number;
  isSelected: boolean;
  isDragOver: boolean;
  isPouringOut: boolean;
  isPouringIn: boolean;
  isDragging: boolean;
  onClick: () => void;
}

/**
 * Get CSS color for a liquid layer
 */
function getLiquidColor(color: LiquidColor): string {
  return COLOR_MAP[color];
}

/**
 * Individual liquid layer component
 */
const LiquidLayer = memo(function LiquidLayer({
  color,
  index,
  isPouringOut,
  isPouringIn,
  totalLayers,
}: {
  color: LiquidColor;
  index: number;
  isPouringOut: boolean;
  isPouringIn: boolean;
  totalLayers: number;
}) {
  const bgColor = getLiquidColor(color);
  const isTopLayer = index === totalLayers - 1;
  
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
  onClick,
}: BottleProps) {
  // Memoize bottle content to prevent unnecessary re-renders
  const liquidLayers = useMemo(() => {
    return bottle.map((color, layerIndex) => (
      <LiquidLayer
        key={`${index}-${layerIndex}-${color}`}
        color={color}
        index={layerIndex}
        isPouringOut={isPouringOut && layerIndex === bottle.length - 1}
        isPouringIn={isPouringIn && layerIndex === bottle.length - 1}
        totalLayers={bottle.length}
      />
    ));
  }, [bottle, index, isPouringOut, isPouringIn]);
  
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
      {isDragOver && (
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
    </div>
  );
});

export default Bottle;
