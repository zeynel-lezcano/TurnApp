/**
 * Product Card Component - TapCart-Style
 * 
 * Responsive Produkt-Karte für Grid-Display mit TapCart-ähnlicher UX.
 * Optimiert für Touch-Interaktion und Mobile-Performance.
 */

import type { ProductCardProps } from './types';

export function ProductCard({ 
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
    // TODO: Implement quick add to cart
    console.log('Quick add:', product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement wishlist toggle
    console.log('Toggle wishlist:', product.id);
  };

  return (
    <div className="product-card" onClick={handlePress}>
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
        {showQuickAdd && product.availableForSale && (
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

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">
          {product.title}
        </h3>
        
        <div className="product-pricing">
          <span className="product-price">
            ${product.price.amount} {product.price.currency}
          </span>
          
          {hasDiscount && (
            <span className="product-compare-price">
              ${product.compareAtPrice!.amount}
            </span>
          )}
        </div>
        
        {/* Vendor/Brand */}
        {product.vendor && (
          <p className="product-vendor">
            {product.vendor}
          </p>
        )}
        
        {/* Availability */}
        {!product.availableForSale && (
          <p className="product-unavailable">
            Out of Stock
          </p>
        )}
      </div>

      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }
        
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .product-card:active {
          transform: translateY(-2px);
        }
        
        .product-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          background: #f8f8f8;
          overflow: hidden;
        }
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        
        .product-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: #ccc;
        }
        
        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff4444;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }
        
        .wishlist-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
        }
        
        .wishlist-button:hover {
          background: white;
          transform: scale(1.1);
        }
        
        .quick-add-button {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: var(--primary-color, #007C3B);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
          opacity: 0;
          transform: translateY(4px);
        }
        
        .product-card:hover .quick-add-button {
          opacity: 1;
          transform: translateY(0);
        }
        
        .quick-add-button:hover {
          transform: scale(1.1);
        }
        
        .product-info {
          padding: 12px;
        }
        
        .product-title {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 8px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-pricing {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .product-price {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-color, #007C3B);
        }
        
        .product-compare-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }
        
        .product-vendor {
          font-size: 12px;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .product-unavailable {
          font-size: 12px;
          color: #ff4444;
          margin: 4px 0 0;
          font-weight: 500;
        }
        
        @media (max-width: 375px) {
          .product-image-container {
            height: 160px;
          }
          
          .product-info {
            padding: 10px;
          }
          
          .product-title {
            font-size: 13px;
          }
          
          .product-price {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}