# Agent 模块 - 前端开发文档

## 📌 概述

本文档说明 Agent 模块在前端的页面、组件、数据结构与交互流程，覆盖代理人列表、详情、创建/编辑和相关的筛选、评价、服务与价格展示。

**版本**: v1.0  
**技术栈**: React 18 + TypeScript + React Query + React Router + Shadcn/UI + wagmi + react-hot-toast  
**后端 API**: NestJS (http://localhost:3000)

---

## 🧭 路由与页面

```text
/agents            AgentList      代理人列表页
/agents/:id        AgentDetail    代理人详情页
/agents/create     AgentForm      新建代理人
/agents/:id/edit   AgentForm      编辑代理人
```

路由定义位置：`src/routes/index.tsx`

---

## 🏗️ 模块结构

```
src/
├── pages/
│   ├── AgentList.tsx           # 代理人列表页
│   ├── AgentDetail.tsx         # 代理人详情页
│   └── AgentForm.tsx           # 代理人创建/编辑页
├── components/agent/
│   ├── AgentCard.tsx           # 卡片展示
│   ├── AgentGrid.tsx           # 列表网格
│   ├── AgentFilters.tsx        # 筛选组件
│   ├── AgentProfile.tsx        # 详情页顶部资料
│   ├── ServiceList.tsx         # 服务清单
│   ├── ReviewSection.tsx       # 评价列表
│   ├── AgentForm.tsx           # 表单主体
│   ├── ServiceEditor.tsx       # 服务编辑器
│   ├── AvailabilityPicker.tsx  # 可用时间配置
│   └── ImageUploader.tsx       # 图片上传
├── hooks/
│   ├── useAgents.ts            # 列表查询
│   ├── useAgent.ts             # 详情查询
│   ├── useAgentReviews.ts      # 评价查询
│   └── useAgentMutations.ts    # 创建/更新
├── types/
│   ├── agent.ts                # Agent 类型
│   ├── agentForm.ts            # 表单类型
│   └── review.ts               # 评价类型
└── utils/
    ├── agentApi.ts             # API 封装
    ├── agentQuery.ts           # 查询参数构建
    ├── agentFilters.ts         # URL 参数解析/合并
    └── agentForm.ts            # 表单转换/校验
```

---

## 📄 页面详解

### 1. AgentList - 代理人列表页

**位置**: `src/pages/AgentList.tsx`

**功能**:
- 查询代理人列表（分页、筛选、搜索）
- 通过 URLSearchParams 同步筛选条件
- 空态与错误态处理
- 入口按钮跳转至创建页

**筛选项**:
- 分类、位置、最低评分
- 价格区间（minPrice / maxPrice）
- 排序（评分/价格/评价/最新）

**数据流**:
1. `parseAgentListQuery` 从 URL 解析查询
2. `useAgents` 触发 `/agents` 请求
3. `mergeAgentListQuery` + `serializeAgentListQuery` 更新 URL

**关键逻辑**:
```typescript
const query = useMemo(
  () => parseAgentListQuery(searchParams, DEFAULT_LIMIT),
  [searchParams],
)

const { data, isLoading, isFetching } = useAgents(query)
```

---

### 2. AgentDetail - 代理人详情页

**位置**: `src/pages/AgentDetail.tsx`

**功能**:
- 获取代理人详情与评价列表
- 展示资料、服务、价格方案
- 业主可编辑资料
- 预约/私信操作占位（toast 提示）

**核心交互**:
- URL 参数校验：`id` 无效时返回 EmptyState
- 通过 `useAgent` + `useAgentReviews` 加载数据
- 选中默认服务（第一条服务）

---

### 3. AgentForm - 新建/编辑页

**位置**: `src/pages/AgentForm.tsx`

**功能**:
- 登录校验（未登录显示 Access Denied）
- wagmi 钱包连接提示（Connect Wallet）
- 编辑权限校验（仅 owner 可编辑）
- 表单提交创建/更新

**提交逻辑**:
```typescript
const handleSubmit = async (payload) => {
  if (isEditMode && agent) {
    const updated = await updateAgent(payload)
    navigate(`/agents/${updated.id}`)
    return
  }
  const created = await createAgent(payload)
  navigate(`/agents/${created.id}`)
}
```

---

## 🧩 组件与交互

### AgentCard / AgentGrid
- `AgentCard`：展示头像、分类、标签、评分、起步价格、状态
- `AgentGrid`：加载中展示 Skeleton

### AgentProfile
- 详情页顶部信息：评分、位置、响应时间、标签、完成任务数
- 可显示 Owner 标记

### ServiceList
- 服务清单 + 选择状态
- 显示时长、价格、简介

### ReviewSection
- 评价汇总（平均分 + 分布）
- 评价列表（支持代理人回复）

### AgentFilters
- 支持重置按钮（同步 URL）
- 排序字段：`rating | price | reviews | created`

---

## 📝 表单与校验

### AgentForm 字段
- 基础信息：title、description、category、subcategory
- 位置：city、country、isRemote
- Tags / Languages（逗号分隔）
- 服务清单（可拖拽排序）
- 套餐定价（多套餐）
- 可用时间（按周配置 + 时区）
- 图片上传（最多 4 张）
- 是否公开展示（isActive）

### 校验逻辑（`validateAgentForm`）
- title 必填
- description >= 20 字符
- category 必填
- 非 Remote 需填 city/country
- responseTime 必填
- services 至少 1 个，且 name/price/duration 校验
- pricing 至少 1 个，且 name/price 校验

### 数据转换
- `createEmptyAgentForm` 初始化默认结构
- `mapAgentToFormValues` 映射 Agent -> Form
- `buildAgentPayload` 生成 CreateAgentDTO

---

## 🔌 API 封装

**位置**: `src/utils/agentApi.ts`

```typescript
listAgents(query: AgentListQuery): Promise<AgentListResponse>
getAgent(id: number): Promise<Agent>
createAgent(payload: CreateAgentDTO): Promise<Agent>
updateAgent(id: number, payload: UpdateAgentDTO): Promise<Agent>
getAgentReviews(id: number, params): Promise<ReviewListResponse>
```

查询参数构建：`src/utils/agentQuery.ts`

---

## ⚙️ React Query 缓存策略

- `useAgents`：列表查询，`staleTime = 30s`，`keepPreviousData`
- `useAgent`：详情查询，`staleTime = 10min`
- `useAgentReviews`：评价查询，`staleTime = 5min`
- `useCreateAgent`：创建成功后刷新列表
- `useUpdateAgent`：更新后写入详情缓存并刷新列表

---

## 📊 关键数据类型

### Agent
```typescript
interface Agent {
  id: number
  userId: number
  title: string
  description: string
  category: string
  subcategory?: string
  location: Location
  services: Service[]
  pricing: Pricing[]
  availability: Availability
  rating: number
  reviewCount: number
  completedJobs: number
  responseTime: string
  languages: string[]
  tags: string[]
  isActive: boolean
}
```

### AgentListQuery
```typescript
interface AgentListQuery extends AgentFilters {
  page: number
  limit: number
}
```

### ReviewListResponse
```typescript
interface ReviewListResponse {
  data: Review[]
  total: number
  summary: { average: number; total: number; distribution: Record<number, number> }
}
```

---

## 🧪 错误与空态处理

- 详情页：id 无效 / agent 不存在 -> EmptyState
- 列表页：加载失败 -> EmptyState + refetch
- 列表页：无数据 -> EmptyState + Reset
- 表单校验失败 -> toast 提示

---

## ✅ 当前限制与占位

- 预约/私信功能仅提示 toast（未接入后端）
- 图片上传仅前端文件预览，未接入上传接口
- 服务预约/订单逻辑待接入 job 或 booking 模块

---

## 📚 相关文件参考

- `src/pages/AgentList.tsx`
- `src/pages/AgentDetail.tsx`
- `src/pages/AgentForm.tsx`
- `src/components/agent/AgentForm.tsx`
- `src/utils/agentApi.ts`
- `src/types/agent.ts`

