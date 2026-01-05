import { test as base, type BrowserContext, chromium } from '@playwright/test';
import path from 'path';
import { type MetaMaskConfig, setupMetaMask, waitForMetaMaskExtension } from '../utils/metamask';

/**
 * 测试夹具
 * 扩展 Playwright 的 test 对象，添加 MetaMask 支持
 */

type MetaMaskFixtures = {
  context: BrowserContext;
  extensionId: string;
  metamaskConfig: MetaMaskConfig;
};

// MetaMask 扩展 ID（需要从 Chrome Web Store 下载）
// 这是 MetaMask 的固定扩展 ID
const METAMASK_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

export const test = base.extend<MetaMaskFixtures>({
  // 配置信息从环境变量读取
  metamaskConfig: async ({}, use) => {
    const config: MetaMaskConfig = {
      privateKey: process.env.METAMASK_PRIVATE_KEY || '',
      networkName: process.env.NETWORK_NAME || 'Sepolia',
      chainId: Number(process.env.CHAIN_ID) || 11155111, // Sepolia
      symbol: process.env.SYMBOL || 'ETH',
    };
    
    if (!config.privateKey) {
      throw new Error('METAMASK_PRIVATE_KEY environment variable is required');
    }
    
    await use(config);
  },

  // 创建带 MetaMask 扩展的浏览器上下文
  context: async ({ metamaskConfig }, use) => {
    // MetaMask 扩展路径 - 需要手动下载扩展文件
    // 参考: tests/e2e/METAMASK_SETUP.md
    const pathToExtension = path.join(__dirname, '../extensions/metamask');
    
    // 检查扩展是否存在
    const fs = require('fs');
    if (!fs.existsSync(pathToExtension)) {
      console.warn('⚠️  MetaMask extension not found at:', pathToExtension);
      console.warn('⚠️  Please follow the setup guide: tests/e2e/METAMASK_SETUP.md');
      console.warn('⚠️  Running without MetaMask extension...');
      
      // 返回普通的浏览器上下文
      const context = await chromium.launchPersistentContext('', {
        headless: false,
        viewport: { width: 1280, height: 720 },
      });
      
      await use(context);
      await context.close();
      return;
    }
    
    // 创建持久化上下文以支持扩展
    // 注意：Chrome 扩展在传统 headless 模式下不工作
    // 但可以使用 headless: 'new' (Chrome 的新 headless 模式)
    // 或者在 CI 环境中使用 Xvfb 虚拟显示
    const isCI = process.env.CI === 'true';
    const forceHeadless = process.env.HEADLESS === 'true';
    
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Chrome 扩展需要有头模式或使用 Xvfb
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
        '--disable-dev-shm-usage',
        ...(isCI ? ['--disable-gpu', '--disable-software-rasterizer'] : []),
      ],
      viewport: { width: 1280, height: 720 },
    });

    try {
      // 等待 MetaMask 扩展加载
      await context.waitForEvent('page', { timeout: 10000 });
      const extensionPage = await waitForMetaMaskExtension(context);
      
      // 设置 MetaMask
      await setupMetaMask(extensionPage, metamaskConfig);
    } catch (error) {
      console.error('❌ MetaMask setup failed:', error);
      console.log('💡 Continuing without MetaMask setup...');
    }
    
    await use(context);
    await context.close();
  },

  extensionId: async ({}, use) => {
    await use(METAMASK_ID);
  },
});

export { expect } from '@playwright/test';
