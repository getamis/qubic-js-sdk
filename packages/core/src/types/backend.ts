import { Network } from './chain';

export interface ApiConfig {
  apiKey?: string;
  apiSecret?: string;
  chainId: Network;
}

export const GRAPHQL_ENDPOINT = 'https://wallet.qubic.app/services/graphql-public';
