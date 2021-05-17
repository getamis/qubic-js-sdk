/* @ts-ignore */
import InputDataDecoder from 'ethereum-input-data-decoder';
import { AbstractProvider } from 'web3-core';
import Web3Utils from 'web3-utils';
import erc20 from '../abi/erc20';

import { ContractCall, TransactionType, TokenTransfer, AnyContract, Token, Dapp } from '../types';
import { TransactionConfig } from './tx';

export const isContractCall = (tx: TransactionConfig | null): boolean => {
  if (!tx) return false;

  const { to, data } = tx;
  return Boolean(!!to && !!data && data.length > 0);
};

export const isContractCreation = (tx: TransactionConfig): boolean => {
  const { to, data } = tx;
  return Boolean(!to && !!data && data.length > 0);
};

export const tryExtractDescriptor = (
  tx: TransactionConfig,
  contract: AnyContract,
): TokenTransfer | ContractCall | null => {
  const { from, to, data = '' } = tx;
  if (!to) return null;
  if (!contract) return null;

  const { tokenType, symbol, decimals } = contract as Token;
  let { abi } = contract as Dapp;

  // add token abi
  if (tokenType === 'ERC20') abi = erc20;

  if (!abi) {
    return {
      type: TransactionType.CONTRACT_CALL,
      from: String(from),
      contract,
      symbol,
      method: '',
      data,
    };
  }

  let recipient = '';
  let amount = '';

  try {
    const decoder = new InputDataDecoder(abi);
    const { method, inputs } = decoder.decodeData(data);

    if (method === 'transfer') {
      recipient = inputs[0].toString();
      amount = inputs[1].toString(10);
    } else if (method === 'transferFrom') {
      recipient = inputs[1].toString();
      amount = inputs[2].toString(10);
    } else {
      // ERC-20 but not transfer
      return {
        type: TransactionType.CONTRACT_CALL,
        from: String(from),
        contract,
        method: method || '',
        data: inputs && inputs.length > 0 ? JSON.stringify(inputs) : data,
      };
    }

    const tokenDecimals = Web3Utils.toBN(decimals);
    const transferValue = Web3Utils.toBN(amount).div(Web3Utils.toBN(10).pow(tokenDecimals)).toString();

    // ERC-20 transfer
    return {
      type: TransactionType.ERC20_TRANSFER,
      contract,
      method, // transfer or transferFrom
      data: JSON.stringify(inputs), // must have inputs
      symbol,
      from: String(from),
      to: `0x${recipient}`,
      value: transferValue,
      decimals,
    };
  } catch (e) {
    // not ERC-20
    return {
      type: TransactionType.CONTRACT_CALL,
      from: String(from),
      contract,
      method: '',
      data,
    };
  }
};

export function adaptEthersWeb3Provider(provider: AbstractProvider): AbstractProvider {
  const originalSendAsync = provider.sendAsync;
  provider.sendAsync = (request, callback: (error: any, result: any) => void) => {
    return originalSendAsync.call(provider, request, (error, result) => {
      callback(error, {
        result,
      });
    });
  };

  const originalSend = provider.send;
  provider.send = (request, callback: (error: any, response: any) => void) => {
    return originalSend?.call(provider, request, (error, response) => {
      callback(error, {
        result: response,
      });
    });
  };
  return provider;
}
