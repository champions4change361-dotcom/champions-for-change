import { lazy } from 'react';
import Home from '../pages/Home';
import Landing from '../pages/Landing';
import EducationHubLanding from '../pages/EducationHubLanding';
import TrantorLanding from '../pages/TrantorLanding';
import SmartSignup from '../pages/SmartSignup';
import UnifiedLogin from '../pages/UnifiedLogin';

// Route aliases for cleaner URLs
export const ROUTE_ALIASES = {
  '/athletic-trainer': '/athletic-trainer-dashboard',
  '/scorekeeper': '/scorekeeper-dashboard',
  '/parent': '/parent-dashboard',
  '/register': '/smart-signup',
  '/business-register': '/smart-signup?type=business',
  '/signup': '/smart-signup'
};

// Route configuration for easier management
export const ROUTE_CONFIG = {
  // Public routes - no auth required
  public: [
    { path: '/trial-signup', component: lazy(() => import('../pages/TrialSignup')) },
    { path: '/team-signup', component: lazy(() => import('../pages/TeamSignupPage')) },
    { path: '/pricing', component: lazy(() => import('../pages/Pricing')) },
    { path: '/capabilities', component: lazy(() => import('../pages/Capabilities')) },
    { path: '/privacy', component: lazy(() => import('../pages/PrivacyPolicy')) },
    { path: '/terms', component: lazy(() => import('../pages/TermsOfService')) },
    { path: '/refund-policy', component: lazy(() => import('../pages/RefundPolicy')) },
    { path: '/compliance', component: lazy(() => import('../pages/Compliance')) },
    { path: '/smart-signup', component: SmartSignup },
    { path: '/login', component: UnifiedLogin },
    { path: '/forgot-password', component: lazy(() => import('../pages/ForgotPassword')) },
    { path: '/reset-password', component: lazy(() => import('../pages/ResetPassword')) }
  ],

  // Fantasy routes - require fantasy feature
  fantasy: [
    { path: '/fantasy', component: lazy(() => import('../pages/FantasyDashboard')), requiresAuth: true },
    { path: '/fantasy-tournaments', component: lazy(() => import('../pages/FantasyTournaments')) },
    { path: '/fantasy-coaching', component: lazy(() => import('../pages/FantasyCoaching')) },
    { path: '/fantasy/contests', component: lazy(() => import('../pages/PublicContests')) },
    { path: '/fantasy/league/:id', component: lazy(() => import('../pages/LeagueDashboard')), requiresAuth: true },
    { path: '/fantasy/league/:id/settings', component: lazy(() => import('../pages/LeagueSettings')), requiresAuth: true },
    { path: '/coaches-lounge', component: lazy(() => import('../pages/CoachesLoungeLanding')) },
    { path: '/commissioner', component: lazy(() => import('../pages/CommissionerDashboard')), requiresAuth: true },
    { path: '/fantasy/create/snake_draft', component: lazy(() => import('../pages/SnakeDraftCreator')) },
    { path: '/fantasy/create/daily_fantasy', component: lazy(() => import('../pages/DailyFantasyCreator')) },
    { path: '/fantasy/create/survivor', component: lazy(() => import('../pages/NFLKnockoutCreator')) },
    { path: '/fantasy/create/head_to_head', component: lazy(() => import('../pages/HeadToHeadCreator')) },
    { path: '/fantasy/create/best_ball', component: lazy(() => import('../pages/BestBallCreator')) },
    { path: '/fantasy/create/captain_showdown', component: lazy(() => import('../pages/CaptainShowdownCreator')) }
  ],

  // Tournament routes
  tournaments: [
    { path: '/tournaments', component: lazy(() => import('../pages/tournaments')), requiresAuth: true },
    { path: '/tournaments/:id', component: lazy(() => import('../pages/tournament-detail')), requiresAuth: true },
    { path: '/tournaments/:id/edit', component: lazy(() => import('../pages/tournament-edit')), requiresAuth: true },
    { path: '/tournament/:id', component: lazy(() => import('../pages/tournament')), requiresAuth: true },
    { path: '/create', component: lazy(() => import('../pages/CreateTournament')), requiresAuth: true },
    { path: '/drafts', component: lazy(() => import('../pages/drafts')), requiresAuth: true }
  ],

  // Admin routes - require admin role
  admin: [
    { path: '/admin', component: lazy(() => import('../pages/AdminManagement')), roles: ['admin', 'super_admin'] },
    { path: '/admin/approvals', component: lazy(() => import('../pages/AdminApprovals')), roles: ['admin', 'super_admin'] },
    { path: '/admin-role-management', component: lazy(() => import('../pages/AdminRoleManagement')), roles: ['admin', 'super_admin'] }
  ],

  // Core app routes
  core: [
    { path: '/settings', component: lazy(() => import('../pages/Settings')), requiresAuth: true },
    { path: '/dashboard', component: lazy(() => import('../pages/RoleDashboard')), requiresAuth: true },
    { path: '/contacts', component: lazy(() => import('../pages/Contacts')), requiresAuth: true },
    { path: '/teams', component: lazy(() => import('../pages/TeamListPage')), requiresAuth: true },
    { path: '/teams/create', component: lazy(() => import('../pages/TeamCreatePage')), requiresAuth: true },
    { path: '/teams/:id', component: lazy(() => import('../pages/TeamDashboardPage')), requiresAuth: true }
  ]
};

export function getDomainBackgroundClass(brand: string) {
  const backgrounds = {
    'COMPETITIVE_EDUCATION_HUB': "min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900",
    'TRANTOR_TOURNAMENTS': "min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900",
    'COACHES_LOUNGE': "min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"
  };

  return backgrounds[brand] || "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100";
}