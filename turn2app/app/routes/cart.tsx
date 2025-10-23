/**
 * Shopping Cart Route - TapCart-Style
 * 
 * Vollständige Shopping Cart Seite mit Item-Management, Quantity Updates,
 * Subtotal Calculation und Checkout Integration zu Shopify.
 */

import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { CartItemList } from '../components/mobile/CartItemList';
import { CartSummary } from '../components/mobile/CartSummary';
import { CartEmpty } from '../components/mobile/CartEmpty';
import { ThemeProvider } from '../components/mobile/ThemeProvider';
import type { ShopConfig, CartItem, Product } from '../components/mobile/types';

interface LoaderData {
  shopConfig: ShopConfig;
  cartItems: CartItem[];
  recommendedProducts: Product[];
}

export const loader: LoaderFunction = async ({ request }) => {
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

  // Mock cart items - in real app, this would come from session/API
  const mockCartItems: CartItem[] = [
    {
      id: 'cart-item-1',
      productId: '1',
      variantId: 'variant-1',
      quantity: 2,
      product: {
        id: '1',
        title: 'Wireless Bluetooth Earbuds Premium',
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
        price: { amount: '79.99', currency: 'USD' },
        compareAtPrice: { amount: '99.99', currency: 'USD' },
        availableForSale: true,
        vendor: 'TechBrand',
        category: 'Electronics'
      },
      variant: {
        id: 'variant-1',
        title: 'Black',
        price: { amount: '79.99', currency: 'USD' },
        compareAtPrice: { amount: '99.99', currency: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Color', value: 'Black' }]
      }
    },
    {
      id: 'cart-item-2',
      productId: '6',
      variantId: 'variant-6',
      quantity: 1,
      product: {
        id: '6',
        title: 'Wireless Phone Charger Pad',
        image: 'https://images.unsplash.com/photo-1586953983027-d7508a64f4bb?w=400',
        price: { amount: '39.99', currency: 'USD' },
        compareAtPrice: { amount: '59.99', currency: 'USD' },
        availableForSale: true,
        vendor: 'TechBrand',
        category: 'Electronics'
      },
      variant: {
        id: 'variant-6',
        title: 'Default',
        price: { amount: '39.99', currency: 'USD' },
        compareAtPrice: { amount: '59.99', currency: 'USD' },
        availableForSale: true,
        selectedOptions: []
      }
    }
  ];

  // Mock recommended products
  const recommendedProducts: Product[] = [
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
    },
    {
      id: '5',
      title: 'Ceramic Coffee Mug Set',
      price: { amount: '34.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
      vendor: 'HomeCraft',
      category: 'Home & Kitchen',
      rating: 4.1,
      reviewCount: 45
    }
  ];

  return json({
    shopConfig,
    cartItems: mockCartItems,
    recommendedProducts
  });
};

export default function CartPage() {
  const { shopConfig, cartItems: initialCartItems, recommendedProducts } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    
    setIsUpdating(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setIsUpdating(null);
  };

  const handleCheckout = () => {
    // TODO: Implement Shopify checkout redirect
    console.log('Proceeding to checkout with items:', cartItems);
    
    // Mock checkout URL generation
    const checkoutUrl = `https://your-shop.myshopify.com/cart/${cartItems.map(item => 
      `${item.variantId}:${item.quantity}`
    ).join(',')}`;
    
    // In real app, redirect to Shopify checkout
    alert(`Redirecting to Shopify checkout...\nURL: ${checkoutUrl}`);
  };

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleProductRecommendationClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  if (cartItems.length === 0) {
    return (
      <ThemeProvider shopConfig={shopConfig}>
        <div className="cart-page">
          <header className="cart-header">
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
              type="button"
              aria-label="Go back"
            >
              ← Back
            </button>
            <h1 className="page-title">Shopping Cart</h1>
          </header>

          <CartEmpty 
            onContinueShopping={handleContinueShopping}
            recommendedProducts={recommendedProducts}
            onProductClick={handleProductRecommendationClick}
          />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider shopConfig={shopConfig}>
      <div className="cart-page">
        {/* Header */}
        <header className="cart-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="page-title">
            Shopping Cart ({cartItems.length})
          </h1>
        </header>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <CartItemList
              items={cartItems}
              onQuantityUpdate={handleQuantityUpdate}
              onRemoveItem={handleRemoveItem}
              isUpdating={isUpdating}
            />
          </div>

          {/* Cart Summary */}
          <div className="cart-summary-section">
            <CartSummary
              subtotal={subtotal}
              savings={totalSavings}
              shipping={shipping}
              tax={tax}
              total={total}
              currency="USD"
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
            />
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="recommendations-section">
              <h3 className="recommendations-title">You might also like</h3>
              <div className="recommendations-grid">
                {recommendedProducts.map(product => (
                  <div 
                    key={product.id}
                    className="recommendation-item"
                    onClick={() => handleProductRecommendationClick(product)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="recommendation-image"
                    />
                    <div className="recommendation-info">
                      <h4 className="recommendation-title">{product.title}</h4>
                      <div className="recommendation-pricing">
                        <span className="recommendation-price">${product.price.amount}</span>
                        {product.compareAtPrice && (
                          <span className="recommendation-compare-price">
                            ${product.compareAtPrice.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .cart-page {
            min-height: 100vh;
            background: #f8f8f8;
            padding-bottom: 80px; /* Space for bottom tabs */
          }
          
          .cart-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .back-button {
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
            flex-shrink: 0;
          }
          
          .back-button:hover {
            background: #e5e5e5;
          }
          
          .page-title {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }
          
          .cart-content {
            max-width: 375px;
            margin: 0 auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .cart-items-section {
            background: white;
            border-radius: 12px;
            overflow: hidden;
          }
          
          .cart-summary-section {
            background: white;
            border-radius: 12px;
            overflow: hidden;
          }
          
          .recommendations-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
          }
          
          .recommendations-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 16px;
          }
          
          .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .recommendation-item {
            background: #f8f8f8;
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .recommendation-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .recommendation-image {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          
          .recommendation-info {
            text-align: left;
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
          
          .recommendation-pricing {
            display: flex;
            align-items: center;
            gap: 6px;
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
          
          @media (max-width: 375px) {
            .cart-content {
              padding: 12px;
            }
            
            .page-title {
              font-size: 18px;
            }
            
            .recommendations-grid {
              grid-template-columns: 1fr;
              gap: 8px;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}