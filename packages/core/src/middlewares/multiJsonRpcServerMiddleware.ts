import createInfuraMiddleware from '@qubic-js/eth-json-rpc-infura';
import { JsonRpcMiddleware } from 'json-rpc-engine';
import { Network } from '../types';
import { Bridge, BridgeEvent } from '../types/bridge';
import { createJsonRpcServerMiddleware } from '../utils';
import { NETWORK_INFO } from '../constants/network';

interface MultiInfuraMiddlewareOptions {
  initNetwork: Network;
  projectId: string;
}

export const createMultiInfuraMiddleware = (
  options: MultiInfuraMiddlewareOptions,
  bridge: Bridge,
): JsonRpcMiddleware<unknown, unknown> => {
  let currentNetwork: Network = options.initNetwork;
  const infuraMiddlewares = new Map<Network, JsonRpcMiddleware<unknown, unknown>>();

  function getCurrentMiddleware(): JsonRpcMiddleware<unknown, unknown> {
    const existMiddleWare = infuraMiddlewares.get(currentNetwork);
    if (existMiddleWare) {
      return existMiddleWare;
    }

    let currentMiddleware;

    const networkInfoRpc = NETWORK_INFO[currentNetwork].rpc;
    if ('infuraNetwork' in networkInfoRpc) {
      currentMiddleware = createInfuraMiddleware({
        network: networkInfoRpc.infuraNetwork,
        projectId: options.projectId,
      });
    } else {
      currentMiddleware = createJsonRpcServerMiddleware({
        url: networkInfoRpc.url,
      });
    }

    infuraMiddlewares.set(currentNetwork, currentMiddleware as JsonRpcMiddleware<unknown, unknown>);

    return currentMiddleware;
  }

  bridge.on(BridgeEvent.chainChanged, chainId => {
    currentNetwork = Number(chainId);
  });

  return (req, res, next, end) => {
    getCurrentMiddleware()(req, res, next, end);
  };
};
