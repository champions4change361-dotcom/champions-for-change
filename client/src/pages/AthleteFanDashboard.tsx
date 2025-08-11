import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Target,
  Search,
  Star,
  Clock,
  Award,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function AthleteFanDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");

  // Get public tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments/public"],
    enabled: isAuthenticated
  });

  // Get featured/ongoing tournaments
  const { data: featuredTournaments = [] } = useQuery({
    queryKey: ["/api/tournaments/featured"],
    enabled: isAuthenticated
  });

  // Get my followed tournaments (if user has favorites)
  const { data: followedTournaments = [] } = useQuery({
    queryKey: ["/api/tournaments/followed"],
    enabled: isAuthenticated
  });

  const filteredTournaments = (tournaments as any[]).filter((tournament: any) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || tournament.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "stage-1":
      case "stage-2":
      case "stage-3":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "stage-1":
      case "stage-2":
      case "stage-3":
        return <Trophy className="h-4 w-4" />;
      case "completed":
        return <Award className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const uniqueSports = [...new Set((tournaments as any[]).map((t: any) => t.sport))];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the tournament dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tournament Dashboard</h1>
          <p className="text-muted-foreground">
            Follow your favorite tournaments and track results
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-tournaments"
            />
          </div>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="select-sport-filter"
          >
            <option value="all">All Sports</option>
            {uniqueSports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live & Upcoming</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="grid gap-4">
            {filteredTournaments
              .filter((t: any) => t.status !== "completed")
              .map((tournament: any) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(tournament.status)}
                        <Link href={`/tournament/${tournament.id}`} className="hover:text-primary">
                          {tournament.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {tournament.sport}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {tournament.teamSize} per team
                        </span>
                        {tournament.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tournament.location}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status === "upcoming" ? "Upcoming" : "Live"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tournament/${tournament.id}`} data-testid={`button-view-tournament-${tournament.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Age Group:</span> {tournament.ageGroup}
                    </div>
                    <div>
                      <span className="font-medium">Division:</span> {tournament.genderDivision}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {tournament.tournamentType}
                    </div>
                    <div>
                      <span className="font-medium">Teams:</span> {tournament.teams?.length || 0}/{tournament.maxParticipants || "∞"}
                    </div>
                  </div>
                  {tournament.tournamentDate && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(tournament.tournamentDate).toLocaleDateString()} at{" "}
                      {new Date(tournament.tournamentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {tournament.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {tournament.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredTournaments.filter((t: any) => t.status !== "completed").length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Live Tournaments</h3>
                  <p className="text-muted-foreground">
                    There are no live or upcoming tournaments matching your search.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid gap-4">
            {(featuredTournaments as any[]).map((tournament: any) => (
              <Card key={tournament.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <Link href={`/tournament/${tournament.id}`} className="hover:text-primary">
                          {tournament.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {tournament.sport}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {tournament.participants?.length || 0} teams
                        </span>
                        {tournament.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tournament.location}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prize Pool:</span> ${tournament.prizePool || "TBD"}
                    </div>
                    <div>
                      <span className="font-medium">Entry Fee:</span> ${tournament.entryFee || "Free"}
                    </div>
                    <div>
                      <span className="font-medium">Registration:</span> {
                        tournament.registrationDeadline 
                          ? `Closes ${new Date(tournament.registrationDeadline).toLocaleDateString()}`
                          : "Open"
                      }
                    </div>
                  </div>
                  {tournament.description && (
                    <p className="mt-2 text-sm">{tournament.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {featuredTournaments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Featured Tournaments</h3>
                  <p className="text-muted-foreground">
                    Check back later for featured tournaments and special events.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <div className="grid gap-4">
            {(followedTournaments as any[]).map((tournament: any) => (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <Link href={`/tournament/${tournament.id}`} className="hover:text-primary">
                          {tournament.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Following since {new Date(tournament.followedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>Last update: {tournament.lastUpdate}</p>
                    <p className="mt-1 text-muted-foreground">{tournament.currentRound}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {followedTournaments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Not Following Any Tournaments</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow tournaments to get updates and track your favorite teams.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/browse">Browse Tournaments</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid gap-4">
            {filteredTournaments.map((tournament: any) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        <Link href={`/tournament/${tournament.id}`} className="hover:text-primary">
                          {tournament.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span>{tournament.sport}</span>
                        <span>{tournament.ageGroup}</span>
                        <span>{tournament.genderDivision}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tournament/${tournament.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Format: {tournament.tournamentType}</div>
                    <div>Teams: {tournament.teams?.length || 0}</div>
                    <div>Entry: ${tournament.entryFee || "Free"}</div>
                    <div>
                      Date: {tournament.tournamentDate 
                        ? new Date(tournament.tournamentDate).toLocaleDateString()
                        : "TBD"
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTournaments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tournaments Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or sport filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}