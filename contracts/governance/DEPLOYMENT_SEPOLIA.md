# Sepolia 部署记录（DAO Governance）

本记录基于本次部署输出整理。

## 部署信息

- 网络: Sepolia (chainId: 11155111)
- 部署者: 0xF1c303eB8B90028C265040520731B924697d595b
- 编译器: Solidity 0.8.24 (evmVersion: cancun, optimizer: enabled, runs: 200, viaIR: true)

## 合约地址

- GovernanceToken: 0xc1a210a2D8b730C74358e49f3062e88AF797Fd29
- StakingVault: 0xb22D2387C3aDed0dd6fF0Dc88a594a785aB45274
- DAOTimelockController: 0xfc1C75129b1766ecf6418A1237c240594075902a
- DAOGovernor: 0x1E66221df8871A14d769E00F7699DFa0352675fb
- Treasury: 0x0016DC536CF3A5963B166A38C44d0C278fd0173c

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

- 部署过程中已完成合约部署与角色授予。
- 部署日志在 “Setting up initial voting power...” 步骤处超时中断，如需可手动执行 `GovernanceToken.delegate(deployer)` 进行自委托。

