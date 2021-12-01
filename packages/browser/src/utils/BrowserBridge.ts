import { EventEmitter } from 'events';
import { JsonRpcRequest, JsonRpcId, getUniqueId } from 'json-rpc-engine';
import { Bridge, BridgeOptions, BridgeEvent, BridgeCallback, PostMessage } from '@qubic-js/core';
import { ethErrors } from 'eth-rpc-errors';

export default class BrowserBridge extends EventEmitter implements Bridge {
  private callbacks: Map<JsonRpcId, BridgeCallback>;
  public postMessage: PostMessage;

  constructor(options: BridgeOptions) {
    super();
    this.callbacks = new Map<number, BridgeCallback>();
    this.postMessage = options.postMessage;

    options.listenMessageFrom.addEventListener('message', event => {
      try {
        // TODO: event.data.method event.data.action should be refactored
        const { method } = event.data;

        if (method === 'clear') {
          this.emit(BridgeEvent.clear);

          this.callbacks.forEach(callback => {
            callback(undefined, ethErrors.provider.userRejectedRequest());
          });
          this.callbacks.clear();
          return;
        }

        if (method === 'setAddress') {
          this.emit(BridgeEvent.accountsChanged, [event.data.address]);
          return;
        }
        if (method === 'setNetwork') {
          this.emit(BridgeEvent.chainChanged, event.data.chainId);
          return;
        }

        const { action } = event.data;

        if (action === 'ready') {
          this.emit(BridgeEvent.ready);
          return;
        }

        // TODO: renamed hideIframe to hide
        if (action === 'hideIframe') {
          this.emit(BridgeEvent.hide);

          this.callbacks.forEach(callback => {
            callback(undefined, ethErrors.provider.userRejectedRequest());
          });
          this.callbacks.clear();

          return;
        }

        if (action === 'approve_request') {
          const { id, result } = event.data;

          const callback = this.callbacks.get(id);
          if (callback) {
            // Then resolve/reject the send promise
            callback(undefined, result);
            this.callbacks.delete(id);
          }
        }

        if (action === 'reject_request') {
          const { id, error } = event.data;

          const callback = this.callbacks.get(id);
          if (callback) {
            // Then resolve/reject the send promise
            callback(error, undefined);
            this.callbacks.delete(id);
          }
        }
      } catch (error) {
        console.error(`Parse json rpc error: ${event.data}`, event.data);
      }
    });
  }

  // reason for partial is that id might not included in data
  public send: Bridge['send'] = data => {
    return new Promise((resolve, reject) => {
      const id = data.id || getUniqueId();
      const payload: JsonRpcRequest<unknown> = {
        id,
        ...data,
      };
      this.postMessage(
        {
          action: 'call_request',
          payload,
        },
        '*',
      );
      this.callbacks.set(id, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  };
}
