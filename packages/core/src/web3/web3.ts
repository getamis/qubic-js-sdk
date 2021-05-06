import Web3 from 'web3';
import { Eth } from 'web3-eth';

import { Network } from '../enums';
import { NODE_URLS } from '../constants/backend';

export type Web3Config = {
  network: Network;
};

const web3EthereumApi = (cfg: Web3Config): Eth => {
  const { network = Network.ROPSTEN } = cfg;
  return new Web3(new Web3.providers.WebsocketProvider(NODE_URLS[network])).eth;
};

export default web3EthereumApi;
