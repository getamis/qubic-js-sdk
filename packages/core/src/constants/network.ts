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
  },

  // deprecated
  // [Network.ROPSTEN]: {
  //   name: 'ropsten',
  //   chainId: Network.ROPSTEN,
  //   ensAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  //   explorerUrl: 'https://ropsten.etherscan.io',
  //   color: '#ff4a8d',
  //   nativeToken: ETHEREUM_NATIVE_TOKEN,
  //   networkType: 'ethereum',
  // },

  [Network.RINKEBY]: {
    name: 'rinkeby',
    chainId: Network.RINKEBY,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    explorerUrl: 'https://rinkeby.etherscan.io',
    color: '#f6c343',
    nativeToken: ETHEREUM_NATIVE_TOKEN,
    networkType: 'ethereum',
  },

  [Network.GOERLI]: {
    name: 'goerli',
    chainId: Network.GOERLI,
    ensAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
    explorerUrl: 'https://goerli.etherscan.io',
    color: '#f6c343',
    nativeToken: ETHEREUM_NATIVE_TOKEN,
    networkType: 'ethereum',
  },

  [Network.POLYGON]: {
    name: 'polygon',
    chainId: Network.POLYGON,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247e5',
    nativeToken: POLYGON_NATIVE_TOKEN,
    networkType: 'polygon',
  },

  [Network.MUMBAI]: {
    name: 'mumbai',
    chainId: Network.MUMBAI,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://mumbai.polygonscan.com',
    color: '#de4437',
    nativeToken: POLYGON_NATIVE_TOKEN,
    networkType: 'polygon',
  },

  [Network.BSC]: {
    name: 'bsc',
    chainId: Network.BSC,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://bscscan.com',
    color: '#F0B90b',
    nativeToken: BSC_NATIVE_TOKEN,
    networkType: 'bsc',
  },

  [Network.BSC_TESTNET]: {
    name: 'bscTestnet',
    chainId: Network.BSC_TESTNET,
    ensAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://testnet.bscscan.com',
    color: '#12161c',
    nativeToken: BSC_NATIVE_TOKEN,
    networkType: 'bsc',
  },
};

export const DEFAULT_INFURA_PROJECT_ID = '9aa3d95b3bc440fa88ea12eaa4456161';
