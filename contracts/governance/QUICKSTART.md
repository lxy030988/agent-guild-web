# DAO Governance - Quick Start Guide

This guide will help you deploy and test the DAO governance system in 5 minutes.

## Prerequisites

Make sure you have OpenZeppelin contracts installed:

```bash
npm install @openzeppelin/contracts
```

## Step 1: Deploy the Contracts

### Local Network

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy governance contracts
npx hardhat run scripts/hardhat/deploy-governance.js --network localhost
```

The deployment will output all contract addresses. Save these for later use.

### Testnet (Sepolia)

```bash
# Make sure your .env file has SEPOLIA_RPC_URL and PRIVATE_KEY
npx hardhat run scripts/hardhat/deploy-governance.js --network sepolia
```

## Step 2: Test the System

Run the comprehensive test suite:

```bash
npx hardhat test test/governance/DAOGovernance.test.js
```

Expected output:
```
  DAO Governance System
    GovernanceToken
      ✓ Should deploy with correct initial supply
      ✓ Should allow delegation of voting power
      ✓ Should allow minting by owner
      ...

    Integration Tests
      ✓ Should complete full governance flow
```

## Step 3: Try the Interactive Demo

Run the interaction script to see the governance system in action:

```bash
npx hardhat run scripts/hardhat/interact-governance.js --network localhost
```

This will:
1. Distribute tokens to users
2. Delegate voting power
3. Stake tokens for multipliers
4. Create a proposal
5. Vote on the proposal
6. Queue and execute the proposal
7. Transfer 1 ETH from treasury

## Step 4: Manual Interaction

### Using Hardhat Console

```bash
npx hardhat console --network localhost
```

Then in the console:

```javascript
// Load deployment info
const fs = require('fs');
const deployment = JSON.parse(fs.readFileSync('./deployments/governance-localhost.json'));
const addresses = deployment.contracts;

// Get contract instances
const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
const token = GovernanceToken.attach(addresses.GovernanceToken);

const StakingVault = await ethers.getContractFactory("StakingVault");
const vault = StakingVault.attach(addresses.StakingVault);

const DAOGovernor = await ethers.getContractFactory("DAOGovernor");
const governor = DAOGovernor.attach(addresses.DAOGovernor);

const Treasury = await ethers.getContractFactory("Treasury");
const treasury = Treasury.attach(addresses.Treasury);

// Get signers
const [deployer, user1, user2] = await ethers.getSigners();

// Example: Transfer tokens
await token.transfer(user1.address, ethers.parseEther("1000"));

// Example: Delegate voting power
await token.connect(user1).delegate(user1.address);

// Example: Check voting power
const votes = await token.getVotes(user1.address);
console.log("User1 votes:", ethers.formatEther(votes));

// Example: Stake tokens
await token.connect(user1).approve(addresses.StakingVault, ethers.parseEther("500"));
await vault.connect(user1).stake(ethers.parseEther("500"), 2); // MEDIUM lock

// Example: Create proposal
const targets = [addresses.Treasury];
const values = [0];
const calldatas = [
  treasury.interface.encodeFunctionData("withdrawEth", [
    user2.address,
    ethers.parseEther("1")
  ])
];
const description = "Test Proposal";

await governor.connect(user1).propose(targets, values, calldatas, description);
```

## Common Tasks

### Distribute Tokens

```javascript
const token = await ethers.getContractAt("GovernanceToken", TOKEN_ADDRESS);
await token.transfer(recipientAddress, ethers.parseEther("1000"));
```

### Delegate Voting Power

```javascript
await token.delegate(yourAddress); // Delegate to yourself
// or
await token.delegate(delegateAddress); // Delegate to someone else
```

### Stake Tokens

```javascript
const vault = await ethers.getContractAt("StakingVault", VAULT_ADDRESS);
const amount = ethers.parseEther("1000");
const lockPeriod = 2; // 0=NONE, 1=SHORT, 2=MEDIUM, 3=LONG

await token.approve(VAULT_ADDRESS, amount);
await vault.stake(amount, lockPeriod);
```

### Create Proposal

```javascript
const governor = await ethers.getContractAt("DAOGovernor", GOVERNOR_ADDRESS);

const targets = [TARGET_ADDRESS];
const values = [0]; // ETH value to send
const calldatas = [ENCODED_FUNCTION_CALL];
const description = "Proposal description";

await governor.propose(targets, values, calldatas, description);
```

### Vote on Proposal

```javascript
const proposalId = PROPOSAL_ID;
const voteType = 1; // 0=Against, 1=For, 2=Abstain

await governor.castVote(proposalId, voteType);
```

### Queue Proposal

```javascript
const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));
await governor.queue(targets, values, calldatas, descriptionHash);
```

### Execute Proposal

```javascript
await governor.execute(targets, values, calldatas, descriptionHash);
```

## Verification Checklist

After deployment, verify:

- [ ] All 5 contracts deployed successfully
- [ ] Timelock has PROPOSER_ROLE for governor
- [ ] Timelock has EXECUTOR_ROLE for everyone (ZeroAddress)
- [ ] Treasury governance is set to timelock address
- [ ] Initial tokens distributed and delegated
- [ ] Test proposal can be created
- [ ] Voting works correctly
- [ ] Execution works after timelock

## Troubleshooting

### "Governor: proposal not successful"
- Check if proposal met quorum (4% of total supply voted)
- Check if proposal got majority "For" votes

### "TimelockController: operation is not ready"
- Wait for the timelock delay (2 days on mainnet, can be shorter on testnet)
- Use `time.increase()` in Hardhat tests to skip time

### "Governor: vote not currently active"
- Wait for voting delay to pass (1 block)
- Ensure proposal hasn't expired

### "Stake is still locked"
- Wait for lock period to expire
- Check unlock time with `getStakeInfo()`

### Compilation errors
- Make sure you have OpenZeppelin contracts installed
- Check Solidity version is 0.8.24 in hardhat.config.js

## Next Steps

1. **Customize Parameters**: Edit deployment script to change voting delay, period, quorum, etc.
2. **Add Custom Logic**: Extend contracts for your specific use case
3. **Deploy to Mainnet**: Update configuration and deploy to production
4. **Build Frontend**: Create a UI for users to interact with governance
5. **Integrate with Tools**: Connect to Tally, Snapshot, or other governance platforms

## Resources

- Full documentation: See [README.md](./README.md)
- OpenZeppelin Docs: https://docs.openzeppelin.com/contracts/4.x/governance
- Example proposals: See `interact-governance.js`
- Test examples: See `test/governance/DAOGovernance.test.js`

## Contract Addresses

After deployment, your contract addresses will be saved to:
```
./deployments/governance-{network}.json
```

Example structure:
```json
{
  "network": "localhost",
  "contracts": {
    "GovernanceToken": "0x...",
    "StakingVault": "0x...",
    "TimelockController": "0x...",
    "DAOGovernor": "0x...",
    "Treasury": "0x..."
  }
}
```

## Security Reminders

- [ ] Never commit private keys to Git
- [ ] Test thoroughly before mainnet deployment
- [ ] Consider security audit for production use
- [ ] Start with small amounts for testing
- [ ] Revoke deployer admin role after setup
- [ ] Use multisig for initial token ownership
- [ ] Monitor proposals closely in early days

---

**Need help?** Check the full [README.md](./README.md) for detailed documentation.
