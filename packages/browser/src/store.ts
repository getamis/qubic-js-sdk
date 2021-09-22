import { Store, Address, AmisOptions } from '@qubic-js/core';

const QUBIC_AMIS_OPTIONS = 'QUBIC_AMIS_OPTIONS';
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

  public getAmisOptions = (): AmisOptions => {
    return JSON.parse(this.getItem(QUBIC_AMIS_OPTIONS) || '{}');
  };

  public setAmisOptions = (options: AmisOptions): void => {
    this.updateItem(QUBIC_AMIS_OPTIONS, JSON.stringify(options));
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
    this.updateItem(QUBIC_AMIS_OPTIONS, null);
    this.updateItem(QUBIC_CURRENT_ADDRESS, null);
    this.updateItem(QUBIC_ADDRESSES, null);
  };
}
