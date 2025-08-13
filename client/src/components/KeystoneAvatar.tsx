// Keystone AI Avatar - Timeless Geometric Design
// Professional, domain-aware avatar that will never look dated

import { useState, useEffect } from 'react';

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
  domain = 'education',
  showPulse = true,
  className = '' 
}: KeystoneAvatarProps) {
  
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
  
  const colors = domainColors[domain] || domainColors.education;
  
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
    <div className={`inline-flex items-center justify-center ${className}`} data-testid="keystone-avatar">
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
          data-testid={`keystone-avatar-${domain}-${state}`}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id={`keystoneGradient-${domain}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.accent} />
            </linearGradient>
            
            <linearGradient id={`keystoneGlow-${domain}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.glow} stopOpacity="0.4" />
            </linearGradient>
            
            {/* Inner glow filter */}
            <filter id={`innerGlow-${domain}`}>
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
            fill={`url(#keystoneGradient-${domain})`}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            filter={state === 'success' ? `url(#innerGlow-${domain})` : 'none'}
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
            fill={`url(#keystoneGlow-${domain})`}
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
  domain = 'education',
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
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border" data-testid="avatar-chat-message">
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
            <div className="flex items-center gap-1 text-gray-500" data-testid="thinking-indicator">
              <span>Thinking</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <span data-testid="chat-message-text">{displayedMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 3. AVATAR PREFERENCE PREVIEW COMPONENT
// =============================================================================

interface AvatarPreferencePreviewProps {
  avatarEnabled: boolean;
  domain: 'education' | 'business' | 'coaches';
  onToggleAvatar: (enabled: boolean) => void;
}

export function AvatarPreferencePreview({ 
  avatarEnabled, 
  domain, 
  onToggleAvatar 
}: AvatarPreferencePreviewProps) {
  const [previewState, setPreviewState] = useState<'idle' | 'thinking' | 'speaking' | 'success'>('idle');
  
  const handlePreviewState = (state: typeof previewState) => {
    setPreviewState(state);
    setTimeout(() => setPreviewState('idle'), 2000);
  };
  
  const getDomainMessage = () => {
    switch (domain) {
      case 'education':
        return "Good morning. I'm here to assist you with your tournament management needs. How may I help you today?";
      case 'business':
        return "Hi there! I'm Keystone AI, your tournament assistant. Ready to create something amazing together?";
      case 'coaches':
        return "Hey coach! Let's fire up some epic tournaments and get this competition rolling! What's the game plan?";
      default:
        return "Tournament assistance available. How can I help?";
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border" data-testid="avatar-preference-preview">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatar Preferences</h3>
      
      {/* Avatar Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Enable Avatar</label>
          <p className="text-xs text-gray-500">Show Keystone AI's visual personality</p>
        </div>
        <button
          onClick={() => onToggleAvatar(!avatarEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            avatarEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          data-testid="button-toggle-avatar"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              avatarEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Avatar Preview */}
      {avatarEnabled && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            <KeystoneAvatar 
              state={previewState} 
              size="large" 
              domain={domain}
            />
          </div>
          
          {/* State Demo Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handlePreviewState('thinking')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              data-testid="button-preview-thinking"
            >
              Thinking
            </button>
            <button
              onClick={() => handlePreviewState('speaking')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              data-testid="button-preview-speaking"
            >
              Speaking
            </button>
            <button
              onClick={() => handlePreviewState('success')}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
              data-testid="button-preview-success"
            >
              Success
            </button>
          </div>
          
          {/* Sample Message */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Sample interaction:</p>
            <AvatarChatMessage
              message={getDomainMessage()}
              domain={domain}
              showAvatar={true}
              avatarState="speaking"
            />
          </div>
        </div>
      )}
      
      {/* Domain Information */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs font-medium text-blue-800 mb-1">Domain: {domain}</p>
        <p className="text-xs text-blue-600">
          {domain === 'education' && 'Professional tone for educational environments'}
          {domain === 'business' && 'Friendly, helpful approach for business users'}
          {domain === 'coaches' && 'Energetic, community-focused personality'}
        </p>
      </div>
    </div>
  );
}