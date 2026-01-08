# Job 区块链集成补充文档

## 🔗 区块链集成（v1.1）

### 概述

Job 模块已完全集成 JobEscrow 智能合约，实现资金托管和自动支付功能。

**核心特性**：
- ✅ 创建任务时自动托管 ETH 到智能合约
- ✅ Agent 分配和任务完成通过链上交易确认
- ✅ 验收通过后自动支付给 Agent (扣除 5% 平台费)
- ✅ 支持取消任务和超时退款

### 智能合约函数

**文件**: [src/hooks/useJobContract.ts](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/hooks/useJobContract.ts)

```typescript
const {
  createJobOnChain,          // 创建任务并托管资金
  assignAgentOnChain,        // 分配 Agent 到任务
  completeJobOnChain,        // 完成任务并支付
  cancelJobOnChain,          // 取消任务并退款
  refundExpiredJobOnChain,   // 超时任务退款
} = useJobContract()
```

### 创建任务流程

**文件**: [JobCreatePage.tsx](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobCreatePage.tsx)

```typescript
const handleSubmit = async () => {
  try {
    // 1. 调用智能合约创建任务
    const { txHash } = await createJobOnChain({
      budget: parseEther(formData.budget),
      deadline: BigInt(Math.floor(new Date(formData.deadline).getTime() / 1000)),
    })
    
    // 2. 等待交易确认
    const receipt = await waitForTransactionReceipt(config, {
      hash: txHash,
      timeout: 60_000,
    })
    
    // 3. 从交易日志中获取 chainJobId
    const log = receipt.logs.find(log => 
      log.topics[0] === keccak256(toHex("JobCreated(uint256,address,uint256,uint256)"))
    )
    const chainJobId = hexToBigInt(log.topics[1])
    
    // 4. 调用后端 API 保存任务
    await jobApi.createJob({
      ...formData,
      chainJobId: chainJobId.toString(),
      chainTxHash: txHash,
      chainDeadline: formData.deadline,
    })
    
    toast.success("任务创建成功！")
  } catch (error) {
    toast.error("创建失败")
  }
}
```

### Agent 分配流程

根据**匹配模式**不同，分配流程也不同：

#### 手动选择模式 (MANUAL)

