/**
 * Theme Provider für Mobile Components
 * 
 * Dynamisches Theming basierend auf Shop-Konfiguration.
 * Erstellt CSS Custom Properties für konsistente Marken-Experience.
 */

import { createContext, useContext, useMemo } from 'react';
import type { AppTheme, ShopConfig } from './types';

interface ThemeContextValue {
  theme: AppTheme;
  shopConfig: ShopConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  shopConfig: ShopConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ shopConfig, children }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(shopConfig), [shopConfig]);

  return (
    <ThemeContext.Provider value={{ theme, shopConfig }}>
      <div className="theme-root">
        <style dangerouslySetInnerHTML={{
          __html: generateThemeCSS(theme, shopConfig)
        }} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function createTheme(shopConfig: ShopConfig): AppTheme {
  const primaryColor = shopConfig.branding.primaryColor;
  const primaryRgb = hexToRgb(primaryColor);
  
  return {
    colors: {
      primary: primaryColor,
      primaryRgb,
      secondary: adjustColorBrightness(primaryColor, -20),
      background: '#ffffff',
      surface: '#f8f8f8',
      text: '#1a1a1a',
      textSecondary: '#666666',
      border: '#e5e5e5',
      error: '#ff4444',
      success: '#00c851',
      warning: '#ff8800',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 24,
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      md: '0 4px 12px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
  };
}

function generateThemeCSS(theme: AppTheme, shopConfig: ShopConfig): string {
  return `
    :root {
      /* Colors */
      --primary-color: ${theme.colors.primary};
      --primary-rgb: ${theme.colors.primaryRgb};
      --secondary-color: ${theme.colors.secondary};
      --background-color: ${theme.colors.background};
      --surface-color: ${theme.colors.surface};
      --text-color: ${theme.colors.text};
      --text-secondary-color: ${theme.colors.textSecondary};
      --border-color: ${theme.colors.border};
      --error-color: ${theme.colors.error};
      --success-color: ${theme.colors.success};
      --warning-color: ${theme.colors.warning};
      
      /* Typography */
      --font-family: ${theme.typography.fontFamily};
      --font-size-xs: ${theme.typography.fontSize.xs}px;
      --font-size-sm: ${theme.typography.fontSize.sm}px;
      --font-size-md: ${theme.typography.fontSize.md}px;
      --font-size-lg: ${theme.typography.fontSize.lg}px;
      --font-size-xl: ${theme.typography.fontSize.xl}px;
      --font-size-xxl: ${theme.typography.fontSize.xxl}px;
      
      --font-weight-normal: ${theme.typography.fontWeight.normal};
      --font-weight-medium: ${theme.typography.fontWeight.medium};
      --font-weight-semibold: ${theme.typography.fontWeight.semibold};
      --font-weight-bold: ${theme.typography.fontWeight.bold};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs}px;
      --spacing-sm: ${theme.spacing.sm}px;
      --spacing-md: ${theme.spacing.md}px;
      --spacing-lg: ${theme.spacing.lg}px;
      --spacing-xl: ${theme.spacing.xl}px;
      --spacing-xxl: ${theme.spacing.xxl}px;
      
      /* Border Radius */
      --border-radius-sm: ${theme.borderRadius.sm}px;
      --border-radius-md: ${theme.borderRadius.md}px;
      --border-radius-lg: ${theme.borderRadius.lg}px;
      --border-radius-xl: ${theme.borderRadius.xl}px;
      --border-radius-full: ${theme.borderRadius.full}px;
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
    }
    
    .theme-root {
      font-family: var(--font-family);
      color: var(--text-color);
      background-color: var(--background-color);
    }
    
    /* Global component styles */
    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-sm) var(--spacing-md);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary:hover {
      background-color: var(--secondary-color);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .btn-secondary {
      background-color: var(--surface-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-sm) var(--spacing-md);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-secondary:hover {
      background-color: var(--background-color);
      border-color: var(--primary-color);
    }
    
    .card {
      background-color: var(--background-color);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.2s ease;
    }
    
    .card:hover {
      box-shadow: var(--shadow-md);
    }
    
    .input {
      background-color: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-md);
      color: var(--text-color);
      transition: all 0.2s ease;
    }
    
    .input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
    }
    
    /* Text utilities */
    .text-primary { color: var(--primary-color); }
    .text-secondary { color: var(--text-secondary-color); }
    .text-error { color: var(--error-color); }
    .text-success { color: var(--success-color); }
    .text-warning { color: var(--warning-color); }
    
    .text-xs { font-size: var(--font-size-xs); }
    .text-sm { font-size: var(--font-size-sm); }
    .text-md { font-size: var(--font-size-md); }
    .text-lg { font-size: var(--font-size-lg); }
    .text-xl { font-size: var(--font-size-xl); }
    .text-xxl { font-size: var(--font-size-xxl); }
    
    .font-normal { font-weight: var(--font-weight-normal); }
    .font-medium { font-weight: var(--font-weight-medium); }
    .font-semibold { font-weight: var(--font-weight-semibold); }
    .font-bold { font-weight: var(--font-weight-bold); }
    
    /* Background utilities */
    .bg-primary { background-color: var(--primary-color); }
    .bg-surface { background-color: var(--surface-color); }
    .bg-background { background-color: var(--background-color); }
    
    /* Border utilities */
    .border { border: 1px solid var(--border-color); }
    .border-primary { border-color: var(--primary-color); }
    
    .rounded-sm { border-radius: var(--border-radius-sm); }
    .rounded-md { border-radius: var(--border-radius-md); }
    .rounded-lg { border-radius: var(--border-radius-lg); }
    .rounded-xl { border-radius: var(--border-radius-xl); }
    .rounded-full { border-radius: var(--border-radius-full); }
    
    /* Spacing utilities */
    .p-xs { padding: var(--spacing-xs); }
    .p-sm { padding: var(--spacing-sm); }
    .p-md { padding: var(--spacing-md); }
    .p-lg { padding: var(--spacing-lg); }
    .p-xl { padding: var(--spacing-xl); }
    
    .m-xs { margin: var(--spacing-xs); }
    .m-sm { margin: var(--spacing-sm); }
    .m-md { margin: var(--spacing-md); }
    .m-lg { margin: var(--spacing-lg); }
    .m-xl { margin: var(--spacing-xl); }
    
    /* Shadow utilities */
    .shadow-sm { box-shadow: var(--shadow-sm); }
    .shadow-md { box-shadow: var(--shadow-md); }
    .shadow-lg { box-shadow: var(--shadow-lg); }
    
    /* Mobile optimizations */
    @media (max-width: 375px) {
      :root {
        --font-size-xxl: 20px;
        --spacing-lg: 20px;
        --spacing-xl: 28px;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :root {
        --background-color: #1a1a1a;
        --surface-color: #2a2a2a;
        --text-color: #ffffff;
        --text-secondary-color: #999999;
        --border-color: #333333;
      }
    }
  `;
}

// Helper functions
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 124, 59';
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}