import Web3Utils from 'web3-utils';
import Web3ProviderEngine from 'web3-provider-engine';
import { ethErrors } from 'eth-rpc-errors';

import { AMIS } from '../client';
import { Network, Speed } from '../enums';
import { Cost, Address, Payload } from '../types';
import { TransactionConfig } from './tx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EndFunc = (error: Error | null, result?: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NextFunc = (after?: any[]) => void;

export interface ProviderInterface {
  handleRequest(payload: Payload, next?: NextFunc, end?: EndFunc): void;
}

export interface ProviderOptions {
  rpcHost: string;
  needRelayer: boolean;
  onCallRequest: (payload: Payload) => void;
}

export type Callback = (error: Error | null, result: string | null) => void;

const preprocessTx = async (client: AMIS, tx: TransactionConfig): Promise<TransactionConfig> => {
  let { gasPrice } = tx;

  // use estimated gas price
  let { speed } = client;
  const gasPriceKey = typeof gasPrice === 'string' ? Web3Utils.hexToNumber(gasPrice) : undefined;
  if (gasPriceKey && gasPriceKey in Speed) {
    speed = gasPriceKey as Speed;
  }

  // TODO: we will have risk of checking price while user no login.
  // throw error will stop all wallet SDK flow
  if (speed) {
    const costs = await AMIS.currentClient.estimateCosts();
    // if (!costs) throw new Error('Cannot connect to the server');

    // TODO: refactor me
    if (costs) {
      // @ts-ignore
      const cost = costs[speed] as Cost;
      if (!cost?.gasPrice) throw new Error('Cannot read gas price');
      // override gasPrice
      gasPrice = cost.gasPrice;
    } else {
      console.error('try to get price fail');
    }
  }

  let { from, chainId, chain } = tx;

  // overridee chain
  chainId = client.network;
  chain = Network[client.network].toLowerCase();

  if (!from || typeof from === 'number') {
    // number could be the index of accounts
    from = client.currentAddress();
  }

  return {
    ...tx,
    from,
    chainId,
    chain,
    gasPrice,
  };
};

export class Provider implements ProviderInterface {
  opts: ProviderOptions;
  engine?: Web3ProviderEngine;

  public static create(options: ProviderOptions): ProviderInterface {
    return new Provider(options);
  }

  private static getRandomId(): number {
    return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  constructor(options: ProviderOptions) {
    this.opts = options;
  }

  /**
   * @summary handle RPC request
   */
  public handleRequest = async (payload: Payload, next: NextFunc, end: EndFunc): Promise<void> => {
    const { method, params } = payload;

    // fixed issue https://github.com/MetaMask/eth-block-tracker/pull/42
    // web-provider-engine has dependency eth-block-tracer@^4.4.2
    // delete these lines when eth-block-tracer above 5.x.x
    if (method === 'eth_blockNumber' && payload.id === 1) {
      payload.id = Provider.getRandomId();
    }

    switch (method) {
      case 'personal_sign':
      case 'eth_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'eth_signTransaction':
      case 'eth_sendRawTransaction':
        try {
          const result = await this.callRequest(payload);
          end(null, result);
        } catch (e) {
          end(e);
        }
        break;
      case 'eth_sendTransaction':
        if (params.length === 0) end(new Error(`${payload.method} has invalid parameters`));

        // pre-process tx
        // TODO: move to WalletCoordinator
        params[0] = await preprocessTx(AMIS.currentClient, params[0]);

        try {
          const result = await this.callRequest(payload);
          end(null, result);
        } catch (e) {
          end(e);
        }
        break;
      case 'eth_accounts':
        try {
          const addresses = this.addresses();
          end(null, addresses);
        } catch (e) {
          end(e);
        }
        break;
      default:
        next();
    }
  };

  public setEngine = (engine: Web3ProviderEngine): void => {
    this.engine = engine;
  };

  private callRequest = async (payload: Payload): Promise<string> => {
    const { onCallRequest } = this.opts;

    const requestId = Provider.getRandomId();

    return new Promise((resolve, reject) => {
      const listener = (e: MessageEvent): void => {
        const { data } = e;
        const { action, id, result, error } = data as { action: string; id: number; result: string; error?: Error };

        if (requestId === id) {
          if (action === 'approve_request') {
            if (!result) {
              reject(new Error('Empty result'));
              return;
            }
            const finalResult = result.startsWith('0x') ? result : `0x${result}`;
            resolve(finalResult);
          } else if (action === 'reject_request') {
            if (error) {
              reject(error);
            }
          }
          window.removeEventListener('message', listener);
          return;
        }
        if (action === 'hideIframe') {
          reject(ethErrors.provider.userRejectedRequest('Qubic Message Signature: User denied message signature.'));
          window.removeEventListener('message', listener);
        }
      };

      window.addEventListener('message', listener, false);

      if (onCallRequest) {
        onCallRequest({
          ...payload,
          id: requestId,
        });
      }
    });
  };

  public addresses = (): Address[] => {
    const address = AMIS.sharedStore.getCurrentAddress();
    if (!address) return [];
    return [address];
  };
}
