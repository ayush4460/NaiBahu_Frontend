/**
 * Orders API Service
 * All order-related API calls
 */

import apiClient, { showApiError } from './client';
import { Order, CreateOrderDTO, AddItemsDTO, ApiResponse } from '@/types';

// ============================================
// ORDER ENDPOINTS
// ============================================

/**
 * Create new order (KOT)
 */
export async function createOrder(orderData: CreateOrderDTO): Promise<Order> {
  try {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number): Promise<Order> {
  try {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get orders by table
 */
export async function getOrdersByTable(tableId: number): Promise<Order[]> {
  try {
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders?table_id=${tableId}`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Add items to existing order
 */
export async function addItemsToOrder(orderId: number, items: AddItemsDTO): Promise<Order> {
  try {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${orderId}/items`,
      items
    );
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: number,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'cancelled'
): Promise<Order> {
  try {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Generate bill for order
 */
export async function generateBill(orderId: number): Promise<Order> {
  try {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/bill`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: number): Promise<Order> {
  try {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

const ordersApi = {
  createOrder,
  getOrderById,
  getOrdersByTable,
  getAllOrders,
  addItemsToOrder,
  updateOrderStatus,
  generateBill,
  cancelOrder,
};

export default ordersApi;