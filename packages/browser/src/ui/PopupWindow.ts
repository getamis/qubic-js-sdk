class PopupWindow {
  public element: HTMLDivElement;
  private windowProxy: Window | null = null;
  private task: { action: string; payload?: Record<string, any> } | null = null;
  private isReady = false;
  private url = '';
  constructor(url: string) {
    this.url = url;
    const backdropDiv = document.createElement('div');
    backdropDiv.id = 'backdrop';
    backdropDiv.style.display = 'none';
    backdropDiv.style.position = 'fixed';
    backdropDiv.style.top = '0';
    backdropDiv.style.left = '0';
    backdropDiv.style.right = '0';
    backdropDiv.style.bottom = '0';
    backdropDiv.style.zIndex = '99999';
    backdropDiv.style.borderWidth = '0';
    backdropDiv.style.width = '100%';
    backdropDiv.style.height = '100%';
    backdropDiv.style.background = 'rgba(0,0,0,.5)';
    backdropDiv.style.alignItems = 'center';
    backdropDiv.style.justifyContent = 'center';

    const paperDiv = document.createElement('div');
    paperDiv.id = 'paper';
    paperDiv.style.display = 'flex';
    paperDiv.style.backgroundColor = 'white';
    paperDiv.style.borderWidth = '0';
    paperDiv.style.maxWidth = '320px';
    paperDiv.style.boxSizing = 'border-box';
    paperDiv.style.alignItems = 'center';
    paperDiv.style.justifyContent = 'center';
    paperDiv.style.borderRadius = '8px';
    paperDiv.style.flexDirection = 'column';
    paperDiv.style.padding = '24px';
    backdropDiv.appendChild(paperDiv);

    const text = document.createElement('p');
    text.innerHTML = 'Attempt to open Qubic to complete the transaction. Do you want to proceed ?';
    text.style.marginBottom = '48px';
    text.style.color = '#555559';
    text.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    paperDiv.appendChild(text);

    const footerDiv = document.createElement('div');
    footerDiv.style.display = 'flex';
    footerDiv.style.flexDirection = 'row';
    footerDiv.style.alignSelf = 'stretch';
    footerDiv.style.marginLeft = '-8px';
    footerDiv.style.marginRight = '-8px';

    paperDiv.appendChild(footerDiv);

    const cancelButton = this.createButton();
    cancelButton.innerHTML = 'No';
    cancelButton.style.backgroundColor = 'white';
    cancelButton.style.color = '#ff9500';
    cancelButton.style.borderColor = '#ff9500';
    cancelButton.onclick = () => {
      window.postMessage(
        {
          action: 'hideIframe',
        },
        '*',
      );
    };
    footerDiv.appendChild(cancelButton);

    const okButton = this.createButton();
    okButton.innerHTML = 'Yes';
    okButton.style.backgroundColor = '#ff9500';
    okButton.style.color = 'white';
    okButton.style.borderColor = '#ff9500';
    okButton.onclick = () => {
      this.hideBackdrop();
      this.openPopupWindow();
    };
    footerDiv.appendChild(okButton);

    this.element = backdropDiv;
    window.addEventListener(
      'message',
      e => {
        const { data } = e;
        const { action } = data;

        if (action === 'hideIframe') {
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

  private createButton = () => {
    const button = document.createElement('button');
    button.innerHTML = 'Yes';
    button.style.flex = '1';
    button.style.paddingRight = '24px';
    button.style.paddingLeft = '24px';
    button.style.paddingTop = '4px';
    button.style.paddingBottom = '4px';
    button.style.marginLeft = '8px';
    button.style.marginRight = '8px';
    button.style.borderRadius = '8px';
    button.style.borderWidth = '1px';
    button.style.borderStyle = 'solid';
    button.style.height = '48px';
    button.style.fontSize = '18px';
    button.style.cursor = 'pointer';

    button.style.backgroundColor = '#ff9500';
    button.style.color = 'white';
    button.style.borderColor = '#ff9500';
    return button;
  };

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

  private hideBackdrop = (): void => {
    this.element.style.display = 'none';
  };

  public show = (): void => {
    setTimeout(() => {
      this.element.style.display = 'flex';
    }, 500);
  };

  public hide = (): void => {
    this.hideBackdrop();
    if (this.windowProxy && !this.windowProxy.closed) {
      this.windowProxy.close();
      this.windowProxy = null;
    }
  };

  public open = (action: string, payload?: Record<string, any>): void => {
    this.task = { action, payload };
    if (this.windowProxy && !this.windowProxy.closed) {
      this.windowProxy.focus();
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
