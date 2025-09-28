import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, Users, 
  Eye, ThumbsUp, ThumbsDown, MessageCircle, Send,
  Filter, Search, Calendar, ArrowUpDown, RefreshCw,
  FileText, DollarSign, Building, BookOpen, User,
  ChevronRight, ChevronDown, Bell, Shield, Zap,
  History, Workflow, Target, Settings
} from "lucide-react";
import { Link } from "wouter";
import { format, formatDistance, parseISO } from "date-fns";

interface BudgetApprovalProps {}

// Approval interfaces
interface BudgetApprovalRequest {
  id: string;
  type: 'budget_allocation' | 'expense_request' | 'budget_revision' | 'transfer_request';
  title: string;
  description: string;
  amount: number;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  requestedAt: string;
  category: string;
  schoolName?: string;
  departmentName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'delegated';
  currentApprover?: {
    id: string;
    name: string;
    role: string;
  };
  approvalChain: ApprovalStep[];
  attachments?: string[];
  metadata?: any;
}

interface ApprovalStep {
  id: string;
  approverRole: string;
  approverName?: string;
  approverId?: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'delegated';
  decidedAt?: string;
  notes?: string;
  isRequired: boolean;
  isDelegated?: boolean;
  delegatedTo?: string;
}

interface ApprovalHistory {
  id: string;
  requestId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'delegated' | 'commented';
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
}

interface ApprovalComment {
  id: string;
  requestId: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isInternal: boolean;
}

