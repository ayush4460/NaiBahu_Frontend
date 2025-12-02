/**
 * Tables API Service
 * All table-related API calls
 */

import apiClient, { showApiError } from './client';
import { Table, TableWithOrder, ApiResponse } from '@/types';

// ============================================
// TABLE ENDPOINTS
// ============================================

/**
 * Get all tables
 */
export async function getAllTables(): Promise<Table[]> {
  try {
    const response = await apiClient.get<ApiResponse<Table[]>>('/tables');
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get single table by ID
 */
export async function getTableById(tableId: number): Promise<TableWithOrder> {
  try {
    const response = await apiClient.get<ApiResponse<TableWithOrder>>(`/tables/${tableId}`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get tables by status
 */
export async function getTablesByStatus(status: 'empty' | 'running' | 'billed'): Promise<Table[]> {
  try {
    const response = await apiClient.get<ApiResponse<Table[]>>(`/tables?status=${status}`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Update table status
 * FIXED: Changed from PATCH to PUT to match backend route
 */
export async function updateTableStatus(
  tableId: number,
  status: 'empty' | 'running' | 'billed'
): Promise<Table> {
  try {
    console.log('📤 Updating table status:', { tableId, status, method: 'PUT' });
    const response = await apiClient.put<ApiResponse<Table>>(
      `/tables/${tableId}/status`,
      { status }
    );
    console.log('✅ Table status updated:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to update table status:', error);
    showApiError(error);
    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

const tablesApi = {
  getAllTables,
  getTableById,
  getTablesByStatus,
  updateTableStatus,
};

export default tablesApi;