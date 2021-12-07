import BrowserProvider from '@qubic-js/browser';
import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Network } from '@qubic-js/core';

interface QubicConnectorOptions {
  apiKey: string;
  apiSecret: string;
  chainId: number;
  infuraProjectId: string;
  /** hide welcome screen after sign in success */
  autoHideWelcome?: boolean;
  enableIframe?: boolean;
}

export default class QubicConnector extends AbstractConnector {
  private provider?: BrowserProvider;
  private options: QubicConnectorOptions;

  constructor(options: QubicConnectorOptions) {
    super({ supportedChainIds: [Network.MAINNET, Network.RINKEBY, Network.POLYGON, Network.MUMBAI] }); // [mainnet, rinkeby]
    const { chainId } = options;

    if (!this.supportedChainIds?.includes(chainId)) {
      throw new Error(`chainId: ${chainId} does not supported`);
    }

    this.options = options;

    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.getProvider();
  }

  private handleChainChanged(chainId: string): void {
    this.emitUpdate({ chainId });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts && accounts.length !== 0) {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  public getProvider = async (): Promise<BrowserProvider> => {
    return new Promise(resolve => {
      if (this.provider) {
        resolve(this.provider);
        return;
      }

      // we don't want next.js run browser js code in server side rendering
      // so we use dynamic import here
      import('@qubic-js/browser')
        .then(dyIm => dyIm?.default ?? dyIm)
        .then(DyImBrowserProvider => {
          const { apiKey, apiSecret, chainId, infuraProjectId, enableIframe } = this.options;
          this.provider = new DyImBrowserProvider({
            apiKey,
            apiSecret,
            chainId,
            infuraProjectId,
            enableIframe,
          });
          resolve(this.provider);
        });
    });
  };

  public activate = async (): Promise<ConnectorUpdate> => {
    const provider = await this.getProvider();

    const accounts = (await provider.request?.({
      method: 'eth_requestAccounts',
    })) as string[];

    const chainId = (await provider.request?.({
      method: 'eth_chainId',
    })) as string;

    provider.on('chainChanged', this.handleChainChanged);
    provider.on('accountsChanged', this.handleAccountsChanged);
    if (this.options?.autoHideWelcome) {
      provider.hide();
    }
    return { provider, chainId: Number(chainId), account: accounts[0] };
  };

  public getChainId = async (): Promise<number | string> => {
    const provider = await this.getProvider();

    const chainId = (await provider.request?.({
      method: 'eth_chainId',
    })) as string;
    return chainId;
  };

  public async getAccount(): Promise<null | string> {
    const provider = await this.getProvider();

    const accounts = (await provider.request?.({
      method: 'eth_accounts',
    })) as string[];

    return accounts[0];
  }

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L109
  // DONT'T call `this.emitDeactivate` in deactivate
  public deactivate = (): void => {
    if (!this.provider) {
      // no need to do any thing if provider is not exists
      return;
    }

    this.provider.off('chainChanged', this.handleChainChanged);
    this.provider.off('accountsChanged', this.handleAccountsChanged);
  };

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L126
  // call `this.emitDeactivate` in close
  public close = (): void => {
    this.emitDeactivate();
    if (!this.provider) {
      // no need to do any thing if provider is not exists
      return;
    }
    this.provider.off('chainChanged', this.handleChainChanged);
    this.provider.off('accountsChanged', this.handleAccountsChanged);
  };
}
