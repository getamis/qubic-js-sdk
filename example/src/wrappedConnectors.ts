import QubicWalletConnector from '@qubic-js/react';
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { Connector, Web3ReactStore } from '@web3-react/types';
import { chainId, autoHideWelcome, enableIframe } from './queryParams';

const qubic = initializeConnector<QubicWalletConnector>(
  actions =>
    new QubicWalletConnector({
      actions,
      options: {
        chainId,
        autoHideWelcome,
        enableIframe,
      },
    }),
);

const wrappedConnectors: Record<'qubic', [Connector, Web3ReactHooks, Web3ReactStore]> = {
  qubic,
};

export default wrappedConnectors;
