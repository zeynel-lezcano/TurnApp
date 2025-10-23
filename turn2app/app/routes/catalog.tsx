/**
 * Product Catalog Route - TapCart-Style
 * 
 * Vollständige Katalog-Ansicht mit Grid/List-Toggle, Filtern, Sortierung
 * und responsivem Design für mobile E-Commerce Experience.
 */

import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { ProductCatalogGrid } from '../components/mobile/ProductCatalogGrid';
import { FilterSidebar } from '../components/mobile/FilterSidebar';
import { SearchBar } from '../components/mobile/SearchBar';
import { ThemeProvider } from '../components/mobile/ThemeProvider';
import type { ShopConfig, Product, SearchFilters } from '../components/mobile/types';

interface LoaderData {
  shopConfig: ShopConfig;
  products: Product[];
  totalProducts: number;
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
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

  // Mock products with varied data for filtering/sorting
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Wireless Bluetooth Earbuds Premium',
      price: { amount: '79.99', currency: 'USD' },
      compareAtPrice: { amount: '99.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
      vendor: 'TechBrand',
      category: 'Electronics',
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: '2',
      title: 'Organic Cotton T-Shirt',
      price: { amount: '24.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      vendor: 'EcoWear',
      category: 'Apparel',
      rating: 4.2,
      reviewCount: 89
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
    },
    {
      id: '4',
      title: 'Leather Crossbody Bag',
      price: { amount: '129.99', currency: 'USD' },
      availableForSale: false,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      vendor: 'StyleCraft',
      category: 'Accessories',
      rating: 4.3,
      reviewCount: 67
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
    },
    {
      id: '6',
      title: 'Wireless Phone Charger Pad',
      price: { amount: '39.99', currency: 'USD' },
      compareAtPrice: { amount: '59.99', currency: 'USD' },
      availableForSale: true,
      image: 'https://images.unsplash.com/photo-1586953983027-d7508a64f4bb?w=400',
      vendor: 'TechBrand',
      category: 'Electronics',
      rating: 4.4,
      reviewCount: 156
    }
  ];

  // Extract filter data from products
  const categories = [...new Set(mockProducts.map(p => p.category))];
  const brands = [...new Set(mockProducts.map(p => p.vendor))];
  const prices = mockProducts.map(p => parseFloat(p.price.amount));
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };

  return json({
    shopConfig,
    products: mockProducts,
    totalProducts: mockProducts.length,
    categories,
    brands,
    priceRange
  });
};

export default function CatalogPage() {
  const { shopConfig, products, totalProducts, categories, brands, priceRange } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  
  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
    brands: searchParams.get('brand') ? [searchParams.get('brand')!] : [],
    priceRange: { min: priceRange.min, max: priceRange.max },
    rating: 0,
    availability: 'all'
  });

  // Apply filters and search to products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      if (!product.title.toLowerCase().includes(searchTerm) && 
          !product.vendor.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(product.vendor)) {
      return false;
    }

    // Price filter
    const price = parseFloat(product.price.amount);
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    // Rating filter
    if (filters.rating > 0 && product.rating && product.rating < filters.rating) {
      return false;
    }

    // Availability filter
    if (filters.availability === 'available' && !product.availableForSale) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.amount) - parseFloat(b.price.amount);
      case 'price-high':
        return parseFloat(b.price.amount) - parseFloat(a.price.amount);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0; // relevance
    }
  });

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Update URL params based on filters
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.categories.length > 0) {
      params.set('category', newFilters.categories[0]);
    } else {
      params.delete('category');
    }
    
    if (newFilters.brands.length > 0) {
      params.set('brand', newFilters.brands[0]);
    } else {
      params.delete('brand');
    }
    
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  return (
    <ThemeProvider shopConfig={shopConfig}>
      <div className="catalog-page">
        {/* Header */}
        <header className="catalog-header">
          <div className="header-content">
            <h1 className="page-title">Products</h1>
            
            {/* Search Bar */}
            <div className="search-section">
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmit={handleSearchSubmit}
                placeholder="Search products..."
              />
            </div>

            {/* Controls */}
            <div className="catalog-controls">
              {/* Results Count */}
              <div className="results-info">
                {sortedProducts.length} of {totalProducts} products
              </div>
              
              <div className="controls-right">
                {/* View Toggle */}
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    type="button"
                    aria-label="Grid view"
                  >
                    ⊞
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    type="button"
                    aria-label="List view"
                  >
                    ☰
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  className={`filter-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                  type="button"
                >
                  🔽 Filters
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Sidebar */}
        {showFilters && (
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            brands={brands}
            priceRange={priceRange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Product Grid/List */}
        <main className="catalog-main">
          <ProductCatalogGrid
            products={sortedProducts}
            viewMode={viewMode}
            onProductPress={(product) => {
              // Navigate to product detail
              window.location.href = `/product/${product.id}`;
            }}
          />

          {/* Load More Button */}
          {sortedProducts.length > 0 && (
            <div className="load-more-section">
              <button className="load-more-btn" type="button">
                Load More Products
              </button>
            </div>
          )}
        </main>

        <style jsx>{`
          .catalog-page {
            min-height: 100vh;
            background: #f8f8f8;
            padding-bottom: 80px; /* Space for bottom tabs */
          }
          
          .catalog-header {
            background: white;
            border-bottom: 1px solid #e5e5e5;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          .header-content {
            max-width: 375px;
            margin: 0 auto;
            padding: 16px;
          }
          
          .page-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 16px;
          }
          
          .search-section {
            margin-bottom: 16px;
          }
          
          .catalog-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          
          .results-info {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          
          .controls-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .view-toggle {
            display: flex;
            background: #f0f0f0;
            border-radius: 8px;
            padding: 2px;
          }
          
          .view-btn {
            padding: 6px 10px;
            border: none;
            background: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          
          .view-btn.active {
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .filter-toggle {
            background: var(--primary-color, #007C3B);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .filter-toggle:hover {
            opacity: 0.9;
          }
          
          .filter-toggle.active {
            background: var(--secondary-color, #005c2b);
          }
          
          .sort-select {
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
          }
          
          .sort-select:focus {
            border-color: var(--primary-color, #007C3B);
          }
          
          .catalog-main {
            max-width: 375px;
            margin: 0 auto;
            padding: 16px;
          }
          
          .load-more-section {
            text-align: center;
            margin-top: 32px;
          }
          
          .load-more-btn {
            background: var(--primary-color, #007C3B);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .load-more-btn:hover {
            background: var(--secondary-color, #005c2b);
            transform: translateY(-1px);
          }
          
          @media (max-width: 375px) {
            .catalog-controls {
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .controls-right {
              gap: 8px;
            }
            
            .view-btn {
              padding: 5px 8px;
              font-size: 12px;
            }
            
            .filter-toggle {
              font-size: 12px;
              padding: 6px 10px;
            }
            
            .sort-select {
              font-size: 12px;
              padding: 6px 10px;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}