import { JsonRpcResponse } from 'json-rpc-engine';

export interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface SendAsync {
  (request: RequestArguments, callback: (error: unknown, response?: JsonRpcResponse<unknown>) => void): void;
}

export interface Request {
  (request: RequestArguments): Promise<unknown>;
}
