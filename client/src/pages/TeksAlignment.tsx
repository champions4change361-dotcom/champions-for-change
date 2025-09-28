import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  FileText, 
  Users, 
  TrendingUp,
  GraduationCap,
  Lightbulb,
  ClipboardList,
  Award,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

// TEKS form schemas
const teksStandardSchema = z.object({
  standardCode: z.string().min(1, "Standard code is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  subject: z.string().min(1, "Subject is required"),
  strand: z.string().min(1, "Strand is required"),
  standardText: z.string().min(1, "Standard text is required"),
  studentExpectation: z.string().min(1, "Student expectation is required"),
  bloomsLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate", "create"]),
  assessmentType: z.array(z.string()).min(1, "At least one assessment type required")
});

const competitionAlignmentSchema = z.object({
  competitionId: z.string().min(1, "Competition selection required"),
  teksStandardIds: z.array(z.string()).min(1, "At least one TEKS standard required"),
  alignmentStrength: z.enum(["strong", "moderate", "weak"]),
  alignmentNotes: z.string().optional(),
  learningObjectives: z.array(z.string()).min(1, "At least one learning objective required"),
  assessmentMethods: z.array(z.string()).min(1, "At least one assessment method required")
});

type TeksStandardData = z.infer<typeof teksStandardSchema>;
type CompetitionAlignmentData = z.infer<typeof competitionAlignmentSchema>;

interface TeksStandard {
  id: string;
  standardCode: string;
  gradeLevel: string;
  subject: string;
  strand: string;
  standardText: string;
  studentExpectation: string;
  bloomsLevel: string;
  assessmentType: string[];
  isActive: boolean;
}

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  competitionType: 'high_school' | 'aplus';
  gradeLevel: string;
  subjectArea: string;
  teksAlignment: string;
  isActive: boolean;
}

interface CompetitionAlignment {
  id: string;
  competitionId: string;
  competitionName: string;
  subjectArea: string;
  gradeLevel: string;
  alignedStandards: Array<{
    standardId: string;
    standardCode: string;
    standardText: string;
    alignmentStrength: string;
  }>;
  alignmentPercentage: number;
  lastUpdated: string;
  alignmentStatus: 'complete' | 'partial' | 'needs_review';
}

interface AlignmentReport {
  competitionId: string;
  competitionName: string;
  totalStandards: number;
  alignedStandards: number;
  alignmentPercentage: number;
  strongAlignments: number;
  moderateAlignments: number;
  weakAlignments: number;
  unalignedAreas: string[];
  recommendations: string[];
}

interface TeksAnalytics {
  totalStandards: number;
  alignedCompetitions: number;
  totalCompetitions: number;
  overallAlignmentPercentage: number;
  subjectBreakdown: Array<{
    subject: string;
    totalStandards: number;
    alignedStandards: number;
    percentage: number;
  }>;
  gradeBreakdown: Array<{
    gradeLevel: string;
    totalStandards: number;
    alignedStandards: number;
    percentage: number;
  }>;
  bloomsDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

export default function TeksAlignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [isCreateStandardOpen, setIsCreateStandardOpen] = useState(false);
  const [isAlignCompetitionOpen, setIsAlignCompetitionOpen] = useState(false);

  const standardForm = useForm<TeksStandardData>({
    resolver: zodResolver(teksStandardSchema),
    defaultValues: {
      assessmentType: []
    }
  });

  const alignmentForm = useForm<CompetitionAlignmentData>({
    resolver: zodResolver(competitionAlignmentSchema),
    defaultValues: {
      alignmentStrength: "moderate",
      teksStandardIds: [],
      learningObjectives: [],
      assessmentMethods: []
    }
  });

  // Get TEKS standards
  const { data: teksStandards, isLoading: standardsLoading } = useQuery<TeksStandard[]>({
    queryKey: ['/api/academic/teks/standards'],
    enabled: !!user
  });

