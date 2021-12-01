import { Store, Address } from '@qubic-js/core';

const QUBIC_CURRENT_ADDRESS = 'QUBIC_CURRENT_ADDRESS';
const QUBIC_CURRENT_NETWORK = 'QUBIC_CURRENT_NETWORK';

export class BrowserStore implements Store {
  private getItem = (key: string): string | null => {
    return window.localStorage.getItem(key);
  };

  private updateItem = (itemKey: string, itemValue: string | null | undefined) => {
    if (itemValue) {
      window.localStorage.setItem(itemKey, itemValue);
    } else {
      window.localStorage.removeItem(itemKey);
    }
  };

  public getCurrentAddress = (): Address | null => {
    return this.getItem(QUBIC_CURRENT_ADDRESS);
  };

  public setCurrentAddress = (address: Address | null | undefined): void => {
    this.updateItem(QUBIC_CURRENT_ADDRESS, address);
  };

  public getCurrentNetwork = (): string | null => {
    return this.getItem(QUBIC_CURRENT_NETWORK);
  };

  public setCurrentNetwork = (network: string | null | undefined): void => {
    this.updateItem(QUBIC_CURRENT_NETWORK, network);
  };

  public clear = (): void => {
    this.updateItem(QUBIC_CURRENT_ADDRESS, null);
    this.updateItem(QUBIC_CURRENT_ADDRESS, null);
  };
}
