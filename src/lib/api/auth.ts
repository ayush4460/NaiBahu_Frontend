/**
 * Authentication API Service (FLEXIBLE VERSION)
 * Handles all authentication related API calls
 * Works with multiple response formats
 */

import apiClient, { showApiError } from './client';
import { 
  LoginCredentials, 
  LoginResponse, 
  User,
  ApiResponse 
} from '@/types';
import { setAccessToken, setRefreshToken, removeTokens } from '@/lib/utils';

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<any>('/auth/login', credentials);
    
    console.log('🔐 Login response:', response.data);
    
    // Handle different response structures
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    
    // Check multiple possible structures
    if (response.data.data?.tokens?.accessToken) {
      // Format 1: data.data.tokens.accessToken
      accessToken = response.data.data.tokens.accessToken;
      refreshToken = response.data.data.tokens.refreshToken;
      console.log('✅ Found tokens in: data.data.tokens.accessToken');
    } else if (response.data.data?.access_token) {
      // Format 2: data.data.access_token
      accessToken = response.data.data.access_token;
      refreshToken = response.data.data.refresh_token;
      console.log('✅ Found tokens in: data.data.access_token');
    } else if (response.data.tokens?.accessToken) {
      // Format 3: data.tokens.accessToken
      accessToken = response.data.tokens.accessToken;
      refreshToken = response.data.tokens.refreshToken;
      console.log('✅ Found tokens in: data.tokens.accessToken');
    } else if (response.data.access_token) {
      // Format 4: data.access_token
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      console.log('✅ Found tokens in: data.access_token');
    }
    
    if (accessToken) {
      console.log('✅ Saving token to localStorage');
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      console.log('✅ Tokens saved successfully');
    } else {
      console.error('❌ No token found in response!');
      console.error('Response structure:', JSON.stringify(response.data, null, 2));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    showApiError(error);
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error: any) {
    console.error('Logout API error:', error);
  } finally {
    removeTokens();
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await apiClient.post<any>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );
    
    const newAccessToken = response.data.data?.tokens?.accessToken 
      || response.data.data?.access_token
      || response.data.tokens?.accessToken
      || response.data.access_token;
      
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return newAccessToken;
    }
    
    throw new Error('No access token in refresh response');
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<ApiResponse<any>>('/auth/me');
    return response.data.data.user || response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Verify token validity
 */
export async function verifyToken(): Promise<boolean> {
  try {
    await apiClient.get('/auth/verify');
    return true;
  } catch (error) {
    return false;
  }
}

const authApi = {
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  verifyToken,
};

export default authApi;