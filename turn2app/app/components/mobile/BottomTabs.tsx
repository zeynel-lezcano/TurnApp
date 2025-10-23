/**
 * Bottom Tab Navigation - TapCart-Style
 * 
 * Mobile-optimierte Tab-Navigation mit Badge-Unterstützung für Cart.
 * Orientiert an iOS/Android App-Navigation Patterns.
 */

import type { BottomTabsProps, ScreenType } from './types';

interface TabItem {
  id: ScreenType;
  label: string;
  icon: string;
  activeIcon?: string;
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    activeIcon: '🏠'
  },
  {
    id: 'catalog',
    label: 'Shop',
    icon: '📋',
    activeIcon: '📋'
  },
  {
    id: 'search',
    label: 'Search',
    icon: '🔍',
    activeIcon: '🔍'
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: '🛒',
    activeIcon: '🛒'
  },
  {
    id: 'account',
    label: 'Account',
    icon: '👤',
    activeIcon: '👤'
  }
];

export function BottomTabs({ 
  currentScreen, 
  onScreenChange, 
  cartItemCount 
}: BottomTabsProps) {
  
  const handleTabPress = (screenId: ScreenType) => {
    onScreenChange(screenId);
  };

  return (
    <nav className="bottom-tabs">
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const showBadge = tab.id === 'cart' && cartItemCount > 0;
          
          return (
            <button
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabPress(tab.id)}
              type="button"
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <div className="tab-icon-container">
                <span className="tab-icon">
                  {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                </span>
                
                {/* Cart Badge */}
                {showBadge && (
                  <span className="tab-badge">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
              
              <span className="tab-label">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .bottom-tabs {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 375px;
          background: white;
          border-top: 1px solid #e5e5e5;
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        .tabs-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
          min-height: 60px;
        }
        
        .tab-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #999;
          min-width: 44px;
          min-height: 44px;
        }
        
        .tab-item.active {
          color: var(--primary-color, #007C3B);
        }
        
        .tab-item:hover {
          color: var(--primary-color, #007C3B);
        }
        
        .tab-icon-container {
          position: relative;
          margin-bottom: 4px;
        }
        
        .tab-icon {
          font-size: 20px;
          display: block;
          transition: transform 0.2s ease;
        }
        
        .tab-item:active .tab-icon {
          transform: scale(0.9);
        }
        
        .tab-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #ff4444;
          color: white;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid white;
        }
        
        .tab-label {
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.5px;
        }
        
        /* Active state animation */
        .tab-item.active .tab-icon {
          animation: tabBounce 0.3s ease;
        }
        
        @keyframes tabBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 375px) {
          .bottom-tabs {
            max-width: 100%;
          }
          
          .tab-item {
            padding: 4px 4px;
            min-width: 40px;
          }
          
          .tab-icon {
            font-size: 18px;
          }
          
          .tab-label {
            font-size: 9px;
          }
        }
        
        @media (max-width: 320px) {
          .tab-label {
            display: none;
          }
          
          .tab-icon {
            font-size: 22px;
          }
          
          .tab-item {
            padding: 8px 4px;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .bottom-tabs {
            background: #1a1a1a;
            border-top-color: #333;
          }
          
          .tab-item {
            color: #999;
          }
          
          .tab-item.active {
            color: var(--primary-color, #00A651);
          }
        }
      `}</style>
    </nav>
  );
}