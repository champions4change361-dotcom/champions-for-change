import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import React from "react";

export default function LocalTournaments() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-yellow-300 hover:text-yellow-200"
            >
              ← Back to Home
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Champions for Change</h1>
              <p className="text-xs text-yellow-300">Local Tournament Registration</p>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-green-600 text-white px-4 py-2">
              🏀 Supporting Local Youth Sports
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Champions for Change
              <span className="block text-green-300">Local Tournaments</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
              Join our local tournaments and help fund educational opportunities for underprivileged youth. 
              Every registration supports our mission to send kids on educational trips and experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Tournaments */}
      <div className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Upcoming Tournaments</h2>
            <p className="text-slate-300">Register now for our upcoming events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Hoops for History Tournament */}
            <Card className="bg-slate-900/80 border-green-500/30 ring-2 ring-green-500/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600 text-white">Featured</Badge>
                  <Trophy className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-xl text-white">2nd Annual Hoops for History Capitol Classic</CardTitle>
                <CardDescription className="text-slate-300">
                  Basketball tournament supporting educational field trips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-green-400" />
                  <span>March 2025</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <MapPin className="h-4 w-4 mr-2 text-green-400" />
                  <span>Corpus Christi, Texas</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Users className="h-4 w-4 mr-2 text-green-400" />
                  <span>16 Teams Maximum</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                  <span>Registration Fee TBD</span>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setLocation('/login?redirect=champions-registration')}
                >
                  Register Your Team
                </Button>
              </CardContent>
            </Card>

            {/* Placeholder for future tournaments */}
            <Card className="bg-slate-900/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-xl text-white">More Tournaments Coming Soon!</CardTitle>
                <CardDescription className="text-slate-300">
                  We're planning additional tournaments throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Track & Field meets, Swimming competitions, and more basketball tournaments are in development.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => setLocation('/login?redirect=champions-registration')}
                >
                  Get Notified
                </Button>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-xl text-white">Our Mission</CardTitle>
                <CardDescription className="text-green-200">
                  Every tournament entry supports local students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  100% of tournament proceeds fund educational trips, museum visits, and enrichment activities for underprivileged youth in our community.
                </p>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <p className="text-green-200 text-sm font-semibold">
                    Impact: 25+ students funded for educational experiences in 2024
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-green-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-slate-200 mb-8">
            Join our tournaments and help us create opportunities for local youth to explore, learn, and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setLocation('/login?redirect=champions-registration')}
            >
              Register for Hoops for History
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-green-500 text-green-300 hover:bg-green-600 hover:text-white"
              onClick={() => setLocation('/')}
            >
              Learn About Our Mission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}