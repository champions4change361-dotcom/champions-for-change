import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { sessionManager, type AIMessage } from '@/lib/sessionManager';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Heart,
  Target,
  Paperclip,
  Copy,
  Check,
  Download
} from "lucide-react";

interface ConversationalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  conversation_state?: any;
}

interface ConversationalAIProps {
  domain?: 'education' | 'business' | 'coaches';
  className?: string;
}

export function ConversationalAI({ domain = 'education', className = '' }: ConversationalAIProps) {
  const [messages, setMessages] = useState<ConversationalMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant for Champions for Change. I can help you with tournament creation, budget planning, health monitoring, and district coordination.\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
      suggestions: [
        "Help me create a tournament",
        "Set up budget tracking",
        "Configure health monitoring",
        "Plan academic competitions"
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyConversation = async () => {
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(conversationText);
      setCopiedMessageId('conversation');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy conversation: ', err);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, just read text files and add content to input
    if (file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputMessage(prev => prev + (prev ? '\n\n' : '') + `[Attached file: ${file.name}]\n${content}`);
      };
      reader.readAsText(file);
    } else {
      setInputMessage(prev => prev + (prev ? '\n\n' : '') + `[Attached file: ${file.name}]`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: ConversationalMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Update session with conversation context
    try {
      sessionManager.addAIMessage({
        role: 'user',
        content: text,
        timestamp: Date.now(),
        metadata: { intent: 'conversational', extractedData: { domain } }
      });
    } catch (error) {
      console.log('Session manager error (non-critical):', error);
    }

    try {
      // Call our AI consultation endpoint with conversational context
      const response = await fetch('/api/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_history: messages,
          domain: domain,
          user_context: sessionManager.getSession(),
          consultation_type: 'conversational'
        })
      });

      const data = await response.json();
      console.log('AI Response received:', data); // Debug log
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if a tournament was created
      if (data.tournament_created && data.tournament) {
        console.log('🏆 Tournament created by AI:', data.tournament);
        
        // Notify about tournament creation (could trigger a tournament list refresh)
        try {
          window.dispatchEvent(new CustomEvent('tournamentCreated', { 
            detail: data.tournament 
          }));
        } catch (e) {
          console.log('Event dispatch error (non-critical):', e);
        }
      }

      // Add AI response
      const aiMessage: ConversationalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm here to help! Could you tell me more about what you're trying to accomplish?",
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        conversation_state: data.conversation_state
      };

      console.log('Adding AI message:', aiMessage); // Debug log
      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        console.log('New messages array:', newMessages); // Debug log
        return newMessages;
      });
      
      // Update session with AI response
      try {
        sessionManager.addAIMessage({
          role: 'assistant',
          content: aiMessage.content,
          timestamp: Date.now(),
          metadata: { intent: data.intent, extractedData: data.extracted_context, routingSuggestion: data.suggestions?.[0] }
        });

        // Extract any context from the conversation
        if (data.extracted_context) {
          sessionManager.updateUserContext(data.extracted_context);
        }
      } catch (error) {
        console.log('Session manager error (non-critical):', error);
      }

    } catch (error) {
      console.error('AI conversation error:', error);
      
      // Add fallback response
      const errorMessage: ConversationalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now, but I'm still here to help! While we get that sorted, I can guide you through our platform features. What specific area would you like to explore?",
        timestamp: new Date(),
        suggestions: [
          "Show me tournament creation",
          "Help with budget planning",
          "Explain health monitoring",
          "Academic competition setup"
        ]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }: { message: ConversationalMessage }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-blue-600' 
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}>
          {message.role === 'user' ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Brain className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className="relative">
          <div className={`rounded-2xl px-4 py-3 ${
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.suggestions.map((suggestion, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-green-500 hover:text-white transition-colors text-xs"
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Copy button for each message */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute -top-2 ${message.role === 'user' ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700`}
            onClick={() => copyToClipboard(message.content, message.id)}
            data-testid={`copy-message-${message.id}`}
          >
            {copiedMessageId === message.id ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-green-700 dark:text-green-400">AI Assistant</span>
              <div className="flex items-center space-x-1 mt-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-500">Champions for Change Platform</span>
              </div>
            </div>
          </CardTitle>
          
          {/* Header Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyConversation}
              className="h-8 px-2 hover:bg-green-50 dark:hover:bg-green-900/20"
              data-testid="button-copy-conversation"
              title="Copy entire conversation"
            >
              {copiedMessageId === 'conversation' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Download className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-0">
        <div className="flex-1 px-4 overflow-y-auto max-h-[500px]">
          <div className="space-y-4 pb-4 min-h-[200px]">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about tournaments, budgets, health monitoring, or district management..."
                className="flex-1 focus:ring-green-500 focus:border-green-500 pr-10"
                disabled={isLoading}
                data-testid="input-ai-message"
              />
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileAttachment}
                className="hidden"
                accept=".txt,.md,.json,.csv"
              />
              {/* Attachment button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                data-testid="button-attach-file"
                title="Attach file (txt, md, json, csv)"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span>Powered by Champions for Change</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConversationalAI;