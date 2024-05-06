import { Network, NetworkInfo, Token } from '../types';

// defined by Qubic backend
export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000455448';

const ETHEREUM_NATIVE_TOKEN: Token = {
  symbol: 'ETH',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
};

const POLYGON_NATIVE_TOKEN: Token = {
  symbol: 'MATIC',
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

  [Network.HOLESKY]: {
    name: 'holesky',
    chainId: Network.HOLESKY,
    // ens currently does not support holesky
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://holesky.etherscan.io',
    color: '#f6c343',
    nativeToken: ETHEREUM_NATIVE_TOKEN,
    networkType: 'ethereum',
    rpc: {
      infuraNetwork: 'holesky',
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
};

export const DEFAULT_INFURA_PROJECT_ID = '9aa3d95b3bc440fa88ea12eaa4456161';
