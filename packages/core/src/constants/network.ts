import { Network, NetworkInfo, Token } from '../types';

// defined by Qubic backend
export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000455448';

const ETHEREUM_NATIVE_TOKEN: Token = {
  symbol: 'ETH',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
};

const POLYGON_NATIVE_TOKEN: Token = {
  symbol: 'POL',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
};

const BSC_NATIVE_TOKEN: Token = {
  symbol: 'BNB',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
};

export const NETWORK_INFO: Record<Network, NetworkInfo> = {
  [Network.MAINNET]: {
    name: 'mainnet',
    chainId: Network.MAINNET,
    ensAddress: '0x314159265dd8dbb310642f98f50c066173c1259b',
    explorerUrl: 'https://etherscan.io',
    color: '#3cc29e',
    nativeToken: ETHEREUM_NATIVE_TOKEN,
    networkType: 'ethereum',
    rpc: {
      infuraNetwork: 'mainnet',
    },
  },

  [Network.HOODI]: {
    name: 'hoodi',
    chainId: Network.HOODI,
    // ens currently does not support hoodi
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://hoodi.etherscan.io',
    color: '#f6c343',
    nativeToken: ETHEREUM_NATIVE_TOKEN,
    networkType: 'ethereum',
    rpc: {
      infuraNetwork: 'hoodi',
    },
  },

  [Network.POLYGON]: {
    name: 'polygon',
    chainId: Network.POLYGON,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247e5',
    nativeToken: POLYGON_NATIVE_TOKEN,
    networkType: 'polygon',
    rpc: {
      infuraNetwork: 'polygon-mainnet',
    },
  },

  [Network.AMOY]: {
    name: 'amoy',
    chainId: Network.AMOY,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://amoy.polygonscan.com/',
    color: '#de4437',
    nativeToken: POLYGON_NATIVE_TOKEN,
    networkType: 'polygon',
    rpc: {
      infuraNetwork: 'polygon-amoy',
    },
  },

  [Network.BSC]: {
    name: 'bsc',
    chainId: Network.BSC,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://bscscan.com',
    color: '#F0B90b',
    nativeToken: BSC_NATIVE_TOKEN,
    networkType: 'bsc',
    rpc: {
      url: 'https://bsc-dataseed1.binance.org',
    },
  },

  [Network.BSC_TESTNET]: {
    name: 'bscTestnet',
    chainId: Network.BSC_TESTNET,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://testnet.bscscan.com',
    color: '#12161c',
    nativeToken: BSC_NATIVE_TOKEN,
    networkType: 'bsc',
    rpc: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    },
  },
  [Network.ARBITRUM]: {
    name: 'arbitrum',
    chainId: Network.ARBITRUM,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://arbiscan.io',
    color: '#1b4add',
    nativeToken: ETHEREUM_NATIVE_TOKEN, // Using ETH as native token
    networkType: 'arbitrum',
    rpc: {
      infuraNetwork: 'arbitrum-mainnet',
    },
  },
};

export const DEFAULT_INFURA_PROJECT_ID = '954810afb5474a309612a18a448250e4';
