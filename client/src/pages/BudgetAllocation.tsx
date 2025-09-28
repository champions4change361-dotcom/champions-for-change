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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Target, Building, BookOpen, Users, Calculator, 
  PieChart, BarChart3, TrendingUp, ArrowRightLeft,
  Settings, Lock, Unlock, CheckCircle, Clock,
  AlertTriangle, FileText, Download, Upload,
  ChevronDown, ChevronRight, Plus, Minus,
  DollarSign, Percent, Zap, History
} from "lucide-react";
import { Link } from "wouter";

interface BudgetAllocationProps {}

// Budget allocation interfaces
interface AllocationTarget {
  id: string;
  name: string;
  type: 'district' | 'school' | 'department' | 'program';
  parentId?: string;
  level: number;
  totalBudget: number;
  allocatedAmount: number;
  remainingAmount: number;
  isLocked: boolean;
  allocations: SubAllocation[];
  children?: AllocationTarget[];
}

interface SubAllocation {
  id: string;
  targetId: string;
  budgetCategoryId: string;
  categoryName: string;
  allocatedAmount: number;
  percentage: number;
  isLocked: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  lastModified: string;
  modifiedBy: string;
}

interface AllocationTemplate {
  id: string;
  name: string;
  description: string;
  organizationType: string;
  allocations: Record<string, number>; // category -> percentage
  isPublic: boolean;
  usageCount: number;
}

// Mock data for budget allocation
const mockAllocationTargets: AllocationTarget[] = [
  {
    id: "district-1",
    name: "Springfield School District",
    type: "district",
    level: 0,
    totalBudget: 2850000,
    allocatedAmount: 2456000,
    remainingAmount: 394000,
    isLocked: false,
    allocations: [],
    children: [
      {
        id: "school-1",
        name: "Springfield High School",
        type: "school",
        parentId: "district-1",
        level: 1,
        totalBudget: 1200000,
        allocatedAmount: 980000,
        remainingAmount: 220000,
        isLocked: false,
        allocations: [
          { id: "alloc-1", targetId: "school-1", budgetCategoryId: "cat-1", categoryName: "Athletics", allocatedAmount: 350000, percentage: 35.7, isLocked: false, approvalStatus: "approved", lastModified: "2024-12-28", modifiedBy: "J. Smith" },
          { id: "alloc-2", targetId: "school-1", budgetCategoryId: "cat-2", categoryName: "Academics", allocatedAmount: 480000, percentage: 49.0, isLocked: false, approvalStatus: "approved", lastModified: "2024-12-27", modifiedBy: "J. Smith" },
          { id: "alloc-3", targetId: "school-1", budgetCategoryId: "cat-3", categoryName: "Operations", allocatedAmount: 150000, percentage: 15.3, isLocked: false, approvalStatus: "pending", lastModified: "2024-12-28", modifiedBy: "M. Johnson" }
        ]
      },
      {
        id: "school-2",
        name: "Springfield Middle School",
        type: "school",
        parentId: "district-1",
        level: 1,
        totalBudget: 850000,
        allocatedAmount: 756000,
        remainingAmount: 94000,
        isLocked: false,
        allocations: [
          { id: "alloc-4", targetId: "school-2", budgetCategoryId: "cat-1", categoryName: "Athletics", allocatedAmount: 180000, percentage: 23.8, isLocked: false, approvalStatus: "approved", lastModified: "2024-12-26", modifiedBy: "K. Williams" },
          { id: "alloc-5", targetId: "school-2", budgetCategoryId: "cat-2", categoryName: "Academics", allocatedAmount: 420000, percentage: 55.6, isLocked: false, approvalStatus: "approved", lastModified: "2024-12-26", modifiedBy: "K. Williams" },
          { id: "alloc-6", targetId: "school-2", budgetCategoryId: "cat-3", categoryName: "Operations", allocatedAmount: 156000, percentage: 20.6, isLocked: false, approvalStatus: "approved", lastModified: "2024-12-25", modifiedBy: "K. Williams" }
        ]
      }
    ]
  }
];

