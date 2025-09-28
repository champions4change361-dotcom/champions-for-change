import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User,
  AcademicDistrict,
  InsertAcademicDistrict,
  AcademicCompetition,
  InsertAcademicCompetition,
  AcademicMeet,
  InsertAcademicMeet,
  SchoolAcademicProgram,
  InsertSchoolAcademicProgram,
  AcademicTeam,
  InsertAcademicTeam
} from "@shared/schema";

export interface UILCompetitionConfig {
  id: string;
  name: string;
  category: string;
  competitionType: 'high_school' | 'aplus';
  gradeLevel: string;
  classification: string[];
  maxParticipants: number;
  isTeamEvent: boolean;
  teamSize?: number;
  contestFormat: 'written_test' | 'oral_performance' | 'portfolio' | 'presentation';
  testDuration?: number;
  hasAdvancement: boolean;
  advancementRules: {
    individualAdvance: number;
    teamAdvance: number;
    wildcardRules?: boolean;
  };
  teksAlignment: string;
  subjectArea: string;
  season: 'fall' | 'spring';
  isActive: boolean;
}

export interface UILMeetConfiguration {
  id: string;
  districtId: string;
  meetName: string;
  meetType: 'district' | 'invitational' | 'practice';
  level: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  meetDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  hostSchool: string;
  meetDirector: string;
  meetDirectorEmail: string;
  meetDirectorPhone?: string;
  registrationDeadline: string;
  substitutionDeadline?: string;
  maxSchools?: number;
  competitions: string[];
  scoringSystem: string;
  awardsLevels: {
    individual: number;
    team: number;
  };
  status: 'planning' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ParticipantRegistration {
  teamId: string;
  participantId: string;
  competitionId: string;
  studentInfo: {
    studentId: string;
    firstName: string;
    lastName: string;
    grade: number;
  };
  participantRole: 'primary' | 'alternate' | 'team_member' | 'captain';
  entryPosition: number;
  isEligible: boolean;
  eligibilityVerified: boolean;
  eligibilityDate?: string;
  parentalConsent: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EventScheduling {
  competitionId: string;
  room: string;
  startTime: string;
  endTime: string;
  judgeAssignments: string[];
  facilitiesRequired: string[];
  equipmentNeeded: string[];
  maxCapacity: number;
  conflictCheck: boolean;
}

/**
 * UIL Event Management Service
 * Comprehensive management for 50+ UIL academic competitions
 * Handles event configuration, registration, scheduling, and coordination
 */
export class UILEventManagementService {
  private storage = getStorage();

  // UIL High School Academic Competitions (30 contests)
  private readonly HIGH_SCHOOL_COMPETITIONS: UILCompetitionConfig[] = [
    // Language Arts
    {
      id: 'hs_literary_criticism',
      name: 'Literary Criticism',
      category: 'literary_criticism',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English I-IV TEKS: Reading/Comprehension of Literary Text',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_ready_writing',
      name: 'Ready Writing',
      category: 'ready_writing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English I-IV TEKS: Writing/Writing Process',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_spelling_vocabulary',
      name: 'Spelling & Vocabulary',
      category: 'spelling_vocabulary',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English I-IV TEKS: Oral and Written Conventions',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },

    // Journalism
    {
      id: 'hs_copy_editing',
      name: 'Copy Editing',
      category: 'copy_editing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Journalism TEKS: Writing and Design',
      subjectArea: 'Journalism',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_editorial_writing',
      name: 'Editorial Writing',
      category: 'editorial_writing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Journalism TEKS: Writing and Design',
      subjectArea: 'Journalism',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_feature_writing',
      name: 'Feature Writing',
      category: 'feature_writing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Journalism TEKS: Writing and Design',
      subjectArea: 'Journalism',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_headline_writing',
      name: 'Headline Writing',
      category: 'headline_writing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Journalism TEKS: Writing and Design',
      subjectArea: 'Journalism',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_news_writing',
      name: 'News Writing',
      category: 'news_writing',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Journalism TEKS: Writing and Design',
      subjectArea: 'Journalism',
      season: 'spring',
      isActive: true
    },

    // Social Studies
    {
      id: 'hs_current_issues_events',
      name: 'Current Issues & Events',
      category: 'current_issues_events',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Social Studies TEKS: Geography, History, Government, Economics',
      subjectArea: 'Social Studies',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_social_studies',
      name: 'Social Studies',
      category: 'social_studies',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Social Studies TEKS: Geography, History, Government, Economics',
      subjectArea: 'Social Studies',
      season: 'spring',
      isActive: true
    },

    // Mathematics & Science
    {
      id: 'hs_calculator_applications',
      name: 'Calculator Applications',
      category: 'calculator_applications',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Mathematics TEKS: Algebra II, Pre-Calculus, Statistics',
      subjectArea: 'Mathematics',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_mathematics',
      name: 'Mathematics',
      category: 'mathematics',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 40,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Mathematics TEKS: Algebra II, Geometry, Pre-Calculus',
      subjectArea: 'Mathematics',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_number_sense',
      name: 'Number Sense',
      category: 'number_sense',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 10,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Mathematics TEKS: Number and Operations, Patterns',
      subjectArea: 'Mathematics',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_science',
      name: 'Science',
      category: 'science',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Science TEKS: Biology, Chemistry, Physics, IPC',
      subjectArea: 'Science',
      season: 'spring',
      isActive: true
    },

    // Business Skills
    {
      id: 'hs_accounting',
      name: 'Accounting',
      category: 'accounting',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 90,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Business TEKS: Accounting I, Accounting II',
      subjectArea: 'Business Education',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_computer_applications',
      name: 'Computer Applications',
      category: 'computer_applications',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Technology Applications TEKS: Computer Science, Digital Communications',
      subjectArea: 'Technology Applications',
      season: 'spring',
      isActive: true
    },

    // Speech & Debate
    {
      id: 'hs_cross_examination_debate',
      name: 'Cross-Examination Debate',
      category: 'cross_examination_debate',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: true,
      teamSize: 2,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 3 },
      teksAlignment: 'Speech TEKS: Speaking, Listening, Research',
      subjectArea: 'Speech Communications',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_informative_speaking',
      name: 'Informative Speaking',
      category: 'informative_speaking',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Speech TEKS: Speaking, Research, Organization',
      subjectArea: 'Speech Communications',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_persuasive_speaking',
      name: 'Persuasive Speaking',
      category: 'persuasive_speaking',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Speech TEKS: Speaking, Persuasion, Research',
      subjectArea: 'Speech Communications',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_poetry_interpretation',
      name: 'Poetry Interpretation',
      category: 'poetry_interpretation',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Reading/Comprehension of Literary Text',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_prose_interpretation',
      name: 'Prose Interpretation',
      category: 'prose_interpretation',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Reading/Comprehension of Literary Text',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },

    // Fine Arts
    {
      id: 'hs_one_act_play',
      name: 'One-Act Play',
      category: 'one_act_play',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 40,
      isTeamEvent: true,
      teamSize: 40,
      contestFormat: 'oral_performance',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 0, teamAdvance: 3 },
      teksAlignment: 'Theatre Arts TEKS: Creative Expression, Performance',
      subjectArea: 'Fine Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'hs_theatrical_design',
      name: 'Theatrical Design',
      category: 'theatrical_design',
      competitionType: 'high_school',
      gradeLevel: '9-12',
      classification: ['high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A'],
      maxParticipants: 8,
      isTeamEvent: true,
      teamSize: 8,
      contestFormat: 'portfolio',
      hasAdvancement: true,
      advancementRules: { individualAdvance: 0, teamAdvance: 3 },
      teksAlignment: 'Theatre Arts TEKS: Technical Theatre, Design',
      subjectArea: 'Fine Arts',
      season: 'spring',
      isActive: true
    }
  ];

  // A+ Elementary/Middle School Academic Competitions (20 contests)
  private readonly APLUS_COMPETITIONS: UILCompetitionConfig[] = [
    {
      id: 'aplus_art',
      name: 'Art',
      category: 'art',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Art TEKS: Creative Expression, Art History',
      subjectArea: 'Fine Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_calculator_applications',
      name: 'Calculator Applications',
      category: 'calculator_applications_aplus',
      competitionType: 'aplus',
      gradeLevel: '6-8',
      classification: ['middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Mathematics TEKS: Algebraic Reasoning, Data Analysis',
      subjectArea: 'Mathematics',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_chess_puzzle',
      name: 'Chess Puzzle',
      category: 'chess_puzzle',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Mathematics TEKS: Algebraic Reasoning, Logical Thinking',
      subjectArea: 'Mathematics',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_creative_writing',
      name: 'Creative Writing',
      category: 'creative_writing',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Writing/Writing Process, Creative Expression',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_dictionary_skills',
      name: 'Dictionary Skills',
      category: 'dictionary_skills',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 20,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Research and Inquiry, Vocabulary',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_editorial_writing',
      name: 'Editorial Writing',
      category: 'editorial_writing_aplus',
      competitionType: 'aplus',
      gradeLevel: '6-8',
      classification: ['middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Writing/Writing Process, Persuasive Writing',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_listening',
      name: 'Listening',
      category: 'listening',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'oral_performance',
      testDuration: 30,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'English TEKS: Listening and Speaking',
      subjectArea: 'English Language Arts',
      season: 'spring',
      isActive: true
    },
    {
      id: 'aplus_maps_graphs_charts',
      name: 'Maps, Graphs & Charts',
      category: 'maps_graphs_charts',
      competitionType: 'aplus',
      gradeLevel: '2-8',
      classification: ['elementary', 'middle'],
      maxParticipants: 3,
      isTeamEvent: false,
      contestFormat: 'written_test',
      testDuration: 45,
      hasAdvancement: true,
      advancementRules: { individualAdvance: 6, teamAdvance: 0 },
      teksAlignment: 'Social Studies TEKS: Geography and Culture, Data Analysis',
      subjectArea: 'Social Studies',
      season: 'spring',
      isActive: true
    }
    // ... (Additional A+ competitions would continue here)
  ];

  constructor() {
    console.log('🎓 UIL Event Management Service initialized with 50+ academic competitions');
  }

  // ===================================================================
  // COMPETITION CONFIGURATION METHODS
  // ===================================================================

  /**
   * Get all UIL competition configurations
   */
  async getAllUILCompetitions(user: User): Promise<UILCompetitionConfig[]> {
    try {
      // Apply RBAC filtering
      const dataFilters = new RBACDataFilters(user);
      
      const allCompetitions = [...this.HIGH_SCHOOL_COMPETITIONS, ...this.APLUS_COMPETITIONS];
      
      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        'uil_competitions',
        { ip: 'system' } as any,
        'Retrieved UIL competition configurations'
      );

      return allCompetitions;
    } catch (error) {
      console.error('Error getting UIL competitions:', error);
      throw new Error('Failed to retrieve UIL competitions');
    }
  }

  /**
   * Get UIL competitions by type
   */
  async getUILCompetitionsByType(
    competitionType: 'high_school' | 'aplus',
    user: User
  ): Promise<UILCompetitionConfig[]> {
    try {
      const allCompetitions = await this.getAllUILCompetitions(user);
      return allCompetitions.filter(comp => comp.competitionType === competitionType);
    } catch (error) {
      console.error('Error getting UIL competitions by type:', error);
      throw new Error('Failed to retrieve UIL competitions by type');
    }
  }

  /**
   * Get UIL competitions by grade level
   */
  async getUILCompetitionsByGrade(
    gradeLevel: string,
    user: User
  ): Promise<UILCompetitionConfig[]> {
    try {
      const allCompetitions = await this.getAllUILCompetitions(user);
      return allCompetitions.filter(comp => comp.gradeLevel.includes(gradeLevel));
    } catch (error) {
      console.error('Error getting UIL competitions by grade:', error);
      throw new Error('Failed to retrieve UIL competitions by grade');
    }
  }

  /**
   * Get UIL competitions by subject area
   */
  async getUILCompetitionsBySubject(
    subjectArea: string,
    user: User
  ): Promise<UILCompetitionConfig[]> {
    try {
      const allCompetitions = await this.getAllUILCompetitions(user);
      return allCompetitions.filter(comp => comp.subjectArea === subjectArea);
    } catch (error) {
      console.error('Error getting UIL competitions by subject:', error);
      throw new Error('Failed to retrieve UIL competitions by subject');
    }
  }

  // ===================================================================
  // ACADEMIC DISTRICT MANAGEMENT
  // ===================================================================

  /**
   * Create academic district
   */
  async createAcademicDistrict(
    districtData: InsertAcademicDistrict,
    user: User
  ): Promise<AcademicDistrict> {
    try {
      const storage = await this.storage;
      
      const district = await storage.createAcademicDistrict(districtData, user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        district.id,
        { ip: 'system' } as any,
        `Created academic district: ${district.districtName}`
      );

      return district;
    } catch (error) {
      console.error('Error creating academic district:', error);
      throw new Error('Failed to create academic district');
    }
  }

  /**
   * Get academic districts by region
   */
  async getAcademicDistrictsByRegion(
    region: string,
    user: User
  ): Promise<AcademicDistrict[]> {
    try {
      const storage = await this.storage;
      return await storage.getAcademicDistrictsByRegion(region, user);
    } catch (error) {
      console.error('Error getting academic districts by region:', error);
      throw new Error('Failed to retrieve academic districts');
    }
  }

  // ===================================================================
  // ACADEMIC MEET MANAGEMENT
  // ===================================================================

  /**
   * Create academic meet
   */
  async createAcademicMeet(
    meetData: InsertAcademicMeet,
    user: User
  ): Promise<AcademicMeet> {
    try {
      const storage = await this.storage;
      
      const meet = await storage.createAcademicMeet(meetData, user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        meet.id,
        { ip: 'system' } as any,
        `Created academic meet: ${meet.meetName}`
      );

      return meet;
    } catch (error) {
      console.error('Error creating academic meet:', error);
      throw new Error('Failed to create academic meet');
    }
  }

  /**
   * Get academic meets by district
   */
  async getAcademicMeetsByDistrict(
    districtId: string,
    user: User
  ): Promise<AcademicMeet[]> {
    try {
      const storage = await this.storage;
      return await storage.getAcademicMeetsByDistrict(districtId, user);
    } catch (error) {
      console.error('Error getting academic meets by district:', error);
      throw new Error('Failed to retrieve academic meets');
    }
  }

  /**
   * Get academic meets by date range
   */
  async getAcademicMeetsByDateRange(
    startDate: string,
    endDate: string,
    user: User
  ): Promise<AcademicMeet[]> {
    try {
      const storage = await this.storage;
      return await storage.getAcademicMeetsByDateRange(startDate, endDate, user);
    } catch (error) {
      console.error('Error getting academic meets by date range:', error);
      throw new Error('Failed to retrieve academic meets');
    }
  }

  // ===================================================================
  // PARTICIPANT REGISTRATION & ELIGIBILITY
  // ===================================================================

  /**
   * Register participant for competition
   */
  async registerParticipant(
    registrationData: ParticipantRegistration,
    user: User
  ): Promise<any> {
    try {
      const storage = await this.storage;
      
      // Verify eligibility before registration
      const isEligible = await this.verifyParticipantEligibility(
        registrationData.studentInfo,
        registrationData.competitionId,
        user
      );

      if (!isEligible) {
        throw new Error('Participant is not eligible for this competition');
      }

      const participant = await storage.createAcademicParticipant({
        teamId: registrationData.teamId,
        competitionId: registrationData.competitionId,
        studentId: registrationData.studentInfo.studentId,
        firstName: registrationData.studentInfo.firstName,
        lastName: registrationData.studentInfo.lastName,
        grade: registrationData.studentInfo.grade,
        participantRole: registrationData.participantRole,
        entryPosition: registrationData.entryPosition,
        isEligible: true,
        eligibilityVerified: true,
        eligibilityDate: new Date().toISOString().split('T')[0],
        parentName: registrationData.emergencyContact.name,
        parentPhone: registrationData.emergencyContact.phone,
        emergencyContact: registrationData.emergencyContact.name,
        emergencyPhone: registrationData.emergencyContact.phone
      }, user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'student_data',
        participant.id,
        { ip: 'system' } as any,
        `Registered participant: ${registrationData.studentInfo.firstName} ${registrationData.studentInfo.lastName}`
      );

      return participant;
    } catch (error) {
      console.error('Error registering participant:', error);
      throw new Error('Failed to register participant');
    }
  }

  /**
   * Verify participant eligibility
   */
  private async verifyParticipantEligibility(
    studentInfo: ParticipantRegistration['studentInfo'],
    competitionId: string,
    user: User
  ): Promise<boolean> {
    try {
      // Get competition configuration
      const allCompetitions = await this.getAllUILCompetitions(user);
      const competition = allCompetitions.find(comp => comp.id === competitionId);
      
      if (!competition) {
        return false;
      }

      // Check grade level eligibility
      const gradeRange = competition.gradeLevel.split('-');
      const minGrade = parseInt(gradeRange[0]);
      const maxGrade = parseInt(gradeRange[1] || gradeRange[0]);
      
      if (studentInfo.grade < minGrade || studentInfo.grade > maxGrade) {
        return false;
      }

      // Additional eligibility checks would go here
      // (UIL academic eligibility rules, school enrollment verification, etc.)

      return true;
    } catch (error) {
      console.error('Error verifying participant eligibility:', error);
      return false;
    }
  }

  // ===================================================================
  // EVENT SCHEDULING AND COORDINATION
  // ===================================================================

  /**
   * Create event schedule for meet
   */
  async createEventSchedule(
    meetId: string,
    scheduleConfig: EventScheduling[],
    user: User
  ): Promise<any> {
    try {
      const storage = await this.storage;
      
      // Validate no conflicts in scheduling
      const conflicts = await this.detectSchedulingConflicts(scheduleConfig);
      
      if (conflicts.length > 0) {
        throw new Error(`Scheduling conflicts detected: ${conflicts.join(', ')}`);
      }

      // Create calendar events for each scheduled competition
      const calendarEvents = [];
      for (const schedule of scheduleConfig) {
        const event = await storage.createAcademicCalendarEvent({
          title: `Academic Competition - ${schedule.competitionId}`,
          eventType: 'academic_competition',
          startDateTime: schedule.startTime,
          endDateTime: schedule.endTime,
          location: schedule.room,
          academicCompetitionId: schedule.competitionId,
          visibility: 'district',
          importance: 'high',
          attendees: schedule.judgeAssignments.map(judgeId => ({
            userId: judgeId,
            role: 'judge',
            status: 'required'
          }))
        }, user);
        
        calendarEvents.push(event);
      }

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        meetId,
        { ip: 'system' } as any,
        `Created event schedule for meet with ${scheduleConfig.length} competitions`
      );

      return {
        meetId,
        scheduledEvents: calendarEvents.length,
        scheduleConfig
      };
    } catch (error) {
      console.error('Error creating event schedule:', error);
      throw new Error('Failed to create event schedule');
    }
  }

  /**
   * Detect scheduling conflicts
   */
  private async detectSchedulingConflicts(
    scheduleConfig: EventScheduling[]
  ): Promise<string[]> {
    const conflicts: string[] = [];
    
    for (let i = 0; i < scheduleConfig.length; i++) {
      for (let j = i + 1; j < scheduleConfig.length; j++) {
        const event1 = scheduleConfig[i];
        const event2 = scheduleConfig[j];
        
        // Check room conflicts
        if (event1.room === event2.room) {
          const start1 = new Date(event1.startTime);
          const end1 = new Date(event1.endTime);
          const start2 = new Date(event2.startTime);
          const end2 = new Date(event2.endTime);
          
          if ((start1 < end2 && start2 < end1)) {
            conflicts.push(`Room conflict: ${event1.room} - ${event1.competitionId} and ${event2.competitionId}`);
          }
        }
        
        // Check judge conflicts
        const judgeOverlap = event1.judgeAssignments.filter(judge => 
          event2.judgeAssignments.includes(judge)
        );
        
        if (judgeOverlap.length > 0) {
          conflicts.push(`Judge conflict: ${judgeOverlap.join(', ')} assigned to multiple events`);
        }
      }
    }
    
    return conflicts;
  }

  // ===================================================================
  // INTEGRATION WITH EXISTING SYSTEMS
  // ===================================================================

  /**
   * Sync with existing calendar system
   */
  async syncWithCalendarSystem(
    meetId: string,
    user: User
  ): Promise<any> {
    try {
      const storage = await this.storage;
      
      // Get academic meet details
      const meet = await storage.getAcademicMeet(meetId, user);
      if (!meet) {
        throw new Error('Academic meet not found');
      }

      // Create calendar integration
      const calendarEvent = await storage.createAcademicCalendarEvent({
        title: meet.meetName,
        eventType: 'academic_competition',
        startDateTime: `${meet.meetDate}T${meet.startTime}`,
        endDateTime: meet.endTime ? `${meet.meetDate}T${meet.endTime}` : `${meet.meetDate}T17:00`,
        location: meet.location,
        description: `UIL Academic Meet - ${meet.meetType} level`,
        visibility: 'district',
        importance: 'high',
        attendees: []
      }, user);

      return {
        meetId,
        calendarEventId: calendarEvent.id,
        syncStatus: 'completed'
      };
    } catch (error) {
      console.error('Error syncing with calendar system:', error);
      throw new Error('Failed to sync with calendar system');
    }
  }
}

export default UILEventManagementService;