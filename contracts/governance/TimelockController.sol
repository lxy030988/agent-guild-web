// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title DAOTimelockController
 * @dev Timelock controller for the DAO
 * @notice This contract enforces a delay on governance actions to give stakeholders
 * time to review and react to proposals before they are executed
 */
contract DAOTimelockController is TimelockController {
    /**
     * @dev Constructor to initialize the timelock
     * @param minDelay Minimum delay in seconds before execution
     * @param proposers Array of addresses that can propose
     * @param executors Array of addresses that can execute (empty array = anyone can execute)
     * @param admin Optional admin address (use zero address to renounce admin)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
