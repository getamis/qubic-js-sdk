module.exports = api => {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        // Target the current node version for tests
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-typescript',
      {
        allowNamespaces: true,
        allowDeclareFields: true,
      },
    ],
    // Add preset for React since it's in the project
    '@babel/preset-react',
  ];

  const plugins = [
    // This plugin is still useful to avoid duplicating helper functions
    '@babel/plugin-transform-runtime',
  ];

  const config = {
    presets,
    plugins,
  };

  return config;
};
