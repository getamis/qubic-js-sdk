import { gqlQuery } from './gql';
import { CostData, AuthConfig } from '../types';
import { Network, Speed } from '../enums';

export const estimateCosts = async (cfg?: AuthConfig): Promise<CostData | null> => {
  const query = `
    query getGasPrice {
      ethChain(chainId: ${cfg?.network || Network.RINKEBY}) {
        gasPrice {
          blockNumber
          blockHash
          fastest
          fast
          average
        }
      }
    }
  `;

  try {
    const { ethChain } = await gqlQuery(query, cfg);
    const { gasPrice } = ethChain || {};
    const { blockNumber, blockHash, fastest, fast, average } = gasPrice;

    return {
      blockNumber,
      blockHash,
      [Speed.FASTEST]: {
        gasPrice: fastest as string,
        wait: 2,
      },
      [Speed.FAST]: {
        gasPrice: fast as string,
        wait: 5,
      },
      [Speed.AVERAGE]: {
        gasPrice: average as string,
        wait: 20,
      },
    };
  } catch (err) {
    return null;
  }
};
