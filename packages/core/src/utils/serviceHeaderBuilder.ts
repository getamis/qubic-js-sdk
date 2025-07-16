import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

type BuilderInput = {
  httpMethod?: string;
  serviceUri: string;
  apiKey: string;
  apiSecret: string;
  body?: BodyInit | null;
  accessToken?: string | null;
};

const serviceHeaderBuilder = ({
  httpMethod = 'GET',
  serviceUri,
  apiSecret,
  apiKey,
  body = '',
  accessToken,
}: BuilderInput): Record<string, string> => {
  if (!apiKey || !apiSecret) {
    return {};
  }

  const now = Date.now();
  const urlObj = new URL(serviceUri);
  const requestURI = `${urlObj.pathname}${urlObj.search}`;
  const msg = `${now}${httpMethod}${requestURI}${body}`;
  const sig = HmacSHA256(msg, apiSecret).toString(Base64);

  return {
    // API Key
    'X-Qubic-Api-Key': apiKey,
    'X-Qubic-Ts': now.toString(),
    'X-Qubic-Sign': sig,

    ...(accessToken && {
      Authorization: `Bearer ${accessToken}`,
    }),
  };
};

export default serviceHeaderBuilder;
