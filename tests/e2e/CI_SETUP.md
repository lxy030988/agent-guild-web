# MetaMask E2E 测试 CI 配置指南

## GitHub Actions 配置

本项目使用 GitHub Actions 运行 E2E 测试，包括 MetaMask 集成测试。

### 必需的 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **METAMASK_PRIVATE_KEY** - 测试账户的私钥（不含 0x 前缀）
2. **RED_PACKET_CONTRACT** - 红包合约地址

> **注意**：不需要配置 RPC URL，MetaMask 和 wagmi 会使用默认的 Sepolia 公共 RPC 端点。

### 设置步骤

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加上述 secrets

### 本地测试 CI 流程

```bash
# 1. 下载 MetaMask 扩展
./scripts/download-metamask.sh

# 2. 创建 .env.test 文件（参考 .env.test.example）
cp .env.test.example .env.test
# 编辑 .env.test 填入真实值

# 3. 运行测试
pnpm test:e2e  # headless 模式
pnpm test:e2e:headed  # 可视化模式（本地调试）
```

### 注意事项

1. **测试账户余额** - 确保测试账户有足够的 Sepolia ETH
2. **MetaMask 版本** - 默认使用 v12.9.1，可在下载脚本中修改
3. **超时设置** - MetaMask 测试超时设置为 3 分钟
4. **并行执行** - MetaMask 测试必须串行执行（workers: 1）

### Headless vs Headed 模式

- **CI 环境**: 自动使用 headless 模式
- **本地开发**: 使用 `pnpm test:e2e:headed` 查看浏览器操作
- **调试**: 使用 `pnpm test:e2e:debug` 进入调试模式

### 测试报告

测试完成后，报告和截图会上传到 GitHub Actions artifacts：
- `playwright-report` - HTML 报告和测试结果
- `test-screenshots` - 测试过程中的截图

## 其他 CI 平台配置

### GitLab CI

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - pnpm install
    - ./scripts/download-metamask.sh
    - pnpm test:e2e
  artifacts:
    paths:
      - docs/playwright-report/
      - test-results/
    expire_in: 1 week
```

### Jenkins

```groovy
stage('E2E Tests') {
  steps {
    sh 'pnpm install'
    sh './scripts/download-metamask.sh'
    sh 'pnpm test:e2e'
  }
  post {
    always {
      publishHTML([
        reportDir: 'docs/playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report'
      ])
    }
  }
}
```

## 常见问题

### Q: CI 中测试失败，本地正常？
A: 检查：
1. 环境变量是否正确设置
2. 测试账户余额是否充足
3. CI 环境的网络连接

### Q: 如何更新 MetaMask 版本？
A: 修改 `scripts/download-metamask.sh` 中的默认版本号，或在 CI 配置中传递版本参数

### Q: 测试太慢怎么办？
A: 
1. 只在特定分支运行完整 E2E 测试
2. 考虑跳过 MetaMask 测试，只运行基本 UI 测试
3. 使用更快的 RPC 提供商
