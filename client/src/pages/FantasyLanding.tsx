import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Target, ArrowRight, Football } from "lucide-react";
import { Link } from "wouter";

export default function FantasyLanding() {
  const [email, setEmail] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Football className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              NFL Survivor Pool
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Pick one NFL team each week to win. Last person standing wins the prize pool!
            </p>
            
            {!showSignup ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowSignup(true)}
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg"
                  data-testid="button-join-pool"
                >
                  Join a Survivor Pool
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-green-200">
                  <p>or</p>
                </div>
                <Link href="/fantasy/create-league">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-green-300 text-green-100 hover:bg-green-800 px-8 py-4 text-lg"
                    data-testid="button-create-league"
                  >
                    Create Your Own League
                  </Button>
                </Link>
              </div>
            ) : (
              <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-900">Join the Action!</CardTitle>
                  <CardDescription>Enter your email to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    type="email" 
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-continue"
                  >
                    Continue to Leagues
                  </Button>
                  <p className="text-xs text-gray-600 text-center">
                    No spam, just weekly picks and results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How NFL Survivor Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pick One Team</h3>
              <p className="text-gray-600">
                Each week, pick one NFL team you think will win. You can only use each team once all season.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Survive Each Week</h3>
              <p className="text-gray-600">
                If your team loses, you're eliminated. Last person standing wins the entire prize pool.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Win Big</h3>
              <p className="text-gray-600">
                Winner takes all! Entry fees create the prize pool. Some leagues have side prizes too.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Leagues */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Active Leagues
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample leagues - these would come from API */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Office Champions</CardTitle>
                    <CardDescription>$25 entry • 24 players</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">$600</div>
                    <div className="text-sm text-gray-500">prize pool</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Week 12</span>
                    <span className="text-emerald-600">8 survivors left</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-1/3"></div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" data-testid="button-join-office">
                  Join League
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">High Rollers</CardTitle>
                    <CardDescription>$100 entry • 12 players</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">$1,200</div>
                    <div className="text-sm text-gray-500">prize pool</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Week 12</span>
                    <span className="text-red-600">3 survivors left</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full w-1/4"></div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" data-testid="button-join-high-rollers">
                  Join League
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Friends & Family</CardTitle>
                    <CardDescription>$10 entry • 18 players</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">$180</div>
                    <div className="text-sm text-gray-500">prize pool</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Week 12</span>
                    <span className="text-emerald-600">12 survivors left</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-2/3"></div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" data-testid="button-join-friends">
                  Join League
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/fantasy/create-league">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-create-own">
                Create Your Own League
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-8 mb-4">
            <Link href="/fantasy/rules" className="hover:text-emerald-400">Rules</Link>
            <Link href="/fantasy/help" className="hover:text-emerald-400">Help</Link>
            <Link href="/fantasy/about" className="hover:text-emerald-400">About</Link>
          </div>
          <p className="text-gray-400">
            NFL Survivor Pool • Simple, Fun, Fair
          </p>
        </div>
      </footer>
    </div>
  );
}