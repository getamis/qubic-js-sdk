module.exports = api => {
  api.cache(true);

  const config = {
    presets: [
      [
        '@babel/preset-typescript',
        {
          allowNamespaces: true,
          allowDeclareFields: true,
        },
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-transform-modules-commonjs',
    ],
  };

  return config;
};
