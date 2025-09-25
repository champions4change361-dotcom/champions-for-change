import type { Request, Response } from 'express';
import { storage } from './storage';
import { insertTournamentSchema, type TournamentConfig } from '@shared/schema';
import { BracketGenerator } from './utils/bracket-generator';

/**
 * Map legacy tournament types to engine types for TournamentConfig
 */
function mapTournamentTypeToEngine(tournamentType: string): 'single' | 'double' | 'round_robin' | 'swiss' | 'leaderboard' {
  switch (tournamentType) {
    case 'single':
      return 'single';
    case 'double':
      return 'double';
    case 'round-robin':
      return 'round_robin';
    case 'swiss-system':
      return 'swiss';
    case 'free-for-all':
    case 'multi-heat-racing':
    case 'battle-royale':
    case 'point-accumulation':
    case 'time-trials':
    case 'survival-elimination':
      return 'leaderboard';
    default:
      return 'single';
  }
}

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
    // Enhanced authentication validation
    const isAuth = req.isAuthenticated && req.isAuthenticated();
    const userClaims = (req.user as any)?.claims;
    
    if (!isAuth || !userClaims?.sub || typeof userClaims.sub !== 'string') {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate and sanitize user ID
    const userId = userClaims.sub;
    if (!/^[a-zA-Z0-9_-]+$/.test(userId) || userId.length > 50) {
      return { success: false, error: 'Invalid user credentials' };
    }
    
    // Extract tournament details from the message
    const tournamentDetails = extractTournamentDetailsFromMessage(message, extractedContext);
    
    // Get user to check limits
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check tournament limits with proper access control
    const existingTournaments = await storage.getTournaments();
    // Only get tournaments for the authenticated user to prevent data leakage
    const userTournaments = existingTournaments.filter((t: any) => 
      t.createdBy === userId && typeof t.createdBy === 'string'
    );
    
    const getTournamentLimit = (plan: string, status: string) => {
      if (status !== 'active') return 1;
      switch (plan) {
        case 'starter':
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

    const limit = getTournamentLimit(user.subscriptionPlan || 'starter', user.subscriptionStatus || 'inactive');
    
    if (limit !== -1 && userTournaments.length >= limit) {
      return { 
        success: false, 
        error: `Tournament limit reached (${userTournaments.length}/${limit}) for your ${user.subscriptionPlan} plan`
      };
    }

    // Generate bracket structure using config-driven approach
    const teams = Array.isArray(tournamentDetails.teams) ? tournamentDetails.teams : [];
    const teamNames = teams.map((team: any) => typeof team === 'string' ? team : team.teamName);
    
    // Create TournamentConfig for AI-driven creation
    const tournamentConfig: TournamentConfig = {
      meta: {
        name: tournamentDetails.name || `${tournamentDetails.sport} Tournament`,
        participantType: 'team',
        participantCount: teamNames.length,
        teamSize: tournamentDetails.teamSize
      },
      divisions: [{
        name: 'Main Division',
        eligibility: {},
        genderPolicy: 'open'
      }],
      stages: [{
        engine: mapTournamentTypeToEngine(tournamentDetails.tournamentType || 'single'),
        size: teamNames.length
      }],
      seeding: {
        method: 'random'
      }
    };

    const bracketStructure = BracketGenerator.generateFromConfig(
      tournamentConfig,
      teamNames,
      ''
    );

    // Add bracket to tournament data
    const tournamentData = {
      ...tournamentDetails,
      bracket: bracketStructure,
      status: 'upcoming' as const,
      createdBy: userId
    };

    // Validate tournament data thoroughly
    const validatedData = insertTournamentSchema.parse(tournamentData);
    
    // Additional security validation
    if ((validatedData as any).createdBy !== userId) {
      return { success: false, error: 'Unauthorized tournament creation' };
    }

    const tournament = await storage.createTournament(validatedData);
    return { success: true, tournament };

  } catch (error) {
    console.error('AI tournament creation error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function handleAIConversation(req: Request, res: Response) {
  try {
    // Validate request body structure and sanitize inputs
    const requestBody = req.body;
    if (!requestBody || typeof requestBody !== 'object') {
      return res.status(400).json({ error: 'Invalid request body', success: false });
    }

    const { 
      message, 
      conversation_history, 
      domain, 
      user_context 
    }: ConversationRequest = requestBody;

    // Input validation and sanitization
    if (!message || typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({ error: 'Invalid or missing message', success: false });
    }
    
    if (domain && !['education', 'business', 'coaches'].includes(domain)) {
      return res.status(400).json({ error: 'Invalid domain', success: false });
    }

    // Sanitize message to prevent injection attacks
    const sanitizedMessage = message.replace(/[<>"'&]/g, '').substring(0, 1000);

    // Analyze the user's message for intent and context using sanitized input
    const intent = analyzeIntent(sanitizedMessage);
    const extractedContext = extractContextFromMessage(sanitizedMessage);
    
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
      const shouldCreate = shouldCreateTournament(sanitizedMessage);
      console.log(`🤖 AI Analysis: intent=${intent}, shouldCreate=${shouldCreate}`);
      
      if (shouldCreate) {
        // Try to extract complete details from the sanitized message
        const tournamentDetails = extractTournamentDetailsFromMessage(sanitizedMessage, extractedContext);
        const missingDetails = identifyMissingTournamentDetails(tournamentDetails);
        
        if (missingDetails.length === 0) {
          // All details provided, create immediately
          console.log('🏆 Creating tournament via AI...');
          const createResult = await createTournamentForUser(req, sanitizedMessage, extractedContext);
          
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
      // Generate normal conversational response using sanitized input
      response = generatePlatformResponse(sanitizedMessage, intent, domain, user_context, conversation_history);
    }
    
    // Generate helpful suggestions for next steps using sanitized input
    const suggestions = generateSuggestions(intent, domain, sanitizedMessage, tournamentCreated);

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
  
  // Tournament creation (matching the complete database hierarchy)
  const competitionKeywords = [
    // Tournament/Competition words
    'tournament', 'tournamenbt', 'tournamenent', 'competition', 'event', 'bracket', 'championship', 'league', 'playoff', 'match', 'contest', 'meet',
    
    // Athletic - Team Sports
    'basketball', 'football', 'soccer', 'volleyball', 'baseball', 'softball', 'hockey', 'rugby', 'ultimate frisbee', 'water polo',
    
    // Athletic - Individual Sports  
    'track', 'track and field', 'swimming', 'swim', 'diving', 'cross country', 'tennis', 'golf', 'wrestling', 'gymnastics', 
    'archery', 'bowling', 'martial arts', 'karate', 'taekwondo', 'judo', 'mma', 'cycling', 'fencing',
    'running', 'run', '5k', '5k run', '10k', 'marathon', 'half marathon', 'race', 'fun run', 'charity run',
    
    // Athletic - Winter Sports
    'skiing', 'snowboarding', 'ice hockey', 'figure skating', 'curling',
    
    // Academic Competitions
    'uil', 'uil academic', 'speech', 'debate', 'forensics', 'stem', 'math competition', 'science fair', 'science olympiad', 'mathcounts',
    'quiz bowl', 'academic bowl', 'spelling bee', 'trivia', 'knowledge bowl',
    
    // Fine Arts Competitions
    'fine arts', 'music', 'band', 'orchestra', 'choir', 'theater', 'theatre', 'drama', 'visual arts', 'art', 'dance',
    
    // Other Competitions
    'chess', 'esports', 'e-sports', 'gaming', 'video game'
  ];
  
  const hasCompetitionKeyword = competitionKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasMeetContext = lowerMessage.includes('meet') && (lowerMessage.includes('set up') || lowerMessage.includes('need') || lowerMessage.includes('create') || lowerMessage.includes('build'));
  const hasSportContext = lowerMessage.includes('sport') && (lowerMessage.includes('set up') || lowerMessage.includes('need') || lowerMessage.includes('create') || lowerMessage.includes('build'));
  
  if (hasCompetitionKeyword || hasMeetContext || hasSportContext) {
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
  
  // Extract sports and competitions matching the tournament creation database hierarchy
  const competitionMap = {
    // COMBO TOURNAMENTS (check these FIRST before individual sports)
    'golf/fishing combo': ['golf fishing', 'golf and fishing', 'combo tournament', 'dual sport', 'golf/fishing', 'fishing golf', 'combo fishing golf', 'combo golf fishing', 'combo fishing/golf', 'combo golf/fishing', 'fishing and golf'],
    
    // ATHLETIC COMPETITIONS
    // Team Sports
    'basketball (boys)': ['basketball boys', 'boys basketball', 'male basketball'],
    'basketball (girls)': ['basketball girls', 'girls basketball', 'female basketball'],  
    'basketball': ['basketball', 'bball', 'hoops', 'basketball game', 'basketball match'],
    'football': ['football', 'american football', 'gridiron'],
    'soccer (boys)': ['soccer boys', 'boys soccer', 'male soccer'],
    'soccer (girls)': ['soccer girls', 'girls soccer', 'female soccer'],
    'soccer': ['soccer', 'football match', 'futbol', 'association football'],
    'volleyball (boys)': ['volleyball boys', 'boys volleyball', 'male volleyball'],
    'volleyball (girls)': ['volleyball girls', 'girls volleyball', 'female volleyball'],
    'volleyball': ['volleyball', 'vball', 'beach volleyball', 'indoor volleyball'],
    'baseball': ['baseball', 'ball game', 'little league'],
    'softball': ['softball', 'slow pitch', 'fast pitch'],
    'hockey': ['hockey', 'field hockey'],
    'rugby': ['rugby', 'rugby league', 'rugby union'],
    'ultimate frisbee': ['ultimate frisbee', 'ultimate', 'frisbee'],
    'water polo': ['water polo', 'polo'],
    
    // Individual Sports  
    'track & field': ['track', 'track and field', 'track meet', 'field day', 'athletics', 'athletics meet', 'field events'],
    'running': ['run', '5k', '5k run', '10k', '10k run', 'marathon', 'half marathon', 'fun run', 'charity run', 'race', 'running event'],
    'swimming & diving': ['swimming', 'swim', 'swim meet', 'swimming meet', 'diving', 'pool', 'aquatic'],
    'cross country': ['cross country', 'xc', 'distance running'],
    'tennis (boys)': ['tennis boys', 'boys tennis', 'male tennis'],
    'tennis (girls)': ['tennis girls', 'girls tennis', 'female tennis'],
    'tennis': ['tennis', 'tennis match', 'tennis tournament'],
    'golf (boys)': ['golf boys', 'boys golf', 'male golf'],
    'golf (girls)': ['golf girls', 'girls golf', 'female golf'],
    'golf': ['golf', 'golf tournament', 'golf competition', 'golf course', 'golfing'],
    'wrestling': ['wrestling', 'wrestling match', 'grappling'],
    'gymnastics': ['gymnastics', 'gymnastic', 'tumbling'],
    'archery': ['archery', 'bow and arrow', 'target shooting'],
    'bowling': ['bowling', 'ten pin', 'bowling tournament'],
    'martial arts': ['martial arts', 'karate', 'taekwondo', 'judo', 'mma'],
    'cycling': ['cycling', 'bike race', 'bicycle', 'cycling competition'],
    'fencing': ['fencing', 'sword fighting', 'foil', 'epee', 'sabre'],
    'fishing': ['fishing', 'fishing tournament', 'fishing competition', 'angling', 'bass fishing'],
    
    // Winter Sports
    'skiing': ['skiing', 'ski', 'downhill', 'slalom', 'alpine skiing'],
    'snowboarding': ['snowboarding', 'snowboard', 'snow boarding'],
    'ice hockey': ['ice hockey', 'hockey', 'puck'],
    'figure skating': ['figure skating', 'skating', 'ice skating'],
    'curling': ['curling', 'ice curling'],
    
    // ACADEMIC COMPETITIONS
    // UIL Academic Competitions
    'uil academic': ['uil', 'uil academic', 'university interscholastic league'],
    
    // Speech & Debate
    'speech & debate': ['speech and debate', 'speech debate', 'forensics'],
    'debate': ['debate', 'debate tournament', 'policy debate', 'lincoln douglas', 'public forum'],
    
    // STEM Competitions  
    'stem competitions': ['stem', 'science technology engineering math'],
    'math competition': ['math competition', 'mathematics', 'math contest', 'mathcounts'],
    'science fair': ['science fair', 'science competition', 'science olympiad'],
    
    // FINE ARTS COMPETITIONS
    'fine arts': ['fine arts', 'arts competition', 'creative arts'],
    'music': ['music', 'band', 'orchestra', 'choir', 'music competition'],
    'theater': ['theater', 'theatre', 'drama', 'acting', 'play'],
    'visual arts': ['visual arts', 'art', 'painting', 'drawing', 'sculpture'],
    'dance': ['dance', 'dance competition', 'dance tournament'],
    
    // OTHER COMPETITIONS
    'chess': ['chess', 'chess tournament', 'chess match', 'chess competition'],
    'esports': ['esports', 'e-sports', 'gaming', 'video game', 'gaming tournament', 'esports tournament'],
    'quiz bowl': ['quiz bowl', 'academic bowl', 'trivia', 'knowledge bowl'],
    'spelling bee': ['spelling bee', 'spelling', 'spelling competition']
  };
  
  const lowerMessage = message.toLowerCase();
  for (const [sport, variations] of Object.entries(competitionMap)) {
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
    // Check ALL sport-specific requests FIRST (before generic tutorial)
    
    // COMBINATION TOURNAMENTS (check FIRST before individual sports)
    // Golf/Fishing Combo Tournament (must be checked before individual golf/fishing)
    if ((lowerMessage.includes('golf') && lowerMessage.includes('fishing')) || 
        lowerMessage.includes('combo') || 
        lowerMessage.includes('golf fishing') || 
        lowerMessage.includes('golf and fishing') || 
        lowerMessage.includes('fishing golf') || 
        lowerMessage.includes('dual sport') || 
        lowerMessage.includes('golf/fishing') ||
        lowerMessage.includes('fishing/golf')) {
      return `What an amazing combination! Golf/Fishing combo tournaments are unique charity events that really bring communities together! ⛳🎣\n\n**Perfect for charity fundraising because:**\n• Attracts both golfers and fishing enthusiasts\n• Multiple revenue streams (golf fees, fishing entry, sponsorships)\n• All-day event keeps participants engaged\n• Great for corporate sponsorships and team building\n\n**Here's how we can structure your combo tournament:**\n• Morning: Golf tournament (18 holes, scramble format)\n• Afternoon: Fishing competition (bass tournament, big fish contest)\n• Evening: Awards ceremony and charity auction\n• Sponsorship packages for both activities\n\n**Let's plan your perfect combo event:**\n1. What charity cause will this support?\n2. Do you have a golf course and fishing location in mind?\n3. How many participants are you hoping for? (golf teams + fishing entries)\n4. What's your target date?\n\nI'll help you create a combo tournament that maximizes both fun and fundraising! 🏆`;
    }
    
    // Athletic - Team Sports
    if (lowerMessage.includes('basketball')) {
      const isGender = lowerMessage.includes('boys') || lowerMessage.includes('girls');
      return `I love that you're organizing a basketball tournament! 🏀 I know coordinating teams and schedules can feel overwhelming, but you've got this!\n\n**Let's make this basketball tournament amazing together:**\n• Single elimination (March Madness excitement!)\n• Double elimination (gives everyone a second chance)\n• Round robin (everyone plays everyone - fair and fun!)\n${isGender ? '• Gender-specific divisions with appropriate rules' : ''}\n\n**Let's figure out the details that work best for you:**\n1. How many teams are you hoping to include?\n2. ${isGender ? 'Boys or girls division?' : 'Are you thinking mixed teams or separate divisions?'}\n3. What format feels right for your group?\n4. When would be the perfect time to hold this?\n\nDon't worry about getting everything perfect right now - we'll build this step by step! 💪`;
    }
    
    if (lowerMessage.includes('soccer')) {
      const isGender = lowerMessage.includes('boys') || lowerMessage.includes('girls');
      return `Soccer tournaments are so much fun to organize! ⚽ I know juggling field schedules and coordinating teams can be tricky, but let's tackle this together!\n\n**Here's how we can make your soccer tournament incredible:**\n• Pool play followed by elimination (builds excitement!)\n• Round robin for smaller groups (everyone gets lots of games)\n• Smart field scheduling (no more timing headaches!)\n${isGender ? '• Gender-specific divisions that work for your participants' : ''}\n\n**Let's figure out what works best for your situation:**\n1. How many teams are you hoping to bring together?\n2. ${isGender ? 'Boys or girls division?' : 'What age groups and divisions make sense?'}\n3. How many fields can we work with?\n4. Are you thinking one day or a weekend tournament?\n\nWe'll make sure this runs smoothly - I'm here to help every step of the way! 🙌`;
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('field')) {
      // Check if specific details are already provided in the conversation
      const hasTeamCount = /(\d+)\s*teams?/i.test(message) || /(\d+)\s*schools?/i.test(message);
      const hasAthleteCount = /(\d+)\s*(athletes?|participants?|runners?)/i.test(message);
      const hasDate = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(message);
      const hasEvents = /100m|110m|400m|shot put|discus|triple jump|long jump|high jump|hurdles/i.test(message);
      const hasScoring = /individual|team.*scor/i.test(message);
      
      if (hasTeamCount && hasAthleteCount && hasDate && hasEvents && hasScoring) {
        // All key details provided - acknowledge and offer to create
        return `Excellent! I can see you've got this track and field meet well planned out! 🏆\n\n**Here's what I understand:**\n• ${message.match(/(\d+)\s*teams?/i)?.[1] || ''} teams with ${message.match(/(\d+)\s*(athletes?|participants?)/i)?.[1] || ''} athletes each\n• Date: ${message.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] || 'March 6, 2026'}\n• Individual scoring format\n• Running events: 100m dash, 110m hurdles, 400m\n• Field events: Shot put, discus, triple jump, long jump, high jump\n\n**This sounds like a fantastic middle school track meet!** 🏃‍♂️\n\n**I can help you set this up with:**\n• Event scheduling and heat sheets\n• Scoring system for individual athletes\n• Registration management for 8 teams\n• Results tracking and awards\n\nWould you like me to help you create this tournament in the system? I can set up the structure with all these events!`;
      } else {
        // Some details missing - ask for what's needed
        return `Perfect! A track and field meet is an excellent choice! 🏃‍♂️\n\n**Track & Field Events I can help you set up:**\n• Running events (100m, 200m, 400m, 800m, 1600m, relays)\n• Field events (shot put, discus, javelin, long jump, high jump)\n• Combined scoring with time/distance tracking\n\n**Quick questions to get started:**\n1. How many teams or individual athletes will participate?\n2. Will this be individual scoring or team-based?\n3. What's your target date for the meet?\n\nI can help you create the perfect structure for your track meet!`;
      }
    }
    
    // Running Events (5K, 10K, marathons, fun runs)
    if (lowerMessage.includes('run') || lowerMessage.includes('5k') || lowerMessage.includes('10k') || 
        lowerMessage.includes('marathon') || lowerMessage.includes('race') || lowerMessage.includes('charity run') || 
        lowerMessage.includes('fun run')) {
      const isCharity = lowerMessage.includes('charity') || lowerMessage.includes('fundrais') || lowerMessage.includes('cancer') || lowerMessage.includes('awareness');
      
      return `What an amazing initiative! ${isCharity ? 'Charity runs are such a beautiful way to bring communities together for a great cause! 💕' : 'Running events are fantastic for bringing communities together! 🏃‍♂️'}\n\n**I can help you organize a professional running event with:**\n• Timing chip integration and results tracking\n• Multiple distance options (5K, 10K, fun run, kids dash)\n• Age group divisions and awards\n• Registration management with online signup\n• Safety coordination and course marshaling\n• ${isCharity ? 'Donation collection and fundraising tools' : 'Participant management and communications'}\n\n**Let's plan your perfect running event:**\n1. What distance(s) are you thinking? (5K, 10K, both?)\n2. How many participants are you hoping to welcome?\n3. ${isCharity ? 'What cause will this support?' : 'Is this a competitive race or more of a fun community event?'}\n4. Do you have a target date and location in mind?\n\n${isCharity ? 'Together we can create an event that makes a real difference! 🌟' : 'Let\'s create a running event your community will love! 🏃‍♀️'}`;
    }
    
    // Academic Competitions (before generic)
    if (lowerMessage.includes('uil') || (lowerMessage.includes('academic') && !lowerMessage.includes('bowl'))) {
      return `I'm so excited you're organizing UIL Academic Competitions! 📚 These events are incredible for showcasing student talent, and I know the logistics can feel complex with so many events to coordinate.\n\n**Don't worry - we'll organize this step by step:**\n• 50+ amazing competition categories to choose from\n• Clear advancement paths (District → Regional → State)\n• Age-appropriate divisions (2nd-12th grade)\n• Fair scoring that celebrates every participant\n\n**Let's start with what matters most to you:**\n1. Which UIL events do you want to feature?\n2. What grade levels are you bringing together?\n3. Is this a district competition or an invitational?\n4. How many schools are you expecting?\n\nI'll walk you through creating an academic competition that students will remember forever! 🌟`;
    }
    
    if (lowerMessage.includes('debate') || lowerMessage.includes('forensics') || lowerMessage.includes('speech')) {
      return `What an amazing choice! Speech & Debate tournaments are so rewarding! 🎤 I know coordinating judges and schedules feels overwhelming, but these competitions create incredible opportunities for students to shine.\n\n**Together, we'll make this tournament run beautifully:**\n• Choose the perfect formats for your participants\n• Smart scheduling that works for everyone\n• Judge coordination made simple\n• Brackets that build excitement\n• Tab room that runs like clockwork\n\n**Let's start with your vision:**\n1. What speech and debate events speak to you?\n2. How many schools are you hoping to welcome?\n3. How many rounds feel right for your timeline?\n4. Should we help you find judges, or do you have that covered?\n\nI'm here to support you in creating a tournament where every student can showcase their voice! 💫`;
    }
    
    // Other competitions (chess, music, etc.)
    if (lowerMessage.includes('chess')) {
      return `Excellent! Chess tournaments are strategic competitions! ♟️ I know organizing pairings and time controls can feel complex, but chess tournaments create such wonderful intellectual challenges!\n\n**Let's plan your perfect chess competition:**\n• Swiss system or round-robin formats\n• Time controls (blitz, rapid, classical)\n• Rating-based pairings\n• Tournament software integration\n• Age and skill divisions\n\n**Let's figure out your vision:**\n1. How many players are you hoping to welcome?\n2. What time control feels right? (5+0, 15+10, 90+30, etc.)\n3. How many rounds work for your schedule?\n4. Will this be rated or unrated?\n\nI'll help you organize a chess competition that celebrates strategic thinking! 🧠`;
    }
    
    if (lowerMessage.includes('music') || lowerMessage.includes('band') || lowerMessage.includes('choir') || lowerMessage.includes('orchestra')) {
      return `What a wonderful choice! Music competitions showcase incredible talent! 🎵 I know coordinating performance schedules and adjudication can feel overwhelming, but these events create such beautiful opportunities for students to shine.\n\n**Together, we'll create a harmonious competition:**\n• Solo and ensemble categories\n• Different instrument/voice divisions\n• Sight-reading and performance components\n• Fair adjudication and scoring rubrics\n• Concert and marching band formats\n\n**Let's start with your musical vision:**\n1. What type of music competition speaks to you? (Band, choir, orchestra, solo)\n2. What skill levels are you bringing together?\n3. How many groups/individuals are you expecting?\n4. What are your performance venue needs?\n\nI'll help you create a music competition that celebrates every note! 🎼`;
    }
    
    
    // Individual Golf or Fishing
    if (lowerMessage.includes('golf') && !lowerMessage.includes('fishing')) {
      return `Excellent! Golf tournaments are fantastic for charity fundraising! ⛳ I know organizing tee times and sponsorships can feel complex, but golf events are proven fundraising champions!\n\n**Let's create your perfect golf tournament:**\n• Scramble, best ball, or individual stroke play\n• Hole sponsorships and corporate packages\n• Longest drive and closest to pin contests\n• Silent auction and raffle integration\n• Professional scoring and leaderboards\n\n**Let's start planning:**\n1. What charity cause will this support?\n2. What golf course are you considering?\n3. How many foursomes are you planning for?\n4. What's your target date?\n\nI'll help you organize a golf tournament that drives results for your cause! 🏆`;
    }
    
    if (lowerMessage.includes('fishing') && !lowerMessage.includes('golf')) {
      return `Great choice! Fishing tournaments create such exciting community events! 🎣 I know coordinating weigh-ins and safety can feel overwhelming, but fishing competitions are incredibly engaging!\n\n**Let's organize your perfect fishing tournament:**\n• Bass tournament, big fish contest, or multi-species\n• Professional weigh-in stations and live scoring\n• Safety boat coordination and check-in systems\n• Sponsorship packages and prize structures\n• Youth and family categories\n\n**Let's start with your fishing vision:**\n1. What type of fishing competition? (Bass, multi-species, big fish)\n2. What body of water are you considering?\n3. How many boats/participants are you expecting?\n4. Is this for charity or prizes?\n\nI'll help you organize a fishing tournament that creates lasting memories! 🏆`;
    }
    
    // Generic tutorial response (ONLY for non-sport-specific requests)
    if (lowerMessage.includes('how') || lowerMessage.includes('build') || lowerMessage.includes('create') || lowerMessage.includes('start')) {
      return `Great! Let's build your tournament step by step:\n\n**📋 Step 1: Go to Tournament Creation**\n• Click "Tournaments" in the top navigation\n• Click "Create New Tournament" button\n\n**🏆 Step 2: Choose Your Tournament Type**\n• Single elimination, double elimination, or round robin\n• Pick your sport (basketball, track, academic, etc.)\n\n**⚙️ Step 3: Tournament Settings**\n• Set team size limits\n• Configure registration deadlines\n• Enable payment processing if needed\n\n**🎯 Step 4: Customize & Launch**\n• Add your branding and rules\n• Generate shareable registration codes\n• Invite teams to register\n\nWould you like me to walk through any specific step in detail?`;
    }
    
    // Only ask the general question if no specific sport was mentioned
    return `I'm so glad you're here! 🌟 Creating tournaments can feel like a big undertaking, but you're taking the right step by getting organized early.\n\n**Let's find the perfect tournament format for you:**\n• Track & Field meets (athletic excellence!)\n• Basketball tournaments (March Madness excitement)\n• Swimming competitions (precision and grace)\n• Academic competitions (celebrating student minds)\n• Multi-sport events (something for everyone!)\n\nWhat type of competition is calling to you? I'm here to make this as smooth as possible! 💪`;
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
    'build it for me', 'create it for me', 'make it for me', 'can you build it',
    'let\'s create', 'lets create', 'let\'s build', 'lets build',
    'let\'s make', 'lets make', 'let\'s set up', 'lets set up',
    'go ahead and create', 'go ahead and build', 'perfect! let\'s create',
    'perfect lets create', 'create this', 'build this', 'make this'
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
  
  // Extract sport (enhanced with more variations including charity runs)
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
    'swimming': 'Swimming',
    '5k': '5K Charity Run',
    '10k': '10K Community Run',
    'charity run': '5K Charity Run',
    'fun run': 'Fun Run (Color Run/Theme Run)',
    'run': '5K Charity Run',
    'charity walk': 'Charity Walk/Walk-a-thon',
    'walk-a-thon': 'Charity Walk/Walk-a-thon',
    'memorial run': 'Memorial/Awareness Run',
    'awareness run': 'Memorial/Awareness Run',
    'golf': 'Golf',
    'fishing': 'Fishing',
    'golf fishing': 'Golf/Fishing Combo Tournament',
    'golf and fishing': 'Golf/Fishing Combo Tournament',
    'combo tournament': 'Golf/Fishing Combo Tournament',
    'golf/fishing': 'Golf/Fishing Combo Tournament'
  };
  
  for (const [key, value] of Object.entries(sportMap)) {
    if (lowerMessage.includes(key)) {
      details.sport = value;
      break;
    }
  }
  
  // Extract participant count (enhanced for running events)
  const participantMatch = message.match(/(?:max|maximum|up to|limit|capacity).*?(\d+)\s*(?:participant|runner|people|person)/i) ||
                          message.match(/(\d+)\s*(?:participant|runner|people|person)/i) ||
                          message.match(/(\d+)\s*(?:team|division)/i);
  if (participantMatch) {
    const count = parseInt(participantMatch[1]);
    if (count > 0 && count < 10000) { // Reasonable range for running events
      details.maxParticipants = count;
      
      // For individual events like runs, don't generate teams
      if (details.sport && (details.sport.includes('Run') || details.sport.includes('Walk'))) {
        details.teams = []; // Individual participants, not teams
        details.teamSize = 1;
      } else {
        // Generate teams if not specified for team sports
        const teams = [];
        for (let i = 1; i <= count; i++) {
          teams.push(`Team ${i}`);
        }
        details.teams = teams;
      }
    }
  }
  
  // Extract charity cause and description
  if (lowerMessage.includes('breast cancer')) {
    details.description = 'Breast Cancer Awareness Run supporting education and community health initiatives';
    details.donationsEnabled = true;
    details.donationDescription = 'Support breast cancer awareness and Champions for Change educational programs';
  }
  if (lowerMessage.includes('charity') || lowerMessage.includes('awareness')) {
    details.donationsEnabled = true;
  }

  // Extract location information
  const locationPatterns = [
    /(?:start|begin|from)\s+(?:at\s+)?(.*?)\s+(?:and\s+end|to|end)/i,
    /(?:in|at|on)\s+(.*?)(?:\s+and|\s*\.|\s*$)/i,
    /location.*?:\s*([^.]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      details.location = match[1].trim();
      break;
    }
  }

  // Extract specific timing information
  if (lowerMessage.includes('8am') || lowerMessage.includes('8:00')) {
    details.startTime = '8:00 AM';
  }
  if (lowerMessage.includes('saturday') || lowerMessage.includes('weekend')) {
    details.preferredDayOfWeek = 'Saturday';
  }
  if (lowerMessage.includes('october')) {
    const currentYear = new Date().getFullYear();
    // Find first Saturday in October
    const october = new Date(currentYear, 9, 1); // October is month 9
    while (october.getDay() !== 6) { // 6 = Saturday
      october.setDate(october.getDate() + 1);
    }
    details.tournamentDate = october.toISOString();
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
  
  // Additional location patterns (combine with earlier patterns)
  if (!details.location) {
    const additionalLocationPatterns = [
      /(?:at|location|venue|held at|taking place at)\s+([^.!?\n]+)(?:on|\.|!|\?|$)/i,
      /will be at\s+([^.!?\n]+)/i
    ];
    
    for (const pattern of additionalLocationPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        details.location = match[1].trim();
        break;
      }
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
  if (!details.tournamentType) {
    // For running events, use leaderboard format instead of brackets
    if (details.sport && (details.sport.includes('Run') || details.sport.includes('Walk'))) {
      details.competitionFormat = 'leaderboard';
      details.tournamentType = 'single'; // Still need this for backend compatibility
    } else {
      details.tournamentType = 'single';
    }
  }
  if (!details.sport) details.sport = context.sport || 'Basketball';
  if (!details.teamSize) {
    // For running events, set team size to 1 (individual participants)
    if (details.sport && (details.sport.includes('Run') || details.sport.includes('Walk'))) {
      details.teamSize = 1;
    } else {
      details.teamSize = 5;
    }
  }
  if (!details.entryFee) details.entryFee = "0";
  if (!details.isPublic) details.isPublic = true;
  
  // Generate default name if not provided
  if (!details.name) {
    let name = `${details.sport} Tournament`;
    if (lowerMessage.includes('championship')) name = `${details.sport} Championship`;
    if (lowerMessage.includes('league')) name = `${details.sport} League`;
    if (lowerMessage.includes('classic')) name = `${details.sport} Classic`;
    if (lowerMessage.includes('breast cancer')) name = `Breast Cancer Awareness 5K Run`;
    if (lowerMessage.includes('charity') && lowerMessage.includes('5k')) name = `5K Charity Run`;
    
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
  
  // Look for conversation state in recent messages (check last 5 messages)
  for (let i = conversation_history.length - 1; i >= Math.max(0, conversation_history.length - 5); i--) {
    const message = conversation_history[i];
    if (message.conversation_state?.type === 'tournament_creation') {
      return message.conversation_state;
    }
  }
  
  // Also check for recent tournament creation context
  // If the last assistant message mentioned tournament creation
  for (let i = conversation_history.length - 1; i >= Math.max(0, conversation_history.length - 3); i--) {
    const message = conversation_history[i];
    if (message.role === 'assistant' && message.content) {
      const content = message.content.toLowerCase();
      if (content.includes('tournament details so far') || 
          content.includes('absolutely! i\'d be happy to help you create') ||
          content.includes('what would you like to call this tournament') ||
          content.includes('let\'s plan your perfect running event') ||
          content.includes('what an amazing initiative') ||
          content.includes('charity runs are such a beautiful way') ||
          content.includes('great choice on 5k charity run') ||
          content.includes('great choice on basketball') ||
          content.includes('5k charity run') ||
          content.includes('breast cancer awareness') ||
          content.includes('where will the tournament take place') ||
          content.includes('i love that you\'re organizing a basketball tournament') ||
          content.includes('basketball tournament') ||
          content.includes('how many teams are you hoping') ||
          content.includes('what format feels right') ||
          content.includes('march madness excitement') ||
          content.includes('let\'s make this basketball tournament amazing')) {
        // This looks like an ongoing tournament conversation, extract details from the conversation
        return {
          type: 'tournament_creation',
          step: 'gathering_details',
          providedDetails: extractDetailsFromConversationHistory(conversation_history),
          missingDetails: []
        };
      }
    }
  }
  
  return null;
}

function extractDetailsFromConversationHistory(conversation_history: any[]): any {
  const details: any = {};
  
  // Look through the conversation for tournament details
  for (const message of conversation_history) {
    if (message.content) {
      const content = message.content.toLowerCase();
      
      // Extract sport mentions (enhanced for charity runs and specific tournament types)
      if (content.includes('golf')) details.sport = 'Golf';
      if (content.includes('basketball') || content.includes('3v3 basketball')) {
        details.sport = 'Basketball';
        if (content.includes('3v3')) {
          details.teamSize = 3;
          details.description = '3v3 Basketball Tournament';
        }
      }
      if (content.includes('soccer')) details.sport = 'Soccer';
      if (content.includes('track')) details.sport = 'Track and Field';
      if (content.includes('5k charity run') || content.includes('breast cancer') || content.includes('charity run')) {
        details.sport = '5K Charity Run';
        details.donationsEnabled = true;
        if (content.includes('breast cancer')) {
          details.donationDescription = 'Support breast cancer awareness and Champions for Change educational programs';
          details.description = 'Breast Cancer Awareness Run supporting education and community health initiatives';
        }
      } else if (content.includes('5k') || content.includes('run')) {
        details.sport = 'Running';
      }
      
      // Extract team count for basketball and other team sports
      const basketballTeamMatch = content.match(/(\d+)\s*teams?/i);
      if (basketballTeamMatch) {
        details.teamCount = parseInt(basketballTeamMatch[1]);
      }
      
      // Extract division information
      const divisionMatch = content.match(/(\d+)\s*divisions?/i);
      if (divisionMatch) {
        details.divisions = parseInt(divisionMatch[1]);
      }
      
      // Extract dates (including March 7th 2026 format)
      const marchMatch = content.match(/march\s+(\d+)(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i);
      if (marchMatch) {
        const day = parseInt(marchMatch[1]);
        const year = parseInt(marchMatch[2]);
        details.eventDate = new Date(year, 2, day); // March is month 2 (0-indexed)
      }
      
      // Extract participant count (enhanced)
      const participantMatch = content.match(/(\d+)\s*participants?/i);
      if (participantMatch) {
        details.maxParticipants = parseInt(participantMatch[1]);
        if (details.sport && (details.sport.includes('Run') || details.sport.includes('Walk'))) {
          details.teams = []; // Individual participants
          details.teamSize = 1;
        }
      }
      
      // Extract location (enhanced patterns)
      const locationPatterns = [
        /(?:start|begin|from)\s+(?:at\s+)?(.*?)\s+(?:and\s+end|to|end)/i,
        /(?:starts at|begins at)\s+(.*?)(?:\s+on|\s+and|\s*$)/i,
        /(?:at|location)\s+(.*?)(?:\s+in|\s+on|\s*$)/i
      ];
      
      for (const pattern of locationPatterns) {
        const match = message.content.match(pattern);
        if (match && match[1]) {
          details.location = match[1].trim();
          break;
        }
      }
      
      // Extract name from direct mentions
      if (content.includes('corpus christi cares 5k')) {
        details.name = 'Corpus Christi Cares 5K';
      }
      
      // Extract registration fee
      const feeMatch = content.match(/\$(\d+)\s*(?:registration|fee)/i);
      if (feeMatch) {
        details.entryFee = feeMatch[1];
      }
      
      // Extract dates (enhanced)
      const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        details.tournamentDate = new Date(dateMatch[1]);
      }
      
      // Extract October timing
      if (content.includes('october') && content.includes('2025')) {
        const currentYear = new Date().getFullYear();
        const october = new Date(currentYear, 9, 1); // October is month 9
        // Find second Saturday in October
        while (october.getDay() !== 6) { // 6 = Saturday
          october.setDate(october.getDate() + 1);
        }
        october.setDate(october.getDate() + 7); // Second Saturday
        details.tournamentDate = october;
      }
      
      // Extract tournament type
      if (content.includes('single elimination')) details.tournamentType = 'single';
      if (content.includes('double elimination')) details.tournamentType = 'double';
      if (content.includes('round robin')) details.tournamentType = 'round-robin';
      
      // Extract team count (for team sports)
      const teamMatch = content.match(/(\d+)\s*teams?/);
      if (teamMatch && !details.sport?.includes('Run')) {
        const count = parseInt(teamMatch[1]);
        details.maxParticipants = count;
        const teams = [];
        for (let i = 1; i <= count; i++) {
          teams.push(`Team ${i}`);
        }
        details.teams = teams;
      }
    }
  }
  
  return details;
}

async function handleTournamentConversation(req: any, message: string, ongoingConversation: any, conversation_history: any[]): Promise<any> {
  try {
    const { providedDetails, missingDetails } = ongoingConversation;
    
    // Extract new details from the current message
    const newDetails = extractTournamentDetailsFromMessage(message, {});
    
    // Also extract details from the full conversation history
    const conversationDetails = extractDetailsFromConversationHistory(conversation_history);
    
    // Merge all details: conversation history + existing + new message
    const updatedDetails = { ...conversationDetails, ...providedDetails, ...newDetails };
    
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
      // Still missing details - but provide context-aware response
      const hasNewInfo = Object.keys(newDetails).length > 0;
      
      if (hasNewInfo) {
        // User provided new information, acknowledge it specifically
        let acknowledgment = "Perfect! ";
        
        if (newDetails.sport === 'Running' && message.toLowerCase().includes('breast cancer')) {
          acknowledgment = "Excellent! A 5K for breast cancer awareness in October is such an important cause! 💕 ";
        } else if (newDetails.sport) {
          acknowledgment = `Great choice on ${newDetails.sport}! `;
        }
        
        if (message.toLowerCase().includes('registration')) {
          acknowledgment += "I can absolutely help you set up the registration system. ";
        }
        
        // Provide a targeted next step instead of generic questions
        const response = acknowledgment + generateTargetedQuestionForMissingDetails(updatedDetails, stillMissingDetails, message);
        
        return {
          response,
          tournamentCreated: false,
          conversationState: {
            type: 'tournament_creation',
            step: 'gathering_details',
            providedDetails: updatedDetails,
            missingDetails: stillMissingDetails
          }
        };
      } else {
        // No new info, ask for the next detail
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

function generateTargetedQuestionForMissingDetails(providedDetails: any, missingDetails: string[], userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // For running events, provide specific guidance
  if (providedDetails.sport === 'Running') {
    if (lowerMessage.includes('registration')) {
      return `Since you mentioned registration focus, here's what I can set up for your breast cancer awareness 5K:\n\n**🎟️ Registration System Features:**\n• Online registration with participant waivers\n• Multiple pricing tiers (early bird, regular, day-of)\n• Team registration options\n• Fundraising goal tracking per participant\n• T-shirt size collection and distribution tracking\n• Emergency contact information collection\n\n**📋 For October timing, let's prioritize:**\n1. What's your target registration fee? (suggest $25-35 for charity 5Ks)\n2. Do you want early bird pricing to drive early registrations?\n3. Should we set up team registration for corporate sponsors?\n\nI can have your registration system ready this week!`;
    }
    
    if (lowerMessage.includes('october') || lowerMessage.includes('breast cancer')) {
      return `With October being Breast Cancer Awareness Month, timing is perfect! 🎀\n\n**📅 Quick Setup for October Launch:**\n• Registration opens: Early/Mid September (ASAP!)\n• Early bird deadline: End of September\n• Final registration: Week before event\n• Route already planned ✅\n\n**🎯 What we need to finalize quickly:**\n1. Exact date in October?\n2. Registration pricing structure?\n3. Fundraising goal for the cause?\n4. Corporate sponsorship opportunities?\n\nWith your route planned, we can focus on the registration and fundraising systems!`;
    }
  }
  
  // Fallback to regular question generation
  return generateQuestionForMissingDetails(providedDetails, missingDetails);
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