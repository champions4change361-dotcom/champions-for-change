import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Users, Settings, CreditCard, LogOut, GraduationCap, Heart, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TournamentCreationForm from "@/components/tournament-creation-form";
import AIConsultation from "@/components/ai-consultation";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIConsultation, setShowAIConsultation] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'tournaments' | 'billing' | 'settings'>('dashboard');

  // Listen for events to open tournament form
  useEffect(() => {
    const handleOpenTournamentForm = () => {
      setShowAIConsultation(false); // Close AI consultation
      setShowCreateForm(true); // Open tournament form
    };

    window.addEventListener('open-tournament-form', handleOpenTournamentForm);
    
    return () => {
      window.removeEventListener('open-tournament-form', handleOpenTournamentForm);
    };
  }, []);

  const { data: myTournaments } = useQuery({
    queryKey: ["/api/my-tournaments"],
    enabled: !!user,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/tournament-insights"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">TournamentPro</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateForm(false)}
              data-testid="button-back"
            >
              Back to Dashboard
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <TournamentCreationForm onClose={() => setShowCreateForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={championLogo} 
                  alt="Champions for Change" 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Champions for Change</div>
                  <div className="text-xs text-green-600 font-medium">Tournament Dashboard</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="text-user-plan">
                  Free Plan
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <Heart className="h-3 w-3 mr-1" />
                  Supporting Students
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right" data-testid="text-user-info">
                <div className="font-medium">
                  {(user as any)?.firstName && (user as any)?.lastName 
                    ? `${(user as any).firstName} ${(user as any).lastName}` 
                    : (user as any)?.email || "User"
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {(user as any)?.email}
                </div>
              </div>
              
              {(user as any)?.profileImageUrl && (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid="img-avatar"
                />
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {(user as any)?.firstName || "Champion"}!
              </h1>
              <p className="text-green-100 mb-4">
                Every tournament you create helps fund educational opportunities for students in Corpus Christi, Texas.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>Supporting Education</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>Built by Coaches</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$2,600+</div>
              <div className="text-green-200 text-sm">Per Student Trip</div>
              <div className="text-xs text-green-300 mt-1">Costs covered first</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-green-200 hover:border-green-400" onClick={() => setShowCreateForm(true)}>
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Create Tournament</CardTitle>
              <CardDescription>Start supporting students</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-purple-200 hover:border-purple-400" onClick={() => setShowAIConsultation(true)}>
            <CardHeader className="text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Keystone AI</CardTitle>
              <CardDescription>Tournament consultant</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-blue-200 hover:border-blue-400" onClick={() => setActiveView('tournaments')}>
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">My Tournaments</CardTitle>
              <CardDescription>{(myTournaments as any)?.length || 0} active</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-orange-200 hover:border-orange-400" onClick={() => setActiveView('billing')}>
            <CardHeader className="text-center">
              <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Impact & Billing</CardTitle>
              <CardDescription>View student support</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-gray-200 hover:border-gray-400" onClick={() => setActiveView('settings')}>
            <CardHeader className="text-center">
              <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Account & preferences</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* AI Consultation Modal */}
        {showAIConsultation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Keystone AI Tournament Consultant</h2>
                  <Button variant="ghost" onClick={() => setShowAIConsultation(false)}>✕</Button>
                </div>
                <AIConsultation />
              </div>
            </div>
          </div>
        )}

        {/* Impact & Statistics */}
        {insights && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              Your Educational Impact
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-green-600" data-testid="text-total-tournaments">
                    {(insights as any)?.total_tournaments || 0}
                  </CardTitle>
                  <CardDescription>Tournaments Created</CardDescription>
                  <div className="text-xs text-green-600 mt-1">Supporting students</div>
                </CardHeader>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-blue-600" data-testid="text-active-tournaments">
                    {(insights as any)?.active_tournaments || 0}
                  </CardTitle>
                  <CardDescription>Active Tournaments</CardDescription>
                  <div className="text-xs text-blue-600 mt-1">Currently funding education</div>
                </CardHeader>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-purple-600" data-testid="text-completed-tournaments">
                    {(insights as any)?.completed_tournaments || 0}
                  </CardTitle>
                  <CardDescription>Completed Tournaments</CardDescription>
                  <div className="text-xs text-purple-600 mt-1">Impact achieved</div>
                </CardHeader>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-orange-600" data-testid="text-sports-available">
                    {(insights as any)?.total_sports_available || 65}
                  </CardTitle>
                  <CardDescription>Sports Available</CardDescription>
                  <div className="text-xs text-orange-600 mt-1">Maximum options</div>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Tournaments</CardTitle>
            <CardDescription>
              {(myTournaments as any)?.length ? 
                `You have ${(myTournaments as any).length} tournament${(myTournaments as any).length > 1 ? 's' : ''}` :
                'No tournaments created yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!(myTournaments as any)?.length ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create your first tournament to get started!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-first-tournament"
                >
                  Create Tournament
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(myTournaments as any)?.slice(0, 5).map((tournament: any) => (
                  <div 
                    key={tournament.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid={`card-tournament-${tournament.id}`}
                  >
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">
                        {tournament.sport} • {tournament.teams?.length || 0} teams
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={tournament.status === 'completed' ? 'default' : 'secondary'}
                        data-testid={`status-tournament-${tournament.id}`}
                      >
                        {tournament.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}