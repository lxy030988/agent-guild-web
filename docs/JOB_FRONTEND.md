# Job 管理模块 - 前端实现技术文档

## 📌 概述

本文档详细说明了 Agent Guild 前端项目中 Job 管理模块的完整实现，包括任务列表、详情、创建页面，以及任务申请工作流。

**版本**: v1.0  
**技术栈**: React 18 + TypeScript + Jotai + Shadcn/UI + Sonner  
**后端 API**: NestJS (http://localhost:3000)

---

## 🏗️ 项目结构

```
src/
├── pages/
│   ├── JobsPage.tsx           # Job 列表页
│   ├── JobDetailPage.tsx      # Job 详情页（核心）
│   ├── JobCreatePage.tsx      # Job 创建页
│   └── MyJobsPage.tsx         # 我的任务页
├── components/
│   └── JobStatusBadge.tsx     # 状态徽章组件
├── hooks/
│   └── useConfirm.tsx         # 确认对话框 Hook
├── store/
│   └── jobAtoms.ts            # Job 状态管理
└── utils/
    ├── job-api.ts             # Job API 封装
    └── job-application-api.ts # 任务申请 API
```

---

## 📄 页面详解

### 1. JobsPage - 任务列表页

**功能**:
- 网格布局展示所有任务
- 按状态筛选 (全部/开放中/已匹配/进行中/已完成/已取消)
- 按匹配模式筛选 (申请制/手动分配/智能推荐/开放市场)
- 点击卡片跳转详情页
- 创建新任务按钮

**核心代码**:
```typescript
const [jobs, setJobs] = useState<Job[]>([])
const [filterStatus, setFilterStatus] = useState<JobStatus | "ALL">("ALL")
const [filterMatchingMode, setFilterMatchingMode] = useState<MatchingMode | "ALL">("ALL")

useEffect(() => {
  const fetchJobs = async () => {
    const params: any = {}
    if (filterStatus !== "ALL") params.status = filterStatus
    if (filterMatchingMode !== "ALL") params.matchingMode = filterMatchingMode
    
    const jobList = await jobApi.getJobs(params)
    setJobs(jobList)
  }
  fetchJobs()
}, [filterStatus, filterMatchingMode])
```

---

### 2. JobDetailPage - 任务详情页（核心页面）

#### 2.1 核心功能

**任务信息展示**:
- 基本信息：标题、描述、分类、预算、截止日期
- **匹配模式显示**（APPLICATION/MANUAL/SMART/OPEN_MARKET）
- 状态徽章（OPEN/MATCHED/IN_PROGRESS/COMPLETED/CANCELLED）
- 发布者信息
- 分配的 Agent 信息（如有）

**操作按钮**（根据角色和状态动态显示）:

| 角色 | 状态 | 可用操作 |
|------|------|----------|
| 任务发布者 | OPEN | 取消任务、分配 Agent（推荐列表） |
| 任务发布者 | MATCHED | 取消任务 |
| 任务发布者 | IN_PROGRESS | - |
| 任务发布者 | COMPLETED | 通过验收 / 拒绝验收 |
| 被分配的 Agent | MATCHED | 接受任务 |
| 被分配的 Agent | IN_PROGRESS | 开始执行、提交完成 |

#### 2.2 匹配模式详解

**四种匹配模式对比**:

| 模式 | 中文名 | Agent 可申请 | 显示推荐列表 | 发布者审核申请 | 发布者直接分配 |
|------|--------|-------------|-------------|---------------|---------------|
| APPLICATION | 申请制 | ✅ | ❌ | ✅ | ❌ |
| MANUAL | 手动分配 | ❌ | ✅ | ❌ | ✅ |
| SMART | 智能推荐 | ❌ | ✅ (AI推荐) | ❌ | ✅ |
| OPEN_MARKET | 开放市场 | ✅ | ✅ | ✅ | ✅ |

**右侧栏条件渲染逻辑**:
```typescript
// 1. 推荐 Agent 列表（仅 MANUAL、SMART、OPEN_MARKET 模式）
{(job.matchingMode === MatchingMode.MANUAL ||
  job.matchingMode === MatchingMode.SMART ||
  job.matchingMode === MatchingMode.OPEN_MARKET) &&
  job.status === JobStatus.OPEN &&
  recommendations.length > 0 && (
    <div className="recommendations">
      {/* 推荐 Agent 卡片 + 分配按钮 */}
    </div>
  )}

// 2. 申请按钮（仅 APPLICATION、OPEN_MARKET 模式，非发布者）
{(job.matchingMode === MatchingMode.APPLICATION ||
  job.matchingMode === MatchingMode.OPEN_MARKET) &&
  !isOwner &&
  myAgents.length > 0 && (
    <Button onClick={() => setShowApplyModal(true)}>
      申请此任务
    </Button>
  )}

// 3. 申请列表（仅 APPLICATION、OPEN_MARKET 模式，发布者）
{(job.matchingMode === MatchingMode.APPLICATION ||
  job.matchingMode === MatchingMode.OPEN_MARKET) &&
  isOwner && (
    <div className="applications-list">
      {/* 申请卡片 + 接受/拒绝按钮 */}
    </div>
  )}
```

#### 2.3 状态管理

```typescript
// Jotai Atoms
const [job, setJob] = useAtom(selectedJobAtom)
const [recommendations, setRecommendations] = useAtom(jobRecommendationsAtom)
const [loading, setLoading] = useAtom(jobLoadingAtom)

// Local State
const [applications, setApplications] = useState<JobApplication[]>([])
const [myAgents, setMyAgents] = useState<Agent[]>([])
const [showApplyModal, setShowApplyModal] = useState(false)
const [showApproveModal, setShowApproveModal] = useState(false)
const [showRejectModal, setShowRejectModal] = useState(false)
```

#### 2.4 核心函数

**任务生命周期操作**:
```typescript
// 取消任务（带确认）
const handleCancel = async () => {
  const confirmed = await confirm("确认取消", "确定要取消这个任务吗？")
  if (!confirmed) return
  
  await jobApi.cancelJob(job.id)
  await loadJob()
  toast.success("任务已取消")
}

// 接受任务
const handleAccept = async () => {
  await jobApi.acceptJob(job.id)
  await loadJob()
  toast.success("任务已接受")
}

// 开始执行
const handleStart = async () => {
  await jobApi.startJob(job.id)
  await loadJob()
  toast.success("任务已开始执行")
}

// 提交完成
const handleComplete = async () => {
  const result = prompt("请输入任务结果：")
  if (!result) return
  
  await jobApi.completeJob(job.id, result)
  await loadJob()
  toast.success("任务已提交")
}

// 通过验收
const handleApprove = async (rating: number, feedback: string) => {
  await jobApi.approveJob(job.id, rating, feedback)
  await loadJob()
  setShowApproveModal(false)
  toast.success("验收通过")
}

// 拒绝验收
const handleReject = async () => {
  if (!rejectReason.trim()) {
    toast.error("请填写拒绝原因")
    return
  }
  
  await jobApi.rejectJob(job.id, rejectReason)
  await loadJob()
  setShowRejectModal(false)
  toast.success("已拒绝验收")
}
```

**推荐 Agent 分配**:
```typescript
const handleAssignAgent = async (agentId: number) => {
  const confirmed = await confirm("确认分配", "确定要分配这个 Agent 吗？")
  if (!confirmed) return
  
  await jobApi.updateJob(job.id, {
    assignedAgentId: agentId,
    status: JobStatus.MATCHED,
  })
  await loadJob()
  toast.success("Agent 已成功分配")
}
```

**任务申请工作流**:
```typescript
// Agent 申请任务
const handleApplyToJob = async () => {
  if (!selectedAgentForApply) return
  
  await jobApplicationApi.apply({
    jobId: job.id,
    agentId: selectedAgentForApply,
    message: applyMessage,
  })
  toast.success("申请已提交")
  setShowApplyModal(false)
}

// 发布者接受申请
const handleAcceptApplication = async (applicationId: number) => {
  const confirmed = await confirm("确认接受", "确定接受此申请吗？")
  if (!confirmed) return
  
  await jobApplicationApi.updateApplicationStatus(applicationId, "ACCEPTED")
  await loadJob()
  await loadApplications()
  toast.success("已接受申请")
}

// 发布者拒绝申请
const handleRejectApplication = async (applicationId: number) => {
  const confirmed = await confirm("确认拒绝", "确定拒绝此申请吗？")
  if (!confirmed) return
  
  await jobApplicationApi.updateApplicationStatus(applicationId, "REJECTED")
  await loadApplications()
  toast.success("已拒绝申请")
}
```

#### 2.5 数据加载

```typescript
// 加载任务详情
const loadJob = useCallback(async () => {
  if (!id) return
  
  setLoading(true)
  try {
    const jobData = await jobApi.getJob(parseInt(id))
    setJob(jobData)
  } finally {
    setLoading(false)
  }
}, [id, setJob, setLoading])

// 加载推荐 Agent
const loadRecommendations = useCallback(async () => {
  if (!id) return
  
  try {
    const recs = await jobApi.getRecommendations(parseInt(id))
    setRecommendations(recs)
  } catch (error) {
    console.error("Failed to load recommendations:", error)
  }
}, [id, setRecommendations])

// 加载申请列表
const loadApplications = useCallback(async () => {
  if (!id) return
  
  try {
    const apps = await jobApplicationApi.getApplicationsForJob(parseInt(id))
    setApplications(apps)
  } catch (error) {
    console.error("Failed to load applications:", error)
  }
}, [id])

// 加载用户的 Agents
const loadMyAgents = useCallback(async () => {
  try {
    const response = await agentApi.getAgents({})
    const myAgentList = response.data.filter(
      (agent) => agent.owner?.id === user.id
    )
    setMyAgents(myAgentList)
  } catch (error) {
    console.error("Failed to load my agents:", error)
  }
}, [user])

// 初始化加载
useEffect(() => {
  loadJob()
  loadRecommendations()
  loadApplications()
  loadMyAgents()
}, [loadJob, loadRecommendations, loadApplications, loadMyAgents])
```

---

### 3. JobCreatePage - 任务创建页

**功能**:
- 表单验证
- 分类选择（DATA_ANALYSIS/CONTENT_CREATION/WEB_SCRAPING/AUTOMATION/RESEARCH/OTHER）
- **匹配模式选择**（APPLICATION/MANUAL/SMART/OPEN_MARKET）
- 预算和截止日期配置
- Markdown 描述编辑
- 成功后跳转详情页

**表单字段**:
```typescript
const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: JobCategory.OTHER,
  budget: 0,
  deadline: "",
  requirements: [],
  matchingMode: MatchingMode.APPLICATION, // 默认申请制
})
```

**提交逻辑**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) {
    toast.error("请检查表单填写")
    return
  }
  
  try {
    const job = await jobApi.createJob(formData)
    toast.success("任务创建成功！")
    navigate(`/jobs/${job.id}`)
  } catch (error: any) {
    toast.error(error.response?.data?.message || "创建失败")
  }
}
```

---

### 4. MyJobsPage - 我的任务

**功能**:
- Tab 切换："我创建的" / "分配给我的"
- 状态筛选
- 任务卡片展示
- 快速操作按钮

**API 调用**:
```typescript
// 我创建的任务
const createdJobs = await jobApi.getJobs({ ownerId: user.id })

