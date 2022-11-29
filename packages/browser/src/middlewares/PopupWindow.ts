import { ethErrors } from 'eth-rpc-errors';
import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import {
  ApiConfig,
  BridgeEvent,
  Messenger,
  SignInProvider,
  urlWithApiConfig,
  WALLET_HANDLE_METHODS,
} from '@qubic-js/core';

import { t } from '../translation';
import BrowserBridge from '../utils/BrowserBridge';
import Modal from '../ui/Modal';

const DETECT_IF_POPUP_WINDOW_CLOSED_INTERVAL_MS = 500;

class PopupWindow implements Messenger {
  public bridge: BrowserBridge;

  private apiConfig: ApiConfig;
  private walletUrl: string;
  private disableFastSignup: boolean;
  private signInProvider?: SignInProvider;
  private isReady = false;

  private proxy: Window | null = null;
  private newWindowReminderModal: Modal;

  constructor(walletUrl: string, apiConfig: ApiConfig, disableFastSignup = false) {
    this.walletUrl = walletUrl;
    this.apiConfig = apiConfig;
    this.disableFastSignup = disableFastSignup;

    this.newWindowReminderModal = new Modal({
      description: t('popup-window-hint'),
      cancelText: t('no'),
      onCancel: () => {
        window.postMessage(
          {
            action: 'hideIframe',
          },
          '*',
        );
      },
      confirmText: t('yes'),
      onConfirm: () => {
        this.openPopupWindow();
      },
      hideWhenConfirm: true,
    });
    document.body.appendChild(this.newWindowReminderModal.element);

    this.bridge = new BrowserBridge({
      postMessage: (message, targetOrigin, transfer) => {
        this.proxy?.postMessage(message, targetOrigin, transfer);
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
    this.signInProvider = value;
  };

  private detectCloseEventTimer = 0;

  private detectPopupWindowCloseEvent = (proxy: Window | null): void => {
    // this.proxy.onclose event can't works with cross domain
    // based on https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript
    window.clearInterval(this.detectCloseEventTimer);
    if (proxy) {
      this.detectCloseEventTimer = window.setInterval(() => {
        if (proxy.closed) {
          clearInterval(this.detectCloseEventTimer);
          // in general, action:hideIframe is coming from popup window
          // if user closed popup window via browser, sdk need to be informed with that action
          window.postMessage(
            {
              action: 'hideIframe',
            },
            '*',
          );
        }
      }, DETECT_IF_POPUP_WINDOW_CLOSED_INTERVAL_MS);
    }
  };

  private openPopupWindow = (): Window | null => {
    if (!this.proxy || this.proxy.closed) {
      const target = 'qubic-wallet';
      const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=680,width=350';
      const proxy = window.open(this.getUrl(), target, windowFeatures);
      this.detectPopupWindowCloseEvent(proxy);
      this.proxy = proxy;
      return proxy;
    }
    return null;
  };

  public hide = (): void => {
    this.newWindowReminderModal.hide();
    if (this.proxy && !this.proxy.closed) {
      this.proxy.close();
      this.proxy = null;
      this.isReady = false;
    }
  };

  private show = (options: { onReminderModalCancel: () => void }): void => {
    if (this.proxy && !this.proxy.closed && this.isReady) {
      return;
    }
    // some action is quick enough, we can open window immediately
    const tryOpenWindow = this.openPopupWindow();

    // if tryOpenWindow failed, we will show the confirm box, let user open popup manually
    if (!tryOpenWindow) {
      this.newWindowReminderModal.show({
        onCancel: options.onReminderModalCancel,
      });
    }
  };

  private waitUntilReady = (): Promise<void> => {
    const { bridge, proxy, isReady, show } = this;
    return new Promise((resolve, reject) => {
      if (proxy && !proxy.closed && isReady) {
        resolve();
        return;
      }

      bridge.once(BridgeEvent.ready, resolve);
      show({
        onReminderModalCancel: () => {
          bridge.removeListener(BridgeEvent.ready, resolve);
          reject();
        },
      });
    });
  };

  public createPrepareBridgeMiddleware = (): JsonRpcMiddleware<unknown, unknown> =>
    createAsyncMiddleware(async (req, res, next) => {
      if (WALLET_HANDLE_METHODS.includes(req.method)) {
        try {
          await this.waitUntilReady();
        } catch (error) {
          res.error = ethErrors.provider.userRejectedRequest();
        }
      }
      next();
    });
}

export default PopupWindow;
