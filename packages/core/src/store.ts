export interface Store {
  getCurrentAddress: () => string | null;
  setCurrentAddress: (address: string) => void;
  getCurrentNetwork: () => string | null;
  setCurrentNetwork: (network: string | null | undefined) => void;
  clear: () => void;
}
