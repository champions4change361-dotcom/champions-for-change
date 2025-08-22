import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, Shield, Home } from 'lucide-react';

interface UserMenuProps {
  variant?: 'default' | 'compact' | 'mobile';
  showUserInfo?: boolean;
  className?: string;
}

export default function UserMenu({ 
  variant = 'default', 
  showUserInfo = true,
  className = ''
}: UserMenuProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Navigate to logout endpoint
    window.location.href = '/api/logout';
  };

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email || 'User';

  const userRole = user.userRole || user.complianceRole || 'user';

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        data-testid="button-logout-compact"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </Button>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`flex flex-col space-y-2 p-4 border-t ${className}`}>
        {showUserInfo && (
          <div className="flex items-center space-x-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImageUrl || ''} alt={userName} />
              <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-username">
                {userName}
              </p>
              <p className="text-xs text-gray-500 capitalize" data-testid="text-userrole">
                {userRole.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-logout-mobile"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center space-x-2 hover:bg-gray-100 ${className}`} data-testid="button-user-menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || ''} alt={userName} />
            <AvatarFallback className="bg-green-100 text-green-700 text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {showUserInfo && (
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900" data-testid="text-username">
                {userName}
              </p>
              <p className="text-xs text-gray-500 capitalize" data-testid="text-userrole">
                {userRole.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || ''} alt={userName} />
            <AvatarFallback className="bg-green-100 text-green-700 text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-username">
              {userName}
            </p>
            <p className="text-xs text-gray-500 capitalize" data-testid="text-userrole">
              {userRole.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a href="/" className="flex items-center w-full" data-testid="link-dashboard">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href="/settings" className="flex items-center w-full" data-testid="link-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </a>
        </DropdownMenuItem>
        
        {(userRole.includes('director') || userRole.includes('admin')) && (
          <DropdownMenuItem asChild>
            <a href="/admin" className="flex items-center w-full" data-testid="link-admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </a>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}