import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// Mock data for support teams until database is fully connected
const mockSupportTeams = [
  {
    id: '1',
    name: 'Varsity Cheerleading',
    teamType: 'cheerleading',
    teamSize: 18,
    competitionLevel: 'varsity',
    season: 'fall',
    isActive: true
  },
  {
    id: '2', 
    name: 'Dance Team',
    teamType: 'dance_team',
    teamSize: 12,
    competitionLevel: 'varsity',
    season: 'fall',
    isActive: true
  },
  {
    id: '3',
    name: 'Marching Band',
    teamType: 'marching_band', 
    teamSize: 45,
    competitionLevel: 'varsity',
    season: 'fall',
    isActive: true
  }
];

const mockSupportTeamMembers = [
  {
    id: '1',
    supportTeamId: '1',
    firstName: 'Madison',
    lastName: 'Torres',
    position: 'captain',
    grade: 12,
    yearsExperience: 4,
    skillLevel: 'advanced',
    canStunt: true,
    canTumble: true,
    canFly: true,
    canBase: true,
    medicalClearance: true,
    isActive: true
  },
  {
    id: '2',
    supportTeamId: '1',
    firstName: 'Jessica',
    lastName: 'Kim',
    position: 'tumbler',
    grade: 11,
    yearsExperience: 3,
    skillLevel: 'advanced',
    canStunt: false,
    canTumble: true,
    canFly: false,
    canBase: false,
    medicalClearance: false,
    isActive: true
  },
  {
    id: '3',
    supportTeamId: '2',
    firstName: 'Sophia',
    lastName: 'Chen',
    position: 'captain',
    grade: 12,
    yearsExperience: 4,
    skillLevel: 'elite',
    canStunt: false,
    canTumble: false,
    canFly: false,
    canBase: false,
    medicalClearance: true,
    isActive: true
  }
];

const mockInjuries = [
  {
    id: '1',
    memberId: '2',
    athleticTrainerId: 'trainer-1',
    injuryDate: '2024-08-15',
    injuryLocation: 'ankle',
    injuryType: 'sprain',
    activityWhenInjured: 'tumbling',
    surfaceType: 'gym_floor',
    severity: 'moderate',
    description: 'Landed awkwardly during back tuck, immediate pain and swelling',
    returnToPlayCleared: false,
    parentNotified: true
  }
];

