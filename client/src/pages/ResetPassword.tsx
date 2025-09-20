import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [token, setToken] = useState('');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Extract token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      setIsValidToken(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive"
      });
    } else {
      setToken(resetToken);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation('/legacy-login');
        }, 3000);
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.message || "Unable to reset password. The link may have expired.",
          variant: "destructive"
        });
        
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setIsValidToken(false);
        }
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-2 border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Password reset links expire after 1 hour for security reasons.
              </p>
              
              <div className="space-y-2">
                <Link href="/forgot-password">
                  <Button className="w-full" data-testid="button-request-new-link">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/legacy-login">
                  <Button variant="ghost" className="w-full" data-testid="button-back-to-login">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-2 border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Password Reset Complete!</CardTitle>
              <CardDescription>
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You can now sign in with your new password. You'll be redirected to the login page in a moment.
              </p>
              
              <Link href="/legacy-login">
                <Button className="w-full" data-testid="button-go-to-login">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Login */}
        <Link href="/legacy-login">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </Link>

        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  data-testid="input-password"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-reset-password"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}