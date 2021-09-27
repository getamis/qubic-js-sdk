import crypto from 'crypto-js';

import { getGQLEndpoint } from '../constants/backend';
import { AuthConfig } from '../types';

const HTTP_METHOD = 'POST';

export const gqlQuery = async <T = any>(query: string, cfg?: AuthConfig): Promise<T> => {
  const { apiKey, apiSecret } = cfg as AuthConfig;

  const FULL_GQL_URI = getGQLEndpoint();

  const urlObj = new URL(FULL_GQL_URI);
  const requestURI = `${urlObj.pathname}${urlObj.search}`;

  const headers: { [key: string]: unknown } = {};
  const body = JSON.stringify({ query });

  const now = Date.now();

  const msg = `${now}${HTTP_METHOD}${requestURI}${body}`;
  const sig = apiSecret ? crypto.HmacSHA256(msg, apiSecret).toString(crypto.enc.Base64) : undefined;

  if (body) {
    headers['X-Es-Encrypted'] = 'yes';
  }

  const result = await fetch(FULL_GQL_URI, {
    method: 'POST',
    credentials: 'include',
    // @ts-ignore
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // CORS
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      // API Key
      'X-Es-Api-Key': apiKey,
      'X-Es-Ts': now,
      'X-Es-Sign': sig,
      ...headers,
    },
    body,
  }).then(r => r.json());

  if (!result?.data) throw new Error('empty data');

  return result?.data as T;
};
