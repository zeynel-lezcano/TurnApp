/**
 * turn2app Mobile Demo - Main App Component
 * 
 * Hauptkomponente der Mobile Demo App
 * Lädt turn2app Config, zeigt Products mit Dynamic Branding, handled Checkout
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Config from 'react-native-config';

import { Turn2AppAPI } from './services/Turn2AppAPI';
import { ProductCard } from './components/ProductCard';
import { CheckoutWebView } from './components/CheckoutWebView';
import { Turn2AppConfig, ShopifyProduct } from './types';

const App: React.FC = () => {
  // State Management
  const [config, setConfig] = useState<Turn2AppConfig | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  // API Service
  const shopDomain = Config.SHOP_DOMAIN || 'demo-shop.myshopify.com';
  const api = new Turn2AppAPI(shopDomain);

  // Load Initial Data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setError(null);
      
      // Load turn2app Config
      console.log('Loading turn2app config...');
      const configData = await api.loadConfig();
      setConfig(configData);
      
      // Load Products
      console.log('Loading products...');
      const productsData = await api.loadProducts(20);
      setProducts(productsData.data.products.edges.map(edge => edge.node));
      
      console.log('Initial data loaded successfully');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Failed to load initial data:', message);
      setError(message);
      
      // Fallback to demo data if API fails
      if (Config.DEMO_MODE === 'true') {
        setConfig(createDemoConfig());
      }
      
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCheckout = async (variantId: string) => {
    try {
      const url = await api.getCheckoutUrl(variantId);
      setCheckoutUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      Alert.alert('Checkout Error', message);
    }
  };

  const closeCheckout = () => {
    setCheckoutUrl(null);
  };

  const handleCheckoutSuccess = () => {
    Alert.alert(
      'Success!',
      'Thank you for your purchase!',
      [{ text: 'OK', onPress: () => setCheckoutUrl(null) }]
    );
  };

  // Demo Fallback Config
  const createDemoConfig = (): Turn2AppConfig => ({
    shop: shopDomain,
    branding: {
      brandName: 'Demo Shop',
      primaryColor: '#007AFF',
      tagline: 'Demo Mode - Connect to turn2app Backend'
    },
    storefrontEndpoint: `https://${shopDomain}/api/2024-01/graphql.json`,
    appVersion: '1.0.0'
  });

  // Render Checkout WebView
  if (checkoutUrl && config) {
    return (
      <CheckoutWebView
        checkoutUrl={checkoutUrl}
        branding={config.branding}
        onClose={closeCheckout}
        onSuccess={handleCheckoutSuccess}
      />
    );
  }

  // Render Main App
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={config?.branding.primaryColor || '#007AFF'} 
      />
      
      {/* Header with Dynamic Branding */}
      <View style={[
        styles.header, 
        { backgroundColor: config?.branding.primaryColor || '#007AFF' }
      ]}>
        <Text style={styles.headerTitle}>
          {config?.branding.brandName || 'turn2app Demo'}
        </Text>
        {config?.branding.tagline && (
          <Text style={styles.headerTagline}>
            {config.branding.tagline}
          </Text>
        )}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading shop data...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: config?.branding.primaryColor || '#007AFF' }
            ]}
            onPress={loadInitialData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product List */}
      {!loading && !error && products.length > 0 && (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              branding={config?.branding || createDemoConfig().branding}
              onCheckout={handleCheckout}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={config?.branding.primaryColor || '#007AFF'}
            />
          }
        />
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: config?.branding.primaryColor || '#007AFF' }
            ]}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerTagline: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default App;