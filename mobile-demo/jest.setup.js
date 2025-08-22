// Jest setup for React Native Testing
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  TURNAPP_API_URL: 'http://localhost:3000',
  SHOP_DOMAIN: 'test-shop.myshopify.com',
  DEMO_MODE: 'true',
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: View,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));