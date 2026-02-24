/**
 * WinModal.tsx
 * 
 * Victory celebration modal with confetti effect and share buttons
 */

import { memo, useEffect, useState, useCallback } from 'react';

interface WinModalProps {
  level: number;
  moves: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

/**
 * Confetti particle component
 */
const ConfettiParticle = memo(function ConfettiParticle({
  delay,
  color,
  left,
}: {
  delay: number;
  color: string;
  left: number;
}) {
  return (
    <div
      className="absolute w-3 h-3 rounded-sm animate-bounce"
      style={{
        left: `${left}%`,
        top: '-20px',
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        animationDuration: '1s',
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
});

/**
 * Star rating based on moves
 */
function getStarRating(moves: number, level: number): number {
  // Base optimal moves scales with level
  const optimalMoves = Math.floor(level * 4 + 8);
  
  if (moves <= optimalMoves) return 3;
  if (moves <= optimalMoves * 1.5) return 2;
  return 1;
}

/**
 * Star icon
 */
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-8 h-8 sm:w-10 sm:h-10 ${
      filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
    }`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

/**
 * Share button component
 */
const ShareButton = memo(function ShareButton({
  platform,
  onClick,
  children,
  bgColor,
}: {
  platform: string;
  onClick: () => void;
  children: React.ReactNode;
  bgColor: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Share on ${platform}`}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        text-white transition-all duration-200
        hover:scale-110 active:scale-95
        ${bgColor}
      `}
    >
      {children}
    </button>
  );
});

const WinModal = memo(function WinModal({
  level,
  moves,
  onNextLevel,
  onRestart,
}: WinModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const stars = getStarRating(moves, level);
  
  // Confetti colors
  const confettiColors = [
    '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77',
    '#4ECDC4', '#9B5DE5', '#F15BB5', '#00BBF9',
  ];
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Generate confetti particles
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    delay: Math.random() * 1000,
    color: confettiColors[i % confettiColors.length],
    left: Math.random() * 100,
  }));
  
  // Share message
  const shareText = `I just completed Level ${level} in Liquid Sort Mania with ${moves} moves and got ${'⭐'.repeat(stars)}! Can you beat my score?`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Share handlers
  const shareWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank');
  }, [shareText, shareUrl]);
  
  const shareX = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  }, [shareText, shareUrl]);
  
  const shareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  }, [shareText, shareUrl]);
  
  const shareTelegram = useCallback(() => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  }, [shareText, shareUrl]);
  
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText + '\n\n' + shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  }, [shareText, shareUrl]);
  
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((particle, index) => (
          <ConfettiParticle
            key={index}
            delay={particle.delay}
            color={particle.color}
            left={particle.left}
          />
        ))}
      </div>
      
      {/* Modal card */}
      <div
        className={`
          relative
          mx-4 p-6 sm:p-8
          bg-white dark:bg-gray-800
          rounded-3xl
          shadow-2xl
          max-w-sm w-full
          text-center
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}
        `}
      >
        {/* Logo */}
        <div className="mb-4">
          <img 
            src="/logo.jpg" 
            alt="Liquid Sort Mania" 
            className="w-20 h-20 mx-auto rounded-2xl shadow-lg object-cover"
          />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Level Complete!
        </h2>
        
        {/* Level info */}
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Level {level} completed in {moves} moves
        </p>
        
        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((star) => (
            <StarIcon key={star} filled={star <= stars} />
          ))}
        </div>
        
        {/* Share buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Share your score:</p>
          <div className="flex justify-center gap-3">
            {/* WhatsApp */}
            <ShareButton platform="WhatsApp" onClick={shareWhatsApp} bgColor="bg-green-500 hover:bg-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </ShareButton>
            
            {/* X (Twitter) */}
            <ShareButton platform="X" onClick={shareX} bgColor="bg-black hover:bg-gray-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </ShareButton>
            
            {/* Facebook */}
            <ShareButton platform="Facebook" onClick={shareFacebook} bgColor="bg-blue-600 hover:bg-blue-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </ShareButton>
            
            {/* Telegram */}
            <ShareButton platform="Telegram" onClick={shareTelegram} bgColor="bg-sky-500 hover:bg-sky-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </ShareButton>
            
            {/* Copy Link */}
            <ShareButton platform="Copy Link" onClick={copyLink} bgColor="bg-gray-500 hover:bg-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </ShareButton>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onNextLevel}
            className="
              w-full py-3 px-6
              bg-gradient-to-r from-blue-500 to-cyan-500
              text-white font-semibold
              rounded-xl
              shadow-lg shadow-blue-500/30
              transition-all duration-200
              hover:shadow-xl hover:shadow-blue-500/40
              active:scale-95
              btn-press
            "
          >
            Next Level
          </button>
          
          <button
            onClick={onRestart}
            className="
              w-full py-3 px-6
              bg-gray-100 dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              font-medium
              rounded-xl
              transition-all duration-200
              hover:bg-gray-200 dark:hover:bg-gray-600
              active:scale-95
              btn-press
            "
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
});

export default WinModal;
