# Bubble Tournament Platform AI Training Data

## Overview
This document contains the code, data structures, and training examples needed to train an AI assistant that can help build tournament platforms and pages for clients using Bubble.

## Core Data Models

### Sport Categories Schema
```json
{
  "SportCategories": {
    "fields": {
      "CategoryName": "text",
      "CategoryDescription": "text", 
      "SortOrder": "number",
      "CreatedDate": "date",
      "IsActive": "yes/no"
    },
    "data": [
      {
        "CategoryName": "Team Sports",
        "CategoryDescription": "Sports played in teams",
        "SortOrder": 1,
        "IsActive": true
      },
      {
        "CategoryName": "Individual Sports", 
        "CategoryDescription": "Sports played individually",
        "SortOrder": 2,
        "IsActive": true
      },
      {
        "CategoryName": "Combat Sports",
        "CategoryDescription": "Martial arts, boxing, wrestling, and fighting sports",
        "SortOrder": 6,
        "IsActive": true
      },
      {
        "CategoryName": "Water Sports",
        "CategoryDescription": "Swimming, diving, water polo, and aquatic sports", 
        "SortOrder": 7,
        "IsActive": true
      },
      {
        "CategoryName": "Winter Sports",
        "CategoryDescription": "Ice and snow sports competitions",
        "SortOrder": 8,
        "IsActive": true
      },
      {
        "CategoryName": "Extreme Sports",
        "CategoryDescription": "High-risk and adventure sports",
        "SortOrder": 9,
        "IsActive": true
      },
      {
        "CategoryName": "Esports",
        "CategoryDescription": "Electronic sports and gaming competitions",
        "SortOrder": 3,
        "IsActive": true
      },
      {
        "CategoryName": "Culinary Competitions",
        "CategoryDescription": "Cooking, BBQ, and eating competitions",
        "SortOrder": 4,
        "IsActive": true
      },
      {
        "CategoryName": "Academic Competitions", 
        "CategoryDescription": "Educational and intellectual competitions",
        "SortOrder": 5,
        "IsActive": true
      },
      {
        "CategoryName": "Creative Arts",
        "CategoryDescription": "Art, music, dance, and creative competitions",
        "SortOrder": 11,
        "IsActive": true
      },
      {
        "CategoryName": "Professional Services",
        "CategoryDescription": "Business and professional skill competitions", 
        "SortOrder": 10,
        "IsActive": true
      }
    ]
  }
}
```

### Sport Options Schema
```json
{
  "SportOptions": {
    "fields": {
      "SportName": "text",
      "SportCategory": "SportCategories",
      "SportSubcategory": "text",
      "SortOrder": "number",
      "CompetitionType": "text", // bracket, leaderboard, series, bracket-to-series, both
      "ScoringMethod": "text", // wins, time, distance, points, placement, weight
      "MeasurementUnit": "text", // seconds, meters, points, strokes, etc.
      "HasSubEvents": "yes/no", // Track & Field, Swimming have sub-events
      "CreatedDate": "date",
      "IsActive": "yes/no"
    },
    "sample_data": [
      {
        "SportName": "Basketball",
        "SportCategory": "Team Sports",
        "CompetitionType": "bracket-to-series",
        "ScoringMethod": "wins",
        "SortOrder": 1
      },
      {
        "SportName": "Swimming",
        "SportCategory": "Water Sports", 
        "CompetitionType": "leaderboard",
        "ScoringMethod": "time",
        "MeasurementUnit": "seconds",
        "HasSubEvents": true,
        "SortOrder": 34
      },
      {
        "SportName": "Coding Competition",
        "SportCategory": "Professional Services",
        "CompetitionType": "leaderboard", 
        "ScoringMethod": "points",
        "SortOrder": 61
      }
    ]
  }
}
```

