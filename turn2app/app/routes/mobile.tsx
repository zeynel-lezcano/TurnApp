/**
 * Mobile App Preview Route - TapCart-Inspired Home Screen
 * 
 * Diese Route rendert eine vollständige Mobile App Simulation mit TapCart-ähnlicher UX.
 * Sie konsumiert die Shop-Konfiguration via /api/config und zeigt eine native-ähnliche
 * Mobile Shopping Experience.
 * 
 * FEATURES:
 * - Hero Banner mit Shop Branding
 * - Featured Collections Carousel  
 * - Quick Actions (Categories, Search)
 * - Product Grid mit Infinite Scroll
 * - Mobile-First Responsive Design
 * 
 * URL: /mobile?shop=demo.myshopify.com
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';

// Type Definitions
interface ShopConfig {
  shop: string;
  branding: {
    brandName: string;
    primaryColor: string;
    logoUrl: string;
    tagline: string;
  };
  storefrontEndpoint: string;
  appVersion: string;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: {
    amount: string;
    currency: string;
  };
}

export const meta: MetaFunction = () => [
  { title: "TurnApp Mobile Preview" },
  { name: "viewport", content: "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" },
  { name: "description", content: "Mobile shopping experience powered by TurnApp" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop') || 'demo.myshopify.com';
  
  try {
    // Fetch shop configuration
    const configResponse = await fetch(`${url.origin}/api/config?shop=${shop}`);
    const config = configResponse.ok ? await configResponse.json() : null;
    
    // Fetch featured products
    const productsResponse = await fetch(`${url.origin}/api/products?shop=${shop}&first=12`);
    const productsData = productsResponse.ok ? await productsResponse.json() : { products: [] };
    
    return json({
      config,
      products: productsData.products || [],
      shop,
      baseUrl: url.origin
    });
  } catch (error) {
    console.error('Mobile preview loader error:', error);
    return json({
      config: null,
      products: [],
      shop,
      baseUrl: url.origin
    });
  }
}

export default function MobilePreview() {
  const { config, products, shop } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  // Fallback configuration
  const defaultConfig: ShopConfig = {
    shop,
    branding: {
      brandName: shop.split('.')[0] || 'Demo Store',
      primaryColor: '#007C3B',
      logoUrl: '',
      tagline: 'Your mobile shopping experience'
    },
    storefrontEndpoint: `https://${shop}/api/2024-01/graphql.json`,
    appVersion: '1.0.0'
  };
  
  const shopConfig = config || defaultConfig;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="mobile-app">
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary-color: ${shopConfig.branding.primaryColor};
            --primary-rgb: ${hexToRgb(shopConfig.branding.primaryColor)};
          }
          
          .mobile-app {
            max-width: 375px;
            margin: 0 auto;
            background: #ffffff;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          /* Header */
          .mobile-header {
            background: white;
            padding: 12px 16px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .logo {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
          }
          
          .brand-name {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
          .header-actions {
            display: flex;
            gap: 12px;
          }
          
          .icon-button {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            background: #f5f5f5;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .icon-button:hover {
            background: #e5e5e5;
          }
          
          .cart-badge {
            position: relative;
          }
          
          .cart-badge::after {
            content: '2';
            position: absolute;
            top: -4px;
            right: -4px;
            background: #ff4444;
            color: white;
            border-radius: 10px;
            width: 18px;
            height: 18px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }
          
          /* Search Bar */
          .search-container {
            position: relative;
          }
          
          .search-bar {
            width: 100%;
            padding: 12px 16px 12px 44px;
            border-radius: 24px;
            border: 2px solid #f0f0f0;
            background: #f8f8f8;
            font-size: 16px;
            transition: all 0.2s;
          }
          
          .search-bar:focus {
            outline: none;
            border-color: var(--primary-color);
            background: white;
          }
          
          .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
          }
          
          /* Hero Section */
          .hero-section {
            padding: 20px 16px;
            background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-rgb), 0.8));
            color: white;
            text-align: center;
          }
          
          .hero-content h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px;
          }
          
          .hero-content p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0 0 20px;
          }
          
          .hero-cta {
            background: white;
            color: var(--primary-color);
            padding: 12px 24px;
            border-radius: 24px;
            border: none;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .hero-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          /* Quick Actions */
          .quick-actions {
            padding: 20px 16px;
            background: white;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 16px;
            color: #1a1a1a;
          }
          
          .actions-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          
          .action-item {
            text-align: center;
            padding: 16px 8px;
            border-radius: 12px;
            background: #f8f8f8;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }
          
          .action-item:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
          }
          
          .action-icon {
            width: 48px;
            height: 48px;
            border-radius: 24px;
            background: var(--primary-color);
            margin: 0 auto 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          }
          
          .action-label {
            font-size: 14px;
            font-weight: 500;
            color: #333;
          }
          
          /* Product Grid */
          .products-section {
            padding: 20px 16px;
            background: #fafafa;
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .product-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.2s;
            cursor: pointer;
          }
          
          .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
          
          .product-image {
            width: 100%;
            height: 160px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #999;
          }
          
          .product-info {
            padding: 12px;
          }
          
          .product-title {
            font-size: 14px;
            font-weight: 500;
            color: #1a1a1a;
            margin: 0 0 4px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .product-price {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-color);
            margin: 0;
          }
          
          /* Loading States */
          .loading {
            text-align: center;
            padding: 40px 20px;
            color: #999;
          }
          
          .error {
            text-align: center;
            padding: 40px 20px;
            color: #ff4444;
          }
          
          /* Mobile Bottom Navigation */
          .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 375px;
            background: white;
            border-top: 1px solid #e5e5e5;
            display: flex;
            justify-content: space-around;
            padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
            z-index: 100;
          }
          
          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: none;
            color: #999;
          }
          
          .nav-item.active {
            color: var(--primary-color);
          }
          
          .nav-icon {
            font-size: 20px;
            margin-bottom: 4px;
          }
          
          .nav-label {
            font-size: 12px;
            font-weight: 500;
          }
          
          @media (max-width: 375px) {
            .mobile-app {
              max-width: 100%;
            }
            
            .bottom-nav {
              max-width: 100%;
            }
          }
        `
      }} />

      {/* Header */}
      <header className="mobile-header">
        <div className="header-top">
          <div className="logo-section">
            {shopConfig.branding.logoUrl ? (
              <img src={shopConfig.branding.logoUrl} alt="Logo" className="logo" />
            ) : (
              <div className="logo">
                {shopConfig.branding.brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="brand-name">{shopConfig.branding.brandName}</h1>
          </div>
          
          <div className="header-actions">
            <button className="icon-button">
              <span>🔔</span>
            </button>
            <button className="icon-button cart-badge">
              <span>🛒</span>
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to {shopConfig.branding.brandName}</h1>
          <p>{shopConfig.branding.tagline}</p>
          <button className="hero-cta">Shop Now</button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Shop by Category</h2>
        <div className="actions-grid">
          <button className="action-item">
            <div className="action-icon">👔</div>
            <div className="action-label">Clothing</div>
          </button>
          <button className="action-item">
            <div className="action-icon">👟</div>
            <div className="action-label">Shoes</div>
          </button>
          <button className="action-item">
            <div className="action-icon">💎</div>
            <div className="action-label">Jewelry</div>
          </button>
          <button className="action-item">
            <div className="action-icon">🎁</div>
            <div className="action-label">Gifts</div>
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>
        
        {products.length > 0 ? (
          <div className="products-grid">
            {products.slice(0, 8).map((product: Product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.title} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-price">
                    ${product.price.amount} {product.price.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="loading">
            <p>Loading products...</p>
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">📋</span>
          <span className="nav-label">Categories</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Search</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Cart</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Account</span>
        </button>
      </nav>

      {/* Bottom padding for fixed nav */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 124, 59'; // fallback to Shopify green
}