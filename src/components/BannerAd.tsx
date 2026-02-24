/**
 * BannerAd.tsx
 * 
 * Google AdSense banner ad component
 * Displays a responsive banner ad at the bottom of the screen
 */

import { useEffect, useRef } from 'react';

// Your AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-5813156550808695';
// Replace with your actual ad slot ID
const ADSENSE_SLOT = 'XXXXXXXXXX';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const BannerAd = () => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    
    try {
      // Push ad to adsbygoogle array
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch (error) {
      console.error('AdSense banner error:', error);
    }
  }, []);

  return (
    <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-800 py-1">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '320px', height: '50px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
      {/* Fallback placeholder when ads aren't loaded */}
      <noscript>
        <div className="w-[320px] h-[50px] bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs">
          Advertisement
        </div>
      </noscript>
    </div>
  );
};

export default BannerAd;
