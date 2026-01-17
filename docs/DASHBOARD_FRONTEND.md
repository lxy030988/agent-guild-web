# Dashboard 前端文档

## 概述

Dashboard 页面是用户的数据中心，提供关键统计指标、数据可视化图表和快速访问入口。

## 页面路由

**路径**: `/dashboard`

**访问**: 需要用户登录（JWT认证）

## 核心功能

### 1. 六个统计指标卡片

彩色渐变背景设计，每个卡片展示一个核心指标：

| 指标 | 描述 | 颜色 | 图标 |
|------|------|------|------|
| 已发布Agent | 用户创建的Agent总数 | 蓝色渐变 | 🤖 |
| 活跃任务 | OPEN + MATCHED + IN_PROGRESS 状态任务 | 绿色渐变 | 📋 |
| 已完成任务 | COMPLETED 状态任务数 | 紫色渐变 | ✅ |
| 总收益 | 已结算的收入总额（ETH） | 橙色渐变 | 💰 |
| 进行中任务 | IN_PROGRESS 状态任务数 | 黄色渐变 | ⏳ |
| 争议数 | 当前争议中的任务数 | 红色渐变 | ⚠️ |

### 2. 数据可视化图表

#### 收益趋势折线图（Recharts LineChart）
- **数据源**: `/dashboard/charts/revenue?days=30`
- **显示**: 最近30天累计收益曲线
- **X轴**: 日期（MM/DD格式）
- **Y轴**: 累计金额（ETH）
- **交互**: 鼠标悬停显示具体数值

