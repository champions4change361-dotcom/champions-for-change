import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  Area, AreaChart 
} from "recharts";
import { 
  Calculator, DollarSign, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Clock, FileText,
  PlusCircle, Download, Settings, Users, 
  Building, BookOpen, Zap, Target
} from "lucide-react";
import { Link } from "wouter";

interface BudgetDashboardProps {}

// Mock data for development - will be replaced with real API calls
const mockBudgetSummary = {
  totalBudget: 2850000,
  totalAllocated: 2456000,
  totalSpent: 1876000,
  remainingBudget: 580000,
  pendingApprovals: 12,
  overdueItems: 3,
  fiscalYear: "2024-2025"
};

const mockCategoryData = [
  { name: "Athletics", budget: 850000, spent: 675000, remaining: 175000, variance: -5.2 },
  { name: "Academics", budget: 1200000, spent: 890000, remaining: 310000, variance: 2.1 },
  { name: "Operations", budget: 450000, spent: 311000, remaining: 139000, variance: 8.3 },
  { name: "Technology", budget: 350000, spent: 275000, remaining: 75000, variance: -2.8 }
];

const mockMonthlySpending = [
  { month: "Aug", budgeted: 180000, actual: 165000 },
  { month: "Sep", budgeted: 220000, actual: 235000 },
  { month: "Oct", budgeted: 200000, actual: 195000 },
  { month: "Nov", budgeted: 190000, actual: 188000 },
  { month: "Dec", budgeted: 175000, actual: 182000 },
  { month: "Jan", budgeted: 160000, actual: 0 }
];

const mockRecentTransactions = [
  { id: "1", description: "Football Equipment Purchase", amount: 15000, status: "approved", category: "Athletics", date: "2024-12-28" },
  { id: "2", description: "Math Department Supplies", amount: 2500, status: "pending", category: "Academics", date: "2024-12-27" },
  { id: "3", description: "Facility Maintenance", amount: 8000, status: "approved", category: "Operations", date: "2024-12-26" },
  { id: "4", description: "Computer Lab Upgrade", amount: 25000, status: "pending", category: "Technology", date: "2024-12-25" }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function BudgetDashboard({}: BudgetDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Budget summary query
  const { data: budgetSummary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['/api/budget/allocations/summary']
  });

  // Recent transactions query
  const { data: recentTransactions, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['/api/budget/transactions'],
    select: (data) => data?.slice(0, 5) // Limit to recent 5 transactions
  });

  const summary = budgetSummary || {
    totalBudget: 0,
    totalAllocated: 0, 
    totalSpent: 0,
    remainingBudget: 0,
    pendingApprovals: 0,
    overdueItems: 0,
    fiscalYear: "2024-2025"
  };
  const transactions = recentTransactions || [];

  const budgetUtilization = (summary.totalSpent / summary.totalBudget) * 100;
  const allocationRate = (summary.totalAllocated / summary.totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              Budget Management Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Excel-style budget planning and financial oversight for {summary.fiscalYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              data-testid="button-export-data"
              onClick={async () => {
                try {
                  const { apiRequest } = await import("@/lib/queryClient");
                  const response = await apiRequest('/api/budget/export?format=excel', { method: 'GET' });
                  
                  const fileName = response.fileName || `budget-dashboard-${Date.now()}.excel`;
                  const dataStr = JSON.stringify(response.data, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export failed:', error);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Link href="/budget/planning">
              <Button size="sm" data-testid="button-budget-planning">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800" data-testid="card-total-budget">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-budget">
                ${summary.totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">FY {summary.fiscalYear}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800" data-testid="card-spent-budget">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-spent-budget">
                ${summary.totalSpent.toLocaleString()}
              </div>
              <Progress value={budgetUtilization} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">{budgetUtilization.toFixed(1)}% utilized</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800" data-testid="card-remaining-budget">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-remaining-budget">
                ${summary.remainingBudget.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Available to spend</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800" data-testid="card-pending-approvals">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-approvals">
                {summary.pendingApprovals}
              </div>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Budget Categories Chart */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Budget by Category
              </CardTitle>
              <CardDescription>
                Budget allocation and spending across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#0088FE" name="Budgeted" />
                  <Bar dataKey="spent" fill="#00C49F" name="Spent" />
                  <Bar dataKey="remaining" fill="#FFBB28" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common budget management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/budget/planning" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-budget-planning">
                  <Calculator className="h-4 w-4 mr-2" />
                  Budget Planning
                </Button>
              </Link>
              <Link href="/budget/allocation" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-budget-allocation">
                  <Target className="h-4 w-4 mr-2" />
                  Allocation Management
                </Button>
              </Link>
              <Link href="/budget/tracking" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-budget-tracking">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Expense Tracking
                </Button>
              </Link>
              <Link href="/budget/approval" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-budget-approval">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approval Workflow
                </Button>
              </Link>
              <Link href="/budget/reports" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-budget-reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Financial Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="pt-6">
            <Tabs defaultValue="spending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="spending">Monthly Spending</TabsTrigger>
                <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
                <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
                <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="spending" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockMonthlySpending}>
                      <defs>
                        <linearGradient id="budgeted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Area 
                        type="monotone" 
                        dataKey="budgeted" 
                        stackId="1" 
                        stroke="#0088FE" 
                        fill="url(#budgeted)"
                        name="Budgeted"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stackId="2" 
                        stroke="#00C49F" 
                        fill="url(#actual)"
                        name="Actual"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="budget"
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="variance" className="space-y-4">
                <div className="space-y-4">
                  {mockCategoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                        </span>
                        <Badge 
                          variant={category.variance > 0 ? "default" : "destructive"}
                          className={category.variance > 0 ? "bg-green-100 text-green-800" : ""}
                        >
                          {category.variance > 0 ? "+" : ""}{category.variance.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="space-y-4">
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`transaction-${transaction.id}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.description}</span>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">${transaction.amount.toLocaleString()}</span>
                        <Badge 
                          variant={transaction.status === "approved" ? "default" : "secondary"}
                          className={transaction.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}