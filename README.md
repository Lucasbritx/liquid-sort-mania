# Liquid Sort Mania

A production-ready mobile web game inspired by liquid sort puzzle games (like Magic Sort). Built with React, TypeScript, Vite, and Tailwind CSS.

![Game Preview](https://img.shields.io/badge/Platform-Mobile%20Web-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

- **Core Gameplay**: Sort colored liquids into bottles until each bottle contains a single color
- **Progressive Difficulty**: Levels scale from 4 colors (easy) to 8 colors (challenging)
- **Undo System**: Unlimited undo with full move history
- **Move Counter**: Track your efficiency
- **Dark Mode**: Toggle between light and dark themes
- **Persistence**: Game state saved to localStorage automatically
- **Responsive Design**: Optimized for mobile (9:16 vertical) with desktop support
- **Smooth Animations**: CSS-based 60fps animations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd liquid-sort-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## How to Play

1. **Tap** a bottle to select it (bottle lifts up)
2. **Tap** another bottle to pour the top liquid
3. **Valid pours**: Target must have space AND (be empty OR have matching top color)
4. **Win condition**: Each bottle contains only one color or is empty

### Controls

| Action | Description |
|--------|-------------|
| Tap bottle | Select/pour |
| Undo button | Reverse last move |
| Restart button | Reset current level |
| Sun/Moon icon | Toggle dark mode |

## Project Structure

```
liquid-sort-game/
├── src/
│   ├── components/
│   │   ├── Bottle.tsx       # Bottle with liquid layers and animations
│   │   ├── GameBoard.tsx    # Responsive grid layout
│   │   ├── TopBar.tsx       # Level info and control buttons
│   │   ├── WinModal.tsx     # Victory screen with star rating
│   │   └── index.ts
│   ├── engine/
│   │   └── GameEngine.ts    # Pure game logic (framework-agnostic)
│   ├── hooks/
│   │   └── useGame.ts       # React state management and persistence
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles and animations
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Architecture

### Separation of Concerns

| Layer | Responsibility |
|-------|----------------|
| **GameEngine.ts** | Pure functions for game logic. No React, no side effects. Handles move validation, pour execution, win detection, and level generation. |
| **useGame.ts** | React hook that wraps GameEngine. Manages UI state, animations, and localStorage persistence. |
| **Components** | Memoized presentational components. No business logic. |

### Key Design Decisions

1. **Immutable State**: All game operations return new state objects, enabling reliable undo and preventing mutation bugs.

2. **CSS Animations**: Pour animations use CSS `@keyframes` with GPU-accelerated transforms for smooth 60fps performance.

3. **Responsive Sizing**: Bottle dimensions use CSS custom properties (`--bottle-width`, `--bottle-height`) that scale based on viewport.

4. **Level Generation**: Starts from shuffled layers distributed across bottles, guaranteeing solvability by construction.

## Game Rules

- Each bottle holds **4 layers** maximum
- Only the **top contiguous color segment** can be poured
- Pour is valid if:
  - Source bottle is not empty
  - Target bottle has space (< 4 layers)
  - Target is empty OR top colors match
- Levels include **1-2 empty bottles** for maneuvering room

## Performance

- `React.memo()` on all components to prevent unnecessary re-renders
- `useMemo()` for computed values like liquid layer rendering
- `useCallback()` for stable event handler references
- CSS-only animations (no JavaScript animation loops)
- No blocking synchronous operations

## Level Progression

| Levels | Colors | Bottles |
|--------|--------|---------|
| 1-3 | 4 | 6 |
| 4-6 | 5 | 7 |
| 7-10 | 6 | 8 |
| 11-15 | 7 | 9 |
| 16+ | 8 | 10 |

## Customization

### Adding Colors

Edit `src/engine/GameEngine.ts`:

```typescript
export const COLORS: LiquidColor[] = [
  'red', 'orange', 'yellow', 'green', 
  'blue', 'purple', 'pink', 'cyan',
  // Add more here
];

export const COLOR_MAP: Record<LiquidColor, string> = {
  // Add hex values for new colors
};
```

### Adjusting Difficulty

Modify `getLevelConfig()` in `src/engine/GameEngine.ts` to change color/bottle ratios per level.

## Monetization Ideas

| Strategy | Implementation |
|----------|----------------|
| Rewarded Ads | Watch video for hints or extra undos |
| Hint System | Highlight the best move (IAP for hint packs) |
| Level Packs | Premium themed levels |
| Remove Ads | One-time purchase |
| Daily Challenges | Time-limited puzzles with leaderboards |

## Scaling Roadmap

- [ ] Add PWA support with service worker for offline play
- [ ] Implement cloud save (Firebase/Supabase)
- [ ] Add analytics for level difficulty tuning
- [ ] Haptic feedback for mobile (`navigator.vibrate`)
- [ ] Sound effects with Web Audio API
- [ ] Leaderboards and social sharing
- [ ] A/B testing for UI variations

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **No external game engines** - Pure React + CSS
- **No animation libraries** - CSS keyframes + transitions

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