**文件**: [JobDetailPage.tsx](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx) - [handleAssignAgent](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx#200-219)

```typescript
const handleAssignAgent = async (agentId: number) => {
  try {
    // 1. 查找选中的 Agent
    const selectedAgent = recommendations.find(r => r.agent.id === agentId)
    const agentOwnerAddress = selectedAgent.agent.owner.walletAddress
    
    // 2. 调用智能合约分配 Agent
    const { txHash } = await assignAgentOnChain(
      BigInt(job.chainJobId),
      agentOwnerAddress
    )
    
    // 3. 等待交易确认
    await waitForTransactionReceipt(config, { hash: txHash })
    toast.success("链上分配成功！")
    
    // 4. 更新后端状态
    await jobApi.updateJob(job.id, {
      assignedAgentId: agentId,
      status: JobStatus.MATCHED,
    })
    
    toast.success("Agent 已成功分配")
  } catch (error) {
    toast.error(error.message || "分配失败")
  }
}
```

#### 申请制模式 (APPLICATION)

**文件**: [JobDetailPage.tsx](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx) - [handleAcceptApplication](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx#360-418)

```typescript
const handleAcceptApplication = async (applicationId: number) => {
  try {
    // 1. 找到对应的申请
    const application = applications.find(app => app.id === applicationId)
    const agentOwnerAddress = application.agent.owner.walletAddress
    
    // 2. 调用智能合约分配 Agent
    const { txHash } = await assignAgentOnChain(
      BigInt(job.chainJobId),
      agentOwnerAddress
    )
    
    // 3. 等待交易确认
    await waitForTransactionReceipt(config, { hash: txHash })
    toast.success("链上分配成功！")
    
    // 4. 更新后端（接受申请）
    await jobApplicationApi.updateApplicationStatus(applicationId, "ACCEPTED")
    
    toast.success("已接受申请")
  } catch (error) {
    toast.error(error.message || "操作失败")
  }
}
```

#### 智能匹配模式 (SMART)

**说明**：智能匹配模式下，后端自动选择 Agent，但**不立即调用合约**。Agent 分配和支付操作都在 Job Owner 验收时一起执行。

### 任务验收流程

**文件**: [JobDetailPage.tsx](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx) - [handleApprove](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/pages/JobDetailPage.tsx#184-199)

根据**匹配模式**有不同的链上操作：

#### SMART 模式：两次链上交易

```typescript
const handleApprove = async (rating: number, feedback: string) => {
  try {
    if (job.matchingMode === MatchingMode.SMART && job.chainJobId) {
      // 1. 先分配 Agent（第一次交易）
      toast.info("正在分配 Agent...")
      const { txHash: assignTxHash } = await assignAgentOnChain(
        BigInt(job.chainJobId),
        job.assignedAgent.owner.walletAddress
      )
      await waitForTransactionReceipt(config, { hash: assignTxHash })
      toast.success("Agent 已分配！")
      
      // 2. 完成任务并支付（第二次交易）
      toast.info("正在支付...")
      const { txHash: completeTxHash } = await completeJobOnChain(
        BigInt(job.chainJobId)
      )
      await waitForTransactionReceipt(config, { hash: completeTxHash })
      toast.success("资金已支付！")
    }
    
    // 3. 更新后端状态
    await jobApi.approveJob(job.id, rating, feedback)
    toast.success("验收通过")
  } catch (error) {
    toast.error(error.message || "验收失败")
  }
}
```

#### MANUAL/APPLICATION 模式：一次链上交易

```typescript
else if (job.chainJobId) {
  // Agent 已在之前分配过，直接完成并支付
  toast.info("正在支付...")
  const { txHash } = await completeJobOnChain(BigInt(job.chainJobId))
  await waitForTransactionReceipt(config, { hash: txHash })
  toast.success("资金已支付！")
}
```

### 资金流转

```
创建任务:
  Job Owner → Smart Contract [托管 100 ETH]

验收通过:
  Smart Contract → Agent Owner [95 ETH] (95%)
  Smart Contract → Platform Fee [5 ETH]  (5%)
```

### 状态同步

**链上状态** vs **数据库状态**：

| 操作 | 链上状态 | 数据库状态 | 说明 |
|------|---------|-----------|------|
| 创建任务 | Open | OPEN | 资金已托管 |
| 后端自动匹配 (SMART) | Open | MATCHED | 仅数据库记录 |
| 手动分配 Agent | Matched | MATCHED | 链上链下同步 |
| 验收通过 (SMART) | Matched → Completed | COMPLETED | 两次交易 |
| 验收通过 (其他) | Completed | COMPLETED | 一次交易 |

### 配置文件

**合约地址配置**: [src/wagmi.config.ts](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/wagmi.config.ts)

```typescript
export const CONTRACT_ADDRESSES = {
  31337: {  // Hardhat 本地网络
    JobEscrow: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  },
  // ... 其他网络
}
```

### 常见问题

**Q: 为什么 SMART 模式需要两次交易？**  
A: 因为后端自动匹配只是数据库操作，链上还没有分配。验收时需要先 [assignAgent](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/utils/job-api.ts#332-342)，再 [completeJob](file:///Users/lxy/Desktop/lxy030988/agent-guild-web/src/hooks/useJobContract.ts#63-77)。

**Q: 如果链上交易失败怎么办？**  
A: 前端会捕获错误并显示给用户，后端状态不会更新，用户可以重试。

**Q: chainJobId 为什么是 String 类型？**  
A: 因为 Solidity 的 `uint256` 超过 JavaScript `Number` 的安全范围，使用 String 避免精度丢失。

### 数据类型说明

由于区块链集成，Job 接口添加了新字段：

```typescript
interface Job {
  // ... 原有字段
  
  // 区块链字段
  chainJobId: string | null      // 链上任务 ID（BigInt 字符串）
  chainTxHash: string | null     // 创建交易哈希
  chainDeadline: string | null   // 链上截止时间（Unix 时间戳字符串）
}
```

**重要提示**：
- ✅ 所有 BigInt 值都转换为 String 传输
- ✅ 前端使用 `BigInt()` 转换后调用合约
- ✅ 后端数据库也使用 String 类型存储
