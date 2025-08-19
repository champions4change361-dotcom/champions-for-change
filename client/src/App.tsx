import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route, Router } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useDomain } from "@/hooks/useDomain";
import DomainNavigation from "@/components/DomainNavigation";
import Home from './pages/Home';
import Landing from './pages/Landing';
import DonationFlow from './pages/DonationFlow';
import PaymentMethods from './pages/PaymentMethods';
import Checkout from './pages/Checkout';
import DonationSuccess from './pages/DonationSuccess';
import CreateTournament from './pages/CreateTournament';
import Tournament from './pages/tournament';
import Contacts from './pages/Contacts';
import AIConsultation from './pages/AIConsultation';
import AIDemo from './pages/AIDemo';
import Settings from './pages/Settings';
import LiveMatches from './pages/LiveMatches';
import Championships from './pages/Championships';
import WebpageBuilder from './pages/WebpageBuilder';
import TournamentEmpire from './pages/TournamentEmpire';
import FantasyTournaments from './pages/FantasyTournaments';
import CoachesLoungeLanding from './pages/CoachesLoungeLanding';
import FantasyCoaching from './pages/FantasyCoaching';
import CommissionerDashboard from './pages/CommissionerDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import TermsOfService from './pages/TermsOfService';
import Compliance from './pages/Compliance';
import Register from './pages/Register';
import RegistrationForm from './pages/RegistrationForm';
import TournamentDesign from './pages/TournamentDesign';
import Pricing from './pages/Pricing';
import BusinessPricingTest from './pages/BusinessPricingTest';
import YourWhy from './pages/YourWhy';
import CorporateCompetitions from './pages/CorporateCompetitions';
import AthleteAnalytics from './pages/AthleteAnalytics';
import CorporateAnalytics from './pages/CorporateAnalytics';

import FootballHealthMonitoring from './pages/FootballHealthMonitoring';
import DefensiveHealthMonitoring from './pages/DefensiveHealthMonitoring';
import ComprehensiveHealthDemo from './pages/ComprehensiveHealthDemo';
import CCISDDocumentIntegration from './pages/CCISDDocumentIntegration';
import AthleticTrainerScheduler from './pages/AthleticTrainerScheduler';
import AdminRoleManagement from './pages/AdminRoleManagement';
import GamePracticeScheduler from './pages/GamePracticeScheduler';
import NonprofitBilling from './pages/NonprofitBilling';
import HealthBenefits from './pages/HealthBenefits';
import GrantFunding from './pages/GrantFunding';
import NonprofitResources from './pages/NonprofitResources';
import OrganizationRegistration from './pages/OrganizationRegistration';
import RoleHierarchy from './pages/RoleHierarchy';
import CustomDesignDemo from './pages/CustomDesignDemo';
import Schools from './pages/Schools';
import MillerHomepage from './pages/MillerHomepage';
import RoleDashboard from './pages/RoleDashboard';
import BulkRegistration from './pages/BulkRegistration';
import AthleteDashboard from './pages/AthleteDashboard';
import CoachDashboard from './pages/CoachDashboard';
import AthleticTrainerDashboard from './pages/AthleticTrainerDashboard';
import ScorekeeperDashboard from './pages/ScorekeeperDashboard';
import ScorekeeperScheduling from './pages/ScorekeeperScheduling';
import ParentDashboard from './pages/ParentDashboard';
import FamilyAccessManagement from './pages/FamilyAccessManagement';
import Login from './pages/Login';
import DistrictLogin from './pages/DistrictLogin';
import TournamentOrganizerLogin from './pages/TournamentOrganizerLogin';
import BusinessLogin from './pages/BusinessLogin';
import LoginPortal from './pages/LoginPortal';
import AdminManagement from './pages/AdminManagement';
import LoginSupport from './pages/LoginSupport';
import RoleBasedDashboards from './pages/RoleBasedDashboards';
import NonprofitDonation from './pages/NonprofitDonation';
import NonprofitAnalytics from './pages/NonprofitAnalytics';
import StaffRegistration from './pages/StaffRegistration';
import StaffRoles from './pages/StaffRoles';
import DistrictOverview from './pages/DistrictOverview';
import AthleticTrainerDemo from './pages/AthleticTrainerDemo';
import SignupSelector from './pages/SignupSelector';
import { StaffOnboarding } from './components/StaffOnboarding';

