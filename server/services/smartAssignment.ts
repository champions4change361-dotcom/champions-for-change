/**
 * Smart Tournament Registration Assignment Service
 * 
 * Handles intelligent participant placement into tournament divisions and events
 * based on criteria matching, capacity management, and conflict resolution.
 */

import type { 
  RegistrationSubmission, 
  TournamentRegistrationForm,
  Tournament
} from "@shared/schema";

export interface MatchingCriteria {
  age?: number;
  grade?: string;
  gender?: string;
  skillLevel?: string;
  requestedEventIds?: string[];
}

export interface DivisionMatch {
  divisionId: string;
  name: string;
  matchScore: number; // 0-100, higher = better match
  capacityStatus: 'available' | 'limited' | 'full' | 'waitlist';
  currentCount: number;
  maxCapacity: number;
  reasons: string[]; // Why this division matches
}

export interface EventMatch {
  eventId: string;
  name: string;
  matchScore: number;
  capacityStatus: 'available' | 'limited' | 'full' | 'waitlist';
  currentCount: number;
  maxCapacity: number;
  conflicts: string[]; // Time conflicts or other issues
  priority: 'high' | 'medium' | 'low'; // From participant preferences
}

export interface AssignmentResult {
  success: boolean;
  divisionAssignment?: {
    divisionId: string;
    seedNumber?: number;
    waitlisted: boolean;
  };
  eventAssignments: Array<{
    eventId: string;
    confirmed: boolean;
    waitlisted: boolean;
    alternateFor?: string; // If this is an alternate assignment
  }>;
  conflicts: string[];
  recommendedActions: string[];
  assignmentLog: Array<{
    action: string;
    reason: string;
    timestamp: Date;
  }>;
}

/**
 * Core Smart Assignment Engine
 */
export class SmartAssignmentService {
  
