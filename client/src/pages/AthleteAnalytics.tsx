import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar, Clock, TrendingUp, TrendingDown, Award, Users } from "lucide-react";

interface PerformanceData {
  id: string;
  athleteId: string;
  athleteName: string;
  eventName: string;
  eventType: "backstroke" | "freestyle" | "butterfly" | "breaststroke" | "individual_medley";
  meetName: string;
  meetDate: string;
  timeInSeconds: number;
  formattedTime: string;
  placement: number;
  personalBest: boolean;
  seasonBest: boolean;
}

interface AnalyticsProps {
  athleteId?: string;
  isCoachView?: boolean;
}

export default function AthleteAnalytics({ athleteId, isCoachView = false }: AnalyticsProps) {
  const [selectedAthlete, setSelectedAthlete] = useState<string>(athleteId || "");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("2024-25");

  // Fetch performance data
  const { data: performanceData, isLoading } = useQuery<PerformanceData[]>({
    queryKey: [`/api/analytics/performance/${selectedAthlete}`, selectedEvent, selectedSeason],
    enabled: !!selectedAthlete,
  });

  // Fetch athletes list for coach view
  const { data: athletes } = useQuery({
    queryKey: ["/api/athletes"],
    enabled: isCoachView,
  });

  // Process data for line charts
  const processDataForChart = (data: PerformanceData[], eventType: string) => {
    if (!data) return [];
    
    const filteredData = eventType === "all" 
      ? data 
      : data.filter(d => d.eventType === eventType);
    
    return filteredData
      .sort((a, b) => new Date(a.meetDate).getTime() - new Date(b.meetDate).getTime())
      .map(d => ({
        date: new Date(d.meetDate).toLocaleDateString(),
        fullDate: d.meetDate,
        time: d.timeInSeconds,
        formattedTime: d.formattedTime,
        meetName: d.meetName,
        placement: d.placement,
        personalBest: d.personalBest,
        seasonBest: d.seasonBest,
        eventName: d.eventName
      }));
  };

  const getUniqueEvents = (data: PerformanceData[]) => {
    if (!data) return [];
    const uniqueEvents = new Set(data.map(d => d.eventType));
    return Array.from(uniqueEvents);
  };

  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return { trend: "stable", improvement: 0 };
    
    const recent = data.slice(-3).map(d => d.time);
    const earlier = data.slice(0, -3).map(d => d.time);
    
    if (earlier.length === 0) return { trend: "stable", improvement: 0 };
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const improvement = ((earlierAvg - recentAvg) / earlierAvg) * 100;
    
    if (improvement > 1) return { trend: "improving", improvement };
    if (improvement < -1) return { trend: "declining", improvement };
    return { trend: "stable", improvement };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}s`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold">{data.meetName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {data.formattedTime}
          </p>
          <p className="text-sm">
            Place: #{data.placement}
            {data.personalBest && <Badge className="ml-2 bg-gold text-black">PB</Badge>}
            {data.seasonBest && <Badge className="ml-2 bg-green-600 text-white">SB</Badge>}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderEventChart = (eventType: string, eventDisplayName: string) => {
    const chartData = processDataForChart(performanceData || [], eventType);
    if (chartData.length === 0) return null;

    const trend = calculateTrend(chartData);
    const personalBest = Math.min(...chartData.map(d => d.time));
    const personalBestFormatted = formatTime(personalBest);

    return (
      <Card key={eventType} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                {eventDisplayName}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Season progression • Personal Best: {personalBestFormatted}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {trend.trend === "improving" && (
                <Badge className="bg-green-100 text-green-800">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Improving {trend.improvement.toFixed(1)}%
                </Badge>
              )}
              {trend.trend === "declining" && (
                <Badge className="bg-red-100 text-red-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Slower {Math.abs(trend.improvement).toFixed(1)}%
                </Badge>
              )}
              {trend.trend === "stable" && (
                <Badge className="bg-gray-100 text-gray-800">
                  Stable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-gray-600 dark:text-gray-400"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={formatTime}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Recent performances summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.slice(-3).map((performance, index) => (
              <div 
                key={index} 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{performance.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-bold text-blue-600">{performance.formattedTime}</span>
                  {performance.personalBest && <Badge className="bg-yellow-100 text-yellow-800">PB</Badge>}
                  {performance.seasonBest && <Badge className="bg-green-100 text-green-800">SB</Badge>}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {performance.meetName} • #{performance.placement}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isCoachView ? "Team Analytics" : "Performance Analytics"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Track athletic performance over time with detailed analytics and trend analysis.
            Private view for coaches and athletes only.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          {isCoachView && (
            <div className="min-w-48">
              <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                <SelectTrigger data-testid="select-athlete">
                  <SelectValue placeholder="Select athlete" />
                </SelectTrigger>
                <SelectContent>
                  {(athletes as any[])?.map((athlete: any) => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      {athlete.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="min-w-32">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger data-testid="select-season">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25 Season</SelectItem>
                <SelectItem value="2023-24">2023-24 Season</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Charts */}
        {performanceData && performanceData.length > 0 ? (
          <div className="space-y-8">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="freestyle">Freestyle</TabsTrigger>
                <TabsTrigger value="backstroke">Backstroke</TabsTrigger>
                <TabsTrigger value="breaststroke">Breaststroke</TabsTrigger>
                <TabsTrigger value="butterfly">Butterfly</TabsTrigger>
                <TabsTrigger value="individual_medley">IM</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <div className="space-y-6">
                  {getUniqueEvents(performanceData).map(eventType => 
                    renderEventChart(eventType, eventType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="freestyle" className="mt-8">
                {renderEventChart("freestyle", "Freestyle")}
              </TabsContent>

              <TabsContent value="backstroke" className="mt-8">
                {renderEventChart("backstroke", "Backstroke")}
              </TabsContent>

              <TabsContent value="breaststroke" className="mt-8">
                {renderEventChart("breaststroke", "Breaststroke")}
              </TabsContent>

              <TabsContent value="butterfly" className="mt-8">
                {renderEventChart("butterfly", "Butterfly")}
              </TabsContent>

              <TabsContent value="individual_medley" className="mt-8">
                {renderEventChart("individual_medley", "Individual Medley")}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Performance Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedAthlete ? "No performance data found for this athlete and season." : "Select an athlete to view their performance analytics."}
              </p>
              {isCoachView && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-record-performance"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Record New Performance
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}