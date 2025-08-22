import React from 'react';
import { useRoute } from 'wouter';
import TournamentManager from '@/components/tournament-manager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

export default function TournamentDetailPage() {
  const [match, params] = useRoute('/tournaments/:id');
  
  if (!match || !params?.id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tournament Not Found</h2>
            <p className="text-gray-600 mb-6">
              The tournament you're looking for doesn't exist or the URL is invalid.
            </p>
            <Link href="/tournaments">
              <Button className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tournaments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" data-testid="tournament-detail-page">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/tournaments">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tournaments
          </Button>
        </Link>
      </div>

      {/* Tournament Manager */}
      <TournamentManager tournamentId={params.id} />
    </div>
  );
}