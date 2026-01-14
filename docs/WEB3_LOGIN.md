# Web3 登录系统 - 前端文档

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
VITE_API_URL=http://localhost:3000
```

### 3. 启动开发服务器
```bash
pnpm run server
```

访问 http://localhost:8080

---

## 登录流程

### 用户操作流程

```
1. 点击 "🔐 Connect Wallet" 按钮
   ↓
2. MetaMask 弹出连接请求
   ↓
3. 用户批准连接
   ↓
4. 按钮变为 "✍️ Sign to Login"
   ↓
5. 点击签名按钮
   ↓
6. MetaMask 弹出签名请求
   ↓
7. 用户签名
   ↓
8. Token 保存到 localStorage
   ↓
9. 登录成功！Header 显示用户信息
```

### 技术流程

```typescript
// 1. 连接钱包
const { connect } = useConnect()
connect({ connector: metaMaskConnector })

// 2. 获取 nonce
const { message } = await authApi.getNonce(address)

// 3. 签名消息（wagmi 自动处理 EIP-191）
const signature = await signMessageAsync({ message })

// 4. 登录
const response = await authApi.login(address, signature)

// 5. 保存 token
login(response.access_token, response.user)
```

---

## 状态管理

### Jotai Atoms

```typescript
// src/stores/authStore.ts
export const tokenAtom = atomWithStorage<string | null>('access_token', null)
export const userAtom = atomWithStorage<User | null>('user', null)
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom))
```

**特性**:
- 自动持久化到 `localStorage`
- 刷新页面保持登录状态
- Token 有效期 7 天

---

## 核心 Hooks

### useAuth

提供登录、登出、用户信息管理

```typescript
const { user, isAuthenticated, login, logout } = useAuth()

// 登录
login(accessToken, userData)

// 登出
logout() // 同时清除 localStorage

// 检查登录状态
if (isAuthenticated) {
  // 用户已登录
}
```

### useWeb3Login

处理 Web3 签名登录

```typescript
const { web3Login, isLoading, error } = useWeb3Login()

// 执行登录
await web3Login()
```

---

## API 封装

### Axios 配置

**请求拦截器** - 自动添加 JWT:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**响应拦截器** - 处理 401:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除过期 token
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)
```

### AuthAPI

```typescript
// 获取 nonce
const { message } = await authApi.getNonce(walletAddress)

// 登录
const { access_token, user } = await authApi.login(walletAddress, signature)

// 获取用户信息
const profile = await authApi.getProfile()
```

**注意**: 后端返回格式为 `{ success: true, data: {...} }`，API 会自动提取 `data` 字段

---

## Wagmi 配置

### 支持的网络

```typescript
import { mainnet, sepolia } from 'wagmi/chains'

// 自定义 Hardhat 本地网络
export const hardhat = {
  id: 31337,
  name: "Hardhat Local",
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
}
```

### 连接器

- MetaMask (推荐)
- Injected (通用)
- 可扩展支持 WalletConnect 等

---

## 组件使用

### Header 登录按钮

```tsx
import { Header } from '@/components/common/Header'

// 自动处理三种状态：
// 1. 未连接 → "Connect Wallet"
// 2. 已连接未登录 → "Sign to Login"  
// 3. 已登录 → 用户菜单
```

### 保护路由

```tsx
function ProtectedPage() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <div>请先登录</div>
  }
  
  return <div>受保护的内容</div>
}
```

---

## 本地开发

### 连接本地 Hardhat 网络

1. 启动 Hardhat 节点：
```bash
pnpm node:local
```

2. 在 MetaMask 中添加网络：
- **网络名称**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **货币符号**: ETH

3. 导入测试账户：
- 私钥在 Hardhat 启动日志中
- 默认账户 #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 常见问题

### Q: 登录后刷新页面需要重新登录？
**A**: 检查 localStorage 中是否有 `access_token`，应该自动保持登录

### Q: MetaMask 签名失败？
**A**: 
- 确保钱包已连接
- 检查网络是否正确
- 查看控制台错误信息

### Q: Token 过期了怎么办？
**A**: 后端返回 401，axios 拦截器会自动清除 token，用户需要重新登录

### Q: 如何切换网络？
**A**: 在 MetaMask 中切换，wagmi 会自动检测

### Q: 支持其他钱包吗？
**A**: 支持！wagmi 默认支持所有注入式钱包，可以添加 WalletConnect 支持更多

---

## 项目结构

```
src/
├── components/
│   └── common/
│       └── Header.tsx          # 集成登录按钮
├── hooks/
│   ├── useAuth.ts              # 认证状态管理
│   └── useWeb3Login.ts         # Web3 登录逻辑
├── pages/
│   └── ProfilePage.tsx         # 用户资料页
├── stores/
│   └── authStore.ts            # Jotai atoms
├── utils/
│   ├── api-client.ts           # Axios 配置
│   └── authApi.ts              # 认证 API 封装
└── wagmi.config.ts             # Wagmi 配置
```

---

## 技术栈

- **React 19** + TypeScript
- **wagmi** + **viem**: Web3 交互
- **Jotai**: 状态管理
- **Axios**: HTTP 客户端
- **React Router**: 路由
- **Vite**: 构建工具

---

## 最佳实践

✅ **推荐**:
- 使用 wagmi 的 hooks，不要直接用 window.ethereum
- Token 存储在 localStorage，生产环境考虑 httpOnly cookie
- 始终检查 `isAuthenticated` 状态
- 使用 TypeScript 类型定义

❌ **避免**:
- 不要在代码中硬编码钱包地址
- 不要忽略 MetaMask 错误
- 不要在组件中直接操作 localStorage
- 不要跳过用户签名步骤

---

## 调试技巧

### 查看登录状态
打开浏览器控制台：
```javascript
// 查看 token
localStorage.getItem('access_token')

// 查看用户信息
JSON.parse(localStorage.getItem('user'))
```

### 查看网络请求
1. 打开 DevTools → Network
2. 筛选 XHR
3. 查看 `/auth/nonce` 和 `/auth/login` 请求

### 清除登录状态
```javascript
localStorage.clear()
// 刷新页面
```
