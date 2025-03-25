import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PolkadotDAOModule", (m) => {
  const initialMembers = [m.getAccount(0)]; // Use the first Hardhat account

  const polkdotDAO = m.contract("PoladotDAO", [initialMembers]);

  return { polkdotDAO };
});