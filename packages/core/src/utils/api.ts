import qs from 'query-string';

import { ApiConfig, SignInProvider } from '../types';

export const urlWithApiConfig = (
  url: string,
  config: ApiConfig,
  disableFastSignup: boolean,
  signInProvider?: SignInProvider,
): string => {
  const { apiKey, apiSecret, chainId } = config;

  return qs.stringifyUrl({
    url,
    query: {
      disableFastSignup,
      ...(chainId && { network: chainId }),
      ...(apiKey && { k: btoa(apiKey) }),
      ...(apiSecret && { s: btoa(apiSecret) }),
      ...(signInProvider && { provider: signInProvider }),
    },
  });
};
