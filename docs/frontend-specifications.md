# Frontend Specifications - TapCart-Inspired UX

## 🎯 Overview

Diese Spezifikation definiert die Frontend-Architektur für turn2app Mobile Apps, inspiriert von TapCart's bewährter UX. Das Ziel ist eine intuitive, performance-optimierte Shopping-Experience, die native App-Qualität in React Native/Web bietet.

## 📱 Core Screens & User Flows

### 1. Home Screen (Landing)
**File**: `mobile-demo/src/screens/HomeScreen.tsx`

**TapCart-Features:**
- **Hero Banner**: Shop logo, tagline, featured image
- **Search Bar**: Prominent search with autocomplete
- **Featured Collections**: Horizontal scroll cards
- **Quick Actions**: Categories, Deals, New Arrivals
- **Recently Viewed**: Personal recommendations

**Implementation Details:**
```tsx
// Components needed:
- HeroBanner (shop branding, CTA)
- SearchBar (global search entry point)
- CollectionCarousel (horizontal scroll)
- QuickActions (category shortcuts)
- RecentlyViewed (user-specific)
```

**API Integration:**
- `GET /api/config` → Branding & theme
- `GET /api/collections` → Featured collections
- `GET /api/products?featured=true` → Featured products

---

### 2. Product Catalog Screen
**File**: `mobile-demo/src/screens/CatalogScreen.tsx`

**TapCart-Features:**
- **Grid/List Toggle**: User preference
- **Filter & Sort**: Price, category, brand, rating
- **Infinite Scroll**: Performance-optimized loading
- **Quick View**: Modal preview without navigation
- **Search Integration**: Filter by search terms

**Implementation Details:**
```tsx
// Components needed:
- ProductGrid (2-column responsive)
- ProductCard (image, title, price, rating)
- FilterDrawer (slide-up filter panel)
- SortDropdown (price, popularity, rating)
- LoadingSpinner (infinite scroll indicator)
```

**State Management:**
```tsx
// Catalog state:
- products: Product[]
- filters: FilterState
- sortBy: SortOption
- viewMode: 'grid' | 'list'
- hasNextPage: boolean
- loading: boolean
```

---

### 3. Product Detail Screen
**File**: `mobile-demo/src/screens/ProductDetailScreen.tsx`

**TapCart-Features:**
- **Image Gallery**: Swipeable with zoom
- **Variant Selection**: Size, color, options
- **Add to Cart**: Prominent CTA with quantity
- **Product Information**: Description, specs, care
- **Reviews Section**: Ratings & review preview
- **Related Products**: Cross-sell carousel

**Implementation Details:**
```tsx
// Components needed:
- ImageGallery (swiper with indicators)
- VariantSelector (dropdown/button groups)
- AddToCartButton (quantity + cart action)
- ProductInfo (collapsible sections)
- ReviewsSummary (stars + review count)
- RelatedProducts (horizontal carousel)
```

**Shopify Integration:**
- Variant selection → Price updates
- Inventory checking → Availability status
- Add to Cart → Shopify Checkout preparation

---

### 4. Shopping Cart & Checkout
**File**: `mobile-demo/src/screens/CartScreen.tsx`

**TapCart-Features:**
- **Cart Items**: Product cards with quantity controls
- **Price Summary**: Subtotal, shipping, tax estimates
- **Promo Codes**: Discount code input
- **Guest/Login Options**: Account creation flow
- **Checkout CTA**: Redirect to Shopify Checkout

**Implementation Details:**
```tsx
// Components needed:
- CartItemCard (image, title, price, quantity controls)
- PriceSummary (breakdown of costs)
- PromoCodeInput (discount application)
- CheckoutButton (Shopify integration)
- EmptyCart (onboarding back to shopping)
```

**Cart State Management:**
```tsx
// Global cart state (Context/Redux):
- items: CartItem[]
- subtotal: number
- itemCount: number
- addItem: (product, variant, quantity) => void
- updateQuantity: (itemId, quantity) => void
- removeItem: (itemId) => void
```

---

## 🧭 Navigation & Layout

### Bottom Tab Navigation
**File**: `mobile-demo/src/navigation/TabNavigator.tsx`

**TapCart-Style Tabs:**
1. **Home** (house icon)
2. **Catalog** (grid icon)  
3. **Search** (search icon)
4. **Cart** (shopping bag with badge)
5. **Account** (user icon)

