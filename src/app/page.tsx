/**
 * Login Page - FIXED VERSION
 * Complete authentication page with theme toggle and API integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faUtensils,
  faUserShield,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import authApi from '@/lib/api/auth';
import { isValidEmail } from '@/lib/utils';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

type LoginMode = 'captain' | 'admin';

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Form state
  const [mode, setMode] = useState<LoginMode>('captain');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/captain');
      }
    }
  }, [isAuthenticated, router]);

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // FORM HANDLERS
  // ============================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting login...', { email: formData.email, mode });

      // Call login API - this will handle token storage internally
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login API response:', response);

      // Check if login was successful
      if (response.success && response.data) {
        // ✅ FIX: Extract tokens from correct location
        const { user, tokens } = response.data;
        
        // Get tokens from the correct path
        const accessToken = tokens?.accessToken || response.data.access_token;
        const refreshToken = tokens?.refreshToken || response.data.refresh_token;

        console.log('✅ User data:', user);
        console.log('✅ Token extracted:', accessToken ? 'YES' : 'NO');

        if (!accessToken) {
          console.error('❌ No access token found in response!');
          toast.error('Authentication failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Verify user role matches selected mode
        if (mode === 'admin' && user.role !== 'admin') {
          toast.error('Invalid credentials. Admin access only.');
          setIsLoading(false);
          return;
        }

        // Store auth data in Zustand store
        setAuth(user, accessToken, refreshToken);

        console.log('✅ Auth stored in Zustand');

        // Show success message
        toast.success(`Welcome back, ${user.full_name}!`);

        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'admin') {
            console.log('📍 Redirecting to /admin');
            router.push('/admin');
          } else {
            console.log('📍 Redirecting to /captain');
            router.push('/captain');
          }
        }, 500);
      } else {
        console.error('❌ Login failed - no success flag or data');
        toast.error('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Handle specific error messages
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials.';

      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white/10 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 rounded-2xl shadow-2xl p-8">
          {/* Top Border Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-t-2xl" />

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-4 shadow-lg">
              <FontAwesomeIcon icon={faUtensils} className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Nai Bahu</h1>
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              Restaurant Management System
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('captain')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'captain'
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg'
                  : 'bg-white/10 dark:bg-slate-700/50 text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700'
              }`}
            >
              <FontAwesomeIcon icon={faUserTie} className="h-4 w-4" />
              Captain
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'admin'
                  ? 'bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-lg'
                  : 'bg-white/10 dark:bg-slate-700/50 text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700'
              }`}
            >
              <FontAwesomeIcon icon={faUserShield} className="h-4 w-4" />
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={faEnvelope}
              required
              disabled={isLoading}
              autoComplete="email"
              className="bg-white/10 dark:bg-slate-700/50 border-white/20 dark:border-slate-600 text-white placeholder:text-gray-400"
            />

            {/* Password Input */}
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={faLock}
              rightIcon={showPassword ? faEyeSlash : faEye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              required
              disabled={isLoading}
              autoComplete="current-password"
              className="bg-white/10 dark:bg-slate-700/50 border-white/20 dark:border-slate-600 text-white placeholder:text-gray-400"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-white/20 dark:border-slate-600 bg-white/10 dark:bg-slate-700/50 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <span className="text-sm text-gray-300 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={() => toast('Contact administrator to reset password', {
                  icon: 'ℹ️',
                })}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-white/5 dark:bg-slate-700/30 rounded-lg border border-white/10 dark:border-slate-600/50">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">
              Demo Credentials
            </p>
            <div className="text-xs text-gray-300 dark:text-gray-400 space-y-1">
              <p>
                <strong>Admin:</strong> admin@naibahu.com / Admin@123456
              </p>
              <p>
                <strong>Captain:</strong> captain1@naibahu.com / Captain@123
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Secure authentication powered by JWT
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Version 1.0.0 • © 2025 Nai Bahu Restaurant
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading size="lg" text="Authenticating..." />
        </div>
      )}
    </div>
  );
}