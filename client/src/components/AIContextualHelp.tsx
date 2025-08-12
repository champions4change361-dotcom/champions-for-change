// 🤖 AI Contextual Help Component
// Smart AI that references live tournament data for contextual help

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, MessageCircle, User, Bot, TrendingUp, Settings, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AISuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
}

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
  context?: {
    userLevel: string;
    experienceLevel: string;
  };
}

interface AIContextualHelpProps {
  tournamentId?: string;
  compact?: boolean;
}

export default function AIContextualHelp({ tournamentId, compact = false }: AIContextualHelpProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Get AI context for current user/tournament
  const { data: aiContext } = useQuery({
    queryKey: ['/api/ai/context', user?.id, tournamentId],
    enabled: !!user?.id,
    retry: false,
  });

  // Get proactive suggestions
  const { data: proactiveSuggestions } = useQuery({
    queryKey: ['/api/ai/proactive-suggestions', tournamentId, user?.id],
    enabled: !!user?.id && !!tournamentId,
    retry: false,
  });

  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      return await apiRequest('POST', '/api/ai/contextual-help', {
        userId: user?.id,
        tournamentId,
        question,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      });
    },
    onSuccess: (response) => {
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        suggestions: response.context?.suggestions || [],
        context: response.context
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Invalidate context queries to refresh suggestions
      queryClient.invalidateQueries({ queryKey: ['/api/ai/context'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/proactive-suggestions'] });
    },
    onError: (error) => {
      toast({
        title: "AI Help Unavailable",
        description: "I'm having trouble right now, but I'll be back soon!",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!currentQuestion.trim() || !user?.id) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(currentQuestion);
    setCurrentQuestion('');
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    const question = `Help me with: ${suggestion.title}`;
    setCurrentQuestion(question);
    handleSendMessage();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user?.id) {
    return (
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Sign in to get personalized AI help</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact && !isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          data-testid="button-expand-ai-help"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Show urgent suggestions as badges */}
        {proactiveSuggestions?.suggestions?.filter((s: AISuggestion) => s.priority === 'high').length > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -left-2 animate-pulse">
            {proactiveSuggestions.suggestions.filter((s: AISuggestion) => s.priority === 'high').length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`${compact ? 'fixed bottom-4 right-4 w-96 h-96 z-50 shadow-2xl' : 'w-full max-w-2xl'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Tournament Assistant</CardTitle>
              <CardDescription>
                {aiContext?.context?.user ? 
                  `${aiContext.context.user.experienceLevel === 'experienced' ? 'Expert' : 'Learning'} mode • ${aiContext.context.user.totalTournaments} tournaments` :
                  'Contextual help for your tournaments'
                }
              </CardDescription>
            </div>
          </div>
          
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              data-testid="button-minimize-ai-help"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Proactive Suggestions */}
        {proactiveSuggestions?.suggestions && proactiveSuggestions.suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Smart Suggestions
            </div>
            {proactiveSuggestions.suggestions.map((suggestion: AISuggestion, index: number) => (
              <Alert key={index} className={`cursor-pointer hover:bg-gray-50 ${getPriorityColor(suggestion.priority)}`}
                     onClick={() => handleSuggestionClick(suggestion)}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{suggestion.title}</div>
                  <div className="text-sm opacity-90">{suggestion.message}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div className={`space-y-3 ${compact ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about tournament setup!</p>
              <p className="text-xs mt-1">I know about your {aiContext?.context?.user?.totalTournaments || 0} tournaments and can provide personalized help.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-white bg-opacity-20 rounded p-2 hover:bg-opacity-30 transition-colors"
                        >
                          💡 {suggestion.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask about donations, Stripe setup, tournament tips..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={chatMutation.isPending}
            className="flex-1"
            data-testid="input-ai-question"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentQuestion.trim() || chatMutation.isPending}
            size="sm"
            data-testid="button-send-ai-question"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Context Info */}
        {aiContext?.context && (
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <span>Tech Level: {aiContext.context.user.techSkillLevel}</span>
            <span>Experience: {aiContext.context.user.successfulSetups} setups</span>
            {aiContext.context.history.averageDonationGoal > 0 && (
              <span>Avg Goal: ${aiContext.context.history.averageDonationGoal}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}