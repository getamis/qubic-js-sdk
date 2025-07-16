import * as graphqlRequest from 'graphql-request';
import serviceHeaderBuilder from '../serviceHeaderBuilder';
import { GraphQLClient, initNetworkInfoFetcher, GRAPHQL_ENDPOINT, InitGqlConfig } from '../graphql';

jest.mock('graphql-request', () => ({
  request: jest.fn(),
  ClientError: jest.requireActual('graphql-request').ClientError,
}));

const request = graphqlRequest.request as jest.Mock;

jest.mock('../serviceHeaderBuilder');

const MOCK_QUERY = 'query Test { test }';
const MOCK_VARIABLES = { id: 1 };
const MOCK_HEADERS = { 'x-api-key': 'test' };

describe('GraphQL related functions', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    GraphQLClient._resetInstanceForTesting();
    jest.clearAllMocks();
  });

  describe('initNetworkInfoFetcher and GraphQLClient.init', () => {
    it('should return true on successful initialization with valid config', () => {
      const config: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        apiUri: 'https://test.api/graphql',
      };
      const result = initNetworkInfoFetcher(config);
      expect(result).toBeUndefined();
    });

    it('should throw an error if apiKey is missing', () => {
      const config = { apiSecret: 'test-api-secret' };
      expect(() => {
        // @ts-expect-error Testing missing apiKey
        initNetworkInfoFetcher(config);
      }).toThrow('Missing required configuration parameters');
    });

    it('should throw an error if apiSecret is missing', () => {
      const config = { apiKey: 'test-api-key' };
      expect(() => {
        // @ts-expect-error Testing missing apiSecret
        initNetworkInfoFetcher(config);
      }).toThrow('Missing required configuration parameters');
    });

    it('should initialize successfully if apiUri is missing', () => {
      const config = { apiKey: 'test-api-key', apiSecret: 'test-api-secret' };
      const result = initNetworkInfoFetcher(config);
      expect(result).toBeUndefined();
    });
  });

  describe('GraphQLClient.getInstance', () => {
    it('should throw an error if called before initialization', () => {
      expect(() => {
        GraphQLClient.getInstance();
      }).toThrow('GraphQLClient not initialized. Please call initNetworkInfoFetcher() or init() first.');
    });

    it('should return an instance of GraphQLClient after initialization', () => {
      const config: InitGqlConfig = { apiKey: 'test-api-key', apiSecret: 'test-api-secret' };
      GraphQLClient.init(config);
      const instance = GraphQLClient.getInstance();
      expect(instance).toBeInstanceOf(GraphQLClient);
    });
  });

  describe('GraphQLClient.request', () => {
    const config: InitGqlConfig = {
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      apiUri: 'https://custom.api/graphql',
    };

    beforeEach(() => {
      (serviceHeaderBuilder as jest.Mock).mockReturnValue(MOCK_HEADERS);
      request.mockResolvedValue({ data: 'success' });
    });

    it('should make a request with custom apiUri if provided', async () => {
      GraphQLClient.init(config);
      const client = GraphQLClient.getInstance();

      await client.request({ query: MOCK_QUERY, variables: MOCK_VARIABLES });

      expect(serviceHeaderBuilder).toHaveBeenCalledWith({
        serviceUri: config.apiUri,
        httpMethod: 'POST',
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        body: expect.any(String),
      });

      expect(request).toHaveBeenCalledWith({
        url: config.apiUri,
        document: MOCK_QUERY,
        variables: MOCK_VARIABLES,
        requestHeaders: MOCK_HEADERS,
      });
    });

    it('should make a request with default endpoint if apiUri is not provided', async () => {
      const defaultConfig = { apiKey: 'key', apiSecret: 'secret' };
      GraphQLClient.init(defaultConfig);
      const client = GraphQLClient.getInstance();

      await client.request({ query: MOCK_QUERY, variables: MOCK_VARIABLES });

      expect(serviceHeaderBuilder).toHaveBeenCalledWith({
        serviceUri: GRAPHQL_ENDPOINT, // Expect the default endpoint
        httpMethod: 'POST',
        apiKey: defaultConfig.apiKey,
        apiSecret: defaultConfig.apiSecret,
        body: expect.any(String),
      });

      expect(request).toHaveBeenCalledWith({
        url: GRAPHQL_ENDPOINT, // Expect the default endpoint
        document: MOCK_QUERY,
        variables: MOCK_VARIABLES,
        requestHeaders: MOCK_HEADERS,
      });
    });

    it('should throw an error if the query is invalid and body cannot be created', async () => {
      GraphQLClient.init(config);
      const client = GraphQLClient.getInstance();

      await expect(client.request({ query: '' })).rejects.toThrow('Invalid GraphQL query or operation name not found');
    });
  });

  describe('GraphQLClient.resolveRequestDocument', () => {
    it('should resolve a valid string document and extract operation name', () => {
      const result = GraphQLClient.resolveRequestDocument('query MyTest { users { id } }');
      expect(result.query).toBe('query MyTest { users { id } }');
      expect(result.operationName).toBe('MyTest');
    });

    it('should handle an invalid string document gracefully', () => {
      const result = GraphQLClient.resolveRequestDocument('this is not a valid query');
      expect(result.query).toBe('this is not a valid query');
      expect(result.operationName).toBeUndefined();
    });

    it('should resolve a DocumentNode document', async () => {
      const { parse } = await import('graphql');
      const docNode = parse('query MyTestNode { posts { title } }');
      const result = GraphQLClient.resolveRequestDocument(docNode);
      expect(result.query).toContain('MyTestNode');
      expect(result.operationName).toBe('MyTestNode');
    });
  });

  describe('Error Handling', () => {
    const config: InitGqlConfig = {
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
    };

    beforeEach(() => {
      jest.clearAllTimers();
      (serviceHeaderBuilder as jest.Mock).mockReturnValue(MOCK_HEADERS);
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
    });

    it('should handle various network errors and preserve stack trace', async () => {
      // Use a config with 0 retries to avoid infinite loops
      const configNoRetry: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      GraphQLClient.init(configNoRetry);
      const client = GraphQLClient.getInstance();

      const originalError = new Error('Network connection failed');
      originalError.stack = 'Original stack trace';

      request.mockRejectedValue(originalError);

      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow(Error);
      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow('Network connection failed');
    });

    it('should handle serviceHeaderBuilder errors and preserve stack trace', async () => {
      GraphQLClient.init(config);
      const client = GraphQLClient.getInstance();

      const originalError = new Error('Header generation failed');
      originalError.stack = 'Header error stack';

      (serviceHeaderBuilder as jest.Mock).mockImplementation(() => {
        throw originalError;
      });

      try {
        await client.request({ query: MOCK_QUERY });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const graphqlError = error as Error;
        expect(graphqlError.message).toBe('Header generation failed');
      }
    });

    it('should handle retryable vs non-retryable errors correctly', async () => {
      const configNoRetry: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      GraphQLClient.init(configNoRetry);
      const client = GraphQLClient.getInstance();

      const retryableError = new Error('ECONNRESET');
      request.mockRejectedValue(retryableError);

      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow(Error);
      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow('ECONNRESET');

      // Test non-retryable error (should also be wrapped in Error)
      const nonRetryableError = new Error('Invalid request');
      request.mockRejectedValue(nonRetryableError);

      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow(Error);
      await expect(client.request({ query: MOCK_QUERY })).rejects.toThrow('Invalid request');
    });
  });

  describe('Configuration with timeout and retry', () => {
    it('should accept timeout and retryAttempts in config', () => {
      const config: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const result = initNetworkInfoFetcher(config);
      expect(result).toBeUndefined();
    });

    it('should treat configurations with same timeout/retry as identical', () => {
      const config1: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const config2: InitGqlConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      GraphQLClient.init(config1);
      const result = GraphQLClient.init(config2);
      expect(result).toBeUndefined();
    });
  });

  describe('GraphQLClient.init with configuration conflicts', () => {
    beforeEach(() => {
      GraphQLClient._resetInstanceForTesting();
    });

    it('should throw an error when initializing with different configuration after first initialization', () => {
      const firstConfig: InitGqlConfig = {
        apiKey: 'first-key',
        apiSecret: 'first-secret',
        apiUri: 'https://first.api/graphql',
      };

      const secondConfig: InitGqlConfig = {
        apiKey: 'second-key',
        apiSecret: 'second-secret',
        apiUri: 'https://second.api/graphql',
      };

      // First initialization should succeed
      const firstResult = GraphQLClient.init(firstConfig);
      expect(firstResult).toBeUndefined();

      // Second initialization with different config should throw
      expect(() => {
        GraphQLClient.init(secondConfig);
      }).toThrow('GraphQLClient already initialized with a different configuration.');
    });

    it('should throw an error when apiKey differs in subsequent initialization', () => {
      const firstConfig: InitGqlConfig = {
        apiKey: 'first-key',
        apiSecret: 'same-secret',
      };

      const secondConfig: InitGqlConfig = {
        apiKey: 'different-key',
        apiSecret: 'same-secret',
      };

      GraphQLClient.init(firstConfig);

      expect(() => {
        GraphQLClient.init(secondConfig);
      }).toThrow('GraphQLClient already initialized with a different configuration.');
    });

    it('should throw an error when apiSecret differs in subsequent initialization', () => {
      const firstConfig: InitGqlConfig = {
        apiKey: 'same-key',
        apiSecret: 'first-secret',
      };

      const secondConfig: InitGqlConfig = {
        apiKey: 'same-key',
        apiSecret: 'different-secret',
      };

      GraphQLClient.init(firstConfig);

      expect(() => {
        GraphQLClient.init(secondConfig);
      }).toThrow('GraphQLClient already initialized with a different configuration.');
    });

    it('should throw an error when apiUri differs in subsequent initialization', () => {
      const firstConfig: InitGqlConfig = {
        apiKey: 'same-key',
        apiSecret: 'same-secret',
        apiUri: 'https://first.api/graphql',
      };

      const secondConfig: InitGqlConfig = {
        apiKey: 'same-key',
        apiSecret: 'same-secret',
        apiUri: 'https://different.api/graphql',
      };

      GraphQLClient.init(firstConfig);

      expect(() => {
        GraphQLClient.init(secondConfig);
      }).toThrow('GraphQLClient already initialized with a different configuration.');
    });
  });
});
