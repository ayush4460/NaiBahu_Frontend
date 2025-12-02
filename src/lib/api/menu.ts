/**
 * Menu API Service
 * All menu-related API calls
 */

import apiClient, { showApiError } from './client';
import { MenuCategory, MenuItem, ApiResponse } from '@/types';

// ============================================
// MENU ENDPOINTS
// ============================================

/**
 * Get all menu categories
 */
export async function getCategories(): Promise<MenuCategory[]> {
  try {
    const response = await apiClient.get<ApiResponse<MenuCategory[]>>('/menu/categories');
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get menu items by category
 */
export async function getItemsByCategory(categoryId: number): Promise<MenuItem[]> {
  try {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(
      `/menu/items?category_id=${categoryId}`
    );
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get all menu items
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu/items');
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Search menu items
 */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  try {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(
      `/menu/items/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(itemId: number): Promise<MenuItem> {
  try {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu/items/${itemId}`);
    return response.data.data;
  } catch (error: any) {
    showApiError(error);
    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

const menuApi = {
  getCategories,
  getItemsByCategory,
  getAllMenuItems,
  searchMenuItems,
  getMenuItemById,
};

export default menuApi;