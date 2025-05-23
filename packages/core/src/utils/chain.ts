import { gql } from 'graphql-request';
import NodeCache from 'node-cache';
import { GraphQLClient } from './graphql';
import { ChainInfo, ChainType, NetworkInfo } from '../types';

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

export async function getNetworkInfo(id: string | number): Promise<NetworkInfo> {
  const cacheKey = `networkInfo:${id}`;
  const cachedData = cache.get<NetworkInfo>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const chainInfo = await GraphQLClient.getInstance().request<ChainVariables, ChainResult>({
    query: CHAIN,
    variables: {
      id,
    },
  });

  const networkInfo = getNetworkFromApiChain(chainInfo.chain);
  cache.set(cacheKey, networkInfo);
  return networkInfo;
}

interface ChainsVariables {
  type?: ChainType;
}

interface ChainsResult {
  chains: {
    nodes: ChainInfo[];
  };
}

export async function getAllNetworkInfo(type?: ChainType): Promise<NetworkInfo[]> {
  const cacheKey = `allNetworkInfo:${type || 'all'}`;
  const cachedData = cache.get<NetworkInfo[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const allChainInfo = await GraphQLClient.getInstance().request<ChainsVariables, ChainsResult>({
    query: CHAINS,
    variables: {
      type,
    },
  });

  const allNetworkInfo = allChainInfo.chains.nodes.map((chainInfo) => getNetworkFromApiChain(chainInfo));
  cache.set(cacheKey, allNetworkInfo);
  return allNetworkInfo;
}

export async function checkIsNetworkSupported(chainId: number | string, type?: ChainType): Promise<boolean> {
  const supportedNetworks = await getAllNetworkInfo(type);
  return supportedNetworks.some((network) => network.chainId === chainId);
}
