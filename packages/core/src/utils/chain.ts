import { gql, ClientError } from 'graphql-request';
import NodeCache from 'node-cache';

import { GraphQLClient } from './graphql';
import { ChainInfo, ChainType, Network, NetworkInfo } from '../types';

export { ClientError }; // for `getNetworkInfo`, `getAllNetworkInfo` catch error type

const CHAIN_FIELDS = gql`
  fragment ChainFields on Chain {
    id
    chainId
    name
    blockExplorerUrls
    rpcUrls
    nativeToken {
      id
      chainId
      address
      name
      symbol
      decimals
    }
    networkType
    type
  }
`;

const CHAIN = gql`
  ${CHAIN_FIELDS}
  query Chain($id: ID!) {
    chain(id: $id) {
      ...ChainFields
    }
  }
`;

const CHAINS = gql`
  ${CHAIN_FIELDS}
  query Chains($type: ChainType) {
    chains(type: $type) {
      nodes {
        ...ChainFields
      }
    }
  }
`;

function isEnumValue<T extends Record<string, unknown>>(enumObj: T, value: unknown): value is T[keyof T] {
  return Object.values(enumObj)
    .filter(v => typeof v === 'number')
    .includes(Number(value));
}

export function isNetwork(chainId: number | string): chainId is Network {
  return isEnumValue(Network, chainId);
}

function getNetworkFromApiChain(chainInfo: ChainInfo): NetworkInfo {
  return {
    chainId: chainInfo.chainId,
    chainName: chainInfo.name,
    blockExplorerUrls: chainInfo.blockExplorerUrls,
    nativeCurrency: chainInfo.nativeToken,
    rpcUrls: chainInfo.rpcUrls,
    type: chainInfo.type,
    networkType: chainInfo.networkType,
  };
}

const cache = new NodeCache({ stdTTL: 3600 });

interface ChainVariables {
  id: string | number;
}
interface ChainResult {
  chain: ChainInfo;
}
interface ChainsVariables {
  type?: ChainType;
}
interface ChainsResult {
  chains: {
    nodes: ChainInfo[];
  };
}

export async function getNetworkInfo(id: number): Promise<NetworkInfo> {
  const cacheKey = `networkInfo:${id}`;
  const cachedData = cache.get<NetworkInfo>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const chainInfo = await GraphQLClient.getInstance().request<ChainVariables, ChainResult>({
    query: CHAIN,
    variables: { id },
  });

  const apiChain = chainInfo.chain;
  if (!isNetwork(apiChain.chainId)) {
    throw new Error(`Unknown chainId: ${apiChain.chainId}. Check Network enum update status.`);
  }

  const networkInfo = getNetworkFromApiChain(apiChain);
  cache.set(cacheKey, networkInfo);
  return networkInfo;
}

export async function getAllNetworkInfo(type?: ChainType): Promise<NetworkInfo[] | null> {
  const cacheKey = `allNetworkInfo:${type || 'all'}`;
  const cachedData = cache.get<NetworkInfo[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const allChainInfo = await GraphQLClient.getInstance().request<ChainsVariables, ChainsResult>({
    query: CHAINS,
    variables: { type },
  });

  allChainInfo.chains.nodes.forEach(node => {
    if (!isNetwork(node.chainId)) {
      throw new Error(`Unknown chainId: ${node.chainId}. Check Network enum update status.`);
    }
  });

  const allNetworkInfo = allChainInfo.chains.nodes.map(getNetworkFromApiChain);
  cache.set(cacheKey, allNetworkInfo);
  return allNetworkInfo;
}

export const parseNetwork = async (chainId: number): Promise<Network | null> => {
  try {
    const networkInfo = await getNetworkInfo(chainId);
    return networkInfo.chainId;
  } catch (error) {
    return null;
  }
};

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000455448';
