import { Store, Address } from '@qubic-js/core';

const QUBIC_CURRENT_ADDRESS = 'QUBIC_CURRENT_ADDRESS';
const QUBIC_ADDRESSES = 'QUBIC_ADDRESSES';

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

  public getCurrentAddress = (): string | null => {
    return this.getItem(QUBIC_CURRENT_ADDRESS);
  };

  public setCurrentAddress = (address: string | null | undefined): void => {
    this.updateItem(QUBIC_CURRENT_ADDRESS, address);
  };

  public getAddresses = (): Address[] | null => {
    const addressesStr = this.getItem(QUBIC_ADDRESSES);
    return addressesStr ? JSON.parse(addressesStr) : null;
  };

  public setAddresses = (addresses: Address[] | null | undefined): void => {
    this.updateItem(QUBIC_ADDRESSES, addresses ? JSON.stringify(addresses) : null);
  };

  public clear = (): void => {
    this.updateItem(QUBIC_CURRENT_ADDRESS, null);
    this.updateItem(QUBIC_ADDRESSES, null);
  };
}
