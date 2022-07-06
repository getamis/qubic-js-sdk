import { BaseProvider, WALLET_URL } from '@qubic-js/core';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';

export interface BrowserProviderOptions {
  apiKey: string;
  apiSecret: string;
  chainId: number;
  walletUrl?: string; // optional, it not provided use production wallet url
  infuraProjectId: string;
  enableIframe?: boolean;
  inAppHintLink?: string;
}

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;

  constructor(options: BrowserProviderOptions) {
    const {
      apiKey,
      apiSecret,
      chainId,
      infuraProjectId,
      enableIframe = false,
      walletUrl = WALLET_URL,
      inAppHintLink,
    } = options;

    const { hide, bridge, createPrepareBridgeMiddleware } = enableIframe
      ? new IFrame(apiKey, apiSecret, chainId, walletUrl, inAppHintLink)
      : new PopupWindow(apiKey, apiSecret, chainId, walletUrl, inAppHintLink);

    super({
      infuraProjectId,
      network: chainId,
      bridge,
      middlewares: [createCacheMiddleware(bridge), createPrepareBridgeMiddleware()],
    });
    this.hide = () => hide();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalEthereum = typeof window !== 'undefined' ? (window as any).ethereum : undefined;

    // when dapp browser open dapp which use qubic-sdk
    // it will use window.ethereum as default provider
    if (globalEthereum && globalEthereum?.isQubic) {
      globalEthereum.hide = () => null;
      return globalEthereum;
    }
  }
}

export default BrowserProvider;
