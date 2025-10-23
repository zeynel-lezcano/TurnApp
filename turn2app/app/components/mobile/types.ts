/**
 * TypeScript Definitions für Mobile Components
 * 
 * Zentrale Type-Definitionen für die Mobile App Komponenten,
 * orientiert an TapCart's UX-Patterns und Shopify's Datenstrukturen.
 */

// Shop Configuration from /api/config
export interface ShopConfig {
  shopName: string;
  branding: {
    brandName: string;
    primaryColor: string;
    tagline: string;
  };
  currency: string;
  locale: string;
}

// Product Data from Shopify Storefront API
export interface Product {
  id: string;
  title: string;
  handle?: string;
  description?: string;
  image?: string;
  images?: ProductImage[];
  price: {
    amount: string;
    currency: string;
  };
  compareAtPrice?: {
    amount: string;
    currency: string;
  };
  variants?: ProductVariant[];
  vendor?: string;
  productType?: string;
  category: string;
  tags?: string[];
  availableForSale: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currency: string;
  };
  compareAtPrice?: {
    amount: string;
    currency: string;
  };
  availableForSale: boolean;
  selectedOptions: VariantOption[];
  quantityAvailable?: number;
}

export interface VariantOption {
  name: string;
  value: string;
}

// Collection/Category Data
export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: ProductImage;
  products: Product[];
  productsCount: number;
}

// Shopping Cart
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  image: string;
  price: {
    amount: string;
    currency: string;
  };
  quantity: number;
  variant: {
    title: string;
    selectedOptions: VariantOption[];
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: {
    amount: string;
    currency: string;
  };
  totalQuantity: number;
  estimatedCost: {
    subtotal: { amount: string; currency: string };
    totalTax: { amount: string; currency: string };
    totalDuties: { amount: string; currency: string };
    totalAmount: { amount: string; currency: string };
  };
}

// User Account & Preferences
export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  defaultAddress?: Address;
  addresses: Address[];
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

// Search & Filtering
export interface SearchFilters {
  query?: string;
  categories: string[];
  brands: string[];
  tags?: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  availability: 'available' | 'all';
  sortKey?: 'RELEVANCE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'TITLE';
  reverse?: boolean;
}

export interface SearchResult {
  products: Product[];
  collections: Collection[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// UI State Management
export interface AppState {
  // User & Authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // Shop Configuration
  shopConfig: ShopConfig | null;
  
  // Shopping Cart
  cart: Cart;
  isCartOpen: boolean;
  
  // Navigation & UI
  currentScreen: ScreenType;
  searchQuery: string;
  searchFilters: SearchFilters;
  isSearchOpen: boolean;
  
  // Loading States
  isLoading: boolean;
  isLoadingProducts: boolean;
  isLoadingMore: boolean;
  
  // Error States
  error: string | null;
  networkError: boolean;
}

export type ScreenType = 
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'cart'
  | 'search'
  | 'account'
  | 'collection'
  | 'checkout';

// Component Props
export interface HeroBannerProps {
  shopConfig: ShopConfig;
  onShopNowClick: () => void;
}

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  showQuickAdd?: boolean;
  showWishlist?: boolean;
}

export interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface CategoryButtonProps {
  category: {
    id: string;
    title: string;
    icon: string;
    handle: string;
  };
  onPress: (category: any) => void;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface CartIconProps {
  itemCount: number;
  onPress: () => void;
}

// Navigation Props
export interface BottomTabsProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  cartItemCount: number;
}

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  cartItemCount?: number;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
}

// Theme & Styling
export interface AppTheme {
  colors: {
    primary: string;
    primaryRgb: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ProductsResponse {
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount?: number;
}

export interface CollectionsResponse {
  collections: Collection[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Event Types für Analytics
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export type ProductEvent = 
  | 'product_viewed'
  | 'product_added_to_cart'
  | 'product_removed_from_cart'
  | 'product_shared'
  | 'product_favorited';

export type UserEvent =
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'user_profile_updated';

export type CommerceEvent =
  | 'cart_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'purchase_completed';

export type NavigationEvent =
  | 'screen_viewed'
  | 'search_performed'
  | 'category_viewed'
  | 'collection_viewed';