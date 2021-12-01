import { ethErrors } from 'eth-rpc-errors';
import EventEmitter from 'events';
import { JsonRpcResponse, JsonRpcSuccess, JsonRpcEngine, getUniqueId, JsonRpcMiddleware } from 'json-rpc-engine';
import createInfuraMiddleware from 'eth-json-rpc-infura';
import { INFURA_NETWORK_KEY } from '../constants/backend';
import { BridgeEvent } from '../types/bridge';
import { createWalletMiddleware } from '../middlewares/walletMiddleware';
import { Bridge, Request, SendAsync } from '../types';

interface BaseProviderOptions {
  bridge: Bridge;
  middlewares: Array<JsonRpcMiddleware<unknown, unknown>>;
}

export class BaseProvider extends EventEmitter {
  private engine?: JsonRpcEngine;

  static isJsonRpcSuccess<T>(rpc: JsonRpcResponse<T>): rpc is JsonRpcSuccess<T> {
    return (rpc as JsonRpcSuccess<T>).result !== undefined;
  }

  constructor(options: BaseProviderOptions) {
    super();
    const { bridge, middlewares } = options;

    this.engine = new JsonRpcEngine();
    middlewares.forEach(middleware => {
      this.engine?.push(middleware);
    });
    this.engine.push(createWalletMiddleware(bridge.send.bind(bridge)));
    this.engine.push(
      createInfuraMiddleware({
        network: 'rinkeby',
        projectId: INFURA_NETWORK_KEY,
      }),
    );

    bridge.on(BridgeEvent.chainChanged, (chainId: string) => {
      this.emit(BridgeEvent.chainChanged, chainId);
    });
    bridge.on(BridgeEvent.accountsChanged, (accounts: Array<string>) => {
      this.emit(BridgeEvent.accountsChanged, accounts);
    });
  }

  public sendAsync: SendAsync = (request, callback): void => {
    if (this.engine) {
      this.engine.handle(request, callback);
    } else {
      callback(ethErrors.provider.disconnected());
    }
  };

  public request: Request = req => {
    return new Promise((resolve, reject) => {
      this.sendAsync(
        {
          id: getUniqueId(),
          jsonrpc: '2.0',
          params: [],
          ...req,
        },
        (error, response) => {
          if (error) {
            reject(error);
          }
          if (!response || !BaseProvider.isJsonRpcSuccess(response)) {
            reject(ethErrors.provider.unauthorized());
            return;
          }
          resolve(response.result);
        },
      );
    });
  };
}

export default BaseProvider;
