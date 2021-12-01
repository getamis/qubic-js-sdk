import { JsonRpcRequest } from 'json-rpc-engine';
import { EventEmitter } from 'events';

export type AllowOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface PostMessage {
  (message: unknown, targetOrigin: string, transfer?: Transferable[]): void;
}

export interface BridgeCallback {
  (error: unknown, response: unknown): void;
}

export interface BridgeOptions {
  postMessage: PostMessage;
  listenMessageFrom: {
    addEventListener: typeof window.addEventListener;
  };
}

export interface Bridge extends EventEmitter {
  postMessage: PostMessage;
  send(data: AllowOptional<JsonRpcRequest<unknown>, 'id'>): Promise<unknown>;
}

export enum BridgeEvent {
  ready = 'ready',
  clear = 'clear',
  hide = 'hide',
  accountsChanged = 'accountsChanged',
  chainChanged = 'chainChanged',
}
