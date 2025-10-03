import React, { useState } from 'react';
import { useLocation } from 'wouter';
import championsLogo from '@assets/Untitled design (1)_1756422595760.png';

interface TrantorCoinProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  topText?: string;
  bottomText?: string;
  redirectTo?: string;
  variant?: 'default' | 'fantasy' | 'tournament';
}

export default function TrantorCoin({ 
  size = 'md',
  onClick,
  topText,
  bottomText,
  redirectTo,
  variant = 'default'
}: TrantorCoinProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [, setLocation] = useLocation();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };

  const handleCoinClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Start 4 flips animation
    setFlipCount(0);
    const flipInterval = setInterval(() => {
      setFlipCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 4) {
          clearInterval(flipInterval);
          // Navigate after 4 flips
          setTimeout(() => {
            if (redirectTo) {
              setLocation(redirectTo);
            } else {
              setLocation('/trial-signup');
            }
          }, 100);
        }
        return newCount;
      });
    }, 200);
  };

  // Get variant-specific colors
  const getVariantColors = () => {
    switch (variant) {
      case 'fantasy':
        return {
          front: 'radial-gradient(circle at center, #7c3aed 0%, #5b21b6 70%, #4c1d95 100%)',
          back: 'radial-gradient(circle at center, #9333ea 0%, #7c3aed 70%, #5b21b6 100%)',
          border: '#9333ea'
        };
      case 'tournament':
        return {
          front: 'radial-gradient(circle at center, #ea580c 0%, #c2410c 70%, #9a3412 100%)',
          back: 'radial-gradient(circle at center, #f97316 0%, #ea580c 70%, #c2410c 100%)',
          border: '#f97316'
        };
      default:
        return {
          front: 'radial-gradient(circle at center, #f0f0f0 0%, #d0d0d0 70%, #a0a0a0 100%)',
          back: 'radial-gradient(circle at center, #d4af37 0%, #b8941f 70%, #9c7f1a 100%)',
          border: '#d4af37'
        };
    }
  };

  const colors = getVariantColors();

  const coinDiameter = size === 'sm' ? 64 : size === 'md' ? 96 : 128;
  const textRadius = coinDiameter / 2 - 2; // Text sits right on the coin edge

  return (
    <div className="relative flex flex-col items-center">
      {/* Curved Text Resting on Coin Edge */}
      {topText && (
        <div 
          className="absolute"
          style={{
            top: `-8px`, // Position text to sit on the coin's upper edge
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: `${coinDiameter + 20}px`,
            height: `${coinDiameter / 2 + 10}px`
          }}
        >
          <svg 
            width={coinDiameter + 20} 
            height={coinDiameter / 2 + 10}
            viewBox={`0 0 ${coinDiameter + 20} ${coinDiameter / 2 + 10}`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <path
                id={`curve-${variant}-${size}`}
                d={`M 10 ${coinDiameter / 2 + 2} A ${textRadius} ${textRadius} 0 0 1 ${coinDiameter + 10} ${coinDiameter / 2 + 2}`}
              />
            </defs>
            <text
              fontSize="10"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              style={{
                textShadow: '0 0 8px rgba(0,0,0,0.9)',
                letterSpacing: '0.3px'
              }}
            >
              <textPath 
                href={`#curve-${variant}-${size}`}
                startOffset="50%"
              >
                {topText}
              </textPath>
            </text>
          </svg>
        </div>
      )}
      
      <div className="coin-container" style={{ perspective: '1000px' }}>
        <div 
          className={`coin ${sizeClasses[size]}`}
          onClick={handleCoinClick}
          role="button"
          aria-label={`${topText || 'Flip coin'}`}
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            transform: `rotateY(${flipCount * 90}deg)`
          }}
        >
          {/* Front Side - Champions for Change Logo */}
          <div 
            className="front absolute inset-0 rounded-full shadow-xl backface-hidden overflow-hidden"
            style={{
              background: colors.front,
              border: `4px solid ${colors.border}`
            }}
          >
            <div 
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              }}
            >
              <img 
                src={championsLogo} 
                alt="Champions for Change"
                className="w-full h-full object-cover rounded-full"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
                }}
              />
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="back absolute inset-0 rounded-full shadow-xl backface-hidden flex items-center justify-center overflow-hidden"
            style={{
              background: colors.back,
              border: `4px solid ${colors.border}`,
              transform: 'rotateY(180deg)'
            }}
          >
            <div 
              className="w-full h-full rounded-full flex items-center justify-center relative"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
              }}
            >
              <div className="text-white font-bold text-center drop-shadow-lg">
                <div className="text-sm font-extrabold">
                  {bottomText?.split(' ')[0] || 'CREATE'}
                </div>
                <div className="text-xs font-semibold tracking-wide">
                  {bottomText?.split(' ').slice(1).join(' ') || 'ACCOUNT'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}