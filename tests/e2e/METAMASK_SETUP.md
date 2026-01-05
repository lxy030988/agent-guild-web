# MetaMask 扩展配置指南

## 方法一：手动下载 MetaMask 扩展（推荐，无需额外依赖）

### 步骤 1: 下载 MetaMask 扩展

1. 访问 [MetaMask GitHub Releases](https://github.com/MetaMask/metamask-extension/releases)
2. 下载最新版本的 `metamask-chrome-*.zip` 文件
3. 解压到项目的 `tests/e2e/extensions/metamask` 目录

或者使用命令行下载：

```bash
# 创建目录
mkdir -p tests/e2e/extensions

# 下载最新版本（示例）
cd tests/e2e/extensions
curl -L -O https://github.com/MetaMask/metamask-extension/releases/download/v11.0.0/metamask-chrome-11.0.0.zip

# 解压
unzip metamask-chrome-11.0.0.zip -d metamask
rm metamask-chrome-11.0.0.zip
```

### 步骤 2: 配置环境变量

复制 `.env.test.example` 为 `.env.test` 并填入你的测试私钥：

```bash
cp .env.test.example .env.test
```

编辑 `.env.test`，填入你的 Sepolia 测试网私钥：

```env
METAMASK_PRIVATE_KEY=你的私钥
```

### 步骤 3: 运行测试

```bash
# 运行基础 UI 测试（不需要 MetaMask）
pnpm test:e2e

# 运行完整的 MetaMask 测试（需配置扩展）
pnpm test:e2e tests/e2e/specs/red-packet-metamask.spec.ts --headed
```

---

## 方法二：使用浏览器已安装的 MetaMask

如果你的 Chrome 已经安装了 MetaMask：

1. 找到你的 Chrome 用户数据目录
2. 在测试中使用持久化上下文指向该目录

**注意**：这种方法会使用你的真实钱包数据，仅用于本地开发调试！

---

## 当前项目状态

目前已实现：
- ✅ 基础 UI 测试（不需要 MetaMask）
- ✅ MetaMask 工具函数
- ⏳ MetaMask 集成测试（需要手动配置扩展）

基础测试可以直接运行：

```bash
pnpm test:e2e:ui
```

完整的 MetaMask 测试需要按照上述步骤配置扩展文件后才能运行。
