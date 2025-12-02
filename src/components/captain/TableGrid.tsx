/**
 * Table Grid Component - PRODUCTION READY
 * Complete workflow: Empty → Running → Billed → Payment → Empty
 */

'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { Table } from '@/types';
import { getTableColorClass, getTableStatusLabel, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import PaymentModal from './PaymentModal';

interface TableGridProps {
  tables: Table[] | any;
  onTableSelect: (table: Table) => void;
  onPaymentComplete?: (tableId: number, paymentData: any) => Promise<void>;
  isLoading?: boolean;
}

interface GroupedTables {
  [key: string]: Table[];
}

export default function TableGrid({ 
  tables, 
  onTableSelect, 
  onPaymentComplete,
  isLoading = false 
}: TableGridProps) {
  const [selectedBilledTable, setSelectedBilledTable] = useState<Table | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Extract and aggregate tables
  let tableArray: Table[] = [];
  
  if (Array.isArray(tables)) {
    tableArray = tables;
  } else if (tables?.tables && Array.isArray(tables.tables)) {
    tableArray = tables.tables;
  } else if (tables?.data?.tables && Array.isArray(tables.data.tables)) {
    tableArray = tables.data.tables;
  } else if (tables?.data && Array.isArray(tables.data)) {
    tableArray = tables.data;
  }

  const aggregatedTablesMap = new Map<number, Table>();
  
  tableArray.forEach((table) => {
    const existingTable = aggregatedTablesMap.get(table.table_id);
    
    if (existingTable) {
      const existingAmount = parseFloat(existingTable.total_amount || '0');
      const currentAmount = parseFloat(table.total_amount || '0');
      const summedAmount = existingAmount + currentAmount;
      
      aggregatedTablesMap.set(table.table_id, {
        ...existingTable,
        total_amount: summedAmount.toFixed(2),
        status: table.status === 'running' ? 'running' : existingTable.status,
        current_order_id: existingTable.current_order_id || table.current_order_id,
        order_number: existingTable.order_number || table.order_number,
      });
    } else {
      aggregatedTablesMap.set(table.table_id, { ...table });
    }
  });

  tableArray = Array.from(aggregatedTablesMap.values());

  const groupedTables = tableArray.reduce<GroupedTables>((acc, table) => {
    const block = table.table_block;
    if (!acc[block]) acc[block] = [];
    acc[block].push(table);
    return acc;
  }, {});

  const sortedBlocks = Object.keys(groupedTables).sort();

  const handleTableClick = (table: Table) => {
    if (table.status === 'billed') {
      setSelectedBilledTable(table);
      setShowPaymentModal(true);
    } else {
      onTableSelect(table);
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (!selectedBilledTable || !onPaymentComplete) return;
    try {
      await onPaymentComplete(selectedBilledTable.table_id, paymentData);
      setShowPaymentModal(false);
      setSelectedBilledTable(null);
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (tableArray.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">No tables available</p>
          <p className="text-sm text-muted-foreground">Please contact administrator</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {sortedBlocks.map((block) => (
          <div key={block} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              <h2 className="text-xl font-bold text-foreground">Block {block}</h2>
              <span className="text-sm text-muted-foreground">
                ({groupedTables[block].length} tables)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {groupedTables[block]
                .sort((a, b) => a.table_number.localeCompare(b.table_number))
                .map((table) => (
                  <TableCard
                    key={table.table_id}
                    table={table}
                    onClick={() => handleTableClick(table)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {selectedBilledTable && (
        <PaymentModal
          isOpen={showPaymentModal}
          table={selectedBilledTable}
          amount={parseFloat(selectedBilledTable.total_amount || '0')}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBilledTable(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

function TableCard({ table, onClick }: TableCardProps) {
  const colorClass = getTableColorClass(table.status);
  const statusLabel = getTableStatusLabel(table.status);
  const hasAmount = (table.status === 'running' || table.status === 'billed') && table.total_amount;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group bg-gradient-to-br rounded-xl p-6 border-2 shadow-md',
        'hover:shadow-2xl hover:scale-105 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-left',
        colorClass
      )}
    >
      <div className="absolute top-3 right-3">
        <FontAwesomeIcon
          icon={faCircle}
          className={cn(
            'h-3 w-3',
            table.status === 'empty' && 'text-gray-400',
            table.status === 'running' && 'text-yellow-200 animate-pulse',
            table.status === 'billed' && 'text-green-200 animate-pulse'
          )}
        />
      </div>

      {table.status === 'billed' && (
        <div className="absolute top-3 left-3">
          <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-white animate-bounce" />
        </div>
      )}

      <div className="text-center mb-2">
        <h3 className="text-3xl font-bold text-white mb-1">{table.table_number}</h3>
        <p className="text-sm text-white/80 font-medium">{statusLabel}</p>
      </div>

      <div className="text-center">
        {hasAmount && (
          <div className="text-white">
            <p className="text-xs text-white/70 mb-1">
              {table.status === 'billed' ? 'Bill Amount' : 'Current Bill'}
            </p>
            <p className="text-lg font-bold">₹{table.total_amount}</p>
          </div>
        )}
        
        {table.status === 'empty' && <p className="text-sm text-white/70">Available</p>}
        {table.status === 'billed' && <p className="text-xs text-white/90 mt-2 font-semibold">Click to Pay →</p>}
      </div>

      <div className="absolute bottom-2 left-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
          {table.seating_capacity} seats
        </span>
      </div>

      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </button>
  );
}

export function TableLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 p-4 card mb-6">
      <h3 className="font-semibold text-foreground">Table Status:</h3>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600"></div>
        <span className="text-sm text-muted-foreground">Empty</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-400"></div>
        <span className="text-sm text-muted-foreground">Running</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400"></div>
        <span className="text-sm text-muted-foreground">Billed (Click to Pay)</span>
      </div>
    </div>
  );
}