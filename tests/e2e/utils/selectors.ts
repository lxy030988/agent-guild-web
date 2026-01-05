/**
 * 页面元素选择器
 * 用于 E2E 测试中定位页面元素
 */

export const selectors = {
  // 钱包相关
  wallet: {
    connectButton: 'button:has-text("连接 MetaMask")',
    address: '[data-testid="wallet-address"]',
    disconnectButton: 'button:has-text("断开连接")',
  },

  // 红包系统
  redPacket: {
    // 创建红包
    amountInput: '#amount',
    countInput: '#count',
    randomCheckbox: 'input[type="checkbox"]',
    createButton: 'button:has-text("发红包")',
    
    // 抢红包
    packetIdInput: '#packetId',
    claimButton: 'button:has-text("抢红包")',
    
    // 状态显示
    totalPackets: 'text=红包总数',
    myPackets: 'text=我创建的',
    claimedPackets: 'text=我领取的',
    
    // 通知
    notification: '.p-3.bg-gray-50.rounded.mb-2',
    
    // 红包卡片
    packetCard: '.p-4.bg-gray-50.rounded-lg.border',
    
    // 交易哈希
    transactionHash: 'text=交易哈希',
    successMessage: 'text=操作成功',
  },
} as const;
