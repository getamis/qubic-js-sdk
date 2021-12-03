declare module 'eth-json-rpc-infura' {
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

declare global {
  import { BaseProvider } from './web3/BaseProvider';

  interface Window {
    ethereum?: BaseProvider;
  }
}
