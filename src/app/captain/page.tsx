/**
 * Captain Dashboard - COMPLETE UPDATED
 * Complete workflow with payment modal integration
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUtensils, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import { useTableStore } from '@/store/tableStore';
import TableGrid, { TableLegend } from '@/components/captain/TableGrid';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import tablesApi from '@/lib/api/tables';
import paymentsApi from '@/lib/api/payments';
import socketService from '@/lib/socket';
import toast from 'react-hot-toast';
import { Table } from '@/types';

export default function CaptainDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { tables, setTables, updateTable, setLoading, isLoading } = useTableStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!user) {
      router.push('/');
      return;
    }

    // Initialize
    fetchTables();
    initializeWebSocket();

    return () => {
      socketService.disconnectSocket();
    };
  }, [user, router]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await tablesApi.getAllTables();
      console.log('📊 Fetched tables:', data);
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTables();
    toast.success('Tables refreshed');
    setIsRefreshing(false);
  };

  const initializeWebSocket = () => {
    socketService.initSocket();
    
    // Listen for table status updates
    socketService.onTableStatusUpdated((data) => {
      updateTable(data.table_id, { status: data.status });
      
      // Refresh tables when status changes
      fetchTables();
    });

    // Listen for order updates
    socketService.onOrderUpdated((data) => {
      // Refresh tables to update amounts
      fetchTables();
    });
  };

  const handleTableSelect = (table: Table) => {
    // For empty or running tables, navigate to order page
    router.push(`/captain/order/${table.table_id}`);
  };

  const handlePaymentComplete = async (tableId: number, paymentData: any) => {
    try {
      console.log('💳 Processing payment for table:', tableId);
      console.log('💳 Payment data:', paymentData);
      console.log('💳 Current tables:', tables);

      // FIXED: Ensure tables is an array
      let tablesArray: Table[] = [];
      
      if (Array.isArray(tables)) {
        tablesArray = tables;
      } else if (tables?.tables && Array.isArray(tables.tables)) {
        tablesArray = tables.tables;
      } else if (tables?.data?.tables && Array.isArray(tables.data.tables)) {
        tablesArray = tables.data.tables;
      } else if (tables?.data && Array.isArray(tables.data)) {
        tablesArray = tables.data;
      }

      console.log('💳 Tables array:', tablesArray);

      // Find the table - need to find ANY entry with this table_id
      const tableEntries = tablesArray.filter(t => t.table_id === tableId);
      console.log('💳 Table entries found:', tableEntries);

      if (tableEntries.length === 0) {
        throw new Error('Table not found');
      }

      // Use the first entry to get order info (they all have the same table, just different orders)
      const table = tableEntries[0];
      
      if (!table.current_order_id) {
        throw new Error('No active order found for this table');
      }

      console.log('💳 Found table with order:', table);

      // FIXED: Send payment data in the format backend expects
      const paymentPayload = {
        order_id: table.current_order_id,                    // Backend expects 'order_id'
        payment_method: paymentData.paymentMethod,            // 'payment_method' ✓
        amount_paid: paymentData.amountPaid,                  // 'amount_paid' ✓
        reference_number: paymentData.transactionId || null,  // Backend expects 'reference_number' (not 'transaction_id')
        notes: paymentData.notes || null,                     // 'notes' ✓
      };

      console.log('💳 Sending payment payload:', paymentPayload);

      // Create payment record
      const paymentResponse = await paymentsApi.processPayment(paymentPayload);

      console.log('✅ Payment processed successfully:', paymentResponse);

      // Update table status to 'empty'
      await tablesApi.updateTableStatus(tableId, 'empty');

      console.log('✅ Table status updated to empty');

      // Refresh tables to reflect changes
      await fetchTables();

      toast.success('Payment completed successfully!');
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      throw error; // Re-throw to show error in modal
    }
  };

  const handleLogout = () => {
    logout();
    socketService.disconnectSocket();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUtensils} className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Captain Portal</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              icon={faRefresh}
              isLoading={isRefreshing}
            >
              Refresh
            </Button>
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              icon={faSignOutAlt}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a Table</h2>
          <p className="text-muted-foreground">
            Click on a table to start taking orders or click a billed table to process payment
          </p>
        </div>

        <div className="mb-6">
          <TableLegend />
        </div>

        {isLoading && !tables.length ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="lg" text="Loading tables..." />
          </div>
        ) : (
          <TableGrid
            tables={tables}
            onTableSelect={handleTableSelect}
            onPaymentComplete={handlePaymentComplete}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}