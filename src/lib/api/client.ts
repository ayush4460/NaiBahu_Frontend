/**
 * Axios API Client - FIXED VERSION
 * Configured with interceptors for auth, error handling, and logging
 * FIX: Prevents infinite redirect loop on 401 errors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, removeTokens, setAccessToken, API_URL } from '../utils';
import toast from 'react-hot-toast';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token to requests
    const token = getAccessToken();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Request:', config.method?.toUpperCase(), config.url);
      console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // ⚠️ CRITICAL FIX: Only logout/redirect if user was actually logged in
      const hadToken = getAccessToken();
      
      if (hadToken) {
        // User was logged in but token is now invalid/expired
        console.log('⚠️  Token expired or invalid - logging out');
        removeTokens();
        toast.error('Session expired. Please login again.');
        
        // Redirect to login only if not already there
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else {
        // No token was sent (user not logged in yet)
        // Don't redirect - this is expected behavior
        console.log('ℹ️  401 received but no token was sent (not logged in)');
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// ERROR HANDLER UTILITY
// ============================================

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  statusCode?: number;
}

/**
 * Extract error message from API error
 */
export function getApiError(error: any): ApiError {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors,
      statusCode: error.response.status,
    };
  }
  
  if (error.message) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
  };
}

/**
 * Show error toast from API error
 */
export function showApiError(error: any): void {
  const apiError = getApiError(error);
  
  if (apiError.errors && apiError.errors.length > 0) {
    // Show first validation error
    toast.error(apiError.errors[0].message);
  } else {
    toast.error(apiError.message);
  }
}

// ============================================
// EXPORT
// ============================================

export default apiClient;

// Export common HTTP methods for convenience
export const api = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  patch: apiClient.patch,
  delete: apiClient.delete,
};