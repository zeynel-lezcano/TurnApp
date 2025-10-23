/**
 * Cart Summary Component - TapCart-Style
 * 
 * Checkout Summary mit Subtotal, Shipping, Tax Calculation
 * und Prominent Checkout Button für Mobile Commerce.
 */

interface CartSummaryProps {
  subtotal: number;
  savings: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartSummary({
  subtotal,
  savings,
  shipping,
  tax,
  total,
  currency,
  onCheckout,
  onContinueShopping
}: CartSummaryProps) {

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const isFreeShipping = shipping === 0;
  const freeShippingThreshold = 75;
  const amountForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="cart-summary">
      {/* Summary Header */}
      <div className="summary-header">
        <h3 className="summary-title">Order Summary</h3>
      </div>

      {/* Order Details */}
      <div className="summary-details">
        {/* Subtotal */}
        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-value">{formatCurrency(subtotal)}</span>
        </div>

        {/* Savings */}
        {savings > 0 && (
          <div className="summary-row savings">
            <span className="summary-label">You Save</span>
            <span className="summary-value savings-amount">
              -{formatCurrency(savings)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="summary-row">
          <div className="shipping-info">
            <span className="summary-label">Shipping</span>
            {!isFreeShipping && amountForFreeShipping > 0 && (
              <span className="free-shipping-tip">
                Add {formatCurrency(amountForFreeShipping)} for free shipping
              </span>
            )}
          </div>
          <span className={`summary-value ${isFreeShipping ? 'free' : ''}`}>
            {isFreeShipping ? 'FREE' : formatCurrency(shipping)}
          </span>
        </div>

        {/* Tax */}
        <div className="summary-row">
          <span className="summary-label">Tax (8%)</span>
          <span className="summary-value">{formatCurrency(tax)}</span>
        </div>

        {/* Divider */}
        <div className="summary-divider" />

        {/* Total */}
        <div className="summary-row total">
          <span className="summary-label">Total</span>
          <span className="summary-value">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="promo-section">
        <div className="promo-input-container">
          <input
            type="text"
            placeholder="Promo code"
            className="promo-input"
          />
          <button className="promo-apply-btn" type="button">
            Apply
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="checkout-btn"
          onClick={onCheckout}
          type="button"
        >
          <span className="checkout-icon">🔒</span>
          <span className="checkout-text">Secure Checkout</span>
          <span className="checkout-amount">{formatCurrency(total)}</span>
        </button>

        <button 
          className="continue-shopping-btn"
          onClick={onContinueShopping}
          type="button"
        >
          Continue Shopping
        </button>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <p className="payment-label">We accept:</p>
        <div className="payment-icons">
          <span className="payment-icon">💳</span>
          <span className="payment-icon">🍎</span>
          <span className="payment-icon">📱</span>
          <span className="payment-icon">🎯</span>
        </div>
      </div>

      {/* Security Info */}
      <div className="security-info">
        <div className="security-item">
          <span className="security-icon">🔒</span>
          <span className="security-text">SSL secured checkout</span>
        </div>
        <div className="security-item">
          <span className="security-icon">↩️</span>
          <span className="security-text">30-day return policy</span>
        </div>
      </div>

      <style jsx>{`
        .cart-summary {
          padding: 20px;
        }
        
        .summary-header {
          margin-bottom: 16px;
        }
        
        .summary-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }
        
        .summary-details {
          margin-bottom: 20px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }
        
        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0;
        }
        
        .summary-row.savings {
          color: #00c851;
        }
        
        .summary-label {
          font-size: 14px;
          color: #666;
          flex: 1;
        }
        
        .summary-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-align: right;
        }
        
        .summary-value.free {
          color: #00c851;
          font-weight: 600;
        }
        
        .savings-amount {
          color: #00c851;
        }
        
        .shipping-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        
        .free-shipping-tip {
          font-size: 11px;
          color: #007C3B;
          font-weight: 500;
        }
        
        .summary-divider {
          height: 1px;
          background: #e5e5e5;
          margin: 16px 0;
        }
        
        .promo-section {
          margin-bottom: 20px;
        }
        
        .promo-input-container {
          display: flex;
          gap: 8px;
        }
        
        .promo-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .promo-input:focus {
          border-color: var(--primary-color, #007C3B);
        }
        
        .promo-apply-btn {
          padding: 10px 16px;
          background: #f5f5f5;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .promo-apply-btn:hover {
          background: #e5e5e5;
          border-color: var(--primary-color, #007C3B);
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .checkout-btn {
          background: var(--primary-color, #007C3B);
          color: white;
          border: none;
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 56px;
          position: relative;
        }
        
        .checkout-btn:hover {
          background: var(--secondary-color, #005c2b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 124, 59, 0.3);
        }
        
        .checkout-btn:active {
          transform: translateY(0);
        }
        
        .checkout-icon {
          font-size: 16px;
        }
        
        .checkout-text {
          flex: 1;
        }
        
        .checkout-amount {
          font-size: 18px;
          font-weight: 700;
        }
        
        .continue-shopping-btn {
          background: none;
          color: var(--primary-color, #007C3B);
          border: 2px solid #e5e5e5;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .continue-shopping-btn:hover {
          border-color: var(--primary-color, #007C3B);
          background: rgba(0, 124, 59, 0.05);
        }
        
        .payment-methods {
          margin-bottom: 16px;
          text-align: center;
        }
        
        .payment-label {
          font-size: 12px;
          color: #666;
          margin: 0 0 8px;
        }
        
        .payment-icons {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        
        .payment-icon {
          font-size: 18px;
          padding: 4px;
          background: #f8f8f8;
          border-radius: 6px;
          border: 1px solid #e5e5e5;
        }
        
        .security-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .security-item {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        
        .security-icon {
          font-size: 12px;
        }
        
        .security-text {
          font-size: 11px;
          color: #666;
        }
        
        @media (max-width: 375px) {
          .cart-summary {
            padding: 16px;
          }
          
          .checkout-btn {
            padding: 14px 16px;
            font-size: 15px;
            min-height: 48px;
          }
          
          .checkout-amount {
            font-size: 16px;
          }
          
          .continue-shopping-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .summary-row.total {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}