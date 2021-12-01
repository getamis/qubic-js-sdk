import { BridgeEvent, Bridge } from '@qubic-js/core';
import { JsonRpcMiddleware } from 'json-rpc-engine';

const createCacheMiddleware = (bridge: Bridge): JsonRpcMiddleware<unknown, unknown> => {
  let cacheAddresses: string[] = [];
  let cacheNetwork = '';

  bridge.on(BridgeEvent.accountsChanged, addresses => {
    cacheAddresses = addresses;
  });

  bridge.on(BridgeEvent.chainChanged, chainId => {
    cacheNetwork = chainId;
  });

  bridge.on(BridgeEvent.clear, () => {
    cacheAddresses = [];
    cacheNetwork = '';
  });

  return (req, res, next, end) => {
    if (req.method === 'eth_accounts' && cacheAddresses.length > 0) {
      res.result = cacheAddresses;
      end();
      return;
    }
    if (req.method === 'eth_chainId' && cacheNetwork) {
      res.result = cacheNetwork;
      end();
      return;
    }

    next();
  };
};

export default createCacheMiddleware;
