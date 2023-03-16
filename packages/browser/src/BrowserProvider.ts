import { ApiConfig, BaseProvider, Network, WALLET_URL, SignInProvider } from '@qubic-js/core';
import { showBlockerWhenIab } from '@qubic-connect/detect-iab';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';

export interface BrowserProviderOptions {
  apiKey?: string;
  apiSecret?: string;
  chainId?: number;
  infuraProjectId?: string;
  walletUrl?: string; // optional, it not provided use production wallet url
  enableIframe?: boolean;
  disableFastSignup?: boolean;
  disableIabWarning?: boolean;
}

let isInitialized = false;

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;
  public setSignInProvider: (value: SignInProvider) => void;
  public removeSignInProvider: () => void;
  constructor(options?: BrowserProviderOptions) {
    const {
      apiKey,
      apiSecret,
      chainId = Network.MAINNET,
      infuraProjectId,
      enableIframe = false,
      walletUrl = WALLET_URL,
      disableFastSignup,
      disableIabWarning = false,
    } = options || {};

    const apiConfig: ApiConfig = {
      apiKey,
      apiSecret,
      chainId,
    };

    if (!disableIabWarning) {
      showBlockerWhenIab();
    }

    const {
      hide,
      bridge,
      createPrepareBridgeMiddleware,
      setSignInProvider: originSetSignInProvider,
      removeSignInProvider: originRemoveSignInProvider,
    } = enableIframe
      ? new IFrame(walletUrl, apiConfig, disableFastSignup)
      : new PopupWindow(walletUrl, apiConfig, disableFastSignup);

    showBlockerWhenIab();

    super({
      infuraProjectId,
      network: chainId,
      bridge,
      middlewares: [createCacheMiddleware(bridge), createPrepareBridgeMiddleware()],
    });

    this.setSignInProvider = originSetSignInProvider;
    this.removeSignInProvider = originRemoveSignInProvider;

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
