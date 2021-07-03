import AMIS, { Payload } from '@qubic-js/core';

import { PopupWindow } from './ui';
import { BrowserStore } from './store';

let popupWindow: PopupWindow;

AMIS.initialize = url => {
  const { body } = document;

  popupWindow = new PopupWindow(url);
  body.appendChild(popupWindow.element);
};

AMIS.authModalHandler = () => {
  popupWindow?.open('auth');
};

AMIS.requestModalHandler = (payload: Payload) => {
  popupWindow?.open('call_request', payload);
};

AMIS.sharedStore = new BrowserStore();

export default AMIS;