  /**
   * Evaluates potential division matches for a participant
   */
  static evaluateDivisionMatches(
    participant: MatchingCriteria,
    availableDivisions: Array<{
      id: string;
      name: string;
      ageRange?: { min: number; max: number };
      gradeRange?: string[];
      genderRequirement?: string;
      skillLevelRequirement?: string;
      currentCount: number;
      maxCapacity: number;
    }>
  ): DivisionMatch[] {
    
    return availableDivisions.map(division => {
      let matchScore = 0;
      const reasons: string[] = [];
      
      // Age matching (40% weight)
      if (division.ageRange && participant.age) {
        if (participant.age >= division.ageRange.min && participant.age <= division.ageRange.max) {
          matchScore += 40;
          reasons.push(`Age ${participant.age} fits ${division.ageRange.min}-${division.ageRange.max} range`);
        } else {
          matchScore -= 30; // Penalty for age mismatch
          reasons.push(`Age ${participant.age} outside ${division.ageRange.min}-${division.ageRange.max} range`);
        }
      }
      
      // Gender matching (30% weight)
      if (division.genderRequirement && participant.gender) {
        const genderMatches = this.evaluateGenderMatch(participant.gender, division.genderRequirement);
        if (genderMatches) {
          matchScore += 30;
          reasons.push(`Gender ${participant.gender} matches ${division.genderRequirement} requirement`);
        } else {
          matchScore -= 40; // Higher penalty for gender mismatch
          reasons.push(`Gender ${participant.gender} doesn't match ${division.genderRequirement} requirement`);
        }
      }
      
      // Grade matching (20% weight)
      if (division.gradeRange && participant.grade) {
        if (division.gradeRange.includes(participant.grade)) {
          matchScore += 20;
          reasons.push(`Grade ${participant.grade} is allowed`);
        } else {
          matchScore -= 15;
          reasons.push(`Grade ${participant.grade} not in allowed grades: ${division.gradeRange.join(', ')}`);
        }
      }
      
      // Skill level matching (10% weight)
      if (division.skillLevelRequirement && participant.skillLevel) {
        if (participant.skillLevel === division.skillLevelRequirement) {
          matchScore += 10;
          reasons.push(`Skill level ${participant.skillLevel} matches exactly`);
        } else {
          matchScore -= 5;
          reasons.push(`Skill level ${participant.skillLevel} doesn't match ${division.skillLevelRequirement}`);
        }
      }
      
      // Capacity status
      const capacityPercentage = division.currentCount / division.maxCapacity;
      let capacityStatus: 'available' | 'limited' | 'full' | 'waitlist';
      
      if (capacityPercentage < 0.7) {
        capacityStatus = 'available';
      } else if (capacityPercentage < 0.95) {
        capacityStatus = 'limited';
        matchScore -= 5; // Small penalty for limited capacity
      } else if (capacityPercentage < 1.0) {
        capacityStatus = 'full';
        matchScore -= 20; // Larger penalty for nearly full
      } else {
        capacityStatus = 'waitlist';
        matchScore -= 30; // Significant penalty for waitlist
      }
      
      return {
        divisionId: division.id,
        name: division.name,
        matchScore: Math.max(0, matchScore), // Never negative
        capacityStatus,
        currentCount: division.currentCount,
        maxCapacity: division.maxCapacity,
        reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Best matches first
  }
  
  /**
   * Evaluates potential event matches for Track & Field and multi-event sports
   */
  static evaluateEventMatches(
    participant: MatchingCriteria,
    availableEvents: Array<{
      id: string;
      name: string;
      ageGroup?: string;
      gender?: string;
      category?: string;
      currentCount: number;
      maxCapacity: number;
      schedule?: {
        date: string;
        startTime: string;
        endTime: string;
      };
    }>
  ): EventMatch[] {
    
    const requestedEvents = participant.requestedEventIds || [];
    
    return availableEvents.map(event => {
      let matchScore = 0;
      const conflicts: string[] = [];
      
      // Direct request matching (60% weight)
      if (requestedEvents.includes(event.id)) {
        matchScore += 60;
      }
      
      // Age/gender compatibility (30% weight)
      if (event.ageGroup && participant.age) {
        // Parse age groups like "U12", "12-14", "15+"
        if (this.evaluateAgeGroupMatch(participant.age, event.ageGroup)) {
          matchScore += 15;
        } else {
          matchScore -= 20;
          conflicts.push(`Age ${participant.age} doesn't match event age group ${event.ageGroup}`);
        }
      }
      
      if (event.gender && participant.gender) {
        if (this.evaluateGenderMatch(participant.gender, event.gender)) {
          matchScore += 15;
        } else {
          matchScore -= 25;
          conflicts.push(`Gender ${participant.gender} doesn't match event requirement ${event.gender}`);
        }
      }
      
      // Category appropriateness (10% weight)
      if (event.category && participant.skillLevel) {
        // Match categories like "Sprint", "Distance", "Field" with skill levels
        if (this.evaluateCategoryMatch(participant.skillLevel, event.category)) {
          matchScore += 10;
        }
      }
      
      // Capacity status
      const capacityPercentage = event.currentCount / event.maxCapacity;
      let capacityStatus: 'available' | 'limited' | 'full' | 'waitlist';
      
      if (capacityPercentage < 0.8) {
        capacityStatus = 'available';
      } else if (capacityPercentage < 0.95) {
        capacityStatus = 'limited';
        matchScore -= 5;
      } else if (capacityPercentage < 1.0) {
        capacityStatus = 'full';
        matchScore -= 15;
      } else {
        capacityStatus = 'waitlist';
        matchScore -= 25;
      }
      
      // Determine priority based on participant preferences
      const priority: 'high' | 'medium' | 'low' = requestedEvents.includes(event.id) ? 'high' : 
                      matchScore > 50 ? 'medium' : 'low';
      
      return {
        eventId: event.id,
        name: event.name,
        matchScore: Math.max(0, matchScore),
        capacityStatus,
        currentCount: event.currentCount,
        maxCapacity: event.maxCapacity,
        conflicts,
        priority
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
  
  /**
   * Processes a complete assignment for a participant
   */
  static async processAssignment(
    submission: RegistrationSubmission,
    tournament: Tournament,
    form: TournamentRegistrationForm
  ): Promise<AssignmentResult> {
    
    const log: Array<{ action: string; reason: string; timestamp: Date }> = [];
    const conflicts: string[] = [];
    const recommendedActions: string[] = [];
    
    log.push({
      action: 'Started assignment process',
      reason: `Processing submission ${submission.id} for tournament ${tournament.name}`,
      timestamp: new Date()
    });
    
    // Extract participant criteria
    const participant: MatchingCriteria = {
      age: submission.age || undefined,
      grade: submission.grade || undefined,
      gender: submission.gender || undefined,
      skillLevel: submission.skillLevel || undefined,
      requestedEventIds: submission.requestedEventIds || undefined
    };
    
    // STEP 1: Get available divisions from tournament
    const mockDivisions = [
      {
        id: 'div_boys_u12',
        name: 'Boys U12',
        ageRange: { min: 10, max: 12 },
        genderRequirement: 'boys',
        currentCount: 8,
        maxCapacity: 16
      },
      {
        id: 'div_girls_u12', 
        name: 'Girls U12',
        ageRange: { min: 10, max: 12 },
        genderRequirement: 'girls',
        currentCount: 6,
        maxCapacity: 16
      }
    ];
    
    // STEP 2: Evaluate division matches
    const divisionMatches = this.evaluateDivisionMatches(participant, mockDivisions);
    
    let divisionAssignment;
    let success = false;
    
    // STEP 3: Assign to best matching division with available capacity
    if (divisionMatches.length > 0) {
      const bestMatch = divisionMatches[0];
      
      if (bestMatch.capacityStatus === 'available' || bestMatch.capacityStatus === 'limited') {
        // Assign to division
        divisionAssignment = {
          divisionId: bestMatch.divisionId,
          seedNumber: bestMatch.currentCount + 1, // Simple seeding
          waitlisted: false
        };
        success = true;
        
        log.push({
          action: 'Division assigned',
          reason: `Assigned to ${bestMatch.name} with match score ${bestMatch.matchScore}`,
          timestamp: new Date()
        });
      } else if (bestMatch.capacityStatus === 'full') {
        // Put on waitlist
        divisionAssignment = {
          divisionId: bestMatch.divisionId,
          waitlisted: true
        };
        conflicts.push(`Division ${bestMatch.name} is full - placed on waitlist`);
        
        log.push({
          action: 'Waitlisted',
          reason: `Division ${bestMatch.name} at capacity - waitlisted`,
          timestamp: new Date()
        });
      } else {
        conflicts.push('No divisions available with capacity');
        recommendedActions.push('Consider creating additional divisions or expanding capacity');
      }
    } else {
      conflicts.push('No matching divisions found for participant criteria');
      recommendedActions.push('Review division criteria or participant information');
    }
    
    // STEP 4: Handle multi-event assignments (Track & Field)
    const eventAssignments: Array<{
      eventId: string;
      confirmed: boolean;
      waitlisted: boolean;
      alternateFor?: string;
    }> = [];
    
    if (participant.requestedEventIds && participant.requestedEventIds.length > 0) {
      // Mock events for Track & Field
      const mockEvents = [
        {
          id: 'event_100m',
          name: '100m Dash',
          ageGroup: 'U12',
          gender: 'boys',
          category: 'sprint',
          currentCount: 8,
          maxCapacity: 12
        }
      ];
      
      const eventMatches = this.evaluateEventMatches(participant, mockEvents);
      
      for (const eventMatch of eventMatches.slice(0, 3)) { // Limit to 3 events max
        if (eventMatch.capacityStatus === 'available' || eventMatch.capacityStatus === 'limited') {
          eventAssignments.push({
            eventId: eventMatch.eventId,
            confirmed: true,
            waitlisted: false
          });
          
          log.push({
            action: 'Event assigned',
            reason: `Assigned to ${eventMatch.name} (score: ${eventMatch.matchScore})`,
            timestamp: new Date()
          });
        } else {
          eventAssignments.push({
            eventId: eventMatch.eventId,
            confirmed: false,
            waitlisted: true
          });
          
          log.push({
            action: 'Event waitlisted',
            reason: `${eventMatch.name} at capacity - waitlisted`,
            timestamp: new Date()
          });
        }
      }
    }
    
    const result: AssignmentResult = {
      success,
      divisionAssignment,
      eventAssignments,
      conflicts,
      recommendedActions,
      assignmentLog: log
    };
    
    log.push({
      action: 'Assignment completed',
      reason: `Result: ${result.success ? 'Success' : 'Failed'} - ${conflicts.length} conflicts`,
      timestamp: new Date()
    });
    
    return result;
  }
  
  /**
   * Helper: Evaluate gender matching with flexible criteria
   */
  private static evaluateGenderMatch(participantGender: string, requirementGender: string): boolean {
    // Handle various gender matching scenarios
    const genderMap: Record<string, string[]> = {
      'boys': ['boys', 'men', 'male'],
      'girls': ['girls', 'women', 'female'],
      'men': ['men', 'boys', 'male'],
      'women': ['women', 'girls', 'female'],
      'mixed': ['boys', 'girls', 'men', 'women', 'male', 'female', 'mixed', 'co-ed'],
      'co-ed': ['boys', 'girls', 'men', 'women', 'male', 'female', 'mixed', 'co-ed']
    };
    
    const allowedGenders = genderMap[requirementGender.toLowerCase()] || [requirementGender.toLowerCase()];
    return allowedGenders.includes(participantGender.toLowerCase());
  }
  
  /**
   * Helper: Evaluate age group matching
   */
  private static evaluateAgeGroupMatch(age: number, ageGroup: string): boolean {
    // Parse age groups like "U12", "12-14", "15+", "Adult"
    ageGroup = ageGroup.toLowerCase().trim();
    
    if (ageGroup.startsWith('u')) {
      const maxAge = parseInt(ageGroup.substring(1));
      return age <= maxAge;
    }
    
    if (ageGroup.includes('-')) {
      const [min, max] = ageGroup.split('-').map(s => parseInt(s.trim()));
      return age >= min && age <= max;
    }
    
    if (ageGroup.endsWith('+')) {
      const minAge = parseInt(ageGroup.substring(0, ageGroup.length - 1));
      return age >= minAge;
    }
    
    if (ageGroup === 'adult') {
      return age >= 18;
    }
    
    if (ageGroup === 'youth') {
      return age < 18;
    }
    
    // Direct age match
    const exactAge = parseInt(ageGroup);
    if (!isNaN(exactAge)) {
      return age === exactAge;
    }
    
    return false;
  }
  
  /**
   * Helper: Evaluate category/skill matching
   */
  private static evaluateCategoryMatch(skillLevel: string, category: string): boolean {
    // Basic skill-to-category matching
    const skillMappings: Record<string, string[]> = {
      'beginner': ['novice', 'beginner', 'recreational', 'youth'],
      'intermediate': ['intermediate', 'competitive', 'varsity'],
      'advanced': ['advanced', 'elite', 'collegiate', 'varsity'],
      'expert': ['expert', 'elite', 'professional', 'open']
    };
    
    const matchingCategories = skillMappings[skillLevel.toLowerCase()] || [];
    return matchingCategories.some(cat => category.toLowerCase().includes(cat));
  }
}

/**
 * Capacity Management Utilities
 */
export class CapacityManager {
  
  /**
   * Check if capacity is available for a target (division or event)
   */
  static checkCapacityAvailable(
    currentCount: number,
    maxCapacity: number,
    requiredSlots: number = 1
  ): {
    available: boolean;
    remaining: number;
    status: 'available' | 'limited' | 'full' | 'waitlist';
  } {
    
    const remaining = maxCapacity - currentCount;
    const available = remaining >= requiredSlots;
    
    let status: 'available' | 'limited' | 'full' | 'waitlist';
    const utilizationRate = currentCount / maxCapacity;
    
    if (utilizationRate < 0.7) {
      status = 'available';
    } else if (utilizationRate < 0.95) {
      status = 'limited';
    } else if (utilizationRate < 1.0) {
      status = 'full';
    } else {
      status = 'waitlist';
    }
    
    return {
      available,
      remaining: Math.max(0, remaining),
      status
    };
  }
  
  /**
   * Calculate optimal assignment distribution
   */
  static calculateOptimalDistribution(
    participants: Array<{ id: string; preferences: string[] }>,
    targets: Array<{ id: string; capacity: number; currentCount: number }>
  ): Array<{ participantId: string; targetId: string; confidence: number }> {
    
    // Simple first-fit algorithm for now
    // TODO: Implement more sophisticated optimization
    
    const assignments: Array<{ participantId: string; targetId: string; confidence: number }> = [];
    
    participants.forEach(participant => {
      // Find best available target
      const sortedTargets = targets
        .filter(target => target.currentCount < target.capacity)
        .sort((a, b) => (a.currentCount / a.capacity) - (b.currentCount / b.capacity));
      
      if (sortedTargets.length > 0) {
        assignments.push({
          participantId: participant.id,
          targetId: sortedTargets[0].id,
          confidence: 0.8 // Default confidence
        });
        
        // Update current count for next iteration
        sortedTargets[0].currentCount++;
      }
    });
    
    return assignments;
  }
}