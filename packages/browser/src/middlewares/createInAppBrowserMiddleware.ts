import { ethErrors } from 'eth-rpc-errors';
import { JsonRpcMiddleware } from 'json-rpc-engine';

export const createInAppBrowserMiddleware = (
  isInApp: boolean,
  showWarning: () => void,
): JsonRpcMiddleware<unknown, unknown> => {
  return (req, res, next, end) => {
    if (req.method === 'eth_requestAccounts' && isInApp) {
      showWarning();
      res.error = ethErrors.provider.disconnected();
      end();
      return;
    }

    next();
  };
};
