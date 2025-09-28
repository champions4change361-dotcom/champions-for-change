import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Medal,
  Star,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  MapPin,
  School,
  Crown,
  Zap,
  FileText,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AcademicMeet {
  id: string;
  meetName: string;
  meetDate: string;
  location: string;
  level: 'district' | 'regional' | 'state';
  status: string;
  competitions: string[];
}

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  subjectArea: string;
  isTeamEvent: boolean;
  advancementRules: {
    individualAdvance: number;
    teamAdvance: number;
  };
}

interface AcademicResult {
  id: string;
  meetId: string;
  meetName: string;
  competitionId: string;
  competitionName: string;
  participantId: string;
  participantName: string;
  schoolName: string;
  grade: number;
  score: number;
  rank: number;
  placement: number;
  medal: 'gold' | 'silver' | 'bronze' | 'none';
  advances: boolean;
  advancementLevel?: string;
  judgeComments?: string;
  isVerified: boolean;
  resultDate: string;
}

interface AdvancementTracking {
  participantId: string;
  participantName: string;
  schoolName: string;
  competitionName: string;
  districtResult: {
    placement: number;
    score: number;
    medal: string;
    date: string;
  };
  regionalResult?: {
    placement: number;
    score: number;
    medal: string;
    date: string;
  };
  stateResult?: {
    placement: number;
    score: number;
    medal: string;
    date: string;
  };
  currentLevel: 'district' | 'regional' | 'state' | 'completed';
  qualifiedFor: string[];
}

interface LeaderboardEntry {
  rank: number;
  participantName: string;
  schoolName: string;
  competitionName: string;
  score: number;
  medal: string;
  advancementLevel?: string;
}

interface SchoolPerformance {
  schoolName: string;
  totalParticipants: number;
  totalMedals: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  advancingParticipants: number;
  overallScore: number;
  ranking: number;
}

