import AMIS, { Payload } from '@qubic-js/core';

import { IFrame, PopupWindow } from './ui';
import { BrowserStore } from './store';

let target: IFrame | PopupWindow;

AMIS.initialize = url => {
  const { body } = document;

  target = new PopupWindow(url);
  body.appendChild(target.element);
};

AMIS.authModalHandler = () => {
  (target as PopupWindow)?.close();
  target?.open('auth');
};

AMIS.requestModalHandler = (payload: Payload) => {
  (target as PopupWindow)?.close();
  target?.open('call_request', payload);
};

AMIS.sharedStore = new BrowserStore();

export default AMIS;
