import type { Request, Response } from 'express';
import { storage } from './storage';
import { insertTournamentSchema } from '@shared/schema';
import { BracketGenerator } from './utils/bracket-generator';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationRequest {
  message: string;
  conversation_history: ConversationMessage[];
  domain: 'education' | 'business' | 'coaches';
  user_context: any;
  consultation_type: string;
}

async function createTournamentForUser(
  req: Request,
  message: string,
  extractedContext: any
): Promise<{ success: boolean; tournament?: any; error?: string }> {
  try {
    // Check if user is authenticated
    const isAuth = req.isAuthenticated && req.isAuthenticated();
    if (!isAuth || !(req.user as any)?.claims?.sub) {
      return { success: false, error: 'User not authenticated' };
    }

    const userId = (req.user as any).claims.sub;
    
    // Extract tournament details from the message
    const tournamentDetails = extractTournamentDetailsFromMessage(message, extractedContext);
    
    // Get user to check limits
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check tournament limits
    const existingTournaments = await storage.getTournaments();
    const userTournaments = existingTournaments.filter((t: any) => t.createdBy === userId);
    
    const getTournamentLimit = (plan: string, status: string) => {
      if (status !== 'active') return 1;
      switch (plan) {
        case 'foundation':
        case 'free':
          return 3;
        case 'tournament-organizer':
          return 25;
        case 'business-enterprise':
          return 100;
        case 'district_enterprise':
        case 'enterprise':
        case 'annual-pro':
          return -1; // Unlimited
        default:
          return 2;
      }
    };

    const limit = getTournamentLimit(user.subscriptionPlan || 'foundation', user.subscriptionStatus || 'inactive');
    
    if (limit !== -1 && userTournaments.length >= limit) {
      return { 
        success: false, 
        error: `Tournament limit reached (${userTournaments.length}/${limit}) for your ${user.subscriptionPlan} plan`
      };
    }

    // Validate and create tournament
    const validatedData = insertTournamentSchema.parse(tournamentDetails);
    
    // Generate bracket structure
    const teams = Array.isArray(validatedData.teams) ? validatedData.teams : [];
    const teamNames = teams.map((team: any) => typeof team === 'string' ? team : team.teamName);
    
    const bracketStructure = BracketGenerator.generateBracket(
      teamNames,
      '',
      validatedData.tournamentType || 'single',
      validatedData.sport || 'Basketball'
    );

    // Create tournament
    const tournamentData = {
      ...validatedData,
      bracket: bracketStructure,
      status: 'upcoming' as const,
      createdBy: userId
    };

    const tournament = await storage.createTournament(tournamentData);
    return { success: true, tournament };

  } catch (error) {
    console.error('AI tournament creation error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function handleAIConversation(req: Request, res: Response) {
  try {
    const { 
      message, 
      conversation_history, 
      domain, 
      user_context 
    }: ConversationRequest = req.body;

    // Analyze the user's message for intent and context
    const intent = analyzeIntent(message);
    const extractedContext = extractContextFromMessage(message);
    
    let response: string;
    let tournamentCreated = false;
    let createdTournament: any = null;
    
    // Check if user wants to create a tournament and we should actually create it
    const shouldCreate = shouldCreateTournament(message);
    console.log(`🤖 AI Analysis: intent=${intent}, shouldCreate=${shouldCreate}, message="${message}"`);
    
    if (intent === 'tournament_creation' && shouldCreate) {
      console.log('🏆 Creating tournament via AI...');
      const createResult = await createTournamentForUser(req, message, extractedContext);
      
      if (createResult.success) {
        tournamentCreated = true;
        createdTournament = createResult.tournament;
        response = `✅ **Tournament Created Successfully!**\n\n🏆 **${createdTournament.name}**\n• Sport: ${createdTournament.sport}\n• Type: ${createdTournament.tournamentType} elimination\n• Teams: ${createdTournament.teams?.length || 0}\n• Status: ${createdTournament.status}\n\n**📋 Next Steps:**\n• Visit your Tournaments page to see your new tournament\n• Invite teams using registration codes\n• Set up brackets and start matches\n\nWould you like me to help you configure anything else for this tournament?`;
      } else {
        response = `❌ **Could not create tournament:** ${createResult.error}\n\nLet me help you with the setup instead. What specific tournament details would you like to configure?`;
      }
    } else {
      // Generate normal conversational response
      response = generatePlatformResponse(message, intent, domain, user_context, conversation_history);
    }
    
    // Generate helpful suggestions for next steps
    const suggestions = generateSuggestions(intent, domain, message, tournamentCreated);

    res.json({
      response,
      suggestions,
      extracted_context: extractedContext,
      intent,
      tournament_created: tournamentCreated,
      tournament: createdTournament,
      success: true
    });

  } catch (error) {
    console.error('AI conversation error:', error);
    res.status(500).json({
      error: 'AI conversation failed',
      response: "I'm having trouble processing that request. Could you try rephrasing it?",
      suggestions: [
        "Help me create a tournament",
        "Show budget management",
        "Explain health monitoring",
        "Academic competitions"
      ]
    });
  }
}

function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Tournament creation
  if (lowerMessage.includes('tournament') || lowerMessage.includes('competition') || lowerMessage.includes('event') || lowerMessage.includes('bracket')) {
    return 'tournament_creation';
  }
  
  // Budget management
  if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('funding') || lowerMessage.includes('money') || lowerMessage.includes('expense')) {
    return 'budget_management';
  }
  
  // Health monitoring
  if (lowerMessage.includes('health') || lowerMessage.includes('injury') || lowerMessage.includes('medical') || lowerMessage.includes('trainer') || lowerMessage.includes('concussion')) {
    return 'health_monitoring';
  }
  
  // Academic competitions
  if (lowerMessage.includes('academic') || lowerMessage.includes('uil') || lowerMessage.includes('debate') || lowerMessage.includes('speech') || lowerMessage.includes('stem')) {
    return 'academic_competition';
  }
  
  // District management
  if (lowerMessage.includes('district') || lowerMessage.includes('school') || lowerMessage.includes('organization') || lowerMessage.includes('compliance')) {
    return 'district_management';
  }
  
  // Getting started
  if (lowerMessage.includes('help') || lowerMessage.includes('start') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return 'getting_started';
  }
  
  return 'general_inquiry';
}

