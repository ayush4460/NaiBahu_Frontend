/**
 * Utility Functions
 * Reusable helper functions used across the application
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(relativeTime);

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Merge Tailwind classes properly (handles conflicts)
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

/**
 * Safe localStorage get
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage set
 */
export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Remove from localStorage
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return getFromStorage(ACCESS_TOKEN_KEY, null);
}

export function setAccessToken(token: string): void {
  setToStorage(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return getFromStorage(REFRESH_TOKEN_KEY, null);
}

export function setRefreshToken(token: string): void {
  setToStorage(REFRESH_TOKEN_KEY, token);
}

export function removeTokens(): void {
  removeFromStorage(ACCESS_TOKEN_KEY);
  removeFromStorage(REFRESH_TOKEN_KEY);
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format date
 */
export function formatDate(date: string | Date, format: string = 'DD MMM YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  return dayjs(date).format('hh:mm A');
}

/**
 * Relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Get time difference in minutes
 */
export function getTimeDifferenceInMinutes(date: string | Date): number {
  return dayjs().diff(dayjs(date), 'minute');
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Slug generator
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number (Indian)
 */
export function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\s+/g, ''));
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

// ============================================
// TABLE UTILITIES
// ============================================

/**
 * Get table color class based on status
 */
export function getTableColorClass(status: 'empty' | 'running' | 'billed'): string {
  switch (status) {
    case 'empty':
      return 'from-slate-700 to-slate-800 border-slate-600 dark:from-slate-800 dark:to-slate-900';
    case 'running':
      return 'from-yellow-500 to-yellow-600 border-yellow-400';
    case 'billed':
      return 'from-green-500 to-green-600 border-green-400';
    default:
      return 'from-slate-700 to-slate-800 border-slate-600';
  }
}

/**
 * Get table status label
 */
export function getTableStatusLabel(status: 'empty' | 'running' | 'billed'): string {
  switch (status) {
    case 'empty':
      return 'Available';
    case 'running':
      return 'Occupied';
    case 'billed':
      return 'Bill Ready';
    default:
      return 'Unknown';
  }
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'badge badge-warning';
    case 'confirmed':
    case 'preparing':
      return 'badge badge-info';
    case 'ready':
    case 'served':
      return 'badge badge-success';
    case 'cancelled':
      return 'badge badge-danger';
    case 'billed':
      return 'badge badge-success';
    default:
      return 'badge';
  }
}

// ============================================
// CALCULATION UTILITIES
// ============================================

/**
 * Calculate subtotal from items
 */
export function calculateSubtotal(items: Array<{ unit_price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
}

/**
 * Calculate tax (assuming 5% GST)
 */
export function calculateTax(subtotal: number, taxRate: number = 0.05): number {
  return subtotal * taxRate;
}

/**
 * Calculate total
 */
export function calculateTotal(subtotal: number, tax: number, discount: number = 0): number {
  return subtotal + tax - discount;
}

/**
 * Round to 2 decimal places
 */
export function roundTo2Decimals(num: number): number {
  return Math.round(num * 100) / 100;
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Log error to console (only in development)
 */
export function logError(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
  }
}

// ============================================
// PRINT UTILITIES
// ============================================

/**
 * Print element by ID
 */
export function printElement(elementId: string): void {
  const printContents = document.getElementById(elementId)?.innerHTML;
  if (!printContents) return;
  
  const originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // Reload to restore React state
}

/**
 * Download as file
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// BROWSER UTILITIES
// ============================================

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Check if mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ============================================
// CONSTANTS
// ============================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Nai Bahu Restaurant';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export const TABLE_STATUS_COLORS = {
  empty: '#6B7280', // gray
  running: '#EAB308', // yellow
  billed: '#10B981', // green
} as const;

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  billed: 'Billed',
  cancelled: 'Cancelled',
} as const;

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  phonepe: 'PhonePe',
  googlepay: 'Google Pay',
  paytm: 'Paytm',
} as const;