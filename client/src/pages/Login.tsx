import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'team'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Frontend form data:', formData);

    try {
      // Send login request to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Login Successful",
          description: "Welcome to Champions for Change!",
        });
        
        // Redirect based on user type and role
        if (result.user.role === 'district_athletic_director' || result.user.email === 'champions4change361@gmail.com') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        const error = await response.json();
        console.log('Login error response:', error);
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Unable to connect to authentication service",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 lg:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Champions for Change</h1>
              <p className="text-sm sm:text-lg text-slate-600">Tournament Platform Login</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Secure Access Portal
          </Badge>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="text-center space-y-2 p-4 lg:p-6">
            <CardTitle className="text-xl lg:text-2xl text-slate-900">Platform Access</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Choose your platform type and enter credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <Label htmlFor="userType">Platform Type</Label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  data-testid="select-usertype"
                >
                  <option value="team">Team Management</option>
                  <option value="organizer">Tournament Organizer</option>
                </select>
              </div>

              {/* Email Input */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                  data-testid="input-email"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  data-testid="input-password"
                />
              </div>

              {/* Master Admin Info with Auto-Fill Button */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Master Admin Access</span>
                </div>
                <p className="text-xs text-blue-700 mb-2">
                  Champions4change361@gmail.com / master-admin-danielthornton
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    email: 'champions4change361@gmail.com',
                    password: 'master-admin-danielthornton',
                    userType: 'team'
                  })}
                  className="text-xs"
                  data-testid="button-autofill"
                >
                  Auto-fill Credentials
                </Button>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Platform
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-slate-600">
          <p>Need help accessing your account?</p>
          <p className="text-blue-600">Contact your district administrator</p>
        </div>
      </div>
    </div>
  );
}