function extractContextFromMessage(message: string): any {
  const context: any = {};
  
  // Extract participant numbers
  const participantMatch = message.match(/(\d+)\s*(student|participant|athlete|team|people)/i);
  if (participantMatch) {
    context.participantCount = participantMatch[1];
  }
  
  // Extract sports
  const sports = ['track', 'football', 'basketball', 'volleyball', 'tennis', 'golf', 'swimming', 'soccer', 'baseball', 'softball', 'cross country', 'wrestling'];
  const foundSport = sports.find(sport => message.toLowerCase().includes(sport));
  if (foundSport) {
    context.sport = foundSport;
  }
  
  // Extract time indicators
  if (message.toLowerCase().includes('week')) context.timeline = 'week';
  if (message.toLowerCase().includes('month')) context.timeline = 'month';
  if (message.toLowerCase().includes('season')) context.timeline = 'season';
  
  // Extract organization mentions
  const orgMatch = message.match(/(school|district|club|organization).*?([A-Z][a-zA-Z\s]+)/i);
  if (orgMatch) {
    context.organization = orgMatch[2].trim();
  }
  
  return context;
}

function generatePlatformResponse(message: string, intent: string, domain: string, userContext: any, conversationHistory?: ConversationMessage[]): string {
  const lowerMessage = message.toLowerCase();
  
  // More conversational responses that actually help users take action
  if (intent === 'tournament_creation') {
    if (lowerMessage.includes('how') || lowerMessage.includes('build') || lowerMessage.includes('create') || lowerMessage.includes('start')) {
      return `Great! Let's build your tournament step by step:\n\n**📋 Step 1: Go to Tournament Creation**\n• Click "Tournaments" in the top navigation\n• Click "Create New Tournament" button\n\n**🏆 Step 2: Choose Your Tournament Type**\n• Single elimination, double elimination, or round robin\n• Pick your sport (basketball, track, academic, etc.)\n\n**⚙️ Step 3: Tournament Settings**\n• Set team size limits\n• Configure registration deadlines\n• Enable payment processing if needed\n\n**🎯 Step 4: Customize & Launch**\n• Add your branding and rules\n• Generate shareable registration codes\n• Invite teams to register\n\nWould you like me to walk through any specific step in detail?`;
    }
    
    return `I can help you create a comprehensive tournament! What type of tournament are you planning? (Track meet, academic competition, multi-sport event, etc.)`;
  }
  
  const platformFeatures = {
    
    budget_management: {
      response: `Let's set up your budget tracking:\n\n**💰 Quick Setup Steps:**\n• Go to "Budget Management" in the main menu\n• Click "Create New Budget"\n• Choose your template: Transportation, Equipment, or Full Program\n• Set your total budget amount\n• Add expense categories\n\n**📊 Track Expenses:**\n• Upload receipts for automatic categorization\n• Set spending alerts at 75% and 90%\n• Generate reports for administrators\n\nWhat type of budget are you planning? I can walk you through the specific setup.`,
      suggestions: ["Transportation budgets", "Equipment costs", "Program funding", "Grant applications"]
    },
    
    health_monitoring: {
      response: `Our AI-powered health monitoring is industry-leading with 95% injury prediction accuracy!\n\n🏥 **Health & Safety Features:**\n• Athletic trainer dashboard\n• Real-time injury tracking\n• Concussion protocol management\n• Emergency notification system\n\n🤖 **AI Capabilities:**\n• Injury risk prediction\n• Pattern recognition\n• Preventive recommendations\n• Medical compliance tracking\n\nAre you setting up monitoring for a specific sport or district-wide implementation?`,
      suggestions: ["Football monitoring", "Track safety", "District-wide setup", "Trainer dashboard"]
    },
    
    academic_competition: {
      response: `We support 50+ UIL academic competitions from grades 2-12!\n\n📚 **Academic Features:**\n• Complete UIL event management\n• District → Regional → State progression\n• TEKS curriculum alignment\n• Student achievement tracking\n\n🎓 **Smart Management:**\n• Automated advancement rules\n• Score calculation and ranking\n• Parent communication system\n• Educational trip integration\n\nWhich academic events are you organizing? Speech & Debate, STEM competitions, or Academic Bowl?`,
      suggestions: ["Speech & Debate", "STEM competitions", "Academic Bowl", "UIL events"]
    },
    
    district_management: {
      response: `Our platform handles complete district-wide coordination!\n\n🏫 **District Features:**\n• Multi-school coordination\n• Role-based access (District→School→Coach→Athlete)\n• Cross-school resource sharing\n• Centralized compliance management\n\n📋 **Compliance & Reporting:**\n• HIPAA/FERPA enforcement\n• Automated audit trails\n• District-level analytics\n• Emergency notification system\n\nHow many schools are in your district? I can help configure the optimal setup for your organization.`,
      suggestions: ["Setup district access", "Configure compliance", "Multi-school coordination", "Role management"]
    },
    
    getting_started: {
      response: `Welcome to Champions for Change! I'm here to help you navigate our comprehensive athletic and academic management platform.\n\n🌟 **What makes us special:**\n• We're a nonprofit supporting educational opportunities\n• 95% accurate AI injury prediction\n• Complete district management (not just forms like RankOne)\n• 50+ UIL academic competitions\n• Full budget management with Excel-style interface\n\n🚀 **Popular starting points:**\n• Tournament creation for sports events\n• Health monitoring setup\n• Budget planning and allocation\n• Academic competition management\n\nWhat would you like to explore first?`,
      suggestions: ["Create my first tournament", "Set up health monitoring", "Plan my budget", "Explore academic events"]
    }
  };

  const config = platformFeatures[intent as keyof typeof platformFeatures] || platformFeatures.getting_started;
  return config.response;
}

