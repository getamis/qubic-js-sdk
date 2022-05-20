import qs from 'query-string';

import { ApiConfig, Network } from '../types';

type Params = Record<string, string | number>;

export const queryWithApiConfig = (config: ApiConfig & { network: Network }, params: Params = {}): string => {
  const { apiKey, apiSecret, ...otherConfig } = config;
  return qs.stringify({
    ...params,
    ...otherConfig,
    k: btoa(apiKey),
    s: btoa(apiSecret),
  });
};
