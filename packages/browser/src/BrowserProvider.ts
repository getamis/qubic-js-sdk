import { BaseProvider } from '@qubic-js/core';

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
  }
}

export default BrowserProvider;
