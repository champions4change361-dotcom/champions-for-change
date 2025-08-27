import React, { useState } from 'react';
import coinLogo from '@assets/generated_images/Trantor_Tournaments_dual-sided_logo_94168881.png';

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
        {/* Front Side - Cityscape */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg backface-hidden bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-400 flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <div className="w-8 h-8 bg-orange-100 rounded-sm flex items-center justify-center">
            {/* Cityscape Icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange-600">
              <path d="M2 20h4V10H2v10zm6 0h4V6H8v14zm6 0h4v-8h-4v8zm6 0h4V2h-4v18z"/>
            </svg>
          </div>
        </div>

        {/* Back Side - Mathematical Symbol */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg backface-hidden bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-500 flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-8 h-8 bg-purple-100 rounded-sm flex items-center justify-center">
            {/* Mathematical Symbol */}
            <div className="text-purple-600 font-bold text-xl">ℌ</div>
          </div>
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