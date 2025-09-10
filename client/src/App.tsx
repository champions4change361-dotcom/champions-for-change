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
import EducationHubLanding from './pages/EducationHubLanding';
import TrantorLanding from './pages/TrantorLanding';
import LocalTournaments from './pages/LocalTournaments';
import TournamentCalendar from './pages/TournamentCalendar';
import DonationFlow from './pages/DonationFlow';
import PaymentMethods from './pages/PaymentMethods';
import Checkout from './pages/Checkout';
import DonationSuccess from './pages/DonationSuccess';
import CreateTournament from './pages/CreateTournament';
import Tournament from './pages/tournament';
import EmbedTournament from './pages/EmbedTournament';
import Contacts from './pages/Contacts';
// AI features temporarily disabled for production
// import AIConsultation from './pages/AIConsultation';
// import AIChat from './pages/AIChat';
// import AIDemo from './pages/AIDemo';
import Settings from './pages/Settings';
import LiveMatches from './pages/LiveMatches';
import Championships from './pages/Championships';
import WebpageBuilder from './pages/WebpageBuilder';
import ModularPageBuilder from './pages/ModularPageBuilder';
import EnhancedModularBuilder from './pages/EnhancedModularBuilder';
import AdvancedPageBuilder from './pages/AdvancedPageBuilder';
import PageManager from './pages/PageManager';
import TrialSignup from './pages/TrialSignup';
import DiscountDemo from './pages/DiscountDemo';
import TournamentEmpire from './pages/TournamentEmpire';
import FantasyTournaments from './pages/FantasyTournaments';
import LeagueDashboard from './pages/LeagueDashboard';
import LeagueSettings from './pages/LeagueSettings';
import CoachesLoungeLanding from './pages/CoachesLoungeLanding';
import FantasyLanding from './pages/FantasyLanding';
import FantasyCoaching from './pages/FantasyCoaching';
import PlatformOptions from './pages/PlatformOptions';
import CommissionerDashboard from './pages/CommissionerDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import TermsOfService from './pages/TermsOfService';
import Compliance from './pages/Compliance';
import Register from './pages/Register';
import BusinessRegister from './pages/BusinessRegister';
import AdminApprovals from './pages/AdminApprovals';
import RegistrationForm from './pages/RegistrationForm';
import TournamentDesign from './pages/TournamentDesign';
import Pricing from './pages/Pricing';
import BusinessPricingTest from './pages/BusinessPricingTest';
import YourWhy from './pages/YourWhy';
import CorporateCompetitions from './pages/CorporateCompetitions';
import AthleteAnalytics from './pages/AthleteAnalytics';
import CorporateAnalytics from './pages/CorporateAnalytics';
import GuestRegistrationDemo from './pages/GuestRegistrationDemo';

