import NodeCache from 'node-cache';

import {
  getNetworkInfo,
  getAllNetworkInfo,
  parseNetwork,
} from '../chain';
import { GraphQLClient } from '../graphql';

import {
  Network,
  ChainType,
} from '../../types'; // 假設你的型別定義在 types.ts

import {
  mockNetworkInfo1,
  mockNetworkInfo2,
  mockNetworkInfo3,
  mockNetworkInfo4,
  mockNetworkInfo5,
  mockChainInfo1,
  mockChainInfo2,
  mockChainInfo3,
  mockChainInfo4,
  mockChainInfo5,
} from './chain.mockdata';

jest.mock('../graphql');

type NodeCacheWithMocks = typeof NodeCache & {
  cacheGetMock: jest.Mock<any, any>;
  cacheSetMock: jest.Mock<any, any>;
};

const { cacheGetMock, cacheSetMock } = NodeCache as NodeCacheWithMocks;

const allNetworks = [
  mockNetworkInfo1,
  mockNetworkInfo2,
  mockNetworkInfo3,
  mockNetworkInfo4,
  mockNetworkInfo5,
];
const allChains = [
  mockChainInfo1,
  mockChainInfo2,
  mockChainInfo3,
  mockChainInfo4,
  mockChainInfo5,
];

describe('chain module (multi-network, typed)', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    mockRequest = jest.fn();
    (GraphQLClient.getInstance as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
  });

  it('should return correct NetworkInfo for each id', async () => {
    cacheGetMock.mockReturnValue(undefined);

    const results = await Promise.all(
      allChains.map((chain, i) => {
        mockRequest.mockResolvedValue({ chain: allChains[i] });
        return getNetworkInfo(chain.chainId);
      })
    );
    results.forEach((result, i) => {
      expect(result).toEqual(allNetworks[i]);
    });
  });

  it('should return all NetworkInfo from API', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({ chains: { nodes: allChains } });

    const result = await getAllNetworkInfo();

    expect(result).toEqual(allNetworks);
    expect(cacheSetMock).toHaveBeenCalled();
  });

  it('should return only MAINNET networks when type is MAINNET', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({
      chains: { nodes: allChains.filter(c => c.type === ChainType.MAINNET) },
    });

    const result = await getAllNetworkInfo(ChainType.MAINNET);
    expect(result?.every(n => n.type === ChainType.MAINNET)).toBe(true);
  });

  it('should return only TESTNET networks when type is TESTNET', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({
      chains: { nodes: allChains.filter(c => c.type === ChainType.TESTNET) },
    });

    const result = await getAllNetworkInfo(ChainType.TESTNET);
    expect(result?.every(n => n.type === ChainType.TESTNET)).toBe(true);
  });

  it('should parse valid Network and return enum', async () => {
    cacheGetMock.mockReturnValue(mockNetworkInfo2);
    const result = await parseNetwork(Network.POLYGON);
    expect(result).toBe(Network.POLYGON);
  });

  it('should return null for parseNetwork if not a valid Network', async () => {
    const result = await parseNetwork(99999);
    expect(result).toBeNull();
  });

  // 5. cache hit/miss
  it('should return cached NetworkInfo if present (cache hit)', async () => {
    cacheGetMock.mockReturnValue(mockNetworkInfo1);

    const result = await getNetworkInfo(Network.MAINNET);

    expect(result).toEqual(mockNetworkInfo1);
    expect(cacheGetMock).toHaveBeenCalledWith('networkInfo:1');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should fetch from API and cache if not cached (cache miss)', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({ chain: mockChainInfo2 });

    const result = await getNetworkInfo(Network.POLYGON);

    expect(result).toEqual(mockNetworkInfo2);
    expect(cacheSetMock).toHaveBeenCalledWith('networkInfo:137', mockNetworkInfo2);
    expect(mockRequest).toHaveBeenCalled();
  });

  // 6. enum/type 錯誤時會 throw
  it('should throw error if API returns unknown chainId', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({
      chain: { ...mockChainInfo1, chainId: 99999 },
    });

    await expect(getNetworkInfo(99999)).rejects.toThrow('Unknown chainId: 99999');
  });
});
