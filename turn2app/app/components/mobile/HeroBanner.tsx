/**
 * Hero Banner Component - TapCart-Inspired
 * 
 * Präsentiert Shop-Branding mit Call-to-Action im Hero-Bereich.
 * Verwendet dynamische Shop-Konfiguration für personalisierte Experience.
 */

import type { HeroBannerProps } from './types';

export function HeroBanner({ shopConfig, onShopNowClick }: HeroBannerProps) {
  const { branding } = shopConfig;
  
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome to {branding.brandName}
        </h1>
        
        <p className="hero-subtitle">
          {branding.tagline}
        </p>
        
        <button 
          className="hero-cta"
          onClick={onShopNowClick}
          type="button"
        >
          Shop Now
        </button>
      </div>
      
      {/* Background Gradient */}
      <div 
        className="hero-background" 
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}, rgba(${hexToRgb(branding.primaryColor)}, 0.8))`
        }}
      />

      <style jsx>{`
        .hero-banner {
          position: relative;
          padding: 40px 20px;
          text-align: center;
          color: white;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 320px;
        }
        
        .hero-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px;
          line-height: 1.2;
        }
        
        .hero-subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0 0 24px;
          line-height: 1.4;
        }
        
        .hero-cta {
          background: white;
          color: ${branding.primaryColor};
          padding: 14px 32px;
          border-radius: 28px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        
        .hero-cta:active {
          transform: translateY(0);
        }
        
        @media (max-width: 375px) {
          .hero-banner {
            padding: 32px 16px;
          }
          
          .hero-title {
            font-size: 24px;
          }
          
          .hero-cta {
            padding: 12px 28px;
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 124, 59';
}