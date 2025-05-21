import { KnownNetwork } from "./chain";

export interface ApiConfig {
  apiKey?: string;
  apiSecret?: string;
  chainId: KnownNetwork;
}
