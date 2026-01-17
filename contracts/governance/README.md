# DAO Governance System

A comprehensive DAO governance system built with Solidity 0.8.24 and OpenZeppelin contracts.

## Overview

This governance system consists of five core contracts that work together to provide a secure, flexible, and decentralized governance mechanism:

1. **GovernanceToken** - ERC20 token with voting capabilities
2. **StakingVault** - Staking contract with lock periods and voting multipliers
3. **DAOTimelockController** - Timelock for governance actions
4. **DAOGovernor** - Main governance contract
5. **Treasury** - DAO treasury for managing funds

## Architecture

```
┌─────────────────┐
│ GovernanceToken │ ◄─── ERC20 with voting power
└────────┬────────┘
         │
         ├──────► Delegation ──────┐
         │                         │
         └──────► Staking ──────┐  │
                                 │  │
┌──────────────┐                │  │
│ StakingVault │ ◄──────────────┘  │
└──────────────┘                   │
         │                         │
         └──► Voting Power ────────┤
                                   │
                          ┌────────▼────────┐
                          │   DAOGovernor   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  TimeLock       │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Treasury     │
                          └─────────────────┘
```

## Contracts

### 1. GovernanceToken.sol

ERC20 token with voting capabilities based on OpenZeppelin's ERC20Votes.

**Features:**
- Snapshot-based voting power tracking
- Delegation functionality (delegate votes to others)
- Historical voting power queries (checkpoints)
- Mint/burn capabilities (owner only)
- Maximum supply cap (100 million tokens)
- EIP-2612 permit support for gasless approvals

**Key Functions:**
```solidity
// Delegate voting power
function delegate(address delegatee)

// Get current voting power
function getVotes(address account) returns (uint256)

// Get historical voting power
function getPastVotes(address account, uint256 blockNumber) returns (uint256)

// Mint new tokens (owner only)
function mint(address to, uint256 amount)

// Burn tokens
function burn(uint256 amount)
```

### 2. StakingVault.sol

Allows users to stake governance tokens with different lock periods to earn voting power multipliers.

**Lock Periods & Multipliers:**
- **NONE** (0 days): 1x multiplier
- **SHORT** (30 days): 1.5x multiplier
- **MEDIUM** (90 days): 2x multiplier
- **LONG** (180 days): 3x multiplier

**Features:**
- Multiple stakes per user
- Automatic voting power calculation with multipliers
- Lock period enforcement
- Unstaking after lock expires
- Track total staked amount

**Key Functions:**
```solidity
// Stake tokens with lock period
function stake(uint256 amount, LockPeriod lockPeriod)

// Unstake after lock expires
function unstake(uint256 stakeId)

// Get total voting power for user
function getVotingPower(address user) returns (uint256)

// Get stake information
function getStakeInfo(address user, uint256 stakeId)
    returns (amount, startTime, lockPeriod, withdrawn, unlockTime, votingPower)

// Check if stake is unlocked
function isUnlocked(address user, uint256 stakeId) returns (bool)
```

### 3. DAOTimelockController.sol

Enforces a delay on governance actions to give stakeholders time to review and react.

**Features:**
- Configurable minimum delay (e.g., 2 days)
- Role-based access control
- Queue and execute proposals
- Cancel malicious proposals

**Roles:**
- **PROPOSER_ROLE**: Can propose actions (granted to DAOGovernor)
- **EXECUTOR_ROLE**: Can execute after timelock (anyone by default)
- **ADMIN_ROLE**: Can manage roles

### 4. DAOGovernor.sol

Main governance contract built on OpenZeppelin Governor.

**Features:**
- Proposal creation with multi-call support
- Voting (For, Against, Abstain)
- Quorum requirements (percentage of total supply)
- Voting delay and period
- Integration with StakingVault for combined voting power
- Timelock integration for execution

**Configuration:**
- **Voting Delay**: 1 block (customizable)
- **Voting Period**: 50,400 blocks (~1 week with 12s blocks)
- **Proposal Threshold**: 1,000 tokens (customizable)
- **Quorum**: 4% of total supply (customizable)

