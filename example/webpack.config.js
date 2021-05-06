/* eslint-disable @typescript-eslint/no-var-requires */
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

const common = require('../webpack.common');

module.exports = async (env, argv) => {
  const config = await createExpoWebpackConfigAsync(env, argv);
  return common(config);
};
