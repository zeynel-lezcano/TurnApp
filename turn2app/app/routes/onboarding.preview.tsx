import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { requireShopAuth } from "../lib/auth.server";
import { getStorefrontProducts } from "../lib/storefront.server.js";
import { useState } from "react";
import { 
  Smartphone, Check, Sparkles, ArrowRight, Download, 
  Share2, Eye, Zap, Star, TrendingUp, Settings
} from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  // Shop authentifizieren
  const shop = await requireShopAuth(request, { 
    requireOnboarding: false  // Preview auch ohne komplettes Onboarding
  });
  
  try {
    // Echte Produktdaten aus Shopify Storefront API laden
    const products = await getStorefrontProducts({
      shop: shop.shopDomain,
      limit: 8
    });
    
    return json({
      shop: {
        domain: shop.shopDomain,
        name: shop.shopName || shop.shopDomain,
        ownerName: shop.ownerFirstName && shop.ownerLastName 
          ? `${shop.ownerFirstName} ${shop.ownerLastName}`
          : null,
        appName: shop.appName || shop.shopName || 'Meine App'
      },
      products: products || []
    });
    
  } catch (error) {
    console.warn("Could not load storefront products:", error);
    
    // Fallback mit Mock-Daten wenn Storefront API nicht verfügbar ist
    return json({
      shop: {
        domain: shop.shopDomain,
        name: shop.shopName || shop.shopDomain,
        ownerName: shop.ownerFirstName && shop.ownerLastName 
          ? `${shop.ownerFirstName} ${shop.ownerLastName}`
          : null,
        appName: shop.appName || shop.shopName || 'Meine App'
      },
      products: [
        {
          id: "1",
          title: "Premium Fitness Tracker",
          handle: "fitness-tracker",
          priceRange: { minVariantPrice: { amount: "99.99", currencyCode: "EUR" } },
          images: [{ url: "https://via.placeholder.com/300x300/0066cc/ffffff?text=Fitness+Tracker" }],
          description: "Der ultimative Fitness-Begleiter für Ihr Training"
        },
        {
          id: "2", 
          title: "Yoga Matte Pro",
          handle: "yoga-matte",
          priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "EUR" } },
          images: [{ url: "https://via.placeholder.com/300x300/cc6600/ffffff?text=Yoga+Matte" }],
          description: "Rutschfeste Premium Yoga-Matte"
        },
        {
          id: "3",
          title: "Protein Shake Mix",
          handle: "protein-shake",
          priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "EUR" } },
          images: [{ url: "https://via.placeholder.com/300x300/009900/ffffff?text=Protein+Mix" }],
          description: "Hochwertiges Protein für optimale Ergebnisse"
        },
        {
          id: "4",
          title: "Resistance Bands Set",
          handle: "resistance-bands",
          priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "EUR" } },
          images: [{ url: "https://via.placeholder.com/300x300/cc0066/ffffff?text=Resistance+Bands" }],
          description: "Vollständiges Widerstandsband-Set für Krafttraining"
        }
      ]
    });
  }
}

