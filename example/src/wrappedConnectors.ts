import QubicWalletConnector from '@qubic-js/react';
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { Connector, Web3ReactStore } from '@web3-react/types';
import { chainId, autoHideWelcome, enableIframe } from './queryParams';

const { REACT_APP_INFURA_NETWORK_KEY } = process.env as any;

const INFURA_PROJECT_ID = REACT_APP_INFURA_NETWORK_KEY;

const qubic = initializeConnector<QubicWalletConnector>(
  actions =>
    new QubicWalletConnector({
      actions,
      options: {
        chainId,
        infuraProjectId: INFURA_PROJECT_ID,
        autoHideWelcome,
        enableIframe,
      },
    }),
);

const wrappedConnectors: Record<'qubic', [Connector, Web3ReactHooks, Web3ReactStore]> = {
  qubic,
};

export default wrappedConnectors;
