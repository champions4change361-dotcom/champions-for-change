import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Trash2, Play, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Drafts() {
  const { user, isAuthenticated } = useAuth();

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ["/api/tournaments/drafts"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Tournament Drafts</h1>
        <p className="text-gray-600">Please log in to view your draft tournaments.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Tournament Drafts</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Drafts</h1>
          <p className="text-gray-600 mt-2">Continue working on your saved tournament drafts</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
        </Badge>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="max-w-md mx-auto">
              <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Tournaments</h3>
              <p className="text-gray-500 mb-6">
                Start creating a tournament and save it as a draft to continue working on it later.
              </p>
              <Button onClick={() => window.location.href = '/tournaments'}>
                Create New Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft: any) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5 text-blue-600" />
                      {draft.name || 'Untitled Tournament'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {draft.sport && <span className="font-medium">{draft.sport}</span>}
                      {draft.sport && draft.competitionFormat && ' • '}
                      {draft.competitionFormat && <span>{draft.competitionFormat}</span>}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Draft</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  {draft.teamSize && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {draft.teamSize} {draft.competitionFormat === 'leaderboard' ? 'participants' : 'teams'}
                    </div>
                  )}
                  {draft.tournamentDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(draft.tournamentDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="text-gray-400">
                    Last modified {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      // Store draft ID and redirect to tournament wizard
                      localStorage.setItem('continueFromDraft', draft.id);
                      window.location.href = '/tournaments';
                    }}
                    data-testid={`button-continue-draft-${draft.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Continue Editing
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Convert draft to live tournament
                      console.log('Publishing draft:', draft.id);
                    }}
                    data-testid={`button-publish-draft-${draft.id}`}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Delete draft
                      if (confirm('Are you sure you want to delete this draft?')) {
                        console.log('Deleting draft:', draft.id);
                      }
                    }}
                    data-testid={`button-delete-draft-${draft.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}