import { Address } from './types';

export interface Store {
  getCurrentAddress: () => string | null;
  setCurrentAddress: (address: string | null | undefined) => void;
  getCurrentNetwork: () => string | null;
  setCurrentNetwork: (network: string | null | undefined) => void;
  getAddresses: () => Address[] | null;
  setAddresses: (addresses: Address[] | null | undefined) => void;
  clear: () => void;
}
