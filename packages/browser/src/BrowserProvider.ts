import { BaseProvider, getWalletUrl, queryWithAuthConfig } from '@qubic-js/core';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';

interface BrowserProviderOptions {
  enableIframe?: boolean;
}

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;

  constructor(apiKey: string, apiSecret: string, chainId: number, options?: BrowserProviderOptions) {
    const url = `${getWalletUrl()}?${queryWithAuthConfig({
      apiKey,
      apiSecret,
      network: chainId,
    })}`;
    const { hide, bridge, createPrepareBridgeMiddleware } = options?.enableIframe
      ? new IFrame(url)
      : new PopupWindow(url);
    super({
      bridge,
      middlewares: [createCacheMiddleware(bridge), createPrepareBridgeMiddleware()],
    });
    this.hide = () => hide();
  }
}

export default BrowserProvider;
