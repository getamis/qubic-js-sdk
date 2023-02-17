import { BaseProvider } from '@qubic-js/core';
import { showBlockerWhenIab } from '@qubic-connect/detect-iab';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';

interface BrowserProviderOptions {
  apiKey: string;
  apiSecret: string;
  chainId: number;
  infuraProjectId: string;
  enableIframe?: boolean;
}

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;

  constructor(options: BrowserProviderOptions) {
    const { apiKey, apiSecret, chainId, infuraProjectId, enableIframe = false } = options;

    showBlockerWhenIab();

    const { hide, bridge, createPrepareBridgeMiddleware } = enableIframe
      ? new IFrame(apiKey, apiSecret, chainId)
      : new PopupWindow(apiKey, apiSecret, chainId);

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
