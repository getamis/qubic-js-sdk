import { QubicWebviewProvider } from './client';

declare global {
  interface Window {
    ethereum?: QubicWebviewProvider;
  }
}
