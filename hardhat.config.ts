import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config();

const ARBITRUM_GOERLI_RPC = process.env.ARBITRUM_GOERLI_RPC;
const ARBITRUM_ONE_RPC = process.env.ARBITRUM_ONE_RPC;

const ARBITRUM_GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ARBITRUM_ONE_TEMPORARY_PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arbitrumGoerli: {
      url: ARBITRUM_GOERLI_RPC,
      chainId: 421613,
      accounts: [ARBITRUM_GOERLI_PRIVATE_KEY],
    },
    arbitrumOne: {
      url: ARBITRUM_ONE_RPC,
      chainId: 42161,
      accounts: [ARBITRUM_ONE_TEMPORARY_PRIVATE_KEY],
    },
  },
  mocha: {
    timeout: 300000,
  },
  gasReporter: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      arbitrumTestnet: ARBISCAN_API_KEY,
    },
  },
};

export default config;
