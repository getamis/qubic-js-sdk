export type ID = string;
export type Address = `0x${string}`;

export enum Network {
  MAINNET = 1,
  HOODI = 560048,
  POLYGON = 137,
  AMOY = 80002,
  BSC = 56,
  BSC_TESTNET = 97,
  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,
}

export enum ChainType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export enum ChainNetworkType {
  ETHEREUM = 'ETHEREUM',
  BSC = 'BSC',
  POLYGON = 'POLYGON',
  ARBITRUM = 'ARBITRUM',
}

export interface TokenInfo {
  id: ID;
  chainId: number;
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

// interface Chain is used to represent chain data from api
export interface ChainInfo {
  id: ID;
  chainId: number;
  name: string;
  blockExplorerUrls: string[];
  rpcUrls: string[];
  nativeToken: TokenInfo;
  networkType: ChainNetworkType;
  type: ChainType;
}

// interface NetworkInfo is used to represent chain data parsed by the sdk
export interface NetworkInfo {
  chainId: Network;
  chainName: string;
  blockExplorerUrls: string[];
  nativeCurrency: TokenInfo;
  rpcUrls: string[];
  type: ChainType;
  networkType: ChainNetworkType;
}
