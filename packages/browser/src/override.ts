import AMIS, { Payload } from '@qubic-js/core';
import InApp from 'detect-inapp';
import { css, CSSInterpolation } from '@emotion/css';
import Modal from './ui/Modal';
import { IFrame, PopupWindow } from './ui';
import { BrowserStore } from './store';
import { t } from './translation';

const styles: Record<string, CSSInterpolation> = {
  container: {
    marginTop: '24px',
  },
  link: {
    color: '#568ddc',
    wordBreak: 'break-all',
    margin: '0',
    textAlign: 'center',
    lineHeight: '1.7',
  },
};

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const inApp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);

let target: IFrame | PopupWindow;
let modal: Modal;

AMIS.initialize = (url, enableIframe = false) => {
  const { body } = document;
  if (inApp.isInApp) {
    const container = document.createElement('div');
    container.className = css(styles.container);

    const link = window.location.href;

    const messageP = document.createElement('p');
    messageP.className = css(styles.link);
    messageP.innerHTML = link;
    container.appendChild(messageP);

    modal = new Modal({
      children: container,
      description: isIOS ? t('in-app-hint-ios') : t('in-app-hint'),
      confirmText: t('copyLink'),
      onConfirm: () => {
        navigator.clipboard.writeText(link);
      },
    });
    body.appendChild(modal.element);
    modal.show();
    return;
  }
  target = enableIframe ? new IFrame(url) : new PopupWindow(url);
  body.appendChild(target.element);
};

AMIS.authModalHandler = () => {
  if (inApp.isInApp) {
    modal.show();
    return;
  }
  target?.open('auth');
};

AMIS.requestModalHandler = (payload: Payload) => {
  if (inApp.isInApp) {
    modal.show();
    return;
  }
  target?.open('call_request', payload);
};

AMIS.hideModal = () => {
  target.hide();
};

AMIS.sharedStore = new BrowserStore();

export default AMIS;