export default function OnboardingPreview() {
  const { shop, products } = useLoaderData<typeof loader>();
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'profile'>('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // iPhone-Frame Component
  const IPhoneFrame = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      width: '375px',
      height: '812px',
      background: '#000',
      borderRadius: '40px',
      padding: '8px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      {/* iPhone Notch */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '150px',
        height: '30px',
        background: '#000',
        borderRadius: '0 0 20px 20px',
        zIndex: 10
      }} />
      
      {/* Screen */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );

  // Mobile App Navigation
  const MobileNav = () => (
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '80px',
      background: '#fff',
      borderTop: '1px solid #e1e5e9',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: '20px',
      zIndex: 20
    }}>
      <button 
        onClick={() => setCurrentView('home')}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          color: currentView === 'home' ? '#007acc' : '#666',
          fontSize: '24px',
          cursor: 'pointer'
        }}
      >
        🏠
      </button>
      <button 
        onClick={() => setCurrentView('products')}
        style={{
          background: 'none',
          border: 'none', 
          padding: '8px',
          color: currentView === 'products' ? '#007acc' : '#666',
          fontSize: '24px',
          cursor: 'pointer'
        }}
      >
        🛍️
      </button>
      <button 
        onClick={() => setCurrentView('profile')}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px', 
          color: currentView === 'profile' ? '#007acc' : '#666',
          fontSize: '24px',
          cursor: 'pointer'
        }}
      >
        👤
      </button>
    </div>
  );

  // Home View
  const HomeView = () => (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Willkommen, {shop.ownerName?.split(' ')[0] || 'Besucher'}!
        </h2>
        <p className="text-white/90">Entdecke deine neue {shop.appName}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Empfohlen für dich</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((product: any) => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setCurrentView('product-detail');
              }}
              className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <img src={product.images?.[0]?.url} alt={product.title} className="w-full h-32 object-cover" />
              <div className="p-3">
                <p className="font-medium text-sm text-gray-800 truncate">{product.title}</p>
                <p className="text-blue-600 font-semibold text-sm">€{product.priceRange?.minVariantPrice?.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Products View  
  const ProductsView = () => (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-800">Alle Produkte</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product: any) => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setCurrentView('product-detail');
            }}
            className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <img src={product.images?.[0]?.url} alt={product.title} className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="font-medium text-sm text-gray-800 truncate">{product.title}</p>
              <p className="text-blue-600 font-semibold text-sm">€{product.priceRange?.minVariantPrice?.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Profile View
  const ProfileView = () => (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white text-center">
        <div className="w-20 h-20 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">👤</span>
        </div>
        <h2 className="text-xl font-bold">{shop.ownerName || 'Mein Profil'}</h2>
        <p className="text-white/80 text-sm">{shop.domain}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-gray-700">App Name</span>
          <span className="font-medium text-gray-900">{shop.appName}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-gray-700">Shop</span>
          <span className="font-medium text-gray-900">{shop.name}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-gray-700">Mitglied seit</span>
          <span className="font-medium text-gray-900">Heute</span>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Einstellungen
        </button>
        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Hilfe & Support
        </button>
      </div>
    </div>
  );

  // Product Detail Modal
  const ProductDetailModal = () => {
    if (!selectedProduct) return null;
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="relative">
          <img src={selectedProduct?.images?.[0]?.url} alt={selectedProduct?.title} className="w-full h-64 object-cover" />
          <button
            onClick={() => setCurrentView('products')}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-gray-700">←</span>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedProduct?.title}</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">€{selectedProduct?.priceRange?.minVariantPrice?.amount}</p>
          </div>
          <p className="text-gray-600">
            {selectedProduct?.description || "Ein hochwertiges Produkt aus unserer exklusiven Kollektion. Perfekt für anspruchsvolle Kunden."}
          </p>
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            In den Warenkorb
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">TurnApp</h1>
              <p className="text-xs text-white/60">Live Preview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to={`/dashboard?shop=${shop.domain}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/20"
            >
              Dashboard
            </Link>
            <Link 
              to={`/dashboard?shop=${shop.domain}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              App veröffentlichen
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Live App-Vorschau</span>
            </div>

            <div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                {shop.appName}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Live in Aktion
                </span>
              </h1>
              <p className="text-xl text-white/80">
                Sieh dir an, wie deine mobile App auf einem iPhone aussieht. 
                Teste alle Features und erlebe das native Mobile-Gefühl.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1">Live Preview</h3>
                <p className="text-sm text-white/70">Echtzeit-Vorschau deiner App</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-1">Native Feel</h3>
                <p className="text-sm text-white/70">Authentisches iOS-Erlebnis</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-1">Personalisiert</h3>
                <p className="text-sm text-white/70">Deine Marke & Farben</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-1">Performance</h3>
                <p className="text-sm text-white/70">Optimiert & schnell</p>
              </div>
            </div>

            {/* Key Features List */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Responsive Design für alle Bildschirmgrößen</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Native iOS-Komponenten und Gesten</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Echtzeit-Synchronisation mit deinem Shop</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Push-Benachrichtigungen und Updates</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowShareModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-xl inline-flex items-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Preview teilen</span>
              </button>
              
              <Link 
                to={`/dashboard?shop=${shop.domain}`}
                className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Anpassen</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-white/60">Responsive</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">&lt;2s</p>
                <p className="text-sm text-white/60">Ladezeit</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">60fps</p>
                <p className="text-sm text-white/60">Performance</p>
              </div>
            </div>
          </div>

          {/* Right Side - iPhone Frame */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
            
            {/* iPhone Frame */}
            <div className="relative">
              <div 
                className="bg-black rounded-[3rem] p-3 shadow-2xl mx-auto" 
                style={{ width: '375px', height: '812px' }}
              >
                {/* iPhone Screen */}
                <div className="bg-white rounded-[2.5rem] h-full flex flex-col overflow-hidden">
                  {/* Notch */}
                  <div className="bg-white h-8 rounded-t-[2.5rem] flex items-center justify-center relative z-10">
                    <div className="w-32 h-6 bg-black rounded-full"></div>
                  </div>

                  {/* App Content Area */}
                  <div className="flex-1 bg-gray-50 overflow-hidden">
                    {selectedProduct && <ProductDetailModal />}
                    
                    {currentView === 'home' && <HomeView />}
                    {currentView === 'products' && <ProductsView />}
                    {currentView === 'profile' && <ProfileView />}
                  </div>

                  {/* iPhone Navigation */}
                  {currentView !== 'product-detail' && (
                    <div className="bg-white border-t border-gray-200 flex items-center justify-around py-3">
                      <button
                        onClick={() => setCurrentView('home')}
                        className={`flex flex-col items-center space-y-1 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        <span className="text-xl">🏠</span>
                        <span className="text-xs font-medium">Home</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('products')}
                        className={`flex flex-col items-center space-y-1 ${currentView === 'products' ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        <span className="text-xl">📦</span>
                        <span className="text-xs font-medium">Produkte</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('profile')}
                        className={`flex flex-col items-center space-y-1 ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        <span className="text-xl">👤</span>
                        <span className="text-xs font-medium">Profil</span>
                      </button>
                    </div>
                  )}

                  {/* iPhone Home Indicator */}
                  <div className="bg-white h-6 flex items-center justify-center pb-2">
                    <div className="w-32 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Device Info Badge */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">iPhone 13 Pro • iOS 17</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Additional Info */}
        <div className="mt-24 grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Download className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sofort verfügbar</h3>
            <p className="text-white/70">
              Deine App ist bereit für den App Store. Veröffentliche mit einem Klick.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Automatische Updates</h3>
            <p className="text-white/70">
              Änderungen in deinem Shop werden automatisch in der App aktualisiert.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Premium Support</h3>
            <p className="text-white/70">
              Unser Team hilft dir bei Fragen und sorgt für einen reibungslosen Ablauf.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Preview teilen</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview-Link
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    value={`https://${shop.domain}/onboarding/preview`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                  />
                  <button className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Kopieren
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Teilen über:</p>
                <div className="grid grid-cols-4 gap-3">
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto"></div>
                    <p className="text-xs mt-2 text-gray-600">E-Mail</p>
                  </button>
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-green-600 rounded-lg mx-auto"></div>
                    <p className="text-xs mt-2 text-gray-600">WhatsApp</p>
                  </button>
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-400 rounded-lg mx-auto"></div>
                    <p className="text-xs mt-2 text-gray-600">Twitter</p>
                  </button>
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-700 rounded-lg mx-auto"></div>
                    <p className="text-xs mt-2 text-gray-600">LinkedIn</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Custom styles for glassmorphism effect */
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
        }
        
        .backdrop-blur-2xl {
          backdrop-filter: blur(40px);
        }
      `}</style>
    </div>
  );
}