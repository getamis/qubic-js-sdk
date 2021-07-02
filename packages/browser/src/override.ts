import AMIS, { Payload } from '@qubic-js/core';

import { PopupWindow } from './ui';
import { BrowserStore } from './store';

let popupWindow: PopupWindow;

AMIS.initialize = url => {
  popupWindow = new PopupWindow(url);
};

AMIS.authModalHandler = () => {
  if (popupWindow) {
    window.qubic?.show();
    popupWindow.open('auth');
  }
};

AMIS.requestModalHandler = (payload: Payload) => {
  if (popupWindow) {
    popupWindow.open('call_request', payload);
  }
};

AMIS.sharedStore = new BrowserStore();

export default AMIS;
