import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Calendar, Users, MapPin, DollarSign, CheckCircle, ArrowRight, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MissionBranding } from '@/components/MissionBranding';
import { useAuth } from '@/hooks/useAuth';
import { useTournamentPreview } from '@/hooks/useTournamentPreview';
import TournamentPreviewBanner from '@/components/TournamentPreviewBanner';
import TournamentSmartPrompt from '@/components/TournamentSmartPrompt';

export default function TournamentDesign() {
  const [step, setStep] = useState(1);
  const { isAuthenticated } = useAuth();
  const { 
    isPreviewMode, 
    savePreviewData, 
    markSectionCompleted 
  } = useTournamentPreview();
  const [tournament, setTournament] = useState({
    name: '',
    sport: '',
    format: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    entryFee: '',
    description: '',
    prizes: '',
    mission: '',
    branding: null
  });

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf',
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country',
    'Wrestling', 'Other'
  ];

  const formats = [
    { value: 'single_elimination', name: 'Single Elimination', description: 'Traditional bracket - lose and you\'re out' },
    { value: 'double_elimination', name: 'Double Elimination', description: 'Second chance bracket for eliminated teams' },
    { value: 'round_robin', name: 'Round Robin', description: 'Everyone plays everyone' },
    { value: 'swiss', name: 'Swiss System', description: 'Multiple rounds with pairing based on performance' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setTournament(prev => ({ ...prev, [field]: value }));
  };

  const generateTournament = () => {
    // This would integrate with your tournament creation system
    console.log('Creating tournament:', tournament);
    setStep(3); // Success step
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <Card className="max-w-2xl mx-auto" data-testid="tournament-created">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Tournament Created!</CardTitle>
            <CardDescription>
              {tournament.name} is ready to accept registrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-900">Tournament Name</Label>
                <p className="text-lg font-semibold text-gray-800">{tournament.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-900">Sport & Format</Label>
                <p className="text-lg font-semibold text-gray-800">{tournament.sport} - {formats.find(f => f.value === tournament.format)?.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-900">Date Range</Label>
                <p className="text-lg font-semibold text-gray-800">{tournament.startDate} to {tournament.endDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-900">Max Participants</Label>
                <p className="text-lg font-semibold text-gray-800">{tournament.maxParticipants} teams/individuals</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Educational Impact
              </h4>
              <p className="text-green-700 text-sm">
                This tournament will help fund educational trips for underprivileged students in Corpus Christi, Texas. 
                Every registration fee contributes directly to our $2,600+ student trip funding goal.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                data-testid="button-create-another"
              >
                Create Another Tournament
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/dashboard'}
                data-testid="button-manage-tournaments"
              >
                Manage Tournaments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      {/* Tournament Preview Banner */}
      {isPreviewMode && <TournamentPreviewBanner />}
      {/* Smart Prompts for Preview Mode */}
      {isPreviewMode && <TournamentSmartPrompt />}
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-green-600" />
            Tournament Designer
          </h1>
          <p className="text-gray-600">Create professional tournaments that fund student educational trips</p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Champions for Change Platform
            </Badge>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card data-testid="step-basic-info">
            <CardHeader>
              <CardTitle>Step 1: Tournament Basics</CardTitle>
              <CardDescription>Set up the core details for your tournament</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Tournament Name *</Label>
                  <Input 
                    placeholder="e.g., Spring Basketball Championship"
                    value={tournament.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    data-testid="input-tournament-name"
                  />
                </div>

                <div>
                  <Label>Sport *</Label>
                  <Select value={tournament.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                    <SelectTrigger data-testid="select-sport">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map(sport => (
                        <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start Date *</Label>
                  <Input 
                    type="date"
                    value={tournament.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>

                <div>
                  <Label>End Date *</Label>
                  <Input 
                    type="date"
                    value={tournament.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>

                <div>
                  <Label>Location *</Label>
                  <Input 
                    placeholder="e.g., Robert Driscoll Middle School"
                    value={tournament.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label>Max Participants *</Label>
                  <Input 
                    type="number"
                    placeholder="16"
                    value={tournament.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    data-testid="input-max-participants"
                  />
                </div>
              </div>

              <div>
                <Label>Tournament Description & Mission</Label>
                <Textarea 
                  placeholder="Describe your tournament and its purpose - whether for educational funding, community building, faith outreach, revenue generation, or athletic development..."
                  rows={3}
                  value={tournament.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!tournament.name || !tournament.sport || !tournament.startDate || !tournament.location}
                  data-testid="button-continue-step1"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card data-testid="step-format-pricing">
            <CardHeader>
              <CardTitle>Step 2: Format & Registration</CardTitle>
              <CardDescription>Configure tournament structure and participant details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">Tournament Format *</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {formats.map(format => (
                    <div 
                      key={format.value}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        tournament.format === format.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleInputChange('format', format.value)}
                      data-testid={`format-${format.value}`}
                    >
                      <h3 className="font-semibold">{format.name}</h3>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Entry Fee (per team/individual)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number"
                      placeholder="25"
                      className="pl-10"
                      value={tournament.entryFee}
                      onChange={(e) => handleInputChange('entryFee', e.target.value)}
                      data-testid="input-entry-fee"
                    />
                  </div>
                  <p className="text-xs text-green-600 mt-1">Funds educational trips for students</p>
                </div>

                <div>
                  <Label>Prize Information</Label>
                  <Input 
                    placeholder="e.g., Trophies for top 3, Medals for all participants"
                    value={tournament.prizes}
                    onChange={(e) => handleInputChange('prizes', e.target.value)}
                    data-testid="input-prizes"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Tournament Preview</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {tournament.name || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Sport:</span> {tournament.sport || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Format:</span> {formats.find(f => f.value === tournament.format)?.name || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Dates:</span> {tournament.startDate && tournament.endDate ? `${tournament.startDate} to ${tournament.endDate}` : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!tournament.format}
                  data-testid="button-continue-step2"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <MissionBranding
              userMission="Example: Fund educational trips for our students through tournament excellence"
              organizationName="Your Organization"
              onSave={(branding) => setTournament(prev => ({ ...prev, branding }))}
              mode="setup"
            />
            
            <Card data-testid="step-finalize">
              <CardHeader>
                <CardTitle>Step 3: Finalize Tournament</CardTitle>
                <CardDescription>Review and create your tournament with custom branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Tournament Preview
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {tournament.name}</div>
                    <div><span className="font-medium">Sport:</span> {tournament.sport}</div>
                    <div><span className="font-medium">Format:</span> {formats.find(f => f.value === tournament.format)?.name}</div>
                    <div><span className="font-medium">Participants:</span> {tournament.maxParticipants}</div>
                    <div><span className="font-medium">Entry Fee:</span> {tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}</div>
                    <div><span className="font-medium">Dates:</span> {tournament.startDate} to {tournament.endDate}</div>
                  </div>
                  {tournament.branding && (
                    <div className="mt-4 pt-4 border-t border-green-300">
                      <p className="text-green-700 text-sm">
                        <strong>Custom Branding:</strong> Applied with your mission and organizational colors
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    onClick={generateTournament}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-create-tournament"
                  >
                    Create Tournament
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}