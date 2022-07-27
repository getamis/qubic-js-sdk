import qs from 'query-string';

import { ApiConfig } from '../types';

export const urlWithApiConfig = (url: string, config: ApiConfig): string => {
  const { apiKey, apiSecret, chainId } = config;

  return qs.stringifyUrl({
    url,
    query: {
      ...(chainId && { network: chainId }),
      ...(apiKey && { k: btoa(apiKey) }),
      ...(apiSecret && { s: btoa(apiSecret) }),
    },
  });
};
