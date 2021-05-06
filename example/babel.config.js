module.exports = api => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-transform-modules-commonjs',
    ],
  };
};
