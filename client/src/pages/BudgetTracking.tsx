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
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, DollarSign, Receipt, Search, Filter,
  Calendar, BarChart3, PieChart, LineChart,
  Plus, Edit, Trash2, Eye, Download,
  Target, Zap, RefreshCw, ArrowUpDown,
  Building, BookOpen, Users, FileText
} from "lucide-react";
import { Link } from "wouter";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

interface BudgetTrackingProps {}

// Transaction and tracking interfaces
interface BudgetTransaction {
  id: string;
  allocationId: string;
  categoryName: string;
  schoolName?: string;
  departmentName?: string;
  description: string;
  amount: number;
  transactionType: 'expense' | 'income' | 'transfer' | 'adjustment';
  paymentMethod: string;
  vendor?: string;
  receiptNumber?: string;
  transactionDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  tags?: string[];
  attachments?: string[];
}

interface BudgetVariance {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  actualSpent: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'on-track' | 'over' | 'critical';
  lastTransaction?: string;
  transactionCount: number;
}

interface SpendingAlert {
  id: string;
  type: 'overspend' | 'approaching_limit' | 'unusual_activity' | 'approval_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  categoryId?: string;
  amount?: number;
  threshold?: number;
  createdAt: string;
  isRead: boolean;
}

// Mock data for budget tracking
const mockTransactions: BudgetTransaction[] = [
  {
    id: "txn-1",
    allocationId: "alloc-1",
    categoryName: "Athletics",
    schoolName: "Springfield High School",
    description: "Football Equipment - Helmets and Pads",
    amount: 12500,
    transactionType: "expense",
    paymentMethod: "Purchase Order",
    vendor: "Sports Equipment Pro",
    receiptNumber: "PO-2024-0156",
    transactionDate: "2024-12-28",
    approvalStatus: "approved",
    approvedBy: "J. Smith",
    approvedAt: "2024-12-28T10:30:00Z",
    createdBy: "M. Johnson",
    createdAt: "2024-12-27T14:20:00Z",
    tags: ["equipment", "football", "safety"]
  },
  {
    id: "txn-2",
    allocationId: "alloc-2",
    categoryName: "Academics",
    schoolName: "Springfield High School",
    departmentName: "Science",
    description: "Laboratory Supplies - Chemistry Kit",
    amount: 3250,
    transactionType: "expense",
    paymentMethod: "Credit Card",
    vendor: "Educational Supplies Inc",
    receiptNumber: "CC-2024-0089",
    transactionDate: "2024-12-27",
    approvalStatus: "pending",
    createdBy: "K. Williams",
    createdAt: "2024-12-27T09:15:00Z",
    tags: ["supplies", "science", "lab"]
  },
  {
    id: "txn-3",
    allocationId: "alloc-3",
    categoryName: "Operations",
    schoolName: "Springfield High School",
    description: "Facility Maintenance - HVAC Repair",
    amount: 8750,
    transactionType: "expense",
    paymentMethod: "Check",
    vendor: "HVAC Solutions LLC",
    receiptNumber: "INV-2024-1234",
    transactionDate: "2024-12-26",
    approvalStatus: "approved",
    approvedBy: "D. Brown",
    approvedAt: "2024-12-26T16:45:00Z",
    createdBy: "R. Davis",
    createdAt: "2024-12-26T08:30:00Z",
    tags: ["maintenance", "hvac", "facilities"]
  },
  {
    id: "txn-4",
    allocationId: "alloc-1",
    categoryName: "Athletics",
    schoolName: "Springfield Middle School",
    description: "Basketball Tournament Entry Fees",
    amount: 450,
    transactionType: "expense",
    paymentMethod: "Online Payment",
    vendor: "State Athletic Association",
    transactionDate: "2024-12-25",
    approvalStatus: "approved",
    approvedBy: "L. Martinez",
    approvedAt: "2024-12-25T11:20:00Z",
    createdBy: "T. Wilson",
    createdAt: "2024-12-25T10:00:00Z",
    tags: ["tournament", "basketball", "fees"]
  }
];

