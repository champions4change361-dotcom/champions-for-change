import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDomain } from '@/hooks/useDomain';
import { useLocation } from 'wouter';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { config, isSchoolDomain, isFantasyDomain } = useDomain();
  const [location] = useLocation();

  const getSystemContext = () => {
    const pageContext = getPageContext(location);
    const domainType = isSchoolDomain() ? 'educational athletics' : 
                       isFantasyDomain() ? 'fantasy sports' : 
                       'tournament management';
    
    return `You are an AI assistant for a ${domainType} platform called ${config?.brand || 'the platform'}.

CURRENT CONTEXT:
- User is on: ${location}
- Page type: ${pageContext.type}
- Page description: ${pageContext.description}
- Domain: ${config?.brand || 'Default'}
- User role: ${user?.userRole || 'guest'}
- User name: ${user?.firstName || 'Guest'}

AVAILABLE FEATURES ON THIS PLATFORM:
${getAvailableFeatures()}

INSTRUCTIONS:
- Answer questions about THIS specific page and what the user can do here
- If user asks about features not on current page, explain where to find them
- Be specific and actionable - don't give generic responses
- If you don't know something about the platform, say so clearly
- Keep responses concise (2-3 sentences unless more detail is requested)

When the user asks about navigation or features:
1. First check if the feature exists in the available features list
2. Tell them the exact route/page to go to
3. Explain what they can do there

Remember: You're helping with ${pageContext.type} right now.`;
  };

  const getPageContext = (path: string) => {
    if (path.includes('/tournaments') && !path.includes('/create')) {
      return {
        type: 'Tournament Browsing',
        description: 'User can view all tournaments, search, filter, and register for events'
      };
    }
    if (path.includes('/create-tournament') || path.includes('/create')) {
      return {
        type: 'Tournament Creation',
        description: 'User is creating a new tournament with brackets, rules, and registration'
      };
    }
    if (path.includes('/tournament/') && path.includes('/dashboard')) {
      return {
        type: 'Tournament Dashboard',
        description: 'User is managing an active tournament - can view matches, update scores, manage participants'
      };
    }
    if (path.includes('/fantasy') && !path.includes('/create')) {
      return {
        type: 'Fantasy Dashboard',
        description: 'User can view their fantasy leagues, lineups, and available contests'
      };
    }
    if (path.includes('/fantasy/create')) {
      return {
        type: 'Fantasy League Creation',
        description: 'User is creating a new fantasy league with custom rules and scoring'
      };
    }
    if (path.includes('/fantasy/lineup')) {
      return {
        type: 'Lineup Builder',
        description: 'User is setting their fantasy lineup for upcoming games'
      };
    }
    if (path.includes('/health') || path.includes('/athletic-trainer')) {
      return {
        type: 'Health Monitoring',
        description: 'User can track athlete health, injuries, and medical compliance'
      };
    }
    if (path.includes('/teams') && !path.includes('/create')) {
      return {
        type: 'Team Management',
        description: 'User can view teams, manage rosters, and track team performance'
      };
    }
    if (path.includes('/budget')) {
      return {
        type: 'Budget Management',
        description: 'User can plan, allocate, track, and report on athletic department budgets'
      };
    }
    if (path.includes('/settings')) {
      return {
        type: 'Settings',
        description: 'User can configure account settings, notifications, and preferences'
      };
    }
    if (path === '/') {
      return {
        type: 'Home Dashboard',
        description: 'Main dashboard showing overview of tournaments, teams, and recent activity'
      };
    }
    
    return {
      type: 'Platform Navigation',
      description: 'General platform area'
    };
  };

  const getAvailableFeatures = () => {
    const features = [];
    
    features.push('- View tournaments: /tournaments');
    features.push('- Create tournament: /create-tournament');
    features.push('- Team management: /teams');
    features.push('- Settings: /settings');
    
    if (isFantasyDomain() || config?.brand === 'COACHES_LOUNGE') {
      features.push('- Fantasy leagues: /fantasy');
      features.push('- Create fantasy league: /fantasy/create/snake_draft');
      features.push('- Daily fantasy: /fantasy/create/daily_fantasy');
      features.push('- Available contests: /fantasy/contests');
      features.push('- Commissioner tools: /commissioner');
    }
    
    if (isSchoolDomain() || config?.brand === 'COMPETITIVE_EDUCATION_HUB') {
      features.push('- Health monitoring: /health-communication');
      features.push('- Athletic trainer dashboard: /athletic-trainer-dashboard');
      features.push('- Coach dashboard: /coach-dashboard');
      features.push('- Athlete management: /athlete-management');
      features.push('- Budget management: /budget');
      features.push('- Equipment tracking: /equipment-management');
      features.push('- Compliance: /compliance-management');
    }
    
    return features.join('\n');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const systemContext = getSystemContext();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemContext,
          messages: newMessages
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const pageContext = getPageContext(location);
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.firstName || 'there'}! 👋 I can help you with ${pageContext.type.toLowerCase()}. What would you like to know?`
      }]);
    }
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          data-testid="button-open-ai-assistant"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
              data-testid="button-close-ai-assistant"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900 ml-8 text-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 dark:bg-gray-800 mr-8 text-gray-900 dark:text-gray-100'
                }`}
                data-testid={`message-${msg.role}-${i}`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 dark:bg-gray-800 mr-8 p-3 rounded-lg" data-testid="loading-indicator">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-2 space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInput("How do I create a tournament?")}
                  className="text-xs"
                  data-testid="quick-action-create-tournament"
                >
                  Create tournament?
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInput("What can I do on this page?")}
                  className="text-xs"
                  data-testid="quick-action-whats-here"
                >
                  What's here?
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={loading}
                data-testid="input-ai-message"
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-send-message"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
