/**
 * InterstitialAd.tsx
 * 
 * Full-screen interstitial video ad component
 * Shows every 3 levels with a countdown timer
 */

import { useState, useEffect, useCallback } from 'react';

interface InterstitialAdProps {
  isVisible: boolean;
  onClose: () => void;
}

// Simulated video ad duration in seconds
const AD_DURATION = 5;

export const InterstitialAd = ({ isVisible, onClose }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(AD_DURATION);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleSkip = useCallback(() => {
    if (canSkip) {
      onClose();
    }
  }, [canSkip, onClose]);

  const handleAdClick = useCallback(() => {
    // In production, this would open the advertiser's link
    console.log('Ad clicked - would open advertiser URL');
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Ad Content */}
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer"
        onClick={handleAdClick}
      >
        {/* Simulated Video Ad - Replace with actual ad SDK */}
        <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-lg overflow-hidden shadow-2xl mx-4">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Ad content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-6">
            <div className="text-4xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Awesome Game Awaits!
            </h2>
            <p className="text-sm opacity-90 text-center mb-4">
              Download now and get 1000 free coins!
            </p>
            <div className="px-6 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              Tap to learn more
            </div>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" 
                   style={{ borderLeftWidth: '16px' }} />
            </div>
          </div>
        </div>

        {/* Ad label */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded text-white text-xs font-medium">
          Advertisement
        </div>

        {/* Skip/Countdown button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          disabled={!canSkip}
          className={`
            absolute top-4 right-4 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300
            ${canSkip 
              ? 'bg-white text-black hover:bg-gray-200 cursor-pointer' 
              : 'bg-black/50 backdrop-blur text-white/70 cursor-not-allowed'
            }
          `}
        >
          {canSkip ? (
            <span className="flex items-center gap-1">
              Skip <span className="text-lg">→</span>
            </span>
          ) : (
            <span>Skip in {countdown}s</span>
          )}
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${((AD_DURATION - countdown) / AD_DURATION) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default InterstitialAd;