import FootballHealthMonitoring from './pages/FootballHealthMonitoring';
import DefensiveHealthMonitoring from './pages/DefensiveHealthMonitoring';
import ComprehensiveHealthDemo from './pages/ComprehensiveHealthDemo';
import CCISDDocumentIntegration from './pages/CCISDDocumentIntegration';
import AthleticTrainerScheduler from './pages/AthleticTrainerScheduler';
import AdminRoleManagement from './pages/AdminRoleManagement';
import GamePracticeScheduler from './pages/GamePracticeScheduler';
import NonprofitBilling from './pages/NonprofitBilling';
import HealthBenefits from './pages/HealthBenefits';
import HealthDemo from './pages/HealthDemo';
import DomainManager from './pages/DomainManager';
import GrantFunding from './pages/GrantFunding';
import NonprofitResources from './pages/NonprofitResources';
import MerchandiseStore from './pages/MerchandiseStore';
import OrganizationRegistration from './pages/OrganizationRegistration';
import RoleHierarchy from './pages/RoleHierarchy';
import Schools from './pages/Schools';
import SubscriptionManagement from './pages/SubscriptionManagement';
import Capabilities from './pages/Capabilities';
import MillerHomepage from './pages/MillerHomepage';
import ScorekeeperEventSelection from './pages/ScorekeeperEventSelection';
import EventScorekeeperDashboard from './pages/EventScorekeeperDashboard';
import RoleDashboard from './pages/RoleDashboard';
import BulkRegistration from './pages/BulkRegistration';
import OrganizerAnalyticsDemo from './pages/OrganizerAnalyticsDemo';
import TournamentOnboarding from './pages/TournamentOnboarding';
import AthleteDashboard from './pages/AthleteDashboard';
import AthleteManagement from './pages/AthleteManagement';
import HealthCommunication from './pages/HealthCommunication';
import UnifiedLogin from './pages/UnifiedLogin';
import EquipmentManagement from './pages/EquipmentManagement';
import EducationalAthletics from './pages/EducationalAthletics';
import StudentHealthManagement from './pages/StudentHealthManagement';
import SchoolDistrictSolutions from './pages/SchoolDistrictSolutions';
import SmartScheduler from './pages/SmartScheduler';
import ComplianceManagement from './pages/ComplianceManagement';
import CoachDashboard from './pages/CoachDashboard';
import AthleticTrainerDashboard from './pages/AthleticTrainerDashboard';
import TournamentsPage from './pages/tournaments';
import Drafts from './pages/drafts';
import TournamentDetailPage from './pages/tournament-detail';
import TournamentEditPage from './pages/tournament-edit';
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
import SmartSignup from './pages/SmartSignup';
import { StaffOnboarding } from './components/StaffOnboarding';
import TournamentRegistration from './pages/TournamentRegistration';
import DailyFantasyLineup from './pages/DailyFantasyLineup';
import SnakeDraftCreator from './pages/SnakeDraftCreator';
import DailyFantasyCreator from './pages/DailyFantasyCreator';
import NFLKnockoutCreator from './pages/NFLKnockoutCreator';
import HeadToHeadCreator from './pages/HeadToHeadCreator';
import BestBallCreator from './pages/BestBallCreator';
import FantasyDashboard from './pages/FantasyDashboard';
import CaptainShowdownCreator from './pages/CaptainShowdownCreator';

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
        <Route path="/tournaments" component={TournamentsPage} />
        <Route path="/drafts" component={Drafts} />
        <Route path="/tournaments/:id" component={TournamentDetailPage} />
        <Route path="/tournaments/:id/edit" component={TournamentEditPage} />
        <Route path="/create" component={CreateTournament} />
        <Route path="/tournament/:id" component={Tournament} />
        <Route path="/embed/tournament/:id" component={EmbedTournament} />
        <Route path="/tournaments/:tournamentId/register" component={TournamentRegistration} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/store" component={MerchandiseStore} />
        <Route path="/merchandise" component={MerchandiseStore} />
        {/* AI features temporarily disabled for production */}
        {/* <Route path="/ai-consultation" component={AIConsultation} /> */}
        {/* <Route path="/ai-chat" component={AIChat} /> */}
        {/* <Route path="/ai-demo" component={AIDemo} /> */}
        <Route path="/settings" component={Settings} />
        <Route path="/subscription" component={SubscriptionManagement} />
        <Route path="/live-matches" component={LiveMatches} />
        <Route path="/championships" component={Championships} />
        <Route path="/webpage-builder" component={AdvancedPageBuilder} />
        <Route path="/modular-builder" component={EnhancedModularBuilder} />
        <Route path="/page-manager" component={PageManager} />
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
        <Route path="/schools" component={Schools} />
        <Route path="/dashboard" component={RoleDashboard} />
        <Route path="/athlete-dashboard" component={AthleteDashboard} />
        <Route path="/athlete-management" component={AthleteManagement} />
        <Route path="/health-communication" component={HealthCommunication} />
        <Route path="/equipment-management" component={EquipmentManagement} />
        <Route path="/smart-scheduler" component={SmartScheduler} />
        <Route path="/compliance-management" component={ComplianceManagement} />
        <Route path="/coach-dashboard" component={CoachDashboard} />
        <Route path="/athletic-trainer-dashboard" component={AthleticTrainerDashboard} />
        <Route path="/scorekeeper-events" component={ScorekeeperEventSelection} />
        <Route path="/events/:eventId/manage" component={EventScorekeeperDashboard} />
        <Route path="/domains" component={DomainManager} />
        <Route path="/guest-registration-demo" component={GuestRegistrationDemo} />

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
        
        {/* Fantasy Dashboard */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy" component={FantasyDashboard} />
        )}
        
        {/* Daily Fantasy Lineup Builder */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/league/:leagueId/lineup" component={DailyFantasyLineup} />
        )}
        
        {/* Fantasy League Creators */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/snake_draft" component={SnakeDraftCreator} />
        )}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/daily_fantasy" component={DailyFantasyCreator} />
        )}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/survivor" component={NFLKnockoutCreator} />
        )}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/head_to_head" component={HeadToHeadCreator} />
        )}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/best_ball" component={BestBallCreator} />
        )}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy/create/captain_showdown" component={CaptainShowdownCreator} />
        )}
        
        {/* Coaches Lounge Landing for fantasy domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/coaches-lounge" component={CoachesLoungeLanding} />
        )}
        
        {/* Fantasy Coaching AI route moved to top of switch */}
        
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
  if (brand === 'COMPETITIVE_EDUCATION_HUB') {
    return "min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900";
  }
  if (brand === 'TRANTOR_TOURNAMENTS') {
    return "min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900";
  }
  if (brand === 'COACHES_LOUNGE') {
    return "min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
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
      {/* Fantasy Coaching AI - High Priority Route */}
      <Route path="/fantasy-coaching" component={FantasyCoaching} />
      
      {/* Fantasy Tournaments - Public Access for Demo */}
      <Route path="/fantasy-tournaments" component={FantasyTournaments} />
      
      {/* League Dashboard - Fantasy League Management */}
      <Route path="/fantasy/league/:id" component={LeagueDashboard} />
      
      {/* League Settings - Commissioner Controls */}
      <Route path="/fantasy/league/:id/settings" component={LeagueSettings} />
      
      {/* Platform Selection Page */}
      <Route path="/platform-options" component={PlatformOptions} />
      
      <Route path="/trial-signup" component={TrialSignup} />
      <Route path="/donate" component={DonationFlow} />
      <Route path="/payment-methods" component={PaymentMethods} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/donation-success" component={DonationSuccess} />
      <Route path="/nonprofit/donate" component={NonprofitDonation} />
      <Route path="/nonprofit/analytics" component={NonprofitAnalytics} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/business-pricing-test" component={BusinessPricingTest} />
      <Route path="/capabilities" component={Capabilities} />
      <Route path="/your-why" component={YourWhy} />
      <Route path="/register" component={() => { window.location.href = '/smart-signup'; return null; }} />
      <Route path="/business-register" component={() => { window.location.href = '/smart-signup?type=business'; return null; }} />
      <Route path="/admin/approvals" component={AdminApprovals} />
      <Route path="/smart-signup" component={SmartSignup} />
      <Route path="/signup" component={SignupSelector} />
      <Route path="/tournament/design" component={TournamentDesign} />
      {/* Embed routes - public access for iframe embedding */}
      <Route path="/embed/tournament/:id" component={EmbedTournament} />
      <Route path="/register-old" component={() => { window.location.href = '/smart-signup'; return null; }} />
      
      {/* Tournament Creation requires login */}
      
      {/* Legal and Compliance Pages - Public Access */}
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/compliance" component={Compliance} />

      <Route path="/health-benefits" component={HealthBenefits} />
      <Route path="/demo/health" component={HealthDemo} />
      <Route path="/discount-demo" component={DiscountDemo} />
      <Route path="/organizer-analytics" component={OrganizerAnalyticsDemo} />
      <Route path="/tournament-onboarding" component={TournamentOnboarding} />
      
      {/* Tournament Creation Routes - Public Access for Preview Mode */}
      <Route path="/create-tournament" component={CreateTournament} />
      <Route path="/create-registration" component={RegistrationForm} />
      <Route path="/create-bracket" component={TournamentDesign} />
      
      <Route path="/grant-funding" component={GrantFunding} />
      <Route path="/nonprofit-resources" component={NonprofitResources} />
      <Route path="/register-organization" component={() => { window.location.href = '/smart-signup?type=business'; return null; }} />
      
      {/* Google Ad Grants Compliant Landing Pages */}
      <Route path="/educational-athletics" component={EducationalAthletics} />
      <Route path="/student-health-management" component={StudentHealthManagement} />
      <Route path="/school-district-solutions" component={SchoolDistrictSolutions} />
      {/* Unified Login for All Methods */}
      <Route path="/login" component={UnifiedLogin} />
      {/* Legacy Login Form */}
      <Route path="/legacy-login" component={Login} />
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
      {/* Fantasy Sports - Route through Coaches Lounge */}
      <Route path="/coaches-lounge/fantasy" component={FantasyLanding} />
      <Route path="/fantasy" component={() => {
        // Redirect to proper flow through Coaches Lounge
        window.location.href = '/coaches-lounge';
        return null;
      }} />
      
      {/* Local Tournaments - Champions for Change Events */}
      <Route path="/local-tournaments" component={LocalTournaments} />
      
      {/* Local Tournament Registration - Generic tournament registration */}
      <Route path="/champions-registration" component={LocalTournaments} />
      
      {/* Tournament Calendar - Regional Calendar */}
      <Route path="/tournament-calendar" component={TournamentCalendar} />
      
      {/* Show Coaches Lounge landing page */}
      <Route path="/coaches-lounge">
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
          <CoachesLoungeLanding />
        </div>
      </Route>
      {/* Show Domain-Specific Landing page if not authenticated or on guest-access domains */}
      {(!isAuthenticated || allowGuestAccess) && (
        <Route path="/">
          {config?.brand === 'COMPETITIVE_EDUCATION_HUB' ? (
            <EducationHubLanding />
          ) : config?.brand === 'TRANTOR_TOURNAMENTS' ? (
            <TrantorLanding />
          ) : (
            <div className={config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50"}>
              <Landing />
            </div>
          )}
        </Route>
      )}
      {/* Show authenticated routes if authenticated */}
      {isAuthenticated && <AuthenticatedRoutes />}
      {/* Default fallback - show domain-specific landing */}
      <Route>
        {config?.brand === 'COMPETITIVE_EDUCATION_HUB' ? (
          <EducationHubLanding />
        ) : config?.brand === 'TRANTOR_TOURNAMENTS' ? (
          <TrantorLanding />
        ) : (
          <div className={config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50"}>
            <Landing />
          </div>
        )}
      </Route>
    </Switch>
  );
}

export default App;