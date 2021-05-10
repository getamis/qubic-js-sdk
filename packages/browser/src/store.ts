import { Store, Address } from '@qubic-js/core';

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
    return this.getItem('currentAddress');
  };

  public setCurrentAddress = (address: string | null | undefined): void => {
    this.updateItem('currentAddress', address);
  };

  public getAddresses = (): Address[] | null => {
    const addressesStr = this.getItem('addresses');
    return addressesStr ? JSON.parse(addressesStr) : null;
  };

  public setAddresses = (addresses: Address[] | null | undefined): void => {
    this.updateItem('addresses', addresses ? JSON.stringify(addresses) : null);
  };

  public clear = (): void => {
    this.updateItem('currentAddress', null);
    this.updateItem('addresses', null);
  };
}