**Key Functions:**
```solidity
// Create proposal
function propose(
    address[] targets,
    uint256[] values,
    bytes[] calldatas,
    string description
) returns (uint256 proposalId)

// Cast vote
function castVote(uint256 proposalId, uint8 support)

// Queue proposal (after voting succeeds)
function queue(
    address[] targets,
    uint256[] values,
    bytes[] calldatas,
    bytes32 descriptionHash
)

// Execute proposal (after timelock)
function execute(
    address[] targets,
    uint256[] values,
    bytes[] calldatas,
    bytes32 descriptionHash
)

// Get voting power (includes staked tokens)
function getVotes(address account, uint256 blockNumber) returns (uint256)
```

**Voting Power Calculation:**
The governor combines voting power from two sources:
1. Delegated token voting power (from GovernanceToken)
2. Staked token voting power with multipliers (from StakingVault)

### 5. Treasury.sol

Secure treasury for holding and managing DAO funds.

**Features:**
- Hold ETH and ERC20 tokens
- Only executable by governance (through timelock)
- Batch execution support
- Track asset balances
- Emergency recovery functions

**Key Functions:**
```solidity
// Withdraw ETH (governance only)
function withdrawEth(address payable to, uint256 amount)

// Withdraw ERC20 tokens (governance only)
function withdrawTokens(address token, address to, uint256 amount)

// Execute arbitrary call (governance only)
function execute(address target, uint256 value, bytes data)

// Batch execute (governance only)
function executeBatch(
    address[] targets,
    uint256[] values,
    bytes[] calldatas
)

// View balances
function getEthBalance() returns (uint256)
function getTokenBalance(address token) returns (uint256)
```

## Deployment

### Prerequisites

```bash
npm install --save-dev hardhat
npm install @openzeppelin/contracts
npm install @nomicfoundation/hardhat-toolbox
```

### Deploy All Contracts

```bash
# Local network
npx hardhat node
npx hardhat run scripts/hardhat/deploy-governance.js --network localhost

# Sepolia testnet
npx hardhat run scripts/hardhat/deploy-governance.js --network sepolia
```

The deployment script will:
1. Deploy all contracts in correct order
2. Configure timelock roles
3. Setup initial voting power
4. Save deployment addresses to `./deployments/governance-{network}.json`

## Usage Guide

### For Token Holders

#### 1. Delegate Voting Power

Before you can vote, you must delegate your voting power (even to yourself):

```javascript
// Delegate to yourself
await governanceToken.delegate(myAddress);

// Or delegate to someone else
await governanceToken.delegate(delegateAddress);
```

#### 2. Stake Tokens for Multipliers

Increase your voting power by staking with lock periods:

```javascript
// Stake 1000 tokens with 90-day lock (2x multiplier)
const amount = ethers.parseEther("1000");
const lockPeriod = 2; // MEDIUM = 90 days

await governanceToken.approve(stakingVaultAddress, amount);
await stakingVault.stake(amount, lockPeriod);
```

#### 3. Check Your Voting Power

```javascript
// From delegated tokens
const delegatedVotes = await governanceToken.getVotes(myAddress);

// From staked tokens
const stakedVotes = await stakingVault.getVotingPower(myAddress);

// Total voting power
const totalVotes = delegatedVotes + stakedVotes;
```

### For Proposal Creators

#### 1. Create a Proposal

```javascript
// Example: Transfer 100 ETH from treasury
const targets = [treasuryAddress];
const values = [0];
const calldatas = [
  treasury.interface.encodeFunctionData("withdrawEth", [
    recipientAddress,
    ethers.parseEther("100")
  ])
];
const description = "Proposal #1: Fund marketing campaign with 100 ETH";

const proposalId = await governor.propose(
  targets,
  values,
  calldatas,
  description
);
```

#### 2. Wait for Voting Delay

After creation, wait for the voting delay period (1 block by default).

#### 3. Vote on Proposal

