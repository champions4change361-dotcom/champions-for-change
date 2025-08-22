import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  variant?: 'default' | 'minimal' | 'full-width';
  className?: string;
}

export default function AuthenticatedLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backButtonText = 'Back to Platform',
  backButtonHref = '/',
  variant = 'default',
  className = ''
}: AuthenticatedLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access this page.</p>
          <Link href="/login" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`min-h-screen bg-white dark:bg-gray-900 ${className}`}>
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                {showBackButton && (
                  <Link href={backButtonHref} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">{backButtonText}</span>
                  </Link>
                )}
                {title && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
                  </div>
                )}
              </div>
              <UserMenu variant="compact" showUserInfo={false} />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  const containerClass = variant === 'full-width' ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-10">
        <div className={containerClass}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href={backButtonHref} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">{backButtonText}</span>
                </Link>
              )}
              
              {title && (
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                    <div className="h-6 w-6 bg-white/20 rounded" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {subtitle && <p className="text-xs text-green-600 dark:text-green-400">{subtitle}</p>}
                  </div>
                </div>
              )}
            </div>
            
            <UserMenu />
          </div>
        </div>
      </header>

      <main className={`flex-1 ${containerClass} py-8`}>
        {children}
      </main>
    </div>
  );
}