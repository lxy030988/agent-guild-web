import type { BrowserContext, Page } from '@playwright/test';

/**
 * MetaMask 辅助工具
 * 提供 MetaMask 钱包操作的辅助函数
 */

export interface MetaMaskConfig {
  privateKey: string;
  networkName?: string;
  chainId?: number;
  symbol?: string;
}

/**
 * 等待 MetaMask 扩展加载完成
 */
export async function waitForMetaMaskExtension(context: BrowserContext): Promise<Page> {
  console.log('🔍 等待 MetaMask 扩展页面...');
  
  // 等待一段时间让扩展初始化
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const pages = context.pages();
  console.log(`📄 当前打开的页面数量: ${pages.length}`);
  
  // 打印所有页面的 URL
  for (let i = 0; i < pages.length; i++) {
    console.log(`  页面 ${i}: ${pages[i].url()}`);
  }
  
  // 查找 MetaMask 扩展页面
  const extensionPage = pages.find(p => {
    const url = p.url();
    return url.includes('chrome-extension://') && 
           (url.includes('home.html') || url.includes('notification') || url.includes('popup'));
  });
  
  if (!extensionPage) {
    console.error('❌ 未找到 MetaMask 扩展页面');
    console.log('💡 提示: 扩展可能需要手动打开');
    throw new Error('MetaMask extension page not found');
  }
  
  console.log(`✅ 找到 MetaMask 页面: ${extensionPage.url()}`);
  await extensionPage.waitForLoadState('domcontentloaded');
  return extensionPage;
}

/**
 * 设置 MetaMask 钱包
 * @param page MetaMask 扩展页面
 * @param config 配置信息
 */
