/**
 * Table Store
 * Global state management for tables using Zustand
 */

import { create } from 'zustand';
import { Table } from '@/types';

// ============================================
// STORE INTERFACE
// ============================================

interface TableStore {
  // State
  tables: Table[];
  selectedTable: Table | null;
  isLoading: boolean;
  
  // Actions
  setTables: (tables: Table[]) => void;
  updateTable: (tableId: number, updates: Partial<Table>) => void;
  setSelectedTable: (table: Table | null) => void;
  setLoading: (loading: boolean) => void;
  clearTables: () => void;
}

// ============================================
// CREATE STORE
// ============================================

export const useTableStore = create<TableStore>((set, get) => ({
  // Initial state
  tables: [],
  selectedTable: null,
  isLoading: false,

  // Set all tables
  setTables: (tables) =>
    set({
      tables,
      isLoading: false,
    }),

  // Update single table
  updateTable: (tableId, updates) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.table_id === tableId ? { ...table, ...updates } : table
      ),
      selectedTable:
        state.selectedTable?.table_id === tableId
          ? { ...state.selectedTable, ...updates }
          : state.selectedTable,
    })),

  // Set selected table
  setSelectedTable: (table) =>
    set({
      selectedTable: table,
    }),

  // Set loading state
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  // Clear all tables
  clearTables: () =>
    set({
      tables: [],
      selectedTable: null,
      isLoading: false,
    }),
}));

// ============================================
// SELECTORS
// ============================================

export const useTables = () => useTableStore((state) => state.tables);
export const useSelectedTable = () => useTableStore((state) => state.selectedTable);
export const useTableLoading = () => useTableStore((state) => state.isLoading);

/**
 * Get tables by status
 */
export const useTablesByStatus = (status: 'empty' | 'running' | 'billed') => {
  return useTableStore((state) => state.tables.filter((table) => table.status === status));
};

/**
 * Get table by ID
 */
export const useTableById = (tableId: number) => {
  return useTableStore((state) => state.tables.find((table) => table.table_id === tableId));
};