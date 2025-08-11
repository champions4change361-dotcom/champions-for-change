import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TournamentInsights {
  total_tournaments: number;
  active_tournaments: number;
  completed_tournaments: number;
  popular_sports: { name: string; category: string; format: string }[];
  total_sports_available: number;
  format_breakdown: {
    bracket: number;
    leaderboard: number;
    series: number;
    hybrid: number;
  };
}

export default function TournamentInsights() {
  const { data: insights, isLoading } = useQuery<{ success: boolean; insights: TournamentInsights }>({
    queryKey: ["/api/tournament-insights"],
  });

  if (isLoading) {
    return (
      <Card data-testid="card-tournament-insights-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-chart-bar text-blue-500"></i>
            Platform Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights?.success) {
    return (
      <Card data-testid="card-tournament-insights-error">
        <CardHeader>
          <CardTitle className="text-red-600">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Insights Unavailable
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const { insights: data } = insights;

  return (
    <Card data-testid="card-tournament-insights">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-chart-bar text-blue-500"></i>
          Platform Insights
        </CardTitle>
        <CardDescription>
          Real-time tournament and sports statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tournament Statistics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tournament Activity</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-lg font-bold text-blue-600">{data.total_tournaments}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-lg font-bold text-green-600">{data.active_tournaments}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-bold text-gray-600">{data.completed_tournaments}</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Sports Coverage */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sports Coverage</h4>
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-purple-600">{data.total_sports_available}</div>
              <div className="text-sm text-gray-600">Sports Available</div>
            </div>
            <i className="fas fa-trophy text-purple-400 text-2xl"></i>
          </div>
        </div>

        {/* Format Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Format Distribution</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Bracket</span>
              <Badge variant="default">{data.format_breakdown.bracket}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Leaderboard</span>
              <Badge variant="secondary">{data.format_breakdown.leaderboard}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Series</span>
              <Badge variant="outline">{data.format_breakdown.series}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Hybrid</span>
              <Badge variant="destructive">{data.format_breakdown.hybrid}</Badge>
            </div>
          </div>
        </div>

        {/* Popular Sports Preview */}
        {data.popular_sports.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Sports</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.popular_sports.slice(0, 5).map((sport, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="truncate">{sport.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {sport.format}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          <i className="fas fa-sync-alt mr-1"></i>
          Live data • Updates automatically
        </div>
      </CardContent>
    </Card>
  );
}