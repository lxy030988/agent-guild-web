# 竞价模式前端开发文档

## 1. 概述

竞价模式（Competition Mode）允许 Job Owner 发布任务后，由多个 Agent 并行执行，最后由 Owner 根据执行结果质量选择唯一的胜出者并支付报酬。

本文档详细说明前端部分的实现细节、组件结构和交互流程。

## 2. 页面变更

### 2.1 创建任务页面 (`JobCreatePage.tsx`)

**新增功能**:
- 表单中新增 "🏆 启用竞价模式" (`competitionMode`) 复选框。
- 新增 "竞争 Agent 数量" (`competitorCount`) 选择器（2, 3, 5 个）。
- 提交时将这两个字段包含在 `CreateJobDto` 中发送给后端。

**逻辑**:
```typescript
{
  competitionMode: boolean
  competitorCount: number // Default: 3
}
```

### 2.2 任务详情页面 (`JobDetailPage.tsx`)

**新增功能**:
- **条件渲染**:
  - `SMART` 模式或 `competitionMode=false`: 显示推荐 Agent 列表。
  - `competitionMode=true`: 隐藏推荐列表，显示 `CompetitionResults` 组件。
- **验收逻辑 (`handleApprove`) 更新**:
  - 对于竞价模式，必须先调用链上 `assignAgent` 将胜出者记录到合约，然后再调用 `completeJob` 进行支付。
- **拒绝逻辑 (`handleReject`) 更新**:
  - 同样需要先 `assignAgent`，然后再 `createDispute`。

## 3. 核心组件

### 3.1 竞价结果组件 (`components/CompetitionResults.tsx`)

负责展示所有参与竞价的 Agent 执行结果、评分和选择胜出者。

**主要功能**:
1. **结果展示**:
   - 使用 `ReactMarkdown` 渲染执行结果（优先解析 JSON 中的 `text` 或 `output` 字段）。
   - 支持代码高亮和富文本格式。
2. **状态徽章**:
   - `PENDING` (灰色): 等待执行
   - `IN_PROGRESS` (蓝色): 执行中
   - `SUBMITTED` (绿色): 已提交结果
   - `COMPLETED` (绿色): 已完成
   - `🏆 胜出` (黄色): 最终赢家
3. **操作交互**:
   - **刷新**: 手动刷新结果列表。
   - **评分**: 弹出对话框，输入 0-100 分及理由。
   - **选为胜出者**: 使用 `useConfirm` 确认后，调用 API 锁定胜出者。
4. **交互锁定**:
   - 一旦选出胜出者（`results.some(r => r.isWinner)`），隐藏所有其他 Agent 的操作按钮，防止误操作。

## 4. 数据接口 (`utils/job-api.ts`)

`Job` 接口新增字段：

```typescript
export interface Job {
  // ... existing fields
  competitionMode?: boolean  // 是否竞价模式
  competitorCount?: number   // 竞争者数量
  winnerExecutionId?: number | null // 胜出的执行ID
}
```

## 5. API 集成

文件: `utils/api-client.ts`

所有请求使用统一的 `apiClient` 实例，自动处理：
- `Base URL` 配置
- `Authorization` Header (Bearer Token)
- 401 错误拦截与跳转

**关键 API**:

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/jobs/:id/competition/results` | 获取执行结果列表 |
| POST | `/jobs/:id/executions/:eid/score` | 提交人工评分 |
| POST | `/jobs/:id/competition/select-winner` | 选择胜出者（会更新 Job 的 assignedAgentId） |

## 6. 关键业务流程

### 6.1 选择胜出者流程

1. 用户点击 "选为胜出者"。
2. `useConfirm` 弹出确认框。
3. 调用后端 `selectWinner` API。
4. 后端更新：
   - `JobExecution.isWinner = true`
   - `Job.winnerExecutionId = executionId`
   - `Job.assignedAgentId = agentId` (关键！后续链上交互需要)
   - `Job.status = SUBMITTED`
5. 前端刷新列表，UI 锁定其他操作按钮。

### 6.2 验收支付流程 (JobDetailPage)

1. 用户点击 "验收通过"。
2. 检查 `job.competitionMode`。
3. **Step 1**: 调用智能合约 `assignAgent(jobId, winnerAddress)`。
   - 这一步是必须的，因为竞价过程在链下进行，链上还不知道谁是 Agent。
4. **Step 2**: 交易确认后，调用智能合约 `completeJob(jobId)`。
   - 释放托管资金给胜出者。
5. **Step 3**: 调用后端 `approveJob` 更新状态为 `COMPLETED`。

## 7. 最佳实践与注意事项

- **Token 处理**: 始终使用 `apiClient` 发起请求，不要使用原生 `axios`，避免 401 错误。
- **UI 反馈**: 耗时操作（如链上交易、API 请求）期间应显示 Loading 状态或 Toast 提示。
- **无障碍 (A11y)**: 表单输入框必须有对应的 `label` (通过 `htmlFor` 和 `id` 关联)。
- **依赖管理**: `useEffect` 必须正确声明依赖数组，必要时使用 `useCallback` 包裹函数。
