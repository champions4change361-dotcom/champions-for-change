import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Clock, Share2, Edit } from "lucide-react";
import { useLocation } from "wouter";

interface ContestDetailProps {
  params: {
    contestId: string;
  };
}

export default function ContestDetail({ params }: ContestDetailProps) {
  const [, setLocation] = useLocation();
  const { contestId } = params;

  // Fetch contest details
  const { data: contestResponse, isLoading } = useQuery<{success: boolean; contest: any}>({
    queryKey: [`/api/fantasy/showdown/${contestId}`],
  });

  const contest = contestResponse?.contest;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Contest Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The contest you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/fantasy-tournaments")}>
              Back to Fantasy Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleShareContest = () => {
    const shareUrl = `${window.location.origin}/fantasy/contest/${contestId}`;
    navigator.clipboard.writeText(shareUrl);
    // TODO: Add toast notification
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Contest Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{contest.contestName}</CardTitle>
              <p className="text-muted-foreground mt-2">{contest.gameDescription}</p>
            </div>
            <Badge variant={contest.status === 'open' ? 'default' : 'secondary'}>
              {contest.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Entries</p>
                <p className="font-semibold">{contest.currentEntries}/{contest.maxEntries}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Lineup Lock</p>
                <p className="font-semibold">
                  {new Date(contest.lineupLockTime).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Prize</p>
                <p className="font-semibold">{contest.prizePool}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <Button 
              onClick={handleShareContest}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Contest</span>
            </Button>
            
            <Button 
              onClick={() => setLocation(`/fantasy/lineup/${contestId}`)}
              disabled={contest.status !== 'open'}
            >
              {contest.status === 'open' ? 'Draft Lineup' : 'Contest Closed'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contest Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Contest Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Lineup Structure</h3>
                <ul className="text-sm space-y-1">
                  <li>• 1 Captain (1.5x points)</li>
                  <li>• 5 FLEX players</li>
                  <li>• Total: 6 players</li>
                  <li>• All from: {contest.gameDescription}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Contest Details</h3>
                <ul className="text-sm space-y-1">
                  <li>• Entry Fee: {contest.entryFee === 0 ? 'Free' : `$${contest.entryFee}`}</li>
                  <li>• Captain Multiplier: {contest.captainMultiplier}x</li>
                  <li>• Max Entries: {contest.maxEntries}</li>
                  {contest.salaryCapEnabled && (
                    <li>• Salary Cap: ${contest.salaryCap?.toLocaleString()}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry List Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Current Entries ({contest.currentEntries})</CardTitle>
        </CardHeader>
        <CardContent>
          {contest.currentEntries > 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Entry list will be displayed here when available
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No entries yet. Be the first to join!
              </p>
              <Button 
                className="mt-4"
                onClick={() => setLocation(`/fantasy/lineup/${contestId}`)}
                disabled={contest.status !== 'open'}
              >
                Enter Contest
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}