// Get all support teams
router.get('/support-teams', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: mockSupportTeams,
      message: 'Support teams retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching support teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get support team members by team
router.get('/support-teams/:teamId/members', (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const members = mockSupportTeamMembers.filter(member => member.supportTeamId === teamId);
    
    res.json({
      success: true,
      data: members,
      message: 'Support team members retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching support team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support team members',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get injuries for a specific member
router.get('/support-team-members/:memberId/injuries', (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const injuries = mockInjuries.filter(injury => injury.memberId === memberId);
    
    res.json({
      success: true,
      data: injuries,
      message: 'Member injuries retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching member injuries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member injuries', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new support team injury report
router.post('/support-team-injuries', (req: Request, res: Response) => {
  try {
    const {
      memberId,
      athleticTrainerId,
      injuryDate,
      injuryLocation,
      injuryType,
      activityWhenInjured,
      stuntingPosition,
      surfaceType,
      severity,
      description,
      treatmentProvided
    } = req.body;

    const newInjury = {
      id: `injury-${Date.now()}`,
      memberId,
      athleticTrainerId,
      injuryDate,
      injuryLocation,
      injuryType,
      activityWhenInjured,
      stuntingPosition,
      surfaceType,
      severity,
      description,
      treatmentProvided,
      returnToPlayCleared: false,
      parentNotified: false,
      doctorReferral: false,
      createdAt: new Date().toISOString()
    };

    // In a real application, this would be saved to the database
    mockInjuries.push(newInjury);

    res.status(201).json({
      success: true,
      data: newInjury,
      message: 'Injury report created successfully'
    });
  } catch (error) {
    console.error('Error creating injury report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create injury report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI consultation for support team injuries
router.post('/support-team-ai-consultation', (req: Request, res: Response) => {
  try {
    const {
      athleticTrainerId,
      memberId,
      supportTeamId,
      consultationType,
      sport,
      injuryLocation,
      symptoms,
      activityDescription,
      stuntingActivity,
      basketTossInvolved,
      surfaceType
    } = req.body;

    // Mock AI consultation response based on cheerleading injury protocols
    let aiRecommendations = '';
    let riskLevel = 'low';
    let redFlags: string[] = [];
    let recommendedActions: string[] = [];

    // Cheerleading-specific AI logic
    if (sport === 'cheerleading') {
      if (injuryLocation === 'ankle') {
        aiRecommendations = `CHEERLEADING ANKLE INJURY PROTOCOL:
• Most common cheerleading injury (44.9% prevalence)
• Assess landing mechanics from jumps/tumbling
• Ottawa Ankle Rules for fracture screening
• Evaluate proprioception and balance deficits
• Check for chronic ankle instability patterns`;
        
        riskLevel = 'moderate';
        recommendedActions = [
          'Weight-bearing assessment',
          'Ottawa Ankle Rules screening',
          'Proprioceptive balance testing', 
          'Landing mechanics evaluation',
          'Progressive return-to-stunt protocol'
        ];

        if (stuntingActivity) {
          redFlags.push('Stunting activity involved - higher re-injury risk');
        }
        if (surfaceType === 'gym_floor') {
          redFlags.push('Hard surface landing - increased severity concern');
        }
      } else if (injuryLocation === 'neck') {
        aiRecommendations = `CHEERLEADING HEAD/NECK INJURY PROTOCOL:
• 96% of cheer concussions occur during stunts
• IMMEDIATE cervical spine clearance required
• SCAT5 baseline comparison mandatory
• No return-to-stunt until cleared by physician`;
        
        riskLevel = 'critical';
        redFlags = [
          'ANY neck injury during stunting requires immediate medical evaluation',
          'Cervical spine injury risk - no movement until cleared',
          'Potential concussion - cognitive assessment needed'
        ];
        recommendedActions = [
          'IMMEDIATE medical evaluation',
          'Cervical spine imaging if indicated',
          'Concussion protocol initiation',
          'Parent/guardian notification',
          'No return to activity until physician clearance'
        ];
      }
    }

    // Dance team specific logic
    if (sport === 'dance_team') {
      aiRecommendations = `DANCE TEAM INJURY PROTOCOL:
• Assess turnout and hip mobility patterns
• Evaluate technique-related injury factors
• Consider overuse from repetitive movements
• Performance conditioning assessment needed`;
      
      recommendedActions = [
        'Movement pattern analysis',
        'Technique assessment',
        'Flexibility evaluation',
        'Cross-training recommendations'
      ];
    }

    const consultation = {
      id: `consult-${Date.now()}`,
      athleticTrainerId,
      memberId,
      supportTeamId,
      consultationType,
      sport,
      injuryLocation,
      symptoms,
      activityDescription,
      aiRecommendations,
      riskLevel,
      redFlags,
      recommendedActions,
      stuntingActivity,
      basketTossInvolved,
      surfaceType,
      followUpRequired: riskLevel === 'high' || riskLevel === 'critical',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: consultation,
      message: 'AI consultation completed successfully'
    });
  } catch (error) {
    console.error('Error processing AI consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI consultation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get support team safety metrics
router.get('/support-teams/:teamId/safety-metrics', (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    // Mock safety metrics based on research
    const safetyMetrics = {
      teamId,
      injuryRate: teamId === '1' ? '1.05 per 1,000 exposures' : '0.85 per 1,000 exposures',
      catastrophicInjuryReduction: '85% since 2014',
      concussionRisk: teamId === '1' ? '96% from stunting activities' : '15% from performance activities',
      athleticTrainerPresent: true,
      usaCheersafety: teamId === '1' ? true : false,
      usasfCompliant: teamId === '1' ? true : false,
      nfhsRules: teamId === '1' ? true : false,
      lastSafetyDrill: '2024-08-01',
      nextCertificationRenewal: '2024-12-01',
      activeSafetyProtocols: [
        'Emergency Action Plan',
        'Concussion Protocol',
        'Surface Safety Checks',
        'Equipment Inspections'
      ]
    };

    res.json({
      success: true,
      data: safetyMetrics,
      message: 'Safety metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching safety metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safety metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;