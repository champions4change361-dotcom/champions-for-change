import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Calculator, Save, Download, Upload, Copy, 
  Plus, Minus, ChevronDown, ChevronRight, Settings,
  FileSpreadsheet, Zap, Target, AlertCircle, CheckCircle,
  MoreVertical, Edit3, Trash2, RefreshCw, Lock, Unlock
} from "lucide-react";
import { Link } from "wouter";

interface BudgetPlanningProps {}

// Excel-style budget item interface
interface BudgetLineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  itemName: string;
  description?: string;
  itemType: 'personnel' | 'supplies' | 'equipment' | 'services' | 'other';
  budgetedAmount: number;
  actualAmount?: number;
  formula?: string;
  isCalculated: boolean;
  isEditable: boolean;
  parentItemId?: string;
  level: number; // For hierarchical display
  isExpanded?: boolean;
  children?: BudgetLineItem[];
}

// Mock data for Excel-style budget planning
const mockBudgetCategories = [
  { id: "cat-1", name: "Athletics", type: "department", isExpanded: true },
  { id: "cat-2", name: "Academics", type: "department", isExpanded: true },
  { id: "cat-3", name: "Operations", type: "administrative", isExpanded: false },
  { id: "cat-4", name: "Technology", type: "infrastructure", isExpanded: false }
];

const mockBudgetItems: BudgetLineItem[] = [
  // Athletics Category
  { id: "item-1", categoryId: "cat-1", categoryName: "Athletics", itemName: "Coaching Staff", itemType: "personnel", budgetedAmount: 180000, isCalculated: false, isEditable: true, level: 1 },
  { id: "item-2", categoryId: "cat-1", categoryName: "Athletics", itemName: "Head Coach", itemType: "personnel", budgetedAmount: 85000, parentItemId: "item-1", isCalculated: false, isEditable: true, level: 2 },
  { id: "item-3", categoryId: "cat-1", categoryName: "Athletics", itemName: "Assistant Coaches", itemType: "personnel", budgetedAmount: 95000, parentItemId: "item-1", isCalculated: false, isEditable: true, level: 2 },
  { id: "item-4", categoryId: "cat-1", categoryName: "Athletics", itemName: "Equipment & Supplies", itemType: "equipment", budgetedAmount: 125000, isCalculated: false, isEditable: true, level: 1 },
  { id: "item-5", categoryId: "cat-1", categoryName: "Athletics", itemName: "Uniforms", itemType: "equipment", budgetedAmount: 45000, parentItemId: "item-4", isCalculated: false, isEditable: true, level: 2 },
  { id: "item-6", categoryId: "cat-1", categoryName: "Athletics", itemName: "Training Equipment", itemType: "equipment", budgetedAmount: 80000, parentItemId: "item-4", isCalculated: false, isEditable: true, level: 2 },
  
  // Academics Category  
  { id: "item-7", categoryId: "cat-2", categoryName: "Academics", itemName: "Faculty Salaries", itemType: "personnel", budgetedAmount: 850000, isCalculated: false, isEditable: true, level: 1 },
  { id: "item-8", categoryId: "cat-2", categoryName: "Academics", itemName: "Instructional Materials", itemType: "supplies", budgetedAmount: 95000, isCalculated: false, isEditable: true, level: 1 },
  { id: "item-9", categoryId: "cat-2", categoryName: "Academics", itemName: "Textbooks", itemType: "supplies", budgetedAmount: 65000, parentItemId: "item-8", isCalculated: false, isEditable: true, level: 2 },
  { id: "item-10", categoryId: "cat-2", categoryName: "Academics", itemName: "Digital Resources", itemType: "supplies", budgetedAmount: 30000, parentItemId: "item-8", isCalculated: false, isEditable: true, level: 2 },
];

const mockBudgetTemplates = [
  { id: "template-1", name: "High School Standard", organizationType: "high_school", isPublic: true, usageCount: 156 },
  { id: "template-2", name: "Middle School Basic", organizationType: "middle_school", isPublic: true, usageCount: 89 },
  { id: "template-3", name: "Elementary School", organizationType: "elementary", isPublic: true, usageCount: 203 },
  { id: "template-4", name: "District Overview", organizationType: "district", isPublic: true, usageCount: 45 }
];

