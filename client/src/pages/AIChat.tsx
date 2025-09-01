import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, MessageSquare, Bot, Sparkles } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import ConversationalAI from '@/components/ConversationalAI';
import UserMenu from "@/components/UserMenu";

export default function AIChat() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Back to Platform</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-xs text-green-600 dark:text-green-400">Champions for Change</p>
              </div>
            </div>
            
            {user && <UserMenu variant="compact" showUserInfo={false} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            <span>AI-Powered Platform Assistant</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Chat with Your AI Assistant
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get personalized help with tournament creation, budget management, health monitoring, 
            and district coordination. Just ask naturally - like you're talking to a knowledgeable colleague.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Natural Conversations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask questions naturally, like "Help me create a track meet for 200 students"
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Context</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remembers your conversation and adapts recommendations to your specific needs
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Actionable Suggestions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get specific next steps and clickable suggestions to guide your workflow
            </p>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-green-200 dark:border-gray-700 overflow-hidden">
          <ConversationalAI 
            domain={user?.subscriptionPlan?.includes('District') ? 'education' : 'coaches'}
            className="border-0 shadow-none rounded-none h-[700px]"
          />
        </div>

      </main>
    </div>
  );
}