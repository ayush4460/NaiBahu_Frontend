/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: IconDefinition;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-secondary to-secondary/90 text-white hover:from-secondary/90 hover:to-secondary/80 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary dark:text-primary hover:bg-primary hover:text-white',
    ghost: 'text-foreground hover:bg-muted',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Loading state
        isLoading && 'cursor-wait',
        
        // Custom className
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
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
      )}

      {/* Left icon */}
      {!isLoading && icon && iconPosition === 'left' && (
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      )}

      {/* Button text */}
      {children}

      {/* Right icon */}
      {!isLoading && icon && iconPosition === 'right' && (
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      )}
    </button>
  );
}
