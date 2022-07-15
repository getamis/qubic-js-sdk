import { BaseProvider, WALLET_URL } from '@qubic-js/core';
import InApp from '@qubic-js/detect-inapp';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';
import createInAppWarningModal from './ui/inAppWarningModal';

export interface BrowserProviderOptions {
  apiKey: string;
  apiSecret: string;
  chainId: number;
  infuraProjectId: string;
  walletUrl?: string; // optional, it not provided use production wallet url
  enableIframe?: boolean;
  inAppHintLink?: string;
}

let isInitialized = false;

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;
  public setInAppHintLink: ReturnType<typeof createInAppWarningModal>['setInAppHintLink'];

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
      ? new IFrame(apiKey, apiSecret, chainId, walletUrl)
      : new PopupWindow(apiKey, apiSecret, chainId, walletUrl);

    super({
      infuraProjectId,
      network: chainId,
      bridge,
      middlewares: [createCacheMiddleware(bridge), createPrepareBridgeMiddleware()],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inApp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);

    if (inApp.isInApp) {
      const { modal: inAppWarningModal, setInAppHintLink } = createInAppWarningModal(inAppHintLink);
      this.setInAppHintLink = setInAppHintLink;
      document.body.appendChild(inAppWarningModal.element);
      inAppWarningModal.show();
    } else {
      this.setInAppHintLink = () => null;
    }

    if (isInitialized) {
      throw Error(`You can only new BrowserProvider() one time`);
    }
    isInitialized = true;

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
