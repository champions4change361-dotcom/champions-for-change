import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, MapPin, Trophy, Heart } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";

export default function ChampionsRegistration() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    teamName: '',
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    tournament: '',
    playerCount: '',
    schoolOrganization: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a success message
    alert('Registration submitted! We will contact you soon with tournament details.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900">
      {/* Header */}
      <header className="relative border-b border-green-500/20 bg-green-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              onClick={() => setLocation('/local-tournaments')}
              variant="ghost"
              className="text-green-300 hover:text-green-200"
            >
              ← Back to Tournaments
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Champions for Change</h1>
              <p className="text-xs text-green-300">Team Registration</p>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-green-600 text-white px-4 py-2">
              🏀 Register Your Team
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Join Champions for Change
              <span className="block text-green-300">Tournament Registration</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
              Register your team for our upcoming tournaments and help support educational opportunities for local youth.
            </p>
          </div>

          {/* Tournament Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-green-900/50 border-green-500/30 ring-2 ring-green-500/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600 text-white">Featured</Badge>
                  <Trophy className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-xl text-white">2nd Annual Hoops for History Capitol Classic</CardTitle>
                <CardDescription className="text-green-200">
                  Basketball tournament - March 2025 in Corpus Christi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
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
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-xl text-white">Future Tournaments</CardTitle>
                <CardDescription className="text-slate-300">
                  More events coming throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Track & Field meets, Swimming competitions, and additional basketball tournaments in development.
                </p>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <p className="text-green-200 text-sm">
                    <Heart className="inline h-4 w-4 mr-1" />
                    Every registration supports educational trips for local students
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="bg-slate-900/80 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Team Registration Form</CardTitle>
              <CardDescription className="text-slate-300">
                Fill out the form below to register your team for Champions for Change tournaments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Team Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Team Information</h3>
                    
                    <div>
                      <Label htmlFor="teamName" className="text-slate-300">Team Name *</Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Enter your team name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="tournament" className="text-slate-300">Tournament *</Label>
                      <Select value={formData.tournament} onValueChange={(value) => setFormData({...formData, tournament: value})}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select tournament" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hoops-for-history">2nd Annual Hoops for History Capitol Classic</SelectItem>
                          <SelectItem value="future-basketball">Future Basketball Tournament</SelectItem>
                          <SelectItem value="track-field">Track & Field Meet (Coming Soon)</SelectItem>
                          <SelectItem value="swimming">Swimming Competition (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="playerCount" className="text-slate-300">Number of Players</Label>
                      <Input
                        id="playerCount"
                        value={formData.playerCount}
                        onChange={(e) => setFormData({...formData, playerCount: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="e.g., 12"
                        type="number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="schoolOrganization" className="text-slate-300">School/Organization</Label>
                      <Input
                        id="schoolOrganization"
                        value={formData.schoolOrganization}
                        onChange={(e) => setFormData({...formData, schoolOrganization: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="School or organization name"
                      />
                    </div>
                  </div>

                  {/* Coach/Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Coach/Contact Information</h3>
                    
                    <div>
                      <Label htmlFor="coachName" className="text-slate-300">Coach Name *</Label>
                      <Input
                        id="coachName"
                        value={formData.coachName}
                        onChange={(e) => setFormData({...formData, coachName: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Coach's full name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="coachEmail" className="text-slate-300">Email Address *</Label>
                      <Input
                        id="coachEmail"
                        type="email"
                        value={formData.coachEmail}
                        onChange={(e) => setFormData({...formData, coachEmail: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="coach@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="coachPhone" className="text-slate-300">Phone Number</Label>
                      <Input
                        id="coachPhone"
                        type="tel"
                        value={formData.coachPhone}
                        onChange={(e) => setFormData({...formData, coachPhone: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-slate-300">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Any special requests or additional information..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-slate-600">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Submit Team Registration
                  </Button>
                  <p className="text-slate-400 text-sm text-center mt-3">
                    We will contact you within 48 hours with tournament details and next steps.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}