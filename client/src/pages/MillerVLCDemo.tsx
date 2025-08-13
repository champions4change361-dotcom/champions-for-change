import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Calendar, MapPin, Phone, GraduationCap, Medal } from "lucide-react";
import millerVlcData from "../../../MILLER_VLC_SCHOOLS_DATA.json";

const { millerVlcCluster } = millerVlcData;

export default function MillerVLCDemo() {
  const [selectedSchool, setSelectedSchool] = useState(millerVlcCluster.schools[0]);

  const createTournament = (schoolId: string, sport: string) => {
    alert(`Creating ${sport} tournament for ${millerVlcCluster.schools.find(s => s.id === schoolId)?.name}`);
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          Miller VLC Tournament Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Pre-loaded CCISD demonstration for immediate deployment
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Built by coaches with 41+ years experience
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            Military precision meets athletic excellence
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {millerVlcCluster.schools.map((school) => (
          <Card 
            key={school.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedSchool.id === school.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => setSelectedSchool(school)}
            data-testid={`card-school-${school.id}`}
          >
            <CardHeader style={{ backgroundColor: school.colors.primary + '20' }}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle 
                    className="text-lg font-bold" 
                    style={{ color: school.colors.primary }}
                  >
                    {school.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {school.mascot} • {school.level.replace('-', ' ')}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  style={{ 
                    backgroundColor: school.colors.primary, 
                    color: school.colors.secondary 
                  }}
                >
                  {school.nickname}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">{school.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">{school.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {school.sports.length} Sports Programs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader style={{ backgroundColor: selectedSchool.colors.primary + '10' }}>
          <CardTitle 
            className="text-2xl flex items-center gap-3" 
            style={{ color: selectedSchool.colors.primary }}
          >
            <Trophy className="w-6 h-6" />
            {selectedSchool.name} - Tournament Management
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Principal: {selectedSchool.principal} • {selectedSchool.slogan}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sports" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sports">Sports Programs</TabsTrigger>
              <TabsTrigger value="tournaments">Create Tournament</TabsTrigger>
              <TabsTrigger value="history">School History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="sports" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedSchool.sports.map((sport) => (
                  <Card key={sport} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <p className="font-medium capitalize text-gray-700 dark:text-gray-200">
                        {sport.replace('-', ' ')}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => createTournament(selectedSchool.id, sport)}
                        data-testid={`button-tournament-${sport}`}
                      >
                        Create Tournament
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tournaments" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tournament Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        className="w-full" 
                        onClick={() => alert("Single Elimination tournament created!")}
                        data-testid="button-single-elimination"
                      >
                        Single Elimination Bracket
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => alert("Double Elimination tournament created!")}
                        data-testid="button-double-elimination"
                      >
                        Double Elimination Bracket
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => alert("Round Robin tournament created!")}
                        data-testid="button-round-robin"
                      >
                        Round Robin Tournament
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Miller VLC Cross-School Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        className="w-full" 
                        style={{ backgroundColor: selectedSchool.colors.primary }}
                        onClick={() => alert("Miller VLC Championship created!")}
                        data-testid="button-vlc-championship"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Miller VLC Championship
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => alert("Middle School Pipeline tournament created!")}
                        data-testid="button-pipeline-tournament"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Middle School Pipeline Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>School Legacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSchool.level === 'high-school' && (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Established:</strong> {selectedSchool.established}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedSchool.history}
                        </p>
                        {selectedSchool.championships && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Medal className="w-4 h-4" />
                              Championships
                            </h4>
                            {selectedSchool.championships.map((champ, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{champ.year}</Badge>
                                <span className="capitalize">{champ.sport} - {champ.level}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {selectedSchool.level === 'middle-school' && (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Serves Grades:</strong> {selectedSchool.grades}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Feeds To:</strong> Roy Miller High School
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Essential pipeline school for developing athletic talent and academic achievement.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Athletic Excellence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Classification:</strong> {selectedSchool.classification || 'CCISD Middle School'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Total Sports:</strong> {selectedSchool.sports.length} programs
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>VLC Integration:</strong> Cross-school tournaments enabled
                      </p>
                      {selectedSchool.specialPrograms && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Special Programs</h4>
                          {selectedSchool.specialPrograms.map((program, idx) => (
                            <Badge key={idx} variant="secondary" className="mr-2 mb-1">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Tournament Ready</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
                    <p className="text-sm text-gray-600">
                      All brackets and formats pre-loaded
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Cost Savings</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">$47,510</div>
                    <p className="text-sm text-gray-600">
                      Annual savings vs competitors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Deployment Time</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">1 Day</div>
                    <p className="text-sm text-gray-600">
                      Ready to launch immediately
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Military-Grade Tournament Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Strategic Planning</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Mission-focused tournament objectives</li>
                        <li>• Resource allocation and logistics</li>
                        <li>• Contingency planning and protocols</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Execution Excellence</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Clear chain of command</li>
                        <li>• Real-time situation monitoring</li>
                        <li>• After-action reviews and improvement</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready for CCISD Deployment</h2>
          <p className="text-lg mb-6">
            Complete Miller VLC platform ready for immediate implementation
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => alert("Scheduling CCISD presentation...")}
              data-testid="button-schedule-demo"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white hover:bg-white hover:text-blue-600"
              onClick={() => alert("Activating Miller VLC platform...")}
              data-testid="button-activate-platform"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Activate Platform
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}