import { gql } from 'graphql-request';
import NodeCache from 'node-cache';
import { GraphQLClient } from './graphql';
import { ChainInfo, ChainType, Network, NetworkInfo } from '../types';

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

export async function getNetworkInfo(id: string | number): Promise<NetworkInfo | null> {
  const cacheKey = `networkInfo:${id}`;
  const cachedData = cache.get<NetworkInfo>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  let chainInfo: ChainResult;
  try {
    chainInfo = await GraphQLClient.getInstance().request<ChainVariables, ChainResult>({
      query: CHAIN,
      variables: { id },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch chain info for ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!isNetwork(chainInfo.chain.chainId)) {
    throw new Error(`Unknown chainId: ${chainInfo.chain.chainId}. Check Network enum update status.`);
  }

  const networkInfo = getNetworkFromApiChain(chainInfo.chain);
  cache.set(cacheKey, networkInfo);
  return networkInfo;
}

export async function getAllNetworkInfo(type?: ChainType): Promise<NetworkInfo[] | null> {
  const cacheKey = `allNetworkInfo:${type || 'all'}`;
  const cachedData = cache.get<NetworkInfo[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  let allChainInfo: ChainsResult;
  try {
    allChainInfo = await GraphQLClient.getInstance().request<ChainsVariables, ChainsResult>({
      query: CHAINS,
      variables: { type },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch all chain info${type ? ` with type ${type}` : ''}: ` +
        `${error instanceof Error ? error.message : String(error)}`,
    );
  }

  allChainInfo.chains.nodes.forEach(node => {
    if (!isNetwork(node.chainId)) {
      throw new Error(`Unknown chainId: ${node.chainId}. Check Network enum update status.`);
    }
  });

  const allNetworkInfo = allChainInfo.chains.nodes.map(getNetworkFromApiChain);
  cache.set(cacheKey, allNetworkInfo);
  return allNetworkInfo;
}

export const parseNetwork = async (chainId: number | string): Promise<Network | null> => {
  if (!isNetwork(chainId)) return null;
  return Number(chainId) as Network;
};

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000455448';
