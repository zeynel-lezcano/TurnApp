/**
 * Checkout WebView Component
 * 
 * Handles Shopify Checkout in WebView
 * Navigiert zu Shopify Checkout und handled Success/Error States
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BrandingConfig } from '../types';

interface CheckoutWebViewProps {
  checkoutUrl: string;
  branding: BrandingConfig;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckoutWebView: React.FC<CheckoutWebViewProps> = ({
  checkoutUrl,
  branding,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Check for successful checkout completion
    // Shopify redirects to /thank_you or /orders after successful purchase
    if (url.includes('/thank_you') || url.includes('/orders')) {
      Alert.alert(
        'Order Complete!',
        'Thank you for your purchase!',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load checkout. Please try again.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Close Button */}
      <View style={[styles.header, { backgroundColor: branding.primaryColor }]}>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: branding.primaryColor }]}
            onPress={() => setError(null)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          mixedContentMode="compatibility"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
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
});