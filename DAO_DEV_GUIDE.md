# DAO 开发文档

本项目的 DAO 治理系统基于 Solidity 0.8.24 与 OpenZeppelin Governor/Votes 体系，实现了代币投票、质押加权、时间锁与金库管理。

## 1. 合约架构

核心合约与关系如下：

```
GovernanceToken  ->  StakingVault  ->  DAOGovernor  ->  DAOTimelockController  ->  Treasury
   (投票代币)        (质押加权)         (治理核心)           (执行延迟)              (资金库)
```

- **GovernanceToken**：ERC20 + ERC20Votes，可委托投票。
- **StakingVault**：质押代币获得投票倍率（不同锁定期）。
- **DAOGovernor**：提案、投票、队列与执行入口。
- **DAOTimelockController**：治理提案的执行延迟与角色控制。
- **Treasury**：仅允许通过时间锁执行资金管理。

## 2. 部署流程

已提供脚本：`scripts/hardhat/deploy-governance.js`，支持一键部署并写入地址。

### 2.1 环境准备

在项目根目录创建 `.env`：

```
PRIVATE_KEY=你的私钥(不带0x)
SEPOLIA_RPC_URL=你的RPC地址
```

### 2.2 部署命令

```
npx hardhat run scripts/hardhat/deploy-governance.js --network sepolia
```

执行后会生成部署记录：

```
deployments/governance-sepolia.json
```

## 3. 参数配置

部署脚本中默认配置（可按需调整）：

- `token.name` / `token.symbol`
- `token.initialSupply`（初始发行量）
- `governance.votingDelay`（投票延迟）
- `governance.votingPeriod`（投票周期，区块数）
- `governance.proposalThreshold`（提案门槛）
- `governance.quorumPercentage`（法定人数比例）
- `timelock.minDelay`（时间锁延迟）

修改位置：`scripts/hardhat/deploy-governance.js`

## 4. 权限与角色

时间锁使用角色控制：

- `PROPOSER_ROLE`：可创建队列的角色，授予 `DAOGovernor`
- `EXECUTOR_ROLE`：可执行队列的角色，默认授予 `address(0)`（任何人）
- `DEFAULT_ADMIN_ROLE`：部署者初始拥有，可在治理稳定后撤销

生产建议：
- 部署完成后将 `DEFAULT_ADMIN_ROLE` 从部署者撤销
- 将 `GovernanceToken` 的管理权转移给时间锁或治理合约

## 5. 安全注意事项

- **治理攻击**：确认 `proposalThreshold`、`quorum` 与 `votingPeriod` 合理。
- **时间锁风险**：`minDelay` 应给社区反应时间。
- **权限最小化**：部署者权限应尽快移交治理。
- **投票快照**：投票权基于快照，提案创建后转移代币不会影响当次投票。
- **质押锁定**：质押期间代币无法转出，防止短期操控。

## 6. 测试与运维

### 6.1 单元测试

在本地网络运行测试：

```
npx hardhat test
```

建议覆盖的用例：
- 投票延迟/周期生效
- 质押倍率计算
- 达到法定人数与阈值
- 时间锁执行与取消
- Treasury 仅能通过治理执行

### 6.2 上线运维

- 验证合约（Etherscan）
- 记录部署地址与配置参数
- 监控提案执行事件
- 定期检查角色是否按预期移交

## 7. 前端/脚本交互示例

以下示例以 `ethers` 为例，展示关键流程。

### 7.1 委托投票权

```javascript
await governanceToken.delegate(userAddress);
```

### 7.2 质押以提升投票权

```javascript
const amount = ethers.parseEther("1000");
const lockPeriod = 2; // MEDIUM(90天)

await governanceToken.approve(stakingVaultAddress, amount);
await stakingVault.stake(amount, lockPeriod);
```

### 7.3 创建提案

```javascript
const targets = [treasuryAddress];
const values = [0];
const calldatas = [
  treasury.interface.encodeFunctionData("withdrawEth", [
    recipient,
    ethers.parseEther("1")
  ])
];
const description = "提案：从金库转出 1 ETH";

const proposalId = await governor.propose(
  targets,
  values,
  calldatas,
  description
);
```

### 7.4 投票与执行

```javascript
await governor.castVote(proposalId, 1); // 0=反对, 1=赞成, 2=弃权

const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));
await governor.queue(targets, values, calldatas, descriptionHash);
await governor.execute(targets, values, calldatas, descriptionHash);
```

## 8. 常见问题

- **提案创建失败**：检查 `proposalThreshold` 或投票权是否满足。
- **投票无效**：确认已 `delegate`，且处于投票阶段。
- **执行失败**：确认已过 `timelock` 延迟，且提案状态为 `Queued`。

