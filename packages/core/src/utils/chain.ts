import { Network } from '../types';

export function isSupportedNetwork(chainId: number): chainId is Network {
  return chainId in Network;
}
