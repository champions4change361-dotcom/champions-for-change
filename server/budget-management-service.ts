import { getStorage } from './storage';
import type { User, DistrictBudget, SchoolDepartmentBudget, SportProgramBudget, InsertDistrictBudget, InsertSchoolDepartmentBudget, InsertSportProgramBudget } from '@shared/schema';
import { RBACService } from './rbac-permissions';

/**
 * Budget Management Service
 * 
 * Comprehensive budget tracking and allocation management for district-level financial oversight.
 * Handles budget approval workflows, financial reporting, and budget performance monitoring.
 */
export class BudgetManagementService {

  /**
   * Get comprehensive district budget overview
   */
  static async getDistrictBudgetOverview(districtId: string, fiscalYear: string, currentUser: User) {
    // Verify budget data access permissions
    if (!RBACService.canAccessBudgetData(currentUser)) {
      throw new Error('Insufficient permissions for budget data access');
    }
    
    if (!RBACService.canAccessOrganizationData(currentUser, districtId)) {
      throw new Error('Access denied to this district budget data');
    }

    const storage = await getStorage();
    
    // Get district budgets for the fiscal year
    const districtBudgets = await storage.getDistrictBudgetsByFiscalYear(districtId, fiscalYear);
    
    // Get all school department budgets
    const schoolBudgets = await storage.getSchoolDepartmentBudgetsByDistrictId(districtId, fiscalYear);
    
    // Get sport program budgets
    const sportBudgets = await storage.getSportProgramBudgetsByDistrictId(districtId, fiscalYear);
    
    // Calculate comprehensive budget summary
    const budgetSummary = this.calculateBudgetSummary(districtBudgets, schoolBudgets, sportBudgets);
    
    // Get budget utilization trends
    const utilizationTrends = await this.getBudgetUtilizationTrends(districtId, fiscalYear);
    
    // Get pending approvals
    const pendingApprovals = await this.getPendingBudgetApprovals(districtId);

    return {
      overview: budgetSummary,
      districtBudgets: this.formatDistrictBudgets(districtBudgets),
      schoolBudgets: this.formatSchoolBudgets(schoolBudgets),
      sportBudgets: this.formatSportBudgets(sportBudgets),
      utilizationTrends,
      pendingApprovals,
      alerts: await this.getBudgetAlerts(districtId, fiscalYear),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Create or update district budget allocation
   */
  static async createDistrictBudget(budgetData: InsertDistrictBudget, currentUser: User) {
    if (!RBACService.canManageBudgets(currentUser)) {
      throw new Error('Insufficient permissions to create district budgets');
    }

    const storage = await getStorage();
    
    // Validate budget data
    const validationResult = this.validateDistrictBudget(budgetData);
    if (!validationResult.isValid) {
      throw new Error(`Budget validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Create the budget with proper approval workflow
    const districtBudget = await storage.createDistrictBudget({
      ...budgetData,
      budgetStatus: 'draft',
      totalBudgetRemaining: budgetData.totalBudgetAllocated
    });

    // Log the budget creation for audit
    await this.logBudgetAction('create', 'district_budget', districtBudget.id, currentUser.id, 
      `Created district budget for ${budgetData.fiscalYear}`);

    return districtBudget;
  }

  /**
   * School-level budget allocation and tracking
   */
  static async allocateSchoolBudgets(districtBudgetId: string, allocations: SchoolBudgetAllocation[], currentUser: User) {
    if (!RBACService.canManageBudgets(currentUser)) {
      throw new Error('Insufficient permissions to allocate school budgets');
    }

    const storage = await getStorage();
    
    // Verify district budget exists and user has access
    const districtBudget = await storage.getDistrictBudgetById(districtBudgetId);
    if (!districtBudget) {
      throw new Error('District budget not found');
    }

    // Validate total allocation doesn't exceed district budget
    const totalAllocation = allocations.reduce((sum, alloc) => sum + Number(alloc.budgetAllocated), 0);
    if (totalAllocation > Number(districtBudget.totalBudgetAllocated)) {
      throw new Error('Total school allocations exceed district budget');
    }

    // Create school department budgets
    const createdBudgets = await Promise.all(
      allocations.map(async (allocation) => {
        const schoolBudget = await storage.createSchoolDepartmentBudget({
          schoolId: allocation.schoolId,
          districtBudgetId: districtBudgetId,
          departmentType: allocation.departmentType,
          fiscalYear: districtBudget.fiscalYear,
          budgetAllocated: allocation.budgetAllocated.toString(),
          budgetRemaining: allocation.budgetAllocated.toString(),
          budgetSpent: "0",
          budgetManagerId: allocation.budgetManagerId,
          spendingLimits: allocation.spendingLimits || {
            maxSinglePurchase: 1000,
            requiresApprovalOver: 500,
            monthlySpendingLimit: allocation.budgetAllocated * 0.25
          }
        });

        await this.logBudgetAction('allocate', 'school_budget', schoolBudget.id, currentUser.id,
          `Allocated $${allocation.budgetAllocated} to school ${allocation.schoolId}`);

        return schoolBudget;
      })
    );

    // Update district budget remaining amount
    const newRemaining = Number(districtBudget.totalBudgetAllocated) - totalAllocation;
    await storage.updateDistrictBudget(districtBudgetId, {
      totalBudgetRemaining: newRemaining.toString()
    });

    return {
      success: true,
      allocatedBudgets: createdBudgets,
      totalAllocated: totalAllocation,
      districtRemaining: newRemaining
    };
  }

  /**
   * Budget approval workflow system
   */
  static async processApprovalWorkflow(budgetId: string, budgetType: 'district' | 'school' | 'sport', action: 'approve' | 'reject', currentUser: User, notes?: string) {
    if (!RBACService.canApproveBudgets(currentUser)) {
      throw new Error('Insufficient permissions to approve budgets');
    }

    const storage = await getStorage();
    
    let updatedBudget;
    let logMessage = '';

    switch (budgetType) {
      case 'district':
        updatedBudget = await storage.updateDistrictBudget(budgetId, {
          budgetStatus: action === 'approve' ? 'approved' : 'draft',
          approvedBy: action === 'approve' ? currentUser.id : undefined,
          approvalDate: action === 'approve' ? new Date().toISOString().split('T')[0] : undefined
        });
        logMessage = `District budget ${action}d`;
        break;
        
      case 'school':
        updatedBudget = await storage.updateSchoolDepartmentBudget(budgetId, {
          budgetStatus: action === 'approve' ? 'active' : 'frozen'
        });
        logMessage = `School budget ${action}d`;
        break;
        
      case 'sport':
        // Sport budgets inherit approval from school department budgets
        updatedBudget = await storage.getSportProgramBudgetById(budgetId);
        logMessage = `Sport program budget ${action}d`;
        break;
        
      default:
        throw new Error('Invalid budget type for approval');
    }

    // Log the approval action
    await this.logBudgetAction(action, budgetType + '_budget', budgetId, currentUser.id, 
      `${logMessage}${notes ? ': ' + notes : ''}`);

    // Send notification to relevant parties
    await this.sendBudgetNotification(budgetId, budgetType, action, currentUser);

    return updatedBudget;
  }

  /**
   * Financial reporting and analysis
   */
  static async generateFinancialReport(districtId: string, fiscalYear: string, reportType: 'summary' | 'detailed' | 'variance', currentUser: User) {
    if (!RBACService.canAccessBudgetData(currentUser)) {
      throw new Error('Insufficient permissions for financial reporting');
    }

    const storage = await getStorage();
    
    const districtBudgets = await storage.getDistrictBudgetsByFiscalYear(districtId, fiscalYear);
    const schoolBudgets = await storage.getSchoolDepartmentBudgetsByDistrictId(districtId, fiscalYear);
    const sportBudgets = await storage.getSportProgramBudgetsByDistrictId(districtId, fiscalYear);
    const expenseRecords = await storage.getExpenseRecordsByDistrictId(districtId, fiscalYear);

    const reportData = {
      reportType,
      fiscalYear,
      districtId,
      generatedBy: currentUser.id,
      generatedAt: new Date().toISOString(),
      summary: this.calculateFinancialSummary(districtBudgets, schoolBudgets, sportBudgets, expenseRecords),
      budgetAnalysis: this.analyzeBudgetPerformance(districtBudgets, schoolBudgets, sportBudgets),
      spendingTrends: this.analyzeSpendingTrends(expenseRecords),
      varianceAnalysis: reportType === 'variance' ? this.calculateVarianceAnalysis(districtBudgets, schoolBudgets) : null,
      recommendations: this.generateBudgetRecommendations(districtBudgets, schoolBudgets, expenseRecords)
    };

    if (reportType === 'detailed') {
      reportData.details = {
        districtBudgets: this.formatDetailedBudgets(districtBudgets),
        schoolBudgets: this.formatDetailedBudgets(schoolBudgets),
        sportBudgets: this.formatDetailedBudgets(sportBudgets),
        expenseBreakdown: this.formatExpenseBreakdown(expenseRecords)
      };
    }

    return reportData;
  }

  /**
   * Budget performance monitoring and alerts
   */
  static async getBudgetPerformanceMetrics(districtId: string, fiscalYear: string, currentUser: User) {
    if (!RBACService.canAccessBudgetData(currentUser)) {
      throw new Error('Insufficient permissions for budget performance data');
    }

    const storage = await getStorage();
    
    const schoolBudgets = await storage.getSchoolDepartmentBudgetsByDistrictId(districtId, fiscalYear);
    const expenseRecords = await storage.getExpenseRecordsByDistrictId(districtId, fiscalYear);

    // Calculate performance metrics
    const performanceMetrics = schoolBudgets.map(budget => {
      const budgetExpenses = expenseRecords.filter(expense => 
        expense.schoolDepartmentBudgetId === budget.id
      );
      
      const totalSpent = budgetExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const budgetAllocated = Number(budget.budgetAllocated);
      const utilizationRate = budgetAllocated > 0 ? (totalSpent / budgetAllocated) * 100 : 0;
      
      // Calculate spending velocity (spending rate over time)
      const monthsIntoFiscalYear = this.getMonthsIntoFiscalYear(fiscalYear);
      const expectedSpendingRate = (monthsIntoFiscalYear / 12) * 100;
      const spendingVelocity = utilizationRate - expectedSpendingRate;

      return {
        budgetId: budget.id,
        schoolId: budget.schoolId,
        departmentType: budget.departmentType,
        budgetAllocated,
        totalSpent,
        remainingBudget: budgetAllocated - totalSpent,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        spendingVelocity: Math.round(spendingVelocity * 100) / 100,
        riskLevel: this.calculateRiskLevel(utilizationRate, spendingVelocity),
        projectedYearEndSpending: this.projectYearEndSpending(totalSpent, monthsIntoFiscalYear),
        lastExpenseDate: budgetExpenses.length > 0 ? 
          Math.max(...budgetExpenses.map(e => new Date(e.expenseDate).getTime())) : null
      };
    });

    // Generate alerts for budgets at risk
    const alerts = performanceMetrics
      .filter(metric => metric.riskLevel === 'high' || metric.utilizationRate > 90)
      .map(metric => ({
        type: metric.utilizationRate > 100 ? 'overspent' : 'at_risk',
        budgetId: metric.budgetId,
        schoolId: metric.schoolId,
        departmentType: metric.departmentType,
        message: this.generateAlertMessage(metric),
        severity: metric.utilizationRate > 100 ? 'critical' : 'warning',
        actionRequired: this.getRequiredActions(metric)
      }));

    return {
      metrics: performanceMetrics,
      alerts,
      summary: {
        totalBudgets: performanceMetrics.length,
        averageUtilization: Math.round(
          performanceMetrics.reduce((sum, m) => sum + m.utilizationRate, 0) / performanceMetrics.length * 100
        ) / 100,
        budgetsAtRisk: alerts.length,
        totalAllocated: performanceMetrics.reduce((sum, m) => sum + m.budgetAllocated, 0),
        totalSpent: performanceMetrics.reduce((sum, m) => sum + m.totalSpent, 0)
      }
    };
  }

  // Helper methods for budget calculations and formatting
  private static calculateBudgetSummary(districtBudgets: DistrictBudget[], schoolBudgets: SchoolDepartmentBudget[], sportBudgets: SportProgramBudget[]) {
    const totalAllocated = districtBudgets.reduce((sum, budget) => sum + Number(budget.totalBudgetAllocated), 0);
    const totalSpent = districtBudgets.reduce((sum, budget) => sum + Number(budget.totalBudgetSpent), 0);
    const totalRemaining = totalAllocated - totalSpent;
    
    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100 * 100) / 100 : 0,
      budgetCount: {
        district: districtBudgets.length,
        school: schoolBudgets.length,
        sport: sportBudgets.length
      }
    };
  }

  private static formatDistrictBudgets(budgets: DistrictBudget[]) {
    return budgets.map(budget => ({
      id: budget.id,
      budgetType: budget.budgetType,
      fiscalYear: budget.fiscalYear,
      totalAllocated: Number(budget.totalBudgetAllocated),
      totalSpent: Number(budget.totalBudgetSpent),
      totalRemaining: Number(budget.totalBudgetRemaining),
      status: budget.budgetStatus,
      approvedBy: budget.approvedBy,
      approvalDate: budget.approvalDate,
      categoryBreakdown: budget.categoryBreakdown || []
    }));
  }

  private static formatSchoolBudgets(budgets: SchoolDepartmentBudget[]) {
    return budgets.map(budget => ({
      id: budget.id,
      schoolId: budget.schoolId,
      departmentType: budget.departmentType,
      fiscalYear: budget.fiscalYear,
      budgetAllocated: Number(budget.budgetAllocated),
      budgetSpent: Number(budget.budgetSpent),
      budgetRemaining: Number(budget.budgetRemaining),
      status: budget.budgetStatus,
      departmentHeadId: budget.departmentHeadId,
      budgetManagerId: budget.budgetManagerId,
      spendingLimits: budget.spendingLimits
    }));
  }

  private static formatSportBudgets(budgets: SportProgramBudget[]) {
    return budgets.map(budget => ({
      id: budget.id,
      schoolSportsProgramId: budget.schoolSportsProgramId,
      fiscalYear: budget.fiscalYear,
      totalAllocated: Number(budget.totalAllocated),
      totalSpent: Number(budget.totalSpent),
      totalRemaining: Number(budget.totalRemaining),
      categoryBreakdown: {
        equipment: { allocated: Number(budget.equipmentBudget), spent: Number(budget.equipmentSpent) },
        uniforms: { allocated: Number(budget.uniformsBudget), spent: Number(budget.uniformsSpent) },
        travel: { allocated: Number(budget.travelBudget), spent: Number(budget.travelSpent) },
        facilities: { allocated: Number(budget.facilitiesBudget), spent: Number(budget.facilitiesSpent) },
        officiating: { allocated: Number(budget.officiatingBudget), spent: Number(budget.officiatingSpent) },
        medical: { allocated: Number(budget.medicalBudget), spent: Number(budget.medicalSpent) },
        miscellaneous: { allocated: Number(budget.miscellaneousBudget), spent: Number(budget.miscellaneousSpent) }
      },
      budgetManagerId: budget.budgetManagerId
    }));
  }

  private static async getBudgetUtilizationTrends(districtId: string, fiscalYear: string) {
    // Mock trend data - in real implementation, calculate from historical data
    return {
      monthly: [
        { month: 'Aug', utilized: 8, allocated: 100 },
        { month: 'Sep', utilized: 15, allocated: 100 },
        { month: 'Oct', utilized: 23, allocated: 100 },
        { month: 'Nov', utilized: 31, allocated: 100 },
        { month: 'Dec', utilized: 40, allocated: 100 }
      ],
      byCategory: [
        { category: 'athletics', utilized: 65, allocated: 100 },
        { category: 'academics', utilized: 45, allocated: 100 },
        { category: 'facilities', utilized: 30, allocated: 100 }
      ]
    };
  }

  private static async getPendingBudgetApprovals(districtId: string) {
    // Mock pending approvals - in real implementation, query actual pending budgets
    return [
      {
        id: 'budget-001',
        type: 'district_budget',
        requestedBy: 'John Smith',
        requestDate: '2024-09-15',
        amount: 250000,
        description: 'Q2 Athletic Department Budget Adjustment'
      },
      {
        id: 'budget-002', 
        type: 'school_budget',
        requestedBy: 'Jane Doe',
        requestDate: '2024-09-18',
        amount: 15000,
        description: 'Football Equipment Purchase Request'
      }
    ];
  }

  private static async getBudgetAlerts(districtId: string, fiscalYear: string) {
    // Mock alerts - in real implementation, calculate from actual budget data
    return [
      {
        type: 'overspending',
        severity: 'high',
        message: 'Roy Miller HS Football program is 15% over budget',
        budgetId: 'sport-budget-001',
        actionRequired: true
      },
      {
        type: 'underspending',
        severity: 'medium', 
        message: 'Swimming program has only used 25% of allocated budget',
        budgetId: 'sport-budget-002',
        actionRequired: false
      }
    ];
  }

  private static validateDistrictBudget(budgetData: InsertDistrictBudget) {
    const errors: string[] = [];
    
    if (!budgetData.fiscalYear || !/^\d{4}-\d{4}$/.test(budgetData.fiscalYear)) {
      errors.push('Valid fiscal year required (YYYY-YYYY format)');
    }
    
    if (!budgetData.totalBudgetAllocated || Number(budgetData.totalBudgetAllocated) <= 0) {
      errors.push('Budget allocation must be greater than zero');
    }
    
    if (!budgetData.budgetType) {
      errors.push('Budget type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static async logBudgetAction(action: string, resourceType: string, resourceId: string, userId: string, description: string) {
    // In real implementation, this would write to audit log
    console.log(`Budget Action: ${action} ${resourceType} ${resourceId} by ${userId} - ${description}`);
  }

  private static async sendBudgetNotification(budgetId: string, budgetType: string, action: string, currentUser: User) {
    // In real implementation, this would send notifications via email/SMS
    console.log(`Budget Notification: ${budgetType} ${budgetId} ${action} by ${currentUser.email}`);
  }

  private static calculateFinancialSummary(districtBudgets: any[], schoolBudgets: any[], sportBudgets: any[], expenseRecords: any[]) {
    // Implementation for financial summary calculations
    return {
      totalBudget: districtBudgets.reduce((sum, b) => sum + Number(b.totalBudgetAllocated), 0),
      totalSpent: expenseRecords.reduce((sum, e) => sum + Number(e.amount), 0),
      pendingExpenses: expenseRecords.filter(e => e.approvalStatus === 'pending').length,
      averageUtilization: 75 // Mock calculation
    };
  }

  private static analyzeBudgetPerformance(districtBudgets: any[], schoolBudgets: any[], sportBudgets: any[]) {
    // Implementation for budget performance analysis
    return {
      topPerformers: [],
      underPerformers: [],
      efficiencyMetrics: {}
    };
  }

  private static analyzeSpendingTrends(expenseRecords: any[]) {
    // Implementation for spending trend analysis
    return {
      monthlyTrends: [],
      categoryTrends: [],
      seasonalPatterns: []
    };
  }

  private static calculateVarianceAnalysis(districtBudgets: any[], schoolBudgets: any[]) {
    // Implementation for variance analysis
    return {
      budgetVariances: [],
      explanations: [],
      correctionRecommendations: []
    };
  }

  private static generateBudgetRecommendations(districtBudgets: any[], schoolBudgets: any[], expenseRecords: any[]) {
    // Implementation for generating budget recommendations
    return [
      'Consider reallocating funds from underspent programs',
      'Implement stricter approval controls for high-risk categories',
      'Plan for seasonal spending patterns in Q3 and Q4'
    ];
  }

  private static formatDetailedBudgets(budgets: any[]) {
    // Implementation for detailed budget formatting
    return budgets;
  }

  private static formatExpenseBreakdown(expenseRecords: any[]) {
    // Implementation for expense breakdown formatting
    return expenseRecords;
  }

  private static getMonthsIntoFiscalYear(fiscalYear: string): number {
    // Calculate how many months into the fiscal year we are
    // Assuming fiscal year starts in August
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    if (currentMonth >= 8) {
      return currentMonth - 7; // Aug=1, Sep=2, etc.
    } else {
      return currentMonth + 5; // Jan=6, Feb=7, etc.
    }
  }

  private static calculateRiskLevel(utilizationRate: number, spendingVelocity: number): 'low' | 'medium' | 'high' {
    if (utilizationRate > 90 || spendingVelocity > 20) return 'high';
    if (utilizationRate > 75 || spendingVelocity > 10) return 'medium';
    return 'low';
  }

  private static projectYearEndSpending(currentSpent: number, monthsIntoYear: number): number {
    if (monthsIntoYear === 0) return currentSpent;
    return (currentSpent / monthsIntoYear) * 12;
  }

  private static generateAlertMessage(metric: any): string {
    if (metric.utilizationRate > 100) {
      return `Budget exceeded by ${Math.round((metric.utilizationRate - 100) * 100) / 100}%`;
    }
    if (metric.spendingVelocity > 20) {
      return `Spending ${Math.round(metric.spendingVelocity * 100) / 100}% faster than expected rate`;
    }
    return `Budget utilization at ${Math.round(metric.utilizationRate * 100) / 100}%`;
  }

  private static getRequiredActions(metric: any): string[] {
    const actions = [];
    if (metric.utilizationRate > 100) {
      actions.push('Request budget transfer or additional funding');
      actions.push('Review and reduce upcoming expenses');
    }
    if (metric.spendingVelocity > 20) {
      actions.push('Implement spending controls');
      actions.push('Review approval processes');
    }
    if (metric.riskLevel === 'high') {
      actions.push('Schedule budget review meeting');
    }
    return actions;
  }
}

// Type definitions for budget allocations
export interface SchoolBudgetAllocation {
  schoolId: string;
  departmentType: 'athletics' | 'band' | 'choir' | 'theatre' | 'academics' | 'facilities' | 'general';
  budgetAllocated: number;
  budgetManagerId?: string;
  spendingLimits?: {
    maxSinglePurchase: number;
    requiresApprovalOver: number;
    monthlySpendingLimit: number;
  };
}