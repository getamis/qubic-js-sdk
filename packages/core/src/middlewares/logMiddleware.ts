/* eslint-disable no-console */
import { JsonRpcMiddleware } from 'json-rpc-engine';

interface Options {
  label?: string;
}

const createLogMiddleware =
  (options?: Options): JsonRpcMiddleware<unknown, unknown> =>
  (req, res, next) => {
    if (options?.label) {
      console.log(options.label);
    }
    console.log({
      req,
      res,
    });
    next();
  };

export default createLogMiddleware;
