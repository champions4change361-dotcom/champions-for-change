import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import TrantorCoin from "@/components/TrantorCoin";

export default function UnifiedLogin() {
  const [, setLocation] = useLocation();

  const handleOAuthLogin = (provider: string) => {
    // Store the return URL for after authentication
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return') || urlParams.get('redirect') || '/tournaments';
    
    // Handle Champions registration redirect
    if (urlParams.get('redirect') === 'champions-registration') {
      sessionStorage.setItem('auth_return_url', '/champions-registration');
    } else {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }
    
    // For mobile compatibility, use a more explicit redirect
    if (provider === 'google') {
      window.location.href = '/api/login?provider=google';
    } else if (provider === 'apple') {
      window.location.href = '/api/login?provider=apple';
    } else if (provider === 'microsoft') {
      window.location.href = '/api/login?provider=microsoft';
    } else {
      // Default to main OAuth endpoint
      window.location.href = '/api/login';
    }
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
            {/* Multiple OAuth Options */}
            <div className="space-y-3">
              {/* Google Login */}
              <Button 
                onClick={() => handleOAuthLogin('google')}
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

              {/* Apple Login */}
              <Button 
                onClick={() => handleOAuthLogin('apple')}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 text-base flex items-center justify-center"
                data-testid="button-login-apple"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.037-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                Continue with Apple
              </Button>

              {/* Microsoft Login */}
              <Button 
                onClick={() => handleOAuthLogin('microsoft')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 text-base flex items-center justify-center"
                data-testid="button-login-microsoft"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continue with Microsoft
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Secure Authentication</span>
                </div>
              </div>
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