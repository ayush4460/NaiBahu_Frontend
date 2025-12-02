/**
 * KOT Preview Component - PRODUCTION READY
 * Smart button logic based on table status and order history
 */

'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faPlus,
  faMinus,
  faTrash,
  faPrint,
  faReceipt,
  faPepperHot,
} from '@fortawesome/free-solid-svg-icons';
import { CartItem } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import Button from '@/components/common/Button';

interface KOTPreviewProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  tableStatus: 'empty' | 'running' | 'billed';
  hasExistingOrders: boolean;
  tableNumber?: string;
  kotNumber?: string;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateSpicePreference?: (itemId: number, spiceLevel: string) => void;
  onRemoveItem: (itemId: number) => void;
  onGenerateKOT: () => Promise<void>;
  onGenerateBill?: () => Promise<void>;
  isGeneratingKOT?: boolean;
  isGeneratingBill?: boolean;
}

const spiceLevels = [
  { value: 'mild', label: 'Mild', icon: '🌶️', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'regular', label: 'Regular', icon: '🌶️', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'spicy', label: 'Spicy', icon: '🌶️🌶️', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'extra_spicy', label: 'Extra Hot', icon: '🌶️🌶️🌶️', color: 'bg-red-200 text-red-800 border-red-400' },
];

export default function KOTPreview({
  items,
  subtotal,
  tax,
  total,
  tableStatus,
  hasExistingOrders,
  tableNumber,
  kotNumber,
  onUpdateQuantity,
  onUpdateSpicePreference,
  onRemoveItem,
  onGenerateKOT,
  onGenerateBill,
  isGeneratingKOT = false,
  isGeneratingBill = false,
}: KOTPreviewProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Button visibility logic
  const hasNewItems = items.length > 0;
  const showGenerateKOT = hasNewItems;
  const showGenerateBill = tableStatus === 'running' && hasExistingOrders && onGenerateBill;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faShoppingCart} className="text-primary" />
            {hasNewItems ? 'New Items' : 'Order Cart'}
          </h2>
          {items.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {hasNewItems ? 'Review items before generating KOT' : 'Add items to create order'}
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {items.length === 0 ? (
          <EmptyCart hasExistingOrders={hasExistingOrders} />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemCard
                key={item.item_id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onUpdateSpicePreference={onUpdateSpicePreference}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary & Actions */}
      {(hasNewItems || showGenerateBill) && (
        <div className="border-t border-border p-6 space-y-4">
          {/* Price Breakdown - Only for new items */}
          {hasNewItems && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5% GST)</span>
                <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {showGenerateKOT && (
              <Button
                onClick={onGenerateKOT}
                variant="secondary"
                size="lg"
                fullWidth
                icon={faPrint}
                isLoading={isGeneratingKOT}
                disabled={isGeneratingKOT}
              >
                {isGeneratingKOT ? 'Generating KOT...' : 'Generate KOT & Print'}
              </Button>
            )}

            {showGenerateBill && (
              <Button
                onClick={onGenerateBill}
                variant="primary"
                size="lg"
                fullWidth
                icon={faReceipt}
                isLoading={isGeneratingBill}
                disabled={isGeneratingBill}
              >
                {isGeneratingBill ? 'Generating Bill...' : 'Generate Bill & Print'}
              </Button>
            )}

            {/* Helper Text */}
            {hasNewItems && showGenerateBill && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Generate KOT for new items, or Generate Bill to close the table
              </p>
            )}
            {!hasNewItems && showGenerateBill && (
              <p className="text-xs text-muted-foreground text-center">
                No new items. Click `Generate Bill` to complete order.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCart({ hasExistingOrders }: { hasExistingOrders: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={faShoppingCart} className="text-muted-foreground h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasExistingOrders ? 'No new items' : 'No items added yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasExistingOrders 
          ? 'Add more items or generate bill for existing orders'
          : 'Browse the menu and add items to create your order'
        }
      </p>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateSpicePreference?: (itemId: number, spiceLevel: string) => void;
  onRemove: (itemId: number) => void;
}

function CartItemCard({ item, onUpdateQuantity, onUpdateSpicePreference, onRemove }: CartItemCardProps) {
  const [showSpiceOptions, setShowSpiceOptions] = useState(false);
  const itemTotal = item.price * item.quantity;
  const isSpicy = item.is_spicy || false;
  const currentSpiceLevel = item.spice_preference || item.spice_level || 'regular';

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.item_name}</h4>
            {isSpicy && <span className="text-xs">🌶️</span>}
          </div>
          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
        </div>
        <button onClick={() => onRemove(item.item_id)} className="text-red-500 hover:text-red-600 transition-colors p-1">
          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
        </button>
      </div>

      {isSpicy && onUpdateSpicePreference && (
        <>
          <button onClick={() => setShowSpiceOptions(!showSpiceOptions)} className="w-full flex items-center justify-between px-3 py-2 bg-background rounded-lg hover:bg-muted/50 transition-colors border border-border">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPepperHot} className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium text-foreground">
                {spiceLevels.find(s => s.value === currentSpiceLevel)?.label || 'Regular'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{showSpiceOptions ? 'Hide' : 'Change'}</span>
          </button>

          {showSpiceOptions && (
            <div className="grid grid-cols-2 gap-2">
              {spiceLevels.map((level) => (
                <button key={level.value} onClick={() => { onUpdateSpicePreference(item.item_id, level.value); setShowSpiceOptions(false); }} className={cn('px-2 py-2 rounded-lg text-xs font-medium border-2 transition-all', currentSpiceLevel === level.value ? level.color + ' scale-105' : 'bg-background border-border hover:border-primary/50')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-background rounded-lg p-1">
          <button onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors disabled:opacity-50" disabled={item.quantity <= 1}>
            <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
          </button>
          <span className="w-10 text-center font-bold text-foreground">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white hover:bg-primary/90 transition-colors">
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{formatCurrency(itemTotal)}</p>
        </div>
      </div>

      {item.special_instructions && (
        <div className="text-xs text-muted-foreground italic border-t border-border/50 pt-2">
          Note: {item.special_instructions}
        </div>
      )}
    </div>
  );
}