const { ethers } = require("hardhat");

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.waitForDeployment();

  console.log(`SimpleStorage deployed at ${simpleStorage.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
