import { Network } from '../enums';

const BACKEND_DOMAINS = {
  [Network.MAINNET]: 'wallet.qubic.app',
  [Network.ROPSTEN]: 'tmp-dev-xiuzhu.raicrypt.com',
  [Network.RINKEBY]: 'qubee-rinkeby-xiuzhu.raicrypt.com',
};

export const getBackendDomain = (network: Network = 1): string => {
  // @ts-ignore
  return process.env.APP_MANIFEST?.extra?.BACKEND_DOMAIN || BACKEND_DOMAINS[network];
};

export const getBackendUrl = (scheme: string, path: string, network?: Network): string => {
  return `${scheme}://${getBackendDomain(network)}${path}`;
};

export const getGQLEndpoint = (network?: Network): string => {
  return getBackendUrl('https', '/graphql', network);
};

export const WALLET_URLS = {
  [Network.MAINNET]: 'https://wallet.qubic.app',
  [Network.ROPSTEN]: 'https://d3klxj5aubi32r.cloudfront.net',
  // [Network.RINKEBY]: 'https://d3klxj5aubi32r.cloudfront.net',
  [Network.RINKEBY]: 'https://localhost:19007',
};

export const getWalletUrl = (network: Network = 1): string => {
  // @ts-ignore
  return process.env.APP_MANIFEST?.extra?.WALLET_URL || WALLET_URLS[network];
};

const endpoints = (path: string) => ({
  [Network.MAINNET]: `${getWalletUrl(Network.MAINNET)}${path}`,
  [Network.ROPSTEN]: `${getWalletUrl(Network.ROPSTEN)}${path}`,
  [Network.RINKEBY]: `${getWalletUrl(Network.RINKEBY)}${path}`,
});

export const SEND_RESULT_URLS = endpoints('/send/result');

export const THIRD_PARTY_TAPPAY_CARD = endpoints('/thirdparty/tappay/creditcard');

export const NODE_URLS = {
  [Network.MAINNET]: 'wss://mainnet.infura.io/ws/v3/3e0eb8f34fac469b9286936ff1423270',
  [Network.ROPSTEN]: 'wss://ropsten.infura.io/ws/v3/3e0eb8f34fac469b9286936ff1423270',
  [Network.RINKEBY]: 'wss://rinkeby.infura.io/ws/v3/3e0eb8f34fac469b9286936ff1423270',
};

export const FORWARDER_ADDRESSES = {
  [Network.MAINNET]: '0xd53bde9fe0d32874c6fbd76508b7e551ebdfa672',
  [Network.ROPSTEN]: '',
  [Network.RINKEBY]: '0x553D7c6ef2369D9E96Aa184e476cD855b9599b42',
};

export const getForwarderContract = (network: Network = 1): string => {
  return FORWARDER_ADDRESSES[network];
};
