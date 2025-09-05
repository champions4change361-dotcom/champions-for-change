import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import TrantorCoin from "@/components/TrantorCoin";

export default function UnifiedLogin() {
  const [, setLocation] = useLocation();

  const handleOAuthLogin = () => {
    // Store the return URL for after authentication
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return') || urlParams.get('redirect') || '/tournaments';
    
    // Handle Champions registration redirect
    if (urlParams.get('redirect') === 'champions-registration') {
      sessionStorage.setItem('auth_return_url', '/champions-registration');
    } else {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }
    
    // Use Google OAuth (the only implemented provider)
    window.location.href = '/api/login';
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="text-white hover:text-yellow-300 p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/80 backdrop-blur-sm border-yellow-500/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <TrantorCoin size="lg" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-300">
                Sign in to access your tournaments
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* OAuth Login */}
            <div className="space-y-4">
              {/* Google Login */}
              <Button 
                onClick={handleOAuthLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base flex items-center justify-center"
                data-testid="button-login-google"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Email/Password Alternative */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Or use email</span>
                </div>
              </div>

              <Button 
                onClick={() => setLocation('/legacy-login')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 font-semibold py-3 text-base"
                data-testid="button-login-email"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign in with Email
              </Button>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center pt-2">
              <Badge variant="outline" className="border-green-400 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Enterprise Security
              </Badge>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-slate-400 pt-4">
              {new URLSearchParams(window.location.search).get('redirect') === 'champions-registration' ? (
                <>
                  Need to register as a team?{" "}
                  <button 
                    onClick={() => setLocation('/smart-signup?type=participant&redirect=champions-registration')}
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    Create Team Account
                  </button>
                </>
              ) : (
                <>
                  New to Trantor Tournaments?{" "}
                  <button 
                    onClick={() => setLocation('/smart-signup')}
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="text-center text-xs text-slate-500 mt-6">
          Your data is protected with enterprise-grade security
        </div>
      </div>
    </div>
  );
}