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

  const sizeMap = {
    sm: { width: 60, height: 60 },
    md: { width: 80, height: 80 },
    lg: { width: 100, height: 100 }
  };

  const coinSize = sizeMap[size];

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
        className={`coin ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCoinClick}
        role="button"
        aria-label="Flip coin to create account"
        style={{
          width: `${coinSize.width}px`,
          height: `${coinSize.height}px`,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          cursor: 'pointer'
        }}
      >
        {/* Front Side SVG */}
        <div 
          className="front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          <svg width={coinSize.width} height={coinSize.height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="frontGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#0A2540', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#D4AF37', stopOpacity: 1}} />
              </radialGradient>
            </defs>
            {/* Coin base */}
            <circle cx="50" cy="50" r="48" fill="url(#frontGrad)" stroke="#C0C0C0" strokeWidth="4"/>
            {/* Cityscape elements */}
            <path d="M20 70 L20 90 L40 90 L40 80 L30 70 Z" fill="#FFD700"/> {/* Coliseum dome */}
            <rect x="40" y="50" width="20" height="20" fill="none" stroke="#00FFFF" strokeWidth="1" strokeDasharray="2,2"/> {/* VR grid */}
            <path d="M60 60 L60 90 L80 90 L80 70 L70 60 Z" fill="#C0C0C0"/> {/* Forum hall */}
            {/* Stars */}
            <circle cx="30" cy="20" r="1" fill="#FFFFFF"/>
            <circle cx="50" cy="15" r="1" fill="#FFFFFF"/>
            <circle cx="70" cy="25" r="1" fill="#FFFFFF"/>
            <text x="50" y="95" fontSize="8" textAnchor="middle" fill="#000000">Trantor</text>
          </svg>
        </div>

        {/* Back Side SVG */}
        <div 
          className="back"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
            transform: 'rotateY(180deg)'
          }}
        >
          <svg width={coinSize.width} height={coinSize.height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#C0C0C0', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#D4AF37', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            {/* Coin base */}
            <circle cx="50" cy="50" r="48" fill="url(#backGrad)" stroke="#D4AF37" strokeWidth="4"/>
            {/* Helix with gears */}
            <path d="M30 30 Q50 50 30 70 M70 30 Q50 50 70 70" stroke="#FFD700" strokeWidth="3" fill="none"/> {/* Helix strands */}
            <circle cx="50" cy="50" r="5" fill="#FFD700"/> {/* Gear nodes */}
            <circle cx="30" cy="40" r="3" fill="#C0C0C0"/>
            <circle cx="70" cy="60" r="3" fill="#C0C0C0"/>
            {/* Trophy */}
            <path d="M45 40 L55 40 L52 30 L48 30 Z" fill="#FFD700"/> {/* Trophy cup */}
            <line x1="50" y1="30" x2="50" y2="70" stroke="#FFD700" strokeWidth="2"/> {/* Stem */}
            <line x1="40" y1="25" x2="60" y2="25" stroke="#FFFF00" strokeWidth="1"/> {/* Rays */}
            <line x1="40" y1="35" x2="60" y2="35" stroke="#FFFF00" strokeWidth="1"/>
            {/* Subtle eagle and stars */}
            <path d="M80 20 L85 25 L90 20 L85 15 Z" fill="#000000" fillOpacity="0.3"/> {/* Eagle */}
            <circle cx="20" cy="80" r="1" fill="#FFFFFF" fillOpacity="0.5"/>
            <circle cx="25" cy="85" r="1" fill="#FFFFFF" fillOpacity="0.5"/>
            <text x="50" y="95" fontSize="8" textAnchor="middle" fill="#000000">Create</text>
          </svg>
        </div>
      </div>
    </div>
  );
}