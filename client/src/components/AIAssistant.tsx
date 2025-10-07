import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Sparkles, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDomain } from '@/hooks/useDomain';
import { useLocation } from 'wouter';

// Platform Knowledge Base - Real troubleshooting solutions
const APP_KNOWLEDGE = `
# PLATFORM KNOWLEDGE BASE

## Tournament Creation Issues
**Problem: "Bracket won't generate"**
- Solution: Ensure minimum team count (4 for single elimination, 8 for double elimination)
- Check that all teams have been saved/confirmed
- Verify bracket type is selected in settings
- If using custom brackets, ensure seeds are assigned

**Problem: "Can't publish tournament"**
- Must complete: Tournament name, date, location, bracket type
- Need at least one registration form created
- Must set tournament status to "Published" in settings

**Problem: "Registration not working"**
- Check if registration deadline hasn't passed
- Verify payment settings if charging fees
- Ensure registration form is published (not draft)
- Check team capacity limits

## Fantasy League Issues
**Problem: "Can't set lineup"**
- Lineup lock happens 5 minutes before game start
- Must have full starting roster (no empty slots)
- Check player eligibility (injury/bye week status)
- Verify salary cap if applicable

**Problem: "Scoring not updating"**
- Scores update every 15 minutes during live games
- Final scores posted 1 hour after game completion
- Check if league commissioner has scoring settings configured
- Stat corrections can happen up to 48 hours post-game

**Problem: "Can't join league"**
- League may be full (check max teams setting)
- May require invite code from commissioner
- Draft may have already started
- Entry fee payment required if applicable

## Team Management Issues
**Problem: "Can't add players to roster"**
- Verify roster size limits (check league settings)
- Player may already be on another team in same tournament
- Check player eligibility requirements (age, skill level)
- Ensure player has completed registration if required

**Problem: "Team not showing in tournament"**
- Registration must be completed AND paid
- Tournament organizer may need to approve team
- Check spam/email for confirmation
- Verify all required roster spots are filled

## Payment/Billing Issues
**Problem: "Payment failed"**
- Verify card details are correct
- Check for sufficient funds
- Some cards require 3D Secure verification
- Try different payment method
- Contact support if persists: support@championsforchange.net

**Problem: "Refund requested"**
- Refunds available up to 48 hours before event
- Processed within 5-7 business days
- Service fee (10%) is non-refundable
- See /refund-policy for full details

## Health Monitoring (Athletic Trainers)
**Problem: "Can't log injury"**
- Athlete must be in your assigned roster
- Ensure you have Athletic Trainer role permissions
- Required fields: injury type, date, severity
- Add follow-up appointments for tracking

**Problem: "Clearance not showing"**
- Medical clearance requires physician signature
- Upload clearance form as PDF
- Athletic Director must approve
- Check compliance status in athlete profile

## Budget Management Issues
**Problem: "Budget won't save"**
- Total allocated must equal total budget
- All categories must have values (use $0 if none)
- Requires Athletic Director or Admin approval
- Check for fiscal year date conflicts

**Problem: "Can't approve purchase"**
- Verify you have approval authority for amount
- Check if budget category has sufficient funds
- Requires itemized receipt upload
- May need two-level approval for amounts over $1000

## Common Navigation Questions
- Create tournament: /create-tournament
- View all tournaments: /tournaments
- Manage team: /teams (then select your team)
- Fantasy dashboard: /fantasy
- Budget tools: /budget
- Health monitoring: /athletic-trainer-dashboard
- Settings: /settings

## Role-Specific Access
**Coach:** Can create teams, view athlete health, request budget
**Athletic Trainer:** Full health monitoring, clearance management
**Athletic Director:** Budget approval, district-wide analytics
**Parent:** View athlete info, communicate with staff
**Athlete:** View schedule, update profile, see health status
**Tournament Organizer:** Create/manage tournaments, scorekeeping
**Commissioner (Fantasy):** League settings, scoring, roster management

## Business Rules
- Tournament registration closes 24 hours before start
- Fantasy lineup changes lock at game time
- Budget requests need 48-hour approval window
- Medical clearances expire annually
- Refunds not available after event starts
- Teams need minimum 50% of roster present to compete
`;

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
    
    return `You are a helpful AI assistant for a ${domainType} platform.

CURRENT USER CONTEXT:
- Current page: ${location}
- Page type: ${pageContext.type}
- What user can do here: ${pageContext.description}
- User role: ${user?.userRole || 'guest'}
- User name: ${user?.firstName || 'Guest'}
- Domain: ${config?.brand || 'Default'}

${APP_KNOWLEDGE}

INSTRUCTIONS FOR HELPING USERS:
1. **Troubleshooting Problems:** When user describes an issue, search the knowledge base above for relevant solutions
2. **Be Specific:** Give exact steps, not generic advice
3. **Check Prerequisites:** Remind users of requirements (permissions, completed fields, etc.)
4. **Navigation Help:** Tell users exact routes to features
5. **Escalate When Needed:** If issue isn't in knowledge base, direct to support at support@championsforchange.net
6. **Stay In Context:** Focus on helping with ${pageContext.type}

RESPONSE FORMAT:
- Start with empathy ("I understand that's frustrating")
- Give 2-3 specific things to check
- Provide exact steps if applicable
- Offer to help with next steps

If you don't have information about something, say: "I don't have specific details about that. Please contact support at support@championsforchange.net or check the documentation."

Remember: User is currently on ${pageContext.type} page.`;
  };

  const getPageContext = (path: string) => {
    if (path.includes('/tournaments') && !path.includes('/create')) {
      return {
        type: 'Tournament Browsing',
        description: 'Browse tournaments, filter by sport/date, register for events'
      };
    }
    if (path.includes('/create-tournament') || path.includes('/create')) {
      return {
        type: 'Tournament Creation',
        description: 'Set up brackets, registration forms, rules, and scheduling'
      };
    }
    if (path.includes('/tournament/') && path.includes('/dashboard')) {
      return {
        type: 'Tournament Management',
        description: 'Update scores, manage participants, edit tournament details'
      };
    }
    if (path.includes('/fantasy') && !path.includes('/create')) {
      return {
        type: 'Fantasy Dashboard',
        description: 'View leagues, set lineups, check scores and standings'
      };
    }
    if (path.includes('/fantasy/create')) {
      return {
        type: 'Fantasy League Creation',
        description: 'Configure league rules, draft settings, and scoring system'
      };
    }
    if (path.includes('/fantasy/lineup')) {
      return {
        type: 'Lineup Management',
        description: 'Set starting lineup, check player stats, manage roster'
      };
    }
    if (path.includes('/teams')) {
      return {
        type: 'Team Management',
        description: 'Manage roster, add players, configure team settings'
      };
    }
    if (path.includes('/budget')) {
      return {
        type: 'Budget Management',
        description: 'Plan budgets, track expenses, submit for approval'
      };
    }
    if (path.includes('/health') || path.includes('/athletic-trainer')) {
      return {
        type: 'Health Monitoring',
        description: 'Log injuries, track clearances, manage athlete health records'
      };
    }
    return {
      type: 'Platform Navigation',
      description: 'General platform features'
    };
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
        content: `Hi ${user?.firstName || 'there'}! 👋 I'm here to help with ${pageContext.type.toLowerCase()}. I can troubleshoot issues, explain features, or guide you to what you need. What can I help you with?`
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
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">BETA</span>
                </div>
              </div>
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

          {/* Beta Notice */}
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                I'm learning! As I grow in knowledge, I'll improve everyone's experience. Thanks for your patience.
              </p>
            </div>
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
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Common questions:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInput("My bracket won't generate")}
                  className="text-xs"
                  data-testid="quick-action-bracket-issue"
                >
                  Bracket issue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInput("Payment failed")}
                  className="text-xs"
                  data-testid="quick-action-payment-problem"
                >
                  Payment problem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInput("How do I add players?")}
                  className="text-xs"
                  data-testid="quick-action-add-players"
                >
                  Add players
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
                placeholder="Describe your issue..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
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
