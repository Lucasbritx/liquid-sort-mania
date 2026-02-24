/**
 * ModeSelect.tsx
 * 
 * Game mode selection screen
 * Allows players to choose between Classic, Zen, and Rush modes
 */

import { memo } from 'react';
import type { GameMode } from '../types';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
  highScores?: {
    classic: number;
    zen: number;
    rush: number;
  };
}

interface ModeCardProps {
  mode: GameMode;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  highScore?: number;
  highScoreLabel: string;
  onClick: () => void;
}

const ModeCard = memo(function ModeCard({
  title,
  description,
  icon,
  features,
  color,
  highScore,
  highScoreLabel,
  onClick,
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-2xl
        bg-white dark:bg-gray-800
        border-2 border-transparent
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-[1.02] active:scale-[0.98]
        text-left
        group
        ${color}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              {title}
            </h3>
            {/* High Score inline */}
            {highScore !== undefined && highScore > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {highScoreLabel}: <span className="font-bold text-gray-700 dark:text-gray-200">{highScore}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      
      {/* Features - horizontal on larger screens */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {features.slice(0, 3).map((feature, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            {feature}
          </span>
        ))}
      </div>
    </button>
  );
});

const ModeSelect = memo(function ModeSelect({
  onSelectMode,
  highScores,
}: ModeSelectProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 pt-6 pb-3 px-4 text-center">
        <img 
          src="/logo.jpg" 
          alt="Liquid Sort Mania" 
          className="w-16 h-16 mx-auto rounded-2xl shadow-lg object-cover mb-3"
        />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          Liquid Sort Mania
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose your game mode
        </p>
      </div>
      
      {/* Mode Cards - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 max-w-md mx-auto w-full">
        <ModeCard
          mode="classic"
          title="Classic"
          description="The original experience"
          icon="🎯"
          features={[
            "Progressive difficulty",
            "All mechanics unlocked over time",
            "Unlimited undo",
            "Track your level progress",
          ]}
          color="hover:border-blue-400"
          highScore={highScores?.classic}
          highScoreLabel="Best Level"
          onClick={() => onSelectMode('classic')}
        />
        
        <ModeCard
          mode="zen"
          title="Zen Mode"
          description="Relax and unwind"
          icon="🧘"
          features={[
            "No time pressure",
            "No failure states",
            "Calming visuals",
            "Perfect for meditation",
          ]}
          color="hover:border-green-400"
          highScore={highScores?.zen}
          highScoreLabel="Best Level"
          onClick={() => onSelectMode('zen')}
        />
        
        <ModeCard
          mode="rush"
          title="Rush Mode"
          description="Race against the clock"
          icon="⚡"
          features={[
            "60-second time limit",
            "Combo scoring system",
            "Compete for high scores",
            "Dynamic difficulty",
          ]}
          color="hover:border-red-400"
          highScore={highScores?.rush}
          highScoreLabel="Best Score"
          onClick={() => onSelectMode('rush')}
        />
      </div>
      
      {/* Footer - Fixed */}
      <footer className="flex-shrink-0 px-4 py-3 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Created with OpenCode + Claude Opus 4.5
        </p>
      </footer>
    </div>
  );
});

export default ModeSelect;
