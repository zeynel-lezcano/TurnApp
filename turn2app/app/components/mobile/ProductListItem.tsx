/**
 * Product List Item Component - TapCart-Style
 * 
 * Horizontales Layout für Listen-Ansicht mit kompakter Darstellung
 * optimiert für mobile Scroll-Performance.
 */

import type { ProductCardProps } from './types';

export function ProductListItem({ 
  product, 
  onPress, 
  showQuickAdd = false,
  showWishlist = false 
}: ProductCardProps) {
  
  const hasDiscount = product.compareAtPrice && 
    parseFloat(product.compareAtPrice.amount) > parseFloat(product.price.amount);
  
  const discountPercentage = hasDiscount 
    ? Math.round((1 - parseFloat(product.price.amount) / parseFloat(product.compareAtPrice!.amount)) * 100)
    : 0;

  const handlePress = () => {
    onPress(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Quick add:', product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle wishlist:', product.id);
  };

  return (
    <div className="product-list-item" onClick={handlePress}>
      {/* Product Image */}
      <div className="product-image-container">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            📦
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="discount-badge">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-main-info">
          <h3 className="product-title">
            {product.title}
          </h3>
          
          {/* Vendor/Brand */}
          {product.vendor && (
            <p className="product-vendor">
              {product.vendor}
            </p>
          )}
          
          {/* Rating */}
          {product.rating && (
            <div className="product-rating">
              <span className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </span>
              <span className="rating-text">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
        
        <div className="product-actions">
          {/* Pricing */}
          <div className="product-pricing">
            <span className="product-price">
              ${product.price.amount}
            </span>
            
            {hasDiscount && (
              <span className="product-compare-price">
                ${product.compareAtPrice!.amount}
              </span>
            )}
          </div>
          
          {/* Availability */}
          {!product.availableForSale ? (
            <p className="product-unavailable">
              Out of Stock
            </p>
          ) : (
            <div className="action-buttons">
              {/* Wishlist Button */}
              {showWishlist && (
                <button 
                  className="wishlist-button"
                  onClick={handleWishlist}
                  type="button"
                  aria-label="Add to wishlist"
                >
                  🤍
                </button>
              )}
              
              {/* Quick Add Button */}
              {showQuickAdd && (
                <button 
                  className="quick-add-button"
                  onClick={handleQuickAdd}
                  type="button"
                  aria-label="Quick add to cart"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }
        
        .product-list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .product-list-item:active {
          transform: translateY(0);
        }
        
        .product-image-container {
          position: relative;
          width: 80px;
          height: 80px;
          background: #f8f8f8;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .product-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #ccc;
        }
        
        .discount-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #ff4444;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          z-index: 2;
        }
        
        .product-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          min-height: 80px;
        }
        
        .product-main-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .product-title {
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-vendor {
          font-size: 12px;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }
        
        .stars {
          color: #ffa500;
          font-size: 12px;
          line-height: 1;
        }
        
        .rating-text {
          font-size: 11px;
          color: #666;
        }
        
        .product-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          min-height: 80px;
        }
        
        .product-pricing {
          text-align: right;
        }
        
        .product-price {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-color, #007C3B);
          display: block;
        }
        
        .product-compare-price {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
          display: block;
          margin-top: 2px;
        }
        
        .product-unavailable {
          font-size: 11px;
          color: #ff4444;
          margin: 0;
          font-weight: 500;
          text-align: right;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .wishlist-button {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          background: #f5f5f5;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }
        
        .wishlist-button:hover {
          background: #e5e5e5;
          transform: scale(1.1);
        }
        
        .quick-add-button {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          background: var(--primary-color, #007C3B);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .quick-add-button:hover {
          background: var(--secondary-color, #005c2b);
          transform: scale(1.1);
        }
        
        /* Mobile optimizations */
        @media (max-width: 375px) {
          .product-list-item {
            padding: 10px;
            gap: 10px;
          }
          
          .product-image-container {
            width: 70px;
            height: 70px;
          }
          
          .product-title {
            font-size: 14px;
          }
          
          .product-price {
            font-size: 15px;
          }
          
          .action-buttons {
            gap: 6px;
          }
          
          .wishlist-button,
          .quick-add-button {
            width: 24px;
            height: 24px;
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
}