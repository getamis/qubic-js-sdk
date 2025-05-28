import { JsonRpcMiddleware } from 'json-rpc-engine';
import { Bridge, BridgeEvent } from '../types/bridge';
import { createJsonRpcServerMiddleware, getNetworkInfo } from '../utils';

export const createMultiInfuraMiddleware = async (
  initNetwork: number,
  bridge: Bridge,
): Promise<JsonRpcMiddleware<unknown, unknown>> => {
  let currentNetwork: number = initNetwork;
  const infuraMiddlewares = new Map<number, JsonRpcMiddleware<unknown, unknown>>();

  async function getCurrentMiddleware(): Promise<JsonRpcMiddleware<unknown, unknown>> {
    const existMiddleWare = infuraMiddlewares.get(currentNetwork);
    if (existMiddleWare) {
      return existMiddleWare;
    }

    const networkInfo = await getNetworkInfo(currentNetwork);

    if (!networkInfo || !networkInfo.rpcUrls || networkInfo.rpcUrls.length === 0) {
      throw new Error(`No rpcUrls found for network ${currentNetwork}`);
    }

    const networkInfoRpc = networkInfo.rpcUrls[0];
    if (!networkInfoRpc || typeof networkInfoRpc !== 'string') {
      throw new Error(`Invalid rpcUrl for network ${currentNetwork}`);
    }

    const currentMiddleware = createJsonRpcServerMiddleware({
      url: networkInfoRpc,
    });

    infuraMiddlewares.set(currentNetwork, currentMiddleware as JsonRpcMiddleware<unknown, unknown>);

    return currentMiddleware;
  }

  bridge.on(BridgeEvent.chainChanged, chainId => {
    currentNetwork = Number(chainId);
  });

  return async (req, res, next, end) => {
    const middleware = await getCurrentMiddleware();
    middleware(req, res, next, end);
  };
};
