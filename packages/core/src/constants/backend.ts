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

export const NODE_URLS = {
  [Network.MAINNET]: 'wss://mainnet.infura.io/ws/v3/34813e03032144f691039e83a1461972',
  [Network.ROPSTEN]: 'wss://ropsten.infura.io/ws/v3/34813e03032144f691039e83a1461972',
  [Network.RINKEBY]: 'wss://rinkeby.infura.io/ws/v3/34813e03032144f691039e83a1461972',
  [Network.POLYGON]: 'wss://polygon-mainnet.infura.io/ws/v3/34813e03032144f691039e83a1461972',
  [Network.MUMBAI]: 'wss://polygon-mumbai.infura.io/ws/v3/34813e03032144f691039e83a1461972',
};

export const FORWARDER_ADDRESSES = {
  [Network.MAINNET]: '0xd53bde9fe0d32874c6fbd76508b7e551ebdfa672',
  [Network.ROPSTEN]: '',
  [Network.RINKEBY]: '0x553D7c6ef2369D9E96Aa184e476cD855b9599b42',
  [Network.POLYGON]: '',
  [Network.MUMBAI]: '',
};

export const getForwarderContract = (network: Network = 1): string => {
  return FORWARDER_ADDRESSES[network];
};

export const getEnvApiKey = (): string => {
  // @ts-ignore
  return process.env.APP_MANIFEST?.extra?.API_KEY;
};

export const getEnvApiSecret = (): string => {
  // @ts-ignore
  return process.env.APP_MANIFEST?.extra?.API_SECRET;
};
