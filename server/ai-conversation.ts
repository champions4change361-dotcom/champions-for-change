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
    const response = generatePlatformResponse(message, intent, domain, user_context, conversation_history);
    
    // Generate helpful suggestions for next steps
    const suggestions = generateSuggestions(intent, domain, message);

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

function generateSuggestions(intent: string, domain: string, message?: string): string[] {
  const lowerMessage = message?.toLowerCase() || '';
  
  // Contextual suggestions based on intent and what user is asking
  if (intent === 'tournament_creation') {
    if (lowerMessage.includes('how') || lowerMessage.includes('build') || lowerMessage.includes('step')) {
      return [
        "Walk me through Step 1",
        "Show me tournament types", 
        "Explain team registration",
        "How do I set up brackets?"
      ];
    }
    return [
      "Create basketball tournament",
      "Set up track meet",
      "Academic competition",
      "Plan multi-sport event"
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