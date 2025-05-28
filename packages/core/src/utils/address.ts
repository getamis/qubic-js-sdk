import { Address } from "../types";

export const isAddress = (address: string | undefined): address is Address => {
  if (!address) return false;
  return typeof address === 'string' && address.startsWith('0x');
}
