import { BridgeEvent, Bridge } from '@qubic-js/core';
import { JsonRpcMiddleware } from 'json-rpc-engine';
import { BrowserStore } from '../utils/BrowserStore';

const sharedStore = new BrowserStore();

const createCacheMiddleware = (bridge: Bridge): JsonRpcMiddleware<unknown, unknown> => {
  bridge.on(BridgeEvent.accountsChanged, addresses => {
    sharedStore.setCurrentAddress(addresses[0]);
  });

  bridge.on(BridgeEvent.chainChanged, chainId => {
    sharedStore.setCurrentNetwork(chainId);
  });

  bridge.on(BridgeEvent.clear, () => {
    sharedStore.clear();
  });

  return (req, res, next, end) => {
    const currentAddress = sharedStore.getCurrentAddress();
    const currentNetwork = sharedStore.getCurrentNetwork();

    if (req.method === 'eth_accounts' && currentAddress) {
      res.result = [currentAddress];
      end();
      return;
    }
    if (req.method === 'eth_chainId' && currentNetwork) {
      res.result = currentNetwork;
      end();
      return;
    }

    next();
  };
};

export default createCacheMiddleware;
