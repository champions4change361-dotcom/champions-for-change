import type { Express } from "express";
import { getStorage } from "./storage";
import { loadUserContext, requireBudgetDataAccess, requireOrganizationAccess } from "./rbac-middleware";
import { 
  insertBudgetCategorySchema, insertBudgetItemSchema, insertBudgetAllocationSchema,
  insertBudgetTransactionSchema, insertBudgetApprovalSchema, insertBudgetTemplateSchema,
  type BudgetCategory, type BudgetItem, type BudgetAllocation, 
  type BudgetTransaction, type BudgetApproval, type BudgetTemplate
} from "@shared/schema";
import { z } from "zod";

// Validation schemas for complex operations
const budgetFiltersSchema = z.object({
  districtId: z.string().optional(),
  schoolId: z.string().optional(),
  fiscalYear: z.string().optional(),
  categoryType: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const budgetTransferSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  amount: z.number().positive(),
  reason: z.string().min(1),
});

const budgetApprovalActionSchema = z.object({
  action: z.enum(['approved', 'rejected', 'delegated']),
  notes: z.string().optional(),
});

const budgetFormulaCalculationSchema = z.object({
  formula: z.string(),
  itemId: z.string(),
});

const budgetReportRequestSchema = z.object({
  reportType: z.enum(['variance', 'cashflow', 'performance', 'summary']),
  format: z.enum(['excel', 'pdf', 'csv']).optional(),
  filters: budgetFiltersSchema,
});

