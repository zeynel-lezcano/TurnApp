/**
 * Product Catalog Grid Component - TapCart-Style
 * 
 * Responsive Grid/List-Ansicht für Produktkatalog mit optimierter Performance
 * für mobile Geräte und Touch-Interaktionen.
 */

import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import type { Product } from './types';

interface ProductCatalogGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  onProductPress: (product: Product) => void;
  showQuickAdd?: boolean;
  showWishlist?: boolean;
}

export function ProductCatalogGrid({
  products,
  viewMode,
  onProductPress,
  showQuickAdd = true,
  showWishlist = true
}: ProductCatalogGridProps) {

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">No products found</h3>
        <p className="empty-description">
          Try adjusting your search or filters
        </p>
        
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 64px 24px;
            color: #666;
          }
          
          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          .empty-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px;
            color: #1a1a1a;
          }
          
          .empty-description {
            font-size: 16px;
            margin: 0;
            line-height: 1.4;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`catalog-grid ${viewMode}`}>
      {viewMode === 'grid' ? (
        // Grid Layout
        <div className="grid-container">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={onProductPress}
              showQuickAdd={showQuickAdd}
              showWishlist={showWishlist}
            />
          ))}
        </div>
      ) : (
        // List Layout
        <div className="list-container">
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onPress={onProductPress}
              showQuickAdd={showQuickAdd}
              showWishlist={showWishlist}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .catalog-grid {
          width: 100%;
        }
        
        /* Grid Layout */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        
        /* List Layout */
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        
        /* Single column on very small screens */
        @media (max-width: 320px) {
          .grid-container {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        
        /* Larger screens - 3 columns */
        @media (min-width: 480px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        
        /* Animation for view mode changes */
        .catalog-grid {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}