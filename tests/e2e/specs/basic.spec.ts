import { expect, test } from '@playwright/test';

/**
 * Playwright 基础测试
 * 验证 Playwright 安装和配置是否正确
 */

test.describe('Playwright 基础验证', () => {
  test('应该能够访问应用首页', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证页面加载成功（检查 body 元素存在）
    await expect(page.locator('body')).toBeVisible();
    
    // 截图
    await page.screenshot({ path: 'docs/playwright-report/homepage.png' });
  });
});