export function registerBudgetRoutes(app: Express) {
  console.log('🏦 Registering comprehensive Excel-style budget management routes');
  
  // ===================================================================
  // BUDGET CATEGORIES MANAGEMENT
  // ===================================================================

  // Get budget categories by district
  app.get("/api/budget/categories", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { districtId, categoryType } = req.query;
      
      let categories: BudgetCategory[];
      if (districtId) {
        categories = await storage.getBudgetCategoriesByDistrict(districtId as string, req.user!);
      } else if (categoryType) {
        categories = await storage.getBudgetCategoriesByType(categoryType as string, req.user!);
      } else {
        // Get hierarchy view
        categories = await storage.getBudgetCategoryHierarchy(undefined, req.user);
      }
      
      res.json(categories);
    } catch (error: any) {
      console.error("Get budget categories error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget categories",
        details: error.message 
      });
    }
  });

  // Create budget category
  app.post("/api/budget/categories", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const categoryData = insertBudgetCategorySchema.parse(req.body);
      
      const category = await storage.createBudgetCategory(categoryData, req.user!);
      
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Create budget category error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget category",
        details: error.message 
      });
    }
  });

  // Update budget category
  app.put("/api/budget/categories/:id", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      const updates = req.body;
      
      const category = await storage.updateBudgetCategory(id, updates, req.user!);
      
      if (!category) {
        return res.status(404).json({ error: "Budget category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error("Update budget category error:", error);
      res.status(500).json({ 
        error: "Failed to update budget category",
        details: error.message 
      });
    }
  });

  // Delete budget category
  app.delete("/api/budget/categories/:id", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      
      const success = await storage.deleteBudgetCategory(id, req.user!);
      
      if (!success) {
        return res.status(404).json({ error: "Budget category not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete budget category error:", error);
      res.status(500).json({ 
        error: "Failed to delete budget category",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET ITEMS MANAGEMENT 
  // ===================================================================

  // Get budget items
  app.get("/api/budget/items", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { categoryId, itemType } = req.query;
      
      let items: BudgetItem[];
      if (categoryId) {
        items = await storage.getBudgetItemsByCategory(categoryId as string, req.user!);
      } else if (itemType) {
        items = await storage.getBudgetItemsByType(itemType as string, req.user!);
      } else {
        return res.status(400).json({ error: "categoryId or itemType parameter required" });
      }
      
      res.json(items);
    } catch (error: any) {
      console.error("Get budget items error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget items",
        details: error.message 
      });
    }
  });

  // Create budget item
  app.post("/api/budget/items", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const itemData = insertBudgetItemSchema.parse(req.body);
      
      const item = await storage.createBudgetItem(itemData, req.user!);
      
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Create budget item error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget item",
        details: error.message 
      });
    }
  });

  // Update budget item 
  app.put("/api/budget/items/:id", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      const updates = req.body;
      
      const item = await storage.updateBudgetItem(id, updates, req.user!);
      
      if (!item) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      
      res.json(item);
    } catch (error: any) {
      console.error("Update budget item error:", error);
      res.status(500).json({ 
        error: "Failed to update budget item",
        details: error.message 
      });
    }
  });

  // Calculate Excel-style formulas for budget item
  app.post("/api/budget/items/:id/calculate", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      
      const item = await storage.calculateBudgetItemFormulas(id, req.user!);
      
      if (!item) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      
      res.json(item);
    } catch (error: any) {
      console.error("Calculate budget item formulas error:", error);
      res.status(500).json({ 
        error: "Failed to calculate budget item formulas",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET ALLOCATIONS MANAGEMENT (Excel-style with live calculations)
  // ===================================================================

  // Get budget allocations with Excel-style summary
  app.get("/api/budget/allocations", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { budgetItemId, schoolId, fiscalYear } = req.query;
      
      let allocations: BudgetAllocation[];
      if (budgetItemId) {
        allocations = await storage.getBudgetAllocationsByItem(budgetItemId as string, req.user!);
      } else if (schoolId) {
        allocations = await storage.getBudgetAllocationsBySchool(schoolId as string, req.user!);
      } else if (fiscalYear) {
        allocations = await storage.getBudgetAllocationsByFiscalYear(fiscalYear as string, req.user!);
      } else {
        return res.status(400).json({ error: "budgetItemId, schoolId, or fiscalYear parameter required" });
      }
      
      res.json(allocations);
    } catch (error: any) {
      console.error("Get budget allocations error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget allocations",
        details: error.message 
      });
    }
  });

  // Get budget allocation summary (Excel-style dashboard data)
  app.get("/api/budget/allocations/summary", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const filters = budgetFiltersSchema.parse(req.query);
      
      const summary = await storage.getBudgetAllocationSummary(filters, req.user!);
      
      res.json(summary);
    } catch (error: any) {
      console.error("Get budget allocation summary error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget allocation summary",
        details: error.message 
      });
    }
  });

  // Create budget allocation
  app.post("/api/budget/allocations", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const allocationData = insertBudgetAllocationSchema.parse(req.body);
      
      const allocation = await storage.createBudgetAllocation(allocationData, req.user!);
      
      res.status(201).json(allocation);
    } catch (error: any) {
      console.error("Create budget allocation error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget allocation",
        details: error.message 
      });
    }
  });

  // Recalculate budget allocation (Excel-style auto-calculations)
  app.post("/api/budget/allocations/:id/recalculate", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      
      const allocation = await storage.recalculateBudgetAllocation(id, req.user!);
      
      if (!allocation) {
        return res.status(404).json({ error: "Budget allocation not found" });
      }
      
      res.json(allocation);
    } catch (error: any) {
      console.error("Recalculate budget allocation error:", error);
      res.status(500).json({ 
        error: "Failed to recalculate budget allocation",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET TRANSACTIONS MANAGEMENT (Enhanced spending tracking)
  // ===================================================================

  // Get budget transactions
  app.get("/api/budget/transactions", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { allocationId, dateFrom, dateTo, transactionType, approvalStatus } = req.query;
      
      let transactions: BudgetTransaction[];
      if (allocationId) {
        transactions = await storage.getBudgetTransactionsByAllocation(allocationId as string, req.user!);
      } else if (dateFrom && dateTo) {
        transactions = await storage.getBudgetTransactionsByDateRange(dateFrom as string, dateTo as string, req.user!);
      } else if (transactionType) {
        transactions = await storage.getBudgetTransactionsByType(transactionType as string, req.user!);
      } else if (approvalStatus) {
        transactions = await storage.getBudgetTransactionsByStatus(approvalStatus as string, req.user!);
      } else {
        return res.status(400).json({ error: "allocationId, date range, transactionType, or approvalStatus parameter required" });
      }
      
      res.json(transactions);
    } catch (error: any) {
      console.error("Get budget transactions error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget transactions",
        details: error.message 
      });
    }
  });

  // Create budget transaction
  app.post("/api/budget/transactions", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const transactionData = insertBudgetTransactionSchema.parse(req.body);
      
      const transaction = await storage.createBudgetTransaction(transactionData, req.user!);
      
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Create budget transaction error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget transaction",
        details: error.message 
      });
    }
  });

  // Process transaction approval
  app.post("/api/budget/transactions/:id/approve", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      const { notes } = req.body;
      
      const transaction = await storage.processBudgetTransactionApproval(id, req.user!.id, notes, req.user!);
      
      if (!transaction) {
        return res.status(404).json({ error: "Budget transaction not found" });
      }
      
      res.json(transaction);
    } catch (error: any) {
      console.error("Approve budget transaction error:", error);
      res.status(500).json({ 
        error: "Failed to approve budget transaction",
        details: error.message 
      });
    }
  });

  // Get transaction analytics
  app.get("/api/budget/transactions/analytics", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const filters = budgetFiltersSchema.parse(req.query);
      
      const analytics = await storage.getBudgetTransactionAnalytics(filters, req.user!);
      
      res.json(analytics);
    } catch (error: any) {
      console.error("Get transaction analytics error:", error);
      res.status(500).json({ 
        error: "Failed to fetch transaction analytics",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET APPROVALS WORKFLOW MANAGEMENT
  // ===================================================================

  // Get budget approvals
  app.get("/api/budget/approvals", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { approvalType, relatedEntityId, approverId, workflowStatus } = req.query;
      
      let approvals: BudgetApproval[];
      if (approvalType) {
        approvals = await storage.getBudgetApprovalsByType(approvalType as string, req.user!);
      } else if (relatedEntityId) {
        approvals = await storage.getBudgetApprovalsByEntity(relatedEntityId as string, req.user!);
      } else if (approverId) {
        approvals = await storage.getBudgetApprovalsByApprover(approverId as string, req.user!);
      } else if (workflowStatus) {
        approvals = await storage.getBudgetApprovalsByStatus(workflowStatus as string, req.user!);
      } else {
        return res.status(400).json({ error: "approvalType, relatedEntityId, approverId, or workflowStatus parameter required" });
      }
      
      res.json(approvals);
    } catch (error: any) {
      console.error("Get budget approvals error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget approvals",
        details: error.message 
      });
    }
  });

  // Create budget approval workflow
  app.post("/api/budget/approvals", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const approvalData = insertBudgetApprovalSchema.parse(req.body);
      
      const approval = await storage.createBudgetApproval(approvalData, req.user!);
      
      res.status(201).json(approval);
    } catch (error: any) {
      console.error("Create budget approval error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget approval",
        details: error.message 
      });
    }
  });

  // Process approval workflow step
  app.post("/api/budget/approvals/:id/process", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      const { action, notes } = budgetApprovalActionSchema.parse(req.body);
      
      const approval = await storage.processBudgetApprovalStep(id, action, notes, req.user!);
      
      if (!approval) {
        return res.status(404).json({ error: "Budget approval not found" });
      }
      
      res.json(approval);
    } catch (error: any) {
      console.error("Process budget approval error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to process budget approval",
        details: error.message 
      });
    }
  });

  // Get approval workflow for entity
  app.get("/api/budget/approvals/workflow/:entityId", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { entityId } = req.params;
      
      const workflow = await storage.getBudgetApprovalWorkflow(entityId, req.user!);
      
      res.json(workflow);
    } catch (error: any) {
      console.error("Get approval workflow error:", error);
      res.status(500).json({ 
        error: "Failed to fetch approval workflow",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET TEMPLATES MANAGEMENT
  // ===================================================================

  // Get budget templates
  app.get("/api/budget/templates", loadUserContext, async (req, res) => {
    try {
      const storage = await getStorage();
      const { organizationType, isPublic } = req.query;
      
      let templates: BudgetTemplate[];
      if (organizationType) {
        templates = await storage.getBudgetTemplatesByType(organizationType as string, req.user!);
      } else if (isPublic === 'true') {
        templates = await storage.getPublicBudgetTemplates();
      } else {
        return res.status(400).json({ error: "organizationType parameter or isPublic=true required" });
      }
      
      res.json(templates);
    } catch (error: any) {
      console.error("Get budget templates error:", error);
      res.status(500).json({ 
        error: "Failed to fetch budget templates",
        details: error.message 
      });
    }
  });

  // Create budget template
  app.post("/api/budget/templates", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const templateData = insertBudgetTemplateSchema.parse(req.body);
      
      const template = await storage.createBudgetTemplate(templateData, req.user!);
      
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Create budget template error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to create budget template",
        details: error.message 
      });
    }
  });

  // Apply budget template
  app.post("/api/budget/templates/:templateId/apply", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { templateId } = req.params;
      const { targetId } = req.body;
      
      if (!targetId) {
        return res.status(400).json({ error: "targetId is required" });
      }
      
      const success = await storage.applyBudgetTemplate(templateId, targetId, req.user!);
      
      if (!success) {
        return res.status(404).json({ error: "Template not found or application failed" });
      }
      
      // Increment usage counter
      await storage.incrementTemplateUsage(templateId);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Apply budget template error:", error);
      res.status(500).json({ 
        error: "Failed to apply budget template",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET ANALYSIS AND REPORTING
  // ===================================================================

  // Get variance analysis (Actual vs Budget)
  app.get("/api/budget/analysis/variance", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const filters = budgetFiltersSchema.parse(req.query);
      
      const analysis = await storage.getBudgetVarianceAnalysis(filters, req.user!);
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Get variance analysis error:", error);
      res.status(500).json({ 
        error: "Failed to fetch variance analysis",
        details: error.message 
      });
    }
  });

  // Get cash flow projections
  app.get("/api/budget/analysis/cashflow", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { fiscalYear } = req.query;
      
      if (!fiscalYear) {
        return res.status(400).json({ error: "fiscalYear parameter required" });
      }
      
      const projections = await storage.getBudgetCashFlowProjections(fiscalYear as string, req.user!);
      
      res.json(projections);
    } catch (error: any) {
      console.error("Get cash flow projections error:", error);
      res.status(500).json({ 
        error: "Failed to fetch cash flow projections",
        details: error.message 
      });
    }
  });

  // Get performance metrics
  app.get("/api/budget/analysis/performance", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const filters = budgetFiltersSchema.parse(req.query);
      
      const metrics = await storage.getBudgetPerformanceMetrics(filters, req.user!);
      
      res.json(metrics);
    } catch (error: any) {
      console.error("Get performance metrics error:", error);
      res.status(500).json({ 
        error: "Failed to fetch performance metrics",
        details: error.message 
      });
    }
  });

  // Generate budget report
  app.post("/api/budget/reports", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { reportType, format, filters } = budgetReportRequestSchema.parse(req.body);
      
      const report = await storage.generateBudgetReport(reportType, filters, req.user!);
      
      if (format) {
        // Export in specified format
        const exportData = await storage.exportBudgetData(format, filters, req.user!);
        res.json({ report, exportData });
      } else {
        res.json(report);
      }
    } catch (error: any) {
      console.error("Generate budget report error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to generate budget report",
        details: error.message 
      });
    }
  });

  // Export budget data (Excel/CSV/PDF)
  app.get("/api/budget/export", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { format } = req.query;
      const filters = budgetFiltersSchema.parse(req.query);
      
      if (!format || !['excel', 'csv', 'pdf'].includes(format as string)) {
        return res.status(400).json({ error: "format parameter required (excel, csv, or pdf)" });
      }
      
      const exportData = await storage.exportBudgetData(format as 'excel' | 'csv' | 'pdf', filters, req.user!);
      
      res.json(exportData);
    } catch (error: any) {
      console.error("Export budget data error:", error);
      res.status(500).json({ 
        error: "Failed to export budget data",
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BUDGET HIERARCHY MANAGEMENT (District → School → Department)
  // ===================================================================

  // Get district budget hierarchy
  app.get("/api/budget/hierarchy/district/:districtId", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { districtId } = req.params;
      const { fiscalYear } = req.query;
      
      if (!fiscalYear) {
        return res.status(400).json({ error: "fiscalYear parameter required" });
      }
      
      const hierarchy = await storage.getDistrictBudgetHierarchy(districtId, fiscalYear as string, req.user!);
      
      res.json(hierarchy);
    } catch (error: any) {
      console.error("Get district budget hierarchy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch district budget hierarchy",
        details: error.message 
      });
    }
  });

  // Get school budget summary
  app.get("/api/budget/hierarchy/school/:schoolId", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { schoolId } = req.params;
      const { fiscalYear } = req.query;
      
      if (!fiscalYear) {
        return res.status(400).json({ error: "fiscalYear parameter required" });
      }
      
      const summary = await storage.getSchoolBudgetSummary(schoolId, fiscalYear as string, req.user!);
      
      res.json(summary);
    } catch (error: any) {
      console.error("Get school budget summary error:", error);
      res.status(500).json({ 
        error: "Failed to fetch school budget summary",
        details: error.message 
      });
    }
  });

  // Get department budget details
  app.get("/api/budget/hierarchy/department/:departmentId", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { departmentId } = req.params;
      const { fiscalYear } = req.query;
      
      if (!fiscalYear) {
        return res.status(400).json({ error: "fiscalYear parameter required" });
      }
      
      const details = await storage.getDepartmentBudgetDetails(departmentId, fiscalYear as string, req.user!);
      
      res.json(details);
    } catch (error: any) {
      console.error("Get department budget details error:", error);
      res.status(500).json({ 
        error: "Failed to fetch department budget details",
        details: error.message 
      });
    }
  });

  // Transfer budget funds between allocations
  app.post("/api/budget/transfer", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { fromId, toId, amount, reason } = budgetTransferSchema.parse(req.body);
      
      const result = await storage.transferBudgetFunds(fromId, toId, amount, reason, req.user!);
      
      res.json(result);
    } catch (error: any) {
      console.error("Transfer budget funds error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ 
        error: "Failed to transfer budget funds",
        details: error.message 
      });
    }
  });

  // Freeze budget allocation
  app.post("/api/budget/allocations/:id/freeze", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      
      const success = await storage.freezeBudgetAllocation(id, req.user!);
      
      if (!success) {
        return res.status(404).json({ error: "Budget allocation not found" });
      }
      
      res.json({ success: true, message: "Budget allocation frozen" });
    } catch (error: any) {
      console.error("Freeze budget allocation error:", error);
      res.status(500).json({ 
        error: "Failed to freeze budget allocation",
        details: error.message 
      });
    }
  });

  // Unfreeze budget allocation
  app.post("/api/budget/allocations/:id/unfreeze", loadUserContext, requireBudgetDataAccess, async (req, res) => {
    try {
      const storage = await getStorage();
      const { id } = req.params;
      
      const success = await storage.unfreezeBudgetAllocation(id, req.user!);
      
      if (!success) {
        return res.status(404).json({ error: "Budget allocation not found" });
      }
      
      res.json({ success: true, message: "Budget allocation unfrozen" });
    } catch (error: any) {
      console.error("Unfreeze budget allocation error:", error);
      res.status(500).json({ 
        error: "Failed to unfreeze budget allocation",
        details: error.message 
      });
    }
  });

  console.log('✅ Excel-style budget management routes registered successfully');
}