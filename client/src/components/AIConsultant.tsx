import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { sessionManager, type AIMessage } from '@/lib/sessionManager';
import { Brain, MessageSquare, Trophy, Users, Calendar, DollarSign, Globe, ArrowRight, CheckCircle } from "lucide-react";

interface AIConsultantProps {
  domain?: 'education' | 'business' | 'coaches';
}

export function AIConsultant({ domain = 'education' }: AIConsultantProps) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [consultation, setConsultation] = useState({
    sport: '',
    participantCount: '',
    budget: '',
    goals: '',
    timeline: '',
    tournamentName: '',
    features: [] as string[]
  });

  // Load existing session data on mount
  useEffect(() => {
    const session = sessionManager.getSession();
    if (session.buildSelections) {
      setConsultation(prev => ({
        ...prev,
        sport: session.buildSelections.sportType || '',
        participantCount: session.buildSelections.participantCount || '',
        goals: session.buildSelections.goals || '',
        budget: session.buildSelections.budget || '',
        features: session.buildSelections.features || [],
        tournamentName: session.buildSelections.venue || ''
      }));
    }
  }, []);

  // Update session manager when consultation changes
  useEffect(() => {
    sessionManager.updateBuildSelections({
      sportType: consultation.sport,
      participantCount: consultation.participantCount,
      goals: consultation.goals,
      budget: consultation.budget,
      features: consultation.features,
      venue: consultation.tournamentName
    });
  }, [consultation]);

  const domainConfig = {
    education: {
      title: "AI Tournament Consultant",
      subtitle: "Get professional tournament recommendations",
      primaryColor: "green",
      features: [
        // Core Educational Features
        "FERPA Compliance", "HIPAA Compliance", "Student Safety Protocols", 
        "Educational Trip Integration", "Parent Communication", "Emergency Notifications",
        
        // Athletic Management
        "Athletic Trainer Dashboard", "Injury Prediction AI (95% Accuracy)", "Health Monitoring",
        "Medical Data Management", "Concussion Protocols", "Equipment Tracking",
        
        // Academic Competitions  
        "UIL Academic Events (50+)", "Speech & Debate Management", "STEM Competitions",
        "Academic Bowl Integration", "District-to-State Advancement", "TEKS Alignment",
        
        // Budget & Administration
        "Excel-Style Budget Management", "Financial Allocation Tracking", "Compliance Management",
        "Organizational Chart Builder", "Role-Based Access Control", "Audit Trails",
        
        // Enhanced Capabilities
        "AI Assistant on All Forms", "Multi-School Coordination", "Family Access Portal",
        "Achievement Tracking", "Live Score Updates", "Championship Series Management"
      ]
    },
    business: {
      title: "AI Tournament Builder",  
      subtitle: "Custom tournament solutions for your business",
      primaryColor: "blue",
      features: [
        // White Label & Branding
        "White Label Platform", "Custom Branding", "Domain Integration", "Logo Customization",
        
        // Revenue & Analytics
        "Revenue Analytics", "Sponsorship Integration", "Payment Processing", "Financial Reporting",
        "Registration Fee Management", "Multi-Tier Pricing", "Corporate Partnerships",
        
        // Professional Features
        "Professional Tournament Management", "Broadcasting Integration", "Media Management",
        "Professional Reporting", "Advanced Analytics", "Performance Tracking",
        
        // Business Operations
        "API Integration", "CRM Integration", "Marketing Automation", "Lead Generation",
        "Customer Support Tools", "Multi-Location Management", "Franchise Support",
        
        // Advanced Capabilities
        "AI Consultation Services", "Custom Development", "Enterprise Support",
        "Dedicated Account Manager", "24/7 Technical Support", "SLA Guarantees"
      ]
    },
    coaches: {
      title: "AI Fantasy Coach",
      subtitle: "Smart tournament and league management",
      primaryColor: "purple", 
      features: [
        // League Management
        "Fantasy League Creation", "Draft Management", "Player Analytics", "Live Updates",
        "Season-Long Competitions", "Playoff Brackets", "Championship Management",
        
        // Community & Social
        "Community Building", "Social Features", "Team Communication", "Fan Engagement",
        "Leaderboards", "Achievement Systems", "Rivalry Tracking",
        
        // Advanced Analytics
        "Performance Predictions", "Player Valuation", "Trade Analysis", "Injury Impact",
        "Season Projections", "Draft Strategy", "Optimal Lineups",
        
        // Pro Features
        "Professional Player Integration", "Real-Time Stats", "ESPN API Integration",
        "Advanced Scoring Systems", "Custom Rules Engine", "Commissioner Tools",
        
        // Monetization
        "Entry Fees", "Prize Pools", "Sponsorship Opportunities", "Revenue Sharing",
        "Premium Subscriptions", "VIP Features", "Exclusive Content"
      ]
    }
  };

  const config = domainConfig[domain];

  // Comprehensive sport categories with cascading structure
  const sportCategories = {
    athletic: {
      name: 'Athletic',
      subcategories: {
        team_sports: {
          name: 'Team Sports',
          sports: [
            'Basketball (Boys)', 'Basketball (Girls)', 'Football', 'Soccer (Boys)', 'Soccer (Girls)',
            'Volleyball (Boys)', 'Volleyball (Girls)', 'Baseball', 'Softball', 'Hockey',
            'Lacrosse (Boys)', 'Lacrosse (Girls)', 'Water Polo', 'Rugby', 'Team Tennis'
          ]
        },
        individual_sports: {
          name: 'Individual Sports',
          sports: [
            'Track & Field', 'Cross Country', 'Swimming', 'Diving', 'Tennis',
            'Golf', 'Wrestling', 'Gymnastics', 'Powerlifting', 'Bowling', 'Pickleball', 'Disc Golf'
          ]
        },
        competitive_spirit: {
          name: 'Competitive Spirit & Support',
          sports: [
            'Competitive Cheerleading', 'Sideline Cheerleading', 'Mascot Team', 
            'Pep Squad', 'Spirit Squad', 'Student Section Leadership'
          ]
        },
        combat_sports: {
          name: 'Combat Sports',
          sports: [
            'Boxing', 'Mixed Martial Arts', 'Karate', 'Taekwondo', 'Judo', 'Brazilian Jiu-Jitsu'
          ]
        }
      }
    },
    academic: {
      name: 'Academic',
      subcategories: {
        uil_academic: {
          name: 'UIL Academic',
          sports: [
            'Accounting', 'Calculator Applications', 'Computer Applications', 'Computer Science',
            'Current Issues & Events', 'Debate (Cross-Examination)', 'Debate (Lincoln-Douglas)',
            'Editorial Writing', 'Feature Writing', 'Headline Writing', 'Informative Speaking',
            'Literary Criticism', 'Mathematics', 'News Writing', 'Number Sense', 'Persuasive Speaking',
            'Poetry Interpretation', 'Prose Interpretation', 'Ready Writing', 'Science',
            'Social Studies', 'Spelling & Vocabulary'
          ]
        },
        speech_debate: {
          name: 'Speech & Debate',
          sports: [
            'Policy Debate', 'Lincoln-Douglas Debate', 'Public Forum Debate', 'Congressional Debate',
            'Extemporaneous Speaking', 'Original Oratory', 'Dramatic Interpretation',
            'Humorous Interpretation', 'Duo Interpretation', 'Poetry', 'Prose', 'Storytelling'
          ]
        },
        stem_competitions: {
          name: 'STEM Competitions',
          sports: [
            'Science Fair', 'Math Competition', 'Robotics', 'Engineering Design',
            'Coding Competition', 'Cybersecurity Challenge', 'Physics Olympiad',
            'Chemistry Olympiad', 'Biology Olympiad', 'Environmental Science'
          ]
        },
        intellectual_games: {
          name: 'Intellectual Games & Strategy',
          sports: [
            'Chess Tournament', 'Chess Club Championship', 'Academic Decathlon', 'Quiz Bowl', 
            'Bridge Tournament', 'Checkers Tournament', 'Scrabble Competition', 'Academic Bowl', 
            'Knowledge Bowl', 'Trivia Competition', 'Strategy Games Tournament', 'Logic Puzzles',
            'Board Game Tournament', 'Memory Competition'
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
            'Marching Band', 'Concert Band', 'Jazz Band', 'Orchestra', 'Choir',
            'Solo & Ensemble', 'All-State Auditions', 'Piano Competition',
            'Voice Competition', 'Instrumental Solo', 'Music Theory'
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
        },
        dance_and_movement: {
          name: 'Dance & Movement Arts',
          sports: [
            'Competitive Dance Team', 'Hip-Hop Dance', 'Contemporary Dance', 'Jazz Dance', 
            'Pom Dance', 'Performance Cheerleading', 'Color Guard', 'Winter Guard',
            'Drill Team', 'Dance Theatre'
          ]
        }
      }
    }
  };

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
    setConsultation(prev => ({ ...prev, sport: '' }));
  };

  // Reset sport when subcategory changes
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setConsultation(prev => ({ ...prev, sport: '' }));
  };

  // Handle feature toggle
  const handleFeatureToggle = (feature: string) => {
    setConsultation(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const getFeatureCategories = () => {
    if (domain === 'education') {
      return [
        {
          name: "Core Educational",
          features: ["FERPA Compliance", "HIPAA Compliance", "Student Safety Protocols", "Educational Trip Integration", "Parent Communication", "Emergency Notifications"]
        },
        {
          name: "Athletic Management", 
          features: ["Athletic Trainer Dashboard", "Injury Prediction AI (95% Accuracy)", "Health Monitoring", "Medical Data Management", "Concussion Protocols", "Equipment Tracking"]
        },
        {
          name: "Academic Competitions",
          features: ["UIL Academic Events (50+)", "Speech & Debate Management", "STEM Competitions", "Academic Bowl Integration", "District-to-State Advancement", "TEKS Alignment"]
        },
        {
          name: "Budget & Administration",
          features: ["Excel-Style Budget Management", "Financial Allocation Tracking", "Compliance Management", "Organizational Chart Builder", "Role-Based Access Control", "Audit Trails"]
        },
        {
          name: "Enhanced Capabilities",
          features: ["AI Assistant on All Forms", "Multi-School Coordination", "Family Access Portal", "Achievement Tracking", "Live Score Updates", "Championship Series Management"]
        }
      ];
    } else if (domain === 'business') {
      return [
        {
          name: "White Label & Branding",
          features: ["White Label Platform", "Custom Branding", "Domain Integration", "Logo Customization"]
        },
        {
          name: "Revenue & Analytics",
          features: ["Revenue Analytics", "Sponsorship Integration", "Payment Processing", "Financial Reporting", "Registration Fee Management", "Multi-Tier Pricing", "Corporate Partnerships"]
        },
        {
          name: "Professional Features",
          features: ["Professional Tournament Management", "Broadcasting Integration", "Media Management", "Professional Reporting", "Advanced Analytics", "Performance Tracking"]
        },
        {
          name: "Business Operations",
          features: ["API Integration", "CRM Integration", "Marketing Automation", "Lead Generation", "Customer Support Tools", "Multi-Location Management", "Franchise Support"]
        },
        {
          name: "Enterprise Support",
          features: ["AI Consultation Services", "Custom Development", "Enterprise Support", "Dedicated Account Manager", "24/7 Technical Support", "SLA Guarantees"]
        }
      ];
    } else { // coaches/fantasy
      return [
        {
          name: "League Management",
          features: ["Fantasy League Creation", "Draft Management", "Player Analytics", "Live Updates", "Season-Long Competitions", "Playoff Brackets", "Championship Management"]
        },
        {
          name: "Community & Social",
          features: ["Community Building", "Social Features", "Team Communication", "Fan Engagement", "Leaderboards", "Achievement Systems", "Rivalry Tracking"]
        },
        {
          name: "Advanced Analytics",
          features: ["Performance Predictions", "Player Valuation", "Trade Analysis", "Injury Impact", "Season Projections", "Draft Strategy", "Optimal Lineups"]
        },
        {
          name: "Pro Features",
          features: ["Professional Player Integration", "Real-Time Stats", "ESPN API Integration", "Advanced Scoring Systems", "Custom Rules Engine", "Commissioner Tools"]
        },
        {
          name: "Monetization",
          features: ["Entry Fees", "Prize Pools", "Sponsorship Opportunities", "Revenue Sharing", "Premium Subscriptions", "VIP Features", "Exclusive Content"]
        }
      ];
    }
  };

  // Determine complexity based on multiple factors
  const getCompetitionComplexity = () => {
    const participantCount = parseInt(consultation.participantCount || '0');
    const isFree = consultation.budget === 'free';
    const hasMinimalFeatures = consultation.features.length <= 2;
    
    // Competition type complexity factors
    const sport = consultation.sport.toLowerCase();
    const isIndividualCompetition = sport.includes('chess') || sport.includes('quiz') || 
                                   sport.includes('academic') || sport.includes('trivia') ||
                                   sport.includes('scrabble') || sport.includes('checkers');
    
    const isSimpleTeamSport = sport.includes('basketball') || sport.includes('volleyball') ||
                             sport.includes('soccer') || sport.includes('tennis');
    
    const requiresComplexSetup = sport.includes('track') || sport.includes('swimming') ||
                                sport.includes('gymnastics') || consultation.features.includes('FERPA Compliance') ||
                                consultation.features.includes('HIPAA Compliance');
    
    return {
      isSimple: isFree && participantCount <= 50 && hasMinimalFeatures && 
                (isIndividualCompetition || isSimpleTeamSport) && !requiresComplexSetup,
      participantCount,
      isIndividualCompetition,
      requiresComplexSetup
    };
  };

  // Always go to tournament creation, but with different feature sets
  const handleStartTournamentCreation = () => {
    if (!consultation.tournamentName) {
      return; // Don't proceed without tournament name
    }

    const complexity = getCompetitionComplexity();
    
    // Always go to tournament creation with pre-filled data and complexity level
    const params = new URLSearchParams({
      name: consultation.tournamentName,
      sport: consultation.sport,
      participants: consultation.participantCount,
      goals: consultation.goals,
      budget: consultation.budget,
      features: JSON.stringify(consultation.features),
      complexity: complexity.isSimple ? 'simple' : 'advanced',
      fromConsultant: 'true'
    });
    
    // Use router navigation to stay in same window/tab
    setLocation(`/create?${params.toString()}`);
  };

  const generateRecommendations = () => {
    // This would integrate with actual AI API
    return {
      tournamentStructure: "Single Elimination with Consolation Bracket",
      estimatedCost: "$299/month",
      timeline: "2-3 weeks setup",
      features: consultation.features,
      customizations: [
        "Automated bracket generation",
        "Real-time score updates", 
        "Registration management",
        "Payment processing integration"
      ]
    };
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`${
            config.primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
            config.primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
            'bg-purple-600 hover:bg-purple-700'
          } text-white shadow-lg rounded-full p-4 h-auto`}
          data-testid="button-open-ai-consultant"
        >
          <Brain className="h-6 w-6 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Need Help?</div>
            <div className="text-xs opacity-90">AI Tournament Consultant</div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] overflow-y-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className={`${
          config.primaryColor === 'green' ? 'bg-green-50 border-green-200' :
          config.primaryColor === 'blue' ? 'bg-blue-50 border-blue-200' :
          'bg-purple-50 border-purple-200'
        } border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className={`h-5 w-5 ${
                config.primaryColor === 'green' ? 'text-green-600' :
                config.primaryColor === 'blue' ? 'text-blue-600' :
                'text-purple-600'
              }`} />
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription>{config.subtitle}</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              data-testid="button-close-ai-consultant"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Tell me about your tournament needs:</h4>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Competition Category & Sport</label>
                
                {/* Selection Path Display */}
                {(selectedCategory || selectedSubcategory || consultation.sport) && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                    Selection Path: {selectedCategory ? sportCategories[selectedCategory as keyof typeof sportCategories].name : 'Category'} 
                    {selectedSubcategory && ` → ${(sportCategories[selectedCategory as keyof typeof sportCategories].subcategories as any)[selectedSubcategory]?.name}`}
                    {consultation.sport && ` → ${consultation.sport}`}
                  </div>
                )}
                
                {/* Step 1: Category Selection */}
                <div>
                  <label className="text-xs text-gray-500">1. Main Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="select-category"
                  >
                    <option value="">Select category...</option>
                    <option value="athletic">Athletic</option>
                    <option value="academic">Academic</option>
                    <option value="fine_arts">Fine Arts</option>
                  </select>
                </div>

                {/* Step 2: Subcategory Selection */}
                {selectedCategory && (
                  <div>
                    <label className="text-xs text-gray-500">2. Specific Area</label>
                    <select 
                      value={selectedSubcategory} 
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      data-testid="select-subcategory"
                    >
                      <option value="">Select area...</option>
                      {Object.entries(sportCategories[selectedCategory as keyof typeof sportCategories].subcategories).map(([key, subcategory]) => (
                        <option key={key} value={key}>{subcategory.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 3: Specific Sport Selection */}
                {selectedSubcategory && (
                  <div>
                    <label className="text-xs text-gray-500">3. Specific Competition</label>
                    <select 
                      value={consultation.sport} 
                      onChange={(e) => setConsultation(prev => ({ ...prev, sport: e.target.value }))}
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      data-testid="select-sport"
                    >
                      <option value="">Select competition...</option>
                      {getAvailableSports().map((sport: string) => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Number of Participants</label>
                <Input 
                  placeholder="e.g., 16 teams, 50 individuals"
                  value={consultation.participantCount}
                  onChange={(e) => setConsultation(prev => ({ ...prev, participantCount: e.target.value }))}
                  data-testid="input-participants"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Budget Range</label>
                <select 
                  value={consultation.budget} 
                  onChange={(e) => setConsultation(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  data-testid="select-budget"
                >
                  <option value="">Select budget</option>
                  <option value="free">Free (Foundation Tier)</option>
                  <option value="99">$99/month (Professional)</option>
                  <option value="399">$399/month (Enterprise)</option>
                  <option value="custom">Custom Enterprise</option>
                </select>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!consultation.sport || !consultation.participantCount}
                data-testid="button-continue-consultation"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold">What features do you need?</h4>
              <p className="text-xs text-gray-600">
                Select the capabilities most important to your organization. You'll get all features in your chosen plan.
              </p>
              
              <div className="max-h-48 overflow-y-auto space-y-2">
                {getFeatureCategories().map((category) => (
                  <div key={category.name} className="space-y-1">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{category.name}</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {category.features.map((feature) => (
                        <div 
                          key={feature}
                          onClick={() => handleFeatureToggle(feature)}
                          className={`p-2 border rounded cursor-pointer transition-colors text-xs ${
                            consultation.features.includes(feature)
                              ? `border-${config.primaryColor}-500 bg-${config.primaryColor}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{feature}</span>
                            {consultation.features.includes(feature) && (
                              <CheckCircle className={`h-3 w-3 text-${config.primaryColor}-600`} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium">Your Mission & Goals</label>
                <Textarea 
                  placeholder="Share your mission - examples: Fund educational trips, Generate revenue, Spread faith through sports, Build community, Support local athletes, Create competitive opportunities..."
                  value={consultation.goals}
                  onChange={(e) => setConsultation(prev => ({ ...prev, goals: e.target.value }))}
                  data-testid="textarea-goals"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  data-testid="button-get-recommendations"
                >
                  Get Recommendations
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Custom Tournament Plan
              </h4>

              <div className="space-y-3">
                {(() => {
                  const complexity = getCompetitionComplexity();
                  const sport = consultation.sport.toLowerCase();
                  
                  // Smart tournament structure recommendations
                  const getRecommendedStructure = () => {
                    if (sport.includes('chess') || sport.includes('scrabble') || sport.includes('checkers')) {
                      return 'Swiss System Tournament (optimal for skill-based games)';
                    }
                    if (sport.includes('quiz') || sport.includes('academic') || sport.includes('trivia')) {
                      return 'Round Robin with Finals (ensures everyone competes)';
                    }
                    if (sport.includes('track') || sport.includes('swimming')) {
                      return 'Heat-based Competition with Finals';
                    }
                    if (complexity.isIndividualCompetition) {
                      return 'Single Elimination with Consolation';
                    }
                    return 'Single Elimination with Consolation Bracket';
                  };

                  return (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">Recommended Structure</div>
                        <div className="text-sm text-gray-600">{getRecommendedStructure()}</div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">What You'll Get</div>
                        <div className="text-sm text-gray-600">
                          {complexity.isSimple
                            ? 'Go straight to building your tournament - no signup needed!'
                            : complexity.requiresComplexSetup
                            ? 'Advanced tournament creation with professional features'
                            : 'Full tournament builder with enhanced options'
                          }
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">Cost</div>
                        <div className="text-sm text-gray-600">
                          {consultation.budget === 'free' ? 'Free (up to 3 tournaments)' : `$${consultation.budget}/month`}
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Tournament Name</div>
                  <Input
                    placeholder="Enter your tournament name"
                    value={consultation.tournamentName}
                    onChange={(e) => setConsultation(prev => ({ ...prev, tournamentName: e.target.value }))}
                    className="mt-2"
                    data-testid="input-tournament-name"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Included Features</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {consultation.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Modify</Button>
                <Button 
                  className={`flex-1 ${
                    config.primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                    config.primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                  onClick={() => handleStartTournamentCreation()}
                  disabled={!consultation.tournamentName}
                  data-testid="button-create-tournament"
                >
                  Create Tournament <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}