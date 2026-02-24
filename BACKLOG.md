# Liquid Sort Mania - Backlog

Feature ideas and improvements for future development.

---

## High Impact / Medium Effort

### 1. Hint System
**Priority:** High  
**Effort:** Medium  

Add a "hint" button that highlights a valid move by flashing the source and target bottles. Options:
- Free hints with cooldown (e.g., 30 seconds)
- Limited hints per level (3 max)
- Hints cost a move penalty
- Watch ad for hint (monetization)

**Files to modify:** `useGame.ts`, `TopBar.tsx`, `GameEngine.ts` (add `getHint()` function)

---

### 2. Tutorial Mode
**Priority:** High  
**Effort:** Medium  

Guided first 2 levels with contextual tooltips explaining mechanics as they appear:
- Level 1: "Tap a bottle to select, tap another to pour"
- Level 1: "Match all colors to complete bottles"
- Level 3: "Frozen layers unlock after X moves - wait!"
- Level 4: "Corrupted liquids fail the level if poured wrong"
- Level 5: "Mutable liquids change color - watch the countdown"

**Implementation:** Overlay component with arrow pointing to relevant UI element, localStorage flag to track completion.

---

### 3. Haptic Feedback
**Priority:** High  
**Effort:** Low  

Use `navigator.vibrate()` on mobile devices:
- Pour: short pulse (50ms)
- Win: celebration pattern ([100, 50, 100, 50, 200])
- Frozen block: double tap (50, 50, 50)
- Error/Game over: long pulse (200ms)

**Files to modify:** `SoundEngine.ts` (add haptic methods alongside sounds)

---

### 4. Level Select Screen
**Priority:** Medium  
**Effort:** Medium  

Allow players to:
- View all levels with completion status (locked/completed/current)
- Replay any completed level
- Jump to highest unlocked level
- See stars/rating per level (optional)

**New component:** `LevelSelect.tsx` with grid of level buttons

---

## Medium Impact / Low Effort

### 5. Confetti Animation on Win
**Priority:** Medium  
**Effort:** Low  

Canvas-based particle effect when `WinModal` appears:
- Colorful falling confetti
- 2-3 second duration
- Matches liquid colors from completed level

**Options:** Use `canvas-confetti` npm package or implement simple custom particles

---

### 6. Streak Counter
**Priority:** Medium  
**Effort:** Low  

Track consecutive days played:
- Store last play date in localStorage
- Show streak badge in `TopBar` or `ModeSelect`
- Streak breaks if player misses a day
- Milestone rewards at 7, 30, 100 days

**Files to modify:** `useGame.ts`, add streak display to UI

---

### 7. Statistics Page
**Priority:** Medium  
**Effort:** Low  

Track and display:
- Total moves made
- Levels completed (per mode)
- Total time played
- Best combo (Rush mode)
- Games won/lost ratio
- Fastest level completion
- Current win streak

**New component:** `StatsModal.tsx`, store stats in localStorage

---

### 8. Color Blind Mode
**Priority:** Medium  
**Effort:** Low  

Add patterns/symbols to liquid colors for accessibility:
- Red: diagonal stripes
- Blue: dots
- Green: horizontal lines
- Yellow: crosshatch
- etc.

**Implementation:** SVG pattern overlays in `LiquidLayer` component, toggle in settings

---

### 9. Better Mutable Visual
**Priority:** Low  
**Effort:** Low  

Improve mutable liquid indicator:
- Show small preview dot of the "mutates to" color
- Animated transition when mutation occurs
- Clearer countdown styling

**Files to modify:** `Bottle.tsx` (LiquidLayer component)

---

## Lower Priority / Nice to Have

### 10. Daily Challenge
**Priority:** Low  
**Effort:** Medium  

Same puzzle for all players each day:
- Seeded random generation based on date
- Special "Daily" mode button
- Shareable results (like Wordle)
- Calendar view of completed dailies
- No undo allowed for extra challenge

**Implementation:** Use date string as random seed in `generateLevel()`

---

### 11. Achievements System
**Priority:** Low  
**Effort:** Medium  

Unlock achievements for milestones:
- "First Steps" - Complete level 1
- "No Regrets" - Complete a level without undo
- "Speed Demon" - Complete Rush level in under 30 seconds
- "Combo Master" - Reach 10x combo in Rush
- "Perfectionist" - Complete level 20 in Classic
- "Ice Breaker" - Use a frozen bottle immediately after unlock
- "Close Call" - Win with < 5 seconds in Rush
- "Marathon" - Play for 1 hour total

**New components:** `AchievementsModal.tsx`, achievement toast notifications

---

### 12. Themes/Skins
**Priority:** Low  
**Effort:** Medium  

Cosmetic customization:
- Bottle shapes: test tubes, beakers, wine glasses, potions
- Liquid styles: neon glow, pastel, retro pixel, metallic
- Backgrounds: lab, kitchen, fantasy, space
- Unlock via achievements or in-app purchase

**Implementation:** Theme context provider, CSS variables for colors

---

### 13. Offline PWA
**Priority:** Low  
**Effort:** Low  

Make the game installable and offline-capable:
- Add `manifest.json` with app icons
- Implement service worker for caching
- "Add to Home Screen" prompt
- Works without internet connection

**Files to add:** `public/manifest.json`, `src/sw.ts`

---

### 14. Leaderboard Integration
**Priority:** Low  
**Effort:** High  

Global high scores for Rush mode:
- Firebase or Supabase backend
- Anonymous or authenticated users
- Daily/weekly/all-time leaderboards
- Anti-cheat validation on server

**Considerations:** Requires backend infrastructure, privacy policy

---

### 15. Undo Limit in Classic
**Priority:** Low  
**Effort:** Low  

Make Classic mode more challenging:
- Limit undo to 3 per level
- Or: undo costs a "star" (affects level rating)
- Display remaining undos in TopBar
- Optional: watch ad for extra undo

**Files to modify:** `useGame.ts`, `TopBar.tsx`

---

## Technical Debt / Refactoring

### 16. Unit Tests
Add test coverage for critical game logic:
- `GameEngine.ts` - pour validation, level generation, mechanics
- `useGame.ts` - state transitions, progress saving
- Use Vitest (already Vite-compatible)

### 17. E2E Tests
Playwright or Cypress tests for:
- Complete game flow (select mode, play level, win, next level)
- Frozen mechanic blocking
- Rush mode timer and scoring
- Mobile touch interactions

### 18. Performance Optimization
- Virtualize bottle grid for very high level counts
- Memoize more components
- Lazy load modals
- Reduce re-renders with React DevTools profiler

### 19. Analytics Integration
- Track level completion rates
- Identify where players get stuck
- A/B test difficulty curves
- Options: Mixpanel, Amplitude, PostHog

---

## Completed

- [x] Frozen mechanic visual feedback (block icon + shake)
- [x] Frozen sound effect
- [x] AGENTS.md documentation

---

## How to Prioritize

When picking items from this backlog, consider:

1. **User retention** - Streaks, achievements, daily challenges
2. **Accessibility** - Color blind mode, haptic feedback
3. **Monetization** - Hint system (ads), themes (IAP)
4. **Polish** - Confetti, better visuals, tutorial
5. **Technical foundation** - Tests, analytics, PWA
