import { ApiConfig, BaseProvider, Network, WALLET_URL, SignInProvider } from '@qubic-js/core';
import InApp from '@qubic-js/detect-inapp';
import createCacheMiddleware from './middlewares/cacheMiddleware';
import { createInAppBrowserMiddleware } from './middlewares/createInAppBrowserMiddleware';
import IFrame from './middlewares/IFrame';
import PopupWindow from './middlewares/PopupWindow';
import createInAppWarningModal from './ui/inAppWarningModal';

export interface BrowserProviderOptions {
  apiKey?: string;
  apiSecret?: string;
  chainId?: number;
  infuraProjectId?: string;
  walletUrl?: string; // optional, it not provided use production wallet url
  enableIframe?: boolean;
  disableFastSignup?: boolean;
  inAppHintLink?: string;
}

let isInitialized = false;

export class BrowserProvider extends BaseProvider {
  // for react-web3, when activate success, call provider.hide()
  public hide: () => void;
  public setInAppHintLink: ReturnType<typeof createInAppWarningModal>['setInAppHintLink'];
  public setSignInProvider: (value: SignInProvider) => void;
  constructor(options?: BrowserProviderOptions) {
    const {
      apiKey,
      apiSecret,
      chainId = Network.MAINNET,
      infuraProjectId,
      enableIframe = false,
      walletUrl = WALLET_URL,
      disableFastSignup,
      inAppHintLink,
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
    } = enableIframe
      ? new IFrame(walletUrl, apiConfig, disableFastSignup)
      : new PopupWindow(walletUrl, apiConfig, disableFastSignup);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inApp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);
    const { modal: inAppWarningModal, setInAppHintLink } = createInAppWarningModal(inAppHintLink);

    if (inApp.isInApp) {
      document.body.appendChild(inAppWarningModal.element);
      inAppWarningModal.show();
    }

    super({
      infuraProjectId,
      network: chainId,
      bridge,
      middlewares: [
        createInAppBrowserMiddleware(true, inAppWarningModal.show),
        createCacheMiddleware(bridge),
        createPrepareBridgeMiddleware(),
      ],
    });

    this.setSignInProvider = originSetSignInProvider;
    if (inApp.isInApp) {
      this.setInAppHintLink = setInAppHintLink;
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
