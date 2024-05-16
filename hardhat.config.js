


const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://sepolia.infura.io/v3/de64464d68ee4171a0cba0d0d8a18e9d",
      accounts: ["ac30614b86d497df427395af21cac484f4242191b2df1ca8eda7ba9c90d6d565"],
    },

  },
  solidity: {
    compilers: [
      { version: "0.8.20" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 3000000,
  },
};
