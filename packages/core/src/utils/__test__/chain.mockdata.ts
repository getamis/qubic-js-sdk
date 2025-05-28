import {
  Network,
  ChainType,
  ChainNetworkType,
  NetworkInfo,
  ChainInfo,
 } from "../../types";

export const mockNetworkInfo1: NetworkInfo = {
  chainId: Network.MAINNET,
  chainName: 'Ethereum',
  blockExplorerUrls: ['https://etherscan.io'],
  nativeCurrency: {
    id: '1',
    chainId: Network.MAINNET,
    address: '0x0000000000000000000000000000000000000000',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.infura.io'],
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.ETHEREUM,
};

export const mockNetworkInfo2: NetworkInfo = {
  chainId: Network.POLYGON,
  chainName: 'Polygon',
  blockExplorerUrls: ['https://polygonscan.com'],
  nativeCurrency: {
    id: '137',
    chainId: Network.POLYGON,
    address: '0x0000000000000000000000000000000000001010',
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com'],
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.POLYGON,
};

export const mockNetworkInfo3: NetworkInfo = {
  chainId: Network.BSC,
  chainName: 'BNB Chain',
  blockExplorerUrls: ['https://bscscan.com'],
  nativeCurrency: {
    id: '56',
    chainId: Network.BSC,
    address: '0x0000000000000000000000000000000000000000',
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org'],
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.BSC,
};

export const mockNetworkInfo4: NetworkInfo = {
  chainId: Network.ARBITRUM,
  chainName: 'Arbitrum One',
  blockExplorerUrls: ['https://arbiscan.io'],
  nativeCurrency: {
    id: '42161',
    chainId: Network.ARBITRUM,
    address: '0x0000000000000000000000000000000000000000',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.ARBITRUM,
};

export const mockNetworkInfo5: NetworkInfo = {
  chainId: Network.BSC_TESTNET,
  chainName: 'BNB Chain Testnet',
  blockExplorerUrls: ['https://testnet.bscscan.com'],
  nativeCurrency: {
    id: '97',
    chainId: Network.BSC_TESTNET,
    address: '0x0000000000000000000000000000000000000000',
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  type: ChainType.TESTNET,
  networkType: ChainNetworkType.BSC,
};

export const mockChainInfo1: ChainInfo = {
  id: '1',
  chainId: Network.MAINNET,
  name: 'Ethereum',
  blockExplorerUrls: ['https://etherscan.io'],
  rpcUrls: ['https://mainnet.infura.io'],
  nativeToken: mockNetworkInfo1.nativeCurrency,
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.ETHEREUM,
};

export const mockChainInfo2: ChainInfo = {
  id: '137',
  chainId: Network.POLYGON,
  name: 'Polygon',
  blockExplorerUrls: ['https://polygonscan.com'],
  rpcUrls: ['https://polygon-rpc.com'],
  nativeToken: mockNetworkInfo2.nativeCurrency,
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.POLYGON,
};

export const mockChainInfo3: ChainInfo = {
  id: '56',
  chainId: Network.BSC,
  name: 'BNB Chain',
  blockExplorerUrls: ['https://bscscan.com'],
  rpcUrls: ['https://bsc-dataseed.binance.org'],
  nativeToken: mockNetworkInfo3.nativeCurrency,
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.BSC,
};

export const mockChainInfo4: ChainInfo = {
  id: '42161',
  chainId: Network.ARBITRUM,
  name: 'Arbitrum One',
  blockExplorerUrls: ['https://arbiscan.io'],
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  nativeToken: mockNetworkInfo4.nativeCurrency,
  type: ChainType.MAINNET,
  networkType: ChainNetworkType.ARBITRUM,
};

export const mockChainInfo5: ChainInfo = {
  id: '97',
  chainId: Network.BSC_TESTNET,
  name: 'BNB Chain Testnet',
  blockExplorerUrls: ['https://testnet.bscscan.com'],
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  nativeToken: mockNetworkInfo5.nativeCurrency,
  type: ChainType.TESTNET,
  networkType: ChainNetworkType.BSC,
};