// Mock data for budget approval system
const mockApprovalRequests: BudgetApprovalRequest[] = [
  {
    id: "req-1",
    type: "expense_request",
    title: "Athletic Equipment Purchase - Football Helmets",
    description: "Request for new safety-certified football helmets to replace aging equipment. This purchase is critical for player safety and compliance with league standards.",
    amount: 15750,
    requestedBy: {
      id: "user-1",
      name: "Mike Johnson",
      email: "mjohnson@springfieldhs.edu", 
      role: "Athletic Director",
      avatar: "/avatars/mike.jpg"
    },
    requestedAt: "2024-12-27T09:30:00Z",
    category: "Athletics",
    schoolName: "Springfield High School",
    departmentName: "Athletics",
    priority: "high",
    status: "pending",
    currentApprover: {
      id: "user-2",
      name: "Sarah Wilson",
      role: "Principal"
    },
    approvalChain: [
      {
        id: "step-1",
        approverRole: "Principal", 
        approverName: "Sarah Wilson",
        approverId: "user-2",
        level: 1,
        status: "pending",
        isRequired: true
      },
      {
        id: "step-2",
        approverRole: "District Business Manager",
        level: 2, 
        status: "pending",
        isRequired: true
      },
      {
        id: "step-3",
        approverRole: "Superintendent",
        level: 3,
        status: "pending", 
        isRequired: false
      }
    ],
    attachments: ["equipment_catalog.pdf", "safety_certification.pdf"]
  },
  {
    id: "req-2",
    type: "budget_revision",
    title: "Science Department Budget Revision - Lab Equipment",
    description: "Request to reallocate funds from textbook budget to laboratory equipment due to updated curriculum requirements.",
    amount: 8500,
    requestedBy: {
      id: "user-3",
      name: "Dr. Karen Williams", 
      email: "kwilliams@springfieldhs.edu",
      role: "Science Department Head",
      avatar: "/avatars/karen.jpg"
    },
    requestedAt: "2024-12-26T14:15:00Z",
    category: "Academics",
    schoolName: "Springfield High School",
    departmentName: "Science",
    priority: "medium",
    status: "under_review",
    currentApprover: {
      id: "user-4",
      name: "James Brown",
      role: "District Business Manager"
    },
    approvalChain: [
      {
        id: "step-1",
        approverRole: "Principal",
        approverName: "Sarah Wilson", 
        approverId: "user-2",
        level: 1,
        status: "approved",
        decidedAt: "2024-12-26T16:20:00Z",
        notes: "Approved with recommendation for quarterly review.",
        isRequired: true
      },
      {
        id: "step-2", 
        approverRole: "District Business Manager",
        approverName: "James Brown",
        approverId: "user-4", 
        level: 2,
        status: "pending",
        isRequired: true
      }
    ],
    attachments: ["curriculum_update.pdf", "equipment_quotes.xlsx"]
  },
  {
    id: "req-3",
    type: "transfer_request", 
    title: "Technology Fund Transfer - Emergency Server Replacement",
    description: "Urgent transfer of funds needed to replace failed server infrastructure. Critical for maintaining student information systems.",
    amount: 12000,
    requestedBy: {
      id: "user-5",
      name: "Robert Davis",
      email: "rdavis@springfielddistrict.edu",
      role: "IT Director", 
      avatar: "/avatars/robert.jpg"
    },
    requestedAt: "2024-12-25T11:45:00Z", 
    category: "Technology",
    priority: "urgent",
    status: "approved",
    approvalChain: [
      {
        id: "step-1",
        approverRole: "District Business Manager",
        approverName: "James Brown",
        approverId: "user-4",
        level: 1, 
        status: "approved",
        decidedAt: "2024-12-25T13:30:00Z",
        notes: "Emergency approval granted due to critical system failure.",
        isRequired: true
      },
      {
        id: "step-2",
        approverRole: "Superintendent",
        approverName: "Linda Martinez",
        approverId: "user-6",
        level: 2,
        status: "approved", 
        decidedAt: "2024-12-25T14:15:00Z",
        notes: "Approved for emergency infrastructure replacement.",
        isRequired: true
      }
    ],
    attachments: ["server_failure_report.pdf", "replacement_quote.pdf"]
  },
  {
    id: "req-4",
    type: "budget_allocation",
    title: "New Arts Program - Initial Budget Allocation",
    description: "Budget allocation request for new performing arts program including instruments, costumes, and performance space setup.",
    amount: 25000,
    requestedBy: {
      id: "user-7", 
      name: "Emily Chen",
      email: "echen@springfieldms.edu",
      role: "Arts Coordinator",
      avatar: "/avatars/emily.jpg"
    },
    requestedAt: "2024-12-24T10:00:00Z",
    category: "Arts",
    schoolName: "Springfield Middle School", 
    departmentName: "Fine Arts",
    priority: "medium",
    status: "rejected",
    approvalChain: [
      {
        id: "step-1",
        approverRole: "Principal", 
        approverName: "Tom Anderson",
        approverId: "user-8",
        level: 1,
        status: "approved",
        decidedAt: "2024-12-24T15:30:00Z",
        notes: "Strong support for arts program expansion.",
        isRequired: true
      },
      {
        id: "step-2",
        approverRole: "District Business Manager",
        approverName: "James Brown",
        approverId: "user-4",
        level: 2,
        status: "rejected",
        decidedAt: "2024-12-24T17:45:00Z", 
        notes: "Insufficient funds available in current fiscal year. Recommend resubmission for next year's budget.",
        isRequired: true
      }
    ],
    attachments: ["program_proposal.pdf", "cost_breakdown.xlsx"]
  }
];

const mockApprovalHistory: ApprovalHistory[] = [
  {
    id: "hist-1",
    requestId: "req-2",
    action: "approved", 
    performedBy: {
      id: "user-2",
      name: "Sarah Wilson",
      role: "Principal"
    },
    timestamp: "2024-12-26T16:20:00Z",
    notes: "Approved with recommendation for quarterly review.",
    previousStatus: "pending",
    newStatus: "under_review"
  },
  {
    id: "hist-2", 
    requestId: "req-3",
    action: "approved",
    performedBy: {
      id: "user-4", 
      name: "James Brown",
      role: "District Business Manager"
    },
    timestamp: "2024-12-25T13:30:00Z",
    notes: "Emergency approval granted due to critical system failure.",
    previousStatus: "pending",
    newStatus: "approved"
  }
];

const mockApprovalComments: ApprovalComment[] = [
  {
    id: "comment-1",
    requestId: "req-1", 
    author: {
      id: "user-2",
      name: "Sarah Wilson",
      role: "Principal", 
      avatar: "/avatars/sarah.jpg"
    },
    content: "I've reviewed the safety requirements and this appears to be a necessary purchase. Can we get quotes from additional vendors?",
    timestamp: "2024-12-27T11:15:00Z",
    isInternal: true
  },
  {
    id: "comment-2",
    requestId: "req-2",
    author: {
      id: "user-4",
      name: "James Brown", 
      role: "District Business Manager",
      avatar: "/avatars/james.jpg"
    },
    content: "The budget reallocation looks reasonable but we need to ensure this doesn't impact other science programs.",
    timestamp: "2024-12-26T15:45:00Z", 
    isInternal: false
  }
];

