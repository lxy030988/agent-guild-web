// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title StUSDC
 * @dev 可铸造的质押凭证代币
 */
contract StUSDC is ERC20 {
    constructor() ERC20("Staked USDC", "stUSDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/**
 * @title LiquidStakingWithDynamicAPY
 * @dev 流动性质押合约，APY根据实际收益动态计算
 *
 * 核心机制：
 * - 任何人都可以向合约转入奖励（模拟验证节点收益）
 * - APY = (累计奖励 / 总质押 / 时间) * 年化系数
 * - 用户质押USDC获得stUSDC，stUSDC价值随奖励自动增长
 */
contract LiquidStakingWithDynamicAPY is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    IERC20 public immutable stakingToken;  // USDC
    StUSDC public immutable receiptToken;   // stUSDC

    // 核心指标
    uint256 public totalShares;             // 总份额
    uint256 public totalAssets;             // 总资产（USDC本金）
    uint256 public totalRewardsAccumulated; // 累计分配的奖励（用于计算APY）
    uint256 public lastAPYUpdateTime;       // 上次APY计算时间

    // APY计算
    uint256 public currentAPY;              // 当前APY（18位精度）
    uint256 public constant APY_PRECISION = 1e18;  // APY精度

    // 赎回队列
    struct WithdrawalRequest {
        address user;
        uint256 shares;
        uint256 timestamp;
    }
    WithdrawalRequest[] public withdrawalQueue;
    uint256 public pendingWithdrawalShares;

    // 常量
    uint256 public constant COOLDOWN_PERIOD = 7 days;
    uint256 public constant MIN_STAKE_AMOUNT = 1e6;  // 最小1 USDC
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // 事件
    event Staked(address indexed user, uint256 usdcAmount, uint256 stUsdcAmount);
    event WithdrawRequested(address indexed user, uint256 stUsdcAmount, uint256 usdcAmount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 usdcAmount);
    event RewardReceived(uint256 amount, address indexed funder);
    event RewardClaimed(address indexed user, uint256 reward);
    event APYUpdated(uint256 oldAPY, uint256 newAPY, uint256 totalStaked, uint256 totalRewards);
    
    // 错误
    error InvalidAmount();
    error InsufficientBalance();
    error CooldownNotEnded();
    error ContractPaused();
    error ZeroAddress();
    error AmountTooSmall();

    constructor(
        address _stakingToken,
        uint256 _initialAPY,  // 初始APY，例如 500 表示 5%
        address _owner
    ) {
        if (_stakingToken == address(0)) revert ZeroAddress();
        stakingToken = IERC20(_stakingToken);
        receiptToken = new StUSDC();
        
        if (_owner != address(0)) {
            transferOwnership(_owner);
        }
        
        currentAPY = _initialAPY;
        lastAPYUpdateTime = block.timestamp;
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @dev 获取当前汇率：1 stUSDC = ? USDC
     */
    function getExchangeRate() public view returns (uint256) {
        if (totalShares == 0) return 1e18;
        // 汇率 = (本金 + 累计奖励) / 份额
        uint256 totalValue = totalAssets + getPendingRewards();
        return (totalValue * 1e18) / totalShares;
    }

    /**
     * @dev 计算质押指定USDC可获得的stUSDC数量
     */
    function getStUsdcAmount(uint256 usdcAmount) public view returns (uint256) {
        if (totalShares == 0) return usdcAmount;
        return (usdcAmount * totalShares) / totalAssets;
    }

    /**
     * @dev 计算指定stUSDC可赎回的USDC数量
     */
    function getUsdcAmount(uint256 stUsdcAmount) public view returns (uint256) {
        if (totalShares == 0) return stUsdcAmount;
        uint256 totalValue = totalAssets + getPendingRewards();
        return (stUsdcAmount * totalValue) / totalShares;
    }

    /**
      * @dev 获取当前APY（18位精度，例如 8.5% = 0.085 = 8.5e16）
      * 例如：5% APY = 0.05 * 1e18 = 5e16
      */
    function getCurrentAPY() public view returns (uint256) {
        return currentAPY;
    }

    /**
     * @dev 获取APY百分比（显示用）
     */
    function getCurrentAPYPercent() public view returns (uint256) {
        // 简单返回，实际精度在前端处理
        return currentAPY;
    }

    /**
     * @dev 获取用户可领取的奖励
     */
    function getClaimableRewards(address user) public view returns (uint256) {
        uint256 userShares = receiptToken.balanceOf(user);
        if (userShares == 0 || totalShares == 0) return 0;
        
        // 计算用户的份额占比
        uint256 userShareRatio = (userShares * 1e18) / totalShares;
        
        // 可领取奖励 = 用户份额占比 * 累计未分配奖励
        uint256 pending = getPendingRewards();
        return (pending * userShareRatio) / 1e18;
    }

    /**
     * @dev 获取待分配的奖励（刚转入还未分配给用户）
     */
    function getPendingRewards() public view returns (uint256) {
        uint256 contractBalance = stakingToken.balanceOf(address(this));
        uint256 reservedForWithdrawals = (pendingWithdrawalShares * totalAssets) / totalShares;
        
        if (contractBalance <= totalAssets + reservedForWithdrawals) {
            return 0;
        }
        return contractBalance - totalAssets - reservedForWithdrawals;
    }

    // ===== MUTATIVE FUNCTIONS =====

    /**
     * @dev 质押USDC，获得stUSDC
     */
    function stake(uint256 usdcAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 stUsdcAmount)
    {
        if (usdcAmount == 0) revert InvalidAmount();
        if (usdcAmount < MIN_STAKE_AMOUNT) revert AmountTooSmall();

        stakingToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        if (totalShares == 0) {
            // 第一个质押者
            stUsdcAmount = usdcAmount;
            totalShares = usdcAmount;
        } else {
            // 根据当前汇率计算
            stUsdcAmount = (usdcAmount * totalShares) / totalAssets;
            if (stUsdcAmount == 0) revert AmountTooSmall();
            totalShares += stUsdcAmount;
        }

        totalAssets += usdcAmount;
        receiptToken.mint(msg.sender, stUsdcAmount);

        emit Staked(msg.sender, usdcAmount, stUsdcAmount);
        return stUsdcAmount;
    }

    /**
     * @dev 请求赎回，锁定stUSDC，进入冷却期
     */
    function requestWithdraw(uint256 stUsdcAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 usdcAmount)
    {
        if (stUsdcAmount == 0) revert InvalidAmount();
        if (stUsdcAmount > receiptToken.balanceOf(msg.sender)) revert InsufficientBalance();

        usdcAmount = getUsdcAmount(stUsdcAmount);

        receiptToken.burn(msg.sender, stUsdcAmount);
        totalShares -= stUsdcAmount;

        withdrawalQueue.push(WithdrawalRequest({
            user: msg.sender,
            shares: stUsdcAmount,
            timestamp: block.timestamp + COOLDOWN_PERIOD
        }));
        pendingWithdrawalShares += stUsdcAmount;

        emit WithdrawRequested(msg.sender, stUsdcAmount, usdcAmount, block.timestamp + COOLDOWN_PERIOD);
        return usdcAmount;
    }

    /**
     * @dev 赎回期结束，领取USDC
     */
    function claimWithdraw(uint256 requestId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 usdcAmount)
    {
        if (requestId >= withdrawalQueue.length) revert InvalidAmount();
        
        WithdrawalRequest storage request = withdrawalQueue[requestId];
        if (request.user != msg.sender) revert InsufficientBalance();
        if (block.timestamp < request.timestamp) revert CooldownNotEnded();
        
        usdcAmount = getUsdcAmount(request.shares);
        request.shares = 0;
        
        stakingToken.safeTransfer(msg.sender, usdcAmount);
        totalAssets -= usdcAmount;
        pendingWithdrawalShares -= request.shares;

        emit Withdrawn(msg.sender, usdcAmount);
        return usdcAmount;
    }

    /**
     * @dev 领取累积的奖励
     */
    function claimRewards() 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 reward)
    {
        reward = getClaimableRewards(msg.sender);
        if (reward == 0) revert InvalidAmount();
        
        // 将奖励从未分配池转移到用户
        uint256 pending = getPendingRewards();
        uint256 userShare = (receiptToken.balanceOf(msg.sender) * 1e18) / totalShares;
        uint256 rewardShare = (pending * userShare) / 1e18;
        
        totalRewardsAccumulated += rewardShare;
        
        stakingToken.safeTransfer(msg.sender, rewardShare);
        emit RewardClaimed(msg.sender, rewardShare);
        
        // 更新APY
        _updateAPY();
        
        return rewardShare;
    }

    // ===== REWARD FUNCTIONS =====

    /**
     * @dev 转入奖励到合约（模拟验证节点收益）
     * 任何人都可以调用，模拟从验证节点获得的收益
     */
    function addRewards(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool)
    {
        if (amount == 0) revert InvalidAmount();
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit RewardReceived(amount, msg.sender);
        
        // 更新APY
        _updateAPY();
        
        return true;
    }

    /**
     * @dev 更新APY（基于实际奖励和质押量）
     */
    function _updateAPY() internal {
        if (totalShares == 0) return;
        
        uint256 timeElapsed = block.timestamp - lastAPYUpdateTime;
        if (timeElapsed < 1 hours) return;  // 每小时最多更新一次
        
        uint256 pending = getPendingRewards();
        if (pending == 0) return;
        
        uint256 oldAPY = currentAPY;
        
        // APY = (新增奖励 / 总质押 / 时间) * 年化系数
        // 新增奖励相对于总价值的比率
        uint256 totalValue = totalAssets + pending;
        uint256 rewardRatio = (pending * 1e18) / totalValue;
        
        // 年化收益率
        uint256 annualizedRewardRatio = (rewardRatio * SECONDS_PER_YEAR) / timeElapsed;
        
        // 平滑处理：新APY = 旧APY * 0.7 + 计算APY * 0.3
        currentAPY = (oldAPY * 7e17 + annualizedRewardRatio * 3e17) / 1e18;
        
        lastAPYUpdateTime = block.timestamp;
        
        emit APYUpdated(oldAPY, currentAPY, totalAssets, totalRewardsAccumulated);
    }

    /**
     * @dev 强制更新APY（可被任何人调用）
     */
    function updateAPY() external {
        _updateAPY();
    }

    // ===== ADMIN FUNCTIONS =====

    /**
     * @dev 设置初始APY（仅在部署时）
     */
    function setInitialAPY(uint256 newAPY) external onlyOwner {
        require(totalShares == 0, "Already has stakers");
        require(newAPY > 0 && newAPY <= 1e18, "Invalid APY");
        currentAPY = newAPY;
    }

    /**
     * @dev 紧急暂停
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev 紧急提取（仅提取多余的代币）
     */
    function emergencyWithdraw(IERC20 token, uint256 amount) external onlyOwner {
        uint256 contractBalance = token.balanceOf(address(this));
        uint256 reserved = 0;
        
        if (address(token) == address(stakingToken)) {
            uint256 reservedForWithdrawals = (pendingWithdrawalShares * totalAssets) / totalShares;
            reserved = totalAssets + reservedForWithdrawals;
        }
        
        require(contractBalance - reserved >= amount, "Cannot withdraw reserved");
        token.safeTransfer(owner(), amount);
    }

    // ===== VIEW FUNCTIONS FOR FRONTEND =====

    /**
     * @dev 获取用户完整信息
     */
    function getUserInfo(address user) external view returns (
        uint256 usdcBalance,
        uint256 stUsdcBalance,
        uint256 claimableRewards,
        uint256 exchangeRate,
        uint256 apy,
        uint256 totalStaked
    ) {
        usdcBalance = stakingToken.balanceOf(user);
        stUsdcBalance = receiptToken.balanceOf(user);
        claimableRewards = getClaimableRewards(user);
        exchangeRate = getExchangeRate();
        apy = getCurrentAPY();
        totalStaked = totalAssets;
    }
}
