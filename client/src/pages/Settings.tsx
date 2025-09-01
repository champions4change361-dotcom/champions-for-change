import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Settings as SettingsIcon, Shield, Crown, Palette, Globe, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from "@/hooks/useAuth";
import { AccountLinking } from "@/components/AccountLinking";
import { CrossPlatformPromotion } from "@/components/CrossPlatformPromotion";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function Settings() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout
      title="Settings"
      subtitle="Champions for Change"
      variant="default"
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
        <div className="text-center mb-8 px-4 sm:px-0">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SettingsIcon className="h-4 w-4" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-lg sm:text-xl text-slate-100 leading-relaxed max-w-2xl mx-auto">
            Configure your Champions for Change tournament platform
          </p>
        </div>

        {/* Account Overview */}
        <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 mx-2 sm:mx-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center relative flex-shrink-0">
              <span className="text-slate-900 font-bold text-xl">
                {(user?.firstName?.[0] || 'D')}
              </span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {user?.firstName || 'Daniel'} {user?.lastName || 'Thornton'}
              </h2>
              <p className="text-yellow-400 font-medium mb-1">Platform Owner • Champions for Change</p>
              <p className="text-slate-200 text-sm">{user?.email || 'champions4change361@gmail.com'}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 mx-2 sm:mx-0">
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
                <span className="text-slate-100">Primary Color</span>
                <div className="w-6 h-6 bg-emerald-500 rounded border border-slate-600"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">Secondary Color</span>
                <div className="w-6 h-6 bg-blue-500 rounded border border-slate-600"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">Logo</span>
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
                <span className="text-slate-100">Primary Domain</span>
                <span className="text-emerald-400 text-sm">trantortournaments.org</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">SSL Certificate</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">CDN Status</span>
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
                <span className="text-slate-100">Stripe Account</span>
                <span className="text-green-400 text-sm">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">Live Payments</span>
                <span className="text-green-400 text-sm">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">Revenue Share</span>
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
                <span className="text-slate-100">Two-Factor Auth</span>
                <span className="text-green-400 text-sm">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">Session Timeout</span>
                <span className="text-slate-200 text-sm">24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-100">API Access</span>
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
                  <span className="text-slate-100">Cost per Student Trip</span>
                  <span className="text-emerald-400 font-semibold">$2,600</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-100">Revenue Allocation</span>
                  <span className="text-emerald-400 font-semibold">100% Education</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-100">Auto Fund Transfer</span>
                  <span className="text-green-400 font-semibold">✓ Enabled</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Mission Integration</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-100">Impact Tracking</span>
                  <span className="text-green-400 font-semibold">✓ Active</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-100">Student Reports</span>
                  <span className="text-green-400 font-semibold">✓ Monthly</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-100">Tax Receipts</span>
                  <span className="text-green-400 font-semibold">✓ Automatic</span>
                </div>
              </div>
            </div>
          </div>
          
            {/* Account Linking Section */}
          <div className="md:col-span-2 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Access</CardTitle>
                <CardDescription className="text-slate-100">Link your account to access other Champions for Change platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountLinking />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Sidebar Promotion */}
        <div className="mt-8">
          <CrossPlatformPromotion placement="sidebar" />
        </div>
    </AuthenticatedLayout>
  );
}