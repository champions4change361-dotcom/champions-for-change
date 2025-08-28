import React, { useState } from 'react';
import { useLocation } from 'wouter';
import championsLogo from '@assets/Untitled design (1)_1756422595760.png';

interface TrantorCoinProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function TrantorCoin({ 
  size = 'md',
  onClick
}: TrantorCoinProps) {
  const [isFlipped, setIsFlipped] = useState(false);
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

    // Flip the coin
    setIsFlipped(true);
    
    // Navigate to signup after animation
    setTimeout(() => {
      setLocation('/login/organizer');
    }, 600);
  };

  return (
    <div className="coin-container" style={{ perspective: '1000px' }}>
      <div 
        className={`coin ${isFlipped ? 'flipped' : ''} ${sizeClasses[size]}`}
        onClick={handleCoinClick}
        role="button"
        aria-label="Flip coin to create account"
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          cursor: 'pointer'
        }}
      >
        {/* Front Side - Champions for Change Logo */}
        <div 
          className="front absolute inset-0 rounded-full shadow-xl backface-hidden overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #f0f0f0 0%, #d0d0d0 70%, #a0a0a0 100%)',
            border: '4px solid #gold',
            borderColor: '#d4af37'
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

        {/* Back Side - Create */}
        <div 
          className="back absolute inset-0 rounded-full shadow-xl backface-hidden flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #d4af37 0%, #b8941f 70%, #9c7f1a 100%)',
            border: '4px solid #d4af37',
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
              <div className="text-lg font-extrabold">CREATE</div>
              <div className="text-sm font-semibold tracking-wide">ACCOUNT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}