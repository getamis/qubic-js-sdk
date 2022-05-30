import createInfuraMiddleware from '@qubic-js/eth-json-rpc-infura';
import { JsonRpcMiddleware } from 'json-rpc-engine';
import { INFURA_NETWORK_ENDPOINTS } from '../constants/backend';
import { Network } from '../types';
import { Bridge, BridgeEvent } from '../types/bridge';
import { createJsonRpcServerMiddleware } from '../utils';

interface MultiInfuraMiddlewareOptions {
  initNetwork: Network;
  projectId: string;
}

// infura doesn't support bsc, so we use json rpc server here
const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org';
const BSC_TESTNET_RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545';

export const createMultiInfuraMiddleware = (
  options: MultiInfuraMiddlewareOptions,
  bridge: Bridge,
): JsonRpcMiddleware<unknown, unknown> => {
  let currentNetwork: Network = options.initNetwork;
  const infuraMiddlewares = new Map<Network, JsonRpcMiddleware<unknown, unknown>>();

  function getCurrentMiddleware(): JsonRpcMiddleware<unknown, unknown> {
    const currentMiddleware =
      infuraMiddlewares.get(currentNetwork) ||
      ([Network.BSC, Network.BSC_TESTNET].includes(currentNetwork)
        ? createJsonRpcServerMiddleware({
            url: currentNetwork === Network.BSC ? BSC_RPC_URL : BSC_TESTNET_RPC_URL,
          })
        : createInfuraMiddleware({
            network: INFURA_NETWORK_ENDPOINTS[currentNetwork],
            projectId: options.projectId,
          }));

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
