// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';

/**
 * @title Wallet
 * @dev Agent Guild 平台的钱包合约
 *
 * 功能：
 * 1. 管理三个资金池：Agent 收益、质押金额、质押奖励
 * 2. Agent 收益由 JobEscrow 合约存入
 * 3. 用户可以质押 ETH 获得奖励
 * 4. 用户可以随时提现到个人钱包
 */
contract Wallet is ReentrancyGuard, Ownable, Pausable {
  // ============================================
  // 数据结构
  // ============================================

  /// @notice 用户余额结构
  struct UserBalance {
    uint256 agentEarnings; // Agent 任务收益余额
    uint256 stakingRewards; // 质押奖励余额（已结算）
    uint256 stakedAmount; // 已质押金额
    uint256 lastStakeTime; // 最后一次质押/结算时间
  }

  // ============================================
  // 状态变量
  // ============================================

  /// @notice 用户地址 => 余额信息
  mapping(address => UserBalance) public balances;

  /// @notice JobEscrow 合约地址（有权限调用 depositEarnings）
  address public jobEscrowContract;

  /// @notice 质押年化收益率（基点，10000 = 100%）
  uint256 public stakingAPR = 500; // 默认 5%

  /// @notice 最小质押金额
  uint256 public minStakeAmount = 0.01 ether;

  // ============================================
  // 事件
  // ============================================

  /// @notice 收益存入事件
  event EarningsDeposited(address indexed user, uint256 amount);

  /// @notice 质押事件
  event Staked(address indexed user, uint256 amount);

  /// @notice 取消质押事件
  event Unstaked(address indexed user, uint256 amount);

  /// @notice 质押奖励发放事件
  event StakingRewardDeposited(address indexed user, uint256 amount);

  /// @notice 提现事件
  event Withdrawn(address indexed user, uint256 amount, string source);

  /// @notice JobEscrow 合约地址更新事件
  event JobEscrowContractUpdated(address indexed oldContract, address indexed newContract);

  /// @notice 质押 APR 更新事件
  event StakingAPRUpdated(uint256 oldAPR, uint256 newAPR);

  // ============================================
  // 修饰符
  // ============================================

  /// @notice 只允许 JobEscrow 合约调用
  modifier onlyJobEscrow() {
    require(msg.sender == jobEscrowContract, 'Only JobEscrow can call this');
    _;
  }

  // ============================================
  // 构造函数
  // ============================================

  constructor() Ownable(msg.sender) {}

  // ============================================
  // 核心功能
  // ============================================

  /**
   * @notice 存入 Agent 收益（由 JobEscrow 合约调用）
   * @param user Agent 的钱包地址
   */
  function depositEarnings(address user) external payable onlyJobEscrow whenNotPaused {
    require(user != address(0), 'Invalid user address');
    require(msg.value > 0, 'Amount must be greater than zero');

    balances[user].agentEarnings += msg.value;

    emit EarningsDeposited(user, msg.value);
  }

  /**
   * @notice 用户质押 ETH
   * @dev 质押后开始计算收益，先结算之前的收益
   */
  function stake() external payable whenNotPaused {
    require(msg.value >= minStakeAmount, 'Stake amount too low');

    // 结算之前的质押收益
    _settlePendingRewards(msg.sender);

    balances[msg.sender].stakedAmount += msg.value;
    balances[msg.sender].lastStakeTime = block.timestamp;

    emit Staked(msg.sender, msg.value);
  }

  /**
   * @notice 取消质押
   * @param amount 取消质押的金额
   */
  function unstake(uint256 amount) external nonReentrant whenNotPaused {
    require(amount > 0, 'Amount must be greater than zero');
    require(balances[msg.sender].stakedAmount >= amount, 'Insufficient staked balance');

    // 先结算待领取的收益
    _settlePendingRewards(msg.sender);

    balances[msg.sender].stakedAmount -= amount;

    // 转账给用户
    (bool success, ) = msg.sender.call{ value: amount }('');
    require(success, 'Transfer failed');

    emit Unstaked(msg.sender, amount);
  }

  /**
   * @notice 计算待领取的质押奖励
   * @param user 用户地址
   * @return 待领取的奖励金额
   */
  function getPendingRewards(address user) public view returns (uint256) {
    UserBalance storage userBalance = balances[user];

    if (userBalance.stakedAmount == 0 || userBalance.lastStakeTime == 0) {
      return 0;
    }

    // 计算质押时长（秒）
    uint256 stakingDuration = block.timestamp - userBalance.lastStakeTime;

    // 年化收益率转换为每秒收益率: APR / 10000 / 365 / 24 / 3600
    // 为避免精度损失，先乘后除
    uint256 reward = (userBalance.stakedAmount * stakingAPR * stakingDuration) / (10000 * 365 * 24 * 3600);

    return reward;
  }

  /**
   * @notice 结算用户的待领取收益（内部函数）
   * @param user 用户地址
   */
  function _settlePendingRewards(address user) internal {
    uint256 pendingReward = getPendingRewards(user);

    if (pendingReward > 0) {
      balances[user].stakingRewards += pendingReward;
      emit StakingRewardDeposited(user, pendingReward);
    }

    // 更新最后结算时间
    balances[user].lastStakeTime = block.timestamp;
  }

  /**
   * @notice 提现（支持提现 Agent 收益或质押奖励）
   * @param amount 提现金额
   * @param source 提现来源：'earnings' 或 'rewards'
   */
  function withdraw(uint256 amount, string memory source) external nonReentrant whenNotPaused {
    require(amount > 0, 'Amount must be greater than zero');

    if (keccak256(bytes(source)) == keccak256(bytes('earnings'))) {
      require(balances[msg.sender].agentEarnings >= amount, 'Insufficient earnings balance');
      balances[msg.sender].agentEarnings -= amount;
    } else if (keccak256(bytes(source)) == keccak256(bytes('rewards'))) {
      require(balances[msg.sender].stakingRewards >= amount, 'Insufficient rewards balance');
      balances[msg.sender].stakingRewards -= amount;
    } else {
      revert('Invalid source');
    }

    // 转账给用户
    (bool success, ) = msg.sender.call{ value: amount }('');
    require(success, 'Transfer failed');

    emit Withdrawn(msg.sender, amount, source);
  }

  // ============================================
  // 查询功能
  // ============================================

  /**
   * @notice 获取用户余额信息（包含实时计算的待领取收益）
   * @param user 用户地址
   * @return UserBalance 用户余额结构体（stakingRewards 包含待领取部分）
   */
  function getBalance(address user) external view returns (UserBalance memory) {
    UserBalance memory userBalance = balances[user];

    // 添加待领取的奖励到 stakingRewards
    uint256 pendingReward = getPendingRewards(user);
    userBalance.stakingRewards += pendingReward;

    return userBalance;
  }

  /**
   * @notice 获取用户总余额（不包括已质押金额）
   * @param user 用户地址
   * @return uint256 总余额
   */
  function getTotalBalance(address user) external view returns (uint256) {
    return balances[user].agentEarnings + balances[user].stakingRewards;
  }

  /**
   * @notice 获取用户可提现余额
   * @param user 用户地址
   * @return uint256 可提现余额
   */
  function getWithdrawableBalance(address user) external view returns (uint256) {
    return balances[user].agentEarnings + balances[user].stakingRewards;
  }

  // ============================================
  // 管理功能（仅 Owner）
  // ============================================

  /**
   * @notice 设置 JobEscrow 合约地址
   * @param _jobEscrowContract JobEscrow 合约地址
   */
  function setJobEscrowContract(address _jobEscrowContract) external onlyOwner {
    require(_jobEscrowContract != address(0), 'Invalid contract address');

    address oldContract = jobEscrowContract;
    jobEscrowContract = _jobEscrowContract;

    emit JobEscrowContractUpdated(oldContract, _jobEscrowContract);
  }

  /**
   * @notice 设置质押年化收益率
   * @param _stakingAPR 新的 APR（基点）
   */
  function setStakingAPR(uint256 _stakingAPR) external onlyOwner {
    require(_stakingAPR <= 10000, 'APR cannot exceed 100%');

    uint256 oldAPR = stakingAPR;
    stakingAPR = _stakingAPR;

    emit StakingAPRUpdated(oldAPR, _stakingAPR);
  }

  /**
   * @notice 设置最小质押金额
   * @param _minStakeAmount 新的最小质押金额
   */
  function setMinStakeAmount(uint256 _minStakeAmount) external onlyOwner {
    minStakeAmount = _minStakeAmount;
  }

  /**
   * @notice 紧急暂停合约
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @notice 恢复合约运行
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  // ============================================
  // 接收 ETH
  // ============================================

  /// @notice 允许合约接收 ETH
  receive() external payable {}
}
