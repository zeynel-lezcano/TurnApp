/**
 * Filter Sidebar Component - TapCart-Style
 * 
 * Mobile-optimiertes Filter-Panel mit Categories, Brands, Price Range,
 * Rating und Availability Filtern für E-Commerce Katalog.
 */

import { useState } from 'react';
import type { SearchFilters } from './types';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  onClose: () => void;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  categories,
  brands,
  priceRange,
  onClose
}: FilterSidebarProps) {
  
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter(b => b !== brand)
      : [...localFilters.brands, brand];
    
    setLocalFilters(prev => ({
      ...prev,
      brands: newBrands
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const handleRatingChange = (rating: number) => {
    setLocalFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }));
  };

  const handleAvailabilityChange = (availability: 'all' | 'available') => {
    setLocalFilters(prev => ({
      ...prev,
      availability
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      categories: [],
      brands: [],
      priceRange: { min: priceRange.min, max: priceRange.max },
      rating: 0,
      availability: 'all'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.categories.length > 0 ||
    localFilters.brands.length > 0 ||
    localFilters.priceRange.min > priceRange.min ||
    localFilters.priceRange.max < priceRange.max ||
    localFilters.rating > 0 ||
    localFilters.availability !== 'all';

  return (
    <>
      {/* Backdrop */}
      <div className="filter-backdrop" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="filter-sidebar">
        {/* Header */}
        <div className="filter-header">
          <h2 className="filter-title">Filters</h2>
          <button 
            className="close-button"
            onClick={onClose}
            type="button"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        {/* Filter Content */}
        <div className="filter-content">
          
          {/* Categories */}
          <div className="filter-section">
            <h3 className="section-title">Categories</h3>
            <div className="filter-options">
              {categories.map(category => (
                <label key={category} className="filter-option">
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="filter-section">
            <h3 className="section-title">Brands</h3>
            <div className="filter-options">
              {brands.map(brand => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={localFilters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h3 className="section-title">Price Range</h3>
            <div className="price-range-container">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label className="price-label">Min</label>
                  <input
                    type="number"
                    value={localFilters.priceRange.min}
                    onChange={(e) => handlePriceRangeChange(
                      Math.max(priceRange.min, parseFloat(e.target.value) || priceRange.min),
                      localFilters.priceRange.max
                    )}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="price-input"
                  />
                </div>
                <div className="price-input-group">
                  <label className="price-label">Max</label>
                  <input
                    type="number"
                    value={localFilters.priceRange.max}
                    onChange={(e) => handlePriceRangeChange(
                      localFilters.priceRange.min,
                      Math.min(priceRange.max, parseFloat(e.target.value) || priceRange.max)
                    )}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="price-input"
                  />
                </div>
              </div>
              <div className="price-range-display">
                ${localFilters.priceRange.min} - ${localFilters.priceRange.max}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-section">
            <h3 className="section-title">Minimum Rating</h3>
            <div className="rating-options">
              {[4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  className={`rating-option ${localFilters.rating === rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(rating)}
                  type="button"
                >
                  <span className="stars">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </span>
                  <span className="rating-text">& up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="filter-section">
            <h3 className="section-title">Availability</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="availability"
                  checked={localFilters.availability === 'all'}
                  onChange={() => handleAvailabilityChange('all')}
                  className="filter-radio"
                />
                <span className="filter-label">All Products</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="availability"
                  checked={localFilters.availability === 'available'}
                  onChange={() => handleAvailabilityChange('available')}
                  className="filter-radio"
                />
                <span className="filter-label">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-footer">
          {hasActiveFilters && (
            <button 
              className="clear-button"
              onClick={handleClearFilters}
              type="button"
            >
              Clear All
            </button>
          )}
          <button 
            className="apply-button"
            onClick={handleApplyFilters}
            type="button"
          >
            Apply Filters
          </button>
        </div>

        <style jsx>{`
          .filter-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
          
          .filter-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 280px;
            max-width: 80vw;
            background: white;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .filter-title {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }
          
          .close-button {
            width: 32px;
            height: 32px;
            border-radius: 16px;
            background: #f5f5f5;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .close-button:hover {
            background: #e5e5e5;
          }
          
          .filter-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          
          .filter-section {
            margin-bottom: 24px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 12px;
          }
          
          .filter-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .filter-option {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
          }
          
          .filter-checkbox,
          .filter-radio {
            width: 18px;
            height: 18px;
            accent-color: var(--primary-color, #007C3B);
          }
          
          .filter-label {
            font-size: 14px;
            color: #1a1a1a;
            user-select: none;
          }
          
          /* Price Range */
          .price-range-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .price-inputs {
            display: flex;
            gap: 12px;
          }
          
          .price-input-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .price-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
          }
          
          .price-input {
            padding: 8px 12px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
          }
          
          .price-input:focus {
            border-color: var(--primary-color, #007C3B);
          }
          
          .price-range-display {
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            color: var(--primary-color, #007C3B);
            padding: 8px;
            background: #f8f8f8;
            border-radius: 8px;
          }
          
          /* Rating */
          .rating-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .rating-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .rating-option:hover {
            border-color: var(--primary-color, #007C3B);
          }
          
          .rating-option.active {
            background: var(--primary-color, #007C3B);
            border-color: var(--primary-color, #007C3B);
            color: white;
          }
          
          .stars {
            color: #ffa500;
            font-size: 14px;
          }
          
          .rating-option.active .stars {
            color: white;
          }
          
          .rating-text {
            font-size: 14px;
          }
          
          /* Footer */
          .filter-footer {
            padding: 20px;
            border-top: 1px solid #e5e5e5;
            display: flex;
            gap: 12px;
          }
          
          .clear-button {
            flex: 1;
            padding: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            background: white;
            color: #666;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .clear-button:hover {
            border-color: #ccc;
            color: #333;
          }
          
          .apply-button {
            flex: 2;
            padding: 12px;
            border: none;
            border-radius: 12px;
            background: var(--primary-color, #007C3B);
            color: white;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .apply-button:hover {
            background: var(--secondary-color, #005c2b);
          }
          
          @media (max-width: 375px) {
            .filter-sidebar {
              width: 100vw;
              max-width: 100vw;
            }
            
            .filter-header {
              padding: 16px;
            }
            
            .filter-content {
              padding: 16px;
            }
            
            .filter-footer {
              padding: 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
}