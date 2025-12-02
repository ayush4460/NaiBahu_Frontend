/**
 * Order Taking Page - FIXED FOR YOUR API
 * Works with your actual API response structure
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useTableStore } from '@/store/tableStore';
import MenuBrowser from '@/components/captain/MenuBrowser';
import KOTPreview from '@/components/captain/KOTPreview';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import tablesApi from '@/lib/api/tables';
import ordersApi from '@/lib/api/orders';
import socketService from '@/lib/socket';
import toast from 'react-hot-toast';
import { MenuItem, CartItem, SpiceLevel } from '@/types';

export default function OrderTakingPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = parseInt(params.tableId as string);
  
  const { user } = useAuthStore();
  const { items, addItem: addItemToStore, updateQuantity, removeItem, clearCart, setTableId } = useOrderStore();
  const { selectedTable, setSelectedTable } = useTableStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingKOT, setIsGeneratingKOT] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [existingOrders, setExistingOrders] = useState<any[]>([]);
  const [kotNumber, setKotNumber] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchTableData();
    setTableId(tableId);

    return () => {
      socketService.removeAllListeners();
    };
  }, [tableId, user, router]);

  const fetchTableData = async () => {
    try {
      setIsLoading(true);
      
      // Get all tables to find this table's data
      const tablesResponse = await tablesApi.getAllTables();
      
      // Extract tables array from response
      let allTables: any[] = [];
      if (Array.isArray(tablesResponse)) {
        allTables = tablesResponse;
      } else if (tablesResponse?.data?.tables) {
        allTables = tablesResponse.data.tables;
      } else if (tablesResponse?.tables) {
        allTables = tablesResponse.tables;
      }

      console.log('📊 All tables:', allTables);
      
      // Find all entries for this table
      const tableEntries = allTables.filter(t => t.table_id === tableId);
      console.log('📊 Table entries for table', tableId, ':', tableEntries);
      
      if (tableEntries.length === 0) {
        throw new Error('Table not found');
      }

      // Use the first entry for table info (they're all the same table, just different orders)
      const tableInfo = tableEntries[0];
      setSelectedTable(tableInfo);

      // If table is running, set existing orders
      if (tableInfo.status === 'running') {
        // Filter entries that have order IDs
        const ordersForTable = tableEntries.filter(t => t.current_order_id);
        console.log('📋 Existing orders found:', ordersForTable.length);
        setExistingOrders(ordersForTable);
      } else {
        console.log('📋 No existing orders (table status:', tableInfo.status, ')');
        setExistingOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching table:', error);
      toast.error('Failed to load table data');
      router.push('/captain');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding item from menu
  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = items.find(item => item.item_id === menuItem.item_id);
    
    if (existingItem) {
      updateQuantity(menuItem.item_id, existingItem.quantity + 1);
    } else {
      const cartItem: CartItem = {
        item_id: menuItem.item_id,
        item_name: menuItem.item_name,
        price: menuItem.price,
        quantity: 1,
        is_spicy: menuItem.is_spicy,
        spice_level: menuItem.spice_level,
        spice_preference: menuItem.spice_level,
        special_instructions: '',
      };
      addItemToStore(cartItem);
    }
  };

  // Handle spice preference update
  const handleUpdateSpicePreference = (itemId: number, spiceLevel: string) => {
    const updatedItems = items.map(item =>
      item.item_id === itemId
        ? { ...item, spice_preference: spiceLevel as SpiceLevel }
        : item
    );
    
    clearCart();
    updatedItems.forEach(item => addItemToStore(item));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // Generate KOT
  const handleGenerateKOT = async () => {
    if (items.length === 0) {
      toast.error('Please add items to generate KOT');
      return;
    }

    setIsGeneratingKOT(true);

    try {
      const orderData = {
        table_id: tableId,
        order_items: items.map(item => ({
          menu_item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          spice_preference: item.spice_preference || null,
          special_instructions: item.special_instructions || null,
        })),
        subtotal_amount: subtotal,
        tax_amount: tax,
        total_amount: total,
      };

      console.log('📤 Creating order:', orderData);
      const response = await ordersApi.createOrder(orderData);
      setKotNumber(response.order_number);
      
      // Generate and print KOT PDF
      generateKOTPDF(items, selectedTable?.table_number, response.order_number);

      toast.success(`KOT #${response.order_number} generated successfully!`);
      clearCart();
      
      // Refresh table data
      await fetchTableData();
    } catch (error) {
      console.error('❌ Error generating KOT:', error);
      toast.error('Failed to generate KOT');
    } finally {
      setIsGeneratingKOT(false);
    }
  };

  // Generate Bill
  const handleGenerateBill = async () => {
    setIsGeneratingBill(true);

    try {
      console.log('📄 Generating bill for table:', tableId);
      console.log('📄 Existing orders:', existingOrders);

      // Get ALL tables to find all orders for this table
      const tablesResponse = await tablesApi.getAllTables();
      
      let allTables: any[] = [];
      if (Array.isArray(tablesResponse)) {
        allTables = tablesResponse;
      } else if (tablesResponse?.data?.tables) {
        allTables = tablesResponse.data.tables;
      } else if (tablesResponse?.tables) {
        allTables = tablesResponse.tables;
      }

      // Get all orders for this table
      const tableOrders = allTables.filter(t => t.table_id === tableId && t.current_order_id);
      
      if (tableOrders.length === 0) {
        toast.error('No orders found for this table');
        return;
      }

      console.log('📄 Orders to bill:', tableOrders);

      // Calculate total from all orders
      const billSubtotal = tableOrders.reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || '0');
      }, 0);
      const billTax = billSubtotal * 0.05;
      const billTotal = billSubtotal + billTax;

      console.log('💰 Bill totals:', { billSubtotal, billTax, billTotal });

      // For the bill PDF, we need actual order items
      // Try to fetch detailed order items
      let allOrderItems: any[] = [];
      
      try {
        // Try to get order items from API
        const ordersResponse = await ordersApi.getTableOrders(tableId);
        if (ordersResponse?.orders) {
          allOrderItems = ordersResponse.orders;
        }
      } catch (error) {
        console.error('⚠️ Could not fetch detailed orders, using basic info:', error);
        // Fallback: use basic order info
        allOrderItems = tableOrders.map(order => ({
          item_name: `Order #${order.order_number}`,
          quantity: 1,
          unit_price: parseFloat(order.total_amount || '0'),
          total_price: parseFloat(order.total_amount || '0'),
        }));
      }

      console.log('📋 Order items for bill:', allOrderItems);

      // Generate Bill PDF
      generateBillPDF({
        tableNumber: selectedTable?.table_number,
        orders: allOrderItems,
        subtotal: billSubtotal,
        tax: billTax,
        total: billTotal,
      });

      // Update table status to 'billed'
      await tablesApi.updateTableStatus(tableId, 'billed');

      toast.success('Bill generated successfully!');
      
      // Navigate back to dashboard
      setTimeout(() => {
        router.push('/captain');
      }, 1500);
    } catch (error) {
      console.error('❌ Error generating bill:', error);
      toast.error('Failed to generate bill');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  // Get table status and existing orders info
  const tableStatus = selectedTable?.status || 'empty';
  const hasExistingOrders = existingOrders.length > 0;

  console.log('🎯 Component state:', {
    tableStatus,
    hasExistingOrders,
    existingOrdersCount: existingOrders.length,
    cartItemsCount: items.length
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading order interface..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/captain')}
            variant="ghost"
            size="sm"
            icon={faArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Table: {selectedTable?.table_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tableStatus === 'running' 
                ? `Order in Progress (${existingOrders.length} orders - ₹${existingOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0).toFixed(2)})` 
                : 'New Order'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">Nai Bahu</p>
          <p className="text-xs text-muted-foreground">Restaurant</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu Browser */}
        <div className="flex-1 p-6 overflow-y-auto">
          <MenuBrowser onAddItem={handleAddItem} />
        </div>

        {/* KOT Preview Sidebar */}
        <div className="w-96">
          <KOTPreview
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
            tableStatus={tableStatus}
            hasExistingOrders={hasExistingOrders}
            tableNumber={selectedTable?.table_number}
            kotNumber={kotNumber}
            onUpdateQuantity={updateQuantity}
            onUpdateSpicePreference={handleUpdateSpicePreference}
            onRemoveItem={removeItem}
            onGenerateKOT={handleGenerateKOT}
            onGenerateBill={handleGenerateBill}
            isGeneratingKOT={isGeneratingKOT}
            isGeneratingBill={isGeneratingBill}
          />
        </div>
      </div>
    </div>
  );
}

