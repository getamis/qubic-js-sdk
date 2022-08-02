import { ethErrors } from 'eth-rpc-errors';
import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import { Bridge } from '../types';

export const WALLET_HANDLE_METHODS = [
  'qubic_login',
  'qubic_skipPreviewSign',
  'qubic_issueIdentityTicket',
  'eth_chainId',
  'eth_accounts',
  'eth_requestAccounts',
  'wallet_addEthereumChain',
  'wallet_switchEthereumChain',
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_signTransaction',
  'eth_sendTransaction',
];

export const KEEP_HIDE_WALLET_HANDLE_METHODS = ['qubic_issueIdentityTicket'];

export const createWalletMiddleware = (send: Bridge['send']): JsonRpcMiddleware<unknown, unknown> =>
  createAsyncMiddleware(async (req, res, next) => {
    if (WALLET_HANDLE_METHODS.includes(req.method)) {
      try {
        res.result = await send(req);
      } catch (error) {
        if (error instanceof Error) {
          res.error = error;
        } else {
          res.error = ethErrors.rpc.internal('Unsupported error');
        }
      }
    } else {
      next();
    }
  });
