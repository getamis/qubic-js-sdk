import BrowserProvider from '@qubic-js/browser';
import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Network } from '@qubic-js/core';

interface QubicConnectorOptions {
  /** hide welcome screen after sign in success */
  autoHideWelcome?: boolean;
  enableIframe?: boolean;
}

export default class QubicConnector extends AbstractConnector {
  private provider: BrowserProvider;
  private options?: QubicConnectorOptions;

  constructor(apiKey: string, apiSecret: string, chainId: number, options?: QubicConnectorOptions) {
    super({ supportedChainIds: [Network.MAINNET, Network.RINKEBY, Network.POLYGON, Network.MUMBAI] }); // [mainnet, rinkeby]

    if (!this.supportedChainIds?.includes(chainId)) {
      throw new Error(`chainId: ${chainId} does not supported`);
    }

    this.options = options;

    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.provider = new BrowserProvider(apiKey, apiSecret, chainId, {
      enableIframe: options?.enableIframe,
    });
  }

  private handleChainChanged(chainId: string): void {
    this.emitUpdate({ chainId });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts && accounts.length !== 0) {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  public activate = async (): Promise<ConnectorUpdate> => {
    const accounts = (await this.provider?.request?.({
      method: 'eth_requestAccounts',
    })) as string[];

    const chainId = (await this.provider?.request?.({
      method: 'eth_chainId',
    })) as string;

    this.provider.on('chainChanged', this.handleChainChanged);
    this.provider.on('accountsChanged', this.handleAccountsChanged);
    if (this.options?.autoHideWelcome) {
      this.provider.hide();
    }
    return { provider: this.provider, chainId: Number(chainId), account: accounts[0] };
  };

  public getProvider = async (): Promise<BrowserProvider | undefined> => {
    return this.provider;
  };

  public getChainId = async (): Promise<number | string> => {
    const chainId = (await this.provider?.request?.({
      method: 'eth_chainId',
    })) as string;
    return chainId;
  };

  public async getAccount(): Promise<null | string> {
    const accounts = (await this.provider?.request?.({
      method: 'eth_accounts',
    })) as string[];

    return accounts[0];
  }

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L109
  // DONT'T call `this.emitDeactivate` in deactivate
  public deactivate = (): void => {
    // this.client.deinitialize();
    this.provider.off('chainChanged', this.handleChainChanged);
    this.provider.off('accountsChanged', this.handleAccountsChanged);
  };

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L126
  // call `this.emitDeactivate` in close
  public close = (): void => {
    // this.client.deinitialize();
    this.emitDeactivate();
    this.provider.off('chainChanged', this.handleChainChanged);
    this.provider.off('accountsChanged', this.handleAccountsChanged);
  };
}