export default function BudgetPlanning({}: BudgetPlanningProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetLineItem[]>(mockBudgetItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: string } | null>(null);
  const [budgetName, setBudgetName] = useState("FY 2024-2025 Budget Plan");
  const [fiscalYear, setFiscalYear] = useState("2024-2025");
  const [budgetStatus, setBudgetStatus] = useState<"draft" | "submitted" | "approved">("draft");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["cat-1", "cat-2"]));
  const [showFormulas, setShowFormulas] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { toast } = useToast();

  // Budget templates query
  const { data: budgetTemplates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['/api/budget/templates']
  });

  // Auto-save budget mutation (mock for now)
  const saveBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 500));
      return budgetData;
    },
    onSuccess: () => {
      toast({
        title: "Budget Saved",
        description: "Your budget has been automatically saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-save effect (Excel-style auto-save)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      saveBudgetMutation.mutate({
        name: budgetName,
        fiscalYear,
        status: budgetStatus,
        items: budgetItems
      });
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [budgetItems, budgetName, fiscalYear]);

  // Calculate totals and formulas (Excel-style calculations)
  const calculateTotals = useCallback(() => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const updatedItems = budgetItems.map(item => {
        if (item.formula && item.isCalculated) {
          // Simple formula calculation (can be enhanced for complex formulas)
          if (item.formula.includes('SUM')) {
            const childItems = budgetItems.filter(child => child.parentItemId === item.id);
            const total = childItems.reduce((sum, child) => sum + child.budgetedAmount, 0);
            return { ...item, budgetedAmount: total };
          }
        }
        return item;
      });
      
      setBudgetItems(updatedItems);
      setIsCalculating(false);
    }, 300);
  }, [budgetItems]);

  // Toggle category expansion (Excel-style row grouping)
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Add new budget item (Excel-style row insertion)
  const addBudgetItem = (categoryId: string, parentId?: string) => {
    const newItem: BudgetLineItem = {
      id: `item-${Date.now()}`,
      categoryId,
      categoryName: mockBudgetCategories.find(c => c.id === categoryId)?.name || "Unknown",
      itemName: "New Budget Item",
      itemType: "other",
      budgetedAmount: 0,
      isCalculated: false,
      isEditable: true,
      level: parentId ? 2 : 1,
      parentItemId: parentId
    };

    setBudgetItems(prev => [...prev, newItem]);
    setEditingCell({ itemId: newItem.id, field: "itemName" });
  };

  // Delete budget item (Excel-style row deletion)
  const deleteBudgetItem = (itemId: string) => {
    setBudgetItems(prev => prev.filter(item => 
      item.id !== itemId && item.parentItemId !== itemId
    ));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  // Update budget item (Excel-style cell editing)
  const updateBudgetItem = (itemId: string, field: string, value: any) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Copy/paste functionality (Excel-style)
  const copySelectedItems = () => {
    if (selectedItems.size === 0) return;
    
    const itemsToCopy = budgetItems.filter(item => selectedItems.has(item.id));
    navigator.clipboard.writeText(JSON.stringify(itemsToCopy));
    
    toast({
      title: "Items Copied",
      description: `Copied ${selectedItems.size} budget items to clipboard.`,
    });
  };

  // Group items by category for display
  const groupedItems = useMemo(() => {
    const groups: Record<string, BudgetLineItem[]> = {};
    
    budgetItems.forEach(item => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = [];
      }
      groups[item.categoryId].push(item);
    });
    
    return groups;
  }, [budgetItems]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    Object.entries(groupedItems).forEach(([categoryId, items]) => {
      totals[categoryId] = items
        .filter(item => item.level === 1) // Only count top-level items to avoid double counting
        .reduce((sum, item) => sum + item.budgetedAmount, 0);
    });
    
    return totals;
  }, [groupedItems]);

  // Grand total
  const grandTotal = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);
  }, [categoryTotals]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Excel-style toolbar */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                <div>
                  <Input
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none p-0 h-auto"
                    data-testid="input-budget-name"
                  />
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Excel-style budget planning and allocation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={budgetStatus === "approved" ? "default" : "secondary"} className="capitalize">
                  {budgetStatus}
                </Badge>
                {saveBudgetMutation.isPending ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Saved
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          {/* Excel-style toolbar */}
          <CardContent className="border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 border-r pr-2">
                <Button size="sm" variant="outline" data-testid="button-save">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  data-testid="button-export"
                  onClick={async () => {
                    try {
                      const { apiRequest } = await import("@/lib/queryClient");
                      const response = await apiRequest('/api/budget/export?format=excel', { method: 'GET' });
                      
                      const fileName = response.fileName || `budget-plan-${Date.now()}.excel`;
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
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center gap-1 border-r pr-2">
                <Button size="sm" variant="outline" onClick={copySelectedItems} disabled={selectedItems.size === 0}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={calculateTotals} disabled={isCalculating}>
                  <Calculator className="h-4 w-4 mr-1" />
                  {isCalculating ? "Calculating..." : "Recalculate"}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="show-formulas" className="text-sm">Show Formulas:</Label>
                <Switch
                  id="show-formulas"
                  checked={showFormulas}
                  onCheckedChange={setShowFormulas}
                />
              </div>
              
              <div className="ml-auto">
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">FY 2024-2025</SelectItem>
                    <SelectItem value="2025-2026">FY 2025-2026</SelectItem>
                    <SelectItem value="2026-2027">FY 2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Templates Quick Access */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Budget Templates
            </CardTitle>
            <CardDescription>
              Start with a pre-built template or continue with your custom budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {mockBudgetTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  data-testid={`template-${template.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.usageCount}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-3">
                    {template.organizationType.replace('_', ' ')} Budget
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Excel-style Budget Grid */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Budget Line Items</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Grand Total:</span>
                <Badge variant="outline" className="text-lg font-bold">
                  ${grandTotal.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Excel-style header */}
              <div className="grid grid-cols-12 gap-2 p-4 bg-gray-50 dark:bg-gray-700 border-b sticky top-0 z-10 text-sm font-medium">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(budgetItems.map(item => item.id)));
                      } else {
                        setSelectedItems(new Set());
                      }
                    }}
                    data-testid="checkbox-select-all"
                  />
                </div>
                <div className="col-span-3">Item Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Budgeted Amount</div>
                <div className="col-span-2">{showFormulas ? "Formula" : "Description"}</div>
                <div className="col-span-1">Actions</div>
              </div>

              <ScrollArea className="h-96">
                {mockBudgetCategories.map((category) => {
                  const categoryItems = groupedItems[category.id] || [];
                  const categoryTotal = categoryTotals[category.id] || 0;
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <div key={category.id}>
                      {/* Category Header Row */}
                      <div className="grid grid-cols-12 gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleCategory(category.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="col-span-6 font-semibold text-blue-800 dark:text-blue-200">
                          {category.name}
                        </div>
                        <div className="col-span-2 font-semibold text-blue-800 dark:text-blue-200">
                          ${categoryTotal.toLocaleString()}
                        </div>
                        <div className="col-span-2"></div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => addBudgetItem(category.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Category Items */}
                      {isExpanded && categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`grid grid-cols-12 gap-2 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            selectedItems.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          data-testid={`budget-item-${item.id}`}
                        >
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedItems.has(item.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedItems);
                                if (e.target.checked) {
                                  newSet.add(item.id);
                                } else {
                                  newSet.delete(item.id);
                                }
                                setSelectedItems(newSet);
                              }}
                            />
                          </div>
                          <div className={`col-span-3 ${item.level === 2 ? 'pl-4' : ''}`}>
                            {editingCell?.itemId === item.id && editingCell?.field === 'itemName' ? (
                              <Input
                                value={item.itemName}
                                onChange={(e) => updateBudgetItem(item.id, 'itemName', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingCell(null);
                                }}
                                className="h-8"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="py-2 cursor-text"
                                onClick={() => setEditingCell({ itemId: item.id, field: 'itemName' })}
                              >
                                {item.itemName}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline" className="capitalize">
                              {item.categoryName}
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            <Badge variant="secondary" className="capitalize">
                              {item.itemType}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            {editingCell?.itemId === item.id && editingCell?.field === 'budgetedAmount' ? (
                              <Input
                                type="number"
                                value={item.budgetedAmount}
                                onChange={(e) => updateBudgetItem(item.id, 'budgetedAmount', Number(e.target.value))}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingCell(null);
                                }}
                                className="h-8"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="py-2 cursor-text font-mono"
                                onClick={() => setEditingCell({ itemId: item.id, field: 'budgetedAmount' })}
                              >
                                ${item.budgetedAmount.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-sm text-gray-600">
                            {showFormulas ? (item.formula || "No formula") : (item.description || "No description")}
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center gap-1">
                              {item.level === 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => addBudgetItem(item.categoryId, item.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={() => deleteBudgetItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/budget">
              <Button variant="outline">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" data-testid="button-save-draft">
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button data-testid="button-submit-budget">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}