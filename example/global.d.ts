declare module 'detect-inapp';
declare module '@qubic-js/eth-json-rpc-infura' {
  import { JsonRpcMiddleware } from 'json-rpc-engine';

  export interface InfuraMiddlewareOptions {
    network?: string;
    maxAttempts?: number;
    source?: string;
    projectId: string;
    headers?: Record<string, string>;
  }

  function createInfuraMiddleware(opts: InfuraMiddlewareOptions): JsonRpcMiddleware<unknown, unknown>;
  export default createInfuraMiddleware;
}
