import { JsonRpcMiddleware, createAsyncMiddleware } from 'json-rpc-engine';
import {
  BridgeEvent,
  Messenger,
  urlWithApiConfig,
  WALLET_HANDLE_METHODS,
  KEEP_HIDE_WALLET_HANDLE_METHODS,
  ApiConfig,
  SignInProvider,
} from '@qubic-js/core';
import { css, CSSInterpolation } from '@emotion/css';

import BrowserBridge from '../utils/BrowserBridge';

const styles: Record<string, CSSInterpolation> = {
  container: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: '#00000066',
    borderWidth: 0,
  },
};

class IFrame implements Messenger {
  public bridge: BrowserBridge;

  private apiConfig: ApiConfig;
  private walletUrl: string;
  private disableFastSignup: boolean;
  private signInProvider?: SignInProvider;
  private isReady = false;

  private element: HTMLIFrameElement;
  public isIframeAppended = false;

  constructor(walletUrl: string, apiConfig: ApiConfig, disableFastSignup = false) {
    this.walletUrl = walletUrl;
    this.apiConfig = apiConfig;
    this.disableFastSignup = disableFastSignup;

    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.className = css(styles.container);
    iframe.src = this.getUrl();
    this.element = iframe;

    this.bridge = new BrowserBridge({
      postMessage: (message, targetOrigin, transfer) => {
        if (!this.element.contentWindow) {
          throw Error('content window issue');
        }
        this.element.contentWindow?.postMessage(message, targetOrigin, transfer);
      },
      listenMessageFrom: window,
    });

    this.bridge.on(BridgeEvent.ready, () => {
      this.isReady = true;
    });

    this.bridge.on(BridgeEvent.hide, () => {
      this.hide();
    });
  }

  private getUrl = (): string => {
    return urlWithApiConfig(this.walletUrl, this.apiConfig, this.disableFastSignup, this.signInProvider);
  };

  public setSignInProvider = (value: SignInProvider): void => {
    console.warn('IFrame auto sign in popup usually blocked by browser, you should consider enableIframe: false');
    this.signInProvider = value;
    this.element.src = this.getUrl();
  };

  public removeSignInProvider = (): void => {
    this.signInProvider = undefined;
    this.element.src = this.getUrl();
  };

  private show = (): void => {
    if (!this.isIframeAppended) {
      document.body.appendChild(this.element);
      this.isIframeAppended = true;
    }
    setTimeout(() => {
      this.element.style.display = 'block';
    }, 500); // make the transition smooth
  };

  public hide = (): void => {
    this.element.style.display = 'none';
    this.bridge.postMessage({ action: 'hideIframeDone' }, '*');
  };

  private waitUntilReady = (keepHide = false): Promise<void> => {
    const { bridge, isReady, show } = this;
    return new Promise(resolve => {
      if (isReady) {
        if (!keepHide) {
          show();
        }
        resolve();
        return;
      }
      bridge.once(BridgeEvent.ready, resolve);
      show();
    });
  };

  public createPrepareBridgeMiddleware = (): JsonRpcMiddleware<unknown, unknown> =>
    createAsyncMiddleware(async (req, res, next) => {
      if (WALLET_HANDLE_METHODS.includes(req.method)) {
        await this.waitUntilReady(KEEP_HIDE_WALLET_HANDLE_METHODS.includes(req.method));
      }
      next();
    });
}

export default IFrame;
