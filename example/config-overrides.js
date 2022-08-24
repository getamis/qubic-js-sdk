const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const projectRoot = path.resolve(__dirname, '..');
const packages = path.resolve(projectRoot, 'packages');
const exampleRoot = `${__dirname}/src`;

function override(config, env) {
  // include sdk src
  // Ref: https://stackoverflow.com/questions/65893787/create-react-app-with-typescript-and-npm-link-enums-causing-module-parse-failed

  const oneOfIndex = config.module.rules.findIndex(rule => {
    return Object.keys(rule).includes('oneOf');
  });

  config.module.rules[oneOfIndex].oneOf.forEach(rule => {
    if (rule.include === exampleRoot) {
      rule.include = [
        exampleRoot,
        path.resolve(packages, 'react', 'src'),
        path.resolve(packages, 'browser', 'src'),
        path.resolve(packages, 'core', 'src'),
      ];
    }
  });

  // Work around for Buffer is undefined:
  // https://github.com/webpack/changelog-v5/issues/10
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      assert: ['assert', 'assert'],
      process: 'process/browser',
    }),
  ];

  config.resolve = {
    ...config.resolve,
    fallback: {
      assert: false,
      url: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  };

  // Ref: https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
  config.resolve.plugins = config.resolve.plugins.filter(p => !(p instanceof ModuleScopePlugin));

  fs.readdirSync(packages)
    .filter(name => !name.startsWith('.'))
    .forEach(name => {
      config.resolve.alias[`@qubic-js/${name}`] = path.resolve(
        packages,
        name,
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(`${packages}/${name}/package.json`).source,
      );
    });

  return config;
}

module.exports = override;
