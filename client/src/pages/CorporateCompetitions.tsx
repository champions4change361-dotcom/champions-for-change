import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Trophy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Plus,
  Calendar,
  MapPin,
  Award,
  BarChart3
} from "lucide-react";
import type { CorporateCompetition, Company } from "@shared/schema";

interface CreateCompetitionData {
  companyId: string;
  name: string;
  competitionType: "sales" | "production" | "corporate";
  trackingMetric: string;
  competitionFormat: "individual" | "team" | "department";
  startDate: string;
  endDate: string;
  revenueGoal?: number;
  unitsSoldGoal?: number;
  departments: string[];
  description: string;
}

export default function CorporateCompetitions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompetition, setNewCompetition] = useState<Partial<CreateCompetitionData>>({
    competitionType: "sales",
    trackingMetric: "revenue",
    competitionFormat: "individual",
    departments: []
  });

  // Fetch corporate competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery<CorporateCompetition[]>({
    queryKey: ["/api/corporate/competitions"],
  });

  // Fetch companies for dropdown
  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/corporate/companies"],
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: CreateCompetitionData) => {
      return apiRequest("POST", "/api/corporate/competitions", competitionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/corporate/competitions"] });
      toast({
        title: "Competition Created",
        description: "Sales competition has been successfully created!",
      });
      setShowCreateForm(false);
      setNewCompetition({
        competitionType: "sales",
        trackingMetric: "revenue", 
        competitionFormat: "individual",
        departments: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetition.name || !newCompetition.companyId || !newCompetition.startDate || !newCompetition.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createCompetitionMutation.mutate(newCompetition as CreateCompetitionData);
  };

  const addDepartment = (department: string) => {
    if (department && !newCompetition.departments?.includes(department)) {
      setNewCompetition(prev => ({
        ...prev,
        departments: [...(prev.departments || []), department]
      }));
    }
  };

  const removeDepartment = (department: string) => {
    setNewCompetition(prev => ({
      ...prev,
      departments: prev.departments?.filter(d => d !== department) || []
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "planning": { color: "bg-yellow-500", text: "Planning" },
      "active": { color: "bg-green-500", text: "Active" },
      "completed": { color: "bg-gray-500", text: "Completed" }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: "bg-gray-500", text: status };
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getCompetitionIcon = (type: string) => {
    switch (type) {
      case "sales": return <DollarSign className="h-5 w-5" />;
      case "production": return <BarChart3 className="h-5 w-5" />;
      case "corporate": return <Building2 className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Corporate Competitions
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Turn your sales team into champions with gamified revenue competitions and cross-selling tournaments.
            Track performance, boost motivation, and drive results through healthy competition.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-active-competitions" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Active Competitions
              </CardTitle>
              <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {competitions?.filter(c => c.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-competitions" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Competitions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {competitions?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-participating-companies" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Companies
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {companies?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-revenue-competitions" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Revenue Competitions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {competitions?.filter(c => c.trackingMetric === "revenue").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Competition Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-create-competition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Sales Competition
          </Button>
        </div>

        {/* Create Competition Form */}
        {showCreateForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Create New Competition</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Set up a new sales competition to motivate your team and track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCompetition} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="competition-name">Competition Name</Label>
                    <Input
                      id="competition-name"
                      data-testid="input-competition-name"
                      placeholder="Q1 Sales Championship"
                      value={newCompetition.name || ""}
                      onChange={(e) => setNewCompetition(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-select">Company</Label>
                    <Select
                      value={newCompetition.companyId}
                      onValueChange={(value) => setNewCompetition(prev => ({ ...prev, companyId: value }))}
                    >
                      <SelectTrigger data-testid="select-company">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competition-type">Competition Type</Label>
                    <Select
                      value={newCompetition.competitionType}
                      onValueChange={(value: "sales" | "production" | "corporate") => 
                        setNewCompetition(prev => ({ ...prev, competitionType: value }))}
                    >
                      <SelectTrigger data-testid="select-competition-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Sales Competition
                            <Badge className="bg-green-100 text-green-800 text-xs">Popular</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="production">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Production Competition
                          </div>
                        </SelectItem>
                        <SelectItem value="corporate">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Corporate Event
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracking-metric">Tracking Metric</Label>
                    <Select
                      value={newCompetition.trackingMetric}
                      onValueChange={(value) => setNewCompetition(prev => ({ ...prev, trackingMetric: value }))}
                    >
                      <SelectTrigger data-testid="select-tracking-metric">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue Generated</SelectItem>
                        <SelectItem value="units_sold">Units Sold</SelectItem>
                        <SelectItem value="efficiency">Efficiency Rating</SelectItem>
                        <SelectItem value="quality">Quality Score</SelectItem>
                        <SelectItem value="custom">Custom Metric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      data-testid="input-start-date"
                      type="datetime-local"
                      value={newCompetition.startDate || ""}
                      onChange={(e) => setNewCompetition(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      data-testid="input-end-date"
                      type="datetime-local"
                      value={newCompetition.endDate || ""}
                      onChange={(e) => setNewCompetition(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {newCompetition.competitionType === "sales" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="revenue-goal">Revenue Goal ($)</Label>
                      <Input
                        id="revenue-goal"
                        data-testid="input-revenue-goal"
                        type="number"
                        placeholder="100000"
                        value={newCompetition.revenueGoal || ""}
                        onChange={(e) => setNewCompetition(prev => ({ 
                          ...prev, 
                          revenueGoal: parseFloat(e.target.value) || undefined 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="units-goal">Units Sold Goal</Label>
                      <Input
                        id="units-goal"
                        data-testid="input-units-goal"
                        type="number"
                        placeholder="500"
                        value={newCompetition.unitsSoldGoal || ""}
                        onChange={(e) => setNewCompetition(prev => ({ 
                          ...prev, 
                          unitsSoldGoal: parseInt(e.target.value) || undefined 
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Departments</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add department (e.g., Sales, Marketing)"
                      data-testid="input-department"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addDepartment((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('[data-testid="input-department"]') as HTMLInputElement;
                        if (input?.value) {
                          addDepartment(input.value);
                          input.value = "";
                        }
                      }}
                      data-testid="button-add-department"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newCompetition.departments?.map((dept) => (
                      <Badge
                        key={dept}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeDepartment(dept)}
                      >
                        {dept} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="textarea-description"
                    placeholder="Describe the competition rules and prizes..."
                    value={newCompetition.description || ""}
                    onChange={(e) => setNewCompetition(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createCompetitionMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-competition"
                  >
                    {createCompetitionMutation.isPending ? "Creating..." : "Create Competition"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    data-testid="button-cancel-competition"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Competitions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Competitions</h2>
          
          {competitionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : competitions && competitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <Card
                  key={competition.id}
                  data-testid={`card-competition-${competition.id}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCompetitionIcon(competition.competitionType)}
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {competition.name}
                        </CardTitle>
                      </div>
                      {getStatusBadge(competition.status)}
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {competition.competitionType.charAt(0).toUpperCase() + competition.competitionType.slice(1)} • {competition.trackingMetric}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{competition.competitionFormat} format</span>
                      </div>
                      
                      {competition.revenueGoal && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Target className="h-4 w-4" />
                          <span>Goal: ${competition.revenueGoal.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {competition.departments && competition.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {competition.departments.map((dept) => (
                            <Badge
                              key={dept}
                              variant="outline"
                              className="text-xs"
                            >
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid={`button-view-competition-${competition.id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Competitions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first sales competition to start tracking performance and motivating your team.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-create-first-competition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Competition
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}