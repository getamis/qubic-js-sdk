declare global {
  interface Window {
    qubic: {
      show: () => void;
    };
  }
}

window.qubic = window.qubic || {
  show: () => {
    // this will be used inc node_modules/web3-core-method
    // noop
  },
};

class OpenPopupWindow {
  qubicWindow: Window | null;
  url = '';
  element: HTMLDivElement;
  constructor(url: string) {
    const div = document.createElement('div');
    div.style.display = 'none';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.right = '0';
    div.style.bottom = '0';
    div.style.zIndex = '99999';
    div.style.backgroundColor = '#00000066';
    div.style.borderWidth = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.background = 'rgba(0,0,0,.5)';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    const button = document.createElement('button');
    button.innerHTML = 'Continue Qubic';
    button.style.paddingRight = '8px';
    button.style.paddingLeft = '8px';
    button.style.paddingTop = '4px';
    button.style.paddingBottom = '4px';
    div.appendChild(button);
    this.element = div;
    document.body.appendChild(this.element);
    button.onclick = () => {
      this.hide();
      this.openPopupWindow();
      const task = this.queue.shift();
      if (task) {
        const { action, payload } = task;
        setTimeout(() => {
          // this.qubicWindow.onload = xxx
          // this.qubicWindow.addEventListener('load', cb, false)
          // this.qubicWindow.addEventListener('onload', cb, false)
          // all is not firing, maybe we can use postMessage from popup to inform this window
          this.qubicWindow?.postMessage({ action, payload }, '*');
        }, 2000);
      }
    };

    this.url = url;
    this.qubicWindow = null;
    window.qubic.show = () => {
      this.element.style.display = 'flex';
    };

    window.addEventListener(
      'message',
      e => {
        const { data } = e;
        const { action } = data;

        if (action === 'hideIframe') {
          this.hide();
        }
      },
      false,
    );
  }

  public openPopupWindow = (): void => {
    if (!this.qubicWindow || this.qubicWindow.closed) {
      const target = 'qubic-wallet';
      const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=600,width=500';
      this.qubicWindow = window.open(this.url, target, windowFeatures);
    }
  };

  public show = (): void => {
    this.element.style.display = 'flex';
  };

  public hide = (): void => {
    this.element.style.display = 'none';
    this.qubicWindow?.postMessage({ action: 'hideIframeDone' }, '*');
    this.qubicWindow?.close();
    this.qubicWindow = null;
  };

  public queue: Array<{ action: string; payload?: Record<string, any> }> = [];

  public open = (action: string, payload?: Record<string, any>): void => {
    this.queue.push({ action, payload });
  };
}

export default OpenPopupWindow;
