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

class IFrame {
  qubicWindow: Window | null;
  url = '';
  constructor(url: string) {
    this.url = url;
    this.qubicWindow = null;
    window.qubic.show = () => {
      if (!this.qubicWindow || this.qubicWindow.closed) {
        const target = 'qubic-wallet';
        const windowFeatures = 'location=no,resizable=yes,scrollbars=yes,status=yes,height=600,width=500';
        this.qubicWindow = window.open(this.url, target, windowFeatures);
      }
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

  public hide = (): void => {
    this.qubicWindow?.postMessage({ action: 'hideIframeDone' }, '*');
    this.qubicWindow?.close();
    this.qubicWindow = null;
  };

  public open = (action: string, payload?: { [key: string]: any }): void => {
    setTimeout(() => {
      // this.qubicWindow.onload = xxx
      // this.qubicWindow.addEventListener('load', cb, false)
      // this.qubicWindow.addEventListener('onload', cb, false)
      // all is not firing, maybe we can use postMessage from popup to inform this window
      this.qubicWindow?.postMessage({ action, payload }, '*');
    }, 2000);
  };
}

export default IFrame;
