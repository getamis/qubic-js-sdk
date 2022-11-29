import { Network } from '../types';

export const WALLET_URL = 'https://wallet.qubic.app';

// https://infura.io/docs/ethereum#section/Choose-a-Network
export const INFURA_NETWORK_ENDPOINTS: Record<Network, string> = {
  [Network.MAINNET]: 'mainnet',
  [Network.GOERLI]: 'goerli',
  [Network.POLYGON]: 'polygon-mainnet',
  [Network.MUMBAI]: 'polygon-mumbai',
  // [Network.OPTIMISTIC]: 'optimism-mainnet',
  // [Network.ARBITRUM]: 'arbitrum-mainnet',

  // bsc does not support
  [Network.BSC]: '',
  [Network.BSC_TESTNET]: '',
};