const mockAllocationTemplates: AllocationTemplate[] = [
  {
    id: "template-1",
    name: "High School Standard",
    description: "Standard budget allocation for high schools",
    organizationType: "high_school",
    allocations: { "Athletics": 35, "Academics": 45, "Operations": 15, "Technology": 5 },
    isPublic: true,
    usageCount: 89
  },
  {
    id: "template-2",
    name: "Middle School Focus",
    description: "Academic-focused allocation for middle schools",
    organizationType: "middle_school",
    allocations: { "Athletics": 25, "Academics": 55, "Operations": 15, "Technology": 5 },
    isPublic: true,
    usageCount: 67
  },
  {
    id: "template-3",
    name: "Elementary Basic",
    description: "Basic allocation template for elementary schools",
    organizationType: "elementary",
    allocations: { "Academics": 70, "Operations": 20, "Technology": 10 },
    isPublic: true,
    usageCount: 123
  }
];

const mockBudgetCategories = [
  { id: "cat-1", name: "Athletics", color: "#0088FE", description: "Sports programs, equipment, coaching" },
  { id: "cat-2", name: "Academics", color: "#00C49F", description: "Instruction, curriculum, materials" },
  { id: "cat-3", name: "Operations", color: "#FFBB28", description: "Facilities, maintenance, utilities" },
  { id: "cat-4", name: "Technology", color: "#FF8042", description: "IT equipment, software, support" },
  { id: "cat-5", name: "Transportation", color: "#8884D8", description: "Buses, fuel, maintenance" }
];

