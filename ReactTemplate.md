# React Template

一个功能完善的 React 项目模板，集成了现代化的开发工具链和最佳实践。

## ✨ 特性

- ⚡️ **快速开发** - 使用 Webpack 5 + SWC 实现极速编译
- 🎨 **现代化样式** - 集成 TailwindCSS 4.x + PostCSS
- 🔧 **TypeScript** - 完整的类型支持
- 🧪 **完整测试** - Jest 单元测试 + Cypress/Playwright E2E 测试
- 📦 **Monorepo 支持** - 集成 `@monorepo-base/hooks` 和 `@monorepo-base/components`
- 🔗 **Web3 集成** - 支持 Wagmi + Viem 的区块链应用开发
- 🎯 **状态管理** - Jotai + React Query
- 🚀 **CI/CD** - GitHub Actions 自动化流程
- 📝 **代码规范** - Biome + Husky + lint-staged
- 🎭 **路由管理** - React Router v7

## 📦 技术栈

### 核心框架
- **React 19.2.1** - UI 框架
- **TypeScript** - 类型系统
- **React Router 7.10.1** - 路由管理

### 构建工具
- **Webpack 5** - 模块打包
- **SWC** - 超快速编译器
- **PostCSS** - CSS 处理
- **TailwindCSS 4.x** - 原子化 CSS 框架

### 状态管理
- **Jotai** - 原子化状态管理
- **React Query** - 服务端状态管理
- **Immer** - 不可变数据处理

### Web3
- **Wagmi 2.19.5** - React Hooks for Ethereum
- **Viem 2.43.1** - TypeScript Ethereum 库

### 测试
- **Jest** - 单元测试框架
- **Cypress** - E2E 测试
- **Playwright** - 现代化 E2E 测试

### 代码质量
- **Biome** - 快速的 Linter 和 Formatter
- **Husky** - Git Hooks
- **lint-staged** - 暂存区文件检查

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

### 开发
- `pnpm run dev` - 构建开发版本
- `pnpm run server` - 启动开发服务器
- `pnpm run prod` - 构建生产版本

### 测试
- `pnpm run unit` - 运行单元测试（带覆盖率报告）
- `pnpm run e2e:cypress` - 打开 Cypress 测试界面
- `pnpm run e2e:cypress:headless` - 无头模式运行 Cypress
- `pnpm run test:e2e` - 运行 Playwright E2E 测试
- `pnpm run test:e2e:ui` - Playwright UI 模式
- `pnpm run test:e2e:debug` - Playwright 调试模式
- `pnpm run test:e2e:report` - 查看 Playwright 测试报告

### 代码质量
- `pnpm run lint` - 运行 Biome 代码检查
- `pnpm run lint:fix` - 自动修复 lint 问题
- `pnpm run format` - 检查代码格式
- `pnpm run format:fix` - 自动格式化代码
- `pnpm run check` - 运行完整检查（lint + format）
- `pnpm run check:fix` - 自动修复所有问题

### CI/CD
- `pnpm run ci:local` - 本地运行 CI 流程

## 📁 项目结构

```
react-template/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD 配置
├── config/                 # Webpack 配置文件
│   ├── webpack.development.js
│   └── webpack.production.js
├── cypress/                # Cypress E2E 测试
├── loaders/                # 自定义 Webpack loaders
│   └── transform-matrix-loader.js  # CSS matrix3d 转换器
├── public/                 # 静态资源
├── scripts/                # 构建脚本
├── src/
│   ├── components/         # React 组件
│   ├── contracts/          # 智能合约相关
│   ├── examples/           # 示例代码
│   ├── hooks/              # 自定义 Hooks
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Demo.tsx
│   │   ├── RedPacket.tsx
│   │   └── MonorepoDemo.tsx
│   ├── routes/             # 路由配置
│   ├── stores/             # 状态管理
│   ├── wagmi.config.ts     # Wagmi 配置
│   └── index.tsx           # 应用入口
├── tests/                  # 测试文件
│   └── unit/               # 单元测试
├── biome.json              # Biome 配置
├── cypress.config.js       # Cypress 配置
├── jest.config.js          # Jest 配置
├── playwright.config.ts    # Playwright 配置
├── tailwind.config.js      # TailwindCSS 配置
├── tsconfig.json           # TypeScript 配置
└── webpack.config.js       # Webpack 主配置
```

