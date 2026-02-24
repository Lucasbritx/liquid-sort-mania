/**
 * TopBar.tsx
 * 
 * Top navigation bar with level info, undo, restart, and settings
 */

import React, { memo } from 'react';

interface TopBarProps {
  level: number;
  moves: number;
  canUndo: boolean;
  isDarkMode: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onToggleDarkMode: () => void;
}

/**
 * Icon button component
 */
const IconButton = memo(function IconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        w-10 h-10 sm:w-12 sm:h-12
        flex items-center justify-center
        rounded-xl
        bg-white/80 dark:bg-gray-800/80
        shadow-md
        transition-all duration-200
        btn-press
        ${disabled 
          ? 'opacity-40 cursor-not-allowed' 
          : 'hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg active:scale-95'
        }
      `}
    >
      {children}
    </button>
  );
});

/**
 * Undo icon SVG
 */
const UndoIcon = () => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

/**
 * Restart icon SVG
 */
const RestartIcon = () => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

/**
 * Sun icon for light mode
 */
const SunIcon = () => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

/**
 * Moon icon for dark mode
 */
const MoonIcon = () => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
  </svg>
);

const TopBar = memo(function TopBar({
  level,
  moves,
  canUndo,
  isDarkMode,
  onUndo,
  onRestart,
  onToggleDarkMode,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      {/* Logo and level info */}
      <div className="flex items-center gap-3">
        <img 
          src="/logo.jpg" 
          alt="Liquid Sort Mania" 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-md object-cover"
        />
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            Level {level}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Moves: {moves}
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <IconButton
          onClick={onToggleDarkMode}
          label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        
        <IconButton
          onClick={onUndo}
          disabled={!canUndo}
          label="Undo last move"
        >
          <UndoIcon />
        </IconButton>
        
        <IconButton
          onClick={onRestart}
          label="Restart level"
        >
          <RestartIcon />
        </IconButton>
      </div>
    </header>
  );
});

export default TopBar;
