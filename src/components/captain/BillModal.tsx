// src/components/captain/BillModal.tsx

'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faTimes, faPrint, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Button from '@/components/common/Button';
import { SPICE_LEVELS } from '@/lib/spice';

interface BillModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export default function BillModal({ isOpen, order, onClose, onProceedToPayment }: BillModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => window.print();

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faReceipt} className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Bill Summary</h2>
                  <p className="text-sm text-white/80">Order #{order.order_number}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)] scrollbar-thin">
            <div className="text-center mb-6 pb-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground mb-1">Nai Bahu Restaurant</h3>
              <p className="text-sm text-muted-foreground">Table: {order.table?.table_number}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(order.created_at)}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
              {order.items?.map((item, index) => {
                const spiceInfo = item.spice_preference ? SPICE_LEVELS[item.spice_preference] : null;

                return (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{item.item_name}</p>
                        {spiceInfo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <span>{spiceInfo.icon}</span>
                            <span>{spiceInfo.label}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                      {item.special_instructions && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-foreground ml-4">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary */}
            <div className="space-y-2 bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(order.subtotal_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST 5%)</span>
                <span className="font-medium text-foreground">{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Notes:</p>
                <p className="text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border space-y-2">
            <Button onClick={onProceedToPayment} variant="primary" size="lg" fullWidth icon={faArrowRight} iconPosition="right">
              Proceed to Payment
            </Button>
            <Button onClick={handlePrint} variant="outline" size="lg" fullWidth icon={faPrint}>
              Print Bill
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}