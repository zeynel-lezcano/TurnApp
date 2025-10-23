/**
 * Product Image Gallery Component - TapCart-Style
 * 
 * Swipeable Image Gallery mit Dots-Navigation und Zoom-Unterstützung
 * für optimale Mobile Shopping Experience.
 */

import { useState, useEffect, useRef } from 'react';
import type { ProductImage } from './types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  activeIndex: number;
  onImageChange: (index: number) => void;
}

export function ProductImageGallery({
  images,
  activeIndex,
  onImageChange
}: ProductImageGalleryProps) {
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = activeIndex * containerRef.current.offsetWidth;
    }
  }, [activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < images.length - 1) {
      onImageChange(activeIndex + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      onImageChange(activeIndex - 1);
    }
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDotClick = (index: number) => {
    onImageChange(index);
  };

  if (images.length === 0) {
    return (
      <div className="image-gallery">
        <div className="image-placeholder">
          📦
        </div>
        
        <style jsx>{`
          .image-gallery {
            position: relative;
            height: 375px;
            background: #f8f8f8;
          }
          
          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #ccc;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {/* Main Image Container */}
      <div 
        className="image-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div key={index} className="image-slide">
            <img
              src={image.url}
              alt={image.altText || `Product image ${index + 1}`}
              className={`product-image ${isZoomed ? 'zoomed' : ''}`}
              onClick={handleImageClick}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {images.length > 1 && (
        <div className="dots-container">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              type="button"
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="image-counter">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Zoom Indicator */}
      {isZoomed && (
        <div className="zoom-indicator">
          Tap to exit zoom
        </div>
      )}

      <style jsx>{`
        .image-gallery {
          position: relative;
          height: 375px;
          background: white;
          overflow: hidden;
          user-select: none;
        }
        
        .image-container {
          display: flex;
          height: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        .image-slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .product-image.zoomed {
          transform: scale(2);
          object-fit: contain;
          cursor: zoom-out;
        }
        
        .dots-container {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .dot.active {
          background: white;
          width: 24px;
        }
        
        .dot:hover {
          background: rgba(255, 255, 255, 0.8);
        }
        
        .image-counter {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          z-index: 10;
        }
        
        .zoom-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          z-index: 20;
          pointer-events: none;
          animation: fadeInOut 2s infinite;
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        /* Swipe indicators */
        .image-gallery::before,
        .image-gallery::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          z-index: 5;
          pointer-events: none;
        }
        
        .image-gallery::before {
          left: 8px;
          opacity: ${activeIndex > 0 ? 1 : 0};
        }
        
        .image-gallery::after {
          right: 8px;
          opacity: ${activeIndex < images.length - 1 ? 1 : 0};
        }
        
        /* Mobile optimizations */
        @media (max-width: 375px) {
          .image-gallery {
            height: 320px;
          }
          
          .image-counter {
            top: 12px;
            right: 12px;
            font-size: 11px;
            padding: 4px 10px;
          }
          
          .dots-container {
            bottom: 12px;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            border-radius: 3px;
          }
          
          .dot.active {
            width: 20px;
          }
        }
        
        /* Prevent image drag on desktop */
        .product-image {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  );
}