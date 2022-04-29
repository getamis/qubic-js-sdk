const webpack = require('webpack');

function override(config) {
  // Work around for Buffer is undefined:
  // https://github.com/webpack/changelog-v5/issues/10
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ];

  config.resolve = {
    ...config.resolve,
    fallback: {
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  };

  return config;
}

module.exports = override;