export default function BudgetAllocation({}: BudgetAllocationProps) {
  const [selectedTarget, setSelectedTarget] = useState<AllocationTarget | null>(mockAllocationTargets[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<AllocationTemplate | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["district-1"]));
  const [allocationMode, setAllocationMode] = useState<"percentage" | "amount">("percentage");
  const [isAllocating, setIsAllocating] = useState(false);
  const [showAllocationWizard, setShowAllocationWizard] = useState(false);
  const [tempAllocations, setTempAllocations] = useState<Record<string, number>>({});
  
  const { toast } = useToast();

  // Budget allocation query
  const { data: allocationTargets, isLoading: targetsLoading, error: targetsError } = useQuery({
    queryKey: ['/api/budget/allocations']
  });

  // Allocation templates query
  const { data: allocationTemplates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['/api/budget/templates']
  });

  // Save allocation mutation (mock for now)
  const saveAllocationMutation = useMutation({
    mutationFn: async (allocationData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return allocationData;
    },
    onSuccess: () => {
      toast({
        title: "Allocation Saved",
        description: "Budget allocation has been saved successfully.",
      });
      setIsAllocating(false);
    },
    onError: () => {
      toast({
        title: "Save Error",
        description: "Failed to save allocation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Toggle node expansion in hierarchy
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Apply allocation template
  const applyTemplate = (template: AllocationTemplate) => {
    if (!selectedTarget) return;
    
    const newAllocations: Record<string, number> = {};
    Object.entries(template.allocations).forEach(([categoryName, percentage]) => {
      const category = mockBudgetCategories.find(cat => cat.name === categoryName);
      if (category) {
        newAllocations[category.id] = percentage;
      }
    });
    
    setTempAllocations(newAllocations);
    setSelectedTemplate(template);
    
    toast({
      title: "Template Applied",
      description: `Applied ${template.name} allocation template.`,
    });
  };

  // Calculate allocation amounts from percentages
  const calculateAllocationAmounts = (percentages: Record<string, number>, totalBudget: number) => {
    const amounts: Record<string, number> = {};
    Object.entries(percentages).forEach(([categoryId, percentage]) => {
      amounts[categoryId] = Math.round((totalBudget * percentage) / 100);
    });
    return amounts;
  };

  // Save allocation changes
  const saveAllocations = async () => {
    if (!selectedTarget) return;
    
    setIsAllocating(true);
    
    const amounts = calculateAllocationAmounts(tempAllocations, selectedTarget.totalBudget);
    const allocationData = {
      targetId: selectedTarget.id,
      allocations: amounts,
      mode: allocationMode,
      template: selectedTemplate?.id
    };
    
    await saveAllocationMutation.mutateAsync(allocationData);
  };

  // Reset allocation to current values
  const resetAllocations = () => {
    if (!selectedTarget) return;
    
    const currentAllocations: Record<string, number> = {};
    selectedTarget.allocations.forEach(alloc => {
      currentAllocations[alloc.budgetCategoryId] = alloc.percentage;
    });
    
    setTempAllocations(currentAllocations);
    setSelectedTemplate(null);
  };

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return Object.values(tempAllocations).reduce((sum, val) => sum + val, 0);
  }, [tempAllocations]);

  // Initialize temp allocations when target changes
  useEffect(() => {
    if (selectedTarget) {
      resetAllocations();
    }
  }, [selectedTarget]);

  // Render hierarchy tree
  const renderHierarchyTree = (nodes: AllocationTarget[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            selectedTarget?.id === node.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : ''
          }`}
          onClick={() => setSelectedTarget(node)}
          data-testid={`hierarchy-node-${node.id}`}
        >
          {node.children && node.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
            >
              {expandedNodes.has(node.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {node.type === 'district' && <Building className="h-5 w-5 text-blue-600" />}
            {node.type === 'school' && <BookOpen className="h-5 w-5 text-green-600" />}
            {node.type === 'department' && <Users className="h-5 w-5 text-purple-600" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.name}</span>
              <Badge variant="outline" className="capitalize">{node.type}</Badge>
              {node.isLocked && <Lock className="h-4 w-4 text-orange-500" />}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Budget: ${node.totalBudget.toLocaleString()} • 
              Allocated: ${node.allocatedAmount.toLocaleString()} • 
              Remaining: ${node.remainingAmount.toLocaleString()}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">
              {((node.allocatedAmount / node.totalBudget) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(node.allocatedAmount / node.totalBudget) * 100} 
              className="w-20 h-2 mt-1"
            />
          </div>
        </div>
        
        {expandedNodes.has(node.id) && node.children && (
          <div className="mt-2">
            {renderHierarchyTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-600" />
              Budget Allocation Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              District → School → Department budget allocation and distribution tools
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" data-testid="button-allocation-history">
              <History className="h-4 w-4 mr-2" />
              Allocation History
            </Button>
            <Link href="/budget">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hierarchy Navigation */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Hierarchy
              </CardTitle>
              <CardDescription>
                Select a district, school, or department to manage budget allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {renderHierarchyTree(mockAllocationTargets)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Allocation Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedTarget && (
              <>
                {/* Selected Target Overview */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedTarget.type === 'district' && <Building className="h-5 w-5 text-blue-600" />}
                          {selectedTarget.type === 'school' && <BookOpen className="h-5 w-5 text-green-600" />}
                          {selectedTarget.type === 'department' && <Users className="h-5 w-5 text-purple-600" />}
                          {selectedTarget.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedTarget.type.charAt(0).toUpperCase() + selectedTarget.type.slice(1)} Budget Allocation
                        </CardDescription>
                      </div>
                      <Badge variant={selectedTarget.isLocked ? "secondary" : "default"}>
                        {selectedTarget.isLocked ? "Locked" : "Editable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm text-gray-600">Total Budget</Label>
                        <div className="text-2xl font-bold" data-testid="text-total-budget">
                          ${selectedTarget.totalBudget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Allocated</Label>
                        <div className="text-2xl font-bold text-blue-600" data-testid="text-allocated-amount">
                          ${selectedTarget.allocatedAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Remaining</Label>
                        <div className="text-2xl font-bold text-green-600" data-testid="text-remaining-amount">
                          ${selectedTarget.remainingAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Budget Utilization</Label>
                        <span className="text-sm font-medium">
                          {((selectedTarget.allocatedAmount / selectedTarget.totalBudget) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={(selectedTarget.allocatedAmount / selectedTarget.totalBudget) * 100} />
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Templates */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Allocation Templates
                    </CardTitle>
                    <CardDescription>
                      Quick-start with pre-built allocation templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockAllocationTemplates
                        .filter(template => 
                          template.organizationType === selectedTarget.type ||
                          template.organizationType === 'general'
                        )
                        .map((template) => (
                          <div
                            key={template.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedTemplate?.id === template.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => applyTemplate(template)}
                            data-testid={`allocation-template-${template.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {template.usageCount}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {template.description}
                            </p>
                            <div className="space-y-1">
                              {Object.entries(template.allocations).map(([category, percentage]) => (
                                <div key={category} className="flex justify-between text-xs">
                                  <span>{category}</span>
                                  <span>{percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Editor */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Budget Allocation Editor
                        </CardTitle>
                        <CardDescription>
                          Adjust budget allocations across categories
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={allocationMode} onValueChange={(value: any) => setAllocationMode(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Total Percentage Indicator */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Total Allocation</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {totalPercentage.toFixed(1)}%
                        </span>
                        {Math.abs(totalPercentage - 100) > 0.1 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Category Allocations */}
                    <div className="space-y-4">
                      {mockBudgetCategories.map((category) => {
                        const currentPercentage = tempAllocations[category.id] || 0;
                        const currentAmount = Math.round((selectedTarget.totalBudget * currentPercentage) / 100);
                        
                        return (
                          <div key={category.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: category.color }}
                                />
                                <div>
                                  <Label className="font-medium">{category.name}</Label>
                                  <p className="text-xs text-gray-500">{category.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {allocationMode === 'percentage' 
                                    ? `${currentPercentage.toFixed(1)}%`
                                    : `$${currentAmount.toLocaleString()}`
                                  }
                                </div>
                                <div className="text-xs text-gray-500">
                                  ${currentAmount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Slider
                                value={[currentPercentage]}
                                onValueChange={([value]) => {
                                  setTempAllocations(prev => ({
                                    ...prev,
                                    [category.id]: value
                                  }));
                                }}
                                max={100}
                                step={0.1}
                                className="w-full"
                                data-testid={`slider-${category.id}`}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        onClick={resetAllocations}
                        data-testid="button-reset-allocations"
                      >
                        Reset to Current
                      </Button>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => setShowAllocationWizard(true)}
                          data-testid="button-allocation-wizard"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Auto-Allocate
                        </Button>
                        <Button 
                          onClick={saveAllocations}
                          disabled={isAllocating || Math.abs(totalPercentage - 100) > 0.1}
                          data-testid="button-save-allocations"
                        >
                          {isAllocating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Allocation
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Allocations Table */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Current Allocations</CardTitle>
                    <CardDescription>
                      Review existing budget allocations and their approval status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Category</th>
                            <th className="text-right p-2">Amount</th>
                            <th className="text-right p-2">Percentage</th>
                            <th className="text-center p-2">Status</th>
                            <th className="text-center p-2">Last Modified</th>
                            <th className="text-center p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTarget.allocations.map((allocation) => (
                            <tr key={allocation.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded"
                                    style={{ 
                                      backgroundColor: mockBudgetCategories.find(c => c.id === allocation.budgetCategoryId)?.color || '#gray' 
                                    }}
                                  />
                                  {allocation.categoryName}
                                </div>
                              </td>
                              <td className="p-2 text-right font-mono">
                                ${allocation.allocatedAmount.toLocaleString()}
                              </td>
                              <td className="p-2 text-right font-mono">
                                {allocation.percentage.toFixed(1)}%
                              </td>
                              <td className="p-2 text-center">
                                <Badge 
                                  variant={allocation.approvalStatus === "approved" ? "default" : "secondary"}
                                  className={
                                    allocation.approvalStatus === "approved" 
                                      ? "bg-green-100 text-green-800" 
                                      : allocation.approvalStatus === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {allocation.approvalStatus}
                                </Badge>
                              </td>
                              <td className="p-2 text-center text-sm text-gray-600">
                                <div>{allocation.lastModified}</div>
                                <div className="text-xs">by {allocation.modifiedBy}</div>
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {allocation.isLocked ? (
                                    <Lock className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Settings className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}