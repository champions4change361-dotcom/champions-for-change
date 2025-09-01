import React from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'wouter';

export default function TournamentEditPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/tournaments/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Edit Tournament
          </h1>
          <p className="text-gray-600 mt-2">
            Modify tournament settings and configuration
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Tournament Editing - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Tournament editing functionality is currently under development. 
              This feature will allow you to modify tournament settings, add/remove teams, 
              and update tournament configuration after creation.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                Planned Features:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                <li>Edit tournament name, sport, and basic settings</li>
                <li>Add or remove teams from the tournament</li>
                <li>Modify tournament format and bracket type</li>
                <li>Update age groups and gender divisions</li>
                <li>Change tournament dates and scheduling</li>
                <li>Configure registration and payment settings</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                In the meantime, you can manage your tournament from the main tournament page:
              </p>
              <Link href={`/tournaments/${id}`}>
                <Button className="mr-3">
                  Return to Tournament
                </Button>
              </Link>
              <Link href="/tournaments">
                <Button variant="outline">
                  View All Tournaments
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}