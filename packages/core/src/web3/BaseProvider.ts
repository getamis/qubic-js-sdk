import { ethErrors } from 'eth-rpc-errors';
import EventEmitter from 'events';
import { JsonRpcResponse, JsonRpcSuccess, JsonRpcEngine, getUniqueId, JsonRpcMiddleware } from 'json-rpc-engine';

import { DEFAULT_INFURA_PROJECT_ID } from '../constants/network';

import { createMultiInfuraMiddleware } from '../middlewares/multiJsonRpcServerMiddleware';
import { createWalletMiddleware } from '../middlewares/walletMiddleware';
import { Bridge, Request, SendAsync, Network, BridgeEvent } from '../types';

interface BaseProviderOptions {
  infuraProjectId?: string;
  network: Network;
  bridge: Bridge;
  middlewares: Array<JsonRpcMiddleware<unknown, unknown>>;
}

export class BaseProvider extends EventEmitter {
  private engine?: JsonRpcEngine;
  public isQubic = true;

  static isJsonRpcSuccess<T>(rpc: JsonRpcResponse<T>): rpc is JsonRpcSuccess<T> {
    return (rpc as JsonRpcSuccess<T>).result !== undefined;
  }

  constructor(options: BaseProviderOptions) {
    super();
    const { bridge, middlewares, network, infuraProjectId } = options;

    this.engine = new JsonRpcEngine();
    middlewares.forEach(middleware => {
      this.engine?.push(middleware);
    });
    this.engine.push(createWalletMiddleware(bridge.send.bind(bridge)));
    this.engine.push(
      createMultiInfuraMiddleware(
        {
          initNetwork: network,
          projectId: infuraProjectId || DEFAULT_INFURA_PROJECT_ID,
        },
        bridge,
      ),
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
      this.engine.handle(
        {
          id: getUniqueId(),
          jsonrpc: '2.0',
          params: [],
          ...request,
        },
        callback,
      );
    } else {
      callback(ethErrors.provider.disconnected());
    }
  };

  public request: Request = request => {
    return new Promise((resolve, reject) => {
      this.sendAsync(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        if (!response || !BaseProvider.isJsonRpcSuccess(response)) {
          reject(ethErrors.provider.unauthorized());
          return;
        }
        resolve(response.result);
      });
    });
  };
}

export default BaseProvider;
