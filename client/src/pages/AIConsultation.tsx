import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, MessageCircle, Send, Bot } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIConsultation() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          })),
          domain: 'tournament_creation',
          user_context: {
            subscription_level: user?.subscriptionPlan || 'free'
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI conversation error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble right now. Could you try asking your question again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Trophy className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                  <p className="text-xs text-yellow-400">AI Tournament Assistant</p>
                </div>
              </Link>
            </div>
            
            <Link href="/" className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Bot className="h-4 w-4" />
            <span>AI Tournament Assistant</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Tournament Expert AI</h1>
          <p className="text-xl text-slate-300">
            Ask me anything about creating tournaments, managing competitions, or building your athletic program!
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-slate-800 border border-slate-600 rounded-2xl p-6 mb-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 mt-20">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-sm">Ask me about tournaments, sports management, or any athletic program needs!</p>
              <div className="mt-6 space-y-2 text-sm">
                <p className="bg-slate-700 px-4 py-2 rounded-lg">💡 "I need a 26 team double elimination tournament"</p>
                <p className="bg-slate-700 px-4 py-2 rounded-lg">💡 "How do I set up a basketball bracket?"</p>
                <p className="bg-slate-700 px-4 py-2 rounded-lg">💡 "Create a swimming meet with timing events"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-slate-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4">
          <div className="flex space-x-4">
            <textarea
              data-testid="input-ai-message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about tournaments, sports, or athletic programs..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              data-testid="button-send-message"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}