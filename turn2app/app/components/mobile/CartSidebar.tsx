/**
 * Cart Sidebar Component - TapCart-Style
 * 
 * Slide-out Cart Sidebar für Quick Cart Access ohne Navigation
 * zu separater Cart-Seite mit Item-Management und Checkout.
 */

import { useState } from 'react';
import { CartItemList } from './CartItemList';
import { CartSummary } from './CartSummary';
import { CartEmpty } from './CartEmpty';
import type { CartItem, Product } from './types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onQuantityUpdate: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onProductClick: (product: Product) => void;
  recommendedProducts?: Product[];
}

export function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onQuantityUpdate,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  onProductClick,
  recommendedProducts = []
}: CartSidebarProps) {
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.variant.price.amount) * item.quantity);
  }, 0);

  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.variant.compareAtPrice) {
      const savings = (parseFloat(item.variant.compareAtPrice.amount) - parseFloat(item.variant.price.amount)) * item.quantity;
      return sum + savings;
    }
    return sum;
  }, 0);

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    await onQuantityUpdate(itemId, newQuantity);
    setIsUpdating(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId);
    await onRemoveItem(itemId);
    setIsUpdating(null);
  };

  const handleContinueShoppingClick = () => {
    onContinueShopping();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="cart-sidebar">
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">
            Shopping Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
            type="button"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <CartEmpty
              onContinueShopping={handleContinueShoppingClick}
              recommendedProducts={recommendedProducts.slice(0, 2)}
              onProductClick={(product) => {
                onProductClick(product);
                onClose();
              }}
            />
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items-container">
                <CartItemList
                  items={cartItems}
                  onQuantityUpdate={handleQuantityUpdate}
                  onRemoveItem={handleRemoveItem}
                  isUpdating={isUpdating}
                />
              </div>

              {/* Cart Summary */}
              <div className="cart-summary-container">
                <CartSummary
                  subtotal={subtotal}
                  savings={totalSavings}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  currency="USD"
                  onCheckout={onCheckout}
                  onContinueShopping={handleContinueShoppingClick}
                />
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .cart-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            animation: fadeIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .cart-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: 400px;
            background: white;
            z-index: 999;
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
          }
          
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          
          .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e5e5;
            background: white;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          .cart-title {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }
          
          .close-button {
            width: 32px;
            height: 32px;
            border-radius: 16px;
            background: #f5f5f5;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            color: #666;
          }
          
          .close-button:hover {
            background: #e5e5e5;
            color: #333;
          }
          
          .cart-content {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }
          
          .cart-items-container {
            flex: 1;
            background: white;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .cart-summary-container {
            background: white;
            position: sticky;
            bottom: 0;
            border-top: 1px solid #e5e5e5;
          }
          
          /* Mobile adjustments */
          @media (max-width: 480px) {
            .cart-sidebar {
              max-width: 100%;
            }
            
            .cart-header {
              padding: 16px;
            }
            
            .cart-title {
              font-size: 16px;
            }
          }
          
          /* Scroll styling */
          .cart-content::-webkit-scrollbar {
            width: 4px;
          }
          
          .cart-content::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          .cart-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
          }
          
          .cart-content::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
        `}</style>
      </div>
    </>
  );
}