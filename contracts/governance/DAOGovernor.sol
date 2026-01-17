// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title DAOGovernor
 * @dev Main governance contract for the DAO
 * @notice This contract manages proposal creation, voting, and execution for the DAO
 * It integrates with both the GovernanceToken and StakingVault for voting power
 */
contract DAOGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /// @notice Reference to the staking vault for additional voting power
    address public stakingVault;

    /// @notice Emitted when a proposal is created
    event ProposalCreatedWithDetails(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 proposalSnapshot,
        uint256 proposalDeadline
    );

    /// @notice Emitted when the staking vault is updated
    event StakingVaultUpdated(address indexed oldVault, address indexed newVault);

    /**
     * @dev Constructor to initialize the governor
     * @param _token Address of the governance token (IVotes)
     * @param _timelock Address of the timelock controller
     * @param _stakingVault Address of the staking vault
     * @param _votingDelay Delay in blocks before voting starts
     * @param _votingPeriod Duration in blocks for voting
     * @param _proposalThreshold Minimum tokens needed to create proposal
     * @param _quorumPercentage Percentage of total supply needed for quorum (e.g., 4 for 4%)
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        address _stakingVault,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    )
        Governor("DAO Governor")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {
        require(_stakingVault != address(0), "Invalid staking vault address");
        stakingVault = _stakingVault;
    }

    /**
     * @notice Create a new proposal
     * @param targets Array of target addresses for proposal calls
     * @param values Array of ETH values for each call
     * @param calldatas Array of function call data
     * @param description Text description of the proposal
     * @return proposalId ID of the created proposal
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        uint256 proposalId = super.propose(targets, values, calldatas, description);

        emit ProposalCreatedWithDetails(
            proposalId,
            msg.sender,
            description,
            proposalSnapshot(proposalId),
            proposalDeadline(proposalId)
        );

        return proposalId;
    }

    /**
     * @notice Update the staking vault address
     * @dev Only the timelock (via governance) can call this
     * @param _newStakingVault New staking vault address
     */
    function updateStakingVault(address _newStakingVault) external onlyGovernance {
        require(_newStakingVault != address(0), "Invalid staking vault address");
        address oldVault = stakingVault;
        stakingVault = _newStakingVault;
        emit StakingVaultUpdated(oldVault, _newStakingVault);
    }

    /**
     * @notice Get the voting power of an account including staking vault
     * @dev This combines voting power from token delegation and staking vault
     * @param account Address to check voting power for
     * @param blockNumber Block number to check voting power at
     * @return Total voting power
     */
    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(Governor)
        returns (uint256)
    {
        // Get voting power from token delegation
        uint256 tokenVotes = super.getVotes(account, blockNumber);

        // Get voting power from staking vault (current block only)
        uint256 stakingVotes = 0;
        if (blockNumber == block.number && stakingVault != address(0)) {
            try IStakingVault(stakingVault).getVotingPower(account) returns (uint256 vp) {
                stakingVotes = vp;
            } catch {
                // If call fails, staking votes remain 0
            }
        }

        return tokenVotes + stakingVotes;
    }

    // Required overrides

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
}

/**
 * @title IStakingVault
 * @dev Interface for the staking vault
 */
interface IStakingVault {
    function getVotingPower(address user) external view returns (uint256);
}
