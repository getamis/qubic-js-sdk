import { JsonRpcMiddleware } from 'json-rpc-engine';
import { Bridge } from './bridge';

export interface Messenger {
  bridge: Bridge;
  createPrepareBridgeMiddleware(): JsonRpcMiddleware<unknown, unknown>;
}