function AuthenticatedRoutes() {
  const { isFeatureEnabled, isFantasyDomain, config } = useDomain();

  // Use fallback if config is not loaded yet
  const brandClass = config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50";

  return (
    <div className={brandClass}>
      <DomainNavigation />
      {/* Add padding-top to account for fixed header - increased for mobile */}
      <div className="pt-16 md:pt-12">
        <Switch>
        <Route path="/" component={() => <Home />} />
        <Route path="/create" component={CreateTournament} />
        <Route path="/tournament/:id" component={Tournament} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/ai-consultation" component={AIConsultation} />
        <Route path="/ai-demo" component={AIDemo} />
        <Route path="/settings" component={Settings} />
        <Route path="/live-matches" component={LiveMatches} />
        <Route path="/championships" component={Championships} />
        <Route path="/webpage-builder" component={WebpageBuilder} />
        <Route path="/corporate-competitions" component={CorporateCompetitions} />
        <Route path="/athlete-analytics" component={() => <AthleteAnalytics isCoachView={true} />} />
        <Route path="/corporate-analytics" component={() => <CorporateAnalytics isPublic={true} />} />

        <Route path="/football-health" component={FootballHealthMonitoring} />
        <Route path="/defensive-health" component={DefensiveHealthMonitoring} />
        <Route path="/comprehensive-health-demo" component={ComprehensiveHealthDemo} />
        <Route path="/ccisd-document-integration" component={CCISDDocumentIntegration} />
        <Route path="/athletic-trainer-scheduler" component={AthleticTrainerScheduler} />
        <Route path="/admin-role-management" component={AdminRoleManagement} />
        <Route path="/game-practice-scheduler" component={GamePracticeScheduler} />
        <Route path="/nonprofit-billing" component={NonprofitBilling} />
        <Route path="/role-hierarchy" component={RoleHierarchy} />
        <Route path="/custom-design-demo" component={CustomDesignDemo} />
        <Route path="/schools" component={Schools} />
        <Route path="/dashboard" component={RoleDashboard} />
        <Route path="/athlete-dashboard" component={AthleteDashboard} />
        <Route path="/coach-dashboard" component={CoachDashboard} />
        <Route path="/athletic-trainer-dashboard" component={AthleticTrainerDashboard} />

        <Route path="/bulk-registration" component={BulkRegistration} />
        <Route path="/staff-registration" component={StaffRegistration} />
        <Route path="/staff-onboarding" component={StaffOnboarding} />
        <Route path="/staff-roles" component={StaffRoles} />
        <Route path="/district-overview" component={DistrictOverview} />
        <Route path="/athletic-trainer-demo" component={AthleticTrainerDemo} />
        
        {/* Show Tournament Empire only for school-safe and pro domains */}
        {!isFantasyDomain() && (
          <Route path="/tournament-empire" component={TournamentEmpire} />
        )}
        
        {/* Show Fantasy Tournaments only for fantasy and pro domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy-tournaments" component={FantasyTournaments} />
        )}
        
        {/* Coaches Lounge Landing for fantasy domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/coaches-lounge" component={CoachesLoungeLanding} />
        )}
        
        {/* Fantasy Coaching AI for fantasy domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy-coaching" component={FantasyCoaching} />
        )}
        
        {/* Commissioner Dashboard for fantasy domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/commissioner" component={CommissionerDashboard} />
        )}
        
        {/* Payment and Donation Pages */}
        <Route path="/checkout" component={Checkout} />
        <Route path="/donation-success" component={DonationSuccess} />
        
        {/* Note: Legal pages moved to public routes for better accessibility */}
        
        <Route>
          {/* 404 - redirect to home */}
          <Home />
        </Route>
        </Switch>
      </div>
    </div>
  );
}

