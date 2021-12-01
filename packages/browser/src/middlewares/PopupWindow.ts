import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import InApp from 'detect-inapp';
import { BridgeEvent, Messenger } from '@qubic-js/core';

import { t } from '../translation';
import BrowserBridge from '../utils/BrowserBridge';
import Modal from '../ui/Modal';
import inAppWarningModal from '../ui/inAppWarningModal';

class PopupWindow implements Messenger {
  private proxy: Window | null = null;
  private newWindowReminderModal: Modal;
  private url: string;
  private isReady = false;
  public bridge: BrowserBridge;

  constructor(url: string) {
    this.url = url;

    const inApp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);

    const { body } = document;

    if (inApp.isInApp) {
      body.appendChild(inAppWarningModal.element);
      inAppWarningModal.show();
    }

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
    body.appendChild(this.newWindowReminderModal.element);

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
      }, 500);
    }
  };

  private openPopupWindow = (): Window | null => {
    if (!this.proxy || this.proxy.closed) {
      const target = 'qubic-wallet';
      const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=680,width=350';
      const proxy = window.open(this.url, target, windowFeatures);
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

  private show = (): void => {
    if (this.proxy && !this.proxy.closed && this.isReady) {
      return;
    }
    // some action is quick enough, we can open window immediately
    const tryOpenWindow = this.openPopupWindow();

    // if tryOpenWindow failed, we will show the confirm box, let user open popup manually
    if (!tryOpenWindow) {
      this.newWindowReminderModal.show();
    }
  };

  private waitUntilReady = (): Promise<void> => {
    const { bridge, proxy, isReady, show } = this;
    return new Promise(resolve => {
      if (proxy && !proxy.closed && isReady) {
        resolve();
        return;
      }

      function onReady() {
        resolve();
        bridge.removeListener('ready', onReady);
      }
      bridge.addListener('ready', onReady);
      show();
    });
  };

  public createPrepareBridgeMiddleware = (): JsonRpcMiddleware<unknown, unknown> =>
    createAsyncMiddleware(async (req, res, next) => {
      await this.waitUntilReady();
      next();
    });
}

export default PopupWindow;