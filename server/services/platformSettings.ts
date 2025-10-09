import { db } from '../db';
import { platformSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Type for platform settings organized by category
export type PlatformSettingsMap = {
  theme: Record<string, string>;
  content: Record<string, string>;
  general: Record<string, string>;
  media: Record<string, string>;
};

// In-memory cache of platform settings
let settingsCache: PlatformSettingsMap | null = null;
let lastLoadTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load all platform settings from database and organize by category
 */
export async function loadPlatformSettings(): Promise<PlatformSettingsMap> {
  try {
    const settings = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.isActive, true));

    const organized: PlatformSettingsMap = {
      theme: {},
      content: {},
      general: {},
      media: {}
    };

    for (const setting of settings) {
      const category = setting.category as keyof PlatformSettingsMap;
      if (organized[category]) {
        // Use settingValue if available, otherwise use settingJsonValue
        const value = setting.settingValue || JSON.stringify(setting.settingJsonValue);
        organized[category][setting.settingKey] = value;
      }
    }

    // Cache the settings
    settingsCache = organized;
    lastLoadTime = Date.now();

    console.log('✅ Platform settings loaded:', {
      theme: Object.keys(organized.theme).length,
      content: Object.keys(organized.content).length,
      general: Object.keys(organized.general).length,
      media: Object.keys(organized.media).length
    });

    return organized;
  } catch (error) {
    console.error('❌ Failed to load platform settings:', error);
    // Return empty settings on error
    return {
      theme: {},
      content: {},
      general: {},
      media: {}
    };
  }
}

/**
 * Get platform settings (with cache)
 */
export async function getPlatformSettings(forceRefresh = false): Promise<PlatformSettingsMap> {
  const now = Date.now();
  const isCacheValid = settingsCache && (now - lastLoadTime) < CACHE_TTL;

  if (!forceRefresh && isCacheValid) {
    return settingsCache!;
  }

  return await loadPlatformSettings();
}

/**
 * Invalidate the settings cache (call after updates)
 */
export function invalidateSettingsCache(): void {
  settingsCache = null;
  lastLoadTime = 0;
  console.log('🔄 Platform settings cache invalidated');
}

/**
 * Get default platform settings (fallback values)
 */
export function getDefaultSettings(): PlatformSettingsMap {
  return {
    theme: {
      primaryColor: '#10b981', // Green from Champions for Change
      secondaryColor: '#3b82f6', // Blue
      accentColor: '#f59e0b', // Amber
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    },
    content: {
      platformName: 'Trantor Tournaments',
      heroTitle: 'District Athletics Management Platform',
      heroSubtitle: 'Revolutionizing tournament management with AI-powered tools',
      ctaText: 'Get Started',
      footerText: 'Powered by Champions for Change'
    },
    general: {
      contactEmail: 'support@trantortournaments.org',
      supportPhone: '',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY'
    },
    media: {
      logoUrl: '',
      faviconUrl: '',
      heroImageUrl: ''
    }
  };
}
