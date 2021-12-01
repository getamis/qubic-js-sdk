import createInfuraMiddleware from 'eth-json-rpc-infura';
import { JsonRpcMiddleware } from 'json-rpc-engine';
import { INFURA_NETWORK_ENDPOINTS } from '../constants/backend';
import { Network } from '../enums';
import { Bridge, BridgeEvent } from '../types/bridge';

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
    const currentMiddleware =
      infuraMiddlewares.get(currentNetwork) ||
      createInfuraMiddleware({
        network: INFURA_NETWORK_ENDPOINTS[currentNetwork],
        projectId: options.projectId,
      });

    infuraMiddlewares.set(currentNetwork, currentMiddleware);

    return currentMiddleware;
  }

  bridge.on(BridgeEvent.chainChanged, chainId => {
    currentNetwork = Number(chainId);
  });

  return (req, res, next, end) => {
    getCurrentMiddleware()(req, res, next, end);
  };
};
