/**
 * Payments API Service
 * All payment-related API calls
 */

import apiClient, { showApiError } from './client';
import { Payment, ProcessPaymentDTO, ApiResponse } from '@/types';

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * Process payment
 * Maps frontend field names to backend expectations
 */
export async function processPayment(paymentData: ProcessPaymentDTO): Promise<Payment> {
  try {
    console.log('📤 Payments API - Sending payment:', paymentData);
    
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', paymentData);
    
    console.log('✅ Payments API - Response:', response.data);
    
    return response.data.data || response.data.payment;
  } catch (error: any) {
    console.error('❌ Payments API - Error:', error.response?.data || error);
    showApiError(error);
    throw error;
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: number): Promise<Payment> {
  try {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
    return response.data.data || response.data.payment;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get payments by order
 */
export async function getPaymentsByOrder(orderId: number): Promise<Payment[]> {
  try {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      `/payments/order/${orderId}`
    );
    return response.data.data || response.data.payments;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get all payments
 */
export async function getAllPayments(filters?: {
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Payment[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const url = queryString ? `/payments?${queryString}` : '/payments';
    
    const response = await apiClient.get<ApiResponse<Payment[]>>(url);
    return response.data.data || response.data.payments;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(filters?: {
  date_from?: string;
  date_to?: string;
}): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const url = queryString ? `/payments/stats/summary?${queryString}` : '/payments/stats/summary';
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<Payment> {
  try {
    const response = await apiClient.put<ApiResponse<Payment>>(
      `/payments/${paymentId}`,
      { status }
    );
    return response.data.data || response.data.payment;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

const paymentsApi = {
  processPayment,
  getPaymentById,
  getPaymentsByOrder,
  getAllPayments,
  getPaymentStats,
  updatePaymentStatus,
};

export default paymentsApi;