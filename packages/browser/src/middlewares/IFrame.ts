import { BridgeEvent, Messenger, Network, getWalletUrl, queryWithAuthConfig } from '@qubic-js/core';
import { JsonRpcMiddleware, createAsyncMiddleware } from 'json-rpc-engine';
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

  private apiKey: string;
  private apiSecret: string;
  private chainId: Network;
  private isReady = false;

  private element: HTMLIFrameElement;
  public isIframeAppended = false;

  constructor(apiKey: string, apiSecret: string, chainId: number) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.chainId = chainId;

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
    this.bridge.on(BridgeEvent.chainChanged, nextChainId => {
      this.chainId = Number(nextChainId);
    });
  }

  private getUrl = (): string => {
    const url = `${getWalletUrl()}?${queryWithAuthConfig({
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      network: this.chainId,
    })}`;
    return url;
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

  private waitUntilReady = (): Promise<void> => {
    const { bridge, isReady, show } = this;
    return new Promise(resolve => {
      if (isReady) {
        // iframe might be invisible but still in the background
        // which means isReady === true, but not show
        show();
        resolve();
        return;
      }
      bridge.once(BridgeEvent.ready, resolve);
      show();
    });
  };

  public createPrepareBridgeMiddleware = (): JsonRpcMiddleware<unknown, unknown> =>
    createAsyncMiddleware(async (req, res, next) => {
      await this.waitUntilReady();
      next();
    });
}

export default IFrame;
