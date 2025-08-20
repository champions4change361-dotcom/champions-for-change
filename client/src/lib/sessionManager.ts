// Anonymous session management for AI-guided onboarding
import { v4 as uuidv4 } from 'uuid';

export interface AnonymousSession {
  sessionId: string;
  aiConversation: AIMessage[];
  buildSelections: BuildSelections;
  userContext: UserContext;
  timestamp: number;
  lastActivity: number;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    extractedData?: any;
    routingSuggestion?: string;
  };
}

export interface BuildSelections {
  sportType?: string;
  tournamentFormat?: string;
  teamCount?: number;
  venue?: string;
  budget?: string;
  goals?: string;
  features?: string[];
  participantCount?: string;
  organizationType?: 'school' | 'community' | 'business';
  districtInfo?: {
    name?: string;
    state?: string;
    schoolCount?: number;
  };
}

export interface UserContext {
  role?: 'coach' | 'athletic_director' | 'district_admin' | 'organizer';
  organization?: string;
  previousExperience?: string;
  primaryNeeds?: string[];
  detectedIntent?: string;
}

class SessionManager {
  private readonly STORAGE_KEY = 'anonymous_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // Get or create anonymous session
  getSession(): AnonymousSession {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      const session = JSON.parse(stored);
      
      // Check if session is still valid
      if (Date.now() - session.timestamp < this.SESSION_DURATION) {
        // Update last activity
        session.lastActivity = Date.now();
        this.saveSession(session);
        return session;
      }
    }
    
    // Create new session
    return this.createNewSession();
  }
  
  private createNewSession(): AnonymousSession {
    const session: AnonymousSession = {
      sessionId: uuidv4(),
      aiConversation: [],
      buildSelections: {},
      userContext: {},
      timestamp: Date.now(),
      lastActivity: Date.now()
    };
    
    this.saveSession(session);
    return session;
  }
  
  // Add AI message to conversation
  addAIMessage(message: AIMessage): void {
    const session = this.getSession();
    session.aiConversation.push(message);
    session.lastActivity = Date.now();
    
    // Extract data from message if possible
    this.extractDataFromMessage(session, message);
    
    this.saveSession(session);
  }
  
  // Update build selections
  updateBuildSelections(updates: Partial<BuildSelections>): void {
    const session = this.getSession();
    session.buildSelections = { ...session.buildSelections, ...updates };
    session.lastActivity = Date.now();
    this.saveSession(session);
  }
  
  // Update user context
  updateUserContext(updates: Partial<UserContext>): void {
    const session = this.getSession();
    session.userContext = { ...session.userContext, ...updates };
    session.lastActivity = Date.now();
    this.saveSession(session);
  }
  
  // Smart intent detection from user messages
  private extractDataFromMessage(session: AnonymousSession, message: AIMessage): void {
    if (message.role !== 'user') return;
    
    const content = message.content.toLowerCase();
    
    // Extract organization info
    const schoolMatches = content.match(/(?:at|from)\s+([^,.\n]+(?:high school|middle school|elementary|isd|district))/i);
    if (schoolMatches) {
      session.userContext.organization = schoolMatches[1];
    }
    
    // Extract role indicators
    if (content.includes('coach') || content.includes('coaching')) {
      session.userContext.role = 'coach';
    } else if (content.includes('athletic director') || content.includes('ad ')) {
      session.userContext.role = 'athletic_director';
    } else if (content.includes('district') || content.includes('superintendent')) {
      session.userContext.role = 'district_admin';
    }
    
    // Extract sport preferences
    const sports = ['football', 'basketball', 'baseball', 'soccer', 'volleyball', 'tennis', 'track', 'swimming'];
    for (const sport of sports) {
      if (content.includes(sport)) {
        session.buildSelections.sportType = sport;
        break;
      }
    }
    
    // Extract intent
    if (content.includes('tournament') || content.includes('competition')) {
      session.userContext.detectedIntent = 'tournament_creation';
    } else if (content.includes('health') || content.includes('injury') || content.includes('medical')) {
      session.userContext.detectedIntent = 'health_monitoring';
    } else if (content.includes('budget') || content.includes('financial')) {
      session.userContext.detectedIntent = 'budget_management';
    } else if (content.includes('district') || content.includes('schools')) {
      session.userContext.detectedIntent = 'district_management';
    }
  }
  
  // Get AI routing suggestions based on session data
  getRoutingSuggestions(): string[] {
    const session = this.getSession();
    const suggestions: string[] = [];
    
    const { buildSelections, userContext } = session;
    
    // Role-based suggestions
    if (userContext.role === 'coach') {
      suggestions.push('Tournament Creation Wizard');
      suggestions.push('Team Health Monitoring Setup');
    } else if (userContext.role === 'athletic_director') {
      suggestions.push('District Budget Management');
      suggestions.push('Multi-School Tournament Setup');
      suggestions.push('Compliance Dashboard');
    } else if (userContext.role === 'district_admin') {
      suggestions.push('District-Wide Analytics');
      suggestions.push('Organizational Chart Builder');
      suggestions.push('Cross-School Coordination');
    }
    
    // Intent-based suggestions
    if (userContext.detectedIntent === 'tournament_creation') {
      suggestions.unshift('Continue Tournament Setup');
    } else if (userContext.detectedIntent === 'health_monitoring') {
      suggestions.unshift('Athletic Trainer Dashboard');
    }
    
    // Context-based suggestions
    if (buildSelections.sportType) {
      suggestions.push(`${buildSelections.sportType} Tournament Templates`);
    }
    
    return Array.from(new Set(suggestions)); // Remove duplicates
  }
  
  // Prepare data for registration handoff
  prepareRegistrationData(): {
    buildProgress: BuildSelections;
    aiHistory: AIMessage[];
    suggestedNext: string[];
    userContext: UserContext;
  } {
    const session = this.getSession();
    
    return {
      buildProgress: session.buildSelections,
      aiHistory: session.aiConversation,
      suggestedNext: this.getRoutingSuggestions(),
      userContext: session.userContext
    };
  }
  
  // Migrate session data to registered user
  async migrateToRegisteredUser(userId: string): Promise<void> {
    const sessionData = this.prepareRegistrationData();
    
    try {
      // Send to backend for permanent storage
      await fetch('/api/users/migrate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionData,
          sessionId: this.getSession().sessionId
        })
      });
      
      // Clear anonymous session
      this.clearSession();
    } catch (error) {
      console.error('Failed to migrate session:', error);
      // Keep session data as fallback
    }
  }
  
  // Save session to localStorage and optionally sync to server
  private saveSession(session: AnonymousSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    
    // Optional: Sync to server for backup (fire and forget)
    this.syncToServer(session).catch(() => {
      // Silent fail - localStorage is primary storage
    });
  }
  
  private async syncToServer(session: AnonymousSession): Promise<void> {
    await fetch('/api/sessions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        data: session,
        backup: true
      })
    });
  }
  
  // Clear session (for logout or migration)
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Get session age in minutes
  getSessionAge(): number {
    const session = this.getSession();
    return Math.floor((Date.now() - session.timestamp) / (1000 * 60));
  }
  
  // Check if user has significant progress
  hasSignificantProgress(): boolean {
    const session = this.getSession();
    
    return (
      session.aiConversation.length >= 3 ||
      Object.keys(session.buildSelections).length >= 2 ||
      !!session.userContext.organization ||
      !!session.userContext.role
    );
  }
}

export const sessionManager = new SessionManager();