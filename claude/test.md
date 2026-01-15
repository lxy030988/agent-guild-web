下面是一份你可以直接复制去用的 Claude ↔ Codex「双模型协作开发执行模板」（你已经有设计稿 + PRD，所以模板默认从“拆解 → 排期 → 实现 → 联调 → 交付”走全流程）。
用法：你把 PRD/设计稿链接 + 仓库地址 + 约束填进【项目输入】里，然后按阶段把对应 prompt 丢给 Claude / Codex。

⸻

0）角色分工（固定不变）

Claude（PM/架构/规范/验收负责人）
 • 读 PRD + 设计稿 → 输出：需求拆解、信息架构、数据模型、接口契约、边界与异常、验收标准
 • 制定工程规范：目录结构、命名、状态管理策略、错误处理、埋点、权限
 • Code Review 规则 + 风险清单 + 回归清单
 • 每个阶段做“验收对照表”（PRD/设计稿 → 实现点）

Codex（实施/编码/脚本/迁移负责人）
 • 按 Claude 的拆解与契约写代码：页面、组件、API、数据库、测试
 • 产出可运行 PR，保证 lint/test/build
 • 生成迁移脚本、mock、种子数据、e2e
 • 把实现差异/阻塞反馈给 Claude（用于决策）

⸻

1）项目输入（你先填这块，后面所有 prompt 直接复用）

项目输入（粘贴给 Claude 和 Codex）
 • PRD：<链接/粘贴关键章节>
 • 设计稿：<Figma/截图/页面清单>
 • 技术栈：<Next/Nest/React/Vue/DB/ORM/Deploy>
 • 仓库： + 分支策略（main/dev/feature/*）
 • 环境：Node 版本、包管理（pnpm/yarn）、CI（GitHub Actions 等）
 • 账号体系：登录方式（JWT/OAuth/钱包签名等）
 • 约束：截止时间、必须/可选、不可改动的模块
 • 交付物：必须有（API 文档/测试/埋点/监控/Changelog）
 • 非功能：性能目标、可访问性、SEO、安全要求

⸻

2）Claude：需求 → 任务拆解（输出给 Codex 的“执行蓝图”）

把【项目输入】发给 Claude 后，使用这段：

Claude Prompt：开发执行蓝图（必须产出结构化清单）
 1. 请基于 PRD + 设计稿输出「开发蓝图」，包含：
 • 页面/路由清单（含入口、跳转、空状态、错误态）
 • 组件清单（复用建议、props 约定）
 • 数据模型（实体/字段/关系/约束）
 • API 契约（REST/GraphQL：path、method、req/resp、错误码）
 • 状态管理与缓存策略（如 React Query / Zustand / Redux）
 • 权限与风控点（鉴权、RBAC、敏感操作）
 • 埋点事件表（event_name、触发时机、payload）
 • 验收标准（逐条对应 PRD/设计稿）
 2. 输出格式要求：
 • “任务分解树”(Epic → Story → Task)
 • 每个 Task 需要：目标、范围、实现要点、风险、完成定义(DoD)
 3. 任何不明确的地方不要提问，先给出默认假设并标注【Assumption】。

Claude 的输出你后面会直接贴给 Codex 当“唯一事实来源”。

⸻

3）Codex：按蓝图开工（PR 级别交付）

拿到 Claude 的蓝图后，给 Codex 这段：

Codex Prompt：按蓝图实现（强约束）
你将基于以下「开发蓝图」在仓库中实现功能并提交 PR。规则：
 • 严格遵循：目录结构、命名、API 契约、验收标准
 • 每个 PR 控制在：一个 Epic 下的 1~3 个 Story（可运行、可验收）
 • 必须提供：
 • 代码实现 + 最小可用 UI
 • 关键单测（或 e2e）+ mock（如需要）
 • README 更新：本地运行、环境变量、接口示例
 • 自检结果：lint/test/build 通过
 • 需要决策或发现蓝图冲突：不要自己改契约，先在 PR 描述里列出“阻塞/疑问/建议”，并给出两个可选方案及影响。
输入：<粘贴 Claude 蓝图>
输出：

 1. 本 PR 计划（包含改动文件列表）
 2. 实现后 PR 描述（含截图/录屏占位说明、测试方式）
 3. 若无法完成：列出阻塞点与替代实现

⸻

4）双向同步协议（每天/每 PR 一次）

Codex → Claude（实现回报模板）

Codex 回报给 Claude：
 • PR 链接：<…>
 • 完成的 Story/Task：<…>
 • 变更摘要：
 • UI：…
 • API：…
 • DB：…
 • 与蓝图差异（如有）：（差异点→原因→影响→建议）
 • 风险/债务：
 • 验收说明：如何验证（路径、账号、数据）
 • 下一步建议：<下一 PR 的切分建议>

Claude → Codex（验收/调整模板）

Claude 回给 Codex：
 • 验收结论：通过 / 不通过 / 需微调
 • 不通过项（逐条对照验收标准）：
 • 设计稿偏差清单（截图标注点）：
 • 需要调整的契约/模型（如有）：（旧→新→迁移影响）
 • 下一 PR 范围确认（继续/拆分/合并）：

⸻

5）关键产物模板（建议你强制要求输出）

5.1 API 契约（Claude 输出 / Codex 不可擅改）

- name: CreateAgent
  method: POST
  path: /api/agents
  auth: required
  request:
    body:
      name: string
      description: string
      tags: string[]
  response:
    200:
      id: string
      name: string
  errors:
    400: VALIDATION_ERROR
    401: UNAUTHORIZED

5.2 验收清单（Claude 维护，PRD 对齐）

- [ ] 页面 A：首屏加载 < 1s（本地）
- [ ] 空状态：无数据时展示 xxx（与设计稿一致）
- [ ] 错误态：接口 500 时 toast + 重试按钮
- [ ] 表单校验：name 必填、长度 <= 50

5.3 PR 描述（Codex 必填）

## What

## Why

## Scope

## Screenshots / Recordings

## How to test

## Risk & Rollback

## Checklist

- [ ] lint/test/build
- [ ] i18n / a11y（如适用）
- [ ] analytics events（如适用）

⸻

6）推荐的开发节奏（不需要你再规划）
 • PR0（基建 PR）：脚手架/路由骨架/设计系统接入/状态管理/接口层封装/Mock
 • PR1（核心链路）：用户最关键的 1 条 happy path 跑通（端到端）
 • PR2~PRn（补全）：分页/筛选/错误态/权限/埋点/性能
 • 最后 PR（收口）：回归、清理、文档、监控与告警

⸻

7）你直接复制就能用的“一句话版本”
 • 给 Claude：“请根据 PRD+设计稿输出开发蓝图（任务树+模型+API+验收标准），不确定处做假设并标注。”
 • 给 Codex：“严格按蓝图实现，每 PR 可运行可验收，契约不允许私改，遇阻塞给两个方案+影响。”

⸻

如果你愿意把你的 PRD 目录结构（哪怕只粘贴标题）和 设计稿页面清单发我，我可以把上面模板进一步“实例化”为：
 • 你的 Agent Marketplace 的 Epic/Story/Task 树
 • 首批 3 个 PR 的切分方案（按可验收链路切）
 • 直接能喂给 Codex 的“蓝图版 prompt（带你的字段/接口名）”
