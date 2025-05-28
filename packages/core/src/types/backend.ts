import { Network } from "./chain";

export interface ApiConfig {
  apiKey?: string;
  apiSecret?: string;
  chainId: Network;
}
