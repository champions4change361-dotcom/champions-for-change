import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface TournamentPreviewData {
  name?: string;
  sport?: string;
  format?: string;
  teams?: any[];
  settings?: any;
  flow?: 'registration' | 'bracket';
  startedAt?: number;
  lastSavedAt?: number;
  sectionsCompleted?: string[];
}

interface PreviewProgress {
  percentage: number;
  completedSections: number;
  totalSections: number;
  timeSpent: number;
  sectionsCompleted: string[];
}

export function useTournamentPreview() {
  const { isAuthenticated } = useAuth();
  const [previewData, setPreviewData] = useState<TournamentPreviewData | null>(null);
  const [showSmartPrompt, setShowSmartPrompt] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());

  const STORAGE_KEY = 'tournament_preview_data';
  const SMART_PROMPT_THRESHOLDS = {
    TIME_SPENT: 5 * 60 * 1000, // 5 minutes
    SECTIONS_COMPLETED: 3, // 3 sections
    FORM_INTERACTIONS: 10 // 10 form interactions
  };

  // Load preview data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPreviewData(parsed);
      } catch (error) {
        console.error('Failed to parse saved tournament data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save preview data to localStorage
  const savePreviewData = useCallback((data: Partial<TournamentPreviewData>) => {
    if (isAuthenticated) {
      // If user is authenticated, don't save to preview mode
      return;
    }

    const currentData = previewData || {
      startedAt: Date.now(),
      sectionsCompleted: []
    };

    const updatedData = {
      ...currentData,
      ...data,
      lastSavedAt: Date.now()
    };

    setPreviewData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  }, [previewData, isAuthenticated]);

  // Mark section as completed
  const markSectionCompleted = useCallback((sectionId: string) => {
    if (isAuthenticated) return;

    const currentSections = previewData?.sectionsCompleted || [];
    if (!currentSections.includes(sectionId)) {
      const newSections = [...currentSections, sectionId];
      savePreviewData({
        sectionsCompleted: newSections
      });

      // Check if we should show smart prompt
      checkSmartPromptTriggers(newSections.length);
    }
  }, [previewData, savePreviewData, isAuthenticated]);

  // Check if smart prompt should be shown
  const checkSmartPromptTriggers = useCallback((sectionsCompleted: number) => {
    if (isAuthenticated || showSmartPrompt) return;

    const timeSpent = Date.now() - sessionStartTime;
    const shouldShowPrompt = 
      timeSpent >= SMART_PROMPT_THRESHOLDS.TIME_SPENT ||
      sectionsCompleted >= SMART_PROMPT_THRESHOLDS.SECTIONS_COMPLETED;

    if (shouldShowPrompt) {
      setShowSmartPrompt(true);
    }
  }, [isAuthenticated, showSmartPrompt, sessionStartTime]);

  // Periodic time check for smart prompts
  useEffect(() => {
    if (isAuthenticated || showSmartPrompt) return;

    const interval = setInterval(() => {
      const timeSpent = Date.now() - sessionStartTime;
      if (timeSpent >= SMART_PROMPT_THRESHOLDS.TIME_SPENT) {
        setShowSmartPrompt(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, showSmartPrompt, sessionStartTime]);

  // Calculate progress
  const getProgress = useCallback((): PreviewProgress => {
    if (!previewData) {
      return {
        percentage: 0,
        completedSections: 0,
        totalSections: 8, // Total sections in tournament creation
        timeSpent: 0,
        sectionsCompleted: []
      };
    }

    const totalSections = 8;
    const completedSections = previewData.sectionsCompleted?.length || 0;
    const percentage = Math.round((completedSections / totalSections) * 100);
    const timeSpent = Date.now() - sessionStartTime;

    return {
      percentage,
      completedSections,
      totalSections,
      timeSpent,
      sectionsCompleted: previewData.sectionsCompleted || []
    };
  }, [previewData, sessionStartTime]);

  // Clear preview data (after successful save)
  const clearPreviewData = useCallback(() => {
    setPreviewData(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowSmartPrompt(false);
  }, []);

  // Check if we have saved data to recover
  const hasSavedData = useCallback(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  }, []);

  // Get recovery data for post-auth
  const getRecoveryData = useCallback(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Failed to parse recovery data:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Dismiss smart prompt
  const dismissSmartPrompt = useCallback(() => {
    setShowSmartPrompt(false);
  }, []);

  // Force show smart prompt (for testing)
  const forceSmartPrompt = useCallback(() => {
    setShowSmartPrompt(true);
  }, []);

  return {
    // State
    previewData,
    isPreviewMode: !isAuthenticated,
    showSmartPrompt,
    
    // Actions
    savePreviewData,
    markSectionCompleted,
    clearPreviewData,
    dismissSmartPrompt,
    forceSmartPrompt,
    
    // Data
    progress: getProgress(),
    hasSavedData: hasSavedData(),
    recoveryData: getRecoveryData(),
    
    // Helper
    timeSpent: Date.now() - sessionStartTime
  };
}