### Tournament Schema
```json
{
  "Tournaments": {
    "fields": {
      "TournamentName": "text",
      "TeamSize": "number",
      "TournamentType": "text", // single, double, pool-play, round-robin, swiss-system
      "CompetitionFormat": "text", // bracket, leaderboard, series, bracket-to-series, multi-stage
      "Status": "text", // upcoming, stage-1, stage-2, stage-3, completed
      "CurrentStage": "number",
      "TotalStages": "number",
      "SeriesLength": "number", // For series and bracket-to-series formats
      "StageConfiguration": "text", // JSON string defining each stage structure
      "BracketData": "text", // JSON string containing bracket structure
      "Sport": "SportOptions",
      "SportCategory": "SportCategories", 
      "TournamentStructure": "text",
      "AgeGroup": "text", // All Ages, Youth, Adult, Masters
      "GenderDivision": "text", // Mixed, Male, Female
      "ScoringMethod": "text",
      "CreatedDate": "date",
      "UpdatedDate": "date",
      "CreatedBy": "User"
    }
  }
}
```

### Competition Format Definitions
```json
{
  "CompetitionFormats": {
    "bracket": {
      "description": "Traditional elimination tournament with winners advancing",
      "stages": 1,
      "uses_series": false,
      "best_for": ["Football", "Soccer", "Tennis", "Wrestling", "Boxing"]
    },
    "leaderboard": {
      "description": "Individual performance rankings",
      "stages": 1, 
      "uses_series": false,
      "best_for": ["Track & Field", "Golf", "Swimming", "Gymnastics", "Archery"]
    },
    "series": {
      "description": "Teams play multiple games, first to win majority wins",
      "stages": 1,
      "uses_series": true,
      "series_options": [3, 5, 7],
      "best_for": ["Custom tournaments", "Special events"]
    },
    "bracket-to-series": {
      "description": "Playoff brackets leading to championship series (2 stages)",
      "stages": 2,
      "uses_series": true,
      "series_options": [3, 5, 7],
      "best_for": ["Basketball", "Baseball", "Hockey", "Ice Hockey", "Volleyball"]
    },
    "multi-stage": {
      "description": "Multiple tournament stages with different formats",
      "stages": "2-5",
      "uses_series": false,
      "best_for": ["Pool-play", "Round-robin", "Swiss-system"]
    }
  }
}
```

## API Workflow Examples

### Creating a Tournament
```javascript
// Step 1: Get available sports
const sports = await bubble.api.get("/api/sports");

// Step 2: Filter by category if needed
const teamSports = sports.filter(sport => 
  sport.SportCategory === "Team Sports"
);

// Step 3: Get sport-specific configuration
const selectedSport = sports.find(sport => 
  sport.SportName === "Basketball"
);

// Step 4: Configure tournament based on sport
const tournamentConfig = {
  TournamentName: "Spring Basketball Championship",
  TeamSize: 16,
  Sport: selectedSport.id,
  CompetitionFormat: selectedSport.CompetitionType, // bracket-to-series
  SeriesLength: 7, // Best of 7 for championship
  AgeGroup: "Adult",
  GenderDivision: "Mixed"
};

// Step 5: Create tournament
const tournament = await bubble.api.post("/api/tournaments", tournamentConfig);
```

### Building Tournament Pages
```javascript
// Page structure for tournament creation
const tournamentPageElements = {
  "sport_dropdown": {
    "type": "dropdown",
    "data_source": "SportOptions",
    "display_field": "SportName", 
    "group_by": "SportCategory",
    "filter": "IsActive = yes"
  },
  "competition_format_group": {
    "type": "radio_group",
    "options": "dynamic", // Based on selected sport's CompetitionType
    "conditional_logic": {
      "show_when": "selected_sport.CompetitionType = 'both'"
    }
  },
  "series_length_dropdown": {
    "type": "dropdown",
    "options": [
      {"value": 3, "text": "Best of 3 (first to 2 wins)"},
      {"value": 5, "text": "Best of 5 (first to 3 wins)"},
      {"value": 7, "text": "Best of 7 (first to 4 wins)"}
    ],
    "conditional_logic": {
      "show_when": "competition_format in ['series', 'bracket-to-series']"
    }
  },
  "team_size_dropdown": {
    "type": "dropdown", 
    "options": [4, 8, 16, 32],
    "default": 8
  }
};
```

