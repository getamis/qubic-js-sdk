import qs from 'query-string';

import { ApiConfig, SignInProvider } from '../types';

// we can't import ../../package.json it will caused monorepo wrong dep issue
// so we use genversion to create version.js file
import sdkVersion from './version';

export const urlWithApiConfig = (url: string, config: ApiConfig, signInProvider?: SignInProvider): string => {
  const { apiKey, apiSecret, chainId } = config;

  return qs.stringifyUrl({
    url,
    query: {
      sdkVersion,
      ...(chainId && { network: chainId }),
      ...(apiKey && { k: btoa(apiKey) }),
      ...(apiSecret && { s: btoa(apiSecret) }),
      ...(signInProvider && { provider: signInProvider }),
    },
  });
};
