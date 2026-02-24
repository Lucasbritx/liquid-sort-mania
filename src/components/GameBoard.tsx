/**
 * GameBoard.tsx
 * 
 * Main game board layout containing all bottles
 * Responsive grid layout optimized for mobile
 */

import { memo, useMemo } from 'react';
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
  onSelectBottle: (index: number) => void;
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
    // 2 rows of 4, 1 row of 4
    return { cols: 4, rows: 3 };
  } else {
    // 14 bottles: 2 rows of 5, 1 row of 4
    return { cols: 5, rows: 3 };
  }
}

const GameBoard = memo(function GameBoard({
  bottles,
  selectedIndex,
  animationState,
  onSelectBottle,
}: GameBoardProps) {
  const layout = useMemo(() => getGridLayout(bottles.length), [bottles.length]);
  
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
    
    // Push remaining bottles
    if (currentRow.length > 0) {
      result.push(currentRow);
    }
    
    return result;
  }, [bottles.length, layout.cols]);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
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
                isPouringOut={
                  animationState.isAnimating && 
                  animationState.fromIndex === bottleIndex
                }
                isPouringIn={
                  animationState.isAnimating && 
                  animationState.toIndex === bottleIndex
                }
                onClick={() => onSelectBottle(bottleIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default GameBoard;
