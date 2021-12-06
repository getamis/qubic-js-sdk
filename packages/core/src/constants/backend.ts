import { Network } from '../enums';

const DEFAULT_SCHEME = 'https';
const BACKEND_DOMAINS = 'wallet.qubic.app';
export const WALLET_URLS = `${DEFAULT_SCHEME}://wallet.qubic.app`;

// Only example that created by expo cen ues process.env.APP_MANIFEST ENVs
export const getBackendDomain = (devDomain?: string): string => {
  // wallet || example || SDK
  // @ts-ignore
  return devDomain || process.env.APP_MANIFEST?.extra?.BACKEND_DOMAIN || BACKEND_DOMAINS;
};

// Only example that created by expo cen ues process.env.APP_MANIFEST ENVs
export const getWalletUrl = (devUrl?: string): string => {
  // wallet || example || SDK
  // @ts-ignore
  return devUrl || process.env.APP_MANIFEST?.extra?.WALLET_URL || WALLET_URLS;
};

export const getBackendUrl = (scheme: string, path: string, devDomain?: string): string =>
  `${scheme}://${getBackendDomain(devDomain)}${path}`;

export const getGQLEndpoint = (devDomain?: string): string => getBackendUrl(DEFAULT_SCHEME, '/graphql', devDomain);

const endpoints = (path: string, devUrl?: string) => `${getWalletUrl(devUrl)}${path}`;

export const getThirdPartyCardUrl = (devUrl?: string): string => endpoints('/thirdparty/tappay/creditcard', devUrl);

// https://infura.io/docs/ethereum#section/Choose-a-Network
export const INFURA_NETWORK_ENDPOINTS: Record<Network, string> = {
  [Network.MAINNET]: 'mainnet',
  [Network.ROPSTEN]: 'ropsten',
  [Network.RINKEBY]: 'rinkeby',
  [Network.KOVAN]: 'kovan',
  [Network.GOERLI]: 'goerli',
  [Network.POLYGON]: 'polygon-mainnet',
  [Network.MUMBAI]: 'polygon-mumbai',
  [Network.OPTIMISTIC]: 'optimism-mainnet',
  [Network.OPTIMISTIC_KOVAN]: 'optimism-kovan',
  [Network.ARBITRUM]: 'arbitrum-mainnet',
  [Network.ARBITRUM_RINKEBY]: 'arbitrum-rinkeby',
};

export const FORWARDER_ADDRESSES: Record<Network, string> = {
  [Network.MAINNET]: '0xd53bde9fe0d32874c6fbd76508b7e551ebdfa672',
  [Network.ROPSTEN]: '',
  [Network.RINKEBY]: '0x553D7c6ef2369D9E96Aa184e476cD855b9599b42',
  [Network.KOVAN]: '',
  [Network.GOERLI]: '',
  [Network.POLYGON]: '',
  [Network.MUMBAI]: '',
  [Network.OPTIMISTIC]: '',
  [Network.OPTIMISTIC_KOVAN]: '',
  [Network.ARBITRUM]: '',
  [Network.ARBITRUM_RINKEBY]: '',
};

export const getForwarderContract = (network: Network = 1): string => {
  return FORWARDER_ADDRESSES[network];
};
