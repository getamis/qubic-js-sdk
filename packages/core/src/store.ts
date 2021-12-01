import { Address } from './types';

export interface Store {
  getCurrentAddress: () => Address | null;
  setCurrentAddress: (address: Address) => void;
  getCurrentNetwork: () => string | null;
  setCurrentNetwork: (network: string | null | undefined) => void;
  clear: () => void;
}
