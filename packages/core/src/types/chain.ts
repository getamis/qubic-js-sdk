export enum Network {
  MAINNET = 1,
  HOLESKY = 17000,
  POLYGON = 137,
  AMOY = 80002,
  // OPTIMISTIC = 10,
  BSC = 56,
  BSC_TESTNET = 97,
  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
}

export const ALL_NETWORKS_TYPES = ['ethereum', 'polygon', 'bsc', 'arbitrum'] as const;
export type NetworkType = (typeof ALL_NETWORKS_TYPES)[number];

export type NetworkName =
  | 'mainnet'
  | 'holesky'
  | 'polygon'
  | 'amoy'
  | 'bsc'
  | 'bscTestnet'
  | 'arbitrum'
  | 'arbitrumSepolia';

export interface NetworkInfo {
  name: NetworkName;
  chainId: Network;
  ensAddress: string;
  explorerUrl: string; // no last `/`
  color: string; // for dot color and other usage
  nativeToken: Token;
  networkType: NetworkType;
  rpc:
    | {
        infuraNetwork: string; // check if it support in infura https://docs.infura.io/api/network-endpoints
      }
    | {
        url: string; // otherwise use the chain official endpoint
      };
}