const mockVarianceData: BudgetVariance[] = [
  {
    categoryId: "cat-1",
    categoryName: "Athletics",
    budgetedAmount: 530000,
    actualSpent: 475300,
    variance: -54700,
    variancePercent: -10.3,
    status: "under",
    lastTransaction: "2024-12-28",
    transactionCount: 156
  },
  {
    categoryId: "cat-2",
    categoryName: "Academics",
    budgetedAmount: 900000,
    actualSpent: 923500,
    variance: 23500,
    variancePercent: 2.6,
    status: "over",
    lastTransaction: "2024-12-27",
    transactionCount: 342
  },
  {
    categoryId: "cat-3",
    categoryName: "Operations",
    budgetedAmount: 306000,
    actualSpent: 334200,
    variance: 28200,
    variancePercent: 9.2,
    status: "critical",
    lastTransaction: "2024-12-26",
    transactionCount: 89
  },
  {
    categoryId: "cat-4",
    categoryName: "Technology",
    budgetedAmount: 275000,
    actualSpent: 198750,
    variance: -76250,
    variancePercent: -27.7,
    status: "under",
    lastTransaction: "2024-12-20",
    transactionCount: 45
  }
];

const mockSpendingAlerts: SpendingAlert[] = [
  {
    id: "alert-1",
    type: "overspend",
    severity: "critical",
    title: "Operations Budget Exceeded",
    description: "Operations category has exceeded budget by $28,200 (9.2%). Immediate attention required.",
    categoryId: "cat-3",
    amount: 28200,
    threshold: 306000,
    createdAt: "2024-12-26T16:45:00Z",
    isRead: false
  },
  {
    id: "alert-2",
    type: "approaching_limit",
    severity: "medium",
    title: "Academics Budget Near Limit",
    description: "Academics spending at 102.6% of budget. Consider reviewing remaining allocations.",
    categoryId: "cat-2",
    amount: 23500,
    threshold: 900000,
    createdAt: "2024-12-27T09:30:00Z",
    isRead: false
  },
  {
    id: "alert-3",
    type: "approval_needed",
    severity: "high",
    title: "Pending Transaction Approvals",
    description: "3 transactions totaling $15,450 require approval before processing.",
    amount: 15450,
    createdAt: "2024-12-27T11:15:00Z",
    isRead: true
  }
];

