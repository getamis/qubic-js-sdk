import { TransactionConfig as BasicTransaction } from 'web3-core';

export type TransactionConfig = BasicTransaction & {
  // Both gas and gasLimit are available
  // To support ethers.js and web3.js
  gasLimit?: number | string;
};
