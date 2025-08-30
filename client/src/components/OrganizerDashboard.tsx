import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  Users, Eye, Mail, Phone, TrendingUp, Calendar, 
  MapPin, Download, Filter, Search, MoreVertical,
  Globe, Smartphone, Monitor, UserPlus, Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface OrganizerDashboardProps {
  organizerId: string;
}

interface AnalyticsData {
  pageViews: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    newVisitors: number;
  }>;
  contacts: Array<{
    id: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactSource: string;
    contactRole: string;
    organizationName: string;
    teamName: string;
    city: string;
    state: string;
    emailOptIn: boolean;
    smsOptIn: boolean;
    totalTournaments: number;
    collectedAt: string;
  }>;
  metrics: {
    totalPageViews: number;
    totalContacts: number;
    emailOptIns: number;
    smsOptIns: number;
    avgSessionDuration: number;
    topCities: Array<{city: string, count: number}>;
    topStates: Array<{state: string, count: number}>;
  };
}

export default function OrganizerDashboard({ organizerId }: OrganizerDashboardProps) {
  const [dateRange, setDateRange] = useState(365); // Default 1 year
  const [contactFilter, setContactFilter] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("pageViews");

  // Fetch organizer analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/organizer-analytics", organizerId, dateRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/organizer-analytics/${organizerId}?days=${dateRange}`);
      return await response.json();
    }
  });

  // Generate date range for the chart
  const generateDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Process page view data for line chart
  const processPageViewData = () => {
    if (!analytics?.pageViews) return [];
    
    const dateRange = generateDateRange(dateRange);
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = analytics.pageViews.find((d: any) => d.date === dateStr);
      return {
        date: format(date, 'MMM dd'),
        views: dayData?.views || 0,
        uniqueVisitors: dayData?.uniqueVisitors || 0,
        newVisitors: dayData?.newVisitors || 0
      };
    });
  };

  const filteredContacts = analytics?.contacts?.filter((contact: any) => 
    contact.contactName.toLowerCase().includes(contactFilter.toLowerCase()) ||
    contact.contactEmail.toLowerCase().includes(contactFilter.toLowerCase()) ||
    contact.organizationName?.toLowerCase().includes(contactFilter.toLowerCase()) ||
    contact.teamName?.toLowerCase().includes(contactFilter.toLowerCase())
  ) || [];

  const chartColors = {
    primary: "#3b82f6",
    secondary: "#10b981", 
    accent: "#f59e0b",
    danger: "#ef4444"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pageViewData = processPageViewData();

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Organizer Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Complete tournament analytics and contact management dashboard</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            data-testid="date-range-selector"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          
          <Button variant="outline" data-testid="export-data" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Page Views</CardTitle>
            <Eye className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {analytics?.metrics?.totalPageViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Contacts</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {analytics?.metrics?.totalContacts?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Email Subs</CardTitle>
            <Mail className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {analytics?.metrics?.emailOptIns?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.metrics?.totalContacts ? 
                Math.round((analytics.metrics.emailOptIns / analytics.metrics.totalContacts) * 100) : 0}% opt-in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Session Time</CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {analytics?.metrics?.avgSessionDuration ? 
                Math.round(analytics.metrics.avgSessionDuration / 60) : 0}m
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="analytics" data-testid="tab-analytics" className="text-xs md:text-sm py-2 md:py-3">
            <span className="hidden sm:inline">Page Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts" className="text-xs md:text-sm py-2 md:py-3">
            <span className="hidden sm:inline">Contact Management</span>
            <span className="sm:hidden">Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="demographics" data-testid="tab-demographics" className="text-xs md:text-sm py-2 md:py-3">
            Demographics
          </TabsTrigger>
        </TabsList>

        {/* Page Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Page Views Over Time</span>
              </CardTitle>
              <CardDescription>
                Daily page views, unique visitors, and new visitors for the last {dateRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
                <LineChart data={pageViewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke={chartColors.primary} 
                    strokeWidth={2}
                    name="Page Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke={chartColors.secondary} 
                    strokeWidth={2}
                    name="Unique Visitors"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newVisitors" 
                    stroke={chartColors.accent} 
                    strokeWidth={2}
                    name="New Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: "Tournament Home", views: 2430, percentage: 45 },
                    { page: "Registration", views: 1890, percentage: 35 },
                    { page: "Teams & Brackets", views: 756, percentage: 14 },
                    { page: "Results", views: 324, percentage: 6 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.page}</p>
                        <p className="text-sm text-gray-500">{item.views.toLocaleString()} views</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device & Browser Stats</CardTitle>
                <CardDescription>How visitors access your tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span>Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }} />
                      </div>
                      <span className="text-sm text-gray-600">68%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-green-600" />
                      <span>Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "32%" }} />
                      </div>
                      <span className="text-sm text-gray-600">32%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Management Tab */}
        <TabsContent value="contacts" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Contact Database</span>
                  </CardTitle>
                  <CardDescription>
                    All contacts collected from tournament registrations and interactions
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={contactFilter}
                      onChange={(e) => setContactFilter(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                      data-testid="contact-search"
                    />
                  </div>
                  
                  <Button variant="outline" data-testid="export-contacts">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-600">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-600">Source</th>
                      <th className="text-left p-3 font-medium text-gray-600">Organization</th>
                      <th className="text-left p-3 font-medium text-gray-600">Location</th>
                      <th className="text-left p-3 font-medium text-gray-600">Preferences</th>
                      <th className="text-left p-3 font-medium text-gray-600">Tournaments</th>
                      <th className="text-left p-3 font-medium text-gray-600">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.slice(0, 50).map((contact: any, index: number) => (
                      <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900">{contact.contactName}</p>
                            <p className="text-sm text-gray-500">{contact.contactEmail}</p>
                            {contact.contactPhone && (
                              <p className="text-sm text-gray-500">{contact.contactPhone}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {contact.contactSource.replace('_', ' ')}
                          </Badge>
                          {contact.contactRole && (
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              {contact.contactRole}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <div>
                            {contact.organizationName && (
                              <p className="font-medium text-gray-700">{contact.organizationName}</p>
                            )}
                            {contact.teamName && (
                              <p className="text-sm text-gray-500">{contact.teamName}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{contact.city}, {contact.state}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            {contact.emailOptIn && (
                              <Badge variant="secondary" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                            {contact.smsOptIn && (
                              <Badge variant="secondary" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                SMS
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-gray-700">
                            {contact.totalTournaments}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {format(new Date(contact.collectedAt), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredContacts.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                    <p className="text-gray-600">
                      {contactFilter ? "Try adjusting your search terms." : "Start collecting contacts through tournament registrations."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
                <CardDescription>Where your participants are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.metrics?.topCities || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Participant distribution by state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.metrics?.topStates || []).slice(0, 10).map((state: any, index: number) => (
                    <div key={state.state} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">{state.state}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(state.count / Math.max(...(analytics?.metrics?.topStates || []).map((s: any) => s.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{state.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}