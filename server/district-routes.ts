import express from 'express';
import { loadUserContext } from './rbac-middleware';
import { DistrictManagementService } from './district-management-service';
import { BudgetManagementService } from './budget-management-service';
import { OrganizationalHierarchyService } from './organizational-hierarchy-service';
import { ComplianceReportingService } from './compliance-reporting-service';
import { DistrictDashboardService } from './district-dashboard-service';
import type { User } from '@shared/schema';

const router = express.Router();

// Middleware to extract current user from request
const getCurrentUser = (req: express.Request): User => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user as User;
};

// ========== DISTRICT MANAGEMENT ROUTES ==========

/**
 * GET /api/district/:districtId/overview
 * Get comprehensive district overview with schools and metrics
 */
router.get('/:districtId/overview', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const overview = await DistrictManagementService.getDistrictOverview(districtId, currentUser);
    res.json(overview);
  } catch (error: any) {
    console.error('Error getting district overview:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/coordination
 * Get district coordination data for multi-school coordination
 */
router.get('/:districtId/coordination', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const coordination = await DistrictManagementService.getDistrictCoordinationData(districtId, currentUser);
    res.json(coordination);
  } catch (error: any) {
    console.error('Error getting district coordination data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/policies
 * Get district-wide policy management data
 */
router.get('/:districtId/policies', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const policies = await DistrictManagementService.getDistrictPolicies(districtId, currentUser);
    res.json(policies);
  } catch (error: any) {
    console.error('Error getting district policies:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/performance
 * Get school performance monitoring and benchmarking
 */
router.get('/:districtId/performance', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const performance = await DistrictManagementService.getSchoolPerformanceMetrics(districtId, currentUser);
    res.json(performance);
  } catch (error: any) {
    console.error('Error getting school performance metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/events
 * Get district-wide event coordination and scheduling
 */
router.get('/:districtId/events', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const events = await DistrictManagementService.getDistrictEventCoordination(districtId, currentUser);
    res.json(events);
  } catch (error: any) {
    console.error('Error getting district event coordination:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== BUDGET MANAGEMENT ROUTES ==========

/**
 * GET /api/district/:districtId/budget/overview
 * Get comprehensive district budget overview
 */
router.get('/:districtId/budget/overview', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const { fiscalYear = '2024-2025' } = req.query;
    const currentUser = getCurrentUser(req);
    
    const budgetOverview = await BudgetManagementService.getDistrictBudgetOverview(
      districtId, 
      fiscalYear as string, 
      currentUser
    );
    res.json(budgetOverview);
  } catch (error: any) {
    console.error('Error getting budget overview:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/district/:districtId/budget/allocate
 * Allocate school budgets from district budget
 */
router.post('/:districtId/budget/allocate', loadUserContext, async (req, res) => {
  try {
    const { districtBudgetId, allocations } = req.body;
    const currentUser = getCurrentUser(req);
    
    const result = await BudgetManagementService.allocateSchoolBudgets(
      districtBudgetId, 
      allocations, 
      currentUser
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error allocating school budgets:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/budget/performance
 * Get budget performance monitoring and alerts
 */
router.get('/:districtId/budget/performance', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const { fiscalYear = '2024-2025' } = req.query;
    const currentUser = getCurrentUser(req);
    
    const performance = await BudgetManagementService.getBudgetPerformanceMetrics(
      districtId, 
      fiscalYear as string, 
      currentUser
    );
    res.json(performance);
  } catch (error: any) {
    console.error('Error getting budget performance metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ORGANIZATIONAL HIERARCHY ROUTES ==========

/**
 * GET /api/district/:districtId/organization/hierarchy
 * Get complete organizational hierarchy for district
 */
router.get('/:districtId/organization/hierarchy', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const hierarchy = await OrganizationalHierarchyService.getDistrictOrganizationalHierarchy(districtId, currentUser);
    res.json(hierarchy);
  } catch (error: any) {
    console.error('Error getting organizational hierarchy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/organization/directory
 * Get district directory and contact management
 */
router.get('/:districtId/organization/directory', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const directory = await OrganizationalHierarchyService.getDistrictDirectory(districtId, currentUser);
    res.json(directory);
  } catch (error: any) {
    console.error('Error getting district directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== COMPLIANCE REPORTING ROUTES ==========

/**
 * GET /api/district/:districtId/compliance/overview
 * Get comprehensive compliance overview
 */
router.get('/:districtId/compliance/overview', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const compliance = await ComplianceReportingService.getDistrictComplianceOverview(districtId, currentUser);
    res.json(compliance);
  } catch (error: any) {
    console.error('Error getting compliance overview:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/compliance/ferpa
 * Get FERPA compliance monitoring and reporting
 */
router.get('/:districtId/compliance/ferpa', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const ferpa = await ComplianceReportingService.getFERPAComplianceStatus(districtId, currentUser);
    res.json(ferpa);
  } catch (error: any) {
    console.error('Error getting FERPA compliance status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/compliance/hipaa
 * Get HIPAA compliance monitoring for health data
 */
router.get('/:districtId/compliance/hipaa', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const hipaa = await ComplianceReportingService.getHIPAAComplianceStatus(districtId, currentUser);
    res.json(hipaa);
  } catch (error: any) {
    console.error('Error getting HIPAA compliance status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== DISTRICT DASHBOARD ROUTES ==========

/**
 * GET /api/district/:districtId/dashboard
 * Get comprehensive district administrator dashboard
 */
router.get('/:districtId/dashboard', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const currentUser = getCurrentUser(req);
    
    const dashboard = await DistrictDashboardService.getDistrictDashboard(districtId, currentUser);
    res.json(dashboard);
  } catch (error: any) {
    console.error('Error getting district dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/district/:districtId/analytics
 * Get district-wide analytics and reporting
 */
router.get('/:districtId/analytics', loadUserContext, async (req, res) => {
  try {
    const { districtId } = req.params;
    const { timeframe = 'monthly' } = req.query;
    const currentUser = getCurrentUser(req);
    
    const analytics = await DistrictDashboardService.getDistrictAnalytics(
      districtId, 
      timeframe as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly', 
      currentUser
    );
    res.json(analytics);
  } catch (error: any) {
    console.error('Error getting district analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware for the district routes
router.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('District routes error:', error);
  res.status(500).json({
    error: 'Internal server error in district management system',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;