export default function BudgetApproval({}: BudgetApprovalProps) {
  const [requests, setRequests] = useState<BudgetApprovalRequest[]>(mockApprovalRequests);
  const [selectedRequest, setSelectedRequest] = useState<BudgetApprovalRequest | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "priority">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "delegate" | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [newComment, setNewComment] = useState("");
  
  const { toast } = useToast();

  // Approval requests query
  const { data: approvalRequests, isLoading: requestsLoading, error: requestsError, refetch } = useQuery({
    queryKey: ['/api/budget/approvals', { status: statusFilter, priority: priorityFilter }]
  });

  // Approval history query
  const { data: approvalHistory, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['/api/budget/approvals/history', selectedRequest?.id],
    enabled: !!selectedRequest
  });

  // Comments query
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['/api/budget/approvals/comments', selectedRequest?.id],
    enabled: !!selectedRequest
  });

  // Process approval mutation
  const processApprovalMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      notes 
    }: { 
      requestId: string; 
      action: 'approve' | 'reject' | 'delegate'; 
      notes: string;
    }) => {
      // Mock approval processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: action === 'approve' ? 'approved' as const : 
                   action === 'reject' ? 'rejected' as const : 
                   'delegated' as const
          };
        }
        return req;
      });
      
      setRequests(updatedRequests);
      return { success: true, action, requestId };
    },
    onSuccess: (data) => {
      toast({
        title: `Request ${data.action === 'approve' ? 'Approved' : data.action === 'reject' ? 'Rejected' : 'Delegated'}`,
        description: `The budget request has been ${data.action}d successfully.`,
      });
      setShowRequestDialog(false);
      setApprovalAction(null);
      setApprovalNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/budget/approvals'] });
    },
    onError: () => {
      toast({
        title: "Action Failed", 
        description: "Failed to process approval action. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ requestId, content }: { requestId: string; content: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the request.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/approvals/comments'] });
    }
  });

  const handleApprovalAction = () => {
    if (!selectedRequest || !approvalAction) return;
    
    processApprovalMutation.mutate({
      requestId: selectedRequest.id,
      action: approvalAction,
      notes: approvalNotes
    });
  };

  const handleAddComment = () => {
    if (!selectedRequest || !newComment.trim()) return;
    
    addCommentMutation.mutate({
      requestId: selectedRequest.id,
      content: newComment
    });
  };

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.requestedAt);
          bValue = new Date(b.requestedAt);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [requests, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Group requests by status for tabs
  const groupedRequests = useMemo(() => {
    return {
      pending: filteredRequests.filter(req => req.status === 'pending' || req.status === 'under_review'),
      approved: filteredRequests.filter(req => req.status === 'approved'),
      rejected: filteredRequests.filter(req => req.status === 'rejected'),
      all: filteredRequests
    };
  }, [filteredRequests]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'under_review': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'delegated': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="budget-approval-page">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Budget Approval Workflow
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage budget requests, approvals, and workflow processes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/budget">
            <Button variant="outline" size="sm" data-testid="link-dashboard">
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button onClick={() => refetch()} size="sm" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="stat-pending">
                  {groupedRequests.pending.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved Today</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-approved">
                  {groupedRequests.approved.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-amount">
                  ${filteredRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Urgent Items</p>
                <p className="text-2xl font-bold text-red-600" data-testid="stat-urgent">
                  {filteredRequests.filter(req => req.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="select-status-filter">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter} data-testid="select-priority-filter">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "date" | "amount" | "priority") => setSortBy(value)} data-testid="select-sort">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              data-testid="button-sort-order"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="approval-tabs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({groupedRequests.pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({groupedRequests.approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rejected ({groupedRequests.rejected.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({groupedRequests.all.length})
              </TabsTrigger>
            </TabsList>

            {Object.entries(groupedRequests).map(([tabName, requestList]) => (
              <TabsContent key={tabName} value={tabName} className="space-y-4">
                {requestList.length > 0 ? (
                  <div className="space-y-3">
                    {requestList.map((request) => (
                      <Card 
                        key={request.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          request.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''
                        }`}
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestDialog(true);
                        }}
                        data-testid={`request-card-${request.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {request.title}
                                </h3>
                                <Badge className={getPriorityColor(request.priority)} data-testid={`priority-${request.id}`}>
                                  {request.priority}
                                </Badge>
                                <Badge className={getStatusColor(request.status)} data-testid={`status-${request.id}`}>
                                  {request.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {request.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {request.requestedBy.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(parseISO(request.requestedAt), 'MMM d, yyyy')}
                                  </div>
                                  {request.schoolName && (
                                    <div className="flex items-center gap-1">
                                      <Building className="h-4 w-4" />
                                      {request.schoolName}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                                    ${request.amount.toLocaleString()}
                                  </p>
                                  {request.currentApprover && (
                                    <p className="text-xs text-gray-500">
                                      Awaiting: {request.currentApprover.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No {tabName} requests
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tabName === 'pending' ? 'All requests have been processed' : 
                       tabName === 'approved' ? 'No requests have been approved yet' :
                       tabName === 'rejected' ? 'No requests have been rejected yet' :
                       'No requests match your current filters'}
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>
              Review request details and take approval action
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Requested By</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedRequest.requestedBy.avatar} />
                      <AvatarFallback>
                        {selectedRequest.requestedBy.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedRequest.requestedBy.name}</p>
                      <p className="text-xs text-gray-500">{selectedRequest.requestedBy.role}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${selectedRequest.amount.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="mt-1">{selectedRequest.category}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={`mt-1 ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Request Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Approval Chain */}
              <div>
                <Label className="text-sm font-medium">Approval Chain</Label>
                <div className="mt-3 space-y-2">
                  {selectedRequest.approvalChain.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        step.status === 'approved' ? 'bg-green-50 border-green-200' :
                        step.status === 'rejected' ? 'bg-red-50 border-red-200' :
                        step.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                      data-testid={`approval-step-${step.id}`}
                    >
                      <div className="flex-shrink-0">
                        {step.status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : step.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : step.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {step.approverName || step.approverRole}
                          </p>
                          <Badge variant="outline">
                            Level {step.level}
                          </Badge>
                        </div>
                        
                        {step.notes && (
                          <p className="text-sm text-gray-600 mt-1">{step.notes}</p>
                        )}
                        
                        {step.decidedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(step.decidedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              {comments && comments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <div className="mt-3 space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>
                            {comment.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{comment.author.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {comment.author.role}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {formatDistance(parseISO(comment.timestamp), new Date(), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              <div>
                <Label className="text-sm font-medium">Add Comment</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                    rows={2}
                    data-testid="textarea-new-comment"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="sm"
                    data-testid="button-add-comment"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Approval Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Approval Decision</Label>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={approvalAction === 'approve' ? 'default' : 'outline'}
                      onClick={() => setApprovalAction('approve')}
                      data-testid="button-approve"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant={approvalAction === 'reject' ? 'destructive' : 'outline'}
                      onClick={() => setApprovalAction('reject')}
                      data-testid="button-reject"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant={approvalAction === 'delegate' ? 'secondary' : 'outline'}
                      onClick={() => setApprovalAction('delegate')}
                      data-testid="button-delegate"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Delegate
                    </Button>
                  </div>

                  {approvalAction && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label className="text-sm font-medium">
                          {approvalAction === 'approve' ? 'Approval Notes' : 
                           approvalAction === 'reject' ? 'Rejection Reason' : 
                           'Delegation Notes'}
                        </Label>
                        <Textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder={`Enter ${approvalAction} notes...`}
                          rows={3}
                          className="mt-1"
                          data-testid="textarea-approval-notes"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleApprovalAction}
                          disabled={processApprovalMutation.isPending}
                          data-testid="button-submit-decision"
                        >
                          {processApprovalMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Submit {approvalAction}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setApprovalAction(null);
                            setApprovalNotes("");
                          }}
                          data-testid="button-cancel-decision"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}