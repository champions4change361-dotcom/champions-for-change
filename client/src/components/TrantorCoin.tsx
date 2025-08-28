import React, { useState } from 'react';
import { useLocation } from 'wouter';

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
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
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
          className="front absolute inset-0 rounded-full shadow-lg backface-hidden flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
            border: '3px solid #ffffff'
          }}
        >
          <div className="text-white font-bold text-center">
            <div className="text-xs leading-tight">Champions</div>
            <div className="text-xs leading-tight">for</div>
            <div className="text-xs leading-tight">Change</div>
          </div>
        </div>

        {/* Back Side - Create */}
        <div 
          className="back absolute inset-0 rounded-full shadow-lg backface-hidden flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
            border: '3px solid #ffffff',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-white font-bold text-center">
            <div className="text-sm">Create</div>
            <div className="text-xs">Account</div>
          </div>
        </div>
      </div>
    </div>
  );
}