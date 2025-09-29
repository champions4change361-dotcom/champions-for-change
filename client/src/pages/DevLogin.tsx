import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function DevLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: 'Developer',
    last_name: 'Test',
    email: 'developer@test.com'
  });

  const handleDevLogin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const params = new URLSearchParams({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });
      
      const response = await fetch(`/api/dev-login?${params}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        // Wait a moment then redirect to home
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Dev login failed:', error);
      setResult({ error: 'Login failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        credentials: 'include'
      });
      setResult({ message: 'Logged out successfully' });
      // Redirect to home after logout
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Development Login</CardTitle>
            <CardDescription className="text-center">
              Test authentication in development mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                data-testid="input-first-name"
              />
            </div>
            
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                data-testid="input-last-name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                data-testid="input-email"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleDevLogin} 
                disabled={isLoading}
                className="flex-1"
                data-testid="button-dev-login"
              >
                {isLoading ? 'Logging in...' : 'Dev Login'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
            
            <Button 
              variant="secondary"
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-home"
            >
              Go to Home
            </Button>
            
            {result && (
              <div className="mt-4 p-3 rounded-lg bg-gray-100">
                <pre className="text-xs overflow-auto" data-testid="result-display">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}