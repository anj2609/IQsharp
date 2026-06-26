module.exports = {
  dependencies: {
    // Broken native build — replaced with react-native-webview in JS
    'react-native-video': {
      platforms: { android: null },
    },
    // No longer used in JS — replaced with WebView + Google Docs Viewer
    'react-native-pdf': {
      platforms: { android: null },
    },
    'react-native-fs': {
      platforms: { android: null },
    },
    'react-native-blob-util': {
      platforms: { android: null },
    },
  },
};
