import AMIS, { Payload } from '@amis-sdk/core';

import { IFrame } from './ui';
import { BrowserStore } from './store';

let iframe: IFrame;

AMIS.initialize = url => {
  const { body } = document;

  iframe = new IFrame(url);
  body.appendChild(iframe.element);
};

AMIS.authModalHandler = () => {
  if (iframe) {
    iframe.open('auth');
  }
};

AMIS.requestModalHandler = (payload: Payload) => {
  if (iframe) {
    iframe.open('call_request', payload);
  }
};

AMIS.sharedStore = new BrowserStore();

export default AMIS;
