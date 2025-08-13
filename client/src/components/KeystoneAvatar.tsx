// 🗿 KEYSTONE AI AVATAR - TIMELESS GEOMETRIC DESIGN
// Professional, domain-aware avatar that will never look dated

import React, { useState, useEffect } from 'react';
import { useDomain } from '@/hooks/useDomain';

// =============================================================================
// 1. KEYSTONE AVATAR COMPONENT
// =============================================================================

interface KeystoneAvatarProps {
  state?: 'idle' | 'thinking' | 'speaking' | 'success' | 'error' | 'celebrating';
  size?: 'small' | 'medium' | 'large';
  domain?: 'education' | 'business' | 'coaches';
  showPulse?: boolean;
  className?: string;
}

export function KeystoneAvatar({ 
  state = 'idle', 
  size = 'medium', 
  domain,
  showPulse = true,
  className = '' 
}: KeystoneAvatarProps) {
  const { config } = useDomain();
  const avatarDomain = domain || (config?.type || 'education');
  
  // Size configurations
  const sizes = {
    small: { width: 32, height: 36, strokeWidth: 1 },
    medium: { width: 48, height: 54, strokeWidth: 1.5 },
    large: { width: 72, height: 81, strokeWidth: 2 }
  };
  
  const { width, height, strokeWidth } = sizes[size];
  
  // Domain-specific color schemes
  const domainColors = {
    education: {
      primary: '#059669', // green-600
      secondary: '#10b981', // green-500
      accent: '#34d399', // green-400
      glow: '#6ee7b7' // green-300
    },
    business: {
      primary: '#3b82f6', // blue-500
      secondary: '#6366f1', // indigo-500
      accent: '#8b5cf6', // violet-500
      glow: '#a78bfa' // violet-400
    },
    coaches: {
      primary: '#8b5cf6', // violet-500
      secondary: '#d946ef', // fuchsia-500
      accent: '#f97316', // orange-500
      glow: '#fbbf24' // amber-400
    }
  };
  
  const colors = domainColors[avatarDomain as keyof typeof domainColors] || domainColors.education;
  
  // Animation classes based on state
  const getAnimationClass = () => {
    switch (state) {
      case 'thinking':
        return 'animate-pulse';
      case 'speaking':
        return 'animate-bounce';
      case 'success':
        return 'animate-ping';
      case 'celebrating':
        return 'animate-spin';
      case 'error':
        return 'animate-pulse';
      default:
        return showPulse ? 'animate-pulse' : '';
    }
  };
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Glow effect for special states */}
        {(state === 'success' || state === 'celebrating') && (
          <div 
            className="absolute inset-0 rounded-full blur-md opacity-75 animate-ping"
            style={{ backgroundColor: colors.glow }}
          />
        )}
        
        {/* Main Keystone SVG */}
        <svg
          width={width}
          height={height}
          viewBox="0 0 48 54"
          className={`${getAnimationClass()} transition-all duration-300 ease-in-out`}
          style={{ filter: state === 'error' ? 'hue-rotate(45deg)' : 'none' }}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id={`keystoneGradient-${avatarDomain}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.accent} />
            </linearGradient>
            
            <linearGradient id={`keystoneGlow-${avatarDomain}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.glow} stopOpacity="0.4" />
            </linearGradient>
            
            {/* Inner glow filter */}
            <filter id={`innerGlow-${avatarDomain}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Keystone Shape - Classic architectural keystone */}
          <path
            d="M24 2 
               L40 18 
               L36 18 
               L36 48 
               L32 52 
               L16 52 
               L12 48 
               L12 18 
               L8 18 
               L24 2 Z"
            fill={`url(#keystoneGradient-${avatarDomain})`}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            filter={state === 'success' ? `url(#innerGlow-${avatarDomain})` : 'none'}
            className="transition-all duration-300"
          />
          
          {/* Inner highlight for depth */}
          <path
            d="M24 6 
               L36 18 
               L32 18 
               L32 46 
               L28 48 
               L20 48 
               L16 46 
               L16 18 
               L12 18 
               L24 6 Z"
            fill={`url(#keystoneGlow-${avatarDomain})`}
            opacity="0.6"
            className={state === 'thinking' ? 'animate-pulse' : ''}
          />
          
          {/* Face elements for personality */}
          {state !== 'idle' && (
            <>
              {/* Eyes */}
              <circle cx="20" cy="24" r="2" fill={colors.primary} opacity="0.8" />
              <circle cx="28" cy="24" r="2" fill={colors.primary} opacity="0.8" />
              
              {/* Expression based on state */}
              {state === 'success' && (
                <path
                  d="M18 32 Q24 38 30 32"
                  stroke={colors.primary}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              
              {state === 'thinking' && (
                <circle cx="24" cy="32" r="1" fill={colors.primary} opacity="0.6" />
              )}
              
              {state === 'error' && (
                <path
                  d="M18 36 Q24 30 30 36"
                  stroke={colors.primary}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </>
          )}
        </svg>
        
        {/* Status indicator for different states */}
        {state === 'speaking' && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
        
        {state === 'thinking' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// 2. AVATAR CHAT INTERFACE COMPONENT
// =============================================================================

interface AvatarChatProps {
  message: string;
  isTyping?: boolean;
  avatarState?: 'idle' | 'thinking' | 'speaking' | 'success' | 'error';
  domain?: 'education' | 'business' | 'coaches';
  showAvatar?: boolean;
}

export function AvatarChatMessage({ 
  message, 
  isTyping = false, 
  avatarState = 'speaking',
  domain,
  showAvatar = true 
}: AvatarChatProps) {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [currentState, setCurrentState] = useState<'thinking' | 'speaking' | 'idle'>('thinking');
  
  // Typewriter effect
  useEffect(() => {
    if (!message) return;
    
    setCurrentState('thinking');
    const thinkingDelay = setTimeout(() => {
      setCurrentState('speaking');
      
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < message.length) {
          setDisplayedMessage(message.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setCurrentState('idle');
        }
      }, 30); // Typing speed
      
      return () => clearInterval(typeInterval);
    }, 800); // Thinking delay
    
    return () => clearTimeout(thinkingDelay);
  }, [message]);
  
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border">
      {showAvatar && (
        <div className="flex-shrink-0">
          <KeystoneAvatar 
            state={currentState} 
            size="medium" 
            domain={domain}
            showPulse={currentState === 'thinking'}
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">Keystone AI</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Tournament Assistant
          </span>
        </div>
        
        <div className="text-gray-700 leading-relaxed">
          {currentState === 'thinking' ? (
            <div className="flex items-center gap-1 text-gray-500">
              <span>Thinking</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <span>{displayedMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}