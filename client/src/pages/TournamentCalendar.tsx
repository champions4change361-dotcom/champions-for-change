import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, MapPin, Clock, Users, Trophy, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function TournamentCalendar() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sample tournament data across multiple months - this would come from your API
  const tournaments = [
    // September 2025
    {
      id: '1',
      title: 'Youth Basketball Championship',
      organizer: 'Community Church',
      organizerEmail: 'tournaments@communitychurch.org',
      date: '2025-09-15',
      time: '9:00 AM - 3:00 PM',
      location: 'Corpus Christi, TX',
      sport: 'Basketball',
      divisions: ['Middle School Boys', 'Middle School Girls'],
      estimatedTeams: 16,
      status: 'open'
    },
    {
      id: '2',
      title: 'Track & Field Invitational',
      organizer: 'YMCA Coastal Bend',
      organizerEmail: 'events@ymcacb.org',
      date: '2025-09-15',
      time: '8:00 AM - 12:00 PM',
      location: 'Rockport, TX',
      sport: 'Track & Field',
      divisions: ['High School', 'Open'],
      estimatedTeams: 8,
      status: 'open'
    },
    {
      id: '3',
      title: 'Baseball Tournament',
      organizer: 'Saints Baseball Club',
      organizerEmail: 'coach@saintsbaseball.com',
      date: '2025-09-22',
      time: '10:00 AM - 6:00 PM',
      location: 'Aransas Pass, TX',
      sport: 'Baseball',
      divisions: ['14U', '16U'],
      estimatedTeams: 12,
      status: 'open'
    },
    // October 2025
    {
      id: '4',
      title: 'Fall Soccer League Championship',
      organizer: 'Coastal Bend Soccer Association',
      organizerEmail: 'info@cbsoccer.org',
      date: '2025-10-12',
      time: '8:00 AM - 4:00 PM',
      location: 'Corpus Christi, TX',
      sport: 'Soccer',
      divisions: ['U12', 'U14', 'U16'],
      estimatedTeams: 24,
      status: 'open'
    },
    // November 2025
    {
      id: '5',
      title: 'Thanksgiving Basketball Classic',
      organizer: 'First Baptist Church',
      organizerEmail: 'sports@fbccorpus.org',
      date: '2025-11-28',
      time: '9:00 AM - 6:00 PM',
      location: 'Corpus Christi, TX',
      sport: 'Basketball',
      divisions: ['Adult Rec', 'High School'],
      estimatedTeams: 16,
      status: 'open'
    },
    // December 2025
    {
      id: '6',
      title: 'Winter Volleyball Tournament',
      organizer: 'Aransas Pass Athletic Club',
      organizerEmail: 'volleyball@apac.com',
      date: '2025-12-14',
      time: '10:00 AM - 8:00 PM',
      location: 'Aransas Pass, TX',
      sport: 'Volleyball',
      divisions: ['Women\'s Open', 'Coed Rec'],
      estimatedTeams: 20,
      status: 'open'
    }
  ];

  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const getDateTournaments = (date: string) => {
    return tournaments.filter(t => t.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Clear selected date when changing months
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getSportIcon = (sport: string) => {
    return <Trophy className="h-4 w-4" />;
  };

  const getSportColor = (sport: string) => {
    const colors = {
      'Basketball': 'bg-orange-100 text-orange-800 border-orange-200',
      'Track & Field': 'bg-green-100 text-green-800 border-green-200',
      'Baseball': 'bg-blue-100 text-blue-800 border-blue-200',
      'Soccer': 'bg-purple-100 text-purple-800 border-purple-200',
      'Volleyball': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[sport as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                className="text-white hover:text-blue-300 p-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-200">Live Calendar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Texas Coastal Bend Tournament Calendar</h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Discover upcoming tournaments in your area and coordinate with other organizers
            </p>
            <Badge className="mt-4 bg-blue-600 text-white">
              Regional Sports Coordination Hub
            </Badge>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-blue-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{formatMonthYear(currentMonth)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Click dates to see tournament details
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {/* Calendar header */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-slate-400 font-medium">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                      const day = i + 1;
                      const date = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      const dayTournaments = getDateTournaments(date);
                      const hasEvents = dayTournaments.length > 0;
                      const isSelected = selectedDate === date;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(date)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            hasEvents 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 font-bold' 
                              : 'text-slate-400 hover:bg-slate-700'
                          } ${
                            isSelected ? 'ring-2 ring-yellow-400' : ''
                          }`}
                        >
                          <div>{day}</div>
                          {hasEvents && (
                            <div className="flex justify-center space-x-1 mt-1">
                              {dayTournaments.slice(0, 3).map((_, idx) => (
                                <div key={idx} className="w-1 h-1 bg-yellow-300 rounded-full"></div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tournament Details */}
            <div className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-green-400" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-blue-300">Blue dates</strong> have scheduled tournaments
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      Click dates to see tournament details and contact organizers
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      Coordinate with other organizers to avoid conflicts
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedDate && (
                <Card className="bg-slate-800/80 backdrop-blur-sm border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getDateTournaments(selectedDate).map(tournament => (
                      <div key={tournament.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm">{tournament.title}</h3>
                          <Badge className={`text-xs ${getSportColor(tournament.sport)}`}>
                            {tournament.sport}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-2" />
                            {tournament.organizer}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {tournament.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2" />
                            {tournament.location}
                          </div>
                          <div className="text-slate-400">
                            Divisions: {tournament.divisions.join(', ')}
                          </div>
                          <div className="text-slate-400">
                            Expected Teams: {tournament.estimatedTeams}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            onClick={() => window.open(`mailto:${tournament.organizerEmail}?subject=Tournament Coordination - ${tournament.title}`)}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Contact Organizer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Want to Add Your Tournament?</CardTitle>
                <CardDescription className="text-slate-300">
                  Join the regional coordination network and get free exposure for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setLocation('/smart-signup?type=individual')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Create Tournament Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}