  // Get UIL competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/uil'],
    enabled: !!user
  });

  // Get competition alignments
  const { data: alignments, isLoading: alignmentsLoading } = useQuery<CompetitionAlignment[]>({
    queryKey: ['/api/academic/teks/alignments'],
    enabled: !!user
  });

  // Get alignment analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<TeksAnalytics>({
    queryKey: ['/api/academic/teks/analytics'],
    enabled: !!user
  });

  // Create TEKS standard mutation
  const createStandardMutation = useMutation({
    mutationFn: async (data: TeksStandardData) => {
      return apiRequest('/api/academic/teks/standards', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "TEKS Standard Created",
        description: "New TEKS standard has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic/teks/standards'] });
      setIsCreateStandardOpen(false);
      standardForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create TEKS standard. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create competition alignment mutation
  const createAlignmentMutation = useMutation({
    mutationFn: async (data: CompetitionAlignmentData) => {
      return apiRequest('/api/academic/teks/alignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Alignment Created",
        description: "Competition alignment has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic/teks/alignments'] });
      setIsAlignCompetitionOpen(false);
      alignmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Alignment Failed",
        description: error.message || "Failed to create alignment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getAlignmentColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'weak': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'needs_review': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBLoomsColor = (level: string) => {
    const colors = {
      'remember': 'bg-blue-100 text-blue-800',
      'understand': 'bg-green-100 text-green-800',
      'apply': 'bg-yellow-100 text-yellow-800',
      'analyze': 'bg-orange-100 text-orange-800',
      'evaluate': 'bg-red-100 text-red-800',
      'create': 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredStandards = teksStandards?.filter(standard => {
    const matchesSearch = searchTerm === "" || 
      standard.standardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.standardText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === "all" || standard.subject === filterSubject;
    const matchesGrade = filterGrade === "all" || standard.gradeLevel === filterGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const onSubmitStandard = async (data: TeksStandardData) => {
    try {
      await createStandardMutation.mutateAsync(data);
    } catch (error) {
      console.error('TEKS standard creation error:', error);
    }
  };

  const onSubmitAlignment = async (data: CompetitionAlignmentData) => {
    try {
      await createAlignmentMutation.mutateAsync(data);
    } catch (error) {
      console.error('Competition alignment error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>TEKS Alignment</CardTitle>
            <CardDescription>Please log in to access TEKS alignment tools</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-teks">
                  TEKS Alignment System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Texas Essential Knowledge and Skills alignment for academic competitions
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" data-testid="button-export-alignment">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Link to="/academic">
                <Button variant="outline" data-testid="button-back-dashboard">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="standards" data-testid="tab-standards">TEKS Standards</TabsTrigger>
            <TabsTrigger value="alignments" data-testid="tab-alignments">Competition Alignments</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Dashboard */}
            {analytics && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.totalStandards}
                      </div>
                      <div className="text-sm text-muted-foreground">Total TEKS Standards</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.alignedCompetitions}
                      </div>
                      <div className="text-sm text-muted-foreground">Aligned Competitions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.overallAlignmentPercentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Alignment</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.totalCompetitions}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Competitions</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Subject Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Alignment by Subject Area</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.subjectBreakdown.map((subject, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{subject.subject}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold">{subject.percentage}%</span>
                              <div className="text-xs text-muted-foreground">
                                {subject.alignedStandards}/{subject.totalStandards} standards
                              </div>
                            </div>
                          </div>
                          <Progress value={subject.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Level Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Alignment by Grade Level</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analytics.gradeBreakdown.map((grade, index) => (
                        <Card key={index} className="p-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                              {grade.percentage}%
                            </div>
                            <div className="text-sm font-medium">{grade.gradeLevel}</div>
                            <div className="text-xs text-muted-foreground">
                              {grade.alignedStandards}/{grade.totalStandards} aligned
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bloom's Taxonomy Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Bloom's Taxonomy Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Distribution of cognitive levels across aligned competitions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {analytics.bloomsDistribution.map((level, index) => (
                        <div key={index} className="text-center">
                          <div className="mb-2">
                            <Badge className={getBLoomsColor(level.level)}>
                              {level.level.charAt(0).toUpperCase() + level.level.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold">{level.count}</div>
                          <div className="text-sm text-muted-foreground">{level.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TEKS Standards Tab */}
          <TabsContent value="standards" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">TEKS Standards</h2>
                <p className="text-muted-foreground">Manage Texas Essential Knowledge and Skills standards</p>
              </div>
              
              <Dialog open={isCreateStandardOpen} onOpenChange={setIsCreateStandardOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-standard">
                    <Plus className="h-4 w-4 mr-2" />
                    Add TEKS Standard
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add TEKS Standard</DialogTitle>
                    <DialogDescription>
                      Create a new TEKS standard for academic competition alignment
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...standardForm}>
                    <form onSubmit={standardForm.handleSubmit(onSubmitStandard)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={standardForm.control}
                          name="standardCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Standard Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., ELA.9.1A" {...field} data-testid="input-standard-code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={standardForm.control}
                          name="gradeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade Level</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 9-12" {...field} data-testid="input-grade-level" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={standardForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-subject">
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                                  <SelectItem value="Science">Science</SelectItem>
                                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                                  <SelectItem value="Fine Arts">Fine Arts</SelectItem>
                                  <SelectItem value="Career and Technical Education">Career and Technical Education</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={standardForm.control}
                          name="strand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Strand</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Reading" {...field} data-testid="input-strand" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={standardForm.control}
                        name="standardText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standard Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the full TEKS standard text..."
                                {...field} 
                                data-testid="textarea-standard-text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={standardForm.control}
                        name="studentExpectation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Expectation</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what students are expected to know and be able to do..."
                                {...field} 
                                data-testid="textarea-student-expectation"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={standardForm.control}
                        name="bloomsLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bloom's Taxonomy Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-blooms-level">
                                  <SelectValue placeholder="Select cognitive level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="remember">Remember</SelectItem>
                                <SelectItem value="understand">Understand</SelectItem>
                                <SelectItem value="apply">Apply</SelectItem>
                                <SelectItem value="analyze">Analyze</SelectItem>
                                <SelectItem value="evaluate">Evaluate</SelectItem>
                                <SelectItem value="create">Create</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateStandardOpen(false)}
                          data-testid="button-cancel-standard"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createStandardMutation.isPending}
                          data-testid="button-save-standard"
                        >
                          {createStandardMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Create Standard</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Search Standards</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by code, text, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-standards"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Subject</Label>
                    <Select value={filterSubject} onValueChange={setFilterSubject}>
                      <SelectTrigger data-testid="select-filter-subject">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Fine Arts">Fine Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Grade Level</Label>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger data-testid="select-filter-grade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="K-2">K-2</SelectItem>
                        <SelectItem value="3-5">3-5</SelectItem>
                        <SelectItem value="6-8">6-8</SelectItem>
                        <SelectItem value="9-12">9-12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standards List */}
            {standardsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading TEKS standards...</p>
              </div>
            ) : filteredStandards && filteredStandards.length > 0 ? (
              <div className="space-y-4">
                {filteredStandards.map((standard) => (
                  <Card key={standard.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono">
                            {standard.standardCode}
                          </Badge>
                          <Badge className={getBLoomsColor(standard.bloomsLevel)}>
                            {standard.bloomsLevel.charAt(0).toUpperCase() + standard.bloomsLevel.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-edit-standard-${standard.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-view-standard-${standard.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {standard.subject} • {standard.strand} • Grade {standard.gradeLevel}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-1">Standard Text</h4>
                          <p className="text-sm text-muted-foreground">{standard.standardText}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Student Expectation</h4>
                          <p className="text-sm text-muted-foreground">{standard.studentExpectation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Assessment Types:</span>
                          {standard.assessmentType.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No TEKS Standards</h3>
                <p className="text-muted-foreground mb-6">
                  No TEKS standards match your current filters.
                </p>
                <Button onClick={() => setIsCreateStandardOpen(true)} data-testid="button-create-first-standard">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Standard
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Competition Alignments Tab */}
          <TabsContent value="alignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Competition Alignments</h2>
                <p className="text-muted-foreground">Map academic competitions to TEKS standards</p>
              </div>
              
              <Dialog open={isAlignCompetitionOpen} onOpenChange={setIsAlignCompetitionOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-alignment">
                    <Target className="h-4 w-4 mr-2" />
                    Create Alignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Competition Alignment</DialogTitle>
                    <DialogDescription>
                      Align an academic competition with relevant TEKS standards
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...alignmentForm}>
                    <form onSubmit={alignmentForm.handleSubmit(onSubmitAlignment)} className="space-y-6">
                      <FormField
                        control={alignmentForm.control}
                        name="competitionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Competition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-alignment-competition">
                                  <SelectValue placeholder="Select competition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {competitions?.map((competition) => (
                                  <SelectItem key={competition.id} value={competition.id}>
                                    {competition.name} ({competition.subjectArea})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={alignmentForm.control}
                          name="alignmentStrength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alignment Strength</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-alignment-strength">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="strong">Strong Alignment</SelectItem>
                                  <SelectItem value="moderate">Moderate Alignment</SelectItem>
                                  <SelectItem value="weak">Weak Alignment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* TEKS Standards Selection */}
                      <div>
                        <Label className="text-base font-semibold">Select TEKS Standards</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Choose the TEKS standards that align with this competition
                        </p>
                        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                          {teksStandards?.map((standard) => (
                            <div key={standard.id} className="flex items-center space-x-3">
                              <Checkbox
                                checked={alignmentForm.watch('teksStandardIds').includes(standard.id)}
                                onCheckedChange={(checked) => {
                                  const current = alignmentForm.getValues('teksStandardIds');
                                  if (checked) {
                                    alignmentForm.setValue('teksStandardIds', [...current, standard.id]);
                                  } else {
                                    alignmentForm.setValue('teksStandardIds', current.filter(id => id !== standard.id));
                                  }
                                }}
                                data-testid={`checkbox-standard-${standard.id}`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {standard.standardCode}
                                  </Badge>
                                  <Badge className={getBLoomsColor(standard.bloomsLevel)} >
                                    {standard.bloomsLevel}
                                  </Badge>
                                </div>
                                <div className="text-sm">{standard.standardText.slice(0, 100)}...</div>
                                <div className="text-xs text-muted-foreground">
                                  {standard.subject} • Grade {standard.gradeLevel}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={alignmentForm.control}
                        name="alignmentNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alignment Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add notes about this alignment..."
                                {...field} 
                                data-testid="textarea-alignment-notes"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAlignCompetitionOpen(false)}
                          data-testid="button-cancel-alignment"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createAlignmentMutation.isPending}
                          data-testid="button-save-alignment"
                        >
                          {createAlignmentMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4" />
                              <span>Create Alignment</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Alignments List */}
            {alignmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading alignments...</p>
              </div>
            ) : alignments && alignments.length > 0 ? (
              <div className="space-y-4">
                {alignments.map((alignment) => (
                  <Card key={alignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{alignment.competitionName}</CardTitle>
                          <CardDescription>
                            {alignment.subjectArea} • Grade {alignment.gradeLevel}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {alignment.alignmentPercentage}%
                            </div>
                            <div className="text-xs text-muted-foreground">Alignment</div>
                          </div>
                          <Badge className={getStatusColor(alignment.alignmentStatus)}>
                            {alignment.alignmentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Aligned Standards ({alignment.alignedStandards.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {alignment.alignedStandards.slice(0, 6).map((standard, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                <Badge variant="outline" className="text-xs">
                                  {standard.standardCode}
                                </Badge>
                                <Badge className={getAlignmentColor(standard.alignmentStrength)}>
                                  {standard.alignmentStrength}
                                </Badge>
                                <span className="text-sm truncate">{standard.standardText.slice(0, 50)}...</span>
                              </div>
                            ))}
                            {alignment.alignedStandards.length > 6 && (
                              <div className="text-sm text-muted-foreground p-2">
                                +{alignment.alignedStandards.length - 6} more standards...
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Last updated: {new Date(alignment.lastUpdated).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" data-testid={`button-edit-alignment-${alignment.id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-view-alignment-${alignment.id}`}>
                              <Zap className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Alignments Created</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first competition alignment to map TEKS standards to competitions.
                </p>
                <Button onClick={() => setIsAlignCompetitionOpen(true)} data-testid="button-create-first-alignment">
                  <Target className="h-4 w-4 mr-2" />
                  Create First Alignment
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">TEKS Alignment Reports</h3>
              <p className="text-muted-foreground mb-6">
                Generate comprehensive reports for curriculum compliance and educational planning
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" data-testid="button-generate-report">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button size="lg" variant="outline" data-testid="button-view-templates">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Report Templates
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}