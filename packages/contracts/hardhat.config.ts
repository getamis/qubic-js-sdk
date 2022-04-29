import '@nomiclabs/hardhat-ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: '0.8.13',
  defaultNetwork: 'hardhat',
  networks: {
    mainnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    mumbai: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    polygon: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
  },
  namedAccounts: {},
  mocha: {
    timeout: 200000,
  },
};
