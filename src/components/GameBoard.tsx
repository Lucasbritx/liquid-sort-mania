/**
 * GameBoard.tsx
 * 
 * Main game board layout containing all bottles
 * Responsive grid layout optimized for mobile
 * Handles drag and drop interactions
 */

import { memo, useMemo, useState, useCallback, useRef } from 'react';
import type { GameState } from '../types';
import Bottle from './Bottle';

interface GameBoardProps {
  bottles: GameState;
  selectedIndex: number | null;
  animationState: {
    fromIndex: number | null;
    toIndex: number | null;
    isAnimating: boolean;
  };
  frozenBlockIndex: number | null;
  onSelectBottle: (index: number) => void;
  onPourBottle: (fromIndex: number, toIndex: number) => void;
}

/**
 * Calculate optimal grid layout based on bottle count
 */
function getGridLayout(bottleCount: number): { cols: number; rows: number } {
  if (bottleCount <= 6) {
    return { cols: 3, rows: 2 };
  } else if (bottleCount <= 8) {
    return { cols: 4, rows: 2 };
  } else if (bottleCount <= 10) {
    return { cols: 5, rows: 2 };
  } else if (bottleCount <= 12) {
    return { cols: 4, rows: 3 };
  } else {
    return { cols: 5, rows: 3 };
  }
}

/**
 * Find bottle index at a given point
 */
function findBottleAtPoint(x: number, y: number, excludeIndex?: number): number | null {
  const elements = document.elementsFromPoint(x, y);
  
  for (const el of elements) {
    const bottleIndexAttr = el.getAttribute('data-bottle-index');
    if (bottleIndexAttr !== null) {
      const idx = parseInt(bottleIndexAttr, 10);
      if (!isNaN(idx) && idx !== excludeIndex) {
        return idx;
      }
    }
  }
  
  return null;
}

const GameBoard = memo(function GameBoard({
  bottles,
  selectedIndex,
  animationState,
  frozenBlockIndex,
  onSelectBottle,
  onPourBottle,
}: GameBoardProps) {
  const layout = useMemo(() => getGridLayout(bottles.length), [bottles.length]);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    fromIndex: number | null;
    overIndex: number | null;
  }>({
    isDragging: false,
    fromIndex: null,
    overIndex: null,
  });
  
  // Track if we should suppress the click after drag
  const suppressClickRef = useRef(false);
  
  // Handle pointer down (works for both mouse and touch)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const bottleEl = target.closest('[data-bottle-index]');
    
    if (!bottleEl) return;
    
    const fromIndex = parseInt(bottleEl.getAttribute('data-bottle-index') || '-1', 10);
    if (fromIndex === -1 || bottles[fromIndex].length === 0) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const threshold = 15;
    let hasDragStarted = false;
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      
      if (!hasDragStarted && (deltaX > threshold || deltaY > threshold)) {
        hasDragStarted = true;
        suppressClickRef.current = true;
        setDragState({
          isDragging: true,
          fromIndex,
          overIndex: null,
        });
      }
      
      if (hasDragStarted) {
        moveEvent.preventDefault();
        
        const overIndex = findBottleAtPoint(
          moveEvent.clientX,
          moveEvent.clientY,
          fromIndex
        );
        
        setDragState(prev => ({
          ...prev,
          overIndex,
        }));
      }
    };
    
    const handlePointerUp = (upEvent: PointerEvent) => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      
      if (hasDragStarted) {
        const dropIndex = findBottleAtPoint(
          upEvent.clientX,
          upEvent.clientY,
          fromIndex
        );
        
        if (dropIndex !== null && dropIndex !== fromIndex) {
          onPourBottle(fromIndex, dropIndex);
        }
        
        setDragState({
          isDragging: false,
          fromIndex: null,
          overIndex: null,
        });
        
        // Reset suppress click after a short delay
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 100);
      }
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [bottles, onPourBottle]);
  
  // Handle bottle click (tap)
  const handleBottleClick = useCallback((index: number) => {
    if (suppressClickRef.current) {
      return;
    }
    onSelectBottle(index);
  }, [onSelectBottle]);
  
  // Group bottles into rows for centering
  const rows = useMemo(() => {
    const result: number[][] = [];
    let currentRow: number[] = [];
    
    bottles.forEach((_, index) => {
      currentRow.push(index);
      if (currentRow.length === layout.cols) {
        result.push(currentRow);
        currentRow = [];
      }
    });
    
    if (currentRow.length > 0) {
      result.push(currentRow);
    }
    
    return result;
  }, [bottles.length, layout.cols]);
  
  return (
    <div 
      ref={boardRef}
      className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
    >
      <div className="flex flex-col gap-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-3 sm:gap-4"
          >
            {row.map((bottleIndex) => (
              <Bottle
                key={bottleIndex}
                bottle={bottles[bottleIndex]}
                index={bottleIndex}
                isSelected={selectedIndex === bottleIndex}
                isDragOver={dragState.overIndex === bottleIndex}
                isDragging={dragState.fromIndex === bottleIndex}
                isBlocked={frozenBlockIndex === bottleIndex}
                isPouringOut={
                  animationState.isAnimating && 
                  animationState.fromIndex === bottleIndex
                }
                isPouringIn={
                  animationState.isAnimating && 
                  animationState.toIndex === bottleIndex
                }
                onClick={() => handleBottleClick(bottleIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Drag instruction hint */}
      {dragState.isDragging && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className="px-4 py-2 bg-black/70 text-white text-sm rounded-full shadow-lg">
            Drop on another bottle to pour
          </span>
        </div>
      )}
    </div>
  );
});

export default GameBoard;
