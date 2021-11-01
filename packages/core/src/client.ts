import { AbstractProvider } from 'web3-core';
import Web3ProviderEngine from 'web3-provider-engine';
// @ts-ignore
import WebsocketProvider from 'web3-provider-engine/subproviders/websocket';

import { Provider as Web3Provider, ProviderOptions } from './web3';
import { Store } from './store';
import { Network, Speed } from './enums';
import { CostData, Payload } from './types';
import { NODE_URLS, getWalletUrl } from './constants/backend';
import { estimateCosts } from './models';
import { queryWithAuthConfig } from './utils';

export interface AmisOptions {
  /** hide welcome screen after sign in success */
  autoHideWelcome?: boolean;
  enableIframe?: boolean;
}

interface SignInResult {
  account: string;
  chainId: number;
}

// for sign in
const addressNetworkResolver = (resolve: (value: SignInResult | PromiseLike<SignInResult>) => void) => {
  const value: SignInResult = {
    account: '',
    chainId: 0,
  };
  return (e: MessageEvent) => {
    const { data } = e;
    const { method } = data;
    if (method === 'setAddress') {
      value.account = data.address;
    }
    if (method === 'setNetwork') {
      value.chainId = Number(data.chainId);
    }
    if (value.account && value.chainId) {
      resolve(value);
    }
  };
};

export interface QubicWebviewProvider extends AbstractProvider {
  isQubic: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, handler: (params: any) => void): AbstractProvider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeListener(event: string, handler?: (params: any) => void): AbstractProvider;
}

export class AMIS {
  public static currentClient: AMIS;

  public static initialize: (url: string, enableIframe?: boolean) => void;
  public static authModalHandler?: (chainId: number) => void;
  public static requestModalHandler?: (payload: Payload) => void;
  public static hideModal?: () => void;
  private static isConnected = false; // only changes when options.autoHideWelcome

  public static sharedStore: Store;
  public static options?: AmisOptions;

  public apiKey: string;
  public apiSecret: string;
  public network: Network = Network.MAINNET;
  public speed?: Speed;

  private skipRealLoginNextTime = false;
  private addressNetworkResolverRef: (e: MessageEvent) => void;

  private engine!: Web3ProviderEngine & { isQubic?: boolean };

  private onAccountsChanged?: (accounts: Array<string>) => void;
  private onChainChanged?: (chainId: string) => void;

  private globalEthereum: QubicWebviewProvider | undefined;

  constructor(apiKey: string, apiSecret: string, network: Network | string, options: AmisOptions = {}) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    if (typeof network === 'string') {
      const parseNetwork = Number(network);
      if (!Object.values(Network).includes(parseNetwork)) {
        throw Error(`Network ${network} not support`);
      }
      network = parseNetwork as Network;
    }
    this.network = network;

    AMIS.initialize(
      `${getWalletUrl()}?${queryWithAuthConfig({
        apiKey,
        apiSecret,
        network,
      })}`,
      options.enableIframe,
    );

    window.addEventListener(
      'message',
      e => {
        const { data } = e;
        const { method, address } = data;
        if (method === 'setAddress') {
          AMIS.sharedStore.setCurrentAddress(address);
          this.onAccountsChanged?.([address]);
          if (options.autoHideWelcome && address && !AMIS.isConnected) {
            // only auto hide popup when first time connect qubic
            AMIS.hideModal?.();
          }
          AMIS.isConnected = !!address;
        } else if (method === 'setNetwork') {
          const { chainId } = data;
          AMIS.sharedStore.setCurrentNetwork(chainId);
          this.onChainChanged?.(chainId);
        } else if (method === 'clear') {
          AMIS.sharedStore.clear();
          this.onAccountsChanged?.([]);
          AMIS.isConnected = false;
        }
      },
      false,
    );

    AMIS.currentClient = this;

