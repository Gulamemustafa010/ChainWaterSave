import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-ethers";
import type { HardhatUserConfig } from "hardhat/config";

const DEPLOYER_PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
    sepolia: {
      // 如果你有自己的Infura或Alchemy API密钥，请替换下面的URL
      // Infura格式: https://sepolia.infura.io/v3/YOUR_API_KEY
      // Alchemy格式: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org", // Sepolia官方公共RPC
      chainId: 11155111,
      accounts: [DEPLOYER_PRIVATE_KEY],
      timeout: 60000, // 60秒超时
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
      evmVersion: "cancun",
    },
  },
};

export default config;





