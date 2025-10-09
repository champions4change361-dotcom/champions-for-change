import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type PlatformSettings = {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  content: {
    platformName: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    footerText: string;
  };
  general: {
    contactEmail: string;
    supportPhone: string;
    timezone: string;
    dateFormat: string;
  };
  media: {
    logoUrl: string;
    faviconUrl: string;
    heroImageUrl: string;
  };
};

type PlatformSettingsContextType = {
  settings: PlatformSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
};

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

export function PlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform-settings/active');
      
      if (!response.ok) {
        throw new Error('Failed to load platform settings');
      }

      const data = await response.json();
      setSettings(data);
      setError(null);

      // Apply theme colors to CSS variables
      if (data.theme) {
        applyThemeColors(data.theme);
      }
    } catch (err) {
      console.error('Error loading platform settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (theme: PlatformSettings['theme']) => {
    const root = document.documentElement;

    if (theme.primaryColor) {
      const primaryHSL = hexToHSL(theme.primaryColor);
      root.style.setProperty('--primary', primaryHSL);
    }

    if (theme.secondaryColor) {
      const secondaryHSL = hexToHSL(theme.secondaryColor);
      root.style.setProperty('--secondary', secondaryHSL);
    }

    if (theme.accentColor) {
      const accentHSL = hexToHSL(theme.accentColor);
      root.style.setProperty('--accent', accentHSL);
    }

    if (theme.backgroundColor) {
      const bgHSL = hexToHSL(theme.backgroundColor);
      root.style.setProperty('--background', bgHSL);
    }

    if (theme.textColor) {
      const textHSL = hexToHSL(theme.textColor);
      root.style.setProperty('--foreground', textHSL);
    }

    console.log('✅ Theme colors applied to CSS variables');
  };

  // Helper function to convert hex color to HSL format
  const hexToHSL = (hex: string): string => {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Convert to HSL values
    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${hue} ${saturation}% ${lightness}%`;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext);
  if (context === undefined) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider');
  }
  return context;
}
