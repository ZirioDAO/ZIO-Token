import { ethers } from "hardhat";

async function main() {
  const DeliveryContract = await ethers.getContractFactory("DeliveryContract");
  const deliveryContract = await DeliveryContract.deploy();

  await deliveryContract.deployed();

  console.log(`Contract deployed to ${deliveryContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
