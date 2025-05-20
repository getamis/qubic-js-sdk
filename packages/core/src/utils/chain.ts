import { gql } from 'graphql-request';
import { GraphQLClient } from './graphql';
import { ChainInfo, ChainType, NetworkInfo } from '../types';

const CHAIN_FIELDS = gql`
  fragment ChainFields on Chain {
    id
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

interface ChainVariables {
  id: string | number;
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


export async function getNetworkInfo(id: string | number): Promise<NetworkInfo> {
  const chainInfo = await GraphQLClient.getInstance().request<ChainVariables, ChainInfo>({
    query: CHAIN,
    variables: {
      id,
    },
  });

  return getNetworkFromApiChain(chainInfo);
}

interface ChainsVariables {
  type?: ChainType;
}

export async function getAllNetworkInfo(type?: ChainType): Promise<NetworkInfo[]> {
  const allChainInfo = await GraphQLClient.getInstance().request<ChainsVariables, ChainInfo[]>({
    query: CHAINS,
    variables: {
      type,
    },
  });

  return allChainInfo.map((chainInfo) => getNetworkFromApiChain(chainInfo));
}

export async function checkIsNetworkSupported(chainId: number | string, type?: ChainType): Promise<boolean> {
  const supportedNetworks = await getAllNetworkInfo(type);
  return supportedNetworks.some((network) => network.chainId === chainId);
}
