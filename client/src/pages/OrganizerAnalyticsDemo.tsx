import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrganizerDashboard from "@/components/OrganizerDashboard";
import { 
  BarChart3, Users, Eye, TrendingUp, 
  ArrowLeft, Star, Play, Zap 
} from "lucide-react";

export default function OrganizerAnalyticsDemo() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDashboard(false)}
              className="flex items-center space-x-2"
              data-testid="back-to-demo"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Demo</span>
            </Button>
            
            <Badge variant="default" className="bg-green-600">
              <Star className="h-3 w-3 mr-1" />
              Jersey Watch Style
            </Badge>
          </div>
        </div>
        
        <OrganizerDashboard organizerId="demo_organizer_123" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Jersey Watch-Style Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The same powerful organizer dashboard features that made Jersey Watch popular - 
            contact collection, page view tracking, and comprehensive analytics.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Zap className="h-3 w-3 mr-1" />
              Contact Collection
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Eye className="h-3 w-3 mr-1" />
              Page View Analytics
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              1-Year Data History
            </Badge>
          </div>
        </div>

        {/* Jersey Watch Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Eye className="h-5 w-5" />
                <span>Page View Tracking</span>
              </CardTitle>
              <CardDescription>
                Track every page view on your tournaments with detailed analytics going back 1 full year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Views</span>
                  <span className="font-semibold text-blue-700">2,430</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unique Visitors</span>
                  <span className="font-semibold text-blue-700">1,890</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Session Duration</span>
                  <span className="font-semibold text-blue-700">4m 23s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Users className="h-5 w-5" />
                <span>Contact Collection</span>
              </CardTitle>
              <CardDescription>
                Automatically collect contact information from all tournament participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Contacts</span>
                  <span className="font-semibold text-green-700">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email Opt-ins</span>
                  <span className="font-semibold text-green-700">892 (72%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SMS Opt-ins</span>
                  <span className="font-semibold text-green-700">456 (37%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <TrendingUp className="h-5 w-5" />
                <span>Geographic Analytics</span>
              </CardTitle>
              <CardDescription>
                See where your participants are coming from with detailed location analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top City</span>
                  <span className="font-semibold text-orange-700">Austin (234)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top State</span>
                  <span className="font-semibold text-orange-700">Texas (78%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coverage</span>
                  <span className="font-semibold text-orange-700">5 States</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jersey Watch Comparison */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              What Made Jersey Watch Special
            </CardTitle>
            <CardDescription className="text-blue-100 text-center text-lg">
              We've replicated the key features that tournament organizers loved most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">📊 Line Graph Analytics</h4>
                <ul className="space-y-2 text-blue-100">
                  <li>• Daily page view tracking over 1 full year</li>
                  <li>• Unique visitor identification</li>
                  <li>• New vs returning visitor analysis</li>
                  <li>• Session duration monitoring</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">📧 Contact Database</h4>
                <ul className="space-y-2 text-blue-100">
                  <li>• Automatic contact collection from registrations</li>
                  <li>• Email and phone number capture</li>
                  <li>• Opt-in preference management</li>
                  <li>• Export capabilities for marketing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Features */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              See It In Action
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This demo includes realistic tournament data with page views, contact information, 
              and analytics spanning a full year - just like Jersey Watch provided.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-600">Contacts in Database</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">365 Days</div>
                <div className="text-sm text-gray-600">Page View History</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">5 Cities</div>
                <div className="text-sm text-gray-600">Geographic Coverage</div>
              </div>
            </div>
            
            <Button
              size="lg"
              onClick={() => setShowDashboard(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3"
              data-testid="launch-dashboard"
            >
              <Play className="h-5 w-5 mr-2" />
              Launch Organizer Dashboard
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            This dashboard replicates the contact collection and analytics features that made Jersey Watch 
            a favorite among tournament organizers. Data shown is for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}