module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      envName: 'APP_ENV',
      moduleName: 'react-native-config',
      path: '.env',
      blocklist: null,
      allowlist: null,
      blacklist: null, // DEPRECATED
      whitelist: null, // DEPRECATED
      safe: false,
      allowUndefined: true,
      verbose: false,
    }],
  ],
};