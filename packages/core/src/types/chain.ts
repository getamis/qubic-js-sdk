import { AbiItem } from 'web3-utils';

import { Network, Speed } from '../enums';
import { IPaymentRequest } from './payment';

export type HexString = string;
export type Address = HexString;

export type AuthConfig = {
  apiKey: string;
  apiSecret: string;
  network: Network;
};

export type Cost = {
  gasPrice: string;
  wait: number;
};

export type CostData = {
  blockNumber: number;
  blockHash: string;
  [Speed.FASTEST]: Cost;
  [Speed.FAST]: Cost;
  [Speed.AVERAGE]: Cost;
};

export enum TokenType {
  ETH = 'ETH',
  ERC20 = 'ERC20',
}

export enum CollectibleType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export type Abi = AbiItem[];

export interface IContract {
  address: string;
  name: string; // can be empty
  logo: string; // can be empty
}

export interface Token extends IContract {
  tokenType: TokenType;
  symbol: string;
  decimals: number;
  payableByFiat?: boolean;
  gasPayable?: boolean;
}

export interface Collectible extends IContract {
  collectibleType: CollectibleType;
}

export interface Dapp extends IContract {
  supportPayment?: boolean;
  abi?: string | Abi;
}

export type AnyContract = Token | Collectible | Dapp;

export enum TransactionType {
  NORMAL,
  CONTRACT_CREATION,
  ERC20_TRANSFER,
  CONTRACT_CALL,
}

export type ContractCreationMethod = 'create' | 'create2';

export interface ITransactionDescriptor {
  type: TransactionType;
  from: string;
}

export interface ContractCreation extends ITransactionDescriptor {
  data: string;
}

export interface ContractCall extends ITransactionDescriptor {
  contract: IContract;
  method: string;
  data: string;
}

export interface NormalTransfer extends ITransactionDescriptor {
  symbol: string;
  to: string;
  value: string;
  decimals: number;
}

export interface TokenTransfer extends ContractCall, NormalTransfer {}

export type TransactionDescriptor = NormalTransfer | ContractCreation | TokenTransfer | ContractCall;

export type IBasicTransaction = {
  from: HexString;
  to: HexString | null;
  value: string | null;
  gasPrice: string | null;
  gasLimit: string | null;
  data?: string;
  chainId?: number;
  chain?: string;
};

export type ITransaction = IBasicTransaction & {
  payment?: IPaymentRequest;
};

/**
 * A rpc call is represented by sending a Request object to a Server.
 */
export interface Payload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
  method: string;
  id: number;
  jsonrpc: string;
}
