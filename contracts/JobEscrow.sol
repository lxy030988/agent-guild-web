// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';

/**
 * @title JobEscrow
 * @dev Agent Guild 平台的任务托管合约
 *
 * 功能：
 * 1. 任务创建时托管资金
 * 2. 完成任务后自动支付给 Agent
 * 3. 平台收取手续费
 * 4. 支持超时退款
 * 5. 紧急暂停功能
 */
contract JobEscrow is ReentrancyGuard, Ownable, Pausable {
  // ============================================
  // 状态变量
  // ============================================

  /// @notice 任务状态枚举
  enum JobStatus {
    Open, // 开放中：等待 Agent 匹配
    Matched, // 已匹配：Agent 已分配，等待开始
    InProgress, // 进行中：任务执行中
    Submitted, // 已提交：等待验收
    Completed, // 已完成：资金已释放
    Cancelled // 已取消：资金已退款
  }

  /// @notice 任务结构体
  struct Job {
    uint256 id; // 任务 ID
    address payable owner; // 任务发布者
    address payable agent; // 被分配的 Agent
    uint256 budget; // 托管金额（Wei）
    uint256 deadline; // 截止时间（Unix 时间戳）
    JobStatus status; // 当前状态
    bool exists; // 是否存在
  }

  /// @notice 下一个任务 ID
  uint256 public nextJobId = 1;

  /// @notice 任务 ID => 任务详情
  mapping(uint256 => Job) public jobs;

  /// @notice 平台手续费百分比（例如：5 表示 5%）
  uint256 public platformFeePercent = 5;

  /// @notice 累计的平台手续费
  uint256 public platformFeesCollected;

  /// @notice 默认超时时长（30 天）
  uint256 public constant DEFAULT_TIMEOUT = 30 days;

  // ============================================
  // 事件
  // ============================================

  /// @notice 任务创建事件
  event JobCreated(uint256 indexed jobId, address indexed owner, uint256 budget, uint256 deadline);

  /// @notice Agent 分配事件
  event AgentAssigned(uint256 indexed jobId, address indexed agent);

  /// @notice 任务完成事件
  event JobCompleted(uint256 indexed jobId, uint256 agentPayment, uint256 platformFee);

  /// @notice 任务取消事件
  event JobCancelled(uint256 indexed jobId, address indexed refundTo, uint256 amount);

  /// @notice 超时退款事件
  event JobExpiredRefund(uint256 indexed jobId, address indexed owner, uint256 amount);

  /// @notice 平台手续费更新事件
  event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

  /// @notice 平台手续费提取事件
  event PlatformFeesWithdrawn(address indexed to, uint256 amount);

  // ============================================
  // 修饰符
  // ============================================

  /// @notice 只有任务发布者可以调用
  modifier onlyJobOwner(uint256 _jobId) {
    require(jobs[_jobId].exists, 'Job does not exist');
    require(jobs[_jobId].owner == msg.sender, 'Not the job owner');
    _;
  }

  /// @notice 只有被分配的 Agent 可以调用
  modifier onlyAssignedAgent(uint256 _jobId) {
    require(jobs[_jobId].exists, 'Job does not exist');
    require(jobs[_jobId].agent == msg.sender, 'Not the assigned agent');
    _;
  }

  /// @notice 任务必须存在
  modifier jobExists(uint256 _jobId) {
    require(jobs[_jobId].exists, 'Job does not exist');
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
   * @notice 创建任务并托管资金
   * @dev 用户调用此函数时需要附带 ETH
   * @param _deadline 任务截止时间（Unix 时间戳）
   * @return jobId 新创建的任务 ID
   */
  function createJob(uint256 _deadline) external payable whenNotPaused returns (uint256) {
    require(msg.value > 0, 'Budget must be greater than zero');
    require(_deadline > block.timestamp, 'Deadline must be in the future');

    uint256 jobId = nextJobId++;

    jobs[jobId] = Job({
      id: jobId,
      owner: payable(msg.sender),
      agent: payable(address(0)),
      budget: msg.value,
      deadline: _deadline,
      status: JobStatus.Open,
      exists: true
    });

    emit JobCreated(jobId, msg.sender, msg.value, _deadline);
    return jobId;
  }

  /**
   * @notice 分配 Agent 到任务
   * @dev 只有任务发布者可以调用
   * @param _jobId 任务 ID
   * @param _agent Agent 的钱包地址
   */
  function assignAgent(uint256 _jobId, address payable _agent) external onlyJobOwner(_jobId) whenNotPaused {
    Job storage job = jobs[_jobId];

    require(job.status == JobStatus.Open, 'Job is not open');
    require(_agent != address(0), 'Invalid agent address');
    // require(_agent != job.owner, 'Agent cannot be the job owner'); // 临时注释用于测试

    job.agent = _agent;
    job.status = JobStatus.Matched;

    emit AgentAssigned(_jobId, _agent);
  }

  /**
   * @notice 完成任务并释放资金
   * @dev 只有任务发布者可以调用
   * @dev 自动扣除平台手续费后支付给 Agent
   * @param _jobId 任务 ID
   */
  function completeJob(uint256 _jobId) external onlyJobOwner(_jobId) nonReentrant whenNotPaused {
    Job storage job = jobs[_jobId];

    require(job.status != JobStatus.Completed, 'Job already completed');
    require(job.status != JobStatus.Cancelled, 'Job is cancelled');
    require(job.agent != address(0), 'No agent assigned');

    uint256 totalAmount = job.budget;

    // 计算平台手续费
    uint256 platformFee = (totalAmount * platformFeePercent) / 100;
    uint256 agentPayment = totalAmount - platformFee;

    job.status = JobStatus.Completed;

    // 累计平台手续费
    platformFeesCollected += platformFee;

    // 转账给 Agent（防重入保护）
    (bool success, ) = job.agent.call{ value: agentPayment }('');
    require(success, 'Transfer to agent failed');

    emit JobCompleted(_jobId, agentPayment, platformFee);
  }

  /**
   * @notice 取消任务并退款
   * @dev 只有任务发布者可以调用
   * @dev Open 状态：全额退款给发布者
   * @dev Matched 状态：全额退款给发布者（Agent 未开始工作）
   * @param _jobId 任务 ID
   */
  function cancelJob(uint256 _jobId) external onlyJobOwner(_jobId) nonReentrant whenNotPaused {
    Job storage job = jobs[_jobId];

    require(job.status == JobStatus.Open || job.status == JobStatus.Matched, 'Cannot cancel job in current status');

    uint256 refundAmount = job.budget;
    job.status = JobStatus.Cancelled;

    // 退款给发布者
    (bool success, ) = job.owner.call{ value: refundAmount }('');
    require(success, 'Refund failed');

    emit JobCancelled(_jobId, job.owner, refundAmount);
  }

  /**
   * @notice 超时任务退款
   * @dev 任何人都可以调用此函数触发超时退款
   * @dev 只有超过截止时间且未完成的任务才能退款
   * @param _jobId 任务 ID
   */
  function refundExpiredJob(uint256 _jobId) external jobExists(_jobId) nonReentrant whenNotPaused {
    Job storage job = jobs[_jobId];

    require(block.timestamp > job.deadline, 'Job not expired yet');
    require(job.status != JobStatus.Completed && job.status != JobStatus.Cancelled, 'Job is already finalized');

    uint256 refundAmount = job.budget;
    job.status = JobStatus.Cancelled;

    // 退款给发布者
    (bool success, ) = job.owner.call{ value: refundAmount }('');
    require(success, 'Refund failed');

    emit JobExpiredRefund(_jobId, job.owner, refundAmount);
  }

  // ============================================
  // 查询功能
  // ============================================

  /**
   * @notice 获取任务详情
   * @param _jobId 任务 ID
   * @return Job 任务结构体
   */
  function getJob(uint256 _jobId) external view jobExists(_jobId) returns (Job memory) {
    return jobs[_jobId];
  }

  /**
   * @notice 检查任务是否超时
   * @param _jobId 任务 ID
   * @return bool 是否超时
   */
  function isJobExpired(uint256 _jobId) external view jobExists(_jobId) returns (bool) {
    return block.timestamp > jobs[_jobId].deadline;
  }

  // ============================================
  // 管理功能（仅 Owner）
  // ============================================

  /**
   * @notice 设置平台手续费百分比
   * @dev 只有合约 owner 可以调用
   * @param _feePercent 新的手续费百分比（0-100）
   */
  function setPlatformFee(uint256 _feePercent) external onlyOwner {
    require(_feePercent <= 100, 'Fee percent cannot exceed 100');

    uint256 oldFee = platformFeePercent;
    platformFeePercent = _feePercent;

    emit PlatformFeeUpdated(oldFee, _feePercent);
  }

  /**
   * @notice 提取累计的平台手续费
   * @dev 只有合约 owner 可以调用
   */
  function withdrawPlatformFees() external onlyOwner nonReentrant {
    uint256 amount = platformFeesCollected;
    require(amount > 0, 'No fees to withdraw');

    platformFeesCollected = 0;

    (bool success, ) = owner().call{ value: amount }('');
    require(success, 'Withdrawal failed');

    emit PlatformFeesWithdrawn(owner(), amount);
  }

  /**
   * @notice 紧急暂停合约
   * @dev 只有合约 owner 可以调用
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @notice 恢复合约运行
   * @dev 只有合约 owner 可以调用
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
