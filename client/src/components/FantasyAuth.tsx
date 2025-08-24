import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Trophy, Users, AlertTriangle } from "lucide-react";

interface FantasyAuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: any) => void;
}

export function FantasyAuth({ open, onOpenChange, onAuthSuccess }: FantasyAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOver21, setIsOver21] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isLogin && !isOver21) {
      alert("You must be 21 or older to create fantasy sports leagues.");
      return;
    }
    
    if (!isLogin && !agreedToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate fantasy user creation/login
      const fantasyUser = {
        id: `fantasy-${Date.now()}`,
        email,
        isFantasyUser: true,
        ageVerified: isOver21,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for now (in real app, use proper auth)
      localStorage.setItem("fantasyUser", JSON.stringify(fantasyUser));
      
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(fantasyUser);
        onOpenChange(false);
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsOver21(false);
        setAgreedToTerms(false);
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-green-600" />
            <span>{isLogin ? "Fantasy Sports Login" : "Create Fantasy Account"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isLogin && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-orange-800 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Age Verification Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-orange-700">
                  🔞 Fantasy sports with real money prizes require participants to be 21+ years old.
                </p>
              </CardContent>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-fantasy-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-fantasy-password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-fantasy-confirm-password"
              />
            </div>
          )}

          {!isLogin && (
            <>
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50">
                <Checkbox 
                  id="age-verification"
                  checked={isOver21}
                  onCheckedChange={(checked) => setIsOver21(checked === true)}
                  data-testid="checkbox-age-verification"
                />
                <div>
                  <label htmlFor="age-verification" className="text-sm font-medium text-green-800">
                    ✅ I am 21 years of age or older
                  </label>
                  <p className="text-xs text-green-600 mt-1">
                    Required for participation in fantasy sports with monetary prizes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  id="terms-agreement"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  data-testid="checkbox-terms"
                />
                <div>
                  <label htmlFor="terms-agreement" className="text-sm font-medium">
                    I agree to the Terms & Conditions
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Fantasy sports rules, fair play policies, and prize distribution terms
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isLoading}
              data-testid="button-fantasy-auth"
            >
              {isLoading ? "Processing..." : isLogin ? "Login" : "Create Account"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                // Reset form when switching
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setIsOver21(false);
                setAgreedToTerms(false);
              }}
              className="text-sm text-blue-600 hover:underline"
              data-testid="button-switch-auth-mode"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Why We Verify Age</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Legal compliance for monetary fantasy sports</li>
              <li>• Industry standard for sports betting platforms</li>
              <li>• Protects both users and platform operators</li>
              <li>• Required in most US jurisdictions</li>
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}