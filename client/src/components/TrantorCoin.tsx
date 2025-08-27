import React, { useState } from 'react';
import trantorCityscape from '@assets/Untitled design_1756267317246.png';
import trantorSpaceship from '@assets/Untitled design_1756267358077.png';

interface TrantorCoinProps {
  isFlipping?: boolean;
  onFlipComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  autoFlip?: boolean;
  flipInterval?: number;
}

export default function TrantorCoin({ 
  isFlipping = false, 
  onFlipComplete, 
  size = 'md',
  autoFlip = false,
  flipInterval = 3000 
}: TrantorCoinProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentlyFlipping, setCurrentlyFlipping] = useState(isFlipping);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const handleFlip = () => {
    if (!currentlyFlipping) {
      setCurrentlyFlipping(true);
      setTimeout(() => {
        setIsFlipped(!isFlipped);
        setCurrentlyFlipping(false);
        onFlipComplete?.();
      }, 400); // Half of animation duration
    }
  };

  // Auto flip effect
  React.useEffect(() => {
    if (autoFlip) {
      const interval = setInterval(handleFlip, flipInterval);
      return () => clearInterval(interval);
    }
  }, [autoFlip, flipInterval, isFlipped]);

  // External flip control
  React.useEffect(() => {
    if (isFlipping && !currentlyFlipping) {
      handleFlip();
    }
  }, [isFlipping]);

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          relative cursor-pointer 
          preserve-3d
          ${currentlyFlipping ? 'animate-flip' : ''}
          hover:scale-110 transition-transform duration-200
        `}
        onClick={handleFlip}
        style={{
          transform: !currentlyFlipping 
            ? (isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)')
            : undefined
        }}
      >
        {/* Front Side - Trantor Cityscape */}
        <div 
          className="absolute inset-0 rounded-full shadow-xl backface-hidden border-2 border-purple-400 overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <img 
            src={trantorCityscape} 
            alt="Trantor Cityscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
        </div>

        {/* Back Side - Trantor Spaceship */}
        <div 
          className="absolute inset-0 rounded-full shadow-xl backface-hidden border-2 border-blue-400 overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <img 
            src={trantorSpaceship} 
            alt="Trantor Spaceship"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
        </div>

        {/* Coin Edge (Optional Detail) */}
        <div 
          className={`
            absolute inset-0 rounded-full 
            border-4 border-amber-300 
            shadow-inner
            ${currentlyFlipping ? 'opacity-30' : 'opacity-0'}
            transition-opacity duration-200
          `}
        />
      </div>

    </div>
  );
}