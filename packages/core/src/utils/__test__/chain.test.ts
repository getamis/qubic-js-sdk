import NodeCache from 'node-cache';

import { getNetworkInfo, getAllNetworkInfo, parseNetwork, isNetwork, NATIVE_TOKEN_ADDRESS } from '../chain';
import { GraphQLClient } from '../graphql';

import { Network, ChainType } from '../../types';

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
  cacheGetMock: jest.Mock;
  cacheSetMock: jest.Mock;
};

const { cacheGetMock, cacheSetMock } = NodeCache as NodeCacheWithMocks;

const allNetworks = [mockNetworkInfo1, mockNetworkInfo2, mockNetworkInfo3, mockNetworkInfo4, mockNetworkInfo5];
const allChains = [mockChainInfo1, mockChainInfo2, mockChainInfo3, mockChainInfo4, mockChainInfo5];

describe('chain module (multi-network, typed)', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

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
      }),
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
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockRejectedValue(new Error('Not found'));

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

  it('should throw error when GraphQL request fails for getNetworkInfo', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const errorMessage = 'Network request failed';
    mockRequest.mockRejectedValue(new Error(errorMessage));

    await expect(getNetworkInfo(Network.MAINNET)).rejects.toThrow(
      `Failed to fetch chain info for ID ${Network.MAINNET}: ${errorMessage}`,
    );
  });

  it('should throw error when GraphQL request fails for getAllNetworkInfo', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const errorMessage = 'Network request failed';
    mockRequest.mockRejectedValue(new Error(errorMessage));

    await expect(getAllNetworkInfo()).rejects.toThrow(`Failed to fetch all chain info: ${errorMessage}`);
  });

  it('should throw error when GraphQL request fails for getAllNetworkInfo with type', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const errorMessage = 'Network request failed';
    mockRequest.mockRejectedValue(new Error(errorMessage));

    await expect(getAllNetworkInfo(ChainType.MAINNET)).rejects.toThrow(
      `Failed to fetch all chain info with type ${ChainType.MAINNET}: ${errorMessage}`,
    );
  });

  it('should return cached data for getAllNetworkInfo', async () => {
    cacheGetMock.mockReturnValue(allNetworks);

    const result = await getAllNetworkInfo();

    expect(result).toEqual(allNetworks);
    expect(cacheGetMock).toHaveBeenCalledWith('allNetworkInfo:all');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should return cached data for getAllNetworkInfo with type', async () => {
    const mainnetNetworks = allNetworks.filter(n => n.type === ChainType.MAINNET);
    cacheGetMock.mockReturnValue(mainnetNetworks);

    const result = await getAllNetworkInfo(ChainType.MAINNET);

    expect(result).toEqual(mainnetNetworks);
    expect(cacheGetMock).toHaveBeenCalledWith('allNetworkInfo:MAINNET');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should throw error if any node in getAllNetworkInfo has unknown chainId', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const chainsWithInvalidId = [...allChains, { ...mockChainInfo1, chainId: 99999 }];
    mockRequest.mockResolvedValue({ chains: { nodes: chainsWithInvalidId } });

    await expect(getAllNetworkInfo()).rejects.toThrow('Unknown chainId: 99999');
  });

  it('should handle non-Error objects in getNetworkInfo catch block', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockRejectedValue('string error');

    await expect(getNetworkInfo(Network.MAINNET)).rejects.toThrow(
      `Failed to fetch chain info for ID ${Network.MAINNET}: string error`,
    );
  });

  it('should handle non-Error objects in getAllNetworkInfo catch block', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockRejectedValue('string error');

    await expect(getAllNetworkInfo()).rejects.toThrow('Failed to fetch all chain info: string error');
  });

  it('should throw error with detailed message when API returns unknown chainId in getNetworkInfo', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockResolvedValue({
      chain: { ...mockChainInfo1, chainId: 99999 },
    });

    await expect(getNetworkInfo(99999)).rejects.toThrow('Unknown chainId: 99999. Check Network enum update status.');
  });

  it('should throw error with detailed message when API returns unknown chainId in getAllNetworkInfo', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const chainsWithInvalidId = [...allChains, { ...mockChainInfo1, chainId: 88888 }];
    mockRequest.mockResolvedValue({ chains: { nodes: chainsWithInvalidId } });

    await expect(getAllNetworkInfo()).rejects.toThrow('Unknown chainId: 88888. Check Network enum update status.');
  });

  it('should throw error with detailed message when API returns unknown chainId in getAllNetworkInfo with type', async () => {
    cacheGetMock.mockReturnValue(undefined);
    const invalidMainnetChain = { ...mockChainInfo1, chainId: 77777, type: ChainType.MAINNET };
    mockRequest.mockResolvedValue({
      chains: { nodes: [invalidMainnetChain] },
    });

    await expect(getAllNetworkInfo(ChainType.MAINNET)).rejects.toThrow(
      'Unknown chainId: 77777. Check Network enum update status.',
    );
  });

  it('should test isNetwork function with valid Network values', () => {
    expect(isNetwork(1)).toBe(true);
    expect(isNetwork(137)).toBe(true);
    expect(isNetwork('1')).toBe(true);
    expect(isNetwork('137')).toBe(true);
  });

  it('should test isNetwork function with invalid values', () => {
    expect(isNetwork(99999)).toBe(false);
    expect(isNetwork('invalid')).toBe(false);
    // @ts-expect-error Testing with invalid types
    expect(isNetwork(null)).toBe(false);
    // @ts-expect-error Testing with invalid types
    expect(isNetwork(undefined)).toBe(false);
  });

  it('should test NATIVE_TOKEN_ADDRESS constant', () => {
    expect(NATIVE_TOKEN_ADDRESS).toBe('0x0000000000000000000000000000000000455448');
  });

  it('should successfully parse valid Network when getNetworkInfo succeeds', async () => {
    cacheGetMock.mockReturnValue(mockNetworkInfo1);

    const result = await parseNetwork(Network.MAINNET);

    expect(result).toBe(Network.MAINNET);
  });

  it('should return null for invalid chainId in parseNetwork', async () => {
    cacheGetMock.mockReturnValue(undefined);
    mockRequest.mockRejectedValue(new Error('Not found'));

    const result = await parseNetwork(99999);

    expect(result).toBeNull();
  });
});
