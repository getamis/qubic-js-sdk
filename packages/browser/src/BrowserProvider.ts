import { ApiConfig, BaseProvider, Network, WALLET_URL, SignInProvider } from '@qubic-js/core';
import { openExternalBrowserWhenLineIab, showBlockerWhenIab } from '@qubic-connect/detect-iab';

import createCacheMiddleware from './middlewares/cacheMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';
import { clearPersistedData } from './utils/persistData';
import { globalEthereum, isInQubicDappBrowser } from './utils/isInQubicDappBrowser';

export interface BrowserProviderOptions {
  apiKey?: string;
  apiSecret?: string;
  chainId?: number;
  infuraProjectId?: string;
  walletUrl?: string; // optional, it not provided use production wallet url
  enableIframe?: boolean;
  iabRedirectUrl?: string; // optional, it not provided use window.location.href
  shouldAlwaysShowCopyUI?: boolean; // optional, it not provided use false
  disableFastSignup?: boolean;
  disableIabWarning?: boolean;
  disableOpenExternalBrowserWhenLineIab?: boolean;
  enablePersist?: boolean; // enable persist accounts and chain id
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
      iabRedirectUrl,
      shouldAlwaysShowCopyUI,
      disableFastSignup,
      disableIabWarning = false,
      disableOpenExternalBrowserWhenLineIab = false,
      enablePersist = false,
    } = options || {};

    const apiConfig: ApiConfig = {
      apiKey,
      apiSecret,
      chainId,
    };

    const {
      hide,
      bridge,
      createPrepareBridgeMiddleware,
      setSignInProvider: originSetSignInProvider,
      removeSignInProvider: originRemoveSignInProvider,
    } = enableIframe
      ? new IFrame(walletUrl, apiConfig, disableFastSignup)
      : new PopupWindow(walletUrl, apiConfig, disableFastSignup);

    if (!disableOpenExternalBrowserWhenLineIab) {
      openExternalBrowserWhenLineIab();
    }

    if (!disableIabWarning && !isInQubicDappBrowser) {
      showBlockerWhenIab({
        redirectUrl: iabRedirectUrl,
        shouldAlwaysShowCopyUI,
      });
    }

    super({
      infuraProjectId,
      network: chainId,
      bridge,
      middlewares: [createCacheMiddleware(bridge, enablePersist), createPrepareBridgeMiddleware()],
    });

    this.setSignInProvider = originSetSignInProvider;
    this.removeSignInProvider = originRemoveSignInProvider;

    if (isInitialized) {
      throw Error(`You can only new BrowserProvider() one time`);
    }
    isInitialized = true;

    this.hide = () => hide();

    // when dapp browser open dapp which use qubic-sdk
    // it will use window.ethereum as default provider
    if (isInQubicDappBrowser) {
      // ignore all these methods
      globalEthereum.hide = () => null;
      globalEthereum.setSignInProvider = () => null;
      globalEthereum.removeSignInProvider = () => null;
      return globalEthereum;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public clearPersistedData(): void {
    clearPersistedData();
  }
}

export default BrowserProvider;
