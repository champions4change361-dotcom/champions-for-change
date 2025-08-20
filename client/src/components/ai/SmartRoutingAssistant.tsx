import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from 'wouter';
import { sessionManager } from '@/lib/sessionManager';
import { MessageSquare, ArrowRight, Sparkles, Target, Clock, CheckCircle } from "lucide-react";

export function SmartRoutingAssistant() {
  const [location, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState(sessionManager.getSession());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Update suggestions based on current session
    const routingSuggestions = sessionManager.getRoutingSuggestions();
    setSuggestions(routingSuggestions);
    
    // Show progress if user has significant data
    setShowProgress(sessionManager.hasSignificantProgress());
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    // Route based on suggestion
    const routingMap: Record<string, string> = {
      'Tournament Creation Wizard': '/create',
      'Continue Tournament Setup': '/create',
      'Team Health Monitoring Setup': '/health-monitoring',
      'Athletic Trainer Dashboard': '/trainer-dashboard',
      'District Budget Management': '/budget',
      'Multi-School Tournament Setup': '/district/tournaments',
      'Compliance Dashboard': '/compliance',
      'District-Wide Analytics': '/district/analytics',
      'Organizational Chart Builder': '/organization',
      'Cross-School Coordination': '/district/coordination'
    };

    const route = routingMap[suggestion];
    if (route) {
      // Update session with routing intent
      sessionManager.updateUserContext({ 
        detectedIntent: suggestion.toLowerCase().replace(/\s+/g, '_') 
      });
      setLocation(route);
    }
  };

  const getContextSummary = () => {
    const { userContext, buildSelections } = sessionData;
    const summary = [];

    if (userContext.role) {
      summary.push(`Role: ${userContext.role.replace('_', ' ')}`);
    }
    if (userContext.organization) {
      summary.push(`Organization: ${userContext.organization}`);
    }
    if (buildSelections.sportType) {
      summary.push(`Sport: ${buildSelections.sportType}`);
    }
    if (buildSelections.participantCount) {
      summary.push(`Participants: ${buildSelections.participantCount}`);
    }

    return summary;
  };

  const getProgressItems = () => {
    const { buildSelections, userContext, aiConversation } = sessionData;
    const items = [];

    if (userContext.role) {
      items.push({ label: 'Role identified', completed: true });
    }
    if (userContext.organization) {
      items.push({ label: 'Organization set', completed: true });
    }
    if (buildSelections.sportType) {
      items.push({ label: 'Sport selected', completed: true });
    }
    if (buildSelections.features && buildSelections.features.length > 0) {
      items.push({ label: 'Features chosen', completed: true });
    }
    if (aiConversation.length >= 3) {
      items.push({ label: 'Requirements discussed', completed: true });
    }

    return items;
  };

  if (!showProgress && suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg">Smart Assistant</CardTitle>
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </div>
        <CardDescription>
          Based on your conversation, here's what I recommend next
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Summary */}
        {showProgress && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              Session Progress ({sessionManager.getSessionAge()} min ago)
            </div>
            
            {/* Context Summary */}
            <div className="flex flex-wrap gap-2">
              {getContextSummary().map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>

            {/* Progress Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getProgressItems().map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routing Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Target className="h-4 w-4" />
              Recommended Next Steps
            </div>
            
            <div className="grid gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-between h-auto p-3 text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Continue AI Chat */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-blue-600 dark:text-blue-400"
            onClick={() => {
              // This would reopen the AI consultant
              window.dispatchEvent(new CustomEvent('openAIConsultant'));
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Continue AI Conversation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}