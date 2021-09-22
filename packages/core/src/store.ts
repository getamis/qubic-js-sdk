import { Address } from './types';

export interface AmisOptions {
  autoHideWelcome?: boolean;
}

export interface Store {
  getAmisOptions: () => AmisOptions;
  setAmisOptions: (options: AmisOptions) => void;
  getCurrentAddress: () => string | null;
  setCurrentAddress: (address: string | null | undefined) => void;
  getAddresses: () => Address[] | null;
  setAddresses: (addresses: Address[] | null | undefined) => void;
  clear: () => void;
}
