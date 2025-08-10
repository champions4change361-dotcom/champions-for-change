// Bubble API Integration Code for Tournament Platform
// This code helps train AI to understand how to integrate with Bubble's API

/**
 * Core API Functions for Tournament Management
 */
class BubbleTournamentAPI {
  constructor(apiToken, appDomain) {
    this.apiToken = apiToken;
    this.baseUrl = `https://${appDomain}.bubbleapps.io/api/1.1`;
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all sport categories
  async getSportCategories() {
    const response = await fetch(`${this.baseUrl}/obj/SportCategories`, {
      headers: this.headers
    });
    return response.json();
  }

  // Get sports by category
  async getSportsByCategory(categoryId) {
    const response = await fetch(
      `${this.baseUrl}/obj/SportOptions?constraints=[{"key":"SportCategory","constraint_type":"equals","value":"${categoryId}"}]`,
      { headers: this.headers }
    );
    return response.json();
  }

  // Create a new tournament
  async createTournament(tournamentData) {
    const response = await fetch(`${this.baseUrl}/obj/Tournaments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(tournamentData)
    });
    return response.json();
  }

  // Get tournament configuration based on sport
  async getTournamentConfig(sportId) {
    const sport = await this.getSport(sportId);
    
    // AI Logic: Determine configuration based on sport type
    const config = {
      competitionFormat: sport.CompetitionType,
      scoringMethod: sport.ScoringMethod,
      measurementUnit: sport.MeasurementUnit,
      hasSubEvents: sport.HasSubEvents
    };

    // Add series configuration for applicable formats
    if (['series', 'bracket-to-series'].includes(sport.CompetitionType)) {
      config.seriesOptions = [3, 5, 7];
      config.defaultSeriesLength = sport.CompetitionType === 'bracket-to-series' ? 7 : 3;
    }

    // Add stage configuration for bracket-to-series
    if (sport.CompetitionType === 'bracket-to-series') {
      config.stages = [
        {
          stageName: 'Playoffs',
          stageType: 'bracket',
          description: 'Elimination rounds leading to championship'
        },
        {
          stageName: 'Championship Series', 
          stageType: 'series',
          description: `Best of ${config.defaultSeriesLength} championship series`
        }
      ];
    }

    return config;
  }

  // AI Helper: Get sport recommendations based on user input
  async getRecommendedSports(userInput) {
    const allSports = await this.getAllSports();
    const keywords = userInput.toLowerCase();
    
    // AI Logic: Match user input to sport categories and names
    const recommendations = allSports.filter(sport => {
      const sportName = sport.SportName.toLowerCase();
      const categoryName = sport.SportCategory?.CategoryName?.toLowerCase() || '';
      
      return sportName.includes(keywords) || 
             categoryName.includes(keywords) ||
             this.getKeywords(sport).some(keyword => keywords.includes(keyword));
    });

    return recommendations.map(sport => ({
      ...sport,
      confidence: this.calculateConfidence(sport, keywords),
      reasoning: this.getRecommendationReason(sport, keywords)
    })).sort((a, b) => b.confidence - a.confidence);
  }

  // AI Helper: Get keywords for sport matching
  getKeywords(sport) {
    const keywordMap = {
      'Basketball': ['ball', 'hoop', 'nba', 'court', 'dribble'],
      'Soccer': ['football', 'fifa', 'kick', 'goal', 'field'],
      'Swimming': ['pool', 'water', 'lap', 'stroke', 'olympic'],
      'Coding Competition': ['programming', 'code', 'developer', 'algorithm', 'software'],
      'Hackathon': ['hack', 'innovation', 'startup', 'tech', 'development'],
      'Boxing': ['fight', 'punch', 'ring', 'gloves', 'rounds'],
      'Esports': ['gaming', 'video games', 'online', 'digital', 'streaming']
    };
    
    return keywordMap[sport.SportName] || [];
  }

  // AI Helper: Calculate confidence score for recommendations
  calculateConfidence(sport, keywords) {
    let confidence = 0;
    
    // Exact name match
    if (sport.SportName.toLowerCase().includes(keywords)) confidence += 90;
    
    // Category match
    if (sport.SportCategory?.CategoryName?.toLowerCase().includes(keywords)) confidence += 60;
    
    // Keyword match
    const sportKeywords = this.getKeywords(sport);
    const keywordMatches = sportKeywords.filter(keyword => keywords.includes(keyword));
    confidence += keywordMatches.length * 20;
    
    return Math.min(confidence, 100);
  }

  // AI Helper: Provide reasoning for recommendations
  getRecommendationReason(sport, keywords) {
    if (sport.SportName.toLowerCase().includes(keywords)) {
      return `Direct match with sport name "${sport.SportName}"`;
    }
    
    if (sport.SportCategory?.CategoryName?.toLowerCase().includes(keywords)) {
      return `Matches category "${sport.SportCategory.CategoryName}"`;
    }
    
    const matchedKeywords = this.getKeywords(sport).filter(keyword => keywords.includes(keyword));
    if (matchedKeywords.length > 0) {
      return `Related keywords: ${matchedKeywords.join(', ')}`;
    }
    
    return 'General match based on content analysis';
  }
}

/**
 * AI Training Examples for Natural Language Processing
 */
const aiTrainingExamples = [
  {
    userInput: "I want to create a basketball tournament",
    expectedResponse: {
      recommendedSport: "Basketball",
      competitionFormat: "bracket-to-series", 
      explanation: "Basketball uses a professional playoff format with elimination rounds followed by a championship series",
      suggestedConfig: {
        seriesLength: 7,
        teamSize: 16,
        stages: ["Playoffs", "Championship Series"]
      }
    }
  },
  {
    userInput: "Corporate hackathon competition",
    expectedResponse: {
      recommendedSport: "Hackathon",
      competitionFormat: "leaderboard",
      explanation: "Hackathons are best run as judged competitions with teams ranked by scoring criteria",
      suggestedConfig: {
        scoringMethod: "points",
        teamSize: 8,
        criteria: ["Technical", "Innovation", "Presentation", "Business Value"]
      }
    }
  },
  {
    userInput: "Swimming meet for high school",
    expectedResponse: {
      recommendedSport: "Swimming", 
      competitionFormat: "leaderboard",
      explanation: "Swimming competitions rank participants by performance times",
      suggestedConfig: {
        scoringMethod: "time",
        measurementUnit: "seconds",
        hasSubEvents: true,
        ageGroup: "Youth"
      }
    }
  }
];

/**
 * Bubble Workflow Integration 
 */
class BubbleWorkflowIntegration {
  // Create tournament creation workflow
  static generateTournamentWorkflow(sportConfig) {
    return {
      workflowName: "Create Tournament",
      trigger: "Button click",
      steps: [
        {
          action: "Validate inputs",
          conditions: [
            "Tournament name is not empty",
            "Sport is selected", 
            "Team size is valid"
          ]
        },
        {
          action: "Set tournament format",
          logic: `
            If Selected Sport's Competition Type = "bracket-to-series"
              Set Competition Format = "bracket-to-series"
              Set Series Length = 7
              Set Total Stages = 2
            Else if Selected Sport's Competition Type = "leaderboard"  
              Set Competition Format = "leaderboard"
              Set Scoring Method = Selected Sport's Scoring Method
            Else
              Set Competition Format = Selected Sport's Competition Type
          `
        },
        {
          action: "Generate bracket structure",
          condition: "Competition Format contains 'bracket'",
          logic: "Create bracket based on team size and tournament type"
        },
        {
          action: "Create tournament record",
          data: {
            "TournamentName": "Input Tournament Name",
            "Sport": "Selected Sport",
            "CompetitionFormat": "Calculated Competition Format",
            "TeamSize": "Input Team Size",
            "SeriesLength": "Calculated Series Length",
            "Status": "upcoming"
          }
        },
        {
          action: "Navigate to tournament page",
          destination: "Tournament details page"
        }
      ]
    };
  }

  // Generate conditional logic for UI elements
  static generateConditionalLogic() {
    return {
      "series_length_group": {
        "show_when": "Selected Sport's Competition Type is in ['series', 'bracket-to-series'] OR Competition Format is in ['series', 'bracket-to-series']"
      },
      "competition_format_group": {
        "show_when": "Selected Sport's Competition Type = 'both'"
      },
      "event_selection_button": {
        "show_when": "Selected Sport's Has Sub Events = yes"
      },
      "participant_label": {
        "text": "If Selected Sport's Competition Type = 'leaderboard' then 'Participants' else 'Teams'"
      }
    };
  }
}

/**
 * AI Response Templates
 */
const aiResponseTemplates = {
  sportRecommendation: (sport, confidence, reasoning) => `
    I recommend **${sport.SportName}** (${confidence}% confidence).
    
    ${reasoning}
    
    **Tournament Configuration:**
    - Format: ${sport.CompetitionType}
    - Scoring: ${sport.ScoringMethod}
    ${sport.CompetitionType === 'bracket-to-series' ? '- Stages: Playoffs → Championship Series' : ''}
    
    Would you like me to set up this tournament structure?
  `,
  
  formatExplanation: (format) => {
    const explanations = {
      'bracket': 'Single-elimination tournament where teams are eliminated after losing',
      'leaderboard': 'Individual performance rankings based on times, scores, or points', 
      'series': 'Teams play multiple games, first to win majority advances',
      'bracket-to-series': 'Playoff brackets followed by championship series (like NBA/MLB)'
    };
    
    return explanations[format] || 'Custom tournament format';
  },
  
  configurationSummary: (config) => `
    **Tournament Configuration Summary:**
    - Competition Format: ${config.competitionFormat}
    - Scoring Method: ${config.scoringMethod}
    ${config.seriesLength ? `- Series Length: Best of ${config.seriesLength}` : ''}
    ${config.stages ? `- Stages: ${config.stages.map(s => s.stageName).join(' → ')}` : ''}
    
    This configuration is optimized for ${config.sportName} competitions.
  `
};

// Export for use in AI training
module.exports = {
  BubbleTournamentAPI,
  BubbleWorkflowIntegration,
  aiTrainingExamples,
  aiResponseTemplates
};