export default function AcademicResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Get academic meets
  const { data: academicMeets, isLoading: meetsLoading } = useQuery<AcademicMeet[]>({
    queryKey: ['/api/academic/meets'],
    enabled: !!user
  });

  // Get competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/uil'],
    enabled: !!user
  });

  // Get all results
  const { data: allResults, isLoading: resultsLoading } = useQuery<AcademicResult[]>({
    queryKey: ['/api/academic/results/all'],
    enabled: !!user
  });

  // Get advancement tracking
  const { data: advancementData, isLoading: advancementLoading } = useQuery<AdvancementTracking[]>({
    queryKey: ['/api/academic/advancement/tracking'],
    enabled: !!user
  });

  // Get school performance
  const { data: schoolPerformance, isLoading: schoolLoading } = useQuery<SchoolPerformance[]>({
    queryKey: ['/api/academic/analytics/school-performance'],
    enabled: !!user
  });

  // Get leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/academic/results/leaderboard', selectedMeet, selectedCompetition],
    enabled: !!user
  });

  const getMedalIcon = (medal: string) => {
    switch (medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  const getMedalColor = (medal: string) => {
    switch (medal) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'district': return 'bg-blue-100 text-blue-800';
      case 'regional': return 'bg-green-100 text-green-800';
      case 'state': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdvancementStatusColor = (currentLevel: string) => {
    switch (currentLevel) {
      case 'district': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'regional': return 'bg-green-50 border-green-200 text-green-800';
      case 'state': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'completed': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const filteredResults = allResults?.filter(result => {
    const matchesSearch = searchTerm === "" || 
      result.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.competitionName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === "all" || 
      (selectedMeet && academicMeets?.find(m => m.id === selectedMeet)?.level === filterLevel);
    
    const matchesMeet = selectedMeet === "" || result.meetId === selectedMeet;
    const matchesCompetition = selectedCompetition === "" || result.competitionId === selectedCompetition;
    
    return matchesSearch && matchesLevel && matchesMeet && matchesCompetition;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Academic Results</CardTitle>
            <CardDescription>Please log in to view competition results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-results">
                  Academic Competition Results
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View results, track advancement, and analyze performance
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" data-testid="button-export-results">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              <Link to="/academic">
                <Button variant="outline" data-testid="button-back-dashboard">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search participants, schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <div>
                <Label>Meet</Label>
                <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                  <SelectTrigger data-testid="select-meet">
                    <SelectValue placeholder="All meets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Meets</SelectItem>
                    {academicMeets?.map((meet) => (
                      <SelectItem key={meet.id} value={meet.id}>
                        {meet.meetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Competition</Label>
                <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                  <SelectTrigger data-testid="select-competition">
                    <SelectValue placeholder="All competitions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Competitions</SelectItem>
                    {competitions?.map((competition) => (
                      <SelectItem key={competition.id} value={competition.id}>
                        {competition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Level</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger data-testid="select-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="advancement" data-testid="tab-advancement">Advancement</TabsTrigger>
            <TabsTrigger value="school-performance" data-testid="tab-school-performance">School Performance</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            {resultsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading results...</p>
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredResults.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Results</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredResults.filter(r => r.advances).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Advancing</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredResults.filter(r => r.medal !== 'none').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Medal Winners</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(filteredResults.map(r => r.schoolName)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Schools</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Competition Results</CardTitle>
                    <CardDescription>
                      Individual and team results from academic competitions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredResults
                        .sort((a, b) => a.placement - b.placement)
                        .map((result, index) => (
                        <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                #{result.placement}
                              </div>
                              <div className="text-xs text-muted-foreground">Rank</div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-semibold">{result.participantName}</div>
                              <div className="text-sm text-muted-foreground">
                                {result.schoolName} • Grade {result.grade}
                              </div>
                              <div className="text-sm text-blue-600">
                                {result.competitionName}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {result.score}
                              </div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              {result.medal !== 'none' && (
                                <Badge className={getMedalColor(result.medal)}>
                                  {getMedalIcon(result.medal)} {result.medal.charAt(0).toUpperCase() + result.medal.slice(1)}
                                </Badge>
                              )}
                              
                              {result.advances && (
                                <Badge variant="default" className="text-xs">
                                  Advances to {result.advancementLevel}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {result.isVerified ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-yellow-400" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {result.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  No competition results match your current filters.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Advancement Tab */}
          <TabsContent value="advancement" className="space-y-6">
            {advancementLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading advancement data...</p>
              </div>
            ) : advancementData && advancementData.length > 0 ? (
              <div className="space-y-6">
                {/* Advancement Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {advancementData.filter(a => a.currentLevel === 'district').length}
                      </div>
                      <div className="text-sm text-muted-foreground">At District Level</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {advancementData.filter(a => a.currentLevel === 'regional').length}
                      </div>
                      <div className="text-sm text-muted-foreground">At Regional Level</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {advancementData.filter(a => a.currentLevel === 'state').length}
                      </div>
                      <div className="text-sm text-muted-foreground">At State Level</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advancement Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle>Advancement Tracking</CardTitle>
                    <CardDescription>
                      Track participant progression from district to state level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {advancementData.map((advancement, index) => (
                        <Card key={index} className={`p-4 ${getAdvancementStatusColor(advancement.currentLevel)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{advancement.participantName}</div>
                              <div className="text-sm text-muted-foreground">
                                {advancement.schoolName} • {advancement.competitionName}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* District */}
                              <div className="text-center">
                                <div className="text-lg font-bold">
                                  #{advancement.districtResult.placement}
                                </div>
                                <Badge className={getLevelColor('district')}>
                                  District
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(advancement.districtResult.date).toLocaleDateString()}
                                </div>
                              </div>
                              
                              {advancement.regionalResult && (
                                <>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  <div className="text-center">
                                    <div className="text-lg font-bold">
                                      #{advancement.regionalResult.placement}
                                    </div>
                                    <Badge className={getLevelColor('regional')}>
                                      Regional
                                    </Badge>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(advancement.regionalResult.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              {advancement.stateResult && (
                                <>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  <div className="text-center">
                                    <div className="text-lg font-bold">
                                      #{advancement.stateResult.placement}
                                    </div>
                                    <Badge className={getLevelColor('state')}>
                                      State
                                    </Badge>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(advancement.stateResult.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              <div className="text-center">
                                <Badge 
                                  className={advancement.currentLevel === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-blue-200 text-blue-800'}
                                >
                                  {advancement.currentLevel === 'completed' ? 'Complete' : `Current: ${advancement.currentLevel}`}
                                </Badge>
                                {advancement.qualifiedFor.length > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Qualified for: {advancement.qualifiedFor.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Advancement Data</h3>
                <p className="text-muted-foreground">
                  No advancement tracking data available yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* School Performance Tab */}
          <TabsContent value="school-performance" className="space-y-6">
            {schoolLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading school performance...</p>
              </div>
            ) : schoolPerformance && schoolPerformance.length > 0 ? (
              <div className="space-y-6">
                {/* School Rankings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5" />
                      <span>School Performance Rankings</span>
                    </CardTitle>
                    <CardDescription>
                      Overall school performance based on medals and advancement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {schoolPerformance
                        .sort((a, b) => a.ranking - b.ranking)
                        .map((school, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                #{school.ranking}
                              </div>
                              <div className="text-xs text-muted-foreground">Rank</div>
                            </div>
                            
                            <div>
                              <div className="font-semibold text-lg">{school.schoolName}</div>
                              <div className="text-sm text-muted-foreground">
                                {school.totalParticipants} participants
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {school.advancingParticipants}
                              </div>
                              <div className="text-xs text-muted-foreground">Advancing</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">
                                {school.totalMedals}
                              </div>
                              <div className="text-xs text-muted-foreground">Total Medals</div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Badge className="bg-yellow-100 text-yellow-800">
                                🥇 {school.goldMedals}
                              </Badge>
                              <Badge className="bg-gray-100 text-gray-800">
                                🥈 {school.silverMedals}
                              </Badge>
                              <Badge className="bg-orange-100 text-orange-800">
                                🥉 {school.bronzeMedals}
                              </Badge>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                {school.overallScore}
                              </div>
                              <div className="text-xs text-muted-foreground">Overall Score</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <School className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No School Data</h3>
                <p className="text-muted-foreground">
                  No school performance data available yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive analytics and reporting for academic competitions
              </p>
              <Button size="lg" data-testid="button-view-analytics">
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}