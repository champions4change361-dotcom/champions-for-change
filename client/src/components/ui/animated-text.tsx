import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'glow' | 'typewriter';
  className?: string;
  delay?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  children, 
  variant = 'gradient', 
  className,
  delay = 0 
}) => {
  return (
    <span
      className={cn(
        'inline-block',
        {
          'text-gradient font-bold animate-pulse': variant === 'gradient',
          'text-custom-primary animate-pulse-glow': variant === 'glow',
          'animate-slide-in': variant === 'typewriter',
        },
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
};

interface FloatingElementProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  className, 
  delay = 0,
  ...props 
}) => {
  return (
    <div
      className={cn('animate-float', className)}
      style={{ animationDelay: `${delay}s` }}
      {...props}
    >
      {children}
    </div>
  );
};