import QubicProvider, { getPersistedData, isInQubicDappBrowser } from '@qubic-js/browser';
import { Network, SignInProvider } from '@qubic-js/core';
import type { Actions } from '@web3-react/types';
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
  private eagerConnection?: Promise<void>;
  private supportedChainIds = [
    Network.MAINNET,
    Network.HOLESKY,
    Network.POLYGON,
    Network.AMOY,
    Network.BSC,
    Network.BSC_TESTNET,
    Network.ARBITRUM,
    Network.ARBITRUM_SEPOLIA,
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
        enablePersist: true,
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

      if (!this.provider) {
        throw new Error('No provider');
      }

      // in dapp browser use window.ethereum from dapp browser directly
      // it doesn't use middlewares in this project
      if (isInQubicDappBrowser) {
        const accounts = await this.provider?.request?.<string[]>({
          method: 'eth_requestAccounts',
        });

        const chainId = await this.provider?.request?.<string>({
          method: 'eth_chainId',
        });
        this.actions.update({ chainId: parseChainId(chainId), accounts });
        return;
      }

      // in browser
      const persistedData = getPersistedData();
      if (!persistedData) {
        throw new Error('No existing connection');
      }

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      this.actions.update({ chainId: parseChainId(persistedData.chainId), accounts: persistedData.accounts });
    } catch (error) {
      cancelActivation();
      console.warn(error);
      this.actions.resetState();
    }
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw new Error('No provider');

      const accounts = await this.provider?.request?.<string[]>({
        method: 'eth_requestAccounts',
      });

      const chainId = await this.provider?.request?.<string>({
        method: 'eth_chainId',
      });

      if (this.options?.autoHideWelcome) {
        this.provider?.hide();
      }

      // in web js sdk, when iframe or popup start
      // it will postMessage chainId and accounts immediately
      // but in mobile dapp browser, we have to update manually
      this.actions.update({ chainId: parseChainId(chainId), accounts });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public deactivate(): void {
    this.provider?.hide();
    this.provider?.clearPersistedData();
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
