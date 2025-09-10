import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Users, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { BracketGenerator, SmartParticipant, BracketStructure } from '@/utils/bracket-generator';
import BracketVisualization from './bracket-visualization';
import ChallongeStyleBracket from './ChallongeStyleBracket';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  competitionFormat: string;
  teamSize: number;
  status: string;
}

interface TournamentDivision {
  id: string;
  name: string;
  ageGroup: string;
  gender: string;
  skillLevel?: string;
  maxParticipants: number;
  currentParticipants: number;
}

interface SmartBracketGeneratorProps {
  tournament: Tournament;
  'data-testid'?: string;
}

export default function SmartBracketGenerator({ tournament, ...props }: SmartBracketGeneratorProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'single-elimination' | 'round-robin'>('single-elimination');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [generatedBracket, setGeneratedBracket] = useState<BracketStructure | null>(null);
  const [bracketStyle, setBracketStyle] = useState<'standard' | 'challonge'>('standard');

  // Fetch tournament divisions
  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<TournamentDivision[]>({
    queryKey: [`/api/tournaments/${tournament.id}/divisions`],
    enabled: tournament.competitionFormat === 'bracket'
  });

  // Fetch registration submissions for seeding
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<SmartParticipant[]>({
    queryKey: [`/api/registration-forms/tournament/${tournament.id}/submissions`],
  });
  
  // Fetch tournament events for event-based tournaments
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: [`/api/tournaments/${tournament.id}/events`],
    enabled: tournament.competitionFormat === 'event'
  });

  const isLoading = divisionsLoading || registrationsLoading || eventsLoading;

  const generateSmartBracket = (divisionId?: string, eventIds?: string[]) => {
    if (registrations.length === 0) {
      console.warn('No registrations found for bracket generation');
      return;
    }

    // Filter participants by division or events
    let participants = registrations;
    if (divisionId) {
      participants = registrations.filter(p => 
        p.assignedDivisionId === divisionId || 
        p.assignmentResult?.divisionAssignments?.some(d => d.divisionId === divisionId)
      );
    } else if (eventIds && eventIds.length > 0) {
      participants = registrations.filter(p => 
        p.assignedEventIds?.some(id => eventIds.includes(id)) ||
        p.assignmentResult?.eventAssignments?.some(e => eventIds.includes(e.eventId))
      );
    }

    const minParticipants = selectedFormat === 'round-robin' ? 3 : 2;
    if (participants.length < minParticipants) {
      console.warn(`Insufficient participants for ${selectedFormat} generation (need at least ${minParticipants})`);
      return;
    }

    try {
      // Generate bracket with smart seeding using new method
      const bracket = BracketGenerator.generateSeededBracket(
        participants, 
        tournament.id, 
        selectedFormat,
        tournament.sport,
        divisionId
      );

      setGeneratedBracket(bracket);
    } catch (error) {
      console.error('Bracket generation failed:', error);
    }
  };

  const getParticipantCount = (divisionId?: string) => {
    if (!divisionId) return registrations.length;
    
    return registrations.filter(p => 
      p.assignedDivisionId === divisionId || 
      p.assignmentResult?.divisionAssignments?.some(d => d.divisionId === divisionId)
    ).length;
  };

  const getSkillDistribution = (divisionId?: string) => {
    let participants = registrations;
    if (divisionId) {
      participants = registrations.filter(p => 
        p.assignedDivisionId === divisionId || 
        p.assignmentResult?.divisionAssignments?.some(d => d.divisionId === divisionId)
      );
    }

    const distribution = participants.reduce((acc, p) => {
      acc[p.skillLevel] = (acc[p.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return distribution;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="bracket-loading">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Loading smart bracket generator...</span>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card data-testid="bracket-no-registrations">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            No Registrations Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Tournament brackets will be available once participants register through the smart registration system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="smart-bracket-generator" {...props}>
      {/* Smart Bracket Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-500" />
            Smart Bracket Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tournament.competitionFormat === 'bracket' && divisions.length > 0 ? (
            // Division-based tournament (Basketball)
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Division</label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {divisions.map((division) => {
                    const participantCount = getParticipantCount(division.id);
                    const skillDist = getSkillDistribution(division.id);
                    
                    return (
                      <div
                        key={division.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDivision === division.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDivision(division.id)}
                        data-testid={`division-${division.id}`}
                      >
                        <div className="font-medium">{division.name}</div>
                        <div className="text-sm text-gray-600">
                          {division.ageGroup} • {division.gender}
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {participantCount} registered
                          </Badge>
                          <Badge variant="secondary">
                            <Target className="h-3 w-3 mr-1" />
                            {Object.keys(skillDist).length} skill levels
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDivision && (
                <div className="space-y-4">
                  {/* Format Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tournament Format</label>
                    <div className="flex gap-2">
                      <Button 
                        variant={selectedFormat === 'single-elimination' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFormat('single-elimination')}
                        data-testid="format-single-elimination"
                      >
                        Single Elimination
                      </Button>
                      <Button 
                        variant={selectedFormat === 'round-robin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFormat('round-robin')}
                        data-testid="format-round-robin"
                      >
                        Round Robin
                      </Button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => generateSmartBracket(selectedDivision)}
                      data-testid="button-generate-bracket"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Generate {selectedFormat === 'single-elimination' ? 'Bracket' : 'Schedule'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setBracketStyle(bracketStyle === 'standard' ? 'challonge' : 'standard')}
                      data-testid="button-toggle-style"
                    >
                      Switch to {bracketStyle === 'standard' ? 'Challonge' : 'Standard'} Style
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Event-based tournament (Track & Field)
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Event-based tournaments generate separate brackets for each event. Select events to generate brackets.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Total Participants</h4>
                  <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Skill Distribution</h4>
                  <div className="space-y-1">
                    {Object.entries(getSkillDistribution()).map(([skill, count]) => (
                      <div key={skill} className="flex justify-between text-sm">
                        <span className="capitalize">{skill}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Event Selection */}
              {events.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Events for Bracket Generation</label>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {events.map((event: any) => {
                      const eventParticipants = registrations.filter(p => 
                        p.assignedEventIds?.includes(event.id) ||
                        p.assignmentResult?.eventAssignments?.some(e => e.eventId === event.id)
                      ).length;
                      
                      const isSelected = selectedEvents.includes(event.id);
                      
                      return (
                        <div
                          key={event.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedEvents(prev => 
                              isSelected 
                                ? prev.filter(id => id !== event.id)
                                : [...prev, event.id]
                            );
                          }}
                          data-testid={`event-${event.id}`}
                        >
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-gray-600">{event.eventType}</div>
                          <Badge variant="outline" className="mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            {eventParticipants} participants
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Format Selection for Events */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bracket Format</label>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedFormat === 'single-elimination' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat('single-elimination')}
                    data-testid="event-format-single-elimination"
                  >
                    Elimination
                  </Button>
                  <Button 
                    variant={selectedFormat === 'round-robin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat('round-robin')}
                    data-testid="event-format-round-robin"
                  >
                    Round Robin
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={() => generateSmartBracket(undefined, selectedEvents.length > 0 ? selectedEvents : undefined)}
                disabled={selectedEvents.length === 0 && events.length > 0}
                data-testid="button-generate-event-bracket"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Generate {selectedEvents.length > 0 ? `Brackets for ${selectedEvents.length} Events` : 'Event Brackets'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Bracket Display */}
      {generatedBracket && (
        <Card data-testid="generated-bracket">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                <Trophy className="h-5 w-5 mr-2 inline" />
                Tournament {generatedBracket.format.includes('round-robin') ? 'Schedule' : 'Bracket'} - {bracketStyle === 'standard' ? 'Standard' : 'Challonge'} Style
              </span>
              <Badge variant="outline">
                {generatedBracket.totalMatches} matches • {generatedBracket.totalRounds} rounds
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bracketStyle === 'standard' ? (
              <BracketVisualization 
                tournament={{
                  id: tournament.id,
                  name: tournament.name,
                  sport: tournament.sport,
                  teamSize: tournament.teamSize,
                  tournamentType: tournament.competitionFormat,
                  status: tournament.status
                }}
                matches={generatedBracket.matches.map(match => ({
                  ...match,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }))}
              />
            ) : (
              <ChallongeStyleBracket
                tournament={{
                  id: tournament.id,
                  name: tournament.name,
                  sport: tournament.sport,
                  teamSize: tournament.teamSize,
                  tournamentType: tournament.competitionFormat,
                  status: tournament.status
                }}
                matches={generatedBracket.matches.map(match => ({
                  ...match,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }))}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}