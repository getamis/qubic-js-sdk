import { AbstractProvider } from 'web3-core';
import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { AmisOptions } from '../../../core/src/client';

export default class QubicConnector extends AbstractConnector {
  private client: any;
  private provider: AbstractProvider | undefined;

  private apiKey: string;
  private apiSecret: string;
  private chainId: number;
  private options?: AmisOptions;

  constructor(apiKey: string, apiSecret: string, chainId: number | string, options?: AmisOptions) {
    super({ supportedChainIds: [1, 4] }); // [mainnet, rinkeby]

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.chainId = Number(chainId) || 1;
    this.options = options;
  }

  public activate = async (): Promise<ConnectorUpdate> => {
    if (!this.apiKey || !this.apiSecret || !this.chainId || !this.supportedChainIds?.includes(this.chainId)) {
      throw new Error('No API KEY, API SECRET and chainId');
    }

    if (!this.client) {
      const AMIS = await import('@qubic-js/browser').then(dyIm => dyIm?.default ?? dyIm);
      this.client = new AMIS(this.apiKey, this.apiSecret, this.chainId, this.options);
      this.provider = this.client.getProvider();
    }

    const address = await this.client.signIn();
    const result = { provider: this.provider, chainId: this.chainId, account: address };
    this.emitUpdate(result);

    // register accountsChanged events
    this.client.on('accountsChanged', (accounts: Array<string>) => {
      const newResult = { provider: this.provider, chainId: this.chainId, account: accounts[0] || null };
      this.emitUpdate(newResult);
    });

    // TODO: register chainChanged events

    return result;
  };

  public getClient = (): any => {
    if (!this.client) throw new Error('please activate first');
    return this.client;
  };

  public getProvider = async (): Promise<any> => {
    return this.provider;
  };

  public getChainId = async (): Promise<number | string> => {
    return this.chainId;
  };

  public async getAccount(): Promise<null | string> {
    return this.client.currentAddress();
  }

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L109
  // DONT'T call `this.emitDeactivate` in deactivate
  public deactivate = (): void => {
    this.client.deinitialize();
  };

  // https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/portis-connector/src/index.ts#L126
  // call `this.emitDeactivate` in close
  public close = (): void => {
    this.client.deinitialize();
    this.emitDeactivate();
  };
}
