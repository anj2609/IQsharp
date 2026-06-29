module.exports = {
  dependencies: {
    // Replaced with react-native-webview for online streaming
    'react-native-video': {
      platforms: { android: null },
    },
    // Replaced with react-native-file-viewer for local files
    'react-native-pdf': {
      platforms: { android: null },
    },
    // Enabled: used for offline file downloads
    // 'react-native-fs': { platforms: { android: null } },
    'react-native-blob-util': {
      platforms: { android: null },
    },
  },
};
