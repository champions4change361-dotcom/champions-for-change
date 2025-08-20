import type { Request, Response } from 'express';

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
    
    // Generate contextual response based on Champions for Change platform
    const response = generatePlatformResponse(message, intent, domain, user_context);
    
    // Generate helpful suggestions for next steps
    const suggestions = generateSuggestions(intent, domain);

    res.json({
      response,
      suggestions,
      extracted_context: extractedContext,
      intent,
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

function generatePlatformResponse(message: string, intent: string, domain: string, userContext: any): string {
  const platformFeatures = {
    tournament_creation: {
      response: `I can help you create a comprehensive tournament! Champions for Change offers:\n\n🏆 **Complete Tournament Management:**\n• 5-step tournament creation wizard\n• Automatic bracket generation\n• Real-time scoring and updates\n• Parent/athlete notifications\n\n📊 **Advanced Features:**\n• AI-powered participant matching\n• Budget tracking and cost analysis\n• Health monitoring integration\n• HIPAA/FERPA compliance\n\nWhat type of tournament are you planning? (Track meet, academic competition, multi-sport event, etc.)`,
      suggestions: ["Create track meet", "Set up academic competition", "Plan multi-sport tournament", "Configure health monitoring"]
    },
    
    budget_management: {
      response: `Our Excel-style budget management system is perfect for educational programs!\n\n💰 **Budget Features:**\n• CCISD-approved budget categories\n• Real-time expense tracking\n• Grant funding integration\n• Cost-per-student calculations\n\n🎯 **Smart Analytics:**\n• Predictive cost modeling\n• Multi-year budget planning\n• District-wide allocation\n• Compliance reporting\n\nWhat's your budget planning goal? Transportation costs, equipment purchases, or full program budgets?`,
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

function generateSuggestions(intent: string, domain: string): string[] {
  const suggestionMap = {
    tournament_creation: [
      "Help me plan a track meet",
      "Set up basketball tournament",
      "Create academic competition",
      "Configure health monitoring"
    ],
    budget_management: [
      "Transportation costs",
      "Equipment budgets",
      "Grant funding help",
      "District allocation"
    ],
    health_monitoring: [
      "Football injury tracking",
      "Concussion protocols",
      "Athletic trainer setup",
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
    "Create a tournament",
    "Manage budgets",
    "Health monitoring",
    "Academic events"
  ];
}