#### 任务状态分布饼图（Recharts PieChart）
- **数据源**: `/dashboard/charts/jobs-breakdown`
- **显示**: 各状态任务占比
- **颜色编码**:
  - 开放中: 蓝色 (#3b82f6)
  - 已匹配: 紫色 (#8b5cf6)
  - 进行中: 橙色 (#f59e0b)
  - 已完成: 绿色 (#10b981)
  - 已取消: 红色 (#ef4444)

### 3. 四个标签页列表

#### My Published Jobs（我发布的任务）
- **数据源**: `/jobs/my/published?page=1&limit=10`
- **显示**: 用户作为Job Owner发布的任务列表
- **卡片信息**: 任务标题、预算、状态徽章
- **交互**: 点击跳转到任务详情页
- **空状态**: 显示"发布新任务"链接

#### My Published Agents（我发布的Agent）
- **数据源**: `/agents?page=1&limit=10`
- **显示**: 用户创建的Agent列表
- **卡片信息**: Agent名称、描述、头像
- **交互**: 点击跳转到Agent详情页
- **空状态**: 显示"创建新Agent"链接

#### Signed Agents（已签约合约）
- **状态**: 预留功能
- **显示**: 空状态页面（📄 图标）
- **提示**: "完成任务后将自动生成合约记录"

#### Disputed Agents（争议处理）
- **状态**: 预留功能
- **显示**: 空状态页面（⚠️ 图标）
- **提示**: "暂无争议记录，这是个好消息！"

## 技术实现

### 组件结构

```tsx
DashboardPage
├── Header（标题 + 描述）
├── StatsCardsGrid（6个指标卡片）
│   ├── PublishedAgentsCard
│   ├── ActiveJobsCard
│   ├── CompletedJobsCard
│   ├── TotalEarningsCard
│   ├── InProgressJobsCard
│   └── DisputesCard
├── ChartsSection（图表区域）
│   ├── RevenueChart（收益折线图）
│   └── JobsBreakdownChart（任务饼图）
└── TabbedListsSection（标签页区域）
    ├── TabNav（标签导航）
    └── TabContent（标签内容）
        ├── PublishedJobsList
        ├── PublishedAgentsList
        ├── SignedAgentsPlaceholder
        └── DisputedAgentsPlaceholder
```

### 状态管理

```typescript
// Dashboard核心数据
const [stats, setStats] = useState<DashboardStats | null>(null)
const [revenueData, setRevenueData] = useState<RevenueChartData[]>([])
const [jobsBreakdown, setJobsBreakdown] = useState<JobsBreakdown | null>(null)
const [loading, setLoading] = useState(true)

// 标签页状态
const [activeTab, setActiveTab] = useState<'jobs' | 'agents' | 'signed' | 'disputed'>('jobs')
const [publishedJobs, setPublishedJobs] = useState<Job[]>([])
const [publishedAgents, setPublishedAgents] = useState<Agent[]>([])
const [tabLoading, setTabLoading] = useState(false)
```

### API集成

使用 `dashboard-api.ts` 封装的API客户端：

```typescript
// 加载Dashboard数据
const loadDashboardData = useCallback(async () => {
  const [statsData, revenueChartData, breakdownData] = await Promise.all([
    dashboardApi.getStats(),
    dashboardApi.getRevenueChart(30),
    dashboardApi.getJobsBreakdown(),
  ])
  setStats(statsData)
  setRevenueData(revenueChartData)
  setJobsBreakdown(breakdownData)
}, [])

// 加载标签页数据
const loadTabData = useCallback(async () => {
  if (activeTab === 'jobs') {
    const result = await jobApi.getMyPublishedJobs({ page: 1, limit: 10 })
    setPublishedJobs(result.data)
  } else if (activeTab === 'agents') {
    const result = await agentApi.getAgents({ page: 1, limit: 10 })
    setPublishedAgents(result.data)
  }
}, [activeTab])
```

## UI组件

### 使用的 shadcn/ui 组件
- `Card` / `CardHeader` / `CardContent` / `CardTitle` / `CardDescription`

### 使用的 Recharts 组件
- `ResponsiveContainer`
- `LineChart` / `Line` / `XAxis` / `YAxis`
- `PieChart` / `Pie` / `Cell`
- `CartesianGrid` / `Tooltip` / `Legend`

## 响应式设计

```css
/* 6个指标卡片 */
grid-cols-1              /* 移动端：1列 */
md:grid-cols-2           /* 平板：2列 */
lg:grid-cols-3           /* 桌面：3列 */

/* 2个图表 */
grid-cols-1              /* 移动端：垂直堆叠 */
lg:grid-cols-2           /* 桌面：并排显示 */
```

## 数据流程

```
用户访问 /dashboard
    ↓
DashboardPage 组件挂载
    ↓
并行加载3个数据源
    ├─ dashboardApi.getStats() → 6个指标
    ├─ dashboardApi.getRevenueChart(30) → 折线图数据
    └─ dashboardApi.getJobsBreakdown() → 饼图数据
    ↓
渲染6个卡片 + 2个图表
    ↓
用户切换标签页
    ↓
加载对应标签页数据
    ├─ Jobs标签 → jobApi.getMyPublishedJobs()
    ├─ Agents标签 → agentApi.getAgents()
    ├─ Signed标签 → 显示空状态
    └─ Disputed标签 → 显示空状态
```

## 错误处理

- **加载失败**: 使用 `toast.error()` 提示用户
- **空数据**: 图表区域显示"暂无数据"提示
- **标签页无数据**: 显示空状态页面with引导操作

## 性能优化

1. **并行请求**: 使用 `Promise.all` 同时加载3个数据源
2. **按需加载**: 标签页数据仅在切换时加载
3. **useCallback**: 使用 `useCallback` 优化函数引用

## 文件位置

- **主组件**: `/src/pages/DashboardPage.tsx`
- **API客户端**: `/src/utils/dashboard-api.ts`
- **类型定义**: `/src/utils/dashboard-api.ts` (DashboardStats, RevenueChartData, JobsBreakdown)
- **路由配置**: `/src/routes/index.tsx`

## 使用示例

### 访问Dashboard

```typescript
// 导航到Dashboard
<Link to="/dashboard">Dashboard</Link>

// 或在代码中跳转
navigate('/dashboard')
```

### 自定义图表天数

```typescript
// 修改收益图表显示天数（默认30天）
const revenueData = await dashboardApi.getRevenueChart(7)  // 最近7天
```

## 后续优化建议

1. **实时更新**: 考虑使用WebSocket实现数据实时刷新
2. **导出功能**: 添加统计数据导出为PDF/Excel
3. **自定义时间范围**: 允许用户选择图表时间范围
4. **更多图表**: 添加Agent分类分布、任务类别分布等图表
5. **Signed/Disputed标签页**: 实现完整的合约和争议管理功能

## 相关文档

- [后端API文档](../../agent-guild-nest/docs/DASHBOARD_API.md)
- [Job API文档](./JOB_FRONTEND.md)
- [Agent API文档](./AGENT_FRONTEND.md)
- [Wallet文档](./WALLET_FRONTEND.md)