export async function setupMetaMask(page: Page, config: MetaMaskConfig): Promise<void> {
  try {
    console.log('🚀 开始设置 MetaMask...');
    
    // 等待欢迎页面加载
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 截图调试
    await page.screenshot({ path: 'docs/playwright-report/metamask-step1-welcome.png' });
    console.log('📸 截图: 欢迎页面');
    
    // 第一步：同意条款
    console.log('✓ 同意条款...');
    await page.waitForSelector('#onboarding__terms-checkbox', { timeout: 10000 });
    await page.click('#onboarding__terms-checkbox');
    
    // 第二步：点击"创建新钱包"按钮（因为用户只有私钥）
    console.log('👆 点击创建新钱包（稍后导入私钥）...');
    await page.waitForSelector('[data-testid="onboarding-create-wallet"]', { timeout: 5000 });
    await page.click('[data-testid="onboarding-create-wallet"]');
    
    await page.waitForTimeout(2000);
    
    // 第三步：拒绝数据收集（如果出现）
    try {
      console.log('🚫 拒绝数据收集...');
      await page.waitForSelector('[data-testid="metametrics-no-thanks"]', { timeout: 3000 });
      await page.click('[data-testid="metametrics-no-thanks"]');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('ℹ️  没有数据收集页面，跳过');
    }
    
    await page.screenshot({ path: 'docs/playwright-report/metamask-step2-password.png' });
    console.log('📸 截图: 设置密码页面');
    
    // 第四步：设置密码
    console.log('🔐 设置密码...');
    const testPassword = 'TestPassword123!'; // 测试密码
    
    await page.waitForSelector('[data-testid="create-password-new"]', { timeout: 5000 });
    await page.fill('[data-testid="create-password-new"]', testPassword);
    await page.fill('[data-testid="create-password-confirm"]', testPassword);
    
    // 勾选同意条款
    await page.click('[data-testid="create-password-terms"]');
    
    // 点击创建钱包
    await page.click('[data-testid="create-password-wallet"]');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step3-secure.png' });
    console.log('📸 截图: 助记词备份页面');
    
    // 第五步：点击"保护钱包"按钮
    console.log('🔒 点击保护钱包...');
    await page.waitForSelector('[data-testid="secure-wallet-recommended"]', { timeout: 5000 });
    await page.click('[data-testid="secure-wallet-recommended"]');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step4-confirm.png' });
    console.log('📸 截图: 确认助记词页面');
    
    // 第六步：显示助记词并读取
    console.log('👁️  点击显示助记词...');
    await page.waitForSelector('[data-testid="recovery-phrase-reveal"]', { timeout: 5000 });
    await page.click('[data-testid="recovery-phrase-reveal"]');
    
    await page.waitForTimeout(2000);
    
    // 读取12个助记词
    console.log('📖 读取助记词...');
    const seedWords: string[] = [];
    for (let i = 0; i < 12; i++) {
      const wordSelector = `[data-testid="recovery-phrase-chip-${i}"]`;
      const wordElement = await page.$(wordSelector);
      if (wordElement) {
        const word = await wordElement.textContent();
        if (word) {
          seedWords.push(word.trim());
          console.log(`  单词 ${i}: ${word.trim()}`);
        }
      }
    }
    
    await page.screenshot({ path: 'docs/playwright-report/metamask-step5-revealed.png' });
    console.log(`📸 截图: 助记词已显示 (共 ${seedWords.length} 个单词)`);
    
    // 第七步：点击下一步进入测验
    console.log('➡️  点击下一步...');
    await page.waitForSelector('[data-testid="recovery-phrase-next"]', { timeout: 5000 });
    await page.click('[data-testid="recovery-phrase-next"]');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step6-quiz.png' });
    console.log('📸 截图: 助记词测验页面');
    
    // 第八步：完成助记词测验（填写特定单词）
    console.log('✍️  完成助记词测验...');
    
    // 查找所有需要填写的输入框
    const inputFields = await page.$$('[data-testid^="recovery-phrase-input-"]');
    console.log(`📝 找到 ${inputFields.length} 个输入框`);
    
    for (const inputField of inputFields) {
      // 获取输入框的 data-testid 来确定需要第几个单词
      const testId = await inputField.getAttribute('data-testid');
      if (testId) {
        const match = testId.match(/recovery-phrase-input-(\d+)/);
        if (match) {
          const wordIndex = parseInt(match[1]);
          const word = seedWords[wordIndex];
          if (word) {
            await inputField.fill(word);
            console.log(`  ✓ 已填写单词 ${wordIndex}: ${word}`);
            await page.waitForTimeout(300);
          }
        }
      }
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step7-quiz-done.png' });
    console.log('📸 截图: 测验完成');
    
    // 第九步：点击确认按钮
    console.log('✅ 点击确认...');
    await page.waitForSelector('[data-testid="recovery-phrase-confirm"]', { timeout: 5000 });
    await page.click('[data-testid="recovery-phrase-confirm"]');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step8-complete.png' });
    console.log('📸 截图: 钱包创建完成');
    
    // 第十步：点击完成按钮
    console.log('� 点击完成按钮...');
    await page.waitForSelector('[data-testid="onboarding-complete-done"]', { timeout: 5000 });
    await page.click('[data-testid="onboarding-complete-done"]');
    
    await page.waitForTimeout(2000);
    
    // 第十一步：固定扩展（可选）
    try {
      console.log('📌 固定扩展...');
      await page.waitForSelector('[data-testid="pin-extension-next"]', { timeout: 3000 });
      await page.click('[data-testid="pin-extension-next"]');
      await page.waitForTimeout(1000);
      
      await page.waitForSelector('[data-testid="pin-extension-done"]', { timeout: 3000 });
      await page.click('[data-testid="pin-extension-done"]');
      console.log('✅ 扩展已固定');
    } catch (e) {
      console.log('ℹ️  跳过固定扩展步骤');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/playwright-report/metamask-step9-ready.png' });
    console.log('🎉 MetaMask 钱包设置完成！');
    
    // 第十二步：导入私钥账户
    console.log('🔑 开始导入私钥账户...');
    
    // 获取扩展 ID 并导航到主页
    const extensionUrl = page.url();
    const extensionId = extensionUrl.match(/chrome-extension:\/\/([^/]+)/)?.[1];
    
    if (extensionId) {
      console.log(`  🏠 导航到 MetaMask 主页 (${extensionId})...`);
      await page.goto(`chrome-extension://${extensionId}/home.html`);
      await page.waitForTimeout(2000);
      
      // 关闭欢迎弹窗（如果存在）
      try {
        console.log('  ❌ 关闭欢迎弹窗...');
        await page.waitForSelector('[data-testid="popover-close"]', { timeout: 3000 });
        await page.click('[data-testid="popover-close"]');
        await page.waitForTimeout(1000);
        console.log('  ✅ 弹窗已关闭');
      } catch (e) {
        console.log('  ℹ️  没有弹窗需要关闭');
      }
    }
    
    // 点击账户菜单按钮
    console.log('  👤 打开账户菜单...');
    await page.waitForSelector('[data-testid="account-menu-icon"]', { timeout: 10000 });
    await page.click('[data-testid="account-menu-icon"]');
    await page.waitForTimeout(1000);
    
    // 点击"添加账户或硬件钱包"
    console.log('  ➕ 点击添加账户或硬件钱包...');
    await page.waitForSelector('[data-testid="multichain-account-menu-popover-action-button"]', { timeout: 5000 });
    await page.click('[data-testid="multichain-account-menu-popover-action-button"]');
    await page.waitForTimeout(1000);
    
    // 点击"导入账户"
    console.log('  📥 点击导入账户...');
    await page.waitForSelector('[data-testid="multichain-account-menu-popover-add-imported-account"]', { timeout: 5000 });
    await page.click('[data-testid="multichain-account-menu-popover-add-imported-account"]');
    await page.waitForTimeout(2000);
    
    // 输入私钥
    console.log('  ✍️  输入私钥...');
    await page.waitForSelector('#private-key-box', { timeout: 5000 });
    await page.fill('#private-key-box', config.privateKey);
    await page.waitForTimeout(1000);
    
    // 点击导入确认
    console.log('  ✅ 确认导入...');
    await page.waitForSelector('[data-testid="import-account-confirm-button"]', { timeout: 5000 });
    await page.click('[data-testid="import-account-confirm-button"]');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'docs/playwright-report/metamask-step10-imported.png' });
    console.log('🎊 私钥账户导入成功！');
    
    console.log('✨ MetaMask 完全配置完成！可以开始测试了');
    
  } catch (error) {
    console.error('❌ MetaMask 设置失败:', error);
    await page.screenshot({ path: 'docs/playwright-report/metamask-error.png' });
    throw error;
  }
}

