import { BridgeEvent, Bridge } from '@qubic-js/core';
import { JsonRpcMiddleware } from 'json-rpc-engine';
import { clearPersistedData, getPersistedData, setPersistedData } from '../utils/persistData';

const createCacheMiddleware = (bridge: Bridge, enablePersist: boolean): JsonRpcMiddleware<unknown, unknown> => {
  const persistedData = enablePersist ? getPersistedData() : null;
  let cacheAddresses: string[] = persistedData?.accounts || [];
  let cacheNetwork = persistedData?.chainId || '';

  bridge.on(BridgeEvent.accountsChanged, (addresses: string[]) => {
    cacheAddresses = addresses;
    if (!enablePersist) return;
    if (addresses.length === 0) {
      clearPersistedData();
      return;
    }
    setPersistedData('accounts', JSON.stringify(addresses));
  });

  bridge.on(BridgeEvent.chainChanged, chainId => {
    cacheNetwork = chainId;
    if (enablePersist) setPersistedData('chainId', chainId);
  });

  bridge.on(BridgeEvent.clear, () => {
    cacheAddresses = [];
    cacheNetwork = '';
    if (enablePersist) clearPersistedData();
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
