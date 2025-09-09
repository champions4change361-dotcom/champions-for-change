import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Users, Trophy, Zap, ArrowRight, CheckCircle, 
  Calendar, Target, Sparkles, Clock, Settings
} from "lucide-react";

export default function TournamentOnboarding() {
  const [, setLocation] = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto p-6 pt-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-600 text-white px-4 py-2">
            🎉 Welcome to Tournament Management
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How would you like to start?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your preferred approach - both paths lead to the same powerful tournament system.
            You can always switch between them as you build your event.
          </p>
        </div>

        {/* Two Main Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Registration First Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 border-2 ${
              hoveredCard === 'registration' 
                ? 'border-blue-500 shadow-xl scale-105' 
                : 'border-gray-200 shadow-lg hover:shadow-xl hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredCard('registration')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setLocation('/create-registration')}
            data-testid="option-registration-first"
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Start with Registration</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Perfect if you want to start collecting teams or players right away
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Immediate Action</p>
                    <p className="text-sm text-gray-600">Start collecting participants today</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Flexible Structure</p>
                    <p className="text-sm text-gray-600">Build tournament format based on actual signup numbers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Smart Suggestions</p>
                    <p className="text-sm text-gray-600">We'll recommend optimal bracket formats as teams register</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Best for:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• First-time tournament organizers</li>
                  <li>• Uncertain about final team count</li>
                  <li>• Want to start promoting immediately</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLocation('/create-tournament?flow=registration')}
                data-testid="start-registration-flow"
              >
                <Users className="mr-2 h-4 w-4" />
                Start with Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Bracket First Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 border-2 ${
              hoveredCard === 'bracket' 
                ? 'border-orange-500 shadow-xl scale-105' 
                : 'border-gray-200 shadow-lg hover:shadow-xl hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredCard('bracket')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setLocation('/create-bracket')}
            data-testid="option-bracket-first"
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
                <Trophy className="h-12 w-12 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Design Bracket First</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Perfect if you know your tournament format and structure
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Professional Structure</p>
                    <p className="text-sm text-gray-600">Choose from proven tournament formats</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Clear Capacity</p>
                    <p className="text-sm text-gray-600">Set exact registration limits and bracket slots</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Live Population</p>
                    <p className="text-sm text-gray-600">Watch your bracket fill as teams register</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">Best for:</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Experienced tournament organizers</li>
                  <li>• Fixed team/player counts</li>
                  <li>• Specific competition formats</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setLocation('/create-tournament?flow=bracket')}
                data-testid="start-bracket-flow"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Design Bracket First
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Flow Integration Explanation */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-xl">
          <div className="text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Seamless Integration</h3>
            <p className="text-lg text-green-100 max-w-3xl mx-auto mb-6">
              No matter which path you choose, registration and brackets work together automatically. 
              Teams flow into brackets, brackets set registration limits, and everything updates in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-300" />
                <p className="font-medium">Real-time Updates</p>
                <p className="text-sm text-green-200">Changes sync instantly</p>
              </div>
              <div className="text-center">
                <Settings className="h-6 w-6 mx-auto mb-2 text-blue-300" />
                <p className="font-medium">Full Control</p>
                <p className="text-sm text-blue-200">Adjust anything, anytime</p>
              </div>
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-orange-300" />
                <p className="font-medium">Professional Results</p>
                <p className="text-sm text-orange-200">Enterprise-grade tournaments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Examples */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Tournament Setups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation('/create-tournament?flow=bracket&preset=single32')}>
              <CardContent className="p-4">
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium">32-Team Single Elimination</p>
                <p className="text-sm text-gray-600">Classic tournament bracket</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation('/create-tournament?flow=registration&preset=leagues')}>
              <CardContent className="p-4">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">League Play</p>
                <p className="text-sm text-gray-600">Round-robin format</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation('/create-tournament?flow=bracket&preset=double16')}>
              <CardContent className="p-4">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">16-Team Double Elimination</p>
                <p className="text-sm text-gray-600">Championship with bracket reset</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}