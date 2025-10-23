/**
 * Product Variant Selector Component - TapCart-Style
 * 
 * Interaktiver Variant-Selektor für Produkt-Optionen (Farbe, Größe, etc.)
 * mit visueller Auswahl und Live-Preisupdate.
 */

import type { ProductVariant } from './types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

interface OptionGroup {
  name: string;
  values: string[];
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantChange
}: ProductVariantSelectorProps) {
  
  // Group variants by option names (e.g., Color, Size)
  const optionGroups: OptionGroup[] = [];
  
  if (variants.length > 0 && variants[0].selectedOptions) {
    variants[0].selectedOptions.forEach(option => {
      const existingGroup = optionGroups.find(g => g.name === option.name);
      if (!existingGroup) {
        const values = variants
          .map(variant => 
            variant.selectedOptions?.find(opt => opt.name === option.name)?.value
          )
          .filter((value, index, array) => 
            value && array.indexOf(value) === index
          ) as string[];
        
        optionGroups.push({
          name: option.name,
          values
        });
      }
    });
  }

  const handleOptionChange = (optionName: string, optionValue: string) => {
    // Find variant that matches the selected options
    const targetVariant = variants.find(variant => {
      if (!variant.selectedOptions) return false;
      
      // Check if this variant has the selected option value
      const hasTargetOption = variant.selectedOptions.some(
        opt => opt.name === optionName && opt.value === optionValue
      );
      
      if (!hasTargetOption) return false;
      
      // Check if this variant matches all other currently selected options
      const otherSelectedOptions = selectedVariant.selectedOptions?.filter(
        opt => opt.name !== optionName
      ) || [];
      
      return otherSelectedOptions.every(selectedOpt =>
        variant.selectedOptions?.some(
          variantOpt => variantOpt.name === selectedOpt.name && variantOpt.value === selectedOpt.value
        )
      );
    });

    if (targetVariant) {
      onVariantChange(targetVariant);
    }
  };

  const getSelectedValue = (optionName: string): string => {
    return selectedVariant.selectedOptions?.find(opt => opt.name === optionName)?.value || '';
  };

  const isOptionAvailable = (optionName: string, optionValue: string): boolean => {
    return variants.some(variant => {
      if (!variant.availableForSale) return false;
      
      const hasTargetOption = variant.selectedOptions?.some(
        opt => opt.name === optionName && opt.value === optionValue
      );
      
      if (!hasTargetOption) return false;
      
      // Check if variant matches other selected options
      const otherSelectedOptions = selectedVariant.selectedOptions?.filter(
        opt => opt.name !== optionName
      ) || [];
      
      return otherSelectedOptions.every(selectedOpt =>
        variant.selectedOptions?.some(
          variantOpt => variantOpt.name === selectedOpt.name && variantOpt.value === selectedOpt.value
        )
      );
    });
  };

  if (optionGroups.length === 0) {
    return null;
  }

  return (
    <div className="variant-selector">
      {optionGroups.map(group => (
        <div key={group.name} className="option-group">
          <h4 className="option-title">
            {group.name}: <span className="selected-value">{getSelectedValue(group.name)}</span>
          </h4>
          
          <div className="option-values">
            {group.values.map(value => {
              const isSelected = getSelectedValue(group.name) === value;
              const isAvailable = isOptionAvailable(group.name, value);
              const variant = variants.find(v => 
                v.selectedOptions?.some(opt => opt.name === group.name && opt.value === value)
              );
              
              return (
                <button
                  key={value}
                  className={`option-button ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                  onClick={() => isAvailable && handleOptionChange(group.name, value)}
                  disabled={!isAvailable}
                  type="button"
                  title={!isAvailable ? 'Out of stock' : undefined}
                >
                  {/* Color Option - Show color swatch */}
                  {group.name.toLowerCase() === 'color' && variant?.image && (
                    <div className="color-swatch">
                      <img 
                        src={variant.image.url} 
                        alt={value}
                        className="swatch-image"
                      />
                    </div>
                  )}
                  
                  {/* Option Value Text */}
                  <span className="option-text">{value}</span>
                  
                  {/* Unavailable Indicator */}
                  {!isAvailable && (
                    <div className="unavailable-overlay">
                      ✕
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <style jsx>{`
        .variant-selector {
          margin: 24px 0;
        }
        
        .option-group {
          margin-bottom: 20px;
        }
        
        .option-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px;
        }
        
        .selected-value {
          font-weight: 400;
          color: var(--primary-color, #007C3B);
        }
        
        .option-values {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .option-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .option-button:hover:not(:disabled) {
          border-color: var(--primary-color, #007C3B);
          background: rgba(0, 124, 59, 0.05);
        }
        
        .option-button.selected {
          border-color: var(--primary-color, #007C3B);
          background: var(--primary-color, #007C3B);
          color: white;
        }
        
        .option-button.unavailable {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .option-button:disabled {
          cursor: not-allowed;
        }
        
        .color-swatch {
          width: 20px;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .swatch-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .option-text {
          user-select: none;
        }
        
        .unavailable-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ff4444;
          font-weight: 700;
          font-size: 16px;
          pointer-events: none;
        }
        
        /* Special styling for color options */
        .option-group:has(.color-swatch) .option-button {
          min-width: 80px;
          justify-content: flex-start;
        }
        
        /* Size option styling */
        .option-button:not(:has(.color-swatch)) {
          min-width: 60px;
          justify-content: center;
        }
        
        @media (max-width: 375px) {
          .option-button {
            padding: 8px 12px;
            font-size: 13px;
            min-height: 40px;
          }
          
          .color-swatch {
            width: 16px;
            height: 16px;
            border-radius: 8px;
          }
          
          .option-title {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}