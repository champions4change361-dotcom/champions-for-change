import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickLogin = async (userType: 'district' | 'organizer' | 'business' = 'district') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'champions4change361@gmail.com',
          password: 'master-admin-danielthornton',
          userType
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        
        // Redirect to dashboard instead of reload
        window.location.href = '/role-based-dashboards';
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Quick Admin Login (Testing)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => quickLogin('district')}
            disabled={isLoading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-xs"
            data-testid="button-quick-login-district"
          >
            <User className="h-3 w-3 mr-1" />
            {isLoading ? "Logging in..." : "Login as District Admin"}
          </Button>
          
          <Button
            onClick={() => quickLogin('organizer')}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="text-xs"
            data-testid="button-quick-login-organizer"
          >
            Login as Organizer
          </Button>
          
          <Button
            onClick={() => quickLogin('business')}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="text-xs"
            data-testid="button-quick-login-business"
          >
            Login as Business
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Use this to authenticate and test user creation features
        </p>
      </CardContent>
    </Card>
  );
}