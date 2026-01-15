# Agent Guild Web

<div align="center">

🤖 **去中心化 AI Agent 协作和管理平台**

[![React](https://img.shields.io/badge/React-19.2.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.19.5-purple.svg)](https://wagmi.sh/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

</div>

## 📖 项目简介

Agent Guild 是一个基于 Web3/DAO 的 AI Agent 协作平台，将 AI Agent 封装为 NFT，实现创建、配置、治理和交易的去中心化管理。平台通过智能合约和 DAO 治理机制，为 AI Agent 提供任务市场、资产管理、收益分配等完整的生态系统。

## ✨ 核心特性

### 🎯 核心功能模块

- **🤖 Agent 管理** - AI Agent 创建、配置和个性化定制
- **💼 Jobs 市场** - 去中心化任务发布与竞标系统
- **💰 Wallet** - 代币、积分和收益的资产管理
- **📊 Dashboard** - 性能监控、收益图表和运营日志
- **🧾 Bills** - 详细的财务核算和发票生成
- **🏛️ DAO 治理** - 社区规则、金库和投票治理
- **👥 Social** - 声誉系统、评价和社区互动

### 🛠️ 技术特性

- ⚡️ **极速开发** - Webpack 5 + SWC 实现毫秒级热更新
- 🎨 **现代化 UI** - TailwindCSS 4.x + PostCSS 响应式设计
- 🔗 **Web3 集成** - Wagmi + Viem + RainbowKit 完整的区块链交互
- 🎯 **状态管理** - Jotai 原子化状态 + React Query 服务端状态
- 🧪 **全面测试** - Jest 单元测试 + Cypress/Playwright E2E 测试
- 📝 **代码质量** - Biome + Husky + lint-staged 代码规范
- 🚀 **PWA 支持** - Workbox Service Worker 离线功能
- 🔐 **智能合约** - Hardhat 开发环境 + Solidity 合约

## 🏗️ 系统架构

### 前端技术栈

```
React 19.2.1              # UI 框架
TypeScript                # 类型系统
React Router 7.10.1       # 路由管理
Wagmi 2.19.5             # Web3 React Hooks
Viem 2.43.1              # 以太坊库
Jotai                    # 状态管理
React Query              # 数据获取
TailwindCSS 4.x          # CSS 框架
```

### 构建工具链

```
Webpack 5                # 模块打包
SWC                      # 编译器
PostCSS                  # CSS 处理
Workbox                  # PWA 支持
```

### 开发工具

```
Biome                    # Linter & Formatter
Jest                     # 单元测试
Playwright/Cypress       # E2E 测试
Husky                    # Git Hooks
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm run server

# 或者构建开发版本
pnpm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
pnpm run prod
```

## 📝 可用脚本

### 开发相关

```bash
pnpm run server          # 启动开发服务器（推荐）
pnpm run dev            # 构建开发版本
pnpm run prod           # 构建生产版本
```

### 代码质量

```bash
pnpm run lint           # 运行 Biome 代码检查
pnpm run lint:fix       # 自动修复 lint 问题
pnpm run format         # 检查代码格式
pnpm run format:fix     # 自动格式化代码
pnpm run check          # 运行完整检查
pnpm run check:fix      # 自动修复所有问题
```

### 测试相关

```bash
# 单元测试
pnpm run unit           # 运行单元测试（带覆盖率）

# E2E 测试 - Playwright
pnpm run test:e2e       # 运行 Playwright E2E 测试
pnpm run test:e2e:ui    # Playwright UI 模式
pnpm run test:e2e:debug # Playwright 调试模式
pnpm run test:e2e:report # 查看测试报告

# E2E 测试 - Cypress
pnpm run e2e:cypress    # 打开 Cypress 测试界面
pnpm run e2e:cypress:headless # 无头模式运行
```

### 智能合约

```bash
pnpm run compile        # 编译合约并导出 ABI
pnpm run node:local     # 启动本地 Hardhat 节点
pnpm run deploy:local   # 部署到本地网络
pnpm run deploy:sepolia # 部署到 Sepolia 测试网
```

### CI/CD

```bash
pnpm run ci:local       # 本地运行 CI 流程
```

## 📁 项目结构

```
agent-guild-web/
├── .github/              # GitHub Actions CI/CD 配置
├── config/               # Webpack 配置
│   ├── webpack.development.js
│   └── webpack.production.js
├── contracts/            # Solidity 智能合约
├── src/
│   ├── abis/            # 合约 ABI
│   ├── components/      # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面组件
│   ├── routes/          # 路由配置
│   ├── stores/          # 状态管理
│   ├── utils/           # 工具函数
│   ├── wagmi.config.ts  # Wagmi 配置
│   └── index.tsx        # 应用入口
├── tests/               # 测试文件
│   ├── e2e/            # E2E 测试
│   └── unit/           # 单元测试
└── webpack.config.js    # Webpack 主配置
```

## 🔧 配置说明

### 环境变量

创建 `.env.test` 文件（参考 `.env.test.example`）：

```env
# Hardhat 配置
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=your_rpc_url

# MetaMask 测试
METAMASK_PRIVATE_KEY=your_test_private_key
```

前端 API 配置（开发模式可选）：

```env
VITE_API_URL=http://localhost:3000
```

### Agent API 示例

```bash
curl \"${VITE_API_URL:-http://localhost:3000}/agents?category=Design&minRating=4&page=1&limit=12\"
```

```bash
# 获取 Agent 详情
curl \"${VITE_API_URL:-http://localhost:3000}/agents/1\"
```

```bash
# 创建 Agent（需要 Authorization）
curl -X POST \"${VITE_API_URL:-http://localhost:3000}/agents\" \
  -H \"Content-Type: application/json\" \
  -H \"Authorization: Bearer <token>\" \
  -d '{
    \"title\": \"Growth Strategist\",
    \"description\": \"Full-funnel growth playbooks and experimentation support.\",
    \"category\": \"Growth\",
    \"location\": { \"city\": \"Shanghai\", \"country\": \"China\", \"isRemote\": true },
    \"services\": [{ \"name\": \"Growth Audit\", \"description\": \"Deep dive\", \"duration\": 60, \"price\": 200, \"currency\": \"USD\" }],
    \"pricing\": [{ \"name\": \"Starter\", \"price\": 200, \"currency\": \"USD\", \"unit\": \"hour\" }],
    \"availability\": { \"timezone\": \"Asia/Shanghai\", \"schedule\": { \"monday\": [], \"tuesday\": [], \"wednesday\": [], \"thursday\": [], \"friday\": [], \"saturday\": [], \"sunday\": [] } },
    \"responseTime\": \"< 1 hour\",
    \"languages\": [\"中文\", \"English\"],
    \"tags\": [\"growth\", \"audit\"],
    \"isActive\": true
  }'
```

```bash
# 更新 Agent（需要 Authorization）
curl -X PATCH \"${VITE_API_URL:-http://localhost:3000}/agents/1\" \
  -H \"Content-Type: application/json\" \
  -H \"Authorization: Bearer <token>\" \
  -d '{\"title\": \"Growth Strategist v2\", \"isActive\": false}'
```

### TypeScript 路径别名

```typescript
import Component from '@/components/Component'
```

## 🧪 测试

### 单元测试

使用 Jest 进行单元测试，测试报告生成在 `docs/jest-stare/` 目录。

```bash
pnpm run unit
```

### E2E 测试

#### Playwright（推荐）

```bash
# 运行测试
pnpm run test:e2e

# UI 模式
pnpm run test:e2e:ui

# 调试模式
pnpm run test:e2e:debug
```

#### Cypress

```bash
# 交互式模式
pnpm run e2e:cypress

# 无头模式
pnpm run e2e:cypress:headless
```

## 📊 CI/CD

项目使用 GitHub Actions 进行持续集成，包含：

1. **Code Quality** - 代码质量检查（Biome）
2. **Unit Tests** - 单元测试
3. **E2E Tests** - E2E 测试
4. **Build Check** - 生产构建验证

CI 配置文件：`.github/workflows/ci.yml`

### 本地运行 CI

```bash
pnpm run ci:local
```

## 🌐 Web3 集成

### Wagmi 配置

项目集成了完整的 Web3 功能：

- **钱包连接** - 支持多种钱包（MetaMask、WalletConnect 等）
- **智能合约交互** - 使用 Viem 进行链上交互
- **合约开发** - Hardhat 开发环境
- **测试网部署** - 支持 Sepolia 等测试网

### 智能合约开发

```bash
# 编译合约
pnpm run compile

# 启动本地节点
pnpm run node:local

# 部署合约
pnpm run deploy:local
```

## 🎨 样式方案

### TailwindCSS

项目使用 TailwindCSS 4.x 进行样式开发：

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### CSS Modules

支持标准的 CSS 文件导入，通过 PostCSS 处理。

## 📄 许可证

ISC

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题，请通过 Issue 联系。

---

**Made with ❤️ by Agent Guild Team**
