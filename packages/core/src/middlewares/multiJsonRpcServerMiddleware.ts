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

// infura doesn't support holesky, so we use json rpc server here
const HOLESKY_RPC_URL = 'https://1rpc.io/holesky';

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

    switch (currentNetwork) {
      case Network.BSC:
        currentMiddleware = createJsonRpcServerMiddleware({
          url: BSC_RPC_URL,
        });

        break;
      case Network.BSC_TESTNET:
        currentMiddleware = createJsonRpcServerMiddleware({
          url: BSC_TESTNET_RPC_URL,
        });

        break;
      case Network.HOLESKY:
        currentMiddleware = createJsonRpcServerMiddleware({
          url: HOLESKY_RPC_URL,
        });

        break;
      default:
        currentMiddleware = createInfuraMiddleware({
          network: INFURA_NETWORK_ENDPOINTS[currentNetwork],
          projectId: options.projectId,
        });

        break;
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
