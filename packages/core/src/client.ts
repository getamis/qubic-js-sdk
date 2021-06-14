import { AbstractProvider } from 'web3-core';
import Web3ProviderEngine from 'web3-provider-engine';
// @ts-ignore
import WebsocketProvider from 'web3-provider-engine/subproviders/websocket';

import { Provider as Web3Provider } from './web3';
import { Store } from './store';
import { Network, Speed } from './enums';
import { CostData, Payload } from './types';
import { NODE_URLS, getWalletUrl } from './constants/backend';
import { estimateCosts } from './models';
import { queryWithAuthConfig } from './utils';

type ProviderOptions = any;

// for sign in
const addressResolver = (resolve: (value: string | PromiseLike<string>) => void) => {
  return (e: MessageEvent) => {
    const { data } = e;
    const { method, address } = data;

    if (method === 'setAddress') {
      resolve(address);
    }
  };
};

export class AMIS {
  public static currentClient: AMIS;

  public static initialize: (url: string) => void;
  public static authModalHandler?: () => void;
  public static requestModalHandler?: (payload: Payload) => void;

  public static sharedStore: Store;

  public apiKey: string;
  public apiSecret: string;
  public network: Network = Network.MAINNET;
  public speed?: Speed;

  private engine!: Web3ProviderEngine;

  constructor(apiKey: string, apiSecret: string, network: Network | string) {
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
      `${getWalletUrl(this.network)}?${queryWithAuthConfig({
        apiKey,
        apiSecret,
        network,
      })}`,
    );

    window.addEventListener(
      'message',
      e => {
        const { data } = e;
        const { method, address } = data;

        if (method === 'setAddress') {
          AMIS.sharedStore.setCurrentAddress(address);
        } else if (method === 'clear') {
          AMIS.sharedStore.clear();
        }
      },
      false,
    );

    AMIS.currentClient = this;
  }

  public deinitialize = (): void => {
    this.engine.stop();
  };

  public getProvider = (options?: ProviderOptions): AbstractProvider => {
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
    return this.engine;
  };

  public signIn = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!AMIS.authModalHandler) {
        reject(new Error(`Auth modal handler is not set, please check the SDK configuration`));
        return;
      }

      if (this.apiKey && this.apiSecret) {
        window.addEventListener('message', addressResolver(resolve), false);

        AMIS.authModalHandler();
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
}
