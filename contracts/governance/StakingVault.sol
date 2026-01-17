// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingVault
 * @dev Staking contract with lock periods and voting power multipliers
 * @notice Users can stake tokens with different lock periods to earn voting power multipliers
 */
contract StakingVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice The governance token to be staked
    IERC20 public immutable stakingToken;

    /// @notice Lock period durations in seconds
    enum LockPeriod {
        NONE,      // 0 days - 1x multiplier
        SHORT,     // 30 days - 1.5x multiplier
        MEDIUM,    // 90 days - 2x multiplier
        LONG       // 180 days - 3x multiplier
    }

    /// @notice Stake information for each user
    struct Stake {
        uint256 amount;           // Amount of tokens staked
        uint256 startTime;        // Timestamp when stake was created
        LockPeriod lockPeriod;    // Lock period chosen
        bool withdrawn;           // Whether the stake has been withdrawn
    }

    /// @notice Mapping of user address to their stakes
    mapping(address => Stake[]) public userStakes;

    /// @notice Total tokens staked in the contract
    uint256 public totalStaked;

    /// @notice Lock period durations in seconds
    uint256 public constant LOCK_NONE = 0;
    uint256 public constant LOCK_SHORT = 30 days;
    uint256 public constant LOCK_MEDIUM = 90 days;
    uint256 public constant LOCK_LONG = 180 days;

    /// @notice Voting power multipliers (scaled by 100 for precision)
    uint256 public constant MULTIPLIER_NONE = 100;    // 1x
    uint256 public constant MULTIPLIER_SHORT = 150;   // 1.5x
    uint256 public constant MULTIPLIER_MEDIUM = 200;  // 2x
    uint256 public constant MULTIPLIER_LONG = 300;    // 3x

    /// @notice Emitted when a user stakes tokens
    event Staked(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount,
        LockPeriod lockPeriod,
        uint256 unlockTime
    );

    /// @notice Emitted when a user unstakes tokens
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount);

    /// @notice Emitted when a user withdraws staked tokens
    event Withdrawn(address indexed user, uint256 indexed stakeId, uint256 amount);

    /**
     * @dev Constructor to initialize the staking vault
     * @param _stakingToken Address of the token to be staked
     */
    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token address");
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @notice Stake tokens with a specified lock period
     * @param amount Amount of tokens to stake
     * @param lockPeriod Lock period for the stake
     */
    function stake(uint256 amount, LockPeriod lockPeriod) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");
        require(uint256(lockPeriod) <= uint256(LockPeriod.LONG), "Invalid lock period");

        // Transfer tokens from user to this contract
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        // Create new stake
        Stake memory newStake = Stake({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            withdrawn: false
        });

        userStakes[msg.sender].push(newStake);
        totalStaked += amount;

        uint256 stakeId = userStakes[msg.sender].length - 1;
        uint256 unlockTime = block.timestamp + getLockDuration(lockPeriod);

        emit Staked(msg.sender, stakeId, amount, lockPeriod, unlockTime);
    }

    /**
     * @notice Unstake tokens after lock period expires
     * @param stakeId ID of the stake to unstake
     */
    function unstake(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        Stake storage userStake = userStakes[msg.sender][stakeId];

        require(!userStake.withdrawn, "Stake already withdrawn");
        require(isUnlocked(msg.sender, stakeId), "Stake is still locked");

        uint256 amount = userStake.amount;
        userStake.withdrawn = true;
        totalStaked -= amount;

        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, stakeId, amount);
        emit Withdrawn(msg.sender, stakeId, amount);
    }

    /**
     * @notice Get the voting power for a specific stake
     * @param user Address of the user
     * @param stakeId ID of the stake
     * @return Voting power for the stake
     */
    function getStakeVotingPower(address user, uint256 stakeId) public view returns (uint256) {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        Stake memory userStake = userStakes[user][stakeId];

        if (userStake.withdrawn) {
            return 0;
        }

        uint256 multiplier = getMultiplier(userStake.lockPeriod);
        return (userStake.amount * multiplier) / 100;
    }

    /**
     * @notice Get the total voting power for a user across all stakes
     * @param user Address of the user
     * @return Total voting power
     */
    function getVotingPower(address user) external view returns (uint256) {
        uint256 totalVotingPower = 0;
        uint256 stakeCount = userStakes[user].length;

        for (uint256 i = 0; i < stakeCount; i++) {
            totalVotingPower += getStakeVotingPower(user, i);
        }

        return totalVotingPower;
    }

    /**
     * @notice Get the total amount staked by a user (excluding withdrawn stakes)
     * @param user Address of the user
     * @return Total staked amount
     */
    function getUserStakedAmount(address user) external view returns (uint256) {
        uint256 totalAmount = 0;
        uint256 stakeCount = userStakes[user].length;

        for (uint256 i = 0; i < stakeCount; i++) {
            if (!userStakes[user][i].withdrawn) {
                totalAmount += userStakes[user][i].amount;
            }
        }

        return totalAmount;
    }

    /**
     * @notice Get the number of stakes for a user
     * @param user Address of the user
     * @return Number of stakes
     */
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    /**
     * @notice Get stake information for a user
     * @param user Address of the user
     * @param stakeId ID of the stake
     * @return amount Amount staked
     * @return startTime Time when stake was created
     * @return lockPeriod Lock period of the stake
     * @return withdrawn Whether the stake has been withdrawn
     * @return unlockTime Time when stake can be withdrawn
     * @return votingPower Current voting power of the stake
     */
    function getStakeInfo(address user, uint256 stakeId)
        external
        view
        returns (
            uint256 amount,
            uint256 startTime,
            LockPeriod lockPeriod,
            bool withdrawn,
            uint256 unlockTime,
            uint256 votingPower
        )
    {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        Stake memory userStake = userStakes[user][stakeId];

        return (
            userStake.amount,
            userStake.startTime,
            userStake.lockPeriod,
            userStake.withdrawn,
            userStake.startTime + getLockDuration(userStake.lockPeriod),
            getStakeVotingPower(user, stakeId)
        );
    }

    /**
     * @notice Check if a stake is unlocked
     * @param user Address of the user
     * @param stakeId ID of the stake
     * @return True if stake is unlocked
     */
    function isUnlocked(address user, uint256 stakeId) public view returns (bool) {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        Stake memory userStake = userStakes[user][stakeId];

        uint256 unlockTime = userStake.startTime + getLockDuration(userStake.lockPeriod);
        return block.timestamp >= unlockTime;
    }

    /**
     * @notice Get the lock duration for a lock period
     * @param lockPeriod Lock period enum value
     * @return Duration in seconds
     */
    function getLockDuration(LockPeriod lockPeriod) public pure returns (uint256) {
        if (lockPeriod == LockPeriod.NONE) return LOCK_NONE;
        if (lockPeriod == LockPeriod.SHORT) return LOCK_SHORT;
        if (lockPeriod == LockPeriod.MEDIUM) return LOCK_MEDIUM;
        if (lockPeriod == LockPeriod.LONG) return LOCK_LONG;
        revert("Invalid lock period");
    }

    /**
     * @notice Get the voting power multiplier for a lock period
     * @param lockPeriod Lock period enum value
     * @return Multiplier scaled by 100
     */
    function getMultiplier(LockPeriod lockPeriod) public pure returns (uint256) {
        if (lockPeriod == LockPeriod.NONE) return MULTIPLIER_NONE;
        if (lockPeriod == LockPeriod.SHORT) return MULTIPLIER_SHORT;
        if (lockPeriod == LockPeriod.MEDIUM) return MULTIPLIER_MEDIUM;
        if (lockPeriod == LockPeriod.LONG) return MULTIPLIER_LONG;
        revert("Invalid lock period");
    }

    /**
     * @notice Emergency function to recover accidentally sent tokens
     * @dev Can only recover tokens other than the staking token
     * @param token Address of token to recover
     * @param amount Amount to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(stakingToken), "Cannot recover staking token");
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