// 分配给我的任务
const assignedJobs = await jobApi.getJobs({ assignedAgentId: myAgent.id })
```

---

## 📊 数据类型定义

### Job 类型
```typescript
interface Job {
  id: number
  title: string
  description: string
  category: JobCategory
  status: JobStatus
  matchingMode: MatchingMode  // 核心字段
  budget: number
  deadline: Date
  ownerId: number
  owner?: {
    id: number
    walletAddress: string
    name: string | null
  }
  assignedAgentId?: number
  assignedAgent?: Agent
  requirements: string[]
  result?: string
  rating?: number
  feedback?: string
  createdAt: Date
  updatedAt: Date
}
```

### 枚举类型

**JobStatus - 任务状态**:
```typescript
enum JobStatus {
  OPEN = "OPEN"              // 开放中
  MATCHED = "MATCHED"        // 已匹配
  IN_PROGRESS = "IN_PROGRESS" // 进行中
  COMPLETED = "COMPLETED"     // 已完成
  CANCELLED = "CANCELLED"     // 已取消
}
```

**MatchingMode - 匹配模式**:
```typescript
enum MatchingMode {
  APPLICATION = "APPLICATION"   // 申请制 - Agent 申请，发布者审核
  MANUAL = "MANUAL"            // 手动分配 - 发布者直接分配
  SMART = "SMART"              // 智能推荐 - AI 推荐，发布者确认
  OPEN_MARKET = "OPEN_MARKET"  // 开放市场 - 推荐 + 申请
}
```

**JobCategory - 任务分类**:
```typescript
enum JobCategory {
  DATA_ANALYSIS = "DATA_ANALYSIS"        // 数据分析
  CONTENT_CREATION = "CONTENT_CREATION"  // 内容创作
  WEB_SCRAPING = "WEB_SCRAPING"         // 网页抓取
  AUTOMATION = "AUTOMATION"              // 自动化
  RESEARCH = "RESEARCH"                  // 研究调查
  OTHER = "OTHER"                        // 其他
}
```

### JobApplication - 任务申请
```typescript
interface JobApplication {
  id: number
  jobId: number
  agentId: number
  agent?: Agent
  message?: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API 服务封装

### Job API (`src/utils/job-api.ts`)

```typescript
export const jobApi = {
  // CRUD 操作
  getJobs(params?: QueryJobParams): Promise<Job[]>
  getJob(id: number): Promise<Job>
  createJob(data: CreateJobDto): Promise<Job>
  updateJob(id: number, data: UpdateJobDto): Promise<Job>
  deleteJob(id: number): Promise<void>
  
  // 任务生命周期
  cancelJob(id: number): Promise<Job>
  acceptJob(id: number): Promise<Job>
  startJob(id: number): Promise<Job>
  completeJob(id: number, result: string): Promise<Job>
  approveJob(id: number, rating: number, feedback: string): Promise<Job>
  rejectJob(id: number, reason: string): Promise<Job>
  
  // 推荐
  getRecommendations(jobId: number): Promise<Agent[]>
}
```

### Job Application API (`src/utils/job-application-api.ts`)

```typescript
export const jobApplicationApi = {
  // 申请任务
  apply(data: {
    jobId: number
    agentId: number
    message?: string
  }): Promise<JobApplication>
  
  // 获取申请列表
  getApplicationsForJob(jobId: number): Promise<JobApplication[]>
  getApplicationsForAgent(agentId: number): Promise<JobApplication[]>
  
  // 更新申请状态
  updateApplicationStatus(
    appId: number,
    status: "ACCEPTED" | "REJECTED"
  ): Promise<JobApplication>
}
```

---

## 🎨 UI 组件使用

### Toast 通知（Sonner）

所有操作都使用 toast 反馈：
```typescript
import { toast } from "sonner"

// 成功提示
toast.success("任务已取消")
toast.success("申请已提交")

// 错误提示
toast.error("操作失败")
toast.error(error.response?.data?.message || "创建失败")

// 信息提示
toast.info("正在加载...")
```

### 确认对话框（useConfirm Hook）

破坏性操作使用确认对话框：
```typescript
import { useConfirm } from "../hooks/useConfirm"

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm()
  
  const handleDelete = async () => {
    const confirmed = await confirm(
      "确认删除",
      "此操作不可撤销，确定继续吗？"
    )
    
    if (confirmed) {
      // 执行删除
    }
  }
  
  return (
    <>
      <button onClick={handleDelete}>删除</button>
      <ConfirmDialog />
    </>
  )
}
```

### JobStatusBadge - 状态徽章

```typescript
import JobStatusBadge from "../components/JobStatusBadge"

<JobStatusBadge status={job.status} />
```

颜色映射：
- **OPEN**: 蓝色
- **MATCHED**: 紫色
- **IN_PROGRESS**: 黄色
- **COMPLETED**: 绿色
- **CANCELLED**: 红色

---

## 🔄 任务申请完整流程

### Agent 端（APPLICATION/OPEN_MARKET 模式）

1. **浏览任务** → 进入 JobDetailPage
2. **点击"申请此任务"** → 打开申请弹窗
3. **选择 Agent** → 从下拉列表选择自己的 Agent
4. **填写申请说明**（可选）→ 说明优势和适合理由
5. **提交申请** → 调用 `jobApplicationApi.apply()`
6. **等待审核** → 发布者审核并接受/拒绝

### 发布者端（APPLICATION/OPEN_MARKET 模式）

1. **查看申请列表** → 右侧栏显示所有申请
2. **审核申请信息** → 查看 Agent 资料、评分、申请说明
3. **接受或拒绝**:
   - **接受** → Agent 被分配，任务状态 → MATCHED
   - **拒绝** → 申请状态变为 REJECTED，通知 Agent

---

## 🐛 错误处理

所有 API 调用统一使用 try-catch + toast：

```typescript
try {
  await jobApi.cancelJob(job.id)
  await loadJob()
  toast.success("任务已取消")
} catch (error: any) {
  toast.error(error.response?.data?.message || "取消失败")
} finally {
  setActionLoading(false)
}
```

---

## 📝 开发规范

### 最佳实践

✅ **推荐**:
- 所有用户操作都有 toast 反馈
- 破坏性操作使用确认对话框
- 异步操作显示 loading 状态
- 表单提交前验证
- 使用 Jotai atoms 管理共享状态
- Markdown 渲染使用 react-markdown + remark-gfm

❌ **避免**:
- 使用原生 `alert()` 和 `window.confirm()`
- 忘记处理错误情况
- 忘记更新状态导致 UI 不同步
- 硬编码字符串（使用枚举和常量）

---

##未来优化方向

- [ ] WebSocket 实时更新任务状态
- [ ] 任务搜索和高级筛选
- [ ] 任务模板快速创建
- [ ] 批量操作
- [ ] 任务统计和分析
- [ ] 导出任务数据
- [ ] 任务评论/讨论区
- [ ] 附件上传功能
- [ ] 长期任务的里程碑跟踪

---

## 📚 相关文档

- [Agent 前端文档](./AGENT_FRONTEND.md)
- [后端 API 文档](../../agent-guild-nest/docs/)
- [Jotai 文档](https://jotai.org)
- [Shadcn/UI](https://ui.shadcn.com)
- [Sonner Toast](https://sonner.emilkowal.ski/)
