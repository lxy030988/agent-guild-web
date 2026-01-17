/**
 * Deployment script for DAO Governance System
 *
 * This script deploys all governance contracts in the correct order:
 * 1. GovernanceToken - ERC20 token with voting capabilities
 * 2. StakingVault - Staking contract with lock periods and voting multipliers
 * 3. TimelockController - Timelock for governance actions
 * 4. DAOGovernor - Main governance contract
 * 5. Treasury - DAO treasury for managing funds
 *
 * Usage:
 *   npx hardhat run scripts/hardhat/deploy-governance.js --network localhost
 *   npx hardhat run scripts/hardhat/deploy-governance.js --network sepolia
 */

import hre from "hardhat";

async function main() {
  console.log("Starting DAO Governance deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Configuration parameters
  const config = {
    token: {
      name: "DAO Governance Token",
      symbol: "DGOV",
      initialSupply: hre.ethers.parseEther("1000000"), // 1 million tokens
    },
    governance: {
      votingDelay: 1, // 1 block delay before voting starts
      votingPeriod: 50400, // ~1 week in blocks (assuming 12s blocks)
      proposalThreshold: hre.ethers.parseEther("1000"), // 1000 tokens needed to propose
      quorumPercentage: 4, // 4% of total supply needed for quorum
    },
    timelock: {
      minDelay: 2 * 24 * 60 * 60, // 2 days in seconds
    },
  };

  // 1. Deploy GovernanceToken
  console.log("1. Deploying GovernanceToken...");
  const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(
    config.token.name,
    config.token.symbol,
    config.token.initialSupply
  );
  await governanceToken.waitForDeployment();
  const tokenAddress = await governanceToken.getAddress();
  console.log("✓ GovernanceToken deployed to:", tokenAddress);
  console.log("  Initial supply:", hre.ethers.formatEther(config.token.initialSupply), "tokens\n");

  // 2. Deploy StakingVault
  console.log("2. Deploying StakingVault...");
  const StakingVault = await hre.ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(tokenAddress);
  await stakingVault.waitForDeployment();
  const stakingVaultAddress = await stakingVault.getAddress();
  console.log("✓ StakingVault deployed to:", stakingVaultAddress, "\n");

  // 3. Deploy TimelockController
  console.log("3. Deploying TimelockController...");
  const TimelockController = await hre.ethers.getContractFactory("DAOTimelockController");
  const timelock = await TimelockController.deploy(
    config.timelock.minDelay,
    [], // proposers - will be set to governor after deployment
    [], // executors - empty array means anyone can execute after timelock
    deployer.address // admin - deployer initially, should be renounced after setup
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("✓ TimelockController deployed to:", timelockAddress);
  console.log("  Min delay:", config.timelock.minDelay / (24 * 60 * 60), "days\n");

  // 4. Deploy DAOGovernor
  console.log("4. Deploying DAOGovernor...");
  const DAOGovernor = await hre.ethers.getContractFactory("DAOGovernor");
  const governor = await DAOGovernor.deploy(
    tokenAddress,
    timelockAddress,
    stakingVaultAddress,
    config.governance.votingDelay,
    config.governance.votingPeriod,
    config.governance.proposalThreshold,
    config.governance.quorumPercentage
  );
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("✓ DAOGovernor deployed to:", governorAddress);
  console.log("  Voting delay:", config.governance.votingDelay, "blocks");
  console.log("  Voting period:", config.governance.votingPeriod, "blocks");
  console.log("  Proposal threshold:", hre.ethers.formatEther(config.governance.proposalThreshold), "tokens");
  console.log("  Quorum:", config.governance.quorumPercentage, "%\n");

  // 5. Deploy Treasury
  console.log("5. Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(timelockAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✓ Treasury deployed to:", treasuryAddress, "\n");

  // 6. Configure TimelockController roles
  console.log("6. Configuring TimelockController roles...");

  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();

  // Grant proposer role to governor
  let tx = await timelock.grantRole(PROPOSER_ROLE, governorAddress);
  await tx.wait();
  console.log("✓ Granted PROPOSER_ROLE to DAOGovernor");

  // Grant executor role to zero address (anyone can execute)
  tx = await timelock.grantRole(EXECUTOR_ROLE, hre.ethers.ZeroAddress);
  await tx.wait();
  console.log("✓ Granted EXECUTOR_ROLE to everyone");

  // Optional: Revoke deployer's admin role for full decentralization
  // Uncomment the following lines if you want to fully decentralize
  // tx = await timelock.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  // await tx.wait();
  // console.log("✓ Revoked DEFAULT_ADMIN_ROLE from deployer (fully decentralized)");

  console.log("⚠ Deployer still has DEFAULT_ADMIN_ROLE (revoke manually for full decentralization)\n");

  // 7. Delegate voting power to self (for testing)
  console.log("7. Setting up initial voting power...");
  tx = await governanceToken.delegate(deployer.address);
  await tx.wait();
  console.log("✓ Deployer delegated voting power to self\n");

  // Print deployment summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("GovernanceToken:     ", tokenAddress);
  console.log("StakingVault:        ", stakingVaultAddress);
  console.log("TimelockController:  ", timelockAddress);
  console.log("DAOGovernor:         ", governorAddress);
  console.log("Treasury:            ", treasuryAddress);
  console.log("=".repeat(60));

  // Print next steps
  console.log("\nNEXT STEPS:");
  console.log("1. Verify contracts on Etherscan (if on testnet/mainnet)");
  console.log("2. Distribute tokens to initial stakeholders");
  console.log("3. Users should delegate voting power (governanceToken.delegate())");
  console.log("4. Users can stake tokens in StakingVault for voting multipliers");
  console.log("5. Create first proposal through DAOGovernor");
  console.log("6. Optional: Revoke deployer admin role for full decentralization");

  // Save deployment addresses to file
  const fs = await import("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GovernanceToken: tokenAddress,
      StakingVault: stakingVaultAddress,
      TimelockController: timelockAddress,
      DAOGovernor: governorAddress,
      Treasury: treasuryAddress,
    },
    config,
  };

  const outputPath = `./deployments/governance-${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✓ Deployment info saved to:", outputPath);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
