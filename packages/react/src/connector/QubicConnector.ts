import BrowserProvider from '@qubic-js/browser';
import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Network } from '@qubic-js/core';

export interface QubicConnectorOptions {
  apiKey: string;
  apiSecret: string;
  chainId: number;
  infuraProjectId: string;
  walletUrl?: string;
  enableIframe?: boolean;
  inAppHintLink?: string;
  /** hide welcome screen after sign in success */
  autoHideWelcome?: boolean;
}

let isInitialized = false;

export default class QubicConnector extends AbstractConnector {
  private provider?: BrowserProvider;
  private options: QubicConnectorOptions;
  public setInAppHintLink: InstanceType<typeof BrowserProvider>['setInAppHintLink'];

  constructor(options: QubicConnectorOptions) {
    super({
      supportedChainIds: [
        Network.MAINNET,
        Network.RINKEBY,
        Network.POLYGON,
        Network.MUMBAI,
        Network.BSC,
        Network.BSC_TESTNET,
      ],
    });
    if (isInitialized) {
      throw Error(`You can only new QubicConnector() one time`);
    }
    isInitialized = true;
    const { chainId } = options;

    if (!this.supportedChainIds?.includes(chainId)) {
      throw new Error(`chainId: ${chainId} does not supported`);
    }

    this.options = options;

    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.setInAppHintLink = () => null;
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

  public getProvider = async (): Promise<BrowserProvider | null> => {
    if (this.provider) {
      return this.provider;
    }

    try {
      // we don't want next.js run browser js code in server side rendering
      // so we use dynamic import here
      const { default: DynamicImportBrowserProvider } = await import('@qubic-js/browser');
      const { apiKey, apiSecret, chainId, walletUrl, infuraProjectId, enableIframe, inAppHintLink } = this.options;
      this.provider = new DynamicImportBrowserProvider({
        apiKey,
        apiSecret,
        chainId,
        walletUrl,
        infuraProjectId,
        enableIframe,
        inAppHintLink,
      });
      this.setInAppHintLink = this.provider.setInAppHintLink;
      return this.provider;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return null;
    }
  };

  public activate = async (): Promise<ConnectorUpdate> => {
    const { provider } = this;

    const accounts = (await provider?.request?.({
      method: 'eth_requestAccounts',
    })) as string[];

    const chainId = (await provider?.request?.({
      method: 'eth_chainId',
    })) as string;

    provider?.on('chainChanged', this.handleChainChanged);
    provider?.on('accountsChanged', this.handleAccountsChanged);
    if (this.options?.autoHideWelcome) {
      provider?.hide();
    }
    return { provider, chainId: Number(chainId), account: accounts[0] };
  };

  public getChainId = async (): Promise<number | string> => {
    const { provider } = this;

    const chainId = (await provider?.request?.({
      method: 'eth_chainId',
    })) as string;
    return chainId;
  };

  public async getAccount(): Promise<null | string> {
    const { provider } = this;

    const accounts = (await provider?.request?.({
      method: 'eth_accounts',
    })) as string[];

    return accounts[0];
  }

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L109
  // DONT'T call `this.emitDeactivate` in deactivate
  public deactivate = (): void => {
    const { provider } = this;

    provider?.removeListener('chainChanged', this.handleChainChanged);
    provider?.removeListener('accountsChanged', this.handleAccountsChanged);
  };

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L126
  // call `this.emitDeactivate` in close
  public close = (): void => {
    const { provider } = this;

    this.emitDeactivate();
    provider?.removeListener('chainChanged', this.handleChainChanged);
    provider?.removeListener('accountsChanged', this.handleAccountsChanged);
  };
}
