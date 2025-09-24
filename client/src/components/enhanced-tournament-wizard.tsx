import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Play, Trophy, Users, Settings, DollarSign, X, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { insertTournamentSchema } from "@shared/schema";
import TeamManagement from "@/components/team-management";
import { type TeamData } from "@/utils/csv-utils";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { getEventsForSport, type SportEventDefinition } from "@shared/sportEvents";
import { generateRandomNames } from "@/utils/name-generator";
import { ComprehensiveTournamentFormatSelector, SportSpecificConfig, allTournamentFormats, type TournamentFormatConfig } from "./comprehensive-tournament-formats";

const formSchema = insertTournamentSchema.extend({
  teamSize: z.number().min(1).max(128), // Support 1-128 teams for flexibility
  tournamentType: z.enum([
    "single", "double", "double-stage", "pool-play", "round-robin", "swiss-system",
    "match-play", "stroke-play", "scramble", "best-ball", "alternate-shot", "modified-stableford",
    "playoff-bracket", "conference-championship", "dual-meet", "triangular-meet", "weight-class-bracket",
    "multi-event-scoring", "preliminary-finals", "heat-management", "skills-competition", "draw-management",
    "group-stage-knockout", "home-away-series", "prediction-bracket", "compass-draw", "triple-elimination", "game-guarantee"
  ]).default("single"),
  competitionFormat: z.enum([
    "bracket", "leaderboard", "series", "bracket-to-series", "multi-stage",
    "round-robin-pools", "elimination-pools", "consolation-bracket", "team-vs-individual",
    "portfolio-review", "oral-competition", "written-test", "judged-performance", 
    "timed-competition", "scoring-average", "advancement-ladder", "rating-system",
    "prediction-scoring", "multiple-bracket-system", "three-bracket-system", "guarantee-system"
  ]).default("bracket"),
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
  skillLevel: z.string().optional(), // Add skillLevel field
  entryFee: z.string().optional(), // Convert to string for numeric database field
  tournamentDate: z.string().optional(), // ISO string for date field
  // Calendar discoverability fields
  isPublicCalendarVisible: z.boolean().optional(),
  calendarRegion: z.string().optional(),
  calendarCity: z.string().optional(),
  calendarStateCode: z.string().optional(),
  calendarTags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedTournamentWizardProps {
  onClose?: () => void;
  onTournamentCreated?: (tournament: any) => void;
  userType?: 'district' | 'enterprise' | 'free' | 'general';
}

type WizardStep = 'sport' | 'events' | 'settings' | 'launch';

const stepTitles = {
  sport: 'Choose Sport & Format',
  events: 'Select Events & Results Recorders',
  settings: 'Tournament Settings',
  launch: 'Launch Tournament'
};

const stepDescriptions = {
  sport: 'Select your sport and competition format',
  events: 'Choose events and assign Results Recorders for each',
  settings: 'Configure tournament details and registration settings',
  launch: 'Tournament is ready for participant registration!'
};

export default function EnhancedTournamentWizard({ 
  onClose, 
  onTournamentCreated,
  userType = 'general'
}: EnhancedTournamentWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WizardStep>('sport');
  const [selectedEvents, setSelectedEvents] = useState<SportEventDefinition[]>([]);
  const [eventRecorders, setEventRecorders] = useState<Record<string, string>>({});
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('');
  const [createdTournament, setCreatedTournament] = useState<any>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  
  // COMPREHENSIVE TOURNAMENT FORMAT STATE
  const [selectedTournamentFormat, setSelectedTournamentFormat] = useState<TournamentFormatConfig | null>(null);
  const [sportSpecificConfig, setSportSpecificConfig] = useState<Record<string, any>>({});
  
  // Stage format configuration
  const [stage1Format, setStage1Format] = useState<string>('round-robin');
  const [stage2Format, setStage2Format] = useState<string>('single-elimination');

  // Cascading dropdown state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Comprehensive sport categories system
  const sportCategories = {
    athletic: {
      name: 'Athletic',
      subcategories: {
        team_sports: {
          name: 'Team Sports',
          sports: [
            'Basketball (Boys)', 'Basketball (Girls)', 'Football', 'Soccer (Boys)', 'Soccer (Girls)',
            'Volleyball (Boys)', 'Volleyball (Girls)', 'Baseball', 'Softball', 'Hockey',
            'Rugby', 'Ultimate Frisbee', 'Water Polo', 'Field Hockey', 'Lacrosse (Boys)', 
            'Lacrosse (Girls)', 'Team Handball', 'Flag Football', 'Futsal'
          ]
        },
        individual_sports: {
          name: 'Individual Sports',
          sports: [
            'Track & Field', 'Swimming & Diving', 'Cross Country', 'Tennis (Boys)',
            'Tennis (Girls)', 'Golf (Boys)', 'Golf (Girls)', 'Wrestling', 'Gymnastics',
            'Archery', 'Bowling', 'Martial Arts', 'Cycling', 'Fencing', 'Badminton',
            'Table Tennis', 'Squash', 'Racquetball', 'Rock Climbing', 'Triathlon'
          ]
        },
        winter_sports: {
          name: 'Winter Sports',
          sports: [
            'Alpine Skiing', 'Nordic Skiing', 'Snowboarding', 'Ice Hockey', 'Figure Skating', 
            'Curling', 'Speed Skating', 'Biathlon', 'Ski Jumping', 'Cross Country Skiing',
            'Ice Dancing', 'Bobsled', 'Luge', 'Skeleton'
          ]
        },
        emerging_sports: {
          name: 'Emerging Sports',
          sports: [
            'Esports', 'Drone Racing', 'Parkour', 'Surfing', 'Skateboarding', 'Sport Climbing',
            'Breakdancing', 'Mixed Martial Arts', 'Obstacle Course Racing', 'Spikeball',
            'Cornhole', 'Disc Golf', 'Pickleball', 'Axe Throwing', 'Stand-Up Paddleboard'
          ]
        },
        adaptive_sports: {
          name: 'Adaptive & Inclusive Sports',
          sports: [
            'Wheelchair Basketball', 'Wheelchair Racing', 'Sitting Volleyball', 'Goalball',
            'Boccia', 'Powerlifting (Adaptive)', 'Swimming (Adaptive)', 'Archery (Adaptive)',
            'Table Tennis (Adaptive)', 'Unified Sports', 'Special Olympics Events',
            'Blind Soccer', 'Wheelchair Tennis', 'Para Athletics', 'Sledge Hockey'
          ]
        }
      }
    },
    academic: {
      name: 'Academic',
      subcategories: {
        uil_academic: {
          name: 'UIL Academic Competitions',
          sports: [
            'Accounting', 'Calculator Applications', 'Computer Applications', 'Computer Science',
            'Current Issues & Events', 'Economics', 'Literary Criticism', 'Mathematics',
            'Number Sense', 'Science', 'Social Studies', 'Spelling & Vocabulary'
          ]
        },
        speech_debate: {
          name: 'Speech & Debate',
          sports: [
            'Cross Examination Debate', 'Lincoln-Douglas Debate', 'Informative Speaking',
            'Persuasive Speaking', 'Poetry Interpretation', 'Prose Interpretation',
            'Extemporaneous Speaking', 'Original Oratory'
          ]
        },
        stem_competitions: {
          name: 'STEM Competitions',
          sports: [
            'Science Olympiad', 'Math Olympiad', 'Robotics Competition', 'Engineering Challenge',
            'Programming Competition', 'Quiz Bowl', 'Academic Decathlon', 'Destination Imagination'
          ]
        }
      }
    },
    fine_arts: {
      name: 'Fine Arts',
      subcategories: {
        music: {
          name: 'Music',
          sports: [
            'Concert Band', 'Marching Band', 'Jazz Band', 'Orchestra', 'Choir',
            'Solo & Ensemble', 'All-State Auditions', 'Piano Competition'
          ]
        },
        visual_arts: {
          name: 'Visual Arts',
          sports: [
            'Art Competition', 'Photography', 'Digital Art', 'Sculpture',
            'Painting', 'Drawing', 'Ceramics', 'Graphic Design'
          ]
        },
        performing_arts: {
          name: 'Performing Arts',
          sports: [
            'One Act Play', 'Musical Theater', 'Dance Competition', 'Drama',
            'Improvisation', 'Monologue Competition', 'Technical Theater'
          ]
        }
      }
    }
  };

  const { data: sports = [] } = useQuery<any[]>({
    queryKey: ["/api/sports"],
  });

  // Get available sports based on selected category and subcategory
  const getAvailableSports = () => {
    if (!selectedCategory || !selectedSubcategory) return [];
    
    const category = sportCategories[selectedCategory as keyof typeof sportCategories];
    if (!category) return [];
    
    const subcategory = (category.subcategories as any)[selectedSubcategory];
    return subcategory ? subcategory.sports : [];
  };

  // Reset selections when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    form.setValue("sport", "");
  };

  // Reset sport when subcategory changes
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    form.setValue("sport", "");
  };

  // Get smart age group options based on selected sport
  const getAgeGroupsForSport = (sport: string): string[] => {
    if (!sport) return ['Elementary', 'Middle School', 'High School', 'College', 'Adult', 'Masters', 'Senior'];
    
    // Sports that use "U" (Under) age designations
    if (sport.includes('Basketball') || sport.includes('Soccer') || sport.includes('Baseball') || sport.includes('Softball') || sport.includes('Hockey')) {
      return ['8U', '10U', '12U', '14U', '16U', '18U', 'High School JV', 'High School Varsity', 'College', 'Adult', 'Masters (35+)', 'Senior (50+)'];
    }
    
    // Football uses grade/school-based divisions
    if (sport.includes('Football')) {
      return ['Youth (6-8)', 'Youth (9-11)', 'Middle School', 'Freshman', 'JV', 'Varsity', 'College', 'Semi-Pro', 'Adult'];
    }
    
    // Wrestling uses weight classes AND age groups
    if (sport.includes('Wrestling')) {
      return ['Youth', 'Middle School', 'High School', 'College', 'Open/Senior', 'Masters (35+)', 'Veterans (50+)'];
    }
    
    // Swimming uses age ranges
    if (sport.includes('Swimming') || sport.includes('Diving')) {
      return ['8 & Under', '9-10', '11-12', '13-14', '15-16', '17-18', 'College', 'Open', 'Masters (25+)', 'Senior (50+)'];
    }
    
    // Track & Field uses school/age divisions
    if (sport.includes('Track') || sport.includes('Field') || sport.includes('Cross Country')) {
      return ['Youth (Under 12)', 'Youth (12-14)', 'Youth (15-17)', 'High School', 'College', 'Open', 'Masters (35+)', 'Senior (50+)'];
    }
    
    // Golf and Tennis use skill-based and age divisions
    if (sport.includes('Golf') || sport.includes('Tennis')) {
      return ['Junior (Under 12)', 'Junior (12-14)', 'Junior (15-18)', 'High School', 'College', 'Open', 'Senior (50+)', 'Super Senior (65+)'];
    }
    
    // Academic competitions use grade levels
    if (['Academic', 'STEM', 'Speech & Debate', 'Music', 'Visual Arts', 'Theater'].some(cat => sport.includes(cat))) {
      return ['2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College'];
    }
    
    // Emerging sports often exclude elementary
    if (['Esports', 'Drone Racing', 'Mixed Martial Arts', 'Axe Throwing'].includes(sport)) {
      return ['High School', 'College', 'Adult', 'Masters'];
    }
    
    // Winter sports typically need more facilities
    if (sport.includes('Skiing') || sport.includes('Snowboard') || sport.includes('Ice') || sport.includes('Curling')) {
      return ['Middle School', 'High School', 'College', 'Adult', 'Masters'];
    }
    
    // Adaptive sports emphasize inclusion
    if (sport.includes('Wheelchair') || sport.includes('Adaptive') || sport.includes('Special Olympics')) {
      return ['Elementary', 'Middle School', 'High School', 'College', 'Adult', 'Masters', 'Senior', 'All Ages'];
    }
    
    // Most traditional sports use school-based divisions
    return ['Elementary', 'Middle School', 'High School', 'College', 'Adult', 'Masters'];
  };

  // Get appropriate description for age groups
  const getAgeGroupDescription = (ageGroup: string): string => {
    // Handle "U" (Under) age designations
    if (ageGroup.endsWith('U')) {
      const age = ageGroup.replace('U', '');
      return `(Under ${age} years)`;
    }
    
    // Handle swimming-style age ranges
    if (ageGroup.includes('&')) {
      return '(Ages 8 and younger)';
    }
    if (ageGroup.includes('-')) {
      return `(Ages ${ageGroup})`;
    }
    
    // Handle grade-based divisions
    if (ageGroup.includes('Grade')) {
      return '';
    }
    
    // Handle youth parenthetical ages
    if (ageGroup.includes('Youth (')) {
      return '';
    }
    
    // Handle junior divisions
    if (ageGroup.includes('Junior (')) {
      return '';
    }
    
    // Handle traditional school divisions
    if (ageGroup === 'Elementary') return '(K-5)';
    if (ageGroup === 'Middle School') return '(6-8)';
    if (ageGroup === 'High School') return '(9-12)';
    if (ageGroup === 'High School JV') return '(9-11)';
    if (ageGroup === 'High School Varsity') return '(10-12)';
    if (ageGroup === 'Freshman') return '(9th grade)';
    if (ageGroup === 'JV') return '(9-11th grade)';
    if (ageGroup === 'Varsity') return '(10-12th grade)';
    if (ageGroup === 'College') return '(18-22)';
    if (ageGroup === 'Adult') return '(18+)';
    if (ageGroup === 'Open') return '(All ages)';
    if (ageGroup === 'All Ages') return '(Any age welcome)';
    if (ageGroup === 'Youth') return '(Under 18)';
    if (ageGroup === 'Semi-Pro') return '(Adult competitive)';
    
    // Handle Masters/Senior divisions
    if (ageGroup.includes('Masters')) {
      if (ageGroup.includes('25+')) return '';
      if (ageGroup.includes('35+')) return '';
      return '(35+)';
    }
    if (ageGroup.includes('Senior')) {
      if (ageGroup.includes('50+')) return '';
      return '(50+)';
    }
    if (ageGroup.includes('Super Senior')) return '';
    if (ageGroup.includes('Veterans')) return '';
    
    return '';
  };

  // Get smart gender division options based on selected sport
  const getGenderDivisionsForSport = (sport: string): string[] => {
    if (!sport) return ['Boys', 'Girls', 'Men', 'Women', 'Mixed', 'Co-Ed'];
    
    // Sports that are typically separated by gender
    if (['Football', 'Wrestling', 'Baseball'].includes(sport)) {
      return ['Boys', 'Men'];
    }
    
    if (['Softball', 'Field Hockey'].includes(sport)) {
      return ['Girls', 'Women'];
    }
    
    // Sports that commonly have mixed divisions
    if (['Ultimate Frisbee', 'Badminton', 'Table Tennis', 'Archery', 'Bowling'].includes(sport)) {
      return ['Boys', 'Girls', 'Men', 'Women', 'Mixed', 'Co-Ed'];
    }
    
    // Adaptive sports emphasize inclusion
    if (sport.includes('Wheelchair') || sport.includes('Adaptive') || sport.includes('Special Olympics')) {
      return ['Mixed', 'Co-Ed', 'Men', 'Women', 'Boys', 'Girls', 'Open Division'];
    }
    
    // Academic competitions are typically mixed
    if (['Academic', 'STEM', 'Speech & Debate', 'Music', 'Visual Arts', 'Theater'].some(cat => sport.includes(cat))) {
      return ['Mixed', 'Co-Ed', 'Boys', 'Girls'];
    }
    
    // Emerging sports often prioritize inclusion
    if (['Esports', 'Drone Racing', 'Parkour', 'Sport Climbing'].includes(sport)) {
      return ['Mixed', 'Co-Ed', 'Men', 'Women', 'Open Division'];
    }
    
    // Default for most sports
    return ['Boys', 'Girls', 'Men', 'Women', 'Mixed', 'Co-Ed'];
  };

  // Get venue requirements based on selected sport
  const getVenueRequirementsForSport = (sport: string) => {
    if (!sport) return null;
    
    const requirements = {
      facilities: [] as string[],
      equipment: [] as string[],
      safety: [] as string[],
      accessibility: [] as string[],
      special: [] as string[]
    };

    // Swimming & Diving
    if (sport.includes('Swimming') || sport.includes('Diving')) {
      requirements.facilities = ['Pool (25m or 50m)', 'Starting blocks', 'Timing system', 'Diving boards/platforms'];
      requirements.equipment = ['Lane ropes', 'Pool deck space', 'Electronic timing', 'Scoreboard'];
      requirements.safety = ['Lifeguards', 'First aid station', 'Emergency equipment'];
      requirements.accessibility = ['Pool lift', 'Accessible restrooms', 'Wheelchair ramps'];
    }
    
    // Track & Field
    else if (sport.includes('Track') || sport.includes('Field')) {
      requirements.facilities = ['Running track (400m)', 'Field event areas', 'Throwing sectors', 'Jumping pits'];
      requirements.equipment = ['Hurdles', 'Starting blocks', 'Field event implements', 'Measuring equipment'];
      requirements.safety = ['First aid station', 'Throwing cage protection', 'Medical personnel'];
      requirements.accessibility = ['Track accessibility', 'Spectator seating', 'Accessible restrooms'];
    }
    
    // Winter Sports
    else if (sport.includes('Skiing') || sport.includes('Ice') || sport.includes('Snowboard')) {
      requirements.facilities = ['Ice rink/slopes', 'Climate-controlled facility', 'Equipment storage'];
      requirements.equipment = ['Ice maintenance', 'Safety barriers', 'Timing systems'];
      requirements.safety = ['Emergency medical', 'Safety personnel', 'Weather monitoring'];
      requirements.special = ['Cold weather protocols', 'Specialized insurance'];
    }
    
    // Basketball/Volleyball (Indoor courts)
    else if (sport.includes('Basketball') || sport.includes('Volleyball')) {
      requirements.facilities = ['Gymnasium', 'Basketball/volleyball courts', 'Spectator seating'];
      requirements.equipment = ['Hoops/nets', 'Scoreboards', 'Sound system'];
      requirements.safety = ['First aid station', 'Emergency exits', 'Medical personnel'];
      requirements.accessibility = ['Wheelchair accessible', 'ADA compliant restrooms'];
    }
    
    // Football/Soccer (Large fields)
    else if (sport.includes('Football') || sport.includes('Soccer')) {
      requirements.facilities = ['Full-size field', 'Goal posts', 'Spectator seating', 'Locker rooms'];
      requirements.equipment = ['Field markers', 'Scoreboards', 'Sound system', 'First down markers'];
      requirements.safety = ['Medical tent', 'Emergency vehicle access', 'Security personnel'];
      requirements.accessibility = ['Accessible seating', 'Parking', 'Restroom facilities'];
    }
    
    // Academic/STEM
    else if (sport.includes('Academic') || sport.includes('STEM') || sport.includes('Speech')) {
      requirements.facilities = ['Classrooms/testing rooms', 'Audio/visual equipment', 'Quiet environment'];
      requirements.equipment = ['Tables/desks', 'Projection systems', 'Microphones', 'Timers'];
      requirements.safety = ['Fire safety', 'Emergency procedures', 'Building security'];
      requirements.accessibility = ['ADA compliant', 'Assistive technology', 'Accessible seating'];
    }
    
    // Emerging/Esports
    else if (sport.includes('Esports') || sport.includes('Drone')) {
      requirements.facilities = ['Technology lab', 'High-speed internet', 'Climate control'];
      requirements.equipment = ['Gaming stations', 'Network infrastructure', 'Streaming equipment'];
      requirements.safety = ['Electrical safety', 'Cybersecurity measures'];
      requirements.special = ['Technology support', 'Backup power systems'];
    }
    
    // Adaptive Sports
    else if (sport.includes('Wheelchair') || sport.includes('Adaptive')) {
      requirements.facilities = ['Fully accessible venue', 'Equipment storage', 'Adaptive facilities'];
      requirements.equipment = ['Adaptive sports equipment', 'Accessible scoreboards'];
      requirements.safety = ['Medical support familiar with disabilities', 'Emergency procedures'];
      requirements.accessibility = ['Full ADA compliance', 'Accessible parking', 'Support areas'];
      requirements.special = ['Specialized medical staff', 'Equipment technicians'];
    }

    return requirements;
  };

  // Get equipment requirements based on sport and selected events
  const getEquipmentRequirements = (sport: string, events: SportEventDefinition[] = []): Array<{category: string, items: Array<{name: string, required: boolean, description?: string}>}> => {
    if (!sport) return [];
    
    const equipmentCategories = [];

    // Swimming & Diving Equipment
    if (sport.includes('Swimming') || sport.includes('Diving')) {
      equipmentCategories.push({
        category: 'Pool Equipment',
        items: [
          { name: 'Electronic Timing System', required: true, description: 'For accurate race timing' },
          { name: 'Starting Blocks', required: true, description: 'Regulation starting platforms' },
          { name: 'Lane Ropes & Lines', required: true, description: 'Pool lane separation' },
          { name: 'Pace Clocks', required: false, description: 'For warm-up timing' },
          { name: 'Backstroke Flags', required: true, description: 'Safety markers for backstroke' }
        ]
      });
      
      if (events.some(e => e.eventName.includes('Diving'))) {
        equipmentCategories.push({
          category: 'Diving Equipment',
          items: [
            { name: 'Diving Boards', required: true, description: '1m and 3m springboards' },
            { name: 'Platform (if applicable)', required: false, description: '5m, 7.5m, 10m platforms' },
            { name: 'Diving Judges Sheets', required: true, description: 'For scoring dives' },
            { name: 'Timing/Scoring System', required: true, description: 'Electronic diving scores' }
          ]
        });
      }
    }
    
    // Track & Field Equipment  
    else if (sport.includes('Track') || sport.includes('Field')) {
      equipmentCategories.push({
        category: 'Track Equipment',
        items: [
          { name: 'Starting Blocks', required: true, description: 'For sprint events' },
          { name: 'Hurdles', required: false, description: 'Adjustable height hurdles' },
          { name: 'Batons', required: false, description: 'For relay events' },
          { name: 'Electronic Timing', required: true, description: 'Professional timing system' }
        ]
      });
      
      equipmentCategories.push({
        category: 'Field Event Equipment',
        items: [
          { name: 'Shot Put', required: false, description: 'Various weights available' },
          { name: 'Discus', required: false, description: 'Different weights for divisions' },
          { name: 'Javelin', required: false, description: 'Regulation javelins' },
          { name: 'High Jump Standards', required: false, description: 'Adjustable uprights and bar' },
          { name: 'Pole Vault Equipment', required: false, description: 'Poles, standards, and pit' },
          { name: 'Measuring Tape', required: true, description: 'For field event measurements' }
        ]
      });
    }
    
    // Wrestling Equipment
    else if (sport.includes('Wrestling')) {
      equipmentCategories.push({
        category: 'Wrestling Equipment',
        items: [
          { name: 'Wrestling Mats', required: true, description: 'Regulation size mats' },
          { name: 'Scoreboard/Timer', required: true, description: 'Match timing and scoring' },
          { name: 'Scales', required: true, description: 'For weight verification' },
          { name: 'Referee Equipment', required: true, description: 'Whistles, cards, etc.' },
          { name: 'Medical Kit', required: true, description: 'First aid for injuries' }
        ]
      });
    }
    
    // Basketball Equipment
    else if (sport.includes('Basketball')) {
      equipmentCategories.push({
        category: 'Court Equipment',
        items: [
          { name: 'Basketball Hoops', required: true, description: 'Regulation height hoops' },
          { name: 'Game Basketballs', required: true, description: 'Official size basketballs' },
          { name: 'Scoreboard', required: true, description: 'Electronic scoreboard with timer' },
          { name: 'Referee Equipment', required: true, description: 'Whistles, uniforms' },
          { name: 'Score Table Setup', required: true, description: 'Scorer, timer equipment' }
        ]
      });
    }
    
    // Academic/STEM Equipment
    else if (sport.includes('Academic') || sport.includes('STEM')) {
      equipmentCategories.push({
        category: 'Testing Equipment',
        items: [
          { name: 'Answer Sheets', required: true, description: 'Bubble sheets or forms' },
          { name: 'Timers', required: true, description: 'Multiple timing devices' },
          { name: 'Calculators (if allowed)', required: false, description: 'Approved calculator models' },
          { name: 'Reference Materials', required: false, description: 'Permitted books/charts' },
          { name: 'Proctoring Supplies', required: true, description: 'Monitoring equipment' }
        ]
      });
      
      if (sport.includes('STEM') || sport.includes('Science')) {
        equipmentCategories.push({
          category: 'Lab Equipment',
          items: [
            { name: 'Laboratory Supplies', required: false, description: 'Chemicals, glassware' },
            { name: 'Safety Equipment', required: true, description: 'Goggles, gloves, etc.' },
            { name: 'Measuring Instruments', required: false, description: 'Rulers, scales, meters' },
            { name: 'Technology Access', required: false, description: 'Computers, internet if needed' }
          ]
        });
      }
    }
    
    // Esports Equipment
    else if (sport.includes('Esports') || sport.includes('Gaming')) {
      equipmentCategories.push({
        category: 'Gaming Setup',
        items: [
          { name: 'Gaming PCs/Consoles', required: true, description: 'High-performance systems' },
          { name: 'Gaming Monitors', required: true, description: 'Low-latency displays' },
          { name: 'Gaming Peripherals', required: true, description: 'Keyboards, mice, controllers' },
          { name: 'Headsets', required: true, description: 'Communication equipment' },
          { name: 'Network Equipment', required: true, description: 'Stable internet connection' }
        ]
      });
      
      equipmentCategories.push({
        category: 'Tournament Infrastructure',
        items: [
          { name: 'Streaming Equipment', required: false, description: 'Cameras, capture cards' },
          { name: 'Backup Systems', required: true, description: 'Redundant hardware' },
          { name: 'Tournament Software', required: true, description: 'Bracket management' },
          { name: 'Moderation Tools', required: true, description: 'Admin and referee tools' }
        ]
      });
    }
    
    // Golf Equipment
    else if (sport.includes('Golf')) {
      equipmentCategories.push({
        category: 'Course Equipment',
        items: [
          { name: 'Scorecards', required: true, description: 'Official tournament scorecards' },
          { name: 'Tee Markers', required: true, description: 'Course tee designations' },
          { name: 'Flagsticks', required: true, description: 'Hole markers' },
          { name: 'Leaderboards', required: false, description: 'Live scoring displays' },
          { name: 'Golf Carts (if allowed)', required: false, description: 'Transportation' }
        ]
      });
    }

    // Default equipment for most sports
    if (equipmentCategories.length === 0) {
      equipmentCategories.push({
        category: 'Basic Tournament Equipment',
        items: [
          { name: 'Scoreboards/Displays', required: true, description: 'For keeping score' },
          { name: 'Timing Equipment', required: false, description: 'Stopwatches, timers' },
          { name: 'First Aid Kit', required: true, description: 'Safety and medical supplies' },
          { name: 'Official Equipment', required: true, description: 'Sport-specific balls, implements' },
          { name: 'Referee/Judge Supplies', required: true, description: 'Whistles, cards, forms' }
        ]
      });
    }

    return equipmentCategories;
  };

  // Get skill levels based on selected sport
  const getSkillLevelsForSport = (sport: string): Array<{value: string, label: string, description?: string}> => {
    if (!sport) return [];
    
    // Academic/STEM competitions often have grade-based divisions
    if (sport.includes('Academic') || sport.includes('STEM') || sport.includes('Speech')) {
      return [
        { value: 'novice', label: 'Novice', description: 'First-time competitors' },
        { value: 'jv', label: 'Junior Varsity', description: 'Developing competitors' },
        { value: 'varsity', label: 'Varsity', description: 'Advanced competitors' },
        { value: 'open', label: 'Open Division', description: 'All skill levels welcome' }
      ];
    }
    
    // Martial Arts often have belt-based divisions
    if (sport.includes('Karate') || sport.includes('Judo') || sport.includes('Taekwondo')) {
      return [
        { value: 'white-yellow', label: 'White-Yellow Belt', description: 'Beginner ranks' },
        { value: 'orange-green', label: 'Orange-Green Belt', description: 'Intermediate ranks' },
        { value: 'blue-brown', label: 'Blue-Brown Belt', description: 'Advanced ranks' },
        { value: 'black', label: 'Black Belt', description: 'Expert level' }
      ];
    }
    
    // Wrestling uses experience levels
    if (sport.includes('Wrestling')) {
      return [
        { value: 'rookie', label: 'Rookie', description: 'First year wrestlers' },
        { value: 'sophomore', label: 'Sophomore', description: 'Second year wrestlers' },
        { value: 'junior', label: 'Junior', description: 'Third year wrestlers' },
        { value: 'senior', label: 'Senior', description: 'Fourth+ year wrestlers' },
        { value: 'open', label: 'Open', description: 'All experience levels' }
      ];
    }
    
    // Swimming often uses time standards
    if (sport.includes('Swimming') || sport.includes('Diving')) {
      return [
        { value: 'b-time', label: 'B Time Standard', description: 'Recreational level' },
        { value: 'bb-time', label: 'BB Time Standard', description: 'Competitive level' },
        { value: 'a-time', label: 'A Time Standard', description: 'Advanced competitive' },
        { value: 'aa-time', label: 'AA Time Standard', description: 'Elite level' },
        { value: 'open', label: 'Open Entry', description: 'No time standard required' }
      ];
    }
    
    // Track & Field uses performance standards
    if (sport.includes('Track') || sport.includes('Field')) {
      return [
        { value: 'recreational', label: 'Recreational', description: 'Fun runs and basic competition' },
        { value: 'competitive', label: 'Competitive', description: 'League-level competition' },
        { value: 'elite', label: 'Elite', description: 'State/regional qualifiers' },
        { value: 'open', label: 'Open', description: 'All performance levels' }
      ];
    }
    
    // Esports often uses rank-based divisions
    if (sport.includes('Esports') || sport.includes('Gaming')) {
      return [
        { value: 'bronze-silver', label: 'Bronze-Silver', description: 'Beginner ranks' },
        { value: 'gold-platinum', label: 'Gold-Platinum', description: 'Intermediate ranks' },
        { value: 'diamond-master', label: 'Diamond-Master', description: 'Advanced ranks' },
        { value: 'grandmaster', label: 'Grandmaster+', description: 'Elite level' },
        { value: 'open', label: 'Open Division', description: 'All skill levels' }
      ];
    }
    
    // Golf uses handicap-based divisions
    if (sport.includes('Golf')) {
      return [
        { value: 'high-handicap', label: 'High Handicap (18+)', description: 'Recreational golfers' },
        { value: 'mid-handicap', label: 'Mid Handicap (10-17)', description: 'Average golfers' },
        { value: 'low-handicap', label: 'Low Handicap (0-9)', description: 'Skilled golfers' },
        { value: 'scratch', label: 'Scratch/Pro', description: 'Expert level' },
        { value: 'open', label: 'Open Flight', description: 'All handicaps' }
      ];
    }
    
    // Adaptive sports emphasize classification-based divisions
    if (sport.includes('Wheelchair') || sport.includes('Adaptive') || sport.includes('Special Olympics')) {
      return [
        { value: 'unified', label: 'Unified Division', description: 'Athletes with and without disabilities' },
        { value: 'traditional', label: 'Traditional Division', description: 'Athletes with similar abilities' },
        { value: 'developmental', label: 'Developmental', description: 'Skills development focus' },
        { value: 'competitive', label: 'Competitive', description: 'Advanced skill competition' }
      ];
    }
    
    // Default skill levels for most sports
    return [
      { value: 'beginner', label: 'Beginner', description: 'New to the sport' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
      { value: 'advanced', label: 'Advanced', description: 'Skilled competitors' },
      { value: 'elite', label: 'Elite', description: 'High-level competition' },
      { value: 'open', label: 'Open Division', description: 'All skill levels welcome' }
    ];
  };

  // Get seasonal sport recommendations based on current date
  const getSeasonalRecommendations = () => {
    const now = new Date();
    const month = now.getMonth(); // 0 = January, 11 = December
    const currentSeason = 
      month >= 2 && month <= 4 ? 'spring' :  // March-May
      month >= 5 && month <= 7 ? 'summer' :  // June-August  
      month >= 8 && month <= 10 ? 'fall' :   // September-November
      'winter';                              // December-February

    const seasonalSports = {
      spring: {
        season: 'Spring',
        primarySports: [
          'Track & Field', 'Baseball', 'Softball', 'Soccer (Boys)', 'Soccer (Girls)',
          'Tennis', 'Golf', 'Lacrosse', 'Ultimate Frisbee'
        ],
        academicEvents: [
          'Academic', 'STEM Olympiad', 'Science Fair', 'Spring Speech & Debate'
        ],
        description: 'Perfect season for outdoor sports and spring academic competitions'
      },
      summer: {
        season: 'Summer',
        primarySports: [
          'Swimming & Diving', 'Water Polo', 'Beach Volleyball', 'Tennis',
          'Golf', 'Cycling', 'Triathlon', 'Surfing'
        ],
        academicEvents: [
          'Summer STEM Camps', 'Robotics', 'Programming Competitions', 'Music Festivals'
        ],
        description: 'Ideal for water sports and outdoor summer activities'
      },
      fall: {
        season: 'Fall',
        primarySports: [
          'Football', 'Volleyball', 'Cross Country', 'Soccer', 'Field Hockey',
          'Wrestling (early season)', 'Basketball (early season)'
        ],
        academicEvents: [
          'Academic Decathlon', 'Fall Speech & Debate', 'Mathematics Competitions', 'Debate Tournaments'
        ],
        description: 'Traditional fall sports season and academic competition start'
      },
      winter: {
        season: 'Winter',
        primarySports: [
          'Basketball', 'Wrestling', 'Swimming & Diving', 'Ice Hockey',
          'Skiing & Snowboarding', 'Figure Skating', 'Indoor Track & Field'
        ],
        academicEvents: [
          'Academic Bowl', 'Science Olympiad', 'Winter Speech & Debate', 'Math Bowl'
        ],
        description: 'Indoor sports season and peak academic competition time'
      }
    };

    return seasonalSports[currentSeason];
  };

  // Check if a sport is in season
  const isSportInSeason = (sport: string): boolean => {
    const seasonal = getSeasonalRecommendations();
    return seasonal.primarySports.some(s => sport.includes(s.split(' ')[0])) ||
           seasonal.academicEvents.some(s => sport.includes(s.split(' ')[0]));
  };

  // Auto-populate events when sport is selected
  const handleSportChange = (sport: string) => {
    form.setValue("sport", sport);
    
    // Reset age group and gender division when sport changes
    form.setValue("ageGroup", "");
    form.setValue("genderDivision", "");
    
    // Auto-populate events for multi-event sports
    const availableEvents = getEventsForSport(sport);
    if (availableEvents.length > 0) {
      // For swimming and track, auto-select all events
      // User can deselect what they don't need
      setSelectedEvents(availableEvents);
    } else {
      setSelectedEvents([]);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teamSize: 8,
      tournamentType: "single",
      competitionFormat: "bracket",
      status: "upcoming",
      bracket: {},
    },
  });


  // Auto-save functionality
  useEffect(() => {
    // Load draft from localStorage on component mount
    const savedDraft = localStorage.getItem('tournamentDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Restore form values
        Object.keys(draftData).forEach(key => {
          if (key !== 'teams' && key !== 'currentStep' && key !== 'draftId') {
            form.setValue(key as any, draftData[key]);
          }
        });
        // Restore events and step
        if (draftData.selectedEvents) setSelectedEvents(draftData.selectedEvents);
        if (draftData.eventRecorders) setEventRecorders(draftData.eventRecorders);
        if (draftData.currentStep) setCurrentStep(draftData.currentStep);
        
        toast({
          title: "Draft Restored",
          description: "Your previous tournament draft has been restored.",
        });
      } catch (error) {
        console.error("Failed to load draft:", error);
        localStorage.removeItem('tournamentDraft');
      }
    }
  }, [form, toast]);

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name || value.sport) { // Only save if there's meaningful content
        const draftData = { ...value, selectedEvents, eventRecorders, currentStep };
        localStorage.setItem('tournamentDraft', JSON.stringify(draftData));
        setAutoSaveStatus('saved');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedEvents, eventRecorders, currentStep]);

  const selectedSport = sports.find(sport => sport.sportName === form.watch("sport"));
  const isLeaderboardSport = selectedSport?.competitionType === "leaderboard";
  const competitionFormat = form.watch("competitionFormat");
  const teamSize = form.watch("teamSize");

  // Helper functions for stage configuration
  const getStage1Name = (format: string) => {
    switch (format) {
      case 'round-robin': return 'Round Robin Stage';
      case 'pool-play': return 'Pool Play Stage';
      case 'swiss-system': return 'Swiss System Stage';
      default: return 'Group Stage';
    }
  };

  const getStage1Description = (format: string) => {
    switch (format) {
      case 'round-robin': return 'Every team plays every other team to determine rankings';
      case 'pool-play': return 'Teams compete in groups with top performers advancing';
      case 'swiss-system': return 'Teams are paired based on performance for balanced competition';
      default: return 'Teams compete in groups to advance to next stage';
    }
  };

  const getStage2Name = (format: string) => {
    switch (format) {
      case 'single-elimination': return 'Single Elimination';
      case 'double-elimination': return 'Double Elimination';
      case 'best-of-series': return 'Championship Series';
      default: return 'Knockout Stage';
    }
  };

  const getStage2Description = (format: string) => {
    switch (format) {
      case 'single-elimination': return 'One loss eliminates teams from tournament';
      case 'double-elimination': return 'Teams get a second chance in losers bracket';
      case 'best-of-series': return 'Championship determined by best-of series matches';
      default: return 'Top teams compete for tournament championship';
    }
  };

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormData & { teams: TeamData[] }) => {
      // Transform data to match database schema
      const transformedData = {
        ...data,
        teams: data.teams,
        entryFee: data.entryFee ? String(data.entryFee) : "0", // Convert to string for numeric field
        tournamentDate: data.tournamentDate ? (typeof data.tournamentDate === 'string' ? data.tournamentDate : String(data.tournamentDate)) : null, // Ensure string format
        scoringMethod: selectedSport?.scoringMethod || "wins",
        isGuestCreated: !user, // Mark as guest-created for tournaments created without login
        // Configure double-stage tournaments to use multi-stage format
        competitionFormat: data.tournamentType === 'double-stage' ? 'multi-stage' : (data.competitionFormat || 'bracket'),
        totalStages: data.tournamentType === 'double-stage' ? 2 : 1,
        stageConfiguration: data.tournamentType === 'double-stage' ? {
          stage1: {
            name: getStage1Name(stage1Format),
            format: stage1Format,
            description: getStage1Description(stage1Format)
          },
          stage2: {
            name: getStage2Name(stage2Format), 
            format: stage2Format,
            description: getStage2Description(stage2Format)
          }
        } : null
      };
      
      const response = await apiRequest("/api/tournaments", "POST", transformedData);
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedTournament(data.tournament);
      // Stay on launch step to show success message
      // setCurrentStep('launch'); // Keep on current step
      toast({
        title: "Tournament Created Successfully!",
        description: `${data.tournament.name} has been created successfully with ${selectedEvents.length} event${selectedEvents.length !== 1 ? 's' : ''}.`,
      });
      
      // Clear draft data on successful creation
      localStorage.removeItem('tournamentDraft');
      setAutoSaveStatus(null);
      
      // Invalidate tournament queries
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tournaments"] });
      
      if (onTournamentCreated) {
        onTournamentCreated(data.tournament);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: FormData & { teams: TeamData[], status: 'draft' }) => {
      // Transform data to match database schema
      const transformedData = {
        ...data,
        teams: data.teams,
        status: 'draft',
        entryFee: data.entryFee ? String(data.entryFee) : "0", // Convert to string for numeric field
        tournamentDate: data.tournamentDate ? (typeof data.tournamentDate === 'string' ? data.tournamentDate : String(data.tournamentDate)) : null, // Ensure string format
        scoringMethod: selectedSport?.scoringMethod || "wins",
        isGuestCreated: !user,
      };
      
      const response = await apiRequest("/api/tournaments", "POST", transformedData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Draft Saved!",
        description: "Your tournament draft has been saved successfully.",
      });
      setAutoSaveStatus('saved');
      setIsDraftSaving(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tournaments"] });
      
      // Update localStorage with saved draft ID
      const draftData = { ...form.getValues(), selectedEvents, eventRecorders, currentStep, draftId: data.tournament.id };
      localStorage.setItem('tournamentDraft', JSON.stringify(draftData));
    },
    onError: (error) => {
      toast({
        title: "Draft Save Failed",
        description: "Failed to save tournament draft. Your progress is saved locally.",
        variant: "destructive",
      });
      setAutoSaveStatus('error');
      setIsDraftSaving(false);
      console.error("Draft save error:", error);
    },
  });

  const steps: WizardStep[] = ['sport', 'events', 'settings', 'launch'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedFromStep = (step: WizardStep): boolean => {
    switch (step) {
      case 'sport':
        return !!(form.watch("sport") && form.watch("competitionFormat"));
      case 'events':
        return selectedEvents.length > 0;
      case 'settings':
        return !!(form.watch("name"));
      case 'launch':
        // For launch step, check that all required data is present (not that tournament already exists)
        return !!(form.watch("name") && form.watch("sport") && selectedEvents.length > 0 && !createdTournament);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedFromStep(currentStep)) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleCreateTournament = () => {
    const formData = form.getValues();
    // For event-based tournaments, we create the tournament first
    // Participants will register for specific events later
    createTournamentMutation.mutate({ ...formData, teams: [] });
  };

  const handleEventRecorderUpdate = (eventName: string, recorder: string) => {
    setEventRecorders(prev => ({ ...prev, [eventName]: recorder }));
  };

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'sport': return <Trophy className="w-5 h-5" />;
      case 'events': return <Target className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      case 'launch': return <Play className="w-5 h-5" />;
    }
  };

  // Function to clear cached data
  const clearCachedData = () => {
    localStorage.removeItem('tournament_draft');
    form.reset();
    setSelectedEvents([]);
    setEventRecorders({});
    setCurrentStep('sport');
    toast({
      title: "Cache Cleared",
      description: "All cached tournament data has been cleared.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="enhanced-tournament-wizard">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {getStepIcon(currentStep)}
                <span className="truncate">{stepTitles[currentStep]}</span>
              </CardTitle>
              <CardDescription className="mt-1">{stepDescriptions[currentStep]}</CardDescription>
            </div>
            
            {/* Mobile-first action bar */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              {/* Auto-save status - more compact */}
              {autoSaveStatus && (
                <div className="flex items-center gap-1 text-xs">
                  {autoSaveStatus === 'saved' && (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Auto-saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-blue-600">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">Save failed</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Save Draft - more compact */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDraftSaving(true);
                    const formData = form.getValues();
                    saveDraftMutation.mutate({ ...formData, teams: [], status: 'draft' as const });
                  }}
                  disabled={isDraftSaving || saveDraftMutation.isPending || !form.watch("name")}
                  className="flex items-center gap-1 text-xs"
                  data-testid="button-save-draft"
                >
                  {isDraftSaving || saveDraftMutation.isPending ? (
                    <div className="animate-spin h-3 w-3 border-2 border-gray-500 border-t-transparent rounded-full" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">Save Draft</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                
                {/* Step indicator */}
                <Badge variant="outline" className="text-xs px-2 py-1">
                  Step {currentStepIndex + 1} of {steps.length}
                </Badge>
                
                {/* Clear Cache Button - helpful for mobile users */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCachedData}
                  className="flex items-center gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  data-testid="button-clear-cache"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress bar with some breathing room */}
          <div className="mt-4">
            <Progress value={progress} className="w-full h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 'sport' && (
            <div className="space-y-6">
              {/* COMPREHENSIVE SPORT & FORMAT SELECTION */}
              {!selectedTournamentFormat ? (
                <div className="space-y-6">
                  {/* Seasonal Recommendations Section */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      🌟 {getSeasonalRecommendations().season} Season Recommendations
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      {getSeasonalRecommendations().description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-800 mb-2">🏃 Popular Sports</h5>
                        <div className="text-sm text-green-700 space-y-1">
                          {getSeasonalRecommendations().primarySports.slice(0, 4).map((sport, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-green-500">•</span>
                              {sport}
                            </div>
                          ))}
                          {getSeasonalRecommendations().primarySports.length > 4 && (
                            <div className="text-xs text-green-600 mt-1">
                              +{getSeasonalRecommendations().primarySports.length - 4} more sports
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-green-800 mb-2">🎓 Academic Events</h5>
                        <div className="text-sm text-green-700 space-y-1">
                          {getSeasonalRecommendations().academicEvents.map((event, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-green-500">•</span>
                              {event}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded">
                      💡 <strong>Tip:</strong> Sports marked with ⭐ are currently in season and may have higher participation rates.
                    </div>
                  </div>

                  {/* Step 1: Category Selection */}
                  <div>
                    <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Competition Category *
                    </Label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      data-testid="select-category"
                    >
                      <option value="">Select broader category</option>
                      {Object.entries(sportCategories).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose from Athletic, Academic, or Fine Arts competitions
                    </p>
                  </div>

                  {/* Step 2: Subcategory Selection */}
                  {selectedCategory && (
                    <div>
                      <Label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Area *
                      </Label>
                      <select 
                        value={selectedSubcategory}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        data-testid="select-subcategory"
                      >
                        <option value="">Select specific area</option>
                        {Object.entries(sportCategories[selectedCategory as keyof typeof sportCategories].subcategories).map(([key, subcategory]) => (
                          <option key={key} value={key}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Step 3: Sport Selection */}
                  {selectedCategory && selectedSubcategory && (
                    <div>
                      <Label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Competition *
                      </Label>
                      <select 
                        onChange={(e) => handleSportChange(e.target.value)} 
                        value={form.watch("sport") || ""}
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        data-testid="select-sport"
                      >
                        <option value="">Choose specific competition</option>
                        {getAvailableSports().map((sport: string, index: number) => (
                          <option key={index} value={sport}>
                            {isSportInSeason(sport) ? '⭐ ' : ''}{sport}
                            {isSportInSeason(sport) ? ' (In Season)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Help text showing selection path */}
                  {selectedCategory && selectedSubcategory && form.watch("sport") && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-sm text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">Selection Complete:</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {(sportCategories as any)[selectedCategory].name} → {" "}
                        {(sportCategories as any)[selectedCategory].subcategories[selectedSubcategory].name} → {" "}
                        {form.watch("sport")}
                      </p>
                    </div>
                  )}

                  {/* COMPREHENSIVE TOURNAMENT FORMAT SELECTOR */}
                  {form.watch("sport") && (
                    <div className="mt-6">
                      <ComprehensiveTournamentFormatSelector
                        sport={form.watch("sport") || ""}
                        onFormatSelect={(format) => {
                          setSelectedTournamentFormat(format);
                          form.setValue("tournamentType", format.tournamentType as any);
                          form.setValue("competitionFormat", format.competitionFormat as any);
                        }}
                        selectedFormat={(selectedTournamentFormat as TournamentFormatConfig | null)?.format ?? undefined}
                      />
                    </div>
                  )}

                  {/* SPORT-SPECIFIC CONFIGURATION */}
                  {selectedTournamentFormat && (
                    <div className="mt-6">
                      <SportSpecificConfig
                        format={selectedTournamentFormat}
                        onConfigChange={(config) => setSportSpecificConfig(config)}
                        currentConfig={sportSpecificConfig}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Show comprehensive format selector if format is already selected
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center text-sm text-blue-700 mb-3">
                      <Trophy className="h-4 w-4 mr-2" />
                      <span className="font-medium">Selected Tournament Format</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{selectedTournamentFormat.sport}</p>
                        <p className="text-sm text-gray-600">{selectedTournamentFormat.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTournamentFormat(null);
                          setSportSpecificConfig({});
                        }}
                        data-testid="button-change-format"
                      >
                        Change Format
                      </Button>
                    </div>
                  </div>

                  {/* SPORT-SPECIFIC CONFIGURATION */}
                  <SportSpecificConfig
                    format={selectedTournamentFormat}
                    onConfigChange={(config) => setSportSpecificConfig(config)}
                    currentConfig={sportSpecificConfig}
                  />
                </div>
              )}

              {/* TRADITIONAL SETTINGS (if no comprehensive format selected) */}
              {!selectedTournamentFormat && form.watch("sport") && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="competitionFormat" className="block text-sm font-medium text-gray-700 mb-2">
                      Competition Format *
                    </Label>
                    <select 
                      value={form.watch("competitionFormat")} 
                      onChange={(e) => form.setValue("competitionFormat", e.target.value as any)}
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose format</option>
                      <option value="bracket">🏆 Bracket Tournament (Teams compete head-to-head, winners advance)</option>
                      <option value="leaderboard">📊 Leaderboard Competition (Individual scores, ranked by total points)</option>
                      <option value="series">🎯 Best-of Series (Multiple games between same teams)</option>
                      <option value="bracket-to-series">🏅 Bracket + Championship Series (Bracket leads to final series)</option>
                    </select>
                  </div>

              <div>
                <Label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Type
                </Label>
                <select 
                  value={form.watch("tournamentType")}
                  onChange={(e) => form.setValue("tournamentType", e.target.value as any)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select tournament type</option>
                  <option value="single">⚡ Single Elimination (Lose once, you're out - fastest format)</option>
                  <option value="double">🔄 Double Elimination (Get a second chance in losers bracket)</option>
                  <option value="double-stage">🏟️ Double Stage (Groups first, then elimination bracket)</option>
                  <option value="round-robin">🔄 Round Robin (Everyone plays everyone - most fair)</option>
                </select>
              </div>

              {/* Stage Format Configuration for Multi-Stage Tournaments */}
              {(form.watch("tournamentType") === "double-stage" || form.watch("competitionFormat") === "multi-stage") && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center text-sm text-blue-700 mb-3">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="font-medium">Configure Tournament Stages</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stage1Format" className="block text-sm font-medium text-gray-700 mb-2">
                        Stage 1: Group Play Format
                      </Label>
                      <select 
                        value={stage1Format}
                        onChange={(e) => setStage1Format(e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="round-robin">Round Robin (everyone plays everyone)</option>
                        <option value="pool-play">Pool Play (groups, then advance)</option>
                        <option value="swiss-system">Swiss System (smart pairing)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">How teams compete in the first stage</p>
                    </div>

                    <div>
                      <Label htmlFor="stage2Format" className="block text-sm font-medium text-gray-700 mb-2">
                        Stage 2: Elimination Format
                      </Label>
                      <select 
                        value={stage2Format}
                        onChange={(e) => setStage2Format(e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="single-elimination">Single Elimination (lose and out)</option>
                        <option value="double-elimination">Double Elimination (second chance)</option>
                        <option value="best-of-series">Best-of Series (championship rounds)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">How top teams from Stage 1 compete</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded p-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <Trophy className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="font-medium">Tournament Flow:</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Stage 1:</span> {stage1Format.replace('-', ' ')} → 
                      <span className="font-medium"> Stage 2:</span> {stage2Format.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Smart Age Group, Gender Division, and Skill Level Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group {form.watch("sport") && <span className="text-green-600">✓ Smart filtered for {form.watch("sport")}</span>}
                  </Label>
                  <select
                    value={form.watch("ageGroup") || ""}
                    onChange={(e) => {
                      form.setValue("ageGroup", e.target.value);
                    }}
                    disabled={!form.watch("sport")}
                    className={`w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!form.watch("sport") ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="select-age-group"
                  >
                    <option value="">{form.watch("sport") ? "Select age group" : "Select a sport first"}</option>
                    {getAgeGroupsForSport(form.watch("sport") || "").map((ageGroup) => (
                      <option key={ageGroup} value={ageGroup}>
                        {ageGroup} {getAgeGroupDescription(ageGroup)}
                      </option>
                    ))}
                  </select>
                  {!form.watch("sport") && (
                    <p className="text-xs text-gray-500 mt-1">Age groups will be filtered based on your sport selection</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="genderDivision" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Division {form.watch("sport") && <span className="text-green-600">✓ Smart filtered for {form.watch("sport")}</span>}
                  </Label>
                  <select
                    value={form.watch("genderDivision") || ""}
                    onChange={(e) => {
                      form.setValue("genderDivision", e.target.value);
                    }}
                    disabled={!form.watch("sport")}
                    className={`w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!form.watch("sport") ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="select-gender-division"
                  >
                    <option value="">{form.watch("sport") ? "Select division" : "Select a sport first"}</option>
                    {getGenderDivisionsForSport(form.watch("sport") || "").map((division) => (
                      <option key={division} value={division}>
                        {division} {division === 'Mixed' ? '(All genders welcome)' :
                         division === 'Co-Ed' ? '(Mixed teams)' :
                         division === 'Open Division' ? '(Inclusive competition)' :
                         division === 'Boys' ? "(Youth male)" :
                         division === 'Girls' ? "(Youth female)" :
                         division === 'Men' ? "(Adult male)" :
                         division === 'Women' ? "(Adult female)" : ''}
                      </option>
                    ))}
                  </select>
                  {!form.watch("sport") && (
                    <p className="text-xs text-gray-500 mt-1">Divisions will be filtered based on your sport selection</p>
                  )}
                </div>

                {/* Skill Level Dropdown */}
                <div>
                  <Label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Level {form.watch("sport") && <span className="text-green-600">✓ Smart filtered for {form.watch("sport") || ""}</span>}
                  </Label>
                  <select
                    value={selectedSkillLevel}
                    onChange={(e) => {
                      setSelectedSkillLevel(e.target.value);
                      form.setValue("skillLevel", e.target.value);
                    }}
                    disabled={!form.watch("sport")}
                    className={`w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!form.watch("sport") ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="select-skill-level"
                  >
                    <option value="">{form.watch("sport") ? "Select skill level" : "Select a sport first"}</option>
                    {getSkillLevelsForSport(form.watch("sport") || "").map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} {level.description && `(${level.description})`}
                      </option>
                    ))}
                  </select>
                  {!form.watch("sport") ? (
                    <p className="text-xs text-gray-500 mt-1">Skill levels will be filtered based on your sport selection</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Choose appropriate skill level for your tournament</p>
                  )}
                </div>
              </div>

              {/* Enhanced Skill Level Information */}
              {selectedSkillLevel && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    🎯 Skill Level Guidelines
                  </h5>
                  <div className="text-sm text-purple-700">
                    {(() => {
                      const selectedLevelInfo = getSkillLevelsForSport(form.watch("sport") || "").find(level => level.value === selectedSkillLevel);
                      return selectedLevelInfo ? (
                        <p>
                          <strong>{selectedLevelInfo.label}:</strong> {selectedLevelInfo.description}
                        </p>
                      ) : null;
                    })()}
                    
                    {/* Sport-specific guidance */}
                    {form.watch("sport")?.includes('Swimming') && selectedSkillLevel.includes('time') && (
                      <p className="mt-2"><strong>Note:</strong> Participants should have achieved or be close to the time standard for fair competition.</p>
                    )}
                    {form.watch("sport")?.includes('Wrestling') && selectedSkillLevel !== 'open' && (
                      <p className="mt-2"><strong>Note:</strong> Experience level helps ensure safe and competitive matches.</p>
                    )}
                    {form.watch("sport")?.includes('Esports') && selectedSkillLevel !== 'open' && (
                      <p className="mt-2"><strong>Note:</strong> Rank verification may be required for competitive integrity.</p>
                    )}
                    {selectedSkillLevel === 'open' && (
                      <p className="mt-2"><strong>Open Division:</strong> Perfect for inclusive tournaments where skill mixing is encouraged.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Smart Recommendations Based on Sport */}
              {form.watch("sport") && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">🎯 Smart Recommendations for {form.watch("sport")}</h5>
                  <div className="text-sm text-blue-700 space-y-1">
                    {form.watch("sport")?.includes('Adaptive') && (
                      <p>• <strong>Inclusive Focus:</strong> Consider "All Ages" and "Open Division" for maximum accessibility</p>
                    )}
                    {form.watch("sport")?.includes('Academic') && (
                      <p>• <strong>School-Based:</strong> Academic competitions typically follow school grade levels</p>
                    )}
                    {['Esports', 'Drone Racing'].includes(form.watch("sport") || '') && (
                      <p>• <strong>Technology Skills:</strong> These sports work well with High School and College age groups</p>
                    )}
                    {form.watch("sport")?.includes('Winter') && (
                      <p>• <strong>Facility Requirements:</strong> Winter sports may have limited venue availability</p>
                    )}
                  </div>
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {currentStep === 'events' && (
            <div className="space-y-6">
              {form.watch("sport") ? (
                getEventsForSport(form.watch("sport") || "").length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {form.watch("sport")} Events ({selectedEvents.length} of {getEventsForSport(form.watch("sport") || "").length} selected)
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getEventsForSport(form.watch("sport") || "").map((event, index) => {
                        const isSelected = selectedEvents.some(e => e.eventName === event.eventName);
                        return (
                          <div key={index} className={`flex items-center justify-between p-2 rounded border ${
                            isSelected ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedEvents(prev => [...prev, event]);
                                  } else {
                                    setSelectedEvents(prev => prev.filter(e => e.eventName !== event.eventName));
                                  }
                                }}
                              />
                              <span className={`font-medium ${
                                isSelected ? 'text-gray-900' : 'text-gray-500'
                              }`}>{event.eventName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                                {event.eventType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {event.scoringUnit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-blue-700">
                        <p>Choose which events to include in your tournament</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEvents(getEventsForSport(form.watch("sport") || ""))}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEvents([])}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Recorder Assignment - Enhanced Google Sheets Style */}
                  {selectedEvents.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Event Assignments (Like Google Sheets Signup)
                      </h4>
                      <p className="text-sm text-green-700 mb-4">
                        Set up events for coach self-selection, just like your current Google Sheets process. Coaches will log in and claim their preferred events.
                      </p>
                      
                      <div className="space-y-4">
                        {selectedEvents.map((event, index) => (
                          <div key={index} className="bg-white rounded border border-gray-200 p-4">
                            {/* Event Info - Full Width on Mobile */}
                            <div className="mb-3">
                              <div className="font-medium text-gray-900 mb-1">
                                {event.eventName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {event.eventType} • {event.scoringUnit} • Max {(event as any).maxAttempts || 3} attempts
                              </div>
                            </div>
                            
                            {/* Assignment Controls - Stacked on Mobile */}
                            <div className="space-y-3">
                              {/* Assignment Type Dropdown - Native HTML */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Assignment Type
                                </label>
                                <select
                                  value={eventRecorders[event.eventName] || 'open'}
                                  onChange={(e) => handleEventRecorderUpdate(event.eventName, e.target.value)}
                                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  data-testid={`select-assignment-${index}`}
                                >
                                  <option value="open">🟢 Open for Self-Selection</option>
                                  <option value="pre-assigned">🔵 Pre-Assign Specific Coach</option>
                                  <option value="manager-only">🔴 Tournament Manager Only</option>
                                </select>
                              </div>
                              
                              {/* Coach Assignment Input - Shows when pre-assigned is selected */}
                              {eventRecorders[event.eventName] === 'pre-assigned' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Assigned Coach
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter coach name or email"
                                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    data-testid={`input-coach-${index}`}
                                  />
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Status:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  eventRecorders[event.eventName] === 'open' ? 'bg-green-100 text-green-700' :
                                  eventRecorders[event.eventName] === 'pre-assigned' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {eventRecorders[event.eventName] === 'open' ? 'Available' : 
                                   eventRecorders[event.eventName] === 'pre-assigned' ? 'Assigned' : 'Restricted'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="font-medium text-blue-900 mb-2">🎯 Coach Experience (Based on Your Feedback)</h5>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• <strong>Open Events:</strong> Coaches log in and claim "I'll take discus on Day 1" (like Google Sheets)</p>
                          <p>• <strong>Pre-Assigned:</strong> You assign specific coaches, they accept/decline the assignment</p>
                          <p>• <strong>Traditions:</strong> System remembers "Coach always does discus and triple jump"</p>
                          <p>• <strong>Event Access:</strong> Each coach only sees their assigned event dashboard on tournament day</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // For sports without specific events defined, show simple confirmation
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {form.watch("sport") || "Tournament"} Ready
                    </h4>
                    <p className="text-sm text-green-700">
                      {form.watch("sport") || "This sport"} tournaments use a single competition format. You can proceed to configure tournament settings.
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Please select a sport first to configure events</p>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('sport')}
                    className="mt-3"
                  >
                    Go Back to Sport Selection
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'settings' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter tournament name"
                  data-testid="input-tournament-name"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tournamentDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    {...form.register("tournamentDate")}
                    className="w-full"
                    data-testid="input-tournament-date"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When will the tournament take place?
                  </p>
                </div>

                <div>
                  <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location / Address
                  </Label>
                  <AddressAutocomplete
                    value={form.watch("location") || ""}
                    onChange={(value) => form.setValue("location", value)}
                    placeholder="Enter venue address or location"
                    className="w-full"
                    data-testid="input-location"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Where will the tournament be held? Start typing for address suggestions.
                  </p>
                </div>
              </div>

              {/* Smart Venue Requirements Section */}
              {form.watch("sport") && getVenueRequirementsForSport(form.watch("sport") || '') && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900 flex items-center gap-2">
                    🏟️ Venue Requirements for {form.watch("sport")}
                  </h4>
                  <p className="text-sm text-orange-700 mb-4">
                    Based on your sport selection, here are the recommended venue requirements to ensure a successful tournament:
                  </p>
                  
                  {(() => {
                    const requirements = getVenueRequirementsForSport(form.watch("sport") || '');
                    if (!requirements) return null;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Facilities */}
                        {requirements.facilities.length > 0 && (
                          <div className="bg-white p-3 rounded border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                              🏢 Essential Facilities
                            </h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirements.facilities.map((facility, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {facility}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Equipment */}
                        {requirements.equipment.length > 0 && (
                          <div className="bg-white p-3 rounded border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                              ⚙️ Required Equipment
                            </h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirements.equipment.map((equipment, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {equipment}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Safety */}
                        {requirements.safety.length > 0 && (
                          <div className="bg-white p-3 rounded border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                              🛡️ Safety Requirements
                            </h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirements.safety.map((safety, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {safety}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Accessibility */}
                        {requirements.accessibility.length > 0 && (
                          <div className="bg-white p-3 rounded border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                              ♿ Accessibility Features
                            </h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirements.accessibility.map((access, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {access}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Special Requirements */}
                        {requirements.special.length > 0 && (
                          <div className="bg-white p-3 rounded border border-orange-200 md:col-span-2">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-1">
                              ⭐ Special Considerations
                            </h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirements.special.map((special, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {special}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                    <strong>💡 Pro Tip:</strong> Share this checklist with your venue coordinator to ensure all requirements are met before tournament day.
                  </div>
                </div>
              )}

              {/* Smart Equipment Requirements Section */}
              {form.watch("sport") && getEquipmentRequirements(form.watch("sport") || '', selectedEvents).length > 0 && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2">
                    ⚙️ Equipment Requirements for {form.watch("sport")}
                  </h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Essential and recommended equipment for your tournament. Required items are marked with ⭐.
                  </p>
                  
                  {getEquipmentRequirements(form.watch("sport") || '', selectedEvents).map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-white p-3 rounded border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                        📦 {category.category}
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-2 p-2 border border-gray-100 rounded">
                            <span className={`text-sm mt-0.5 ${item.required ? 'text-red-500' : 'text-blue-500'}`}>
                              {item.required ? '⭐' : '💙'}
                            </span>
                            <div className="flex-1">
                              <span className={`text-sm font-medium ${item.required ? 'text-red-800' : 'text-blue-800'}`}>
                                {item.name}
                              </span>
                              {item.description && (
                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    <strong>📋 Equipment Checklist:</strong> Use this list to coordinate with your venue and ensure all necessary equipment is available on tournament day.
                  </div>
                </div>
              )}

              {/* Golf-Specific Cut Configuration */}
              {form.watch("sport")?.includes('Golf') && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 flex items-center gap-2">
                    ⛳ Golf Tournament Cut Configuration
                  </h4>
                  <p className="text-sm text-green-700 mb-4">
                    Configure if and when to make a cut to reduce the field size for final rounds.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cut After Round
                      </label>
                      <select
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        data-testid="select-cut-round"
                      >
                        <option value="">No Cut (All players finish)</option>
                        <option value="1">After Round 1 (36-hole tournament)</option>
                        <option value="2">After Round 2 (Traditional 72-hole cut)</option>
                        <option value="3">After Round 3 (4-round tournament)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Most professional tournaments cut after round 2
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cut to Top Players
                      </label>
                      <select
                        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        data-testid="select-cut-number"
                      >
                        <option value="70">Top 70 and ties (PGA Tour standard)</option>
                        <option value="60">Top 60 and ties</option>
                        <option value="50">Top 50 and ties</option>
                        <option value="40">Top 40 and ties</option>
                        <option value="30">Top 30 and ties</option>
                        <option value="20">Top 20 and ties</option>
                        <option value="16">Top 16 and ties</option>
                        <option value="custom">Custom number</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Players tied at cut line all advance
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">Cut Rules & Guidelines</h5>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• <strong>Ties:</strong> All players tied at the cut line advance to subsequent rounds</p>
                      <p>• <strong>Minimum:</strong> At least 20 players advance even if more are needed due to ties</p>
                      <p>• <strong>Weather:</strong> Cut numbers may be adjusted if rounds are shortened due to weather</p>
                      <p>• <strong>Scoring:</strong> Cut is typically made based on total strokes, lowest scores advance</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                    <strong>💡 Tip:</strong> Most amateur tournaments don't use cuts to ensure all players get full tournament experience. Professional tournaments typically cut after round 2 to top 70 players.
                  </div>
                </div>
              )}

              {/* Registration Fee & Payment Settings */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Registration Fee & Payment (Optional)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Fee ($)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("entryFee")}
                      placeholder="0.00"
                      className="w-full"
                      data-testid="input-entry-fee"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank for free tournaments
                    </p>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Enable Donations
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...form.register("donationsEnabled")}
                        className="rounded border-gray-300"
                        data-testid="checkbox-donations-enabled"
                      />
                      <span className="text-sm text-gray-600">
                        Allow additional donations during registration
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Perfect for fundraising tournaments
                    </p>
                  </div>
                </div>

                {form.watch("donationsEnabled") && (
                  <div>
                    <Label htmlFor="donationGoal" className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Goal ($)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]+(\.[0-9]{1,2})?"
                      {...form.register("donationGoal")}
                      placeholder="1000.00"
                      className="w-full"
                      data-testid="input-donation-goal"
                    />
                  </div>
                )}

                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  <strong>Foundation Plan:</strong> 2% platform fee supports student education. You keep 98% of all payments.
                </div>
              </div>

              {/* Calendar Discoverability Section */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Tournament Discovery & Visibility
                </h4>
                <p className="text-sm text-green-700 mb-4">
                  Make your tournament discoverable on our public calendar so other teams and athletes in your region can find and participate in your event.
                </p>
                
                <div className="space-y-4">
                  {/* Main Calendar Visibility Toggle */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="isPublicCalendarVisible"
                      checked={form.watch("isPublicCalendarVisible") || false}
                      onCheckedChange={(checked) => form.setValue("isPublicCalendarVisible", checked as boolean)}
                      data-testid="checkbox-calendar-visible"
                    />
                    <div className="flex-1">
                      <Label htmlFor="isPublicCalendarVisible" className="text-sm font-medium text-green-800">
                        Add to Public Tournament Calendar
                      </Label>
                      <p className="text-xs text-green-600 mt-1">
                        Your tournament will appear on our regional calendar for discovery by local teams and athletes
                      </p>
                    </div>
                  </div>

                  {/* Additional fields when calendar visibility is enabled */}
                  {form.watch("isPublicCalendarVisible") && (
                    <div className="space-y-4 pl-6 border-l-2 border-green-300">
                      {/* Geographic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium text-green-800 mb-2">
                            State/Region
                          </Label>
                          <Input
                            placeholder="e.g., Texas, California"
                            {...form.register("calendarRegion")}
                            className="w-full"
                            data-testid="input-calendar-region"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Help teams find tournaments in their region
                          </p>
                        </div>
                        
                        <div>
                          <Label className="block text-sm font-medium text-green-800 mb-2">
                            City
                          </Label>
                          <Input
                            placeholder="e.g., Austin, Los Angeles"
                            {...form.register("calendarCity")}
                            className="w-full"
                            data-testid="input-calendar-city"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Local discovery for nearby teams
                          </p>
                        </div>
                      </div>

                      {/* Tournament Tags */}
                      <div>
                        <Label className="block text-sm font-medium text-green-800 mb-2">
                          Tournament Tags (Optional)
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {['competitive', 'recreational', 'youth', 'adult', 'beginner-friendly', 'advanced', 'championship'].map((tag) => (
                            <Button
                              key={tag}
                              type="button"
                              variant={form.watch("calendarTags")?.includes(tag) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const currentTags = form.watch("calendarTags") || [];
                                const newTags = currentTags.includes(tag)
                                  ? currentTags.filter(t => t !== tag)
                                  : [...currentTags, tag];
                                form.setValue("calendarTags", newTags);
                              }}
                              className="h-8 px-3 text-xs"
                              data-testid={`tag-${tag}`}
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-green-600">
                          Help teams find tournaments that match their skill level and style
                        </p>
                      </div>

                      {/* Benefits and Information */}
                      <div className="bg-white p-3 rounded border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">📈 Benefits of Public Calendar Listing:</h5>
                        <ul className="text-xs text-green-700 space-y-1">
                          <li>• Increased tournament participation and registration</li>
                          <li>• Discover other tournaments in your area to avoid scheduling conflicts</li>
                          <li>• Build your local sports community and network</li>
                          <li>• Free promotion to our growing user base</li>
                        </ul>
                      </div>
                      
                      <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                        <strong>🛡️ Moderation:</strong> Public tournaments are reviewed to ensure quality. Verified organizations are auto-approved.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
                  {competitionFormat === 'leaderboard' ? 'Number of Participants' : 'Number of Teams'} *
                </Label>
                <select
                  value={teamSize?.toString() || ""}
                  onChange={(e) => form.setValue("teamSize", parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="select-team-size"
                >
                  <option value="">Select number of {competitionFormat === 'leaderboard' ? 'participants' : 'teams'}</option>
                  {Array.from({ length: 63 }, (_, i) => i + 2).map((size) => (
                    <option key={size} value={size.toString()}>
                      {size} {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}
                    </option>
                  ))}
                </select>
                
                {teamSize && teamSize > 64 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <strong>Large Tournament:</strong> Tournaments with {teamSize}+ teams may require multiple rounds and extended time.
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tournament Structure</h4>
                <p className="text-sm text-blue-700">
                  {competitionFormat === 'bracket' 
                    ? `${Math.ceil(Math.log2(teamSize || 2))} rounds of elimination matches`
                    : competitionFormat === 'leaderboard'
                    ? 'Individual performance rankings based on scores/times'
                    : `Series format with best-of matches`
                  }
                </p>
              </div>
            </div>
          )}

          {currentStep === 'launch' && !createdTournament && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tournament Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {form.watch("name")}</div>
                    <div><strong>Sport:</strong> {form.watch("sport")}</div>
                    <div><strong>Format:</strong> {competitionFormat}</div>
                    <div><strong>Events:</strong> {selectedEvents.length} selected</div>
                    {form.watch("ageGroup") && <div><strong>Age Group:</strong> {form.watch("ageGroup")}</div>}
                    {form.watch("genderDivision") && <div><strong>Division:</strong> {form.watch("genderDivision")}</div>}
                    {form.watch("tournamentDate") && (
                      <div><strong>Date:</strong> {new Date(form.watch("tournamentDate") || '').toLocaleDateString()} at {new Date(form.watch("tournamentDate") || '').toLocaleTimeString()}</div>
                    )}
                    {form.watch("location") && <div><strong>Location:</strong> {form.watch("location")}</div>}
                    {form.watch("entryFee") && parseFloat(form.watch("entryFee") || '0') > 0 && (
                      <div><strong>Registration Fee:</strong> ${form.watch("entryFee")}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Selected Events</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {selectedEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{event.eventName}</span>
                        <Badge variant="secondary" className="text-xs">{event.eventType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to Launch Tournament</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your tournament will be created with event-specific registration. Participants can sign up for individual events they want to compete in.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'launch' && createdTournament && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament Created Successfully!</h3>
                <p className="text-gray-600">
                  <strong>{createdTournament.name}</strong> has been created! Participants can now register for events through the event-specific registration system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.open(`/tournament/${createdTournament.id}`, '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-view-tournament"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Tournament
                </Button>
                
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Create Another Tournament
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {!createdTournament && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep === 'launch' ? (
                <Button
                  onClick={handleCreateTournament}
                  disabled={createTournamentMutation.isPending || !canProceedFromStep(currentStep)}
                  data-testid="button-create-tournament"
                >
                  {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
                  <Trophy className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}