## AI Training Prompts and Responses

### Example 1: Sport Selection
**User**: "I want to create a basketball tournament"

**AI Response**: 
```
I'll help you create a basketball tournament. Basketball uses a "bracket-to-series" format, which means:

1. **Stage 1**: Playoff brackets (elimination rounds)
2. **Stage 2**: Championship series (best-of format)

This is the same format used by professional leagues like the NBA. 

Configuration options:
- Tournament format: Bracket + Championship Series
- Series length: Best of 3, 5, or 7 games
- Team size: 4, 8, 16, or 32 teams
- Age groups: Youth, Adult, Masters, or All Ages

Would you like me to set up the tournament structure?
```

### Example 2: Competition Format Explanation
**User**: "What's the difference between bracket and bracket-to-series?"

**AI Response**:
```
Great question! Here are the key differences:

**Bracket Tournament:**
- Single-elimination format
- One game/match eliminates teams
- Used for: Football, Soccer, Tennis, Wrestling
- Example: March Madness basketball

**Bracket-to-Series:**  
- Two-stage format
- Stage 1: Playoff brackets (single games)
- Stage 2: Championship series (best-of format)
- Used for: NBA, MLB, NHL, professional volleyball
- Example: NBA playoffs → NBA Finals (best of 7)

The bracket-to-series format is more realistic for professional sports where the championship is determined by a series rather than a single game.
```

### Example 3: Sport Category Guidance
**User**: "I need a tournament for a corporate hackathon"

**AI Response**:
```
Perfect! For a corporate hackathon, I recommend:

**Sport**: Hackathon (from Professional Services category)
**Format**: Leaderboard competition
**Scoring**: Points-based (judged on criteria like innovation, technical execution, presentation)

Setup suggestions:
- Competition type: Leaderboard (teams ranked by total score)
- Team size: 4-8 teams typical for hackathons
- Scoring criteria: Technical (40%), Innovation (30%), Presentation (20%), Business Value (10%)
- Duration: 24-48 hours typical

Would you like me to configure the scoring rubric and team registration process?
```

## Workflow Templates

### Template 1: Professional Sports Tournament
```json
{
  "template_name": "Professional Sports",
  "applicable_sports": ["Basketball", "Baseball", "Hockey", "Ice Hockey", "Volleyball"],
  "default_config": {
    "CompetitionFormat": "bracket-to-series",
    "SeriesLength": 7,
    "TournamentType": "single",
    "stages": [
      {
        "stage_name": "Playoffs",
        "stage_type": "bracket", 
        "advancement": "winners_only"
      },
      {
        "stage_name": "Championship Series",
        "stage_type": "series",
        "series_length": 7
      }
    ]
  }
}
```

### Template 2: Individual Performance Sports
```json
{
  "template_name": "Individual Performance",
  "applicable_sports": ["Track & Field", "Swimming", "Golf", "Gymnastics", "Weightlifting"],
  "default_config": {
    "CompetitionFormat": "leaderboard",
    "ScoringMethod": "time|distance|points",
    "TeamSize": "participants_count",
    "ranking_method": "best_performance"
  }
}
```

### Template 3: Corporate/Business Competitions
```json
{
  "template_name": "Corporate Competitions",
  "applicable_sports": ["Sales Competition", "Coding Competition", "Hackathon", "Business Case Competition"],
  "default_config": {
    "CompetitionFormat": "leaderboard",
    "ScoringMethod": "points",
    "evaluation_criteria": "custom_rubric",
    "team_registration": "required"
  }
}
```

## Training Data Summary

This training data provides:
1. **Complete data models** for all tournament types
2. **65 sports across 11 categories** 
3. **4 competition formats** with proper use cases
4. **API workflow examples** for common tasks
5. **Page building templates** for Bubble
6. **AI conversation examples** for natural interaction
7. **Workflow templates** for different tournament types

The AI can use this data to:
- Recommend appropriate sports and formats
- Configure tournaments automatically
- Guide users through complex setups
- Explain differences between formats
- Suggest best practices for each sport type
- Build appropriate Bubble pages and workflows