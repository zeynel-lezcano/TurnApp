/**
 * Product Add to Cart Component - TapCart-Style
 * 
 * Quantity Selector, Add to Cart und Buy Now Buttons mit Stock-Status
 * und responsive Mobile-optimierte Interaktionen.
 */

import { useState } from 'react';
import type { Product, ProductVariant } from './types';

interface ProductAddToCartProps {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductAddToCart({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow
}: ProductAddToCartProps) {
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const isAvailable = selectedVariant.availableForSale;
  const maxQuantity = 10; // Could be dynamic based on inventory

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleQuantityInput = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuantity) {
      onQuantityChange(numValue);
    }
  };

  const handleAddToCart = async () => {
    if (!isAvailable || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart();
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAvailable || isBuyingNow) return;
    
    setIsBuyingNow(true);
    try {
      await onBuyNow();
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="add-to-cart-section">
      {/* Quantity Selector */}
      <div className="quantity-section">
        <label className="quantity-label">Quantity</label>
        <div className="quantity-controls">
          <button
            className="quantity-btn decrease"
            onClick={handleQuantityDecrease}
            disabled={quantity <= 1}
            type="button"
            aria-label="Decrease quantity"
          >
            −
          </button>
          
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityInput(e.target.value)}
            className="quantity-input"
            min="1"
            max={maxQuantity}
            disabled={!isAvailable}
          />
          
          <button
            className="quantity-btn increase"
            onClick={handleQuantityIncrease}
            disabled={quantity >= maxQuantity}
            type="button"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Stock Status */}
      <div className="stock-status">
        {isAvailable ? (
          <span className="in-stock">✓ In Stock</span>
        ) : (
          <span className="out-of-stock">✕ Out of Stock</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {/* Add to Cart Button */}
        <button
          className={`add-to-cart-btn ${!isAvailable ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={!isAvailable || isAddingToCart}
          type="button"
        >
          {isAddingToCart ? (
            <span className="loading-spinner">⟳</span>
          ) : (
            '🛒'
          )}
          <span className="button-text">
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </span>
        </button>

        {/* Buy Now Button */}
        <button
          className={`buy-now-btn ${!isAvailable ? 'disabled' : ''}`}
          onClick={handleBuyNow}
          disabled={!isAvailable || isBuyingNow}
          type="button"
        >
          {isBuyingNow ? (
            <span className="loading-spinner">⟳</span>
          ) : (
            '⚡'
          )}
          <span className="button-text">
            {isBuyingNow ? 'Processing...' : 'Buy Now'}
          </span>
        </button>
      </div>

      {/* Shipping Info */}
      <div className="shipping-info">
        <div className="shipping-item">
          <span className="shipping-icon">🚚</span>
          <span className="shipping-text">Free shipping on orders over $75</span>
        </div>
        <div className="shipping-item">
          <span className="shipping-icon">↩️</span>
          <span className="shipping-text">30-day return policy</span>
        </div>
        <div className="shipping-item">
          <span className="shipping-icon">🔒</span>
          <span className="shipping-text">Secure checkout guaranteed</span>
        </div>
      </div>

      <style jsx>{`
        .add-to-cart-section {
          margin: 24px 0;
          padding: 24px 0;
          border-top: 1px solid #e5e5e5;
        }
        
        .quantity-section {
          margin-bottom: 16px;
        }
        
        .quantity-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0;
          width: fit-content;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .quantity-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: #f8f8f8;
          color: #333;
          font-size: 18px;
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
          width: 60px;
          height: 44px;
          border: none;
          border-left: 1px solid #e5e5e5;
          border-right: 1px solid #e5e5e5;
          background: white;
          text-align: center;
          font-size: 16px;
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
        
        .stock-status {
          margin-bottom: 20px;
        }
        
        .in-stock {
          color: #00c851;
          font-size: 14px;
          font-weight: 500;
        }
        
        .out-of-stock {
          color: #ff4444;
          font-size: 14px;
          font-weight: 500;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .add-to-cart-btn,
        .buy-now-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 56px;
        }
        
        .add-to-cart-btn {
          background: #f5f5f5;
          color: #1a1a1a;
          border: 2px solid #e5e5e5;
        }
        
        .add-to-cart-btn:hover:not(:disabled) {
          background: #e5e5e5;
          border-color: var(--primary-color, #007C3B);
        }
        
        .buy-now-btn {
          background: var(--primary-color, #007C3B);
          color: white;
        }
        
        .buy-now-btn:hover:not(:disabled) {
          background: var(--secondary-color, #005c2b);
          transform: translateY(-1px);
        }
        
        .add-to-cart-btn:active,
        .buy-now-btn:active {
          transform: translateY(0);
        }
        
        .add-to-cart-btn.disabled,
        .buy-now-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .button-text {
          user-select: none;
        }
        
        .shipping-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #f8f8f8;
          border-radius: 12px;
        }
        
        .shipping-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .shipping-icon {
          font-size: 14px;
          width: 16px;
          text-align: center;
        }
        
        .shipping-text {
          font-size: 13px;
          color: #666;
          line-height: 1.3;
        }
        
        @media (max-width: 375px) {
          .action-buttons {
            flex-direction: column;
            gap: 8px;
          }
          
          .add-to-cart-btn,
          .buy-now-btn {
            font-size: 15px;
            padding: 14px 16px;
            min-height: 48px;
          }
          
          .quantity-btn {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .quantity-input {
            width: 50px;
            height: 40px;
            font-size: 15px;
          }
          
          .shipping-info {
            padding: 12px;
          }
          
          .shipping-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}