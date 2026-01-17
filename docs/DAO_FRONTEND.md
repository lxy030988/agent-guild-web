# DAO 争议治理模块 - 前端实现技术文档

## 📌 概述

本文档说明 Agent Guild 前端项目中 DAO 争议治理模块的实现方式，包括页面结构、合约交互、后端 API 同步与核心工作流。

**版本**: v1.0  
**技术栈**: React + TypeScript + Shadcn/UI + Sonner + Wagmi  
**合约**: DisputeResolution.sol  

---

## 🏗️ 项目结构

```
src/
├── pages/
│   ├── DAOPage.tsx               # 争议列表与统计
│   └── DisputeDetailPage.tsx     # 争议详情与投票
├── components/dao/
│   ├── CreateDisputeDialog.tsx   # 发起争议弹窗
│   ├── DisputeCard.tsx           # 争议卡片
│   ├── DisputeStats.tsx          # 统计卡片
│   └── VoteButton.tsx            # 投票按钮
├── hooks/
│   └── useDisputeContract.ts     # 合约交互封装
└── utils/
    └── disputeApi.ts             # DAO API 封装
```

---

## 📄 页面详解

### 1. DAOPage - 争议列表页

**功能**:
- 展示争议统计数据
- 支持按状态筛选与关键字搜索
- 进入争议详情页
- 发起争议（弹窗）

**核心逻辑**:
```typescript
const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">("ALL")

const fetchData = useCallback(async () => {
  const [disputeResult, statsData] = await Promise.all([
    disputeApi.listDisputes(
      statusFilter !== "ALL" ? { status: statusFilter } : undefined
    ),
    disputeApi.getStatistics(),
  ])
  setDisputes(disputeResult.data)
  setStats(statsData)
}, [statusFilter])
```

---

### 2. DisputeDetailPage - 争议详情页

**功能**:
- 展示争议详情、证据、投票截止时间
- 参与投票
- 投票截止后触发结案

**投票逻辑**:
```typescript
const handleVote = async (choice: VoteChoice) => {
  const { txHash } = await voteOnChain(BigInt(dispute.chainDisputeId), choiceIndex)
  await waitForTransactionReceipt(config, { hash: txHash })
  await disputeApi.submitVote(dispute.id, { choice, tokenWeight: "1" })
}
```

**结案逻辑**:
```typescript
const handleResolve = async () => {
  const { txHash } = await resolveDisputeOnChain(BigInt(dispute.chainDisputeId))
  await waitForTransactionReceipt(config, { hash: txHash })
  await disputeApi.resolveDispute(dispute.id)
}
```

---

## 🔗 合约交互

### useDisputeContract

**位置**: `src/hooks/useDisputeContract.ts`  
**职责**: 封装 DisputeResolution 合约调用

```typescript
const { createDisputeOnChain, voteOnChain, resolveDisputeOnChain } =
  useDisputeContract()
```

**解析事件**:
```typescript
const chainDisputeId = parseDisputeCreatedEvent(receipt)
```

---

## 🔌 API 封装

**位置**: `src/utils/disputeApi.ts`

```typescript
export const disputeApi = {
  listDisputes(params?: { status?: DisputeStatus }),
  getDisputeById(id: number),
  createDispute(data: CreateDisputeDto),
  submitVote(id: number, data: SubmitVoteDto),
  resolveDispute(id: number),
  getStatistics(),
}
```

---

## 🧩 数据结构

### Dispute
```typescript
interface Dispute {
  id: number
  jobId: number
  reason: string
  status: DisputeStatus
  chainDisputeId?: string
  votingEndsAt?: string
  approveVotes: number
  rejectVotes: number
  abstainVotes: number
}
```

### DisputeStatus
```typescript
enum DisputeStatus {
  PENDING = "PENDING",
  VOTING = "VOTING",
  RESOLVED = "RESOLVED",
  EXPIRED = "EXPIRED",
}
```

### VoteChoice
```typescript
enum VoteChoice {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  ABSTAIN = "ABSTAIN",
}
```

---

## 🔄 完整工作流

### 1. 发起争议

1. 前端调用 `createDisputeOnChain`
2. 等待交易确认
3. 解析 `DisputeCreated` 事件
4. 读取链上 `votingEndsAt`
5. 调用 `disputeApi.createDispute` 同步后端

### 2. 参与投票

1. 调用 `voteOnChain`
2. 等待交易确认
3. 调用 `disputeApi.submitVote` 同步后端

### 3. 结案执行

1. 投票期结束后调用 `resolveDisputeOnChain`
2. 等待交易确认
3. 调用 `disputeApi.resolveDispute` 更新后端状态

---

## ✅ 开发规范

- 所有链上操作必须先等待交易确认再同步后端  
- 投票与结案必须校验 `chainDisputeId`  
- 使用 `toast` 提示用户状态  
- 表单输入至少 20 字以避免后端校验失败  

---

## 📚 相关文档

- [Job 前端文档](./JOB_FRONTEND.md)
- [Agent 前端文档](./AGENT_FRONTEND.md)
