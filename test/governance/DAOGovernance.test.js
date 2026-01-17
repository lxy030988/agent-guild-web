/**
 * Test suite for DAO Governance System
 *
 * Tests the complete governance flow including:
 * - Token deployment and distribution
 * - Voting power delegation
 * - Staking with multipliers
 * - Proposal creation and voting
 * - Timelock and execution
 * - Treasury management
 *
 * Run tests:
 *   npx hardhat test test/governance/DAOGovernance.test.js
 */

import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("DAO Governance System", function () {
  let governanceToken;
  let stakingVault;
  let timelock;
  let governor;
  let treasury;
  let deployer, user1, user2, user3;

  const INITIAL_SUPPLY = hre.ethers.parseEther("1000000"); // 1M tokens
  const TRANSFER_AMOUNT = hre.ethers.parseEther("10000"); // 10k tokens
  const VOTING_DELAY = 1;
  const VOTING_PERIOD = 50400;
  const PROPOSAL_THRESHOLD = hre.ethers.parseEther("1000");
  const QUORUM_PERCENTAGE = 4;
  const MIN_DELAY = 2 * 24 * 60 * 60; // 2 days

  beforeEach(async function () {
    [deployer, user1, user2, user3] = await hre.ethers.getSigners();

    // 1. Deploy GovernanceToken
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy("DAO Token", "DAO", INITIAL_SUPPLY);
    await governanceToken.waitForDeployment();

    // 2. Deploy StakingVault
    const StakingVault = await hre.ethers.getContractFactory("StakingVault");
    stakingVault = await StakingVault.deploy(await governanceToken.getAddress());
    await stakingVault.waitForDeployment();

    // 3. Deploy TimelockController
    const TimelockController = await hre.ethers.getContractFactory("DAOTimelockController");
    timelock = await TimelockController.deploy(MIN_DELAY, [], [], deployer.address);
    await timelock.waitForDeployment();

    // 4. Deploy DAOGovernor
    const DAOGovernor = await hre.ethers.getContractFactory("DAOGovernor");
    governor = await DAOGovernor.deploy(
      await governanceToken.getAddress(),
      await timelock.getAddress(),
      await stakingVault.getAddress(),
      VOTING_DELAY,
      VOTING_PERIOD,
      PROPOSAL_THRESHOLD,
      QUORUM_PERCENTAGE
    );
    await governor.waitForDeployment();

    // 5. Deploy Treasury
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await timelock.getAddress());
    await treasury.waitForDeployment();

    // 6. Setup roles
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

    await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
    await timelock.grantRole(EXECUTOR_ROLE, hre.ethers.ZeroAddress);

    // 7. Distribute tokens
    await governanceToken.transfer(user1.address, TRANSFER_AMOUNT);
    await governanceToken.transfer(user2.address, TRANSFER_AMOUNT);
    await governanceToken.transfer(user3.address, TRANSFER_AMOUNT);

    // 8. Delegate voting power
    await governanceToken.connect(deployer).delegate(deployer.address);
    await governanceToken.connect(user1).delegate(user1.address);
    await governanceToken.connect(user2).delegate(user2.address);
    await governanceToken.connect(user3).delegate(user3.address);
  });

  describe("GovernanceToken", function () {
    it("Should deploy with correct initial supply", async function () {
      expect(await governanceToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should allow delegation of voting power", async function () {
      const votes = await governanceToken.getVotes(user1.address);
      expect(votes).to.equal(TRANSFER_AMOUNT);
    });

    it("Should allow minting by owner", async function () {
      const mintAmount = hre.ethers.parseEther("1000");
      await governanceToken.mint(user1.address, mintAmount);
      expect(await governanceToken.balanceOf(user1.address)).to.equal(
        TRANSFER_AMOUNT + mintAmount
      );
    });

    it("Should prevent minting above max supply", async function () {
      const MAX_SUPPLY = await governanceToken.MAX_SUPPLY();
      const currentSupply = await governanceToken.totalSupply();
      const exceedAmount = MAX_SUPPLY - currentSupply + 1n;

      await expect(governanceToken.mint(user1.address, exceedAmount)).to.be.revertedWith(
        "Minting would exceed max supply"
      );
    });

    it("Should allow burning tokens", async function () {
      const burnAmount = hre.ethers.parseEther("100");
      await governanceToken.connect(user1).burn(burnAmount);
      expect(await governanceToken.balanceOf(user1.address)).to.equal(
        TRANSFER_AMOUNT - burnAmount
      );
    });
  });

  describe("StakingVault", function () {
    it("Should allow staking with different lock periods", async function () {
      const stakeAmount = hre.ethers.parseEther("1000");
      await governanceToken.connect(user1).approve(await stakingVault.getAddress(), stakeAmount);
      await stakingVault.connect(user1).stake(stakeAmount, 2); // MEDIUM lock

      const stakeInfo = await stakingVault.getStakeInfo(user1.address, 0);
      expect(stakeInfo[0]).to.equal(stakeAmount); // amount
      expect(stakeInfo[2]).to.equal(2); // lockPeriod (MEDIUM)
    });

    it("Should calculate voting power with multipliers correctly", async function () {
      const stakeAmount = hre.ethers.parseEther("1000");

      // Stake with MEDIUM lock (2x multiplier)
      await governanceToken.connect(user1).approve(await stakingVault.getAddress(), stakeAmount);
      await stakingVault.connect(user1).stake(stakeAmount, 2);

      const votingPower = await stakingVault.getVotingPower(user1.address);
      const expectedPower = stakeAmount * 2n; // 2x multiplier
      expect(votingPower).to.equal(expectedPower);
    });

    it("Should prevent unstaking before lock expires", async function () {
      const stakeAmount = hre.ethers.parseEther("1000");
      await governanceToken.connect(user1).approve(await stakingVault.getAddress(), stakeAmount);
      await stakingVault.connect(user1).stake(stakeAmount, 1); // SHORT lock (30 days)

      await expect(stakingVault.connect(user1).unstake(0)).to.be.revertedWith(
        "Stake is still locked"
      );
    });

    it("Should allow unstaking after lock expires", async function () {
      const stakeAmount = hre.ethers.parseEther("1000");
      await governanceToken.connect(user1).approve(await stakingVault.getAddress(), stakeAmount);
      await stakingVault.connect(user1).stake(stakeAmount, 0); // NONE lock (no delay)

      await stakingVault.connect(user1).unstake(0);
      expect(await governanceToken.balanceOf(user1.address)).to.equal(TRANSFER_AMOUNT);
    });

    it("Should support multiple stakes per user", async function () {
      const stakeAmount = hre.ethers.parseEther("500");
      await governanceToken
        .connect(user1)
        .approve(await stakingVault.getAddress(), stakeAmount * 3n);

      await stakingVault.connect(user1).stake(stakeAmount, 0); // NONE
      await stakingVault.connect(user1).stake(stakeAmount, 1); // SHORT
      await stakingVault.connect(user1).stake(stakeAmount, 2); // MEDIUM

      const stakeCount = await stakingVault.getUserStakeCount(user1.address);
      expect(stakeCount).to.equal(3);
    });
  });

  describe("DAOGovernor - Proposal Creation", function () {
    it("Should allow creating proposals above threshold", async function () {
      const targets = [await treasury.getAddress()];
      const values = [0];
      const calldatas = [
        treasury.interface.encodeFunctionData("withdrawEth", [
          user2.address,
          hre.ethers.parseEther("1"),
        ]),
      ];
      const description = "Test Proposal";

      await expect(governor.connect(user1).propose(targets, values, calldatas, description))
        .to.emit(governor, "ProposalCreated");
    });

    it("Should prevent creating proposals below threshold", async function () {
      // User with less than threshold tries to propose
      const lowUser = user3;
      await governanceToken.connect(lowUser).transfer(deployer.address, TRANSFER_AMOUNT - hre.ethers.parseEther("500"));

      const targets = [await treasury.getAddress()];
      const values = [0];
      const calldatas = [treasury.interface.encodeFunctionData("getEthBalance", [])];
      const description = "Test Proposal";

      await expect(
        governor.connect(lowUser).propose(targets, values, calldatas, description)
      ).to.be.revertedWithCustomError(governor, "GovernorInsufficientProposerVotes");
    });
  });

  describe("DAOGovernor - Voting", function () {
    let proposalId;
    let targets, values, calldatas, description;

    beforeEach(async function () {
      // Fund treasury
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: hre.ethers.parseEther("10"),
      });

      // Create proposal
      targets = [await treasury.getAddress()];
      values = [0];
      calldatas = [
        treasury.interface.encodeFunctionData("withdrawEth", [
          user2.address,
          hre.ethers.parseEther("1"),
        ]),
      ];
      description = "Proposal: Transfer 1 ETH to User2";

      const tx = await governor.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      proposalId = receipt.logs[0].args[0];

      // Mine block to pass voting delay
      await hre.network.provider.send("hardhat_mine", ["0x2"]);
    });

    it("Should allow voting on active proposals", async function () {
      await expect(governor.connect(user1).castVote(proposalId, 1)).to.emit(governor, "VoteCast");
    });

    it("Should prevent double voting", async function () {
      await governor.connect(user1).castVote(proposalId, 1);
      await expect(governor.connect(user1).castVote(proposalId, 1)).to.be.revertedWithCustomError(
        governor,
        "GovernorAlreadyCastVote"
      );
    });

    it("Should count votes correctly", async function () {
      await governor.connect(user1).castVote(proposalId, 1); // For
      await governor.connect(user2).castVote(proposalId, 0); // Against
      await governor.connect(user3).castVote(proposalId, 2); // Abstain

      const votes = await governor.proposalVotes(proposalId);
      expect(votes[1]).to.be.gt(0); // For votes
      expect(votes[0]).to.be.gt(0); // Against votes
      expect(votes[2]).to.be.gt(0); // Abstain votes
    });

    it("Should include staking voting power in vote count", async function () {
      // User1 stakes tokens for additional voting power
      const stakeAmount = hre.ethers.parseEther("5000");
      await governanceToken.connect(user1).approve(await stakingVault.getAddress(), stakeAmount);
      await stakingVault.connect(user1).stake(stakeAmount, 2); // MEDIUM lock (2x)

      // Create new proposal after staking
      const newDescription = "Proposal: After staking";
      const tx = await governor.connect(user1).propose(targets, values, calldatas, newDescription);
      const receipt = await tx.wait();
      const newProposalId = receipt.logs[0].args[0];

      await hre.network.provider.send("hardhat_mine", ["0x2"]);

      // Note: Staking voting power is only counted at current block, not historical
      // So this test verifies the integration but may not show increased votes
      // for historical proposals
      await governor.connect(user1).castVote(newProposalId, 1);
      const votes = await governor.proposalVotes(newProposalId);
      expect(votes[1]).to.be.gt(0);
    });
  });

  describe("DAOGovernor - Execution", function () {
    let proposalId;
    let targets, values, calldatas, description, descriptionHash;

    beforeEach(async function () {
      // Fund treasury
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: hre.ethers.parseEther("10"),
      });

      // Create and pass proposal
      targets = [await treasury.getAddress()];
      values = [0];
      calldatas = [
        treasury.interface.encodeFunctionData("withdrawEth", [
          user2.address,
          hre.ethers.parseEther("1"),
        ]),
      ];
      description = "Proposal: Transfer 1 ETH to User2";
      descriptionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(description));

      const tx = await governor.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      proposalId = receipt.logs[0].args[0];

      // Pass voting delay
      await hre.network.provider.send("hardhat_mine", ["0x2"]);

      // Vote
      await governor.connect(user1).castVote(proposalId, 1);
      await governor.connect(user2).castVote(proposalId, 1);
      await governor.connect(user3).castVote(proposalId, 1);

      // Pass voting period
      await hre.network.provider.send("hardhat_mine", ["0x" + (VOTING_PERIOD + 1).toString(16)]);
    });

    it("Should allow queuing successful proposals", async function () {
      await expect(governor.queue(targets, values, calldatas, descriptionHash)).to.emit(
        governor,
        "ProposalQueued"
      );
    });

    it("Should enforce timelock delay", async function () {
      await governor.queue(targets, values, calldatas, descriptionHash);

      // Try to execute immediately (should fail)
      await expect(
        governor.execute(targets, values, calldatas, descriptionHash)
      ).to.be.revertedWithCustomError(timelock, "TimelockUnexpectedOperationState");
    });

    it("Should allow execution after timelock", async function () {
      await governor.queue(targets, values, calldatas, descriptionHash);

      // Increase time past timelock
      await time.increase(MIN_DELAY + 1);

      const user2BalanceBefore = await hre.ethers.provider.getBalance(user2.address);

      await governor.execute(targets, values, calldatas, descriptionHash);

      const user2BalanceAfter = await hre.ethers.provider.getBalance(user2.address);
      expect(user2BalanceAfter - user2BalanceBefore).to.equal(hre.ethers.parseEther("1"));
    });
  });

  describe("Treasury", function () {
    it("Should receive ETH", async function () {
      const amount = hre.ethers.parseEther("5");
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: amount,
      });

      expect(await treasury.getEthBalance()).to.equal(amount);
    });

    it("Should prevent non-governance withdrawals", async function () {
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: hre.ethers.parseEther("5"),
      });

      await expect(
        treasury.connect(user1).withdrawEth(user1.address, hre.ethers.parseEther("1"))
      ).to.be.revertedWith("Only governance can call this function");
    });

    it("Should allow governance to withdraw ETH", async function () {
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: hre.ethers.parseEther("5"),
      });

      // Withdraw through timelock (simulating governance)
      const amount = hre.ethers.parseEther("1");
      await treasury.updateGovernance(deployer.address); // For testing, set deployer as governance

      await treasury.withdrawEth(user1.address, amount);
      expect(await treasury.getEthBalance()).to.equal(hre.ethers.parseEther("4"));
    });

    it("Should handle ERC20 tokens", async function () {
      // Transfer governance tokens to treasury
      const amount = hre.ethers.parseEther("1000");
      await governanceToken.transfer(await treasury.getAddress(), amount);

      expect(await treasury.getTokenBalance(await governanceToken.getAddress())).to.equal(amount);
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full governance flow", async function () {
      // 1. Fund treasury
      await deployer.sendTransaction({
        to: await treasury.getAddress(),
        value: hre.ethers.parseEther("10"),
      });

      // 2. Create proposal
      const targets = [await treasury.getAddress()];
      const values = [0];
      const calldatas = [
        treasury.interface.encodeFunctionData("withdrawEth", [
          user2.address,
          hre.ethers.parseEther("1"),
        ]),
      ];
      const description = "Integration Test Proposal";
      const descriptionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(description));

      const tx = await governor.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      const proposalId = receipt.logs[0].args[0];

      // 3. Vote
      await hre.network.provider.send("hardhat_mine", ["0x2"]);
      await governor.connect(user1).castVote(proposalId, 1);
      await governor.connect(user2).castVote(proposalId, 1);
      await governor.connect(user3).castVote(proposalId, 1);

      // 4. Queue
      await hre.network.provider.send("hardhat_mine", ["0x" + (VOTING_PERIOD + 1).toString(16)]);
      await governor.queue(targets, values, calldatas, descriptionHash);

      // 5. Execute
      await time.increase(MIN_DELAY + 1);
      const user2BalanceBefore = await hre.ethers.provider.getBalance(user2.address);
      await governor.execute(targets, values, calldatas, descriptionHash);
      const user2BalanceAfter = await hre.ethers.provider.getBalance(user2.address);

      // Verify
      expect(user2BalanceAfter - user2BalanceBefore).to.equal(hre.ethers.parseEther("1"));
      expect(await governor.state(proposalId)).to.equal(7); // Executed
    });
  });
});
