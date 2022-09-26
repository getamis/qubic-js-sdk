export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4, // deprecated
  GOERLI = 5,
  // KOVAN = 42,
  POLYGON = 137,
  MUMBAI = 80001,
  // OPTIMISTIC = 10,
  // OPTIMISTIC_KOVAN = 69,
  // ARBITRUM = 200,
  // ARBITRUM_RINKEBY = 421611,
  BSC = 56,
  BSC_TESTNET = 97,
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
}

export const ALL_NETWORKS_TYPES = ['ethereum', 'polygon', 'bsc'] as const;
export type NetworkType = typeof ALL_NETWORKS_TYPES[number];

export interface NetworkInfo {
  name: 'mainnet' | 'ropsten' | 'rinkeby' | 'goerli' | 'polygon' | 'mumbai' | 'bsc' | 'bscTestnet';
  chainId: Network;
  ensAddress: string;
  explorerUrl: string; // no last `/`
  color: string; // for dot color and other usage
  nativeToken: Token;
  networkType: NetworkType;
}
