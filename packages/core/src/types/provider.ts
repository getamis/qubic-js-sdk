import { JsonRpcResponse, JsonRpcRequest } from 'json-rpc-engine';

export interface SendAsync {
  (request: JsonRpcRequest<unknown>, callback: (error: unknown, response?: JsonRpcResponse<unknown>) => void): void;
}

export interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface Request {
  (request: RequestArguments): Promise<unknown>;
}