function getDomainBackgroundClass(brand: string) {
  if (brand === 'SCHOLASTIC_TOURNAMENTS') {
    return "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50";
  }
  if (brand === 'COACHES_LOUNGE') {
    return "min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
  }
  if (brand === 'TOURNAMENT_PRO') {
    return "min-h-screen bg-gradient-to-br from-blue-50 to-slate-100";
  }
  return "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100";
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AppRouter />
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { config, isSchoolDomain } = useDomain();
  
  // For school domains, allow guest access to view tournaments
  const allowGuestAccess = isSchoolDomain();

  // Reduce loading time - only show spinner for very brief initial load
  if (isLoading && !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/donate" component={DonationFlow} />
      <Route path="/payment-methods" component={PaymentMethods} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/donation-success" component={DonationSuccess} />
      <Route path="/nonprofit/donate" component={NonprofitDonation} />
      <Route path="/nonprofit/analytics" component={NonprofitAnalytics} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/business-pricing-test" component={BusinessPricingTest} />
      <Route path="/your-why" component={YourWhy} />
      <Route path="/register" component={RegistrationForm} />
      <Route path="/signup" component={SignupSelector} />
      <Route path="/tournament/design" component={TournamentDesign} />
      <Route path="/register-old" component={Register} />
      
      {/* Legal and Compliance Pages - Public Access */}
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/compliance" component={Compliance} />

      <Route path="/health-benefits" component={HealthBenefits} />
      <Route path="/grant-funding" component={GrantFunding} />
      <Route path="/nonprofit-resources" component={NonprofitResources} />
      <Route path="/register-organization" component={OrganizationRegistration} />
      {/* Main Login Form */}
      <Route path="/login" component={Login} />
      {/* User Type Selection Portal */}
      <Route path="/login-portal" component={LoginPortal} />
      {/* User Type Login Portals */}
      <Route path="/login/district" component={DistrictLogin} />
      <Route path="/login/organizer" component={TournamentOrganizerLogin} />
      <Route path="/login/business" component={BusinessLogin} />
      
      {/* Admin Management Portal */}
      <Route path="/admin" component={AdminManagement} />
      
      {/* Login Support */}
      <Route path="/login-support" component={LoginSupport} />
      
      {/* Athletic Trainer Dashboard - Public Demo Access */}
      <Route path="/athletic-trainer" component={AthleticTrainerDashboard} />
      <Route path="/athletic-trainer-dashboard" component={AthleticTrainerDashboard} />
      <Route path="/athletic-trainer-demo" component={AthleticTrainerDemo} />
      
      {/* Scorekeeper Dashboard - Public Demo Access */}
      <Route path="/scorekeeper" component={ScorekeeperDashboard} />
      <Route path="/scorekeeper-dashboard" component={ScorekeeperDashboard} />
      
      {/* Scorekeeper Scheduling - Public Demo Access */}
      <Route path="/scorekeeper-scheduling" component={ScorekeeperScheduling} />
      <Route path="/scheduling" component={ScorekeeperScheduling} />
      
      {/* Parent Dashboard - Public Demo Access */}
      <Route path="/parent" component={ParentDashboard} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      
      {/* Family Access Management - Public Demo Access */}
      <Route path="/family-access" component={FamilyAccessManagement} />
      <Route path="/family-access-management" component={FamilyAccessManagement} />
      
      {/* Role-Based Dashboards - Admin Access */}
      <Route path="/role-based-dashboards" component={RoleBasedDashboards} />
      <Route path="/role-dashboard" component={RoleBasedDashboards} />
      {/* Miller White-Label Homepage */}
      <Route path="/miller-homepage" component={MillerHomepage} />
      {/* Show Coaches Lounge landing page */}
      <Route path="/coaches-lounge">
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
          <CoachesLoungeLanding />
        </div>
      </Route>
      {/* Show Landing page if not authenticated or on school-safe domains */}
      {(!isAuthenticated || allowGuestAccess) && (
        <Route path="/">
          <div className={config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50"}>
            <Landing />
          </div>
        </Route>
      )}
      {/* Show authenticated routes if authenticated */}
      {isAuthenticated && <AuthenticatedRoutes />}
      {/* Default fallback */}
      <Route>
        <div className={config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50"}>
          <Landing />
        </div>
      </Route>
    </Switch>
  );
}

export default App;