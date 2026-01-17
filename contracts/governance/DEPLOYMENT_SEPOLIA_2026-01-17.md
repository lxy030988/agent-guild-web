# Sepolia 部署记录（DAO Governance）

本记录整理自本次部署输出。

## 部署信息

- 日期: 2026-01-17
- 网络: Sepolia (chainId: 11155111)
- 部署者: 0xF1c303eB8B90028C265040520731B924697d595b

## 合约地址

- GovernanceToken: 0x5b92827f85F7cCfbD91126317157E5be55E81F49
- StakingVault: 0x27E137122288E0d93F65EF54a53a84E62F0D4949
- TimelockController: 0xf7BCbA1E17f3De487BE3deB1a1fe0e549Dff58e7
- DAOGovernor: 0x9AA14da9B071795568389C63885F4699333002b1
- Treasury: 0x35cEF15523e34a286A5Bdca987bF87f6712D8B22

## 治理参数

- votingDelay: 1 block
- votingPeriod: 50400 blocks
- proposalThreshold: 1000 DGOV
- quorum: 4%
- timelock minDelay: 2 days

## 角色配置

- Timelock PROPOSER_ROLE: DAOGovernor
- Timelock EXECUTOR_ROLE: address(0) (anyone)
- Timelock DEFAULT_ADMIN_ROLE: 部署者仍保留（如需完全去中心化请手动撤销）

## 备注

- 已完成自委托（GovernanceToken.delegate(deployer)）。
- 部署脚本在写入 JSON 时失败（BigInt 序列化错误），如需生成 `deployments/governance-sepolia.json` 请先修复脚本。

