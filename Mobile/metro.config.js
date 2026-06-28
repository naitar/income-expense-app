const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web platform support
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Enable require.context for web
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
