import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PolkadotDAOModule", (m) => {
  // Use the first Hardhat account as the initial member
  const initialMembers = [m.getAccount(0)];

  // Define the contract deployment
  const polkadotDAO = m.contract("PolkadotDAO", [initialMembers]);

  // Return the deployed contract for reference
  return { polkadotDAO };
});