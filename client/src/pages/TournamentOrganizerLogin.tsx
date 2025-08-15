import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target, BarChart3, Users, Calendar } from "lucide-react";

export default function TournamentOrganizerLogin() {
  const handleLogin = () => {
    window.location.href = "/api/login?user_type=organizer";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Trophy className="h-12 w-12 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Tournament Pro</h1>
              <p className="text-lg text-slate-600">Professional Tournament Management</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Jersey Watch + Challonge Combined
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl text-slate-900">Tournament Organizer Access</CardTitle>
            <CardDescription className="text-lg">
              Complete tournament management with season-long player tracking and advanced analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Season-Long Tracking</h4>
                  <p className="text-sm text-slate-600">Better than Jersey Watch</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Advanced Brackets</h4>
                  <p className="text-sm text-slate-600">Better than Challonge</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Professional Analytics</h4>
                  <p className="text-sm text-slate-600">Sponsor reports</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Player Intelligence</h4>
                  <p className="text-sm text-slate-600">Historical performance</p>
                </div>
              </div>
            </div>

            {/* Competitive Advantage */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-slate-900">Complete Tournament Solution</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">Jersey Watch Limited:</p>
                  <p className="text-slate-600">Game-day snapshots only</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Our Advantage:</p>
                  <p className="text-slate-600">Season-long tracking</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Challonge Limited:</p>
                  <p className="text-slate-600">Basic bracket management</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Our Advantage:</p>
                  <p className="text-slate-600">Professional analytics</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 mb-2">Competitive Pricing</h4>
                <div className="flex justify-center space-x-6 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">Monthly</p>
                    <p className="text-2xl font-bold text-green-600">$39</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Annual</p>
                    <p className="text-2xl font-bold text-green-600">$399</p>
                    <p className="text-xs text-green-700">Save $69 (2 months free)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
              data-testid="button-organizer-login"
            >
              Start Managing Tournaments
            </Button>

            {/* Use Cases */}
            <div className="text-center text-sm text-slate-600">
              <p className="mb-2">Perfect for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Youth Sports Leagues</Badge>
                <Badge variant="outline">Tournament Operators</Badge>
                <Badge variant="outline">Event Coordinators</Badge>
                <Badge variant="outline">Sports Complexes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>Professional Tournament Management • Better Than Jersey Watch + Challonge</p>
        </div>
      </div>
    </div>
  );
}