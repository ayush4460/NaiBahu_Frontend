/**
 * Order Store
 * Global state management for current order/KOT using Zustand
 */

import { create } from 'zustand';
import { CartItem, MenuItem } from '@/types';

// ============================================
// STORE INTERFACE
// ============================================

interface OrderStore {
  // State
  items: CartItem[];
  tableId: number | null;
  
  // Actions
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateInstructions: (itemId: number, instructions: string) => void;
  clearCart: () => void;
  setTableId: (tableId: number) => void;
  
  // Computed
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

// ============================================
// CREATE STORE
// ============================================

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Initial state
  items: [],
  tableId: null,

  // Add item to cart
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.item_id === item.item_id);
      
      if (existingItem) {
        // Increase quantity if item already exists
        return {
          items: state.items.map((i) =>
            i.item_id === item.item_id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      } else {
        // Add new item with quantity 1
        return {
          items: [...state.items, { ...item, quantity: 1, special_instructions: '' }],
        };
      }
    }),

  // Remove item from cart
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.item_id !== itemId),
    })),

  // Update item quantity
  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          items: state.items.filter((item) => item.item_id !== itemId),
        };
      }
      
      return {
        items: state.items.map((item) =>
          item.item_id === itemId ? { ...item, quantity } : item
        ),
      };
    }),

  // Update special instructions
  updateInstructions: (itemId, instructions) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.item_id === itemId
          ? { ...item, special_instructions: instructions }
          : item
      ),
    })),

  // Clear entire cart
  clearCart: () =>
    set({
      items: [],
      tableId: null,
    }),

  // Set table ID
  setTableId: (tableId) =>
    set({
      tableId,
    }),

  // Calculate subtotal
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // Calculate tax (5% GST)
  getTax: () => {
    const subtotal = get().getSubtotal();
    return subtotal * 0.05;
  },

  // Calculate total
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTax();
    return subtotal + tax;
  },

  // Get total item count
  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// ============================================
// SELECTORS
// ============================================

export const useCartItems = () => useOrderStore((state) => state.items);
export const useCartTableId = () => useOrderStore((state) => state.tableId);
export const useCartSubtotal = () => useOrderStore((state) => state.getSubtotal());
export const useCartTax = () => useOrderStore((state) => state.getTax());
export const useCartTotal = () => useOrderStore((state) => state.getTotal());
export const useCartItemCount = () => useOrderStore((state) => state.getItemCount());