import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Copy, 
  Key, 
  Book, 
  Zap, 
  Shield, 
  Download,
  ExternalLink,
  CheckCircle,
  Globe,
  Database,
  Webhook
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function EnterpriseApiDocs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState("tournaments");
  const [apiKey, setApiKey] = useState(process.env.VITE_STRIPE_PUBLIC_KEY || "your_api_key_here");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API example copied successfully"
    });
  };

  const apiEndpoints = {
    tournaments: {
      title: "Tournament Management",
      description: "Create, manage, and retrieve tournament data",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/tournaments",
          description: "List all tournaments for your organization",
          response: `{
  "tournaments": [
    {
      "id": "trn_abc123",
      "name": "Spring Basketball Championship",
      "sport": "basketball",
      "status": "active",
      "start_date": "2024-03-15",
      "registration_count": 24,
      "bracket_url": "https://yourorg.com/tournaments/trn_abc123"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 156
  }
}`
        },
        {
          method: "POST",
          path: "/api/v1/tournaments",
          description: "Create a new tournament",
          request: `{
  "name": "Summer Soccer League",
  "sport": "soccer",
  "format": "round_robin",
  "start_date": "2024-06-01",
  "registration_fee": 25.00,
  "max_teams": 16,
  "public": true
}`,
          response: `{
  "tournament": {
    "id": "trn_def456",
    "name": "Summer Soccer League",
    "status": "draft",
    "registration_url": "https://yourorg.com/register/trn_def456"
  }
}`
        }
      ]
    },
    registrations: {
      title: "Registration Management",
      description: "Handle team and participant registrations",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/tournaments/{id}/registrations",
          description: "Get all registrations for a tournament",
          response: `{
  "registrations": [
    {
      "id": "reg_xyz789",
      "tournament_id": "trn_abc123",
      "team_name": "Thunder Hawks",
      "contact_email": "coach@hawks.com",
      "payment_status": "paid",
      "registered_at": "2024-02-15T10:30:00Z"
    }
  ]
}`
        },
        {
          method: "POST",
          path: "/api/v1/registrations/{id}/approve",
          description: "Approve a pending registration",
          response: `{
  "registration": {
    "id": "reg_xyz789",
    "status": "approved",
    "approved_at": "2024-02-16T14:22:00Z"
  }
}`
        }
      ]
    },
    brackets: {
      title: "Bracket & Scoring",
      description: "Manage tournament brackets and live scoring",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/tournaments/{id}/bracket",
          description: "Get tournament bracket structure",
          response: `{
  "bracket": {
    "tournament_id": "trn_abc123",
    "format": "single_elimination",
    "rounds": [
      {
        "round": 1,
        "games": [
          {
            "id": "game_1",
            "team_a": "Thunder Hawks",
            "team_b": "Lightning Bolts",
            "scheduled_time": "2024-03-15T09:00:00Z",
            "status": "scheduled"
          }
        ]
      }
    ]
  }
}`
        },
        {
          method: "PUT",
          path: "/api/v1/games/{id}/score",
          description: "Update game score",
          request: `{
  "team_a_score": 78,
  "team_b_score": 65,
  "status": "completed",
  "game_notes": "Great game! Thunder Hawks advance."
}`,
          response: `{
  "game": {
    "id": "game_1",
    "team_a_score": 78,
    "team_b_score": 65,
    "status": "completed",
    "winner": "Thunder Hawks"
  }
}`
        }
      ]
    },
    analytics: {
      title: "Analytics & Reporting",
      description: "Access tournament performance data and insights",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/analytics/tournaments/{id}",
          description: "Get detailed tournament analytics",
          response: `{
  "analytics": {
    "tournament_id": "trn_abc123",
    "registration_stats": {
      "total_registrations": 24,
      "conversion_rate": 0.85,
      "average_registration_value": 45.00
    },
    "engagement_metrics": {
      "bracket_views": 1247,
      "live_score_updates": 89,
      "mobile_usage_percent": 67
    },
    "revenue_breakdown": {
      "registration_fees": 1080.00,
      "merchandise_sales": 340.50,
      "total_revenue": 1420.50
    }
  }
}`
        }
      ]
    },
    webhooks: {
      title: "Webhooks & Events",
      description: "Real-time notifications for tournament events",
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/webhooks",
          description: "Create a new webhook endpoint",
          request: `{
  "url": "https://yourapp.com/webhooks/tournament",
  "events": [
    "tournament.created",
    "registration.completed",
    "game.scored",
    "bracket.updated"
  ],
  "active": true
}`,
          response: `{
  "webhook": {
    "id": "wh_123456",
    "url": "https://yourapp.com/webhooks/tournament",
    "events": ["tournament.created", "registration.completed"],
    "secret": "whsec_[generated_webhook_secret]"
  }
}`
        }
      ]
    }
  };

  const currentEndpoint = apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints];

  const generateCurlExample = (method: string, path: string, requestBody?: string) => {
    const baseUrl = `https://yourorg.trantortournaments.org`;
    let curl = `curl -X ${method} "${baseUrl}${path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`;
    
    if (requestBody) {
      curl += ` \\
  -d '${requestBody}'`;
    }
    
    return curl;
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl" data-testid="enterprise-api-docs">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Enterprise API Documentation</h1>
            <p className="text-muted-foreground">
              Complete API reference for your white-label tournament platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            API v1.0 Stable
          </Badge>
          <Badge variant="outline">
            <Globe className="h-3 w-3 mr-1" />
            RESTful API
          </Badge>
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            OAuth 2.0 / API Keys
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(apiEndpoints).map(([key, endpoint]) => (
                <Button
                  key={key}
                  variant={selectedEndpoint === key ? "default" : "ghost"}
                  className={`w-full justify-start ${selectedEndpoint === key ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setSelectedEndpoint(key)}
                  data-testid={`nav-${key}`}
                >
                  {endpoint.title}
                </Button>
              ))}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Quick Links</h4>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" data-testid="link-authentication">
                  <Key className="h-3 w-3 mr-2" />
                  Authentication
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" data-testid="link-rate-limits">
                  <Zap className="h-3 w-3 mr-2" />
                  Rate Limits
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" data-testid="link-errors">
                  <Shield className="h-3 w-3 mr-2" />
                  Error Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Key Management */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">API Key</CardTitle>
              <CardDescription>Your authentication token</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value={apiKey} 
                  readOnly 
                  className="font-mono text-xs"
                  data-testid="api-key-input"
                />
                <Button size="sm" variant="outline" data-testid="copy-api-key">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline" data-testid="generate-new-key">
                Generate New Key
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentEndpoint.title}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="download-postman">
                    <Download className="h-3 w-3 mr-1" />
                    Postman
                  </Button>
                  <Button variant="outline" size="sm" data-testid="view-openapi">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    OpenAPI
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{currentEndpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentEndpoint.endpoints.map((endpoint, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500" data-testid={`endpoint-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={
                            endpoint.method === "GET" ? "bg-green-100 text-green-800" :
                            endpoint.method === "POST" ? "bg-blue-100 text-blue-800" :
                            endpoint.method === "PUT" ? "bg-orange-100 text-orange-800" :
                            "bg-red-100 text-red-800"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="curl" className="w-full">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                          {endpoint.response && <TabsTrigger value="response">Response</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="curl" className="mt-4">
                          <div className="relative">
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                              <code>{generateCurlExample(endpoint.method, endpoint.path, (endpoint as any).request)}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(generateCurlExample(endpoint.method, endpoint.path, (endpoint as any).request))}
                              data-testid={`copy-curl-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="javascript" className="mt-4">
                          <div className="relative">
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                              <code>{`const response = await fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }${(endpoint as any).request ? `,
  body: JSON.stringify(${(endpoint as any).request})` : ''}
});

const data = await response.json();
console.log(data);`}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              data-testid={`copy-js-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="python" className="mt-4">
                          <div className="relative">
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                              <code>{`import requests

headers = {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
}

${(endpoint as any).request ? `data = ${(endpoint as any).request}

response = requests.${endpoint.method.toLowerCase()}(
    '${endpoint.path}',
    headers=headers,
    json=data
)` : `response = requests.${endpoint.method.toLowerCase()}(
    '${endpoint.path}',
    headers=headers
)`}

print(response.json())`}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              data-testid={`copy-python-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TabsContent>

                        {endpoint.response && (
                          <TabsContent value="response" className="mt-4">
                            <div className="relative">
                              <pre className="bg-green-50 border border-green-200 p-4 rounded-lg text-xs overflow-x-auto">
                                <code className="text-green-800">{endpoint.response}</code>
                              </pre>
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(endpoint.response!)}
                                data-testid={`copy-response-${index}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>All API requests must include your API key in the Authorization header:</p>
                <code className="bg-muted p-2 rounded block">
                  Authorization: Bearer your_api_key
                </code>
                <Alert>
                  <AlertDescription>
                    Keep your API keys secure and never expose them in client-side code.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="space-y-1">
                  <p><strong>Standard:</strong> 1,000 requests/hour</p>
                  <p><strong>Enterprise:</strong> 10,000 requests/hour</p>
                  <p><strong>Burst:</strong> 100 requests/minute</p>
                </div>
                <Alert>
                  <AlertDescription>
                    Rate limits are per API key. Contact support for higher limits.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}