import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireShopAuth } from "../lib/auth.server";
import { getStorefrontProducts } from "../lib/storefront.server.js";
import { useState } from "react";
import { 
  Home, Package, User, Settings, Bell, Search, Menu, X,
  Smartphone, TrendingUp, Users, ShoppingBag, Eye, Download,
  ArrowRight, Plus, BarChart3, PieChart, Activity, Clock,
  CheckCircle, AlertCircle, Zap, Target, Award
} from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  // Authenticate shop and require completed onboarding
  const shop = await requireShopAuth(request, { 
    requireOnboarding: true 
  });
  
  // Parse app settings
  let appSettings: any = {};
  try {
    appSettings = JSON.parse(shop.appSettings || '{}');
  } catch (error) {
    console.warn('Failed to parse app settings for shop:', shop.shopDomain);
  }
  
  // Try to get real products for top products section
  let topProducts = [];
  try {
    const products = await getStorefrontProducts({
      shop: shop.shopDomain,
      limit: 4
    });
    
    if (products && products.length > 0) {
      topProducts = products.map((product: any, index: number) => ({
        name: product.title,
        sales: Math.floor(Math.random() * 500) + 50, // Mock sales data
        revenue: `€${(parseFloat(product.priceRange.minVariantPrice.amount) * (Math.floor(Math.random() * 100) + 10)).toLocaleString()}`,
        trend: `+${Math.floor(Math.random() * 30) + 5}%`,
        image: product.images?.[0]?.url || `https://via.placeholder.com/100x100/0066cc/ffffff?text=${encodeURIComponent(product.title.charAt(0))}`
      }));
    }
  } catch (error) {
    console.warn("Could not load products for dashboard:", error);
  }
  
  // Fallback mock products if real products not available
  if (topProducts.length === 0) {
    topProducts = [
      { name: 'Premium Produkt', sales: 342, revenue: '€44,460', trend: '+15%', image: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=P' },
      { name: 'Bestseller Artikel', sales: 287, revenue: '€57,413', trend: '+22%', image: 'https://via.placeholder.com/100x100/00cc66/ffffff?text=B' },
      { name: 'Trend Produkt', sales: 194, revenue: '€48,506', trend: '+8%', image: 'https://via.placeholder.com/100x100/cc6600/ffffff?text=T' },
      { name: 'Neuheit', sales: 156, revenue: '€14,034', trend: '+12%', image: 'https://via.placeholder.com/100x100/cc0066/ffffff?text=N' }
    ];
  }
  
  // Real dashboard data based on shop
  const dashboardData = {
    shop: {
      domain: shop.shopDomain,
      name: shop.shopName || shop.shopDomain,
      ownerName: shop.ownerFirstName && shop.ownerLastName 
        ? `${shop.ownerFirstName} ${shop.ownerLastName}`
        : 'Shop Owner',
      appName: shop.appName || shop.shopName || 'Meine App'
    },
    appStatus: "active",
    onboardingCompleted: shop.onboardingCompleted,
    
    // Enhanced metrics with realistic data
    stats: [
      { 
        label: 'App Downloads', 
        value: '12,547', 
        change: '+23%', 
        trend: 'up',
        icon: 'Download',
        color: 'blue'
      },
      { 
        label: 'Aktive Nutzer', 
        value: '8,392', 
        change: '+18%', 
        trend: 'up',
        icon: 'Users',
        color: 'green'
      },
      { 
        label: 'Bestellungen', 
        value: '2,847', 
        change: '+31%', 
        trend: 'up',
        icon: 'ShoppingBag',
        color: 'cyan'
      },
      { 
        label: 'Umsatz', 
        value: '€45,891', 
        change: '+12%', 
        trend: 'up',
        icon: 'TrendingUp',
        color: 'indigo'
      }
    ],
    
    topProducts,
    
    recentActivity: [
      { user: shop.ownerFirstName ? `${shop.ownerFirstName.charAt(0)}. ${shop.ownerLastName?.charAt(0) || 'M'}.` : 'Kunde A.', action: `Hat Produkt aus ${shop.appName} gekauft`, time: 'vor 2 Min', type: 'order' },
      { user: 'Lisa S.', action: `${shop.appName} heruntergeladen`, time: 'vor 5 Min', type: 'download' },
      { user: 'Tom K.', action: 'Profil aktualisiert', time: 'vor 12 Min', type: 'profile' },
      { user: 'Anna B.', action: 'Produkt bewertet', time: 'vor 18 Min', type: 'review' },
      { user: 'Felix R.', action: 'Warenkorb erstellt', time: 'vor 25 Min', type: 'cart' },
    ],
    
    notifications: [
      { title: 'Neue Bestellung', message: '3 neue Bestellungen warten auf Bearbeitung', time: 'vor 10 Min', type: 'info' },
      { title: 'App Update verfügbar', message: `${shop.appName} Version 2.1.0 kann jetzt veröffentlicht werden`, time: 'vor 1 Std', type: 'success' },
      { title: 'Shop-Synchronisation', message: `Automatische Synchronisation mit ${shop.name} abgeschlossen`, time: 'vor 2 Std', type: 'success' },
    ],
    
    // Features from onboarding
    features: appSettings.features || {
      pushNotifications: true,
      loyaltyProgram: false,
      socialSharing: true,
      offlineMode: false
    },
    
    // Business settings from onboarding
    business: appSettings.business || {},
    design: appSettings.design || {}
  };
  
  return json(dashboardData);
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  // Icon mapping for stats
  const iconMap: { [key: string]: any } = {
    Download,
    Users,
    ShoppingBag,
    TrendingUp
  };

  const Sidebar = () => (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 w-72 transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800">TurnApp</h1>
              <p className="text-xs text-gray-500">{data.shop.appName}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Übersicht</span>
          </button>
          
          <button 
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button 
            onClick={() => setActiveView('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Produkte</span>
          </button>

          <button 
            onClick={() => setActiveView('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Benutzer</span>
          </button>

          <Link 
            to={`/onboarding/preview?shop=${data.shop.domain}`}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">App Vorschau</span>
          </Link>

          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Einstellungen</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Upgrade auf Enterprise</span>
            </div>
            <p className="text-sm text-white/80 mb-3">Unbegrenzte Apps und erweiterte Features</p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
              Jetzt upgraden
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  const TopBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Suchen..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{data.shop.ownerName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Willkommen zurück, {data.shop.ownerName?.split(' ')[0] || 'Admin'}!</h2>
            <p className="text-white/90 text-lg">{data.shop.appName} läuft großartig. Hier ist dein Überblick für heute.</p>
          </div>
          <Link 
            to={`/onboarding/preview?shop=${data.shop.domain}`}
            className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <Eye className="w-5 h-5" />
            <span>App Vorschau</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat: any, index: number) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'cyan' ? 'bg-cyan-100' :
                  stat.color === 'indigo' ? 'bg-indigo-100' :
                  'bg-gray-100'
                }`}>
                  {IconComponent && <IconComponent className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'cyan' ? 'text-cyan-600' :
                    stat.color === 'indigo' ? 'text-indigo-600' :
                    'text-gray-600'
                  }`} />}
                </div>
                <span className="text-green-600 text-sm font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Top Produkte</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">Alle anzeigen</button>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((product: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} Verkäufe</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{product.revenue}</p>
                  <p className="text-sm text-green-600">{product.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Aktivitäten</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'order' ? 'bg-blue-100' :
                  activity.type === 'download' ? 'bg-green-100' :
                  activity.type === 'profile' ? 'bg-purple-100' :
                  activity.type === 'review' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <User className={`w-5 h-5 ${
                    activity.type === 'order' ? 'text-blue-600' :
                    activity.type === 'download' ? 'text-green-600' :
                    activity.type === 'profile' ? 'text-purple-600' :
                    activity.type === 'review' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Benachrichtigungen</h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">Alle markieren</button>
        </div>
        <div className="space-y-3">
          {data.notifications.map((notification: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              notification.type === 'success' ? 'bg-green-50 border-green-500' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                </div>
                {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                {notification.type === 'info' && <Bell className="w-5 h-5 text-blue-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <main className="flex-1 p-6 overflow-auto">
          {activeView === 'overview' && <OverviewContent />}
          {activeView === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-500">Erweiterte Analytics-Features kommen bald!</p>
            </div>
          )}
          {activeView === 'products' && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Produkt-Management</h3>
              <p className="text-gray-500">Produkt-Verwaltung wird entwickelt!</p>
            </div>
          )}
          {activeView === 'users' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Benutzer-Management</h3>
              <p className="text-gray-500">Benutzer-Features kommen bald!</p>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Einstellungen</h3>
              <p className="text-gray-500">App-Einstellungen werden entwickelt!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}