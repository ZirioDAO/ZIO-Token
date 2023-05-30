const networkConfig: {
  [key: string]: {
    name: string;
  };
} = {
  421613: {
    name: "arbitrum-goerli",
  },
  42161: {
    name: "arbitrum-one",
  },
  31337: {
    name: "hardhat",
  },
};

const developmentChains = ["hardhat", "localhost"];

export { networkConfig, developmentChains };
