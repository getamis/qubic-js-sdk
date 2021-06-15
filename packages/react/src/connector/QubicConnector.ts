import { AbstractProvider } from 'web3-core';
import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';

export default class QubicConnector extends AbstractConnector {
  private client: any;
  private provider: AbstractProvider | undefined;

  private apiKey: string;
  private apiSecret: string;
  private chainId: number;

  constructor(apiKey: string, apiSecret: string, chainId: number | string) {
    super({ supportedChainIds: [1, 4] }); // [mainnet, rinkeby]

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.chainId = Number(chainId) || 1;
  }

  public activate = async (): Promise<ConnectorUpdate> => {
    if (!this.apiKey || !this.apiSecret || !this.chainId || !this.supportedChainIds?.includes(this.chainId)) {
      throw new Error('No API KEY, API SECRET and chainId');
    }

    if (!this.client) {
      const AMIS = await import('@qubic-js/browser').then(dyIm => dyIm?.default ?? dyIm);
      this.client = new AMIS(this.apiKey, this.apiSecret, this.chainId);
      this.provider = this.client.getProvider();
    }

    const address = await this.client.signIn();
    const result = { provider: this.provider, chainId: this.chainId, account: address };
    this.emitUpdate(result);

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

  public deactivate = (): void => {
    this.client.deinitialize();
    this.emitDeactivate();
  };

  public close = (): void => {
    this.client.deinitialize();
  };
}
