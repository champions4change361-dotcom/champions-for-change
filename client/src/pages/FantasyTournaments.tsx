import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

export default function FantasyTournaments() {
  const [selectedFormat, setSelectedFormat] = useState<'knockout' | 'performance'>('performance');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-600">Fantasy Sports Tournaments</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Data-driven fantasy competitions supporting Champions for Change educational mission. 
          Pure skill-based play with real player statistics - no gambling, just champions supporting champions.
        </p>
      </div>

      <Tabs defaultValue="performance" onValueChange={(value) => setSelectedFormat(value as 'knockout' | 'performance')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance" data-testid="tab-performance">Player Performance</TabsTrigger>
          <TabsTrigger value="knockout" data-testid="tab-knockout">Knockout Elimination</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Player Performance Fantasy Leagues
              </CardTitle>
              <CardDescription>
                Season-long fantasy competitions based on real player statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">How It Works:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Draft teams using real player statistics</li>
                    <li>• Points based on actual game performance</li>
                    <li>• Season-long cumulative scoring</li>
                    <li>• Weekly roster adjustments allowed</li>
                    <li>• Championship based on total season points</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Educational Focus:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Learn sports analytics and statistics</li>
                    <li>• Data analysis and trend recognition</li>
                    <li>• Strategic thinking and planning</li>
                    <li>• Research skills development</li>
                    <li>• Mathematical reasoning practice</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  🎯 Data-Only Platform: We provide statistics and tracking tools. 
                  Users handle any external activities independently.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fantasy Football</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">NFL player performance tracking with position-based scoring</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-create-fantasy-football">
                  Create League
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fantasy Basketball</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">NBA stats with real-time scoring updates during games</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-create-fantasy-basketball">
                  Create League
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fantasy Baseball</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">MLB season-long competitions with daily lineup changes</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-create-fantasy-baseball">
                  Create League
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knockout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-600" />
                Knockout Fantasy Tournaments
              </CardTitle>
              <CardDescription>
                Weekly elimination-style fantasy competitions with head-to-head matchups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Tournament Format:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Single-elimination bracket style</li>
                    <li>• Weekly fantasy team matchups</li>
                    <li>• Lowest-performing teams eliminated</li>
                    <li>• Head-to-head scoring battles</li>
                    <li>• Winner takes championship title</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Skills Developed:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Quick decision-making under pressure</li>
                    <li>• Risk assessment and management</li>
                    <li>• Competitive strategy development</li>
                    <li>• Adaptability to changing circumstances</li>
                    <li>• Performance analysis skills</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  🏆 Champions for Change Mission: All tournament activity supports funding 
                  educational trips for Corpus Christi students.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Weekly Knockout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Fast-paced weekly eliminations based on fantasy team performance
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-create-weekly-knockout">
                  Start Tournament
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Championship Series
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Multi-week knockout series culminating in fantasy championship
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-create-championship-series">
                  Start Series
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources & Analytics</CardTitle>
          <CardDescription>
            Transparent, educational approach to sports data and fantasy competition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Real-Time Stats</h4>
              <p className="text-sm text-gray-600">Official sports league APIs provide live player performance data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Educational Focus</h4>
              <p className="text-sm text-gray-600">Learn sports analytics while supporting student educational opportunities</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Data Export</h4>
              <p className="text-sm text-gray-600">Export tournament data for external analysis and research</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Champions for Change provides data and tournament management tools only. 
              This platform does not facilitate gambling or monetary wagering. Users are responsible for their own activities outside this platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}