import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Settings as SettingsIcon, Shield, Crown, Palette, Globe, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from "@/hooks/useAuth";
import { AccountLinking } from "@/components/AccountLinking";
import { CrossPlatformPromotion } from "@/components/CrossPlatformPromotion";

export default function Settings() {
  const { user } = useAuth();

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
                  <h1 className="text-xl font-bold text-white">Champions Arena</h1>
                  <p className="text-xs text-yellow-400">Tournament Central</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SettingsIcon className="h-4 w-4" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-xl text-slate-300">
            Configure your Champions for Change tournament platform
          </p>
        </div>

        {/* Account Overview */}
        <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center relative">
              <span className="text-slate-900 font-bold text-xl">
                {(user?.firstName?.[0] || 'D')}
              </span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName || 'Daniel'} {user?.lastName || 'Thornton'}
              </h2>
              <p className="text-yellow-400 font-medium">Platform Owner • Champions for Change</p>
              <p className="text-slate-400">{user?.email || 'champions4change361@gmail.com'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">Subscription Plan</div>
              <div className="text-yellow-400 font-semibold">
                {user?.subscriptionPlan === 'district_enterprise' ? 'District Enterprise' : 'Enterprise'}
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">Organization</div>
              <div className="text-white font-semibold">Champions for Change</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">Domain</div>
              <div className="text-emerald-400 font-semibold">trantortournaments.org</div>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Platform Branding */}
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Platform Branding</h3>
                <p className="text-slate-400 text-sm">Customize Champions for Change theme</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Primary Color</span>
                <div className="w-6 h-6 bg-emerald-500 rounded border border-slate-600"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Secondary Color</span>
                <div className="w-6 h-6 bg-blue-500 rounded border border-slate-600"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Logo</span>
                <span className="text-emerald-400 text-sm">Champions for Change</span>
              </div>
            </div>
          </div>

          {/* Domain Management */}
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Domain Settings</h3>
                <p className="text-slate-400 text-sm">Manage your custom domain</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Primary Domain</span>
                <span className="text-emerald-400 text-sm">trantortournaments.org</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">SSL Certificate</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">CDN Status</span>
                <span className="text-green-400 text-sm">✓ Enabled</span>
              </div>
            </div>
          </div>

          {/* Payment Processing */}
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Payment Processing</h3>
                <p className="text-slate-400 text-sm">Stripe integration for Champions for Change</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Stripe Account</span>
                <span className="text-green-400 text-sm">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Live Payments</span>
                <span className="text-green-400 text-sm">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Revenue Share</span>
                <span className="text-emerald-400 text-sm">100% to Education</span>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Security & Access</h3>
                <p className="text-slate-400 text-sm">Platform security settings</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Two-Factor Auth</span>
                <span className="text-green-400 text-sm">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Session Timeout</span>
                <span className="text-slate-400 text-sm">24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Access</span>
                <span className="text-green-400 text-sm">✓ Full Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Impact Settings */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>Champions for Change Configuration</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Student Trip Fund Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Cost per Student Trip</span>
                  <span className="text-emerald-400 font-semibold">$2,600</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Revenue Allocation</span>
                  <span className="text-emerald-400 font-semibold">100% Education</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Auto Fund Transfer</span>
                  <span className="text-green-400 font-semibold">✓ Enabled</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Mission Integration</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Impact Tracking</span>
                  <span className="text-green-400 font-semibold">✓ Active</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Student Reports</span>
                  <span className="text-green-400 font-semibold">✓ Monthly</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300">Tax Receipts</span>
                  <span className="text-green-400 font-semibold">✓ Automatic</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Linking Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Platform Access</CardTitle>
              <CardDescription>Link your account to access other Champions for Change platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountLinking />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar Promotion */}
        <div className="mt-8">
          <CrossPlatformPromotion placement="sidebar" />
        </div>
      </main>
    </div>
  );
}