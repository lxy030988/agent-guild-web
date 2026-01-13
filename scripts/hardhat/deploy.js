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

  // 部署 Wallet
  const Wallet = await ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();
  await wallet.waitForDeployment();
  console.log(`✅ Wallet deployed at: ${wallet.target}`);

  // 部署 DisputeResolution
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy(jobEscrow.target);
  await disputeResolution.waitForDeployment();
  console.log(`✅ DisputeResolution deployed at: ${disputeResolution.target}`);

  // 配置 Wallet 合约：设置 JobEscrow 为授权合约
  console.log("\n⚙️  Configuring contracts...");
  const setJobEscrowTx = await wallet.setJobEscrowContract(jobEscrow.target);
  await setJobEscrowTx.wait();
  console.log("✅ Wallet: JobEscrow contract address set");

  // 配置 JobEscrow 合约：设置 Wallet 合约地址
  const setWalletTx = await jobEscrow.setWalletContract(wallet.target);
  await setWalletTx.wait();
  console.log("✅ JobEscrow: Wallet contract address set");

  // 配置 JobEscrow 合约：设置 DisputeResolver 地址
  const setResolverTx = await jobEscrow.setDisputeResolver(disputeResolution.target);
  await setResolverTx.wait();
  console.log("✅ JobEscrow: DisputeResolver contract address set");

  console.log("\n📋 Contract Addresses:");
  console.log("================================");
  console.log(`SimpleStorage: "${simpleStorage.target}"`);
  console.log(`JobEscrow: "${jobEscrow.target}"`);
  console.log(`Wallet: "${wallet.target}"`);
  console.log(`DisputeResolution: "${disputeResolution.target}"`);
  console.log("================================");
  console.log("\n💡 Copy these addresses to src/wagmi.config.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

