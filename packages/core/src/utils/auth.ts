import qs from 'query-string';

import { AuthConfig } from '../types';

type Params = { [key: string]: any };

export const queryWithAuthConfig = (config: AuthConfig, params: Params = {}): string => {
  const { apiKey, apiSecret, ...otherConfig } = config;
  return qs.stringify({
    ...params,
    ...otherConfig,
    k: btoa(apiKey),
    s: btoa(apiSecret),
  });
};
