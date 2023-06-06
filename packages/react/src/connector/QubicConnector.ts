import QubicProvider from '@qubic-js/browser';
import { Network, SignInProvider } from '@qubic-js/core';
import type { Actions, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types';
import { Connector } from '@web3-react/types';

export interface QubicConnectorOptions {
  apiKey?: string;
  apiSecret?: string;
  chainId?: number;
  infuraProjectId?: string;
  walletUrl?: string;
  enableIframe?: boolean;
  signInProvider?: SignInProvider;
  disableFastSignup?: boolean;
  disableIabWarning?: boolean;
  disableOpenExternalBrowserWhenLineIab?: boolean;
  /** hide welcome screen after sign in success */
  autoHideWelcome?: boolean;
}

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
}

export interface QubicConstructorArgs {
  actions: Actions;
  options: QubicConnectorOptions;
  onError?: (error: Error) => void;
}

let isInitialized = false;

export default class QubicWalletConnector extends Connector {
  public provider: QubicProvider | undefined;

  private readonly options: QubicConnectorOptions;
  private connected = false;
  private eagerConnection?: Promise<void>;
  private supportedChainIds = [
    Network.MAINNET,
    Network.GOERLI,
    Network.POLYGON,
    Network.MUMBAI,
    Network.BSC,
    Network.BSC_TESTNET,
  ];

  constructor({ actions, options, onError }: QubicConstructorArgs) {
    super(actions, onError);
    this.options = options;

    if (isInitialized) {
      throw Error(`You can only new QubicConnector() one time`);
    }
    isInitialized = true;
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    await (this.eagerConnection = import('@qubic-js/browser').then(m => {
      const {
        apiKey,
        apiSecret,
        chainId: optionChainId = Network.MAINNET,
        walletUrl,
        infuraProjectId,
        enableIframe,
        disableFastSignup,
        disableIabWarning,
        disableOpenExternalBrowserWhenLineIab,
      } = this.options;

      let initChainId = optionChainId;
      if (!this.supportedChainIds?.includes(optionChainId)) {
        console.error(`chainId: ${optionChainId} does not supported, use mainnet instead`);
        initChainId = Network.MAINNET;
      }

      // eslint-disable-next-line new-cap
      this.provider = new m.default({
        apiKey,
        apiSecret,
        chainId: initChainId,
        walletUrl,
        infuraProjectId,
        enableIframe,
        disableFastSignup,
        disableIabWarning,
        disableOpenExternalBrowserWhenLineIab,
      });

      this.connected = true;

      this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) });
      });

      this.provider.on('disconnect', (error: ProviderRpcError): void => {
        this.actions.resetState();
        this.onError?.(error);
      });

      this.provider.on('chainChanged', (chainId: string): void => {
        this.actions.update({ chainId: parseChainId(chainId) });
      });

      this.provider.on('accountsChanged', (accounts: string[]): void => {
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState();
        } else {
          this.actions.update({ accounts });
        }
      });
    }));
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();

      if (!this.provider || !this.connected) throw new Error('No existing connection');

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = await this.provider.request<string[]>({ method: 'eth_accounts' });
      if (!accounts.length) throw new Error('No accounts returned');
      const chainId = await this.provider.request<string>({ method: 'eth_chainId' });
      this.actions.update({ chainId: parseChainId(chainId), accounts });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw new Error('No provider');

      await this.provider?.request?.({
        method: 'eth_requestAccounts',
      });

      await this.provider?.request?.({
        method: 'eth_chainId',
      });
      if (this.options?.autoHideWelcome) {
        this.provider?.hide();
      }
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public deactivate(): void {
    this.connected = false;
    this.provider?.hide();
    this.actions.resetState();
  }

  public setSignInProvider(value: SignInProvider): void {
    // if this is in dapp browser, we don't need to setSignInProvider
    // setSignInProvider only works for web
    if (this.provider?.setSignInProvider) {
      this.provider.setSignInProvider(value);
    }
  }

  public removeSignInProvider(): void {
    if (this.provider?.removeSignInProvider) {
      this.provider.removeSignInProvider();
    }
  }
}
