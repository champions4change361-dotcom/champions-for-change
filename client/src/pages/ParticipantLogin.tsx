import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, Users, ArrowRight, UserPlus, LogIn, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ParticipantLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-full shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Champions for Change</h1>
              <p className="text-green-200">Supporting Educational Opportunities</p>
            </div>
          </div>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Join our tournaments, support our mission, and help provide educational opportunities for underprivileged youth
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tournament Registration */}
          <Card className="border-2 border-green-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/95">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <Trophy className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-900">Join a Tournament</CardTitle>
              <CardDescription className="text-lg text-green-700">
                Register for upcoming basketball tournaments and competitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">3v3 & 5v5 Basketball Tournaments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Texas Coastal Bend Region</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">All Ages & Skill Levels Welcome</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Quick Online Registration</span>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Every Entry Supports Education
                  </Badge>
                  <p className="text-xs text-green-700 mt-1">Funds go directly to student opportunities</p>
                </div>
              </div>

              <Link href="/tournament-calendar">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6" data-testid="button-join-tournament">
                  View Tournaments & Register
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500">
                Create account during registration or sign in if you have one
              </div>
            </CardContent>
          </Card>

          {/* Donation Support */}
          <Card className="border-2 border-emerald-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/95">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <Heart className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-emerald-900">Support Our Mission</CardTitle>
              <CardDescription className="text-lg text-emerald-700">
                Donate to provide educational opportunities for underprivileged youth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Impact */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Fund Student Educational Trips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Support Academic Competitions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Provide Learning Resources</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Create Account for Future Donations</span>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    $2,600+ Per Student Trip
                  </Badge>
                  <p className="text-xs text-emerald-700 mt-1">100% goes to educational programs</p>
                </div>
              </div>

              <Link href="/donate">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6" data-testid="button-donate">
                  Donate Now
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500">
                One-time or create account for easy future donations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Account Login */}
        <Card className="border border-green-200/50 bg-white/90">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-3">
                <LogIn className="h-6 w-6 text-green-600" />
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-green-900">Already have an account?</h3>
                  <p className="text-green-700 text-sm">Sign in to access your tournament registrations and donation history</p>
                </div>
              </div>
              <Link href="/legacy-login">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" data-testid="button-existing-login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Organization Access */}
        <div className="text-center">
          <p className="text-green-200 text-sm">
            Looking for organizational or tournament management access?{" "}
            <Link href="/login-portal" className="text-green-300 hover:text-white underline">
              Visit our organizational portal
            </Link>
          </p>
        </div>

        {/* Mission Statement Footer */}
        <div className="text-center space-y-2">
          <p className="text-green-100 text-lg font-medium">
            Every tournament entry and donation directly supports educational opportunities for underprivileged youth
          </p>
          <p className="text-sm text-green-300">
            Champions for Change • Building futures through sports and education
          </p>
        </div>
      </div>
    </div>
  );
}