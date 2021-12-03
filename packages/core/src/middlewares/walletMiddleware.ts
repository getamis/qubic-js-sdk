import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import { Bridge } from '../types';

export const WALLET_HANDLE_METHODS = [
  'qubic_login',
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

export const createWalletMiddleware = (send: Bridge['send']): JsonRpcMiddleware<unknown, unknown> =>
  createAsyncMiddleware(async (req, res, next) => {
    if (WALLET_HANDLE_METHODS.includes(req.method)) {
      try {
        res.result = await send(req);
      } catch (error) {
        if (error instanceof Error) {
          res.error = new Error(error.message);
        }
      }
    } else {
      next();
    }
  });
