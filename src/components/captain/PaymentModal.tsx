/**
 * Payment Modal Component - PRODUCTION READY
 * For billed tables - handles payment processing
 */

'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faCreditCard,
  faMobileAlt,
  faTimes,
  faCheckCircle,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import { Table } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'phonepe' | 'googlepay' | 'paytm';

interface PaymentModalProps {
  isOpen: boolean;
  table: Table;
  amount: number;
  onClose: () => void;
  onPaymentComplete: (paymentData: PaymentData) => Promise<void>;
}

export interface PaymentData {
  paymentMethod: PaymentMethod;
  amountPaid: number;
  transactionId?: string;
  notes?: string;
}

const paymentMethods = [
  { value: 'cash' as PaymentMethod, label: 'Cash', icon: faMoneyBillWave, color: 'from-green-500 to-green-600' },
  { value: 'card' as PaymentMethod, label: 'Card', icon: faCreditCard, color: 'from-blue-500 to-blue-600' },
  { value: 'upi' as PaymentMethod, label: 'UPI', icon: faMobileAlt, color: 'from-purple-500 to-purple-600' },
  { value: 'phonepe' as PaymentMethod, label: 'PhonePe', icon: faMobileAlt, color: 'from-indigo-500 to-indigo-600' },
  { value: 'googlepay' as PaymentMethod, label: 'Google Pay', icon: faMobileAlt, color: 'from-red-500 to-red-600' },
  { value: 'paytm' as PaymentMethod, label: 'Paytm', icon: faMobileAlt, color: 'from-cyan-500 to-cyan-600' },
];

export default function PaymentModal({
  isOpen,
  table,
  amount,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>(amount.toFixed(2));
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const paidAmount = parseFloat(amountPaid) || 0;
  const change = paidAmount - amount;
  const isValidAmount = paidAmount >= amount;

  const handlePayment = async () => {
    if (!selectedMethod || !isValidAmount) {
      setError('Please select payment method and enter valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const txnId = selectedMethod !== 'cash' 
        ? `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}` 
        : undefined;

      const paymentData: PaymentData = {
        paymentMethod: selectedMethod,
        amountPaid: paidAmount,
        transactionId: txnId || transactionId || undefined,
        notes: notes || undefined,
      };

      await onPaymentComplete(paymentData);
      
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setSelectedMethod(null);
        setAmountPaid(amount.toFixed(2));
        setTransactionId('');
        setNotes('');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setSelectedMethod(null);
      setAmountPaid(amount.toFixed(2));
      setTransactionId('');
      setNotes('');
      setError('');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={handleClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {isSuccess ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-2">Table {table.table_number} - {formatCurrency(paidAmount)} paid</p>
              {change > 0 && <p className="text-sm text-muted-foreground">Change: {formatCurrency(change)}</p>}
              <p className="text-xs text-muted-foreground mt-4">Table will be available shortly...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faReceipt} className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Payment</h2>
                      <p className="text-sm text-white/80">Table {table.table_number}</p>
                    </div>
                  </div>
                  <button onClick={handleClose} disabled={isProcessing} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50">
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="text-sm text-white/80 mb-1">Bill Amount</div>
                  <div className="text-3xl font-bold">{formatCurrency(amount)}</div>
                </div>
              </div>

              <div className="p-6">
                {isProcessing ? (
                  <div className="py-12">
                    <Loading size="lg" text="Processing payment..." />
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">Amount Paid *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min={amount}
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-background border-2 border-border rounded-lg text-foreground font-semibold text-lg focus:border-primary focus:outline-none"
                          placeholder={amount.toFixed(2)}
                        />
                      </div>
                      {paidAmount > amount && <p className="text-sm text-green-600 mt-2 font-medium">Change: {formatCurrency(change)}</p>}
                      {paidAmount < amount && paidAmount > 0 && <p className="text-sm text-red-600 mt-2 font-medium">Insufficient amount (Short: {formatCurrency(amount - paidAmount)})</p>}
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-3">Payment Method *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.value}
                            onClick={() => setSelectedMethod(method.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedMethod === method.value ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50'}`}
                          >
                            <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                              <FontAwesomeIcon icon={method.icon} className="text-white h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{method.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedMethod && selectedMethod !== 'cash' && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-foreground mb-2">Transaction ID (Optional)</label>
                        <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:border-primary focus:outline-none" placeholder="Enter transaction ID" />
                      </div>
                    )}

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">Notes (Optional)</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:border-primary focus:outline-none resize-none" placeholder="Add payment notes..." />
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <Button onClick={handlePayment} variant="primary" size="lg" fullWidth disabled={!selectedMethod || !isValidAmount}>
                      Confirm Payment - {formatCurrency(paidAmount)}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">Table will be marked as available after payment</p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}