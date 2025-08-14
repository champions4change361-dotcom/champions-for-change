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
import Register from './pages/Register';
import RegistrationForm from './pages/RegistrationForm';
import TournamentDesign from './pages/TournamentDesign';
import Pricing from './pages/Pricing';
import BusinessPricingTest from './pages/BusinessPricingTest';
import YourWhy from './pages/YourWhy';
import CorporateCompetitions from './pages/CorporateCompetitions';
import AthleteAnalytics from './pages/AthleteAnalytics';
import CorporateAnalytics from './pages/CorporateAnalytics';
import MillerVLCDemo from './pages/MillerVLCDemo';
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
import OrganizationRegistration from './pages/OrganizationRegistration';
import RoleHierarchy from './pages/RoleHierarchy';
import CustomDesignDemo from './pages/CustomDesignDemo';

function AuthenticatedRoutes() {
  const { isFeatureEnabled, isFantasyDomain, config } = useDomain();

  // Use fallback if config is not loaded yet
  const brandClass = config ? getDomainBackgroundClass(config.brand) : "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50";

  return (
    <div className={brandClass}>
      <DomainNavigation />
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
        <Route path="/miller-vlc-demo" component={MillerVLCDemo} />
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
        
        {/* Legal Pages */}
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/terms" component={TermsOfService} />
        
        <Route>
          {/* 404 - redirect to home */}
          <Home />
        </Route>
      </Switch>
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
      <Route path="/pricing" component={Pricing} />
      <Route path="/business-pricing-test" component={BusinessPricingTest} />
      <Route path="/your-why" component={YourWhy} />
      <Route path="/register" component={RegistrationForm} />
      <Route path="/tournament/design" component={TournamentDesign} />
      <Route path="/register-old" component={Register} />
      <Route path="/miller-vlc-demo" component={MillerVLCDemo} />
      <Route path="/health-benefits" component={HealthBenefits} />
      <Route path="/grant-funding" component={GrantFunding} />
      <Route path="/register-organization" component={OrganizationRegistration} />
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