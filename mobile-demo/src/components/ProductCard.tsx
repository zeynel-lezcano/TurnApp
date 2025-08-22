/**
 * Product Card Component
 * 
 * Displays einzelnes Produkt mit Bild, Title, Preis und Checkout-Button
 * Verwendet Shop-spezifisches Branding für Farben
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ShopifyProduct, BrandingConfig } from '../types';

interface ProductCardProps {
  product: ShopifyProduct;
  branding: BrandingConfig;
  onCheckout: (variantId: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2; // 2 cards per row with 16px margin

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  branding,
  onCheckout,
}) => {
  const firstImage = product.images.edges[0]?.node;
  const firstVariant = product.variants.edges[0]?.node;
  
  if (!firstVariant) {
    return null; // Skip products without variants
  }

  const handleCheckout = () => {
    onCheckout(firstVariant.id);
  };

  return (
    <View style={styles.card}>
      {/* Product Image */}
      {firstImage && (
        <Image
          source={{ uri: firstImage.url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        
        <Text style={styles.price}>
          {firstVariant.price.amount} {firstVariant.price.currencyCode}
        </Text>
        
        {/* Checkout Button with Dynamic Branding */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleCheckout}
          disabled={!firstVariant.availableForSale}
        >
          <Text style={styles.buttonText}>
            {firstVariant.availableForSale ? 'Buy Now' : 'Sold Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  checkoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});