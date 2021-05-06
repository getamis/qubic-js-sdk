/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = config => {
  const packages = path.resolve(__dirname, 'packages');

  config.context = path.resolve(__dirname);

  config.module.rules.push(
    {
      test: /\.(js|ts|tsx)$/,
      include: /(packages|example|wallet)\/.+/,
      exclude: /node_modules/,
      use: 'babel-loader',
    },
    {
      test: /\.wasm$/,
      type: 'javascript/auto',
    },
  );

  config.resolve.plugins = config.resolve.plugins.filter(p => !(p instanceof ModuleScopePlugin));

  fs.readdirSync(packages)
    .filter(name => !name.startsWith('.'))
    .forEach(name => {
      config.resolve.alias[`@amis-sdk/${name}`] = path.resolve(
        packages,
        name,
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(`${__dirname}/packages/${name}/package.json`).source,
      );
    });

  return config;
};
