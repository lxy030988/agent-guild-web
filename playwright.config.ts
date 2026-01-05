import { defineConfig, devices } from "@playwright/test"
import { config as dotenvConfig } from "dotenv"
import path from "path"

// 加载 .env.test 环境变量
dotenvConfig({ path: path.resolve(__dirname, ".env.test") })

/**
 * Playwright 配置文件
 * 用于红包系统的 E2E 自动化测试
 */
export default defineConfig({
	// 测试目录
	testDir: "./tests/e2e/specs",

	// 测试文件匹配模式
	testMatch: "**/*.spec.ts",

	// 全局超时设置
	timeout: 60 * 1000, // 60 秒

	// expect 超时
	expect: {
		timeout: 10 * 1000, // 10 秒
	},

	// 测试失败时的重试次数
	fullyParallel: false, // MetaMask 测试建议串行执行
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,

	// 并行 worker 数量
	workers: 1, // MetaMask 测试建议单个 worker

	// 报告配置
	reporter: [
		["html", { outputFolder: "docs/playwright-report", open: "never" }],
		["list"],
		["json", { outputFile: "docs/playwright-report/results.json" }],
	],

	// 全局设置
	use: {
		// 基础 URL
		baseURL: "http://localhost:3000",

		// 截图设置
		screenshot: "only-on-failure",

		// 视频设置
		video: "retain-on-failure",

		// 追踪设置
		trace: "on-first-retry",

		// 浏览器上下文选项
		viewport: { width: 1280, height: 720 },

		// 忽略 HTTPS 错误
		ignoreHTTPSErrors: true,

		// 操作超时
		actionTimeout: 15 * 1000,

		// 导航超时
		navigationTimeout: 30 * 1000,
	},

	// 项目配置
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// Chrome 特定配置
				launchOptions: {
					args: [
						"--disable-blink-features=AutomationControlled", // 避免被检测为自动化
					],
				},
			},
		},
	],

	// Web 服务器配置 - 复用已运行的服务器
	webServer: {
		command: "pnpm run server",
		url: "http://localhost:3000",
		reuseExistingServer: true, // 总是复用现有服务器
		timeout: 120 * 1000, // 2 分钟启动超时
	},
})
