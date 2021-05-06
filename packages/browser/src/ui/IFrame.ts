class IFrame {
  public element: HTMLIFrameElement;

  constructor(url: string) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.zIndex = '99999';
    iframe.style.backgroundColor = '#00000066';
    iframe.style.borderWidth = '0';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';

    iframe.src = url;

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

    this.element = iframe;
  }

  public show = (): void => {
    setTimeout(() => {
      this.element.style.display = 'block';
    }, 500); // make the transition smooth
  };

  public hide = (): void => {
    this.element.style.display = 'none';
  };

  public open = (action: string, payload?: { [key: string]: any }): void => {
    this.element.contentWindow?.postMessage({ action, payload }, '*');
    this.show();
  };
}

export default IFrame;
