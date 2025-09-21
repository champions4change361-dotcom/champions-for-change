import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  component: any;
  roles?: string[];
  requiresAuth?: boolean;
  path: string;
}

export default function ProtectedRoute({ 
  component: Component, 
  roles, 
  requiresAuth = false,
  path,
  ...props 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  if (requiresAuth && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    setLocation('/unauthorized');
    return null;
  }

  return <Route path={path} component={Component} {...props} />;
}