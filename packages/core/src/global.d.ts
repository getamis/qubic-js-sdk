declare module 'eth-json-rpc-infura';

declare global {
  import { BaseProvider } from './web3/BaseProvider';

  interface Window {
    ethereum?: BaseProvider;
  }
}
