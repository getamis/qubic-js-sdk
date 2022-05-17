import { ethErrors } from 'eth-rpc-errors';
import { createAsyncMiddleware, JsonRpcMiddleware } from 'json-rpc-engine';
import jsonRpcRequest from './jsonRpcRequest';

interface CreateJsonRpcServerMiddlewareOptions {
  url: string;
}
export function createJsonRpcServerMiddleware(
  options: CreateJsonRpcServerMiddlewareOptions,
): JsonRpcMiddleware<unknown, unknown> {
  const { url } = options;
  return createAsyncMiddleware(async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await jsonRpcRequest(url, req.method, req.params as any);
      res.result = result;
    } catch (error) {
      if (error instanceof Error) {
        res.error = error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.error = ethErrors.rpc.parse((error as any).message);
      }
    }
  });
}
