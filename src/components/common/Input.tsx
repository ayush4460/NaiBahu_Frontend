/**
 * Input Component
 * Reusable input field with label, error handling, and icons
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconDefinition;
  rightIcon?: IconDefinition;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
  containerClassName?: string;
}

// ============================================
// COMPONENT
// ============================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      fullWidth = true,
      containerClassName,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(fullWidth && 'w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <FontAwesomeIcon icon={leftIcon} className="h-5 w-5" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-lg border transition-all duration-200',
              'text-foreground placeholder:text-muted-foreground',
              'bg-background dark:bg-card',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              
              // With icons
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              
              // Error state
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-input',
              
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-muted',
              
              // Custom className
              className
            )}
            disabled={disabled}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground',
                onRightIconClick && 'cursor-pointer hover:text-foreground'
              )}
              onClick={onRightIconClick}
            >
              <FontAwesomeIcon icon={rightIcon} className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
