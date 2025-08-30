import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';

interface OrganizerTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoUrl?: string;
  theme: 'light' | 'dark' | 'neutral';
}

const DEFAULT_NEUTRAL_THEME: OrganizerTheme = {
  primaryColor: '#000000',      // Clean black for primary elements
  secondaryColor: '#666666',    // Medium gray for secondary text
  backgroundColor: '#ffffff',   // Pure white background
  textColor: '#1a1a1a',        // Near-black for readability
  accentColor: '#3b82f6',      // Subtle blue for interactive elements
  theme: 'neutral'
};

export function useOrganizerTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<OrganizerTheme>(DEFAULT_NEUTRAL_THEME);

  useEffect(() => {
    if (user?.customBranding) {
      // Use organizer's custom branding if they've set any
      setTheme({
        ...DEFAULT_NEUTRAL_THEME,
        ...user.customBranding
      });
    } else {
      // Use clean neutral defaults for new organizers
      setTheme(DEFAULT_NEUTRAL_THEME);
    }
  }, [user]);

  // Apply theme as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--organizer-primary', theme.primaryColor);
    root.style.setProperty('--organizer-secondary', theme.secondaryColor);
    root.style.setProperty('--organizer-background', theme.backgroundColor);
    root.style.setProperty('--organizer-text', theme.textColor);
    root.style.setProperty('--organizer-accent', theme.accentColor);
  }, [theme]);

  const updateTheme = (newTheme: Partial<OrganizerTheme>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    // TODO: Save to backend via API call
  };

  const resetToDefaults = () => {
    setTheme(DEFAULT_NEUTRAL_THEME);
    // TODO: Clear custom branding via API call
  };

  return {
    theme,
    updateTheme,
    resetToDefaults,
    isNeutralTheme: theme.theme === 'neutral',
    // Helper utilities
    getButtonStyle: (variant: 'primary' | 'secondary' = 'primary') => ({
      backgroundColor: variant === 'primary' ? theme.primaryColor : theme.secondaryColor,
      color: variant === 'primary' ? theme.backgroundColor : theme.textColor,
      border: `1px solid ${variant === 'primary' ? theme.primaryColor : theme.secondaryColor}`
    }),
    getCardStyle: () => ({
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      border: `1px solid ${theme.secondaryColor}20`
    })
  };
}