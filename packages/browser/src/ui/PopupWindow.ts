class PopupWindow {
  public element: HTMLDivElement;
  private windowProxy: Window | null = null;
  private task: { action: string; payload?: Record<string, any> } | null = null;
  private isReady = false;

  constructor(url: string) {
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
    backdropDiv.onclick = () => {
      this.hideBackdrop();
    };

    const paperDiv = document.createElement('div');
    paperDiv.id = 'paper';
    paperDiv.style.display = 'flex';
    paperDiv.style.backgroundColor = 'white';
    paperDiv.style.borderWidth = '0';
    paperDiv.style.maxWidth = '320px';
    paperDiv.style.boxSizing = 'border-box';
    paperDiv.style.alignItems = 'center';
    paperDiv.style.justifyContent = 'center';
    paperDiv.style.borderRadius = '24px';
    paperDiv.style.flexDirection = 'column';
    paperDiv.style.padding = '24px';
    backdropDiv.appendChild(paperDiv);

    const text = document.createElement('p');
    text.innerHTML = 'Qubic care about you security, this will open a popup window';
    text.style.marginBottom = '48px';
    paperDiv.appendChild(text);

    const button = document.createElement('button');
    button.innerHTML = 'Continue Qubic';
    button.style.paddingRight = '24px';
    button.style.paddingLeft = '24px';
    button.style.paddingTop = '4px';
    button.style.paddingBottom = '4px';
    button.style.backgroundColor = '#ff9500';
    button.style.color = 'white';
    button.style.borderRadius = '8px';
    button.style.borderWidth = '0';
    button.style.height = '48px';
    button.style.fontSize = '18px';
    button.style.cursor = 'pointer';
    paperDiv.appendChild(button);

    this.element = backdropDiv;

    button.onclick = () => {
      this.hideBackdrop();
      this.openPopupWindow(url);
    };
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
          // TODO: find why failed without setTimeout
          setTimeout(() => this.executeTask(), 0);
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
    if (windowProxy) {
      window.clearInterval(this.detectCloseEventTimer);
      this.detectCloseEventTimer = window.setInterval(() => {
        if (!this.windowProxy || this.windowProxy.closed) {
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

  private openPopupWindow = (url: string): void => {
    if (!this.windowProxy || this.windowProxy.closed) {
      const target = 'qubic-wallet';
      const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=600,width=350';
      this.windowProxy = window.open(url, target, windowFeatures);
      this.detectPopupWindowCloseEvent(this.windowProxy);
    }
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
      this.windowProxy.postMessage({ action: 'hideIframeDone' }, '*');
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
      this.show();
    }
  };
}

export default PopupWindow;
