import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import TrantorCoin from "@/components/TrantorCoin";

export default function UnifiedLogin() {
  const [, setLocation] = useLocation();

  const handleGoogleLogin = () => {
    // Redirect to Replit OAuth which includes Google login
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
            {/* Primary Login Option - Google/Replit OAuth */}
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-semibold py-3 text-base"
              data-testid="button-login-google"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>

            {/* Status Badge */}
            <div className="flex justify-center pt-4">
              <Badge variant="outline" className="border-green-400 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Secure Login Active
              </Badge>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-slate-400 pt-4">
              New to Trantor Tournaments?{" "}
              <button 
                onClick={() => setLocation('/smart-signup')}
                className="text-yellow-300 hover:text-yellow-200 underline"
              >
                Create account
              </button>
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