import AMIS, { Payload } from '@qubic-js/core';
import InApp from 'detect-inapp';
import Modal from './ui/Modal';
import { IFrame, PopupWindow } from './ui';
import { BrowserStore } from './store';
import { t } from './translation';

const inApp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);

let target: IFrame | PopupWindow;
let modal: Modal;

AMIS.initialize = url => {
  const { body } = document;
  if (inApp.isInApp) {
    modal = new Modal({
      description: t('in-app-hint'),
      confirmText: t('ok'),
      onConfirm: () => {
        // noop
      },
    });
    body.appendChild(modal.element);
    modal.show();
    return;
  }
  target = new PopupWindow(url);
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

AMIS.sharedStore = new BrowserStore();

export default AMIS;
