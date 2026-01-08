const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts...\n");

  // 部署 SimpleStorage
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();
  console.log(`✅ SimpleStorage deployed at: ${simpleStorage.target}`);

  // 部署 JobEscrow
  const JobEscrow = await ethers.getContractFactory("JobEscrow");
  const jobEscrow = await JobEscrow.deploy();
  await jobEscrow.waitForDeployment();
  console.log(`✅ JobEscrow deployed at: ${jobEscrow.target}`);

  console.log("\n📋 Contract Addresses:");
  console.log("================================");
  console.log(`SimpleStorage: "${simpleStorage.target}"`);
  console.log(`JobEscrow: "${jobEscrow.target}"`);
  console.log("================================");
  console.log("\n💡 Copy these addresses to src/wagmi.config.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