### Header Navigation
**File**: `mobile-demo/src/components/Header.tsx`

**Features:**
- Back button (context-aware)
- Page title (dynamic)
- Search icon (global access)
- Cart icon with item count badge
- Menu/Profile (right side)

---

## 🎨 Design System & Theming

### Brand Customization
**File**: `mobile-demo/src/styles/ThemeProvider.tsx`

**Customizable Elements:**
```tsx
interface AppTheme {
  // Colors (from /api/config)
  primary: string;        // CTAs, links, accents
  secondary: string;      // Secondary actions
  background: string;     // Screen backgrounds
  surface: string;        // Card backgrounds
  text: string;          // Primary text color
  textSecondary: string; // Secondary text
  
  // Typography
  fontFamily: string;     // Brand font
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  
  // Spacing
  spacing: {
    xs: number;   // 4px
    sm: number;   // 8px
    md: number;   // 16px
    lg: number;   // 24px
    xl: number;   // 32px
  };
  
  // Component Styles
  button: ButtonTheme;
  card: CardTheme;
  input: InputTheme;
}
```

### Responsive Design
**Breakpoints:**
```tsx
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
```

---

## 🔄 State Management Architecture

### Global State (React Context/Zustand)
```tsx
// AppStateProvider.tsx
interface AppState {
  // User & Session
  user: User | null;
  isAuthenticated: boolean;
  
  // Shop Configuration
  shopConfig: ShopConfig;
  theme: AppTheme;
  
  // Shopping Cart
  cart: CartState;
  
  // UI State
  searchQuery: string;
  filters: FilterState;
  navigation: NavigationState;
}
```

### Local Component State
- Form inputs (React Hook Form)
- Modal/drawer visibility
- Loading states
- Error states

---

## 🚀 Performance Optimization

### Code Splitting
```tsx
// Lazy loading for screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const CatalogScreen = lazy(() => import('./screens/CatalogScreen'));
const ProductDetailScreen = lazy(() => import('./screens/ProductDetailScreen'));
```

### Image Optimization
```tsx
// Image component with lazy loading
<OptimizedImage
  src={product.image}
  alt={product.title}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  placeholder="blur"
/>
```

### Data Fetching
```tsx
// React Query for caching & background updates
const { data: products, isLoading } = useQuery(
  ['products', filters],
  () => fetchProducts(filters),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

---

## 🔌 API Integration

### Authentication Flow
```tsx
// Mobile app → Backend → Shopify
1. GET /api/config → Shop configuration & theme
2. POST /api/storefront-token → Short-lived access token
3. Direct Shopify Storefront API calls for products
4. Backend APIs for cart, user preferences, analytics
```

### Shopify Integration Points
1. **Products**: Direct Storefront API calls
2. **Cart**: Shopify Checkout Web/SDK
3. **Collections**: Backend proxy + caching
4. **Search**: Backend search API with analytics

---

## 📊 Analytics & Tracking

### User Journey Tracking
```tsx
// Event tracking for key actions
analytics.track('product_viewed', {
  product_id: product.id,
  product_name: product.title,
  category: product.category,
  price: product.price,
});

analytics.track('add_to_cart', {
  product_id: product.id,
  variant_id: variant.id,
  quantity: quantity,
  price: variant.price,
});
```

### Performance Metrics
- Screen load times
- API response times
- Image loading performance
- User engagement metrics

---

## 🧪 Testing Strategy

### Component Testing
```tsx
// Testing with React Native Testing Library
describe('ProductCard', () => {
  test('displays product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.price)).toBeInTheDocument();
  });
});
```

### E2E Testing
- User flow testing (browse → view → add to cart → checkout)
- Cross-platform testing (iOS/Android/Web)
- Performance testing on various devices

---

## 🎯 Next Steps Priority

1. **Mobile Home Screen** (Hero, Featured Collections)
2. **Product Catalog** (Grid, Filters, Search)
3. **Product Detail** (Gallery, Variants, Add to Cart)
4. **Shopping Cart** (Items, Checkout Integration)
5. **Navigation Components** (Tabs, Header, Drawer)

Diese Spezifikation dient als Grundlage für die Frontend-Entwicklung und orientiert sich an bewährten E-Commerce UX-Patterns von TapCart, angepasst an Shopify's Ecosystem.