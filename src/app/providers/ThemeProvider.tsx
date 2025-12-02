/**
 * Theme Provider
 * Initializes and manages theme across the application
 */

'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}