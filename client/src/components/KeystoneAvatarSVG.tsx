import React from 'react';

interface KeystoneAvatarSVGProps {
  size?: number;
  className?: string;
  animated?: boolean;
  state?: 'default' | 'thinking' | 'celebrating' | 'coaching';
}

export default function KeystoneAvatarSVG({ 
  size = 64, 
  className = "", 
  animated = true,
  state = 'default' 
}: KeystoneAvatarSVGProps) {
  return (
    <div className={`keystone-avatar ${className} ${animated ? 'animated' : ''}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="keystone-svg"
        aria-label="Keystone AI Coach Avatar"
      >
        <defs>
          <linearGradient id="keystoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" /> {/* Champions green */}
            <stop offset="100%" stopColor="#3B82F6" /> {/* Champions blue */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Keystone Base Shape */}
        <path
          d="M50 15 L75 35 L75 65 L50 85 L25 65 L25 35 Z"
          fill="url(#keystoneGradient)"
          stroke="#1F2937"
          strokeWidth="2"
          filter={state === 'celebrating' ? 'url(#glow)' : ''}
          className={animated ? 'keystone-pulse' : ''}
        />

        {/* Coach Elements */}
        {state !== 'default' && (
          <>
            {/* Whistle */}
            <circle 
              cx="35" 
              cy="25" 
              r="3" 
              fill="#FCD34D" 
              stroke="#92400E" 
              strokeWidth="1"
            />
            <line 
              x1="35" 
              y1="28" 
              x2="35" 
              y2="35" 
              stroke="#92400E" 
              strokeWidth="1.5"
            />

            {/* Trophy/Award Icon */}
            <path
              d="M60 25 L70 25 L68 35 L62 35 Z M65 35 L65 40 M62 40 L68 40"
              fill="#FCD34D"
              stroke="#92400E"
              strokeWidth="1"
            />

            {/* AI "Eyes" - Geometric */}
            <circle cx="42" cy="45" r="4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="58" cy="45" r="4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="42" cy="45" r="2" fill="#1F2937" className={animated ? 'eye-blink' : ''} />
            <circle cx="58" cy="45" r="2" fill="#1F2937" className={animated ? 'eye-blink' : ''} />
          </>
        )}

        {/* State-specific Elements */}
        {state === 'thinking' && (
          <>
            <circle cx="80" cy="20" r="8" fill="#FFFFFF" opacity="0.8" />
            <text x="80" y="25" textAnchor="middle" fontSize="12" fill="#1F2937">?</text>
          </>
        )}

        {state === 'celebrating' && (
          <>
            <text x="25" y="20" fontSize="16">🎉</text>
            <text x="70" y="20" fontSize="16">🏆</text>
          </>
        )}

        {state === 'coaching' && (
          <>
            <path
              d="M30 60 L45 70 L50 65 L55 70 L70 60"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              opacity="0.8"
            />
          </>
        )}

        {/* Champions for Change Mission Indicator */}
        <circle 
          cx="50" 
          cy="75" 
          r="6" 
          fill="#FFFFFF" 
          opacity="0.9"
        />
        <text 
          x="50" 
          y="79" 
          textAnchor="middle" 
          fontSize="10" 
          fill="#1F2937" 
          fontWeight="bold"
        >
          C4C
        </text>
      </svg>

      <style>{`
        .keystone-avatar.animated .keystone-pulse {
          animation: pulse 2s infinite;
        }
        
        .keystone-avatar.animated .eye-blink {
          animation: blink 3s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        
        .keystone-svg {
          transition: all 0.3s ease;
        }
        
        .keystone-avatar:hover .keystone-svg {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}