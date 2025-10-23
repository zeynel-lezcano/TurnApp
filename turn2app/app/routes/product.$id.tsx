/**
 * Product Detail Route - TapCart-Style
 * 
 * Vollständige Produktdetail-Seite mit Image Gallery, Variants Selection,
 * Add to Cart, Product Description und Reviews Placeholder.
 */

import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { ProductImageGallery } from '../components/mobile/ProductImageGallery';
import { ProductVariantSelector } from '../components/mobile/ProductVariantSelector';
import { ProductAddToCart } from '../components/mobile/ProductAddToCart';
import { ProductReviews } from '../components/mobile/ProductReviews';
import { ThemeProvider } from '../components/mobile/ThemeProvider';
import type { ShopConfig, Product, ProductVariant } from '../components/mobile/types';

interface LoaderData {
  shopConfig: ShopConfig;
  product: Product;
  relatedProducts: Product[];
}

export const loader: LoaderFunction = async ({ params }) => {
  const productId = params.id;

  // Mock shop configuration
  const shopConfig: ShopConfig = {
    shopName: 'TurnApp Demo Store',
    branding: {
      primaryColor: '#007C3B',
      brandName: 'TurnApp',
      tagline: 'Your Mobile Shopping Experience'
    },
    currency: 'USD',
    locale: 'en-US'
  };

  // Mock product data with variants
  const mockProduct: Product = {
    id: productId || '1',
    title: 'Wireless Bluetooth Earbuds Premium',
    handle: 'wireless-bluetooth-earbuds-premium',
    description: `
      Experience premium sound quality with our state-of-the-art wireless earbuds. 
      
      **Key Features:**
      • 30-hour battery life with charging case
      • Active noise cancellation
      • IPX7 water resistance
      • Quick charge: 15 minutes = 3 hours playback
      • Premium drivers for crystal-clear audio
      
      **What's Included:**
      • Wireless earbuds (pair)
      • Charging case
      • USB-C charging cable
      • 3 sizes of silicone ear tips
      • Quick start guide
      
      Perfect for commuting, workouts, or just enjoying your favorite music with exceptional clarity.
    `,
    price: { amount: '79.99', currency: 'USD' },
    compareAtPrice: { amount: '99.99', currency: 'USD' },
    availableForSale: true,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600',
        altText: 'Wireless earbuds in case'
      },
      {
        url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
        altText: 'Earbuds close-up'
      },
      {
        url: 'https://images.unsplash.com/photo-1608560451374-63c7e0e86d2d?w=600',
        altText: 'Earbuds being worn'
      },
      {
        url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
        altText: 'Charging case'
      }
    ],
    variants: [
      {
        id: 'variant-1',
        title: 'Black',
        price: { amount: '79.99', currency: 'USD' },
        compareAtPrice: { amount: '99.99', currency: 'USD' },
        availableForSale: true,
        selectedOptions: [
          { name: 'Color', value: 'Black' }
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600',
          altText: 'Black wireless earbuds'
        }
      },
      {
        id: 'variant-2', 
        title: 'White',
        price: { amount: '79.99', currency: 'USD' },
        compareAtPrice: { amount: '99.99', currency: 'USD' },
        availableForSale: true,
        selectedOptions: [
          { name: 'Color', value: 'White' }
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
          altText: 'White wireless earbuds'
        }
      },
      {
        id: 'variant-3',
        title: 'Blue',
        price: { amount: '84.99', currency: 'USD' },
        compareAtPrice: { amount: '104.99', currency: 'USD' },
        availableForSale: false,
        selectedOptions: [
          { name: 'Color', value: 'Blue' }
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
          altText: 'Blue wireless earbuds'
        }
      }
    ],
    vendor: 'TechBrand',
    category: 'Electronics',
    tags: ['wireless', 'audio', 'premium', 'noise-cancelling'],
    rating: 4.5,
    reviewCount: 128
  };

  // Mock related products
  const relatedProducts: Product[] = [
    {
      id: '2',
      title: 'Wireless Phone Charger Pad',
      price: { amount: '39.99', currency: 'USD' },
      compareAtPrice: { amount: '59.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1586953983027-d7508a64f4bb?w=400',
      vendor: 'TechBrand',
      category: 'Electronics',
      rating: 4.4,
      reviewCount: 156
    },
    {
      id: '3',
      title: 'Smart Fitness Watch',
      price: { amount: '199.99', currency: 'USD' },
      compareAtPrice: { amount: '249.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400',
      vendor: 'FitTech',
      category: 'Electronics',
      rating: 4.7,
      reviewCount: 203
    }
  ];

  return json({
    shopConfig,
    product: mockProduct,
    relatedProducts
  });
};

export default function ProductDetailPage() {
  const { shopConfig, product, relatedProducts } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || {
      id: 'default',
      title: 'Default',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      availableForSale: product.availableForSale,
      selectedOptions: []
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // Update active image to variant image if available
    if (variant.image && product.images) {
      const imageIndex = product.images.findIndex(img => img.url === variant.image?.url);
      if (imageIndex !== -1) {
        setActiveImageIndex(imageIndex);
      }
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity
    });
    
    // Show success feedback
    alert(`Added ${quantity}x ${product.title} (${selectedVariant.title}) to cart!`);
  };

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality - redirect to Shopify checkout
    console.log('Buy now:', {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity
    });
    
    // Mock redirect to checkout
    alert('Redirecting to checkout...');
  };

  const currentPrice = selectedVariant.price || product.price;
  const currentCompareAtPrice = selectedVariant.compareAtPrice || product.compareAtPrice;
  const hasDiscount = currentCompareAtPrice && 
    parseFloat(currentCompareAtPrice.amount) > parseFloat(currentPrice.amount);

  return (
    <ThemeProvider shopConfig={shopConfig}>
      <div className="product-detail-page">
        {/* Header */}
        <header className="product-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            ← Back
          </button>
          <button 
            className="share-button"
            type="button"
            aria-label="Share product"
          >
            📤
          </button>
        </header>

        {/* Image Gallery */}
        <ProductImageGallery
          images={product.images || [{ url: product.image || '', altText: product.title }]}
          activeIndex={activeImageIndex}
          onImageChange={setActiveImageIndex}
        />

        {/* Product Info */}
        <div className="product-info">
          {/* Title & Vendor */}
          <div className="product-header-info">
            <h1 className="product-title">{product.title}</h1>
            {product.vendor && (
              <p className="product-vendor">by {product.vendor}</p>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="product-pricing">
            <span className="current-price">
              ${currentPrice.amount} {currentPrice.currency}
            </span>
            {hasDiscount && (
              <>
                <span className="compare-price">
                  ${currentCompareAtPrice!.amount}
                </span>
                <span className="discount-badge">
                  Save {Math.round((1 - parseFloat(currentPrice.amount) / parseFloat(currentCompareAtPrice!.amount)) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />
          )}

          {/* Add to Cart */}
          <ProductAddToCart
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          {/* Description */}
          {product.description && (
            <div className="product-description">
              <h3 className="section-title">Description</h3>
              <div className="description-content">
                {product.description.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="description-paragraph">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ProductReviews
            rating={product.rating}
            reviewCount={product.reviewCount}
            productId={product.id}
          />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h3 className="section-title">You might also like</h3>
              <div className="related-grid">
                {relatedProducts.map(relatedProduct => (
                  <div 
                    key={relatedProduct.id}
                    className="related-item"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.title}
                      className="related-image"
                    />
                    <h4 className="related-title">{relatedProduct.title}</h4>
                    <p className="related-price">${relatedProduct.price.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .product-detail-page {
            min-height: 100vh;
            background: #f8f8f8;
            padding-bottom: 80px; /* Space for bottom tabs */
          }
          
          .product-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .back-button,
          .share-button {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            background: #f5f5f5;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 16px;
          }
          
          .back-button:hover,
          .share-button:hover {
            background: #e5e5e5;
          }
          
          .product-info {
            background: white;
            margin-top: -20px;
            border-radius: 20px 20px 0 0;
            padding: 24px 20px;
            position: relative;
            z-index: 10;
          }
          
          .product-header-info {
            margin-bottom: 12px;
          }
          
          .product-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 8px;
            line-height: 1.2;
          }
          
          .product-vendor {
            font-size: 14px;
            color: #666;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
          }
          
          .product-rating {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .stars {
            color: #ffa500;
            font-size: 16px;
          }
          
          .rating-text {
            font-size: 14px;
            color: #666;
          }
          
          .product-pricing {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }
          
          .current-price {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary-color, #007C3B);
          }
          
          .compare-price {
            font-size: 20px;
            color: #999;
            text-decoration: line-through;
          }
          
          .discount-badge {
            background: #ff4444;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 16px;
          }
          
          .product-description {
            margin: 32px 0;
            padding-top: 24px;
            border-top: 1px solid #e5e5e5;
          }
          
          .description-content {
            line-height: 1.6;
          }
          
          .description-paragraph {
            margin: 0 0 12px;
            color: #333;
            font-size: 15px;
          }
          
          .related-products {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e5e5;
          }
          
          .related-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .related-item {
            background: #f8f8f8;
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .related-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .related-image {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          
          .related-title {
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
          
          .related-price {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color, #007C3B);
            margin: 0;
          }
          
          @media (max-width: 375px) {
            .product-info {
              padding: 20px 16px;
            }
            
            .product-title {
              font-size: 22px;
            }
            
            .current-price {
              font-size: 26px;
            }
            
            .related-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}