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

    // Generate bracket structure first
    const teams = Array.isArray(tournamentDetails.teams) ? tournamentDetails.teams : [];
    const teamNames = teams.map((team: any) => typeof team === 'string' ? team : team.teamName);
    
    const bracketStructure = BracketGenerator.generateBracket(
      teamNames,
      '',
      tournamentDetails.tournamentType || 'single',
      tournamentDetails.sport || 'Basketball'
    );

    // Add bracket to tournament data
    const tournamentData = {
      ...tournamentDetails,
      bracket: bracketStructure,
      status: 'upcoming' as const,
      createdBy: userId
    };

    // Validate and create tournament
    const validatedData = insertTournamentSchema.parse(tournamentData);

    const tournament = await storage.createTournament(validatedData);
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
    
    // Check if this is part of an ongoing tournament creation conversation
    const ongoingConversation = detectOngoingTournamentConversation(conversation_history);
    let conversationState: any = null;
    
    if (ongoingConversation) {
      // Handle ongoing tournament creation conversation
      const conversationResult = await handleTournamentConversation(req, message, ongoingConversation, conversation_history);
      response = conversationResult.response;
      tournamentCreated = conversationResult.tournamentCreated || false;
      createdTournament = conversationResult.tournament || null;
      conversationState = conversationResult.conversationState;
    } else if (intent === 'tournament_creation') {
      // Start new tournament creation conversation
      const shouldCreate = shouldCreateTournament(message);
      console.log(`🤖 AI Analysis: intent=${intent}, shouldCreate=${shouldCreate}, message="${message}"`);
      
      if (shouldCreate) {
        // Try to extract complete details from the message
        const tournamentDetails = extractTournamentDetailsFromMessage(message, extractedContext);
        const missingDetails = identifyMissingTournamentDetails(tournamentDetails);
        
        if (missingDetails.length === 0) {
          // All details provided, create immediately
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
          // Start conversation to gather missing details
          conversationState = {
            type: 'tournament_creation',
            step: 'gathering_details',
            providedDetails: tournamentDetails,
            missingDetails: missingDetails
          };
          response = generateQuestionForMissingDetails(tournamentDetails, missingDetails);
        }
      } else {
        // Generate normal conversational response
        response = generatePlatformResponse(message, intent, domain, user_context, conversation_history);
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
      conversation_state: conversationState,
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
  
  // Tournament creation (including common typos and sports-specific terms)
  if (lowerMessage.includes('tournament') || lowerMessage.includes('tournamenbt') || lowerMessage.includes('tournamenent') || 
      lowerMessage.includes('competition') || lowerMessage.includes('event') || lowerMessage.includes('bracket') ||
      lowerMessage.includes('track meet') || lowerMessage.includes('track and field') || 
      lowerMessage.includes('basketball') || lowerMessage.includes('soccer') || lowerMessage.includes('football') ||
      lowerMessage.includes('volleyball') || lowerMessage.includes('swimming') || lowerMessage.includes('swim') || lowerMessage.includes('tennis') ||
      lowerMessage.includes('baseball') || lowerMessage.includes('softball') || lowerMessage.includes('golf') ||
      lowerMessage.includes('wrestling') || lowerMessage.includes('cheerleading') || 
      lowerMessage.includes('championship') || lowerMessage.includes('league') || lowerMessage.includes('playoff') ||
      (lowerMessage.includes('meet') && (lowerMessage.includes('set up') || lowerMessage.includes('need') || lowerMessage.includes('create') || lowerMessage.includes('build'))) ||
      (lowerMessage.includes('sport') && (lowerMessage.includes('set up') || lowerMessage.includes('need') || lowerMessage.includes('create') || lowerMessage.includes('build')))) {
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
  
  // Extract sports (with variations)
  const sportsMap = {
    'swimming': ['swimming', 'swim'],
    'basketball': ['basketball', 'bball', 'hoops'],
    'football': ['football'],
    'soccer': ['soccer'],
    'volleyball': ['volleyball', 'vball'],
    'tennis': ['tennis'],
    'golf': ['golf'],
    'track': ['track', 'track and field'],
    'baseball': ['baseball'],
    'softball': ['softball'],
    'wrestling': ['wrestling'],
    'cross country': ['cross country', 'xc']
  };
  
  const lowerMessage = message.toLowerCase();
  for (const [sport, variations] of Object.entries(sportsMap)) {
    for (const variation of variations) {
      if (lowerMessage.includes(variation)) {
        context.sport = sport;
        break;
      }
    }
    if (context.sport) break;
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
    
    // Check if user is specifying a sport/tournament type
    if (lowerMessage.includes('track') || lowerMessage.includes('field')) {
      return `Perfect! A track and field meet is an excellent choice! 🏃‍♂️\n\n**Track & Field Events I can help you set up:**\n• Running events (100m, 200m, 400m, 800m, 1600m, relays)\n• Field events (shot put, discus, javelin, long jump, high jump)\n• Combined scoring with time/distance tracking\n\n**Quick questions to get started:**\n1. How many teams or individual athletes will participate?\n2. Will this be individual scoring or team-based?\n3. What's your target date for the meet?\n\nI can help you create the perfect structure for your track meet!`;
    }
    
    if (lowerMessage.includes('basketball')) {
      return `Awesome! Basketball tournaments are fantastic! 🏀\n\n**I can help you set up:**\n• Single elimination (March Madness style)\n• Double elimination (everyone gets 2 chances)\n• Round robin (everyone plays everyone)\n\n**Quick questions:**\n1. How many teams will participate?\n2. Do you prefer elimination or round robin format?\n3. When are you planning to hold this tournament?\n\nLet's get your basketball tournament rolling!`;
    }
    
    if (lowerMessage.includes('swimming') || lowerMessage.includes('swim')) {
      return `Great choice! Swimming meets have unique requirements! 🏊‍♀️\n\n**Swimming Meet Setup:**\n• Time-based events (freestyle, backstroke, breaststroke, butterfly)\n• Individual and relay events\n• Heat sheets and lane assignments\n• Automatic timing integration\n\n**Questions to get started:**\n1. How many swimmers/teams are participating?\n2. Which events do you want to include?\n3. Will this be a one-day or multi-day meet?\n\nI'll help you create the perfect swimming competition!`;
    }
    
    // Only ask the general question if no specific sport was mentioned
    return `I can help you create a comprehensive tournament! What type of tournament are you planning?\n\n**Popular options:**\n• Track & Field meets\n• Basketball tournaments\n• Swimming competitions\n• Academic competitions\n• Multi-sport events\n\nJust tell me what sport or type of competition you have in mind!`;
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
    'build the tournament', 'create the tournament', 'make the tournament',
    'build it for me', 'create it for me', 'make it for me', 'can you build it'
  ];
  
  // Also check for tournament-specific creation requests (including common typos)
  const tournamentCreationPhrases = [
    'tournament', 'tournamenbt', 'tournamenent', 'championship', 'bracket', 'competition',
    'meet', 'event', 'game', 'match'
  ];
  
  const hasCreationKeyword = creationKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasTournamentContext = tournamentCreationPhrases.some(phrase => lowerMessage.includes(phrase));
  
  // Special case: If they say "build it" or "create it" in a tournament conversation context,
  // that's clearly a creation request even without explicit tournament keywords
  const isDirectCreationRequest = lowerMessage.includes('build it') || 
                                 lowerMessage.includes('create it') || 
                                 lowerMessage.includes('make it') ||
                                 lowerMessage.includes('can you build') ||
                                 lowerMessage.includes('can you create');
  
  // If they mention creation AND tournament context, OR it's a direct "build it" request, create it
  return (hasCreationKeyword && hasTournamentContext) || isDirectCreationRequest;
}

function extractTournamentDetailsFromMessage(message: string, context: any): any {
  const lowerMessage = message.toLowerCase();
  const details: any = {};
  
  // Extract tournament type
  if (lowerMessage.includes('double elimination') || lowerMessage.includes('double elemination')) {
    details.tournamentType = 'double';
  } else if (lowerMessage.includes('round robin')) {
    details.tournamentType = 'round-robin';
  } else if (lowerMessage.includes('single elimination')) {
    details.tournamentType = 'single';
  }
  
  // Extract sport (enhanced with more variations)
  const sportMap = {
    'basketball': 'Basketball',
    'basketabll': 'Basketball', // Handle typo
    'hoops': 'Basketball',
    'bball': 'Basketball',
    'football': 'Football',
    'soccer': 'Soccer',
    'volleyball': 'Volleyball',
    'tennis': 'Tennis',
    'track': 'Track and Field',
    'baseball': 'Baseball',
    'softball': 'Softball',
    'wrestling': 'Wrestling',
    'swimming': 'Swimming'
  };
  
  for (const [key, value] of Object.entries(sportMap)) {
    if (lowerMessage.includes(key)) {
      details.sport = value;
      break;
    }
  }
  
  // Extract team count
  const teamMatch = message.match(/(\d+)\s*(team|participant|player|division)/i);
  if (teamMatch) {
    const count = parseInt(teamMatch[1]);
    if (count > 0 && count < 1000) { // Reasonable range
      details.maxParticipants = count;
      
      // Generate teams if not specified
      const teams = [];
      for (let i = 1; i <= count; i++) {
        teams.push(`Team ${i}`);
      }
      details.teams = teams;
    }
  }
  
  // Extract tournament name (look for quoted names or specific patterns)
  const namePatterns = [
    /(?:called?|name[d]?|title[d]?)\s+["']([^"']+)["']/i,
    /["']([^"']+)["']\s+(?:tournament|championship|classic|league)/i,
    /(\w+\s+(?:for|classic|championship|memorial|spring|summer|fall|winter|holiday)\s+\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      details.name = match[1].trim();
      break;
    }
  }
  
  // Extract location
  const locationPatterns = [
    /(?:at|location|venue|held at|taking place at)\s+([^.!?\n]+)(?:on|\.|!|\?|$)/i,
    /will be at\s+([^.!?\n]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      details.location = match[1].trim();
      break;
    }
  }
  
  // Extract date (enhanced parsing)
  const datePatterns = [
    /(\w+ \d{1,2}(?:st|nd|rd|th)?,? \d{4})/i,
    /(\w+ \d{1,2}(?:st|nd|rd|th)?)/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /on ([^.!?\n]+?)(?:\s+I|\s+i|\.|!|\?|$)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const dateStr = match[1].trim();
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
        details.tournamentDate = parsedDate;
        break;
      }
    }
  }
  
  // Extract registration deadline
  const deadlinePatterns = [
    /register(?:ed|ation)?.*?(\d+)\s*weeks?\s*before/i,
    /register(?:ed|ation)?.*?(\d+)\s*days?\s*before/i,
    /deadline.*?(\w+ \d{1,2}(?:st|nd|rd|th)?)/i
  ];
  
  for (const pattern of deadlinePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      if (match[1].includes('week')) {
        const weeks = parseInt(match[1]);
        if (details.tournamentDate) {
          details.registrationDeadline = new Date(details.tournamentDate.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
        }
      } else if (match[1].includes('day')) {
        const days = parseInt(match[1]);
        if (details.tournamentDate) {
          details.registrationDeadline = new Date(details.tournamentDate.getTime() - days * 24 * 60 * 60 * 1000);
        }
      } else {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          details.registrationDeadline = parsedDate;
        }
      }
      break;
    }
  }
  
  // Extract team size (players per team)
  const teamSizePatterns = [
    /(\d+)v\d+/i, // 3v3, 5v5
    /(\d+)\s*(?:player|man|person)\s*team/i,
    /teams?\s*of\s*(\d+)/i
  ];
  
  for (const pattern of teamSizePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const size = parseInt(match[1]);
      if (size > 0 && size <= 15) { // Reasonable team size
        details.teamSize = size;
        break;
      }
    }
  }
  
  // Extract entry fee
  const feePatterns = [
    /\$(\d+(?:\.\d{2})?)\s*(?:per team|entry|fee)/i,
    /(?:fee|cost|entry).*?\$(\d+(?:\.\d{2})?)/i,
    /(?:free|no fee|no cost)/i
  ];
  
  for (const pattern of feePatterns) {
    const match = message.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('free') || match[0].toLowerCase().includes('no fee')) {
        details.entryFee = "0";
      } else if (match[1]) {
        details.entryFee = match[1];
      }
      break;
    }
  }
  
  // Set defaults for missing essential fields
  if (!details.tournamentType) details.tournamentType = 'single';
  if (!details.sport) details.sport = context.sport || 'Basketball';
  if (!details.teamSize) details.teamSize = 5;
  if (!details.entryFee) details.entryFee = "0";
  if (!details.isPublic) details.isPublic = true;
  
  // Generate default name if not provided
  if (!details.name) {
    let name = `${details.sport} Tournament`;
    if (lowerMessage.includes('championship')) name = `${details.sport} Championship`;
    if (lowerMessage.includes('league')) name = `${details.sport} League`;
    if (lowerMessage.includes('classic')) name = `${details.sport} Classic`;
    
    // Add date to name to make it unique
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    details.name = `${name} - ${dateStr}`;
  }
  
  // Set default dates if not provided
  if (!details.tournamentDate) {
    details.tournamentDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
  }
  if (!details.registrationDeadline) {
    details.registrationDeadline = new Date(details.tournamentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before tournament
  }
  if (!details.location) {
    details.location = 'TBD';
  }
  
  // Generate default description
  if (!details.description) {
    details.description = `AI-generated ${details.sport.toLowerCase()} tournament created from user request`;
  }
  
  details.bracket = null; // Will be set by BracketGenerator
  
  return details;
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

// ====================================================
// CONVERSATIONAL TOURNAMENT CREATION FUNCTIONS
// ====================================================

function detectOngoingTournamentConversation(conversation_history: any[]): any {
  if (!conversation_history || conversation_history.length === 0) return null;
  
  // Look for conversation state in recent messages
  for (let i = conversation_history.length - 1; i >= Math.max(0, conversation_history.length - 3); i--) {
    const message = conversation_history[i];
    if (message.conversation_state?.type === 'tournament_creation') {
      return message.conversation_state;
    }
  }
  
  return null;
}

async function handleTournamentConversation(req: any, message: string, ongoingConversation: any, conversation_history: any[]): Promise<any> {
  try {
    const { providedDetails, missingDetails } = ongoingConversation;
    
    // Extract new details from the current message
    const newDetails = extractTournamentDetailsFromMessage(message, {});
    
    // Merge new details with existing provided details
    const updatedDetails = { ...providedDetails, ...newDetails };
    
    // Check what's still missing
    const stillMissingDetails = identifyMissingTournamentDetails(updatedDetails);
    
    if (stillMissingDetails.length === 0) {
      // All details collected, create the tournament
      console.log('🏆 Creating tournament via conversational AI...');
      const createResult = await createTournamentForUser(req, `Create tournament with details: ${JSON.stringify(updatedDetails)}`, updatedDetails);
      
      if (createResult.success) {
        return {
          response: `✅ **Tournament Created Successfully!**\n\n🏆 **${createResult.tournament.name}**\n• Sport: ${createResult.tournament.sport}\n• Type: ${createResult.tournament.tournamentType} elimination\n• Teams: ${createResult.tournament.teams?.length || 0}\n• Status: ${createResult.tournament.status}\n\n**📋 Next Steps:**\n• Visit your Tournaments page to see your new tournament\n• Invite teams using registration codes\n• Set up brackets and start matches\n\nWould you like me to help you configure anything else for this tournament?`,
          tournamentCreated: true,
          tournament: createResult.tournament,
          conversationState: null // Conversation complete
        };
      } else {
        return {
          response: `❌ **Could not create tournament:** ${createResult.error}\n\nLet me help you with the setup instead. What specific tournament details would you like to configure?`,
          tournamentCreated: false,
          conversationState: null
        };
      }
    } else {
      // Still missing details, ask for the next one
      return {
        response: generateQuestionForMissingDetails(updatedDetails, stillMissingDetails),
        tournamentCreated: false,
        conversationState: {
          type: 'tournament_creation',
          step: 'gathering_details',
          providedDetails: updatedDetails,
          missingDetails: stillMissingDetails
        }
      };
    }
    
  } catch (error) {
    console.error('Tournament conversation error:', error);
    return {
      response: "I had trouble processing that. Let's start over - what tournament would you like me to create for you?",
      tournamentCreated: false,
      conversationState: null
    };
  }
}

function identifyMissingTournamentDetails(details: any): string[] {
  const missing = [];
  
  if (!details.name || details.name.toLowerCase().includes('tournament')) {
    missing.push('name');
  }
  if (!details.sport) {
    missing.push('sport');
  }
  if (!details.location || details.location === 'TBD') {
    missing.push('location');
  }
  if (!details.tournamentDate) {
    missing.push('date');
  }
  if (!details.registrationDeadline) {
    missing.push('registration_deadline');
  }
  if (!details.teamSize || details.teamSize === 5) {
    missing.push('team_size');
  }
  if (details.entryFee === undefined || details.entryFee === "0") {
    missing.push('entry_fee');
  }
  
  return missing;
}

function generateQuestionForMissingDetails(providedDetails: any, missingDetails: string[]): string {
  const missingDetail = missingDetails[0]; // Ask for one detail at a time
  
  let question = `**Absolutely! I'd be happy to help you create`;
  
  if (providedDetails.name && !providedDetails.name.toLowerCase().includes('tournament')) {
    question += ` "${providedDetails.name}"`;
  } else if (providedDetails.sport) {
    question += ` your ${providedDetails.sport.toLowerCase()} tournament`;
  } else {
    question += ` your tournament`;
  }
  
  question += `!** 🏆\n\n`;
  
  // Add summary of what we know so far
  if (Object.keys(providedDetails).length > 0) {
    question += `**📋 Tournament Details So Far:**\n`;
    if (providedDetails.sport) question += `• Sport: ${providedDetails.sport}\n`;
    if (providedDetails.tournamentType) question += `• Type: ${providedDetails.tournamentType} elimination\n`;
    if (providedDetails.name && !providedDetails.name.toLowerCase().includes('tournament')) question += `• Name: ${providedDetails.name}\n`;
    if (providedDetails.location && providedDetails.location !== 'TBD') question += `• Location: ${providedDetails.location}\n`;
    if (providedDetails.tournamentDate) question += `• Date: ${new Date(providedDetails.tournamentDate).toLocaleDateString()}\n`;
    question += `\n`;
  }
  
  // Ask for the missing detail
  switch (missingDetail) {
    case 'sport':
      question += `**🏀 What sport is this tournament for?**\n(Basketball, Soccer, Volleyball, Tennis, etc.)`;
      break;
    case 'name':
      question += `**📝 What would you like to call this tournament?**\n(e.g., "Spring Championship 2025", "Memorial Day Classic")`;
      break;
    case 'location':
      question += `**📍 Where will the tournament take place?**\n(e.g., "Central High School Gym", "Community Sports Complex")`;
      break;
    case 'date':
      question += `**📅 When do you want the tournament to start?**\n(e.g., "March 15th, 2025", "Next Saturday")`;
      break;
    case 'registration_deadline':
      question += `**⏰ When should registration close?**\n(e.g., "One week before", "February 28th", "2 weeks prior")`;
      break;
    case 'team_size':
      question += `**👥 How many players per team?**\n(e.g., 5 for basketball, 3 for 3v3, 11 for soccer)`;
      break;
    case 'entry_fee':
      question += `**💰 Is there an entry fee per team?**\n(e.g., "$50 per team", "Free", "$25")`;
      break;
    default:
      question += `**I need a bit more information to create your perfect tournament!**`;
  }
  
  return question;
}