function shouldCreateTournament(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Look for direct creation requests
  const creationKeywords = [
    'build me', 'create me', 'make me', 'set up', 'can you build',
    'can you create', 'can you make', 'please create', 'please build',
    'I want', 'I need', 'help me create', 'help me build',
    'i need you to build', 'would like you to build', 'you to build',
    'build the tournament', 'create the tournament', 'make the tournament'
  ];
  
  // Also check for tournament-specific creation requests
  const tournamentCreationPhrases = [
    'tournament', 'championship', 'bracket', 'competition'
  ];
  
  const hasCreationKeyword = creationKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasTournamentContext = tournamentCreationPhrases.some(phrase => lowerMessage.includes(phrase));
  
  // If they mention creation AND tournament context, create it
  return hasCreationKeyword && hasTournamentContext;
}

function extractTournamentDetailsFromMessage(message: string, context: any): any {
  const lowerMessage = message.toLowerCase();
  
  // Extract tournament type
  let tournamentType = 'single';
  if (lowerMessage.includes('double elimination')) tournamentType = 'double';
  if (lowerMessage.includes('round robin')) tournamentType = 'round-robin';
  
  // Extract sport
  let sport = context.sport || 'Basketball';
  if (lowerMessage.includes('basketball')) sport = 'Basketball';
  if (lowerMessage.includes('football')) sport = 'Football';
  if (lowerMessage.includes('soccer')) sport = 'Soccer';
  if (lowerMessage.includes('volleyball')) sport = 'Volleyball';
  if (lowerMessage.includes('tennis')) sport = 'Tennis';
  if (lowerMessage.includes('track')) sport = 'Track and Field';
  if (lowerMessage.includes('baseball')) sport = 'Baseball';
  if (lowerMessage.includes('softball')) sport = 'Softball';
  
  // Extract team count
  let teamCount = 8; // default
  const teamMatch = message.match(/(\d+)\s*(team|participant|player)/i);
  if (teamMatch) {
    teamCount = parseInt(teamMatch[1]);
  }
  
  // Generate tournament name
  let name = `${sport} Tournament`;
  if (lowerMessage.includes('championship')) name = `${sport} Championship`;
  if (lowerMessage.includes('league')) name = `${sport} League`;
  if (lowerMessage.includes('classic')) name = `${sport} Classic`;
  
  // Add date to name to make it unique
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  name = `${name} - ${dateStr}`;
  
  // Generate teams if not specified
  const teams = [];
  for (let i = 1; i <= teamCount; i++) {
    teams.push(`Team ${i}`);
  }
  
  return {
    name,
    sport,
    tournamentType,
    teams,
    maxTeams: teamCount,
    description: `AI-generated ${sport.toLowerCase()} tournament created from user request`,
    registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks + 2 days
    location: 'TBD',
    entryFee: 0,
    prizes: [],
    rules: [`Standard ${sport.toLowerCase()} rules apply`],
    contactInfo: 'Tournament organizer will provide details',
    isPublic: true,
    allowRegistration: true,
    sponsorships: [],
    brackets: []
  };
}

