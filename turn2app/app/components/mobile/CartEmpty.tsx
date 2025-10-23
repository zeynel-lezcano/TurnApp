/**
 * Cart Empty State Component - TapCart-Style
 * 
 * Leerer Cart State mit Call-to-Action und Produktempfehlungen
 * für bessere User Retention und Shopping Continuation.
 */

import type { Product } from './types';

interface CartEmptyProps {
  onContinueShopping: () => void;
  recommendedProducts: Product[];
  onProductClick: (product: Product) => void;
}

export function CartEmpty({
  onContinueShopping,
  recommendedProducts,
  onProductClick
}: CartEmptyProps) {

  return (
    <div className="cart-empty">
      {/* Empty State Illustration */}
      <div className="empty-illustration">
        <div className="cart-icon">🛒</div>
        <div className="empty-message">
          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-subtitle">
            Looks like you haven't added anything to your cart yet.
          </p>
        </div>
      </div>

      {/* Primary Action */}
      <div className="empty-actions">
        <button 
          className="continue-shopping-btn"
          onClick={onContinueShopping}
          type="button"
        >
          <span className="btn-icon">🛍️</span>
          <span className="btn-text">Start Shopping</span>
        </button>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h3 className="benefits-title">Why shop with us?</h3>
        <div className="benefits-list">
          <div className="benefit-item">
            <span className="benefit-icon">🚚</span>
            <div className="benefit-content">
              <h4 className="benefit-title">Free Shipping</h4>
              <p className="benefit-description">On orders over $75</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <span className="benefit-icon">↩️</span>
            <div className="benefit-content">
              <h4 className="benefit-title">Easy Returns</h4>
              <p className="benefit-description">30-day return policy</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <div className="benefit-content">
              <h4 className="benefit-title">Secure Payment</h4>
              <p className="benefit-description">Your data is protected</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <span className="benefit-icon">⭐</span>
            <div className="benefit-content">
              <h4 className="benefit-title">Premium Quality</h4>
              <p className="benefit-description">Curated products only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="recommendations-section">
          <h3 className="recommendations-title">Popular products</h3>
          <div className="recommendations-grid">
            {recommendedProducts.map(product => (
              <div 
                key={product.id}
                className="recommendation-card"
                onClick={() => onProductClick(product)}
              >
                <div className="recommendation-image-container">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="recommendation-image"
                  />
                  {product.compareAtPrice && (
                    <div className="discount-badge">
                      SALE
                    </div>
                  )}
                </div>
                
                <div className="recommendation-info">
                  <h4 className="recommendation-title">{product.title}</h4>
                  
                  {product.vendor && (
                    <p className="recommendation-vendor">{product.vendor}</p>
                  )}
                  
                  <div className="recommendation-pricing">
                    <span className="recommendation-price">
                      ${product.price.amount}
                    </span>
                    {product.compareAtPrice && (
                      <span className="recommendation-compare-price">
                        ${product.compareAtPrice.amount}
                      </span>
                    )}
                  </div>
                  
                  {product.rating && (
                    <div className="recommendation-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </span>
                      <span className="rating-count">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-empty {
          max-width: 375px;
          margin: 0 auto;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .empty-illustration {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .cart-icon {
          font-size: 64px;
          opacity: 0.6;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .empty-message {
          max-width: 280px;
        }
        
        .empty-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }
        
        .empty-subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
          line-height: 1.4;
        }
        
        .empty-actions {
          margin-bottom: 40px;
          width: 100%;
        }
        
        .continue-shopping-btn {
          background: var(--primary-color, #007C3B);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 240px;
          margin: 0 auto;
        }
        
        .continue-shopping-btn:hover {
          background: var(--secondary-color, #005c2b);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 124, 59, 0.3);
        }
        
        .continue-shopping-btn:active {
          transform: translateY(0);
        }
        
        .btn-icon {
          font-size: 18px;
        }
        
        .btn-text {
          user-select: none;
        }
        
        .benefits-section {
          margin-bottom: 40px;
          width: 100%;
        }
        
        .benefits-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 20px;
        }
        
        .benefits-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          padding: 16px;
          background: #f8f8f8;
          border-radius: 12px;
        }
        
        .benefit-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .benefit-content {
          flex: 1;
        }
        
        .benefit-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px;
        }
        
        .benefit-description {
          font-size: 12px;
          color: #666;
          margin: 0;
          line-height: 1.3;
        }
        
        .recommendations-section {
          width: 100%;
        }
        
        .recommendations-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 20px;
        }
        
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .recommendation-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .recommendation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .recommendation-image-container {
          position: relative;
          height: 120px;
          background: #f8f8f8;
        }
        
        .recommendation-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff4444;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .recommendation-info {
          padding: 12px;
        }
        
        .recommendation-title {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 4px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .recommendation-vendor {
          font-size: 11px;
          color: #666;
          margin: 0 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .recommendation-pricing {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        
        .recommendation-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color, #007C3B);
        }
        
        .recommendation-compare-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }
        
        .recommendation-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .stars {
          color: #ffa500;
          font-size: 11px;
        }
        
        .rating-count {
          font-size: 10px;
          color: #666;
        }
        
        @media (max-width: 375px) {
          .cart-empty {
            padding: 24px 16px;
          }
          
          .empty-title {
            font-size: 22px;
          }
          
          .benefits-list {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .benefit-item {
            padding: 12px;
          }
          
          .recommendations-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .recommendation-image-container {
            height: 140px;
          }
          
          .continue-shopping-btn {
            font-size: 15px;
            padding: 14px 28px;
          }
        }
      `}</style>
    </div>
  );
}