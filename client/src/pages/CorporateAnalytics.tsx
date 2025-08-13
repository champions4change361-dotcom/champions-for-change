import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Users, Target, Building2, Trophy } from "lucide-react";

interface SalesPerformanceData {
  id: string;
  participantId: string;
  participantName: string;
  department: string;
  date: string;
  revenue: number;
  unitsSold: number;
  competitionId: string;
  competitionName: string;
}

interface LeaderboardEntry {
  id: string;
  participantName: string;
  department: string;
  totalRevenue: number;
  totalUnits: number;
  rank: number;
  change: string;
}

interface CorporateAnalyticsProps {
  competitionId?: string;
  isPublic?: boolean;
}

export default function CorporateAnalytics({ competitionId, isPublic = true }: CorporateAnalyticsProps) {
  const [selectedCompetition, setSelectedCompetition] = useState<string>(competitionId || "");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "units">("revenue");

  // Fetch sales performance data
  const { data: performanceData, isLoading } = useQuery<SalesPerformanceData[]>({
    queryKey: ["/api/corporate/analytics/performance", selectedCompetition, selectedDepartment],
    enabled: !!selectedCompetition,
  });

  // Fetch competitions list
  const { data: competitions } = useQuery({
    queryKey: ["/api/corporate/competitions"],
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/corporate/competitions", selectedCompetition, "leaderboard"],
    enabled: !!selectedCompetition,
  });

  // Process data for line charts
  const processDataForChart = (data: SalesPerformanceData[]) => {
    if (!data) return [];
    
    const groupedByDate = data.reduce((acc, item) => {
      const dateKey = new Date(item.date).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          fullDate: item.date,
          revenue: 0,
          units: 0,
          participants: new Set()
        };
      }
      acc[dateKey].revenue += item.revenue;
      acc[dateKey].units += item.unitsSold;
      acc[dateKey].participants.add(item.participantName);
      return acc;
    }, {} as any);

    return Object.values(groupedByDate)
      .map((item: any) => ({
        ...item,
        participantCount: item.participants.size
      }))
      .sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  };

  // Process department performance
  const processDepartmentData = (data: SalesPerformanceData[]) => {
    if (!data) return [];
    
    const groupedByDept = data.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = {
          department: item.department,
          revenue: 0,
          units: 0,
          participants: new Set()
        };
      }
      acc[item.department].revenue += item.revenue;
      acc[item.department].units += item.unitsSold;
      acc[item.department].participants.add(item.participantName);
      return acc;
    }, {} as any);

    return Object.values(groupedByDept).map((item: any) => ({
      ...item,
      participantCount: item.participants.size
    }));
  };

  // Calculate performance trends
  const calculateTrend = (data: any[], metric: "revenue" | "units") => {
    if (data.length < 2) return { trend: "stable", change: 0 };
    
    const recent = data.slice(-7); // Last 7 data points
    const earlier = data.slice(0, -7);
    
    if (earlier.length === 0) return { trend: "stable", change: 0 };
    
    const recentAvg = recent.reduce((sum, item) => sum + item[metric], 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item[metric], 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 5) return { trend: "improving", change };
    if (change < -5) return { trend: "declining", change };
    return { trend: "stable", change };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            Revenue: {formatCurrency(data.revenue)}
          </p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Units: {data.units.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Participants: {data.participantCount}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

  const chartData = processDataForChart(performanceData || []);
  const departmentData = processDepartmentData(performanceData || []);
  const revenueTrend = calculateTrend(chartData, "revenue");
  const unitsTrend = calculateTrend(chartData, "units");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sales Competition Analytics
            </h1>
            {isPublic && (
              <Badge className="bg-green-100 text-green-800">
                Public Community View
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Track sales performance, department competition, and revenue trends. 
            {isPublic ? " Visible to the entire competition community for motivation and friendly rivalry." : " Private view for leadership only."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="min-w-48">
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger data-testid="select-competition">
                <SelectValue placeholder="Select competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions?.map((comp: any) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-32">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger data-testid="select-department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-32">
            <Select value={selectedMetric} onValueChange={(value: "revenue" | "units") => setSelectedMetric(value)}>
              <SelectTrigger data-testid="select-metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue Focus</SelectItem>
                <SelectItem value="units">Units Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0))}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {revenueTrend.trend === "improving" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {revenueTrend.trend === "declining" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs ${revenueTrend.trend === "improving" ? "text-green-600" : revenueTrend.trend === "declining" ? "text-red-600" : "text-gray-500"}`}>
                  {revenueTrend.change > 0 ? "+" : ""}{revenueTrend.change.toFixed(1)}% vs previous period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartData.reduce((sum, item) => sum + item.units, 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {unitsTrend.trend === "improving" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {unitsTrend.trend === "declining" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs ${unitsTrend.trend === "improving" ? "text-green-600" : unitsTrend.trend === "declining" ? "text-red-600" : "text-gray-500"}`}>
                  {unitsTrend.change > 0 ? "+" : ""}{unitsTrend.change.toFixed(1)}% vs previous period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Across {departmentData.length} departments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {leaderboard?.[0]?.participantName || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {leaderboard?.[0] ? formatCurrency(leaderboard[0].totalRevenue) : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 ? (
          <div className="space-y-8">
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performance Trends</TabsTrigger>
                <TabsTrigger value="departments">Department Comparison</TabsTrigger>
                <TabsTrigger value="leaderboard">Live Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-8">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Sales Performance Over Time
                    </CardTitle>
                    <CardDescription>
                      Track daily revenue and unit sales progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            yAxisId="revenue"
                            orientation="left"
                            tickFormatter={formatCurrency}
                          />
                          <YAxis 
                            yAxisId="units"
                            orientation="right"
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            yAxisId="revenue"
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            name="Revenue ($)"
                          />
                          <Line 
                            yAxisId="units"
                            type="monotone" 
                            dataKey="units" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            name="Units Sold"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle>Department Revenue Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis tickFormatter={formatCurrency} />
                            <Tooltip formatter={([value]: any) => [formatCurrency(value), "Revenue"]} />
                            <Bar dataKey="revenue" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle>Revenue Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={departmentData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ department, percent }: any) => `${department} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="revenue"
                            >
                              {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={([value]: any) => [formatCurrency(value), "Revenue"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-8">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Live Competition Leaderboard</CardTitle>
                    <CardDescription>
                      Real-time rankings and performance metrics
                      {isPublic && <Badge className="ml-2 bg-green-100 text-green-800">Public View</Badge>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard?.slice(0, 10).map((participant, index) => (
                        <div
                          key={participant.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            index < 3 
                              ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
                              : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? "bg-yellow-500 text-white" :
                              index === 1 ? "bg-gray-400 text-white" :
                              index === 2 ? "bg-amber-600 text-white" :
                              "bg-gray-200 text-gray-700"
                            }`}>
                              {participant.rank}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {participant.participantName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {participant.department}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(participant.totalRevenue)}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {participant.totalUnits.toLocaleString()} units
                            </p>
                            {participant.change && (
                              <Badge className={`mt-1 ${
                                participant.change.startsWith('+') 
                                  ? 'bg-green-100 text-green-800'
                                  : participant.change.startsWith('-')
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {participant.change}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Performance Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select a competition to view sales analytics and performance trends.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}