function generateSuggestions(intent: string, domain: string, message?: string, tournamentCreated?: boolean): string[] {
  const lowerMessage = message?.toLowerCase() || '';
  
  // Special suggestions when a tournament was just created
  if (tournamentCreated) {
    return [
      "Show me my tournaments",
      "How do I invite teams?",
      "Set up registration codes",
      "Configure tournament settings"
    ];
  }
  
  // Contextual suggestions based on intent and what user is asking
  if (intent === 'tournament_creation') {
    if (lowerMessage.includes('how') || lowerMessage.includes('build') || lowerMessage.includes('step')) {
      return [
        "Build me a basketball tournament",
        "Create me a 16 team soccer tournament", 
        "Make me a volleyball championship",
        "Set up a track meet"
      ];
    }
    return [
      "Build me a basketball tournament",
      "Create me a soccer tournament",
      "Make me an 8 team volleyball tournament",
      "Set up academic competition"
    ];
  }
  
  if (intent === 'budget_management') {
    return [
      "Show me budget templates",
      "Set up expense tracking",
      "How to upload receipts",
      "Create spending alerts"
    ];
  }
  
  const suggestionMap = {
    health_monitoring: [
      "Set up injury tracking",
      "Configure concussion protocols", 
      "Athletic trainer dashboard",
      "Emergency notifications"
    ],
    academic_competition: [
      "UIL Speech events",
      "STEM competitions", 
      "Academic Bowl setup",
      "Student tracking"
    ],
    district_management: [
      "Multi-school setup",
      "Role permissions",
      "Compliance tracking", 
      "Resource sharing"
    ]
  };

  return suggestionMap[intent as keyof typeof suggestionMap] || [
    "Create my first tournament",
    "Set up budget tracking",
    "Configure health monitoring",
    "Plan academic events"
  ];
}