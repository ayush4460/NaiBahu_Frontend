/**
 * Root Layout
 * Main application layout with theme provider and toast notifications
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from './providers/ThemeProvider';
import '../styles/global.css';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Metadata
export const metadata: Metadata = {
  title: 'Nai Bahu Restaurant - POS System',
  description: 'Production-grade restaurant order management system with real-time updates',
  keywords: ['restaurant', 'pos', 'order management', 'kitchen display'],
  authors: [{ name: 'Nai Bahu Restaurant' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {/* Main content */}
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgb(var(--color-card))',
                color: 'rgb(var(--color-card-foreground))',
                border: '1px solid rgb(var(--color-border))',
                borderRadius: '0.75rem',
                padding: '1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'rgb(var(--color-card))',
                  border: '1px solid #10B981',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'rgb(var(--color-card))',
                  border: '1px solid #EF4444',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3B82F6',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}