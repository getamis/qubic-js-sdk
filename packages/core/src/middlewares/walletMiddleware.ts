import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import { Bridge } from '../types';

export const createWalletMiddleware = (send: Bridge['send']): JsonRpcMiddleware<unknown, unknown> =>
  createAsyncMiddleware(async (req, res, next) => {
    switch (req.method) {
      case 'eth_chainId':
      case 'eth_accounts':
      case 'eth_requestAccounts':
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain':
      case 'personal_sign':
      case 'eth_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'eth_signTransaction':
      case 'eth_sendTransaction':
        try {
          res.result = await send(req);
        } catch (error) {
          if (error instanceof Error) {
            res.error = new Error(error.message);
          }
        }
        break;
      default:
        next();
    }
  });
