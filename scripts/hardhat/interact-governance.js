/**
 * Example interaction script for DAO Governance
 *
 * This script demonstrates common governance operations:
 * - Delegating voting power
 * - Staking tokens
 * - Creating proposals
 * - Voting on proposals
 * - Executing proposals
 *
 * Usage:
 *   npx hardhat run scripts/hardhat/interact-governance.js --network localhost
 */

import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("DAO Governance Interaction Script\n");

  // Load deployment addresses
  const deploymentFile = `./deployments/governance-${hre.network.name}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const addresses = deployment.contracts;

  console.log("Using deployment:", hre.network.name);
  console.log("Contracts:", addresses, "\n");

  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log("Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address, "\n");

  // Get contract instances
  const governanceToken = await hre.ethers.getContractAt(
    "GovernanceToken",
    addresses.GovernanceToken
  );
  const stakingVault = await hre.ethers.getContractAt(
    "StakingVault",
    addresses.StakingVault
  );
  const governor = await hre.ethers.getContractAt(
    "DAOGovernor",
    addresses.DAOGovernor
  );
  const treasury = await hre.ethers.getContractAt(
    "Treasury",
    addresses.Treasury
  );

  // =================================================================
  // STEP 1: Distribute tokens to users
  // =================================================================
  console.log("STEP 1: Distributing tokens to users");
  console.log("=".repeat(60));

  const transferAmount = hre.ethers.parseEther("10000"); // 10k tokens each

  let tx = await governanceToken.transfer(user1.address, transferAmount);
  await tx.wait();
  console.log("✓ Transferred", hre.ethers.formatEther(transferAmount), "tokens to User1");

  tx = await governanceToken.transfer(user2.address, transferAmount);
  await tx.wait();
  console.log("✓ Transferred", hre.ethers.formatEther(transferAmount), "tokens to User2\n");

  // =================================================================
  // STEP 2: Delegate voting power
  // =================================================================
  console.log("STEP 2: Delegating voting power");
  console.log("=".repeat(60));

  // Users delegate to themselves
  tx = await governanceToken.connect(user1).delegate(user1.address);
  await tx.wait();
  console.log("✓ User1 delegated voting power to self");

  tx = await governanceToken.connect(user2).delegate(user2.address);
  await tx.wait();
  console.log("✓ User2 delegated voting power to self");

  // Check voting power
  const user1Votes = await governanceToken.getVotes(user1.address);
  const user2Votes = await governanceToken.getVotes(user2.address);
  console.log("  User1 voting power:", hre.ethers.formatEther(user1Votes), "votes");
  console.log("  User2 voting power:", hre.ethers.formatEther(user2Votes), "votes\n");

  // =================================================================
  // STEP 3: Stake tokens for voting multiplier
  // =================================================================
  console.log("STEP 3: Staking tokens for voting multiplier");
  console.log("=".repeat(60));

  const stakeAmount = hre.ethers.parseEther("5000"); // Stake 5k tokens
  const lockPeriod = 2; // MEDIUM = 90 days, 2x multiplier

  // User1 stakes tokens
  tx = await governanceToken.connect(user1).approve(addresses.StakingVault, stakeAmount);
  await tx.wait();
  console.log("✓ User1 approved staking vault");

  tx = await stakingVault.connect(user1).stake(stakeAmount, lockPeriod);
  await tx.wait();
  console.log("✓ User1 staked", hre.ethers.formatEther(stakeAmount), "tokens with 90-day lock");

  // Check staking voting power
  const user1StakingPower = await stakingVault.getVotingPower(user1.address);
  console.log("  User1 staking voting power:", hre.ethers.formatEther(user1StakingPower), "votes");
  console.log("  (5000 tokens × 2x multiplier = 10000 votes)\n");

  // =================================================================
  // STEP 4: Fund the treasury
  // =================================================================
  console.log("STEP 4: Funding the treasury");
  console.log("=".repeat(60));

  const fundAmount = hre.ethers.parseEther("10"); // 10 ETH
  tx = await deployer.sendTransaction({
    to: addresses.Treasury,
    value: fundAmount,
  });
  await tx.wait();
  console.log("✓ Sent", hre.ethers.formatEther(fundAmount), "ETH to treasury");

  const treasuryBalance = await treasury.getEthBalance();
  console.log("  Treasury balance:", hre.ethers.formatEther(treasuryBalance), "ETH\n");

  // =================================================================
  // STEP 5: Create a proposal
  // =================================================================
  console.log("STEP 5: Creating a proposal");
  console.log("=".repeat(60));

  // Proposal: Transfer 1 ETH from treasury to User2
  const withdrawAmount = hre.ethers.parseEther("1");
  const targets = [addresses.Treasury];
  const values = [0];
  const calldatas = [
    treasury.interface.encodeFunctionData("withdrawEth", [
      user2.address,
      withdrawAmount,
    ]),
  ];
  const description = "Proposal #1: Transfer 1 ETH to User2 for community development";

  tx = await governor.connect(user1).propose(targets, values, calldatas, description);
  const receipt = await tx.wait();

  // Get proposal ID from event
  const proposalId = receipt.logs
    .filter((log) => log.topics[0] === governor.interface.getEvent("ProposalCreated").topicHash)[0]
    .args[0];

  console.log("✓ Proposal created");
  console.log("  Proposal ID:", proposalId.toString());
  console.log("  Description:", description);

  // Check proposal state
  const state = await governor.state(proposalId);
  console.log("  State:", getProposalStateName(state), "\n");

  // =================================================================
  // STEP 6: Wait for voting delay and vote
  // =================================================================
  console.log("STEP 6: Voting on proposal");
  console.log("=".repeat(60));

  // Mine blocks to pass voting delay
  console.log("⏳ Mining blocks to pass voting delay...");
  await hre.network.provider.send("hardhat_mine", ["0x2"]); // Mine 2 blocks

  // Check if proposal is active
  const stateAfterDelay = await governor.state(proposalId);
  console.log("  State after delay:", getProposalStateName(stateAfterDelay));

  // Vote on proposal
  // 0 = Against, 1 = For, 2 = Abstain
  tx = await governor.connect(user1).castVote(proposalId, 1); // Vote For
  await tx.wait();
  console.log("✓ User1 voted FOR");

  tx = await governor.connect(user2).castVote(proposalId, 1); // Vote For
  await tx.wait();
  console.log("✓ User2 voted FOR");

  // Get vote counts
  const proposalVotes = await governor.proposalVotes(proposalId);
  console.log("  Votes Against:", hre.ethers.formatEther(proposalVotes[0]));
  console.log("  Votes For:", hre.ethers.formatEther(proposalVotes[1]));
  console.log("  Votes Abstain:", hre.ethers.formatEther(proposalVotes[2]), "\n");

  // =================================================================
  // STEP 7: Wait for voting period and queue proposal
  // =================================================================
  console.log("STEP 7: Queuing proposal");
  console.log("=".repeat(60));

  // Mine blocks to end voting period
  console.log("⏳ Mining blocks to end voting period...");
  const votingPeriod = await governor.votingPeriod();
  await hre.network.provider.send("hardhat_mine", [
    "0x" + (Number(votingPeriod) + 1).toString(16),
  ]);

  const stateAfterVoting = await governor.state(proposalId);
  console.log("  State after voting:", getProposalStateName(stateAfterVoting));

  if (stateAfterVoting === 4n) {
    // Succeeded
    const descriptionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(description));
    tx = await governor.queue(targets, values, calldatas, descriptionHash);
    await tx.wait();
    console.log("✓ Proposal queued in timelock\n");
  } else {
    console.log("❌ Proposal did not succeed\n");
    process.exit(1);
  }

  // =================================================================
  // STEP 8: Wait for timelock and execute
  // =================================================================
  console.log("STEP 8: Executing proposal");
  console.log("=".repeat(60));

  // Increase time to pass timelock delay
  console.log("⏳ Increasing time to pass timelock delay...");
  const minDelay = deployment.config.timelock.minDelay;
  await hre.network.provider.send("evm_increaseTime", [minDelay + 1]);
  await hre.network.provider.send("evm_mine");

  const descriptionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(description));

  // Check User2 balance before execution
  const user2BalanceBefore = await hre.ethers.provider.getBalance(user2.address);
  console.log("  User2 balance before:", hre.ethers.formatEther(user2BalanceBefore), "ETH");

  // Execute proposal
  tx = await governor.execute(targets, values, calldatas, descriptionHash);
  await tx.wait();
  console.log("✓ Proposal executed");

  // Check balances after execution
  const user2BalanceAfter = await hre.ethers.provider.getBalance(user2.address);
  const treasuryBalanceAfter = await treasury.getEthBalance();
  console.log("  User2 balance after:", hre.ethers.formatEther(user2BalanceAfter), "ETH");
  console.log("  Treasury balance after:", hre.ethers.formatEther(treasuryBalanceAfter), "ETH");

  const stateAfterExecution = await governor.state(proposalId);
  console.log("  Final state:", getProposalStateName(stateAfterExecution), "\n");

  // =================================================================
  // Summary
  // =================================================================
  console.log("=".repeat(60));
  console.log("GOVERNANCE INTERACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log("✓ Tokens distributed");
  console.log("✓ Voting power delegated");
  console.log("✓ Tokens staked for multiplier");
  console.log("✓ Proposal created, voted on, and executed");
  console.log("✓ 1 ETH successfully transferred from treasury to User2");
}

function getProposalStateName(state) {
  const states = [
    "Pending",
    "Active",
    "Canceled",
    "Defeated",
    "Succeeded",
    "Queued",
    "Expired",
    "Executed",
  ];
  return states[Number(state)] || "Unknown";
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
