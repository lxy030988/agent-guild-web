// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title IJobEscrow
 * @dev JobEscrow 合约的接口，用于锁定和释放资金
 */
interface IJobEscrow {
  function setDisputed(uint256 jobId) external;
  function resolveDisputedJob(uint256 jobId, uint256 agentAmount, uint256 ownerAmount) external;
  function getJob(
    uint256 jobId
  )
    external
    view
    returns (
      uint256 id,
      address payable owner,
      address payable agent,
      uint256 budget,
      uint256 deadline,
      uint8 status,
      bool exists
    );
}

/**
 * @title DisputeResolution
 * @dev DAO 争议解决合约
 */
contract DisputeResolution is Ownable, ReentrancyGuard {
  // ============================================
  // 数据模型
  // ============================================

  enum DisputeStatus {
    Pending,
    Voting,
    Resolved,
    Expired
  }
  enum VoteChoice {
    Approve,
    Reject,
    Abstain
  }

  struct Dispute {
    uint256 jobId;
    address creator;
    string evidenceHash;
    DisputeStatus status;
    uint256 votingStartsAt;
    uint256 votingEndsAt;
    uint256 approveVotesCount;
    uint256 rejectVotesCount;
    uint256 totalWeight;
    bool resolved;
  }

  struct Vote {
    VoteChoice choice;
    uint256 weight;
    bool exists;
  }

  // ============================================
  // 状态变量
  // ============================================

  IJobEscrow public jobEscrow;
  uint256 public nextDisputeId = 1;
  uint256 public votingPeriod = 7 days;

  mapping(uint256 => Dispute) public disputes;
  // disputeId => voter => Vote
  mapping(uint256 => mapping(address => Vote)) public votes;

  // ============================================
  // 事件
  // ============================================

  event DisputeCreated(uint256 indexed disputeId, uint256 indexed jobId, address indexed creator);
  event Voted(uint256 indexed disputeId, address indexed voter, VoteChoice choice, uint256 weight);
  event DisputeResolved(uint256 indexed disputeId, DisputeStatus finalStatus, string resolution);

  // ============================================
  // 构造函数
  // ============================================

  constructor(address _jobEscrow) Ownable(msg.sender) {
    jobEscrow = IJobEscrow(_jobEscrow);
  }

  // ============================================
  // 核心功能
  // ============================================

  /**
   * @notice 发起争议
   * @param _jobId 任务 ID
   * @param _evidenceHash 证据哈希 (IPFS)
   */
  function createDispute(uint256 _jobId, string calldata _evidenceHash) external nonReentrant {
    // 1. 获取任务信息并验证权限
    (, , , , , uint256 status, bool exists) = jobEscrow.getJob(_jobId);
    require(exists, 'Job missing');
    // 3 != Completed, 4 != Cancelled (对应 JobEscrow 的逻辑)
    // 这里我们放宽限制，只要任务还在进行中且未完成，就可以发起争议
    require(status < 4, 'Job already finalized');

    // 2. 锁定资金
    jobEscrow.setDisputed(_jobId);

    // 3. 创建争议记录
    uint256 disputeId = nextDisputeId++;
    disputes[disputeId] = Dispute({
      jobId: _jobId,
      creator: msg.sender,
      evidenceHash: _evidenceHash,
      status: DisputeStatus.Voting,
      votingStartsAt: block.timestamp,
      votingEndsAt: block.timestamp + votingPeriod,
      approveVotesCount: 0,
      rejectVotesCount: 0,
      totalWeight: 0,
      resolved: false
    });

    emit DisputeCreated(disputeId, _jobId, msg.sender);
  }

  /**
   * @notice 提交投票
   * @dev 简化版：目前每个钱包 1 票。未来可改为检查代币余额。
   */
  function vote(uint256 _disputeId, VoteChoice _choice) external nonReentrant {
    Dispute storage dispute = disputes[_disputeId];
    require(dispute.status == DisputeStatus.Voting, 'Not in voting period');
    require(block.timestamp < dispute.votingEndsAt, 'Voting ended');
    require(!votes[_disputeId][msg.sender].exists, 'Already voted');

    uint256 weight = 1; // 默认权重，后期可对接 governance token

    if (_choice == VoteChoice.Approve) {
      dispute.approveVotesCount += weight;
    } else if (_choice == VoteChoice.Reject) {
      dispute.rejectVotesCount += weight;
    }

    dispute.totalWeight += weight;
    votes[_disputeId][msg.sender] = Vote({ choice: _choice, weight: weight, exists: true });

    emit Voted(_disputeId, msg.sender, _choice, weight);
  }

  /**
   * @notice 解决争议并执行资金分配
   */
  function resolveDispute(uint256 _disputeId) external nonReentrant {
    Dispute storage dispute = disputes[_disputeId];
    require(dispute.status == DisputeStatus.Voting, 'Not in voting state');
    require(block.timestamp >= dispute.votingEndsAt, 'Voting not ended');
    require(!dispute.resolved, 'Already resolved');

    (, , , uint256 budget, , , ) = jobEscrow.getJob(dispute.jobId);

    uint256 agentAmount;
    uint256 ownerAmount;
    string memory resolution;

    if (dispute.approveVotesCount > dispute.rejectVotesCount) {
      // 支持方胜：Agent 获得全部
      agentAmount = budget;
      ownerAmount = 0;
      resolution = 'Approved: Agent receives full payment';
    } else if (dispute.rejectVotesCount > dispute.approveVotesCount) {
      // 反对方胜：Owner 获得全部退款
      agentAmount = 0;
      ownerAmount = budget;
      resolution = 'Rejected: Full refund to Owner';
    } else {
      // 平局：各占 50%
      agentAmount = budget / 2;
      ownerAmount = budget - agentAmount;
      resolution = 'Draw: 50/50 split';
    }

    dispute.resolved = true;
    dispute.status = DisputeStatus.Resolved;

    // 执行资金决议
    jobEscrow.resolveDisputedJob(dispute.jobId, agentAmount, ownerAmount);

    emit DisputeResolved(_disputeId, DisputeStatus.Resolved, resolution);
  }

  // ============================================
  // 管理功能
  // ============================================

  function setVotingPeriod(uint256 _period) external onlyOwner {
    votingPeriod = _period;
  }
}
