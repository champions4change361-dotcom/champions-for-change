import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Clock, 
  Filter, 
  Search,
  Globe,
  Star,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PublicContest {
  id: string;
  name: string;
  sport: string;
  format: string;
  entryCount: number;
  maxEntries: number;
  slate: 'morning' | 'afternoon' | 'evening';
  startTime: string;
  creator: string;
  featured: boolean;
  isNoMoney: boolean;
  gameCount: number;
}

export default function PublicContests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedSlate, setSelectedSlate] = useState('all');

  // Mock data - replace with real API call
  const mockContests: PublicContest[] = [
    {
      id: '1',
      name: 'NFL Sunday Millionaire [No Payouts - For Fun]',
      sport: 'NFL',
      format: 'Classic',
      entryCount: 45621,
      maxEntries: 100000,
      slate: 'afternoon',
      startTime: '1:00 PM EST',
      creator: 'SportsFan_France',
      featured: true,
      isNoMoney: true,
      gameCount: 13
    },
    {
      id: '2',
      name: 'NBA Fantasy Challenge [Educational - Zero Entry]',
      sport: 'NBA',
      format: 'Showdown',
      entryCount: 12450,
      maxEntries: 50000,
      slate: 'evening',
      startTime: '7:00 PM EST',
      creator: 'BasketballCoach_TX',
      featured: false,
      isNoMoney: true,
      gameCount: 8
    },
    {
      id: '3',
      name: 'International Soccer Friendly [Global Competition]',
      sport: 'Soccer',
      format: 'Classic',
      entryCount: 8934,
      maxEntries: 25000,
      slate: 'morning',
      startTime: '9:00 AM EST',
      creator: 'FutbolAmigo_Mexico',
      featured: false,
      isNoMoney: true,
      gameCount: 6
    },
    {
      id: '4',
      name: 'NHL Stanley Cup Fantasy [Champions League Style]',
      sport: 'NHL',
      format: 'Best Ball',
      entryCount: 3421,
      maxEntries: 15000,
      slate: 'evening',
      startTime: '8:00 PM EST',
      creator: 'HockeyFan_Canada',
      featured: true,
      isNoMoney: true,
      gameCount: 4
    }
  ];

  const { data: contests = mockContests, isLoading } = useQuery({
    queryKey: ['/api/fantasy/public-contests'],
    enabled: true,
  });

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || contest.sport === selectedSport;
    const matchesFormat = selectedFormat === 'all' || contest.format === selectedFormat;
    const matchesSlate = selectedSlate === 'all' || contest.slate === selectedSlate;
    
    return matchesSearch && matchesSport && matchesFormat && matchesSlate;
  });

  const featuredContests = filteredContests.filter(c => c.featured);
  const allContests = filteredContests;

  const getSlateIcon = (slate: string) => {
    switch (slate) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '⏰';
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'NFL': return '🏈';
      case 'NBA': return '🏀';
      case 'NHL': return '🏒';
      case 'Soccer': return '⚽';
      default: return '🏆';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading public contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Globe className="h-10 w-10 text-purple-600" />
            Public Fantasy Contests
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join contests created by fantasy players worldwide. All contests are <strong>FREE</strong> with no entry fees or payouts - purely for fun and competition!
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-green-600 text-white">
              🌍 International Players Welcome
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              💰 Zero Entry Fees
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              🏆 For Fun Competition
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Your Perfect Contest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contests or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-contests"
                />
              </div>
              
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger data-testid="filter-sport">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="NFL">🏈 NFL</SelectItem>
                  <SelectItem value="NBA">🏀 NBA</SelectItem>
                  <SelectItem value="NHL">🏒 NHL</SelectItem>
                  <SelectItem value="Soccer">⚽ Soccer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger data-testid="filter-format">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="Classic">Classic</SelectItem>
                  <SelectItem value="Showdown">Showdown</SelectItem>
                  <SelectItem value="Best Ball">Best Ball</SelectItem>
                  <SelectItem value="Head to Head">Head to Head</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSlate} onValueChange={setSelectedSlate}>
                <SelectTrigger data-testid="filter-slate">
                  <SelectValue placeholder="All Times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="morning">🌅 Morning</SelectItem>
                  <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                  <SelectItem value="evening">🌙 Evening</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedSport('all');
                setSelectedFormat('all');
                setSelectedSlate('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contest Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Contests ({allContests.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured ({featuredContests.length})</TabsTrigger>
            <TabsTrigger value="tournaments">Head to Head</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allContests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No contests found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back later for new contests.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allContests.map((contest) => (
                  <Card key={contest.id} className="border-2 hover:border-purple-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {contest.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <h3 className="text-lg font-bold text-gray-900">{contest.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {contest.entryCount.toLocaleString()}/{contest.maxEntries.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {contest.gameCount} games
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Starts {contest.startTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{getSportIcon(contest.sport)} {contest.sport}</Badge>
                            <Badge variant="secondary">{contest.format}</Badge>
                            <Badge variant="outline">{getSlateIcon(contest.slate)} {contest.slate}</Badge>
                            {contest.isNoMoney && (
                              <Badge className="bg-green-600 text-white">FREE</Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-500">
                            Created by <span className="font-medium text-purple-600">{contest.creator}</span>
                          </p>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-purple-600">FREE</div>
                          <div className="text-sm text-gray-500">No Entry Fee</div>
                          <Button 
                            className="w-full"
                            data-testid={`join-contest-${contest.id}`}
                          >
                            Join Contest
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {featuredContests.map((contest) => (
                <Card key={contest.id} className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <Badge className="bg-yellow-500 text-white">FEATURED</Badge>
                    </div>
                    {/* Same content as regular contest cards */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{contest.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {contest.entryCount.toLocaleString()}/{contest.maxEntries.toLocaleString()}
                          </span>
                          <span>Starts {contest.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getSportIcon(contest.sport)} {contest.sport}</Badge>
                          <Badge variant="secondary">{contest.format}</Badge>
                          <Badge className="bg-green-600 text-white">FREE</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Created by <span className="font-medium text-purple-600">{contest.creator}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600">
                          Join Featured Contest
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Head to Head Tournaments</h3>
                <p className="text-gray-500">Coming soon! One-on-one competitions and bracket-style tournaments.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}