// PDF Generation Functions (same as before)
function generateKOTPDF(items: CartItem[], tableNumber?: string, kotNumber?: string) {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const spiceLevels = {
    mild: { label: 'Mild', icon: '🌶️' },
    regular: { label: 'Regular', icon: '🌶️' },
    spicy: { label: 'Spicy', icon: '🌶️🌶️' },
    extra_spicy: { label: 'Extra Hot', icon: '🌶️🌶️🌶️' },
  };
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KOT - ${kotNumber || 'Draft'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 20px; background: white; color: black; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .header .kot-number { font-size: 18px; font-weight: bold; margin: 10px 0; }
        .items-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
        .items-table thead { border-bottom: 2px solid #000; border-top: 2px solid #000; }
        .items-table th { padding: 8px 4px; text-align: left; font-weight: bold; }
        .items-table td { padding: 10px 4px; border-bottom: 1px dashed #ccc; }
        .item-name { font-weight: bold; font-size: 13px; }
        .qty-col { width: 50px; text-align: center; font-weight: bold; }
        .footer { margin-top: 20px; padding-top: 15px; border-top: 2px dashed #000; text-align: center; }
        @media print { body { padding: 10px; } @page { margin: 10mm; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KITCHEN ORDER TICKET</h1>
        <div class="kot-number">KOT #${kotNumber || 'DRAFT'}</div>
        <div>Table: ${tableNumber || 'N/A'} | ${timestamp}</div>
      </div>

      <table class="items-table">
        <thead><tr><th>QTY</th><th>ITEM</th></tr></thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td class="qty-col">${item.quantity}</td>
              <td><div class="item-name">${item.item_name}</div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>*** KITCHEN COPY ***</p>
        <p>Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => { printWindow.print(); setTimeout(() => printWindow.close(), 100); }, 250);
    };
  }
}

function generateBillPDF(billData: any) {
  const timestamp = new Date().toLocaleString('en-IN');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bill - Table ${billData.tableNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 30px; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #000; background: #f5f5f5; }
        td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
        .totals { margin-top: 20px; border-top: 2px solid #000; padding-top: 15px; }
        .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
        .grand-total { font-size: 24px; font-weight: bold; border-top: 3px double #000; padding-top: 15px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #000; }
        @media print { body { padding: 15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>NAI BAHU RESTAURANT</h1>
        <p>FINAL BILL</p>
        <p>Table: ${billData.tableNumber} | ${timestamp}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ITEM</th>
            <th style="text-align: center;">QTY</th>
            <th style="text-align: right;">PRICE</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${billData.orders.map((item: any) => `
            <tr>
              <td>${item.item_name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">₹${parseFloat(item.unit_price).toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">₹${parseFloat(item.total_price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div><span>Subtotal:</span><span>₹${billData.subtotal.toFixed(2)}</span></div>
        <div><span>Tax (5% GST):</span><span>₹${billData.tax.toFixed(2)}</span></div>
        <div class="grand-total"><span>GRAND TOTAL:</span><span>₹${billData.total.toFixed(2)}</span></div>
      </div>

      <div class="footer">
        <p><strong>Thank You for Dining With Us!</strong></p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => { printWindow.print(); setTimeout(() => printWindow.close(), 100); }, 250);
    };
  }
}