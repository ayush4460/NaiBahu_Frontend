/**
 * Loading Component
 * Various loading indicators for different use cases
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'spinner' | 'dots' | 'pulse';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner
  const Spinner = () => (
    <svg
      className={cn('animate-spin text-primary', sizeClasses[size])}
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Dots
  const Dots = () => {
    const dotSize = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5',
    };

    return (
      <div className="flex gap-2">
        <div
          className={cn(
            'rounded-full bg-primary animate-bounce',
            dotSize[size]
          )}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn(
            'rounded-full bg-primary animate-bounce',
            dotSize[size]
          )}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn(
            'rounded-full bg-primary animate-bounce',
            dotSize[size]
          )}
          style={{ animationDelay: '300ms' }}
        />
      </div>
    );
  };

  // Pulse
  const Pulse = () => (
    <div
      className={cn(
        'rounded-full bg-primary animate-pulse',
        sizeClasses[size]
      )}
    />
  );

  // Select variant
  const LoadingIcon = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      default:
        return <Spinner />;
    }
  };

  // Content
  const Content = () => (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <LoadingIcon />
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  // Full screen wrapper
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Content />
      </div>
    );
  }

  return <Content />;
}

// ============================================
// LOADING OVERLAY COMPONENT
// ============================================

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

// ============================================
// SKELETON LOADING COMPONENT
// ============================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-muted rounded-lg',
            'h-4 w-full',
            className
          )}
        />
      ))}
    </>
  );
}

// ============================================
// CARD SKELETON COMPONENT
// ============================================

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