## 🎯 功能模块

### 路由页面

- **Home** (`/`) - 首页
- **About** (`/about`) - 关于页面
- **Demo** (`/demo`) - 演示页面
- **Red Packet** (`/red-packet`) - 红包系统（Web3）
- **Transform Example** (`/transform-example`) - CSS Transform 示例
- **Monorepo Demo** (`/monorepo-demo`) - Monorepo 包集成示例

### 自定义功能

#### CSS Matrix3d Loader
项目包含自定义的 Webpack loader，可以将 CSS 中的 `matrix3d` 转换为更易读的 transform 函数。

配置位置：`loaders/transform-matrix-loader.js`

## 🧪 测试

### 单元测试

使用 Jest 进行单元测试，测试报告会生成在 `docs/jest-stare/` 目录。

```bash
pnpm run unit
```

### E2E 测试

#### Cypress
```bash
# 交互式模式
pnpm run e2e:cypress

# 无头模式
pnpm run e2e:cypress:headless
```

#### Playwright
```bash
# 运行测试
pnpm run test:e2e

# UI 模式
pnpm run test:e2e:ui

# 调试模式
pnpm run test:e2e:debug
```

## 🔧 配置说明

### 环境变量

创建 `.env.test` 文件（参考 `.env.test.example`）：

```env
# 在这里配置你的环境变量
```

### TypeScript 路径别名

项目配置了 `@/*` 别名指向 `src/*` 目录：

```typescript
import Component from '@/components/Component'
```

### Webpack 别名

- `@/` → `src/`
- `@react-native-async-storage/async-storage` → `src/empty-async-storage.ts`

## 📊 CI/CD

项目使用 GitHub Actions 进行持续集成，包含以下流程：

1. **Code Quality** - 代码质量检查（Biome lint + check）
2. **Unit Tests** - 单元测试
3. **E2E Tests** - Cypress E2E 测试
4. **Build Check** - 生产构建验证

CI 配置文件：`.github/workflows/ci.yml`

### 本地运行 CI

```bash
pnpm run ci:local
```

## 🔗 Monorepo 集成

项目集成了以下 monorepo 包：

- `@monorepo-base/hooks` - 共享 Hooks
- `@monorepo-base/components` - 共享组件

这些包需要从本地 Verdaccio 注册表安装。

## 🎨 样式方案

### TailwindCSS

项目使用 TailwindCSS 4.x 进行样式开发，配置文件：`tailwind.config.js`

### CSS Modules

支持标准的 CSS 文件导入，通过 PostCSS 处理。

## 🛠️ 开发工具

### 性能调试

项目集成了 `why-did-you-render` 用于 React 性能调试。

配置文件：`src/wdyr.tsx`

### 编辑器配置

- `.editorconfig` - 编辑器配置
- `.vscode/` - VS Code 配置

## 📄 许可证

ISC

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题，请通过 Issue 联系。

---

**Happy Coding! 🎉**
# react-template

## Hardhat sample

This repo now includes a minimal Hardhat setup for a simple `SimpleStorage` contract.

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and set `PRIVATE_KEY` (without the `0x` prefix) and `SEPOLIA_RPC_URL`.

### Scripts

- `pnpm compile` – compile Solidity contracts and export ABI to `src/abis/SimpleStorage.ts`.
- `pnpm deploy:local` – deploy to a local Hardhat node (`pnpm hardhat node`).
- `pnpm deploy:sepolia` – deploy to Sepolia using the credentials from `.env`.