```javascript
// Vote options: 0 = Against, 1 = For, 2 = Abstain
await governor.castVote(proposalId, 1); // Vote For
```

#### 4. Queue Proposal (if passed)

After voting period ends and proposal passes:

```javascript
const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));

await governor.queue(
  targets,
  values,
  calldatas,
  descriptionHash
);
```

#### 5. Execute Proposal (after timelock)

After timelock delay (2 days by default):

```javascript
await governor.execute(
  targets,
  values,
  calldatas,
  descriptionHash
);
```

### Proposal States

Proposals progress through these states:
1. **Pending** - Waiting for voting delay
2. **Active** - Voting is open
3. **Succeeded** - Voting passed (met quorum and majority)
4. **Queued** - Waiting for timelock
5. **Executed** - Proposal executed
6. **Defeated** - Voting failed
7. **Canceled** - Proposal was canceled

## Security Considerations

### Access Control

- **GovernanceToken**: Minting restricted to owner
- **StakingVault**: No admin functions (trustless)
- **Treasury**: All fund movements require governance approval
- **DAOGovernor**: Proposal creation requires minimum token threshold
- **TimelockController**: Role-based execution

### Reentrancy Protection

All fund transfer functions use OpenZeppelin's ReentrancyGuard.

### Voting Power Manipulation

- Voting power is snapshot-based (cannot be manipulated after proposal creation)
- Staked tokens are locked and cannot be moved during lock period
- Delegation changes don't affect active proposals

### Timelock Protection

- All governance actions have a 2-day delay (configurable)
- Gives community time to react to malicious proposals
- Allows users to exit if they disagree with proposal

## Testing

### Example Test Cases

```javascript
describe("DAO Governance", function() {
  it("Should allow token holders to create proposals", async function() {
    // Test proposal creation
  });

  it("Should enforce voting delay", async function() {
    // Test voting delay enforcement
  });

  it("Should calculate voting power correctly", async function() {
    // Test delegation + staking voting power
  });

  it("Should enforce quorum requirements", async function() {
    // Test quorum calculation
  });

  it("Should enforce timelock on execution", async function() {
    // Test timelock delay
  });

  it("Should allow treasury withdrawals through governance", async function() {
    // Test treasury integration
  });
});
```

## Upgrading & Maintenance

### Updating Governance Parameters

Parameters like voting delay, voting period, quorum, etc. can be updated through governance proposals:

```javascript
// Example: Update quorum to 5%
const targets = [governorAddress];
const values = [0];
const calldatas = [
  governor.interface.encodeFunctionData("updateQuorumNumerator", [5])
];
const description = "Update quorum to 5%";

await governor.propose(targets, values, calldatas, description);
```

### Transferring Ownership

For full decentralization, revoke admin roles:

```javascript
// Revoke deployer's admin role on timelock
await timelock.revokeRole(DEFAULT_ADMIN_ROLE, deployerAddress);

// Transfer token ownership to governance
await governanceToken.transferOwnership(timelockAddress);
```

## Gas Optimization Tips

1. **Batch Operations**: Use `executeBatch()` for multiple actions
2. **Delegation**: Delegate once, not before each proposal
3. **Staking**: Stake larger amounts less frequently
4. **Voting**: Cast votes during off-peak hours

## Common Issues & Solutions

### Issue: "Governor: proposal not successful"
**Solution**: Proposal didn't meet quorum or didn't get majority votes.

### Issue: "TimelockController: operation is not ready"
**Solution**: Wait for timelock delay to pass before executing.

### Issue: "Governor: vote not currently active"
**Solution**: Proposal is not in Active state. Check proposal state.

### Issue: "Stake is still locked"
**Solution**: Wait for lock period to expire before unstaking.

## Resources

- [OpenZeppelin Governor Documentation](https://docs.openzeppelin.com/contracts/4.x/governance)
- [OpenZeppelin Votes Documentation](https://docs.openzeppelin.com/contracts/4.x/api/governance#votes)
- [Compound Governance Overview](https://compound.finance/docs/governance)

## License

MIT
