/**
 * TurnApp Mobile Demo Entry Point
 * 
 * React Native Demo für TurnApp Shopify Integration
 * Konsumiert /api/config und zeigt Dynamic Branding + Product List
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);