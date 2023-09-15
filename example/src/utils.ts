import { utils } from 'ethers';

export function compareAddressAndLog(recoveredAddress: string, signerAddress?: string): void {
  if (signerAddress && utils.getAddress(recoveredAddress) === utils.getAddress(signerAddress)) {
    console.log(`Successfully verified signer as ${recoveredAddress}`);
  } else {
    console.log(`Failed to verify signer when comparing ${recoveredAddress} to ${signerAddress}`);
  }
}
