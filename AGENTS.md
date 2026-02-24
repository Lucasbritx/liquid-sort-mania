# AI Agent Guidelines for Liquid Sort Mania

This document provides build commands, code style guidelines, and conventions for AI agents (Copilot, Cursor, Claude, etc.) working on this codebase.

## Project Overview

Liquid Sort Mania is a mobile-first web puzzle game built with:
- **React 18** with TypeScript
- **Vite** for bundling
- **Tailwind CSS** for styling
- No external game engines - pure React/TS implementation

## Build & Development Commands

```bash
# Development server (hot reload)
npm run dev

# Production build (runs tsc then vite build)
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

**Important**: Always run `npm run build` before committing to catch TypeScript errors. The build will fail on type errors.

## Project Structure

```
src/
├── App.tsx              # Main app, routing between modes, modals, timers
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind + CSS animations
├── components/          # React UI components
│   ├── index.ts         # Barrel exports
│   ├── Bottle.tsx       # Individual bottle with liquid layers
│   ├── GameBoard.tsx    # Grid of bottles + drag/drop handlers
│   ├── TopBar.tsx       # Controls (undo, restart, sound, dark mode)
│   ├── ModeSelect.tsx   # Mode selection screen
│   ├── RushHUD.tsx      # Rush mode timer/score/combo display
│   ├── WinModal.tsx     # Victory screen with share buttons
│   ├── GameOverModal.tsx# Failure screen
│   ├── BannerAd.tsx     # Google AdSense banner placeholder
│   └── InterstitialAd.tsx # Video ad between levels
├── engine/              # Pure game logic (no React)
│   ├── GameEngine.ts    # Core mechanics, pour logic, level generation
│   └── SoundEngine.ts   # Web Audio API sound effects
├── hooks/
│   └── useGame.ts       # Game state hook, connects Engine to React
└── types/
    └── index.ts         # All TypeScript types and interfaces
```

## Architecture Principles

1. **Separation of Concerns**
   - `GameEngine.ts`: Pure functions, no React/state - all game rules live here
   - `useGame.ts`: React state management, bridges engine to components
   - Components: Presentation only, minimal logic

2. **Mobile-First Design**
   - Touch events via Pointer Events API
   - Responsive grid layouts with Tailwind
   - Large tap targets (minimum 44x44px)

## Code Style Guidelines

### Imports

Order imports as follows, with blank lines between groups:
```typescript
// 1. React imports
import { useState, useCallback, useEffect, memo, useMemo } from 'react';

// 2. Type imports (use `import type` for types-only)
import type { GameState, GameMode, LiquidLayer } from '../types';

// 3. Named value imports from local modules
import { STORAGE_KEYS } from '../types';
import { createGame, executePour, checkWin } from '../engine/GameEngine';

// 4. Component imports
import { Bottle, TopBar, WinModal } from '../components';
```

### TypeScript

- **Strict mode enabled** - no implicit any, no unused locals/params
- Use `type` for unions/intersections, `interface` for object shapes
- Prefer `type` imports: `import type { Foo }` when importing only types
- Export types from `types/index.ts`, not scattered across files
- Use discriminated unions for state machines (see `ModeConfig` type)

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `GameBoard`, `WinModal` |
| Hooks | camelCase with `use` prefix | `useGame`, `useDarkMode` |
| Types/Interfaces | PascalCase | `LiquidLayer`, `GameState` |
| Functions | camelCase | `executePour`, `checkWin` |
| Constants | SCREAMING_SNAKE_CASE | `STORAGE_KEYS`, `COLOR_MAP` |
| Files | PascalCase for components, camelCase for utilities | `Bottle.tsx`, `useGame.ts` |

### Components

- Use `memo()` for expensive render components (see `LiquidLayer` in Bottle.tsx)
- Default export for components, named exports for utilities
- Props interfaces named `{ComponentName}Props`
- Document complex components with JSDoc header comment

```typescript
/**
 * Bottle.tsx
 *
 * Visual representation of a liquid bottle with advanced mechanics
 * Supports: frozen, corrupted, and mutable liquids
 */

interface BottleProps {
  bottle: BottleType;
  isSelected: boolean;
  onClick: () => void;
}

function Bottle({ bottle, isSelected, onClick }: BottleProps) {
  // ...
}

export default memo(Bottle);
```

### Game Engine Functions

- Pure functions - no side effects, no React
- Return new state objects, never mutate
- Use descriptive result types (see `PourResult` type)

```typescript
// Good: Pure function returning new state
function executePour(state: GameState, from: number, to: number): PourResult {
  // ... returns { success: true, newState: [...] }
}

// Bad: Mutating state directly
function executePour(state: GameState, from: number, to: number): void {
  state[from].pop(); // Never do this!
}
```

### Error Handling

- Use discriminated unions for results (success/failure)
- The `PourResult` type demonstrates the pattern:

```typescript
interface PourResult {
  success: boolean;
  newState?: GameState;
  move?: Move;
  error?: PourError;
  gameOver?: boolean;
}
```

### Styling

- Use Tailwind utility classes for all styling
- Custom animations defined in `index.css` with `@keyframes`
- Dark mode: Use `dark:` variants, toggled via class on `<html>`
- Color values: Use CSS variables or Tailwind palette

### localStorage Keys

All persistence uses keys from `STORAGE_KEYS` constant:
```typescript
STORAGE_KEYS.GAME_STATE    // Current game state
STORAGE_KEYS.HIGH_SCORES   // Per-mode progress/high scores
STORAGE_KEYS.DARK_MODE     // Theme preference
STORAGE_KEYS.SOUND_ENABLED // Sound toggle
STORAGE_KEYS.SELECTED_MODE // Last selected game mode
```

## Game Mechanics Reference

### Liquid Modifiers

| Modifier | Behavior | Visual |
|----------|----------|--------|
| Frozen | Cannot pour until X moves pass | Ice shimmer effect |
| Corrupted | Game over if poured on wrong color | Skull icon + dark overlay |
| Mutable | Changes color after X moves | Countdown number + pulse |

### Difficulty Progression (Classic Mode)

- Levels 1-2: 4 colors, no modifiers (tutorial)
- Level 3: 5 colors, frozen liquids (15% density)
- Level 4: 5 colors, + corrupted liquids (20% density)
- Level 5+: 6 colors, + mutable liquids (25% density, max 30%)

### Mode Differences

| Mode | Timer | Corrupted | Scoring |
|------|-------|-----------|---------|
| Classic | No | Yes (level 4+) | Level progression |
| Zen | No | Disabled | Level progression |
| Rush | 60 seconds | Yes | Points + combo multiplier |

## Common Tasks

### Adding a New Component

1. Create `src/components/NewComponent.tsx`
2. Add export to `src/components/index.ts`
3. Import from barrel: `import { NewComponent } from '../components'`

### Adding a New Liquid Modifier

1. Add type to `LiquidModifiers` interface in `types/index.ts`
2. Add helper functions in `GameEngine.ts` (e.g., `isLayerXXX()`)
3. Update `processTurnMechanics()` for move-based effects
4. Add visual styles in `Bottle.tsx` and `index.css`

### Modifying Level Generation

Edit `getLevelConfig()` in `GameEngine.ts` - this controls:
- Number of colors per level
- Which mechanics are enabled
- Modifier density percentage

## Testing Checklist

Before submitting changes:

- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes
- [ ] Test on mobile viewport (375px width)
- [ ] Test touch interactions (drag & drop)
- [ ] Verify localStorage persistence (refresh page)
- [ ] Test all three game modes
- [ ] Check dark mode appearance
