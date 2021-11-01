import Modal from './Modal';
import { t } from '../translation';

class PopupWindow {
  public element: HTMLDivElement;
  private windowProxy: Window | null = null;
  private task: { action: string; payload?: Record<string, any> } | null = null;
  private isReady = false;
  private url = '';
  private modal: Modal;
  constructor(url: string) {
    this.url = url;

    this.modal = new Modal({
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
    this.element = this.modal.element;

    window.addEventListener(
      'message',
      e => {
        const { data } = e;
        const { action } = data;

        if (action === 'hideIframe') {
          // popup of web need to reinitialized, so set isReady false
          this.isReady = false;
          this.hide();
        }

        if (action === 'ready') {
          this.isReady = true;
          this.executeTask();
        }
      },
      false,
    );
  }

  private executeTask = () => {
    if (this.task) {
      this.windowProxy?.postMessage(this.task, '*');
      this.task = null;
    }
  };

  private detectCloseEventTimer = 0;

  private detectPopupWindowCloseEvent = (windowProxy: Window | null): void => {
    // this.windowProxy.onclose event can't works with cross domain
    // based on https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript
    window.clearInterval(this.detectCloseEventTimer);
    if (windowProxy) {
      this.detectCloseEventTimer = window.setInterval(() => {
        if (windowProxy.closed) {
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
    if (!this.windowProxy || this.windowProxy.closed) {
      const target = 'qubic-wallet';
      const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=680,width=350';
      const windowProxy = window.open(this.url, target, windowFeatures);
      this.detectPopupWindowCloseEvent(windowProxy);
      this.windowProxy = windowProxy;
      return windowProxy;
    }
    return null;
  };

  public show = (): void => {
    this.modal.show();
  };

  public hide = (): void => {
    this.modal.hide();
    if (this.windowProxy && !this.windowProxy.closed) {
      this.windowProxy.close();
      this.windowProxy = null;
    }
  };

  public open = (action: string, payload?: Record<string, any>): void => {
    this.windowProxy?.close();

    this.task = { action, payload };
    if (this.windowProxy && !this.windowProxy.closed) {
      if (this.isReady) {
        this.executeTask();
      }
    } else {
      // some action is quick enough, we can open window immediately
      const tryOpenWindow = this.openPopupWindow();

      // if tryOpenWindow failed, we will show the confirm box, let user open popup manually
      if (!tryOpenWindow) {
        this.show();
      }
    }
  };
}

export default PopupWindow;
