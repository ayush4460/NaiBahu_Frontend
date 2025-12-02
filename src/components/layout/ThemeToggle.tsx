/**
 * Theme Toggle Component
 * Switch between light and dark themes
 */

'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-muted hover:bg-muted/80 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Icon with animation */}
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <FontAwesomeIcon
          icon={faSun}
          className={cn(
            'absolute inset-0 text-yellow-500 transition-all duration-300',
            isDark
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          )}
        />

        {/* Moon Icon */}
        <FontAwesomeIcon
          icon={faMoon}
          className={cn(
            'absolute inset-0 text-blue-400 transition-all duration-300',
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          )}
        />
      </div>

      {/* Label (optional) */}
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}

// ============================================
// THEME TOGGLE WITH SWITCH STYLE
// ============================================

interface ThemeToggleSwitchProps {
  className?: string;
}

export function ThemeToggleSwitch({ className }: ThemeToggleSwitchProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-10 w-20 items-center rounded-full',
        'transition-colors duration-300',
        isDark ? 'bg-slate-700' : 'bg-slate-300',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Switch knob */}
      <span
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full',
          'transform transition-transform duration-300',
          'bg-white shadow-lg',
          isDark ? 'translate-x-11' : 'translate-x-1'
        )}
      >
        <FontAwesomeIcon
          icon={isDark ? faMoon : faSun}
          className={cn(
            'h-4 w-4',
            isDark ? 'text-blue-500' : 'text-yellow-500'
          )}
        />
      </span>
    </button>
  );
}
