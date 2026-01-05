const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const path = require('path')

;(async function chromeTest() {
  console.log('开始测试 Chrome...')

  // 设置 Chrome 驱动路径
  const chromeDriverPath = path.join(__dirname, '..', '..', 'chromedriver.exe')
  console.log('ChromeDriver 路径:', chromeDriverPath)

  // 配置 Chrome 选项
  const options = new chrome.Options()
  options.addArguments('--disable-gpu')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')

  let driver
  try {
    console.log('正在启动 Chrome 浏览器...')

    // 设置 ChromeDriver 路径
    const service = new chrome.ServiceBuilder(chromeDriverPath)

    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).setChromeService(service).build()

    console.log('Chrome 浏览器启动成功！')
    console.log('正在访问 Google...')

    await driver.get('https://www.google.com/ncr')
    console.log('页面加载完成')

    console.log('正在搜索...')
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)

    console.log('等待搜索结果...')
    // 等待 URL 变化而不是标题
    await driver.wait(until.urlContains('search'), 10000)

    console.log('✅ Chrome 测试成功完成！')
  } catch (error) {
    console.error('❌ Chrome 测试失败:')
    console.error('错误类型:', error.name)
    console.error('错误信息:', error.message)
    if (error.stack) {
      console.error('错误堆栈:', error.stack.split('\n').slice(0, 5).join('\n'))
    }
  } finally {
    if (driver) {
      console.log('正在关闭浏览器...')
      try {
        await driver.quit()
        console.log('浏览器已关闭')
      } catch (quitError) {
        console.error('关闭浏览器时出错:', quitError.message)
      }
    }
  }
})()
