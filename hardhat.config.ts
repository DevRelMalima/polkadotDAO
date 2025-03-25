import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config = {
  solidity: "0.8.20",
  networks: {
    assetHub: {
      url: "https://rpc.polkadot-asset-hub.testnet", // Replace with the correct RPC endpoint
      chainId: 1287, // Moonbase Alpha Testnet chain ID
      accounts: {
        mnemonic: "your-mnemonic-here", // Replace with your mnemonic
      },
    },
  },
 };
 
 
 export default config;
 