/**
 * 连接钱包到 DApp
 */
export async function connectWallet(page: Page, context: BrowserContext): Promise<void> {
  // 等待 MetaMask 弹窗出现
  console.log('⏳ 等待 MetaMask 连接弹窗...');
  const metamaskPage = await context.waitForEvent('page', { timeout: 10000 });
  await metamaskPage.waitForLoadState('domcontentloaded');
  await metamaskPage.waitForTimeout(2000);
  
  // 第一步：点击确认连接按钮
  console.log('✅ 点击确认连接...');
  await metamaskPage.waitForSelector('[data-testid="confirm-btn"]', { timeout: 5000 });
  await metamaskPage.click('[data-testid="confirm-btn"]');
  await metamaskPage.waitForTimeout(1000);
  
  // 第二步：点击下一步/确认按钮
  console.log('✅ 点击下一步确认...');
  await metamaskPage.waitForSelector('[data-testid="page-container-footer-next"]', { timeout: 5000 });
  await metamaskPage.click('[data-testid="page-container-footer-next"]');
  
  // MetaMask 弹窗会自动关闭，不需要手动关闭
  console.log('🎉 钱包连接成功！');
}

/**
 * 确认交易
 */
export async function confirmTransaction(context: BrowserContext): Promise<void> {
  // 等待 MetaMask 交易确认窗口
  console.log('⏳ 等待 MetaMask 交易弹窗...');
  const metamaskPage = await context.waitForEvent('page', { timeout: 30000 });
  await metamaskPage.waitForLoadState('domcontentloaded');
  
  // 直接等待确认按钮出现（不盲目等待，避免页面在等待期间关闭）
  console.log('⏳ 等待确认按钮出现...');
  await metamaskPage.waitForSelector('[data-testid="confirm-footer-button"]', { timeout: 20000 });
  
  // 稍微等待一下让页面稳定,增加等待时间
  await metamaskPage.waitForTimeout(2000);
  
  // 检查按钮文本，如果是"查看提醒"则取消
  const buttonText = await metamaskPage.textContent('[data-testid="confirm-footer-button"]');
  console.log(`  ℹ️  确认按钮文本: ${buttonText}`);
  
  if (buttonText?.includes('查看提醒') || buttonText?.includes('View alert')) {
    console.log('⚠️  检测到提醒，点击取消按钮...');
    await metamaskPage.waitForSelector('[data-testid="confirm-footer-cancel-button"]', { timeout: 5000 });
    await metamaskPage.click('[data-testid="confirm-footer-cancel-button"]');
    await metamaskPage.waitForTimeout(1000);
    throw new Error('Transaction alert detected,需要重试');
  }
  
  // 确认交易
  console.log('✅ 点击确认交易...');
  await metamaskPage.click('[data-testid="confirm-footer-button"]');
  
  // 点击后 MetaMask 弹窗会自动关闭，不要再操作 MetaMask 页面
  // 回到应用页面等待交易响应
  console.log('🎉 交易已确认！MetaMask 弹窗已自动关闭');
}

/**
 * 切换网络
 */
export async function switchNetwork(page: Page, networkName: string): Promise<void> {
  // 打开网络选择器
  await page.click('[data-testid="network-display"]');
  
  // 选择网络
  await page.click(`text=${networkName}`);
  
  await page.waitForTimeout(2000);
}

/**
 * 添加自定义网络
 */
export async function addNetwork(
  page: Page,
  networkName: string,
  rpcUrl: string,
  chainId: number,
  symbol: string
): Promise<void> {
  // 打开设置
  await page.click('[data-testid="account-options-menu-button"]');
  await page.click('[data-testid="global-menu-settings"]');
  
  // 进入网络设置
  await page.click('text=Networks');
  await page.click('[data-testid="networks-tab-add-network"]');
  
  // 填写网络信息
  await page.fill('[data-testid="network-form-network-name"]', networkName);
  await page.fill('[data-testid="network-form-rpc-url"]', rpcUrl);
  await page.fill('[data-testid="network-form-chain-id"]', chainId.toString());
  await page.fill('[data-testid="network-form-ticker-input"]', symbol);
  
  // 保存
  await page.click('[data-testid="network-form-footer-save"]');
  
  await page.waitForTimeout(2000);
}
