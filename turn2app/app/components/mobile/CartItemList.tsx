/**
 * Cart Item List Component - TapCart-Style
 * 
 * Liste der Cart Items mit Quantity Controls, Remove Buttons
 * und Loading States für optimale Mobile UX.
 */

import type { CartItem } from './types';

interface CartItemListProps {
  items: CartItem[];
  onQuantityUpdate: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isUpdating: string | null;
}

export function CartItemList({
  items,
  onQuantityUpdate,
  onRemoveItem,
  isUpdating
}: CartItemListProps) {

  const handleQuantityChange = (item: CartItem, change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      onQuantityUpdate(item.id, newQuantity);
    }
  };

  const handleQuantityInput = (item: CartItem, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      onQuantityUpdate(item.id, numValue);
    }
  };

  const calculateItemTotal = (item: CartItem): number => {
    return parseFloat(item.variant.price.amount) * item.quantity;
  };

  const calculateItemSavings = (item: CartItem): number => {
    if (!item.variant.compareAtPrice) return 0;
    return (parseFloat(item.variant.compareAtPrice.amount) - parseFloat(item.variant.price.amount)) * item.quantity;
  };

  return (
    <div className="cart-item-list">
      {items.map((item, index) => {
        const isItemUpdating = isUpdating === item.id;
        const itemTotal = calculateItemTotal(item);
        const itemSavings = calculateItemSavings(item);
        const hasVariantInfo = item.variant.selectedOptions && item.variant.selectedOptions.length > 0;

        return (
          <div 
            key={item.id} 
            className={`cart-item ${isItemUpdating ? 'updating' : ''}`}
          >
            {/* Product Image */}
            <div className="item-image-container">
              <img 
                src={item.product.image} 
                alt={item.product.title}
                className="item-image"
              />
            </div>

            {/* Product Info */}
            <div className="item-info">
              <div className="item-header">
                <h3 className="item-title">{item.product.title}</h3>
                <button
                  className="remove-button"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isItemUpdating}
                  type="button"
                  aria-label="Remove item"
                >
                  {isItemUpdating ? '⟳' : '✕'}
                </button>
              </div>

              {/* Vendor */}
              {item.product.vendor && (
                <p className="item-vendor">{item.product.vendor}</p>
              )}

              {/* Variant Info */}
              {hasVariantInfo && (
                <div className="variant-info">
                  {item.variant.selectedOptions!.map(option => (
                    <span key={option.name} className="variant-option">
                      {option.name}: {option.value}
                    </span>
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="item-pricing">
                <div className="price-row">
                  <span className="item-price">
                    ${item.variant.price.amount} each
                  </span>
                  {item.variant.compareAtPrice && (
                    <span className="item-compare-price">
                      ${item.variant.compareAtPrice.amount}
                    </span>
                  )}
                </div>
                
                {itemSavings > 0 && (
                  <p className="savings-text">
                    You save ${itemSavings.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="quantity-controls">
                <div className="quantity-section">
                  <button
                    className="quantity-btn decrease"
                    onClick={() => handleQuantityChange(item, -1)}
                    disabled={item.quantity <= 1 || isItemUpdating}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityInput(item, e.target.value)}
                    className="quantity-input"
                    min="1"
                    max="10"
                    disabled={isItemUpdating}
                  />
                  
                  <button
                    className="quantity-btn increase"
                    onClick={() => handleQuantityChange(item, 1)}
                    disabled={item.quantity >= 10 || isItemUpdating}
                    type="button"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-label">Total: </span>
                  <span className="total-amount">${itemTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Availability */}
              {!item.variant.availableForSale && (
                <div className="availability-warning">
                  ⚠️ This item is currently out of stock
                </div>
              )}
            </div>

            {/* Loading Overlay */}
            {isItemUpdating && (
              <div className="loading-overlay">
                <div className="loading-spinner">⟳</div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .cart-item-list {
          display: flex;
          flex-direction: column;
        }
        
        .cart-item {
          position: relative;
          display: flex;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }
        
        .cart-item:last-child {
          border-bottom: none;
        }
        
        .cart-item.updating {
          opacity: 0.7;
          pointer-events: none;
        }
        
        .item-image-container {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f8f8;
        }
        
        .item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        
        .item-title {
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }
        
        .remove-button {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: #f5f5f5;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          color: #666;
          flex-shrink: 0;
        }
        
        .remove-button:hover:not(:disabled) {
          background: #ff4444;
          color: white;
        }
        
        .remove-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .item-vendor {
          font-size: 12px;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .variant-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .variant-option {
          font-size: 12px;
          color: #666;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 10px;
        }
        
        .item-pricing {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .item-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color, #007C3B);
        }
        
        .item-compare-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }
        
        .savings-text {
          font-size: 11px;
          color: #00c851;
          margin: 0;
          font-weight: 500;
        }
        
        .quantity-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }
        
        .quantity-section {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .quantity-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f8f8f8;
          color: #333;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .quantity-btn:hover:not(:disabled) {
          background: #e5e5e5;
        }
        
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity-input {
          width: 40px;
          height: 32px;
          border: none;
          border-left: 1px solid #e5e5e5;
          border-right: 1px solid #e5e5e5;
          background: white;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          outline: none;
        }
        
        .quantity-input::-webkit-outer-spin-button,
        .quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .quantity-input[type=number] {
          -moz-appearance: textfield;
        }
        
        .item-total {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .total-label {
          font-size: 13px;
          color: #666;
        }
        
        .total-amount {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }
        
        .availability-warning {
          font-size: 12px;
          color: #ff4444;
          background: rgba(255, 68, 68, 0.1);
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 68, 68, 0.2);
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .loading-spinner {
          font-size: 20px;
          animation: spin 1s linear infinite;
          color: var(--primary-color, #007C3B);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 375px) {
          .cart-item {
            padding: 12px;
            gap: 10px;
          }
          
          .item-image-container {
            width: 70px;
            height: 70px;
          }
          
          .item-title {
            font-size: 14px;
          }
          
          .quantity-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .item-total {
            justify-content: flex-end;
          }
          
          .quantity-btn {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
          
          .quantity-input {
            width: 35px;
            height: 28px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}