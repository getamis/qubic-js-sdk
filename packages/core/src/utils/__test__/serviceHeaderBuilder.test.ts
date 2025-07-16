import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import serviceHeaderBuilder from '../serviceHeaderBuilder';

// Mock crypto-js modules
jest.mock('crypto-js/hmac-sha256');
jest.mock('crypto-js/enc-base64');

const mockHmacSHA256 = HmacSHA256 as jest.MockedFunction<typeof HmacSHA256>;
const mockBase64 = Base64 as jest.Mocked<typeof Base64>;

describe('serviceHeaderBuilder', () => {
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';
  const mockServiceUri = 'https://api.example.com/endpoint?param=value';
  const mockAccessToken = 'test-access-token';
  const mockSignature = 'mock-signature';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);

    // Mock crypto-js functions
    const mockHashResult = {
      toString: jest.fn().mockReturnValue(mockSignature),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockHmacSHA256.mockReturnValue(mockHashResult as any);
    mockBase64.toString = jest.fn().mockReturnValue(mockSignature);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty object when apiKey is missing', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: '',
      apiSecret: mockApiSecret,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when apiSecret is missing', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: '',
    });

    expect(result).toEqual({});
  });

  it('should return empty object when both apiKey and apiSecret are missing', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: '',
      apiSecret: '',
    });

    expect(result).toEqual({});
  });

  it('should generate headers with default GET method and empty body', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith('1234567890GET/endpoint?param=value', mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should generate headers with custom HTTP method', () => {
    const result = serviceHeaderBuilder({
      httpMethod: 'POST',
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith('1234567890POST/endpoint?param=value', mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should generate headers with custom body', () => {
    const mockBody = JSON.stringify({ test: 'data' });

    const result = serviceHeaderBuilder({
      httpMethod: 'POST',
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      body: mockBody,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith(`1234567890POST/endpoint?param=value${mockBody}`, mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should include Authorization header when accessToken is provided', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      accessToken: mockAccessToken,
    });

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
      Authorization: `Bearer ${mockAccessToken}`,
    });
  });

  it('should not include Authorization header when accessToken is null', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      accessToken: null,
    });

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should handle URL without query parameters', () => {
    const simpleUri = 'https://api.example.com/endpoint';

    const result = serviceHeaderBuilder({
      serviceUri: simpleUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith('1234567890GET/endpoint', mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should handle URL with only pathname', () => {
    const pathOnlyUri = 'https://api.example.com/';

    const result = serviceHeaderBuilder({
      serviceUri: pathOnlyUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith('1234567890GET/', mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should handle body as null', () => {
    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      body: null,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith('1234567890GET/endpoint?param=valuenull', mockApiSecret);

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should handle complex query parameters', () => {
    const complexUri = 'https://api.example.com/endpoint?param1=value1&param2=value2&param3=value%20with%20spaces';

    const result = serviceHeaderBuilder({
      serviceUri: complexUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith(
      '1234567890GET/endpoint?param1=value1&param2=value2&param3=value%20with%20spaces',
      mockApiSecret,
    );

    expect(result).toEqual({
      'X-Qubic-Api-Key': mockApiKey,
      'X-Qubic-Ts': '1234567890',
      'X-Qubic-Sign': mockSignature,
    });
  });

  it('should use current timestamp from Date.now()', () => {
    const mockTimestamp = 9876543210;
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = serviceHeaderBuilder({
      serviceUri: mockServiceUri,
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
    });

    expect(mockHmacSHA256).toHaveBeenCalledWith(`${mockTimestamp}GET/endpoint?param=value`, mockApiSecret);

    expect(result['X-Qubic-Ts']).toBe(mockTimestamp.toString());
  });
});
