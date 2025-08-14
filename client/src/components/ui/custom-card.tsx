import React from 'react';
import { cn } from '@/lib/utils';

// Custom Card Component using your new CSS classes
interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg border transition-all duration-300',
          // Variant styles
          {
            'card-custom': variant === 'default',
            'glass-morphism border-glass-200': variant === 'glass',
            'bg-gradient-to-br from-custom-gradient-start to-custom-gradient-end text-white border-none': variant === 'gradient',
          },
          // Size styles
          {
            'p-4': size === 'sm',
            'p-6': size === 'md',
            'p-8': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CustomCard.displayName = 'CustomCard';

// Custom Button Component
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gradient' | 'glow' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'gradient', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
          // Variant styles
          {
            'btn-custom text-white hover:shadow-glow': variant === 'gradient',
            'bg-custom-primary hover:bg-custom-secondary text-white rounded-lg animate-pulse-glow': variant === 'glow',
            'glass-morphism hover:bg-glass-200 backdrop-blur-lg rounded-xl text-white': variant === 'glass',
          },
          // Size styles
          {
            'px-3 py-1.5 text-sm rounded-md': size === 'sm',
            'px-4 py-2 text-base rounded-lg': size === 'md',
            'px-6 py-3 text-lg rounded-xl': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
CustomButton.displayName = 'CustomButton';