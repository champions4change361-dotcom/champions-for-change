import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  FileText, Download, Share2, Printer, Mail, 
  BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
  DollarSign, Target, AlertTriangle, CheckCircle,
  Calendar, Clock, Users, Building, BookOpen,
  FileSpreadsheet, FileBarChart, Filter, Search,
  RefreshCw, Settings, Eye, ArrowUpDown
} from "lucide-react";
import { Link } from "wouter";
import { addDays, format, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

interface BudgetReportingProps {}

// Report interfaces
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'variance' | 'cashflow' | 'performance' | 'summary' | 'custom';
  category: 'financial' | 'operational' | 'strategic' | 'compliance';
  isSystemTemplate: boolean;
  createdBy?: string;
  lastModified?: string;
  usageCount: number;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  dateRange: { from: Date; to: Date };
  generatedAt: string;
  data: any;
  summary: {
    totalBudget: number;
    totalSpent: number;
    variance: number;
    variancePercent: number;
    categoriesOverBudget: number;
    pendingApprovals: number;
  };
}

interface BudgetVarianceReport {
  categoryId: string;
  categoryName: string;
  schoolName?: string;
  budgetedAmount: number;
  actualSpent: number;
  committed: number;
  available: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'on-track' | 'over' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

interface CashflowProjection {
  month: string;
  plannedIncome: number;
  actualIncome: number;
  plannedExpenses: number;
  actualExpenses: number;
  projectedBalance: number;
  cashflowStatus: 'healthy' | 'warning' | 'critical';
}

// Mock data for budget reporting
const mockReportTemplates: ReportTemplate[] = [
  {
    id: "template-1",
    name: "Monthly Variance Report",
    description: "Compare budgeted vs actual spending by category with detailed variance analysis",
    type: "variance",
    category: "financial",
    isSystemTemplate: true,
    usageCount: 89
  },
  {
    id: "template-2", 
    name: "Quarterly Cashflow Analysis",
    description: "Track income, expenses, and cash position across quarters",
    type: "cashflow",
    category: "financial",
    isSystemTemplate: true,
    usageCount: 67
  },
  {
    id: "template-3",
    name: "Department Performance Dashboard", 
    description: "Performance metrics and KPIs by department and school",
    type: "performance",
    category: "operational",
    isSystemTemplate: true,
    usageCount: 123
  },
  {
    id: "template-4",
    name: "Executive Summary Report",
    description: "High-level financial overview for board and executive presentations",
    type: "summary", 
    category: "strategic",
    isSystemTemplate: true,
    usageCount: 156
  }
];

const mockVarianceData: BudgetVarianceReport[] = [
  {
    categoryId: "cat-1",
    categoryName: "Athletics",
    schoolName: "Springfield High School",
    budgetedAmount: 530000,
    actualSpent: 475300,
    committed: 32000,
    available: 22700,
    variance: -54700,
    variancePercent: -10.3,
    status: "under",
    trend: "stable"
  },
  {
    categoryId: "cat-2",
    categoryName: "Academics", 
    schoolName: "Springfield High School",
    budgetedAmount: 900000,
    actualSpent: 923500,
    committed: 15000,
    available: -38500,
    variance: 23500,
    variancePercent: 2.6,
    status: "over",
    trend: "declining"
  },
  {
    categoryId: "cat-3",
    categoryName: "Operations",
    budgetedAmount: 306000,
    actualSpent: 334200,
    committed: 8000,
    available: -36200,
    variance: 28200,
    variancePercent: 9.2,
    status: "critical",
    trend: "declining"
  },
  {
    categoryId: "cat-4",
    categoryName: "Technology",
    schoolName: "Springfield High School", 
    budgetedAmount: 275000,
    actualSpent: 198750,
    committed: 25000,
    available: 51250,
    variance: -76250,
    variancePercent: -27.7,
    status: "under",
    trend: "improving"
  }
];

const mockCashflowData: CashflowProjection[] = [
  {
    month: "2024-09",
    plannedIncome: 1200000,
    actualIncome: 1185000,
    plannedExpenses: 950000,
    actualExpenses: 968000,
    projectedBalance: 217000,
    cashflowStatus: "healthy"
  },
  {
    month: "2024-10",
    plannedIncome: 1100000,
    actualIncome: 1095000,
    plannedExpenses: 980000,
    actualExpenses: 1012000,
    projectedBalance: 83000,
    cashflowStatus: "warning"
  },
  {
    month: "2024-11",
    plannedIncome: 1250000,
    actualIncome: 0, // Future month
    plannedExpenses: 1020000,
    actualExpenses: 0,
    projectedBalance: 230000,
    cashflowStatus: "healthy"
  },
  {
    month: "2024-12",
    plannedIncome: 950000,
    actualIncome: 0,
    plannedExpenses: 890000,
    actualExpenses: 0,
    projectedBalance: 60000,
    cashflowStatus: "warning"
  }
];

export default function BudgetReporting({}: BudgetReportingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  } as DateRange);
  const [reportType, setReportType] = useState<string>("variance");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  
  const { toast } = useToast();

  // Report templates query
  const { data: reportTemplates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['/api/budget/reports/templates']
  });

  // Variance data query  
  const { data: varianceData, isLoading: varianceLoading, error: varianceError, refetch: refetchVariance } = useQuery({
    queryKey: ['/api/budget/reports/variance', { dateRange, schoolFilter, categoryFilter }]
  });

  // Cashflow data query
  const { data: cashflowData, isLoading: cashflowLoading, error: cashflowError } = useQuery({
    queryKey: ['/api/budget/reports/cashflow', { dateRange }]
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportConfig: any) => {
      setIsGeneratingReport(true);
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReport: ReportData = {
        id: "report-" + Date.now(),
        name: reportConfig.name || "Budget Report",
        type: reportConfig.type,
        dateRange: dateRange as { from: Date; to: Date },
        generatedAt: new Date().toISOString(),
        data: reportConfig.type === 'variance' ? varianceData : cashflowData,
        summary: {
          totalBudget: 2011000,
          totalSpent: 1931750,
          variance: -79250,
          variancePercent: -3.9,
          categoriesOverBudget: 2,
          pendingApprovals: 7
        }
      };
      
      setIsGeneratingReport(false);
      return mockReport;
    },
    onSuccess: (data) => {
      setReportData(data);
      toast({
        title: "Report Generated",
        description: `${data.name} has been generated successfully.`,
      });
    },
    onError: () => {
      setIsGeneratingReport(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: async ({ format, reportId }: { format: string; reportId: string }) => {
      const { apiRequest } = await import("@/lib/queryClient");
      
      // Call real export API
      const response = await apiRequest(`/api/budget/export?format=${format}&reportId=${reportId}&dateRange=${JSON.stringify(dateRange)}&schoolFilter=${schoolFilter}&categoryFilter=${categoryFilter}`, {
        method: 'GET',
      });
      
      // Handle file download from response
      const fileName = response.fileName || `budget-report-${format}-${Date.now()}.${format}`;
      
      // If response contains downloadUrl, download the file
      if (response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback to blob download for JSON data
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      return { fileName, success: true };
    },
    onSuccess: (data) => {
      toast({
        title: "Export Complete",
        description: `Report exported as ${data.fileName}`,
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range for the report.",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate({
      type: reportType,
      templateId: selectedTemplate?.id,
      name: selectedTemplate?.name || "Custom Budget Report",
      dateRange,
      filters: {
        school: schoolFilter,
        category: categoryFilter
      }
    });
  };

  const handleExportReport = () => {
    if (!reportData) return;
    exportReportMutation.mutate({
      format: exportFormat,
      reportId: reportData.id
    });
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!varianceData) return null;
    
    const totalBudget = varianceData.reduce((sum, item) => sum + item.budgetedAmount, 0);
    const totalSpent = varianceData.reduce((sum, item) => sum + item.actualSpent, 0);
    const totalCommitted = varianceData.reduce((sum, item) => sum + item.committed, 0);
    const totalAvailable = varianceData.reduce((sum, item) => sum + item.available, 0);
    const overBudgetCount = varianceData.filter(item => item.status === 'over' || item.status === 'critical').length;
    
    return {
      totalBudget,
      totalSpent,
      totalCommitted,
      totalAvailable,
      utilization: (totalSpent / totalBudget) * 100,
      overBudgetCount,
      onTrackCount: varianceData.filter(item => item.status === 'on-track').length,
      underBudgetCount: varianceData.filter(item => item.status === 'under').length
    };
  }, [varianceData]);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="budget-reporting-page">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Budget Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Generate comprehensive financial reports with Excel export capabilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/budget">
            <Button variant="outline" size="sm" data-testid="link-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            size="sm"
            data-testid="button-generate-report"
          >
            {isGeneratingReport ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-budget">
                    ${summaryStats.totalBudget.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-spent">
                    ${summaryStats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Progress value={summaryStats.utilization} className="h-2" />
                <p className="text-xs text-gray-500 mt-1" data-testid="utilization-percent">
                  {summaryStats.utilization.toFixed(1)}% utilized
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-available">
                    ${summaryStats.totalAvailable.toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Over Budget</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="stat-over-budget">
                    {summaryStats.overBudgetCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>
                Configure your report parameters and filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Template Selection */}
              <div className="space-y-2">
                <Label>Report Template</Label>
                <Select value={selectedTemplate?.id || ""} onValueChange={(value) => {
                  const template = mockReportTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                  if (template) setReportType(template.type);
                }} data-testid="select-report-template">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockReportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DatePickerWithRange 
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                  data-testid="date-range-picker"
                />
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>School</Label>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter} data-testid="select-school-filter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      <SelectItem value="springfield-high">Springfield High School</SelectItem>
                      <SelectItem value="springfield-middle">Springfield Middle School</SelectItem>
                      <SelectItem value="oak-elementary">Oak Elementary School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="select-category-filter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="athletics">Athletics</SelectItem>
                      <SelectItem value="academics">Academics</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Export Options */}
              {reportData && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={(value: 'excel' | 'pdf' | 'csv') => setExportFormat(value)} data-testid="select-export-format">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel (.xlsx)
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            PDF (.pdf)
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileBarChart className="h-4 w-4" />
                            CSV (.csv)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExportReport}
                      disabled={exportReportMutation.isPending}
                      size="sm"
                      className="flex-1"
                      data-testid="button-export-report"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exportReportMutation.isPending ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-share-report">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Display Area */}
        <div className="lg:col-span-2">
          {reportData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle data-testid="report-title">{reportData.name}</CardTitle>
                    <CardDescription>
                      Generated on {format(new Date(reportData.generatedAt), 'PPp')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" data-testid="report-type">
                    {reportData.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="variance" data-testid="report-tabs">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="variance" data-testid="tab-variance">
                      Variance Analysis
                    </TabsTrigger>
                    <TabsTrigger value="cashflow" data-testid="tab-cashflow">
                      Cashflow
                    </TabsTrigger>
                    <TabsTrigger value="summary" data-testid="tab-summary">
                      Summary
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="variance" className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="variance-table">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-2">Category</th>
                            <th className="text-right py-3 px-2">Budgeted</th>
                            <th className="text-right py-3 px-2">Spent</th>
                            <th className="text-right py-3 px-2">Available</th>
                            <th className="text-right py-3 px-2">Variance</th>
                            <th className="text-center py-3 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {varianceData?.map((item) => (
                            <tr key={item.categoryId} className="border-b border-gray-100 dark:border-gray-800" data-testid={`variance-row-${item.categoryId}`}>
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-medium">{item.categoryName}</div>
                                  {item.schoolName && (
                                    <div className="text-xs text-gray-500">{item.schoolName}</div>
                                  )}
                                </div>
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                ${item.budgetedAmount.toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                ${item.actualSpent.toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                <span className={item.available < 0 ? "text-red-600" : "text-green-600"}>
                                  ${item.available.toLocaleString()}
                                </span>
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                <span className={item.variance > 0 ? "text-red-600" : "text-green-600"}>
                                  ${item.variance.toLocaleString()} ({item.variancePercent.toFixed(1)}%)
                                </span>
                              </td>
                              <td className="text-center py-3 px-2">
                                <Badge 
                                  variant={
                                    item.status === 'critical' ? 'destructive' :
                                    item.status === 'over' ? 'secondary' :
                                    item.status === 'on-track' ? 'default' : 'outline'
                                  }
                                  data-testid={`status-${item.categoryId}`}
                                >
                                  {item.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="cashflow" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cashflowData?.map((item) => (
                        <Card key={item.month} data-testid={`cashflow-card-${item.month}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">
                                {format(new Date(item.month), 'MMMM yyyy')}
                              </h4>
                              <Badge 
                                variant={
                                  item.cashflowStatus === 'healthy' ? 'default' :
                                  item.cashflowStatus === 'warning' ? 'secondary' : 'destructive'
                                }
                              >
                                {item.cashflowStatus}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Planned Income:</span>
                                <span className="font-mono">${item.plannedIncome.toLocaleString()}</span>
                              </div>
                              {item.actualIncome > 0 && (
                                <div className="flex justify-between">
                                  <span>Actual Income:</span>
                                  <span className="font-mono">${item.actualIncome.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Planned Expenses:</span>
                                <span className="font-mono">${item.plannedExpenses.toLocaleString()}</span>
                              </div>
                              {item.actualExpenses > 0 && (
                                <div className="flex justify-between">
                                  <span>Actual Expenses:</span>
                                  <span className="font-mono">${item.actualExpenses.toLocaleString()}</span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Projected Balance:</span>
                                <span className={`font-mono ${item.projectedBalance < 100000 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${item.projectedBalance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Financial Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Budget:</span>
                            <span className="font-mono font-semibold">
                              ${reportData.summary.totalBudget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Spent:</span>
                            <span className="font-mono font-semibold">
                              ${reportData.summary.totalSpent.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overall Variance:</span>
                            <span className={`font-mono font-semibold ${reportData.summary.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${reportData.summary.variance.toLocaleString()} 
                              ({reportData.summary.variancePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Alerts & Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Categories Over Budget:</span>
                            <span className="font-semibold text-red-600">
                              {reportData.summary.categoriesOverBudget}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending Approvals:</span>
                            <span className="font-semibold text-orange-600">
                              {reportData.summary.pendingApprovals}
                            </span>
                          </div>
                          <div className="mt-4">
                            <Button size="sm" className="w-full" data-testid="button-view-alerts">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              View All Alerts
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No Report Generated
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Configure your report parameters and click "Generate Report" to get started.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}