    this.addressNetworkResolverRef = () => null;
    this.globalEthereum = typeof window !== 'undefined' ? window.ethereum : undefined;
  }

  public deinitialize = (): void => {
    AMIS.isConnected = false;
    this.engine.stop();
  };

  public getProvider = (options?: ProviderOptions): AbstractProvider => {
    if (this.globalEthereum?.isQubic) return this.globalEthereum;
    if (this.engine) return this.engine;
    this.engine = new Web3ProviderEngine();
    this.engine.addProvider(
      Web3Provider.create({
        ...options,
        rpcHost: NODE_URLS[this.network],
        onCallRequest: (payload: Payload) => {
          if (!AMIS.requestModalHandler) {
            throw new Error(`Request modal handler is not set, please check the SDK configuration`);
          }
          AMIS.requestModalHandler(payload);
        },
      }),
    );
    this.engine.addProvider(
      new WebsocketProvider({
        rpcUrl: NODE_URLS[this.network],
      }),
    );
    this.engine.start();
    this.engine.isQubic = true;
    return this.engine;
  };

  public signIn = async (): Promise<SignInResult | void> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (this.globalEthereum?.isQubic) {
        const accounts = await this.globalEthereum?.request?.({ method: 'eth_accounts' });
        const chainId = await this.globalEthereum?.request?.({ method: 'eth_chainId' });
        resolve({
          account: accounts[0],
          chainId: Number(chainId),
        });
        return;
      }
      if (!AMIS.authModalHandler) {
        reject(new Error(`Auth modal handler is not set, please check the SDK configuration`));
        return;
      }

      if (this.apiKey && this.apiSecret) {
        // remove existed login success handler, and bind a new one below.
        window.removeEventListener('message', this.addressNetworkResolverRef);

        // For default Qubic login process.
        // Wrap a function to set up skipRealLoginNextTime to true to switch the resolve method to line 201.
        this.addressNetworkResolverRef = addressNetworkResolver((value: SignInResult | PromiseLike<SignInResult>) => {
          this.skipRealLoginNextTime = true;
          resolve(value);
        });

        window.addEventListener('message', this.addressNetworkResolverRef, false);

        // Raise the auth page on Qubic wallet.
        // After login successfully, it will trigger addressNetworkResolver.
        // The resolver will return account and chain id to activate connector.
        AMIS.authModalHandler(this.network);

        // We can not control Qubic login status after deactivate, so that we switch resolve method to this one.
        // The resolver will return account and chain id to activate connector.
        const provider = this.getProvider();
        if (provider && this.skipRealLoginNextTime) {
          provider.sendAsync(
            { jsonrpc: '2.0', params: [], method: 'eth_accounts' },
            (accountError, accountResponse) => {
              if (accountError) {
                reject(new Error('No account by provider'));
                return;
              }
              provider.sendAsync({ jsonrpc: '2.0', params: [], method: 'eth_chainId' }, (chainError, chainResponse) => {
                if (chainError) {
                  reject(new Error('No chain id by provider'));
                  return;
                }
                resolve({
                  account: accountResponse?.result?.[0] || '',
                  chainId: Number(chainResponse?.result),
                });
              });
            },
          );
        }
      } else {
        reject(new Error('SDK not initialized or incorrect API key and secrets'));
      }
    });
  };

  public setSpeed = (speed?: Speed): void => {
    this.speed = speed;
  };

  public estimateCosts = (): Promise<CostData | null> => {
    return estimateCosts({
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      network: this.network,
    });
  };

  public currentAddress = (): string => {
    return AMIS.sharedStore.getCurrentAddress() || '';
  };

  // register events
  // https://docs.metamask.io/guide/ethereum-provider.html#events
  public on = (
    event: 'accountsChanged' | 'chainChanged',
    handler: ((accounts: Array<string>) => void) | ((chainId: string) => void),
  ): AMIS | QubicWebviewProvider => {
    if (this.globalEthereum?.isQubic) {
      this.globalEthereum.on(event, handler);
      return this.globalEthereum;
    }

    if (event === 'accountsChanged') {
      this.onAccountsChanged = handler as (accounts: Array<string>) => void;
    }
    if (event === 'chainChanged') {
      this.onChainChanged = handler as (chainId: string) => void;
    }
    return this;
  };

  public removeListener = (
    event: 'accountsChanged' | 'chainChanged',
    handler?: ((accounts: Array<string>) => void) | ((chainId: string) => void),
  ): AMIS | QubicWebviewProvider => {
    if (this.globalEthereum?.isQubic) {
      this.globalEthereum?.removeListener(event, handler);
      return this.globalEthereum;
    }

    if (event === 'accountsChanged') {
      this.onAccountsChanged = undefined;
    }
    if (event === 'chainChanged') {
      this.onChainChanged = undefined;
    }
    return this;
  };
}