export default function BudgetTracking({}: BudgetTrackingProps) {
  const [transactions, setTransactions] = useState<BudgetTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<BudgetTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { toast } = useToast();

  // Budget transactions query
  const { data: transactionData, isLoading: transactionsLoading, error: transactionsError, refetch } = useQuery({
    queryKey: ['/api/budget/transactions', { dateRange, statusFilter, categoryFilter }]
  });

  // Budget variance query
  const { data: varianceData, isLoading: varianceLoading, error: varianceError } = useQuery({
    queryKey: ['/api/budget/analysis/variance']
  });

  // Spending alerts query
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['/api/budget/alerts']
  });

  // Create transaction mutation (mock for now)
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: `txn-${Date.now()}`, ...transactionData };
    },
    onSuccess: () => {
      toast({
        title: "Transaction Created",
        description: "New expense transaction has been recorded.",
      });
      setShowTransactionDialog(false);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = searchQuery === "" || 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || transaction.approvalStatus === statusFilter;
      const matchesCategory = categoryFilter === "all" || transaction.categoryName === categoryFilter;
      
      const transactionDate = new Date(transaction.transactionDate);
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (transactionDate >= dateRange.from && transactionDate <= dateRange.to);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.transactionDate);
          bValue = new Date(b.transactionDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.categoryName;
          bValue = b.categoryName;
          break;
        default:
          aValue = a.transactionDate;
          bValue = b.transactionDate;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchQuery, statusFilter, categoryFilter, dateRange, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSpent = filteredTransactions.reduce((sum, txn) => 
      txn.transactionType === 'expense' ? sum + txn.amount : sum, 0);
    const totalPending = filteredTransactions
      .filter(txn => txn.approvalStatus === 'pending')
      .reduce((sum, txn) => sum + txn.amount, 0);
    const averageTransaction = filteredTransactions.length > 0 
      ? totalSpent / filteredTransactions.length : 0;
    
    return {
      totalSpent,
      totalPending,
      averageTransaction,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-green-600';
      case 'on-track': return 'text-blue-600';
      case 'over': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getVarianceIcon = (status: string) => {
    switch (status) {
      case 'under': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'on-track': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'over': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              Budget Tracking & Expense Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time expense tracking, variance analysis, and spending oversight
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" data-testid="button-refresh-data">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                  <DialogDescription>
                    Add a new expense transaction to track spending against your budget.
                  </DialogDescription>
                </DialogHeader>
                {/* Transaction form would go here */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="athletics">Athletics</SelectItem>
                          <SelectItem value="academics">Academics</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Enter transaction description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Record Transaction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Link href="/budget">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Spending Alerts */}
        {mockSpendingAlerts.filter(alert => !alert.isRead).length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Spending Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSpendingAlerts.filter(alert => !alert.isRead).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                    'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{alert.severity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-spent">
                ${summaryStats.totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summaryStats.transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-amount">
                ${summaryStats.totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredTransactions.filter(t => t.approvalStatus === 'pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-average-transaction">
                ${summaryStats.averageTransaction.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-critical-items">
                {mockVarianceData.filter(v => v.status === 'critical').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Over budget categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="pt-6">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                <TabsTrigger value="variance">Budget Variance</TabsTrigger>
                <TabsTrigger value="analytics">Spending Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                      data-testid="input-search-transactions"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                      <SelectItem value="Academics">Academics</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <Label className="text-sm">Sort by:</Label>
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                      const [by, order] = value.split('-');
                      setSortBy(by as any);
                      setSortOrder(order as any);
                    }}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Date (Newest)</SelectItem>
                        <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                        <SelectItem value="amount-desc">Amount (High)</SelectItem>
                        <SelectItem value="amount-asc">Amount (Low)</SelectItem>
                        <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transaction List */}
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedTransaction(transaction)}
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">{transaction.categoryName}</Badge>
                            {transaction.schoolName && (
                              <Badge variant="secondary" className="text-xs">
                                {transaction.schoolName}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(transaction.approvalStatus)}>
                              {transaction.approvalStatus}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span>{format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}</span>
                            {transaction.vendor && <span>• {transaction.vendor}</span>}
                            <span>• {transaction.paymentMethod}</span>
                            <span>• by {transaction.createdBy}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${transaction.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.receiptNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="variance" className="space-y-4">
                <div className="space-y-4">
                  {mockVarianceData.map((variance) => (
                    <Card key={variance.categoryId} className="bg-gray-50 dark:bg-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getVarianceIcon(variance.status)}
                            {variance.categoryName}
                          </CardTitle>
                          <Badge variant="outline" className={getVarianceColor(variance.status)}>
                            {variance.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label className="text-sm text-gray-600">Budgeted</Label>
                            <div className="text-lg font-semibold">
                              ${variance.budgetedAmount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Actual Spent</Label>
                            <div className="text-lg font-semibold">
                              ${variance.actualSpent.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Variance</Label>
                            <div className={`text-lg font-semibold ${getVarianceColor(variance.status)}`}>
                              {variance.variance > 0 ? '+' : ''}${variance.variance.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Percentage</Label>
                            <div className={`text-lg font-semibold ${getVarianceColor(variance.status)}`}>
                              {variance.variancePercent > 0 ? '+' : ''}{variance.variancePercent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Budget Utilization</span>
                            <span>{((variance.actualSpent / variance.budgetedAmount) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={Math.min((variance.actualSpent / variance.budgetedAmount) * 100, 100)} 
                            className={variance.status === 'critical' ? 'bg-red-100' : ''}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-gray-600">
                          <span>{variance.transactionCount} transactions</span>
                          <span>Last activity: {variance.lastTransaction}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Advanced Analytics Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Interactive charts and detailed spending analytics will be available here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}