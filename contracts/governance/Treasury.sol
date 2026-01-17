// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Treasury
 * @dev DAO treasury contract for managing ETH and ERC20 tokens
 * @notice This contract holds DAO funds and can only be controlled by governance
 * All fund transfers must be approved through governance proposals
 */
contract Treasury is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Address of the governance contract (timelock)
    address public governance;

    /// @notice Emitted when ETH is received
    event EthReceived(address indexed from, uint256 amount);

    /// @notice Emitted when ETH is withdrawn
    event EthWithdrawn(address indexed to, uint256 amount);

    /// @notice Emitted when ERC20 tokens are received
    event TokensReceived(address indexed token, address indexed from, uint256 amount);

    /// @notice Emitted when ERC20 tokens are withdrawn
    event TokensWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice Emitted when governance address is updated
    event GovernanceUpdated(address indexed oldGovernance, address indexed newGovernance);

    /// @notice Emitted when a proposal execution fails
    event ExecutionFailed(address indexed target, uint256 value, bytes data, string reason);

    /**
     * @dev Modifier to restrict function access to governance only
     */
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance can call this function");
        _;
    }

    /**
     * @dev Constructor to initialize the treasury
     * @param _governance Address of the governance contract (typically timelock)
     */
    constructor(address _governance) Ownable(msg.sender) {
        require(_governance != address(0), "Invalid governance address");
        governance = _governance;
    }

    /**
     * @notice Receive ETH into the treasury
     */
    receive() external payable {
        emit EthReceived(msg.sender, msg.value);
    }

    /**
     * @notice Fallback function to receive ETH
     */
    fallback() external payable {
        emit EthReceived(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw ETH from the treasury
     * @dev Only callable by governance
     * @param to Address to send ETH to
     * @param amount Amount of ETH to withdraw (in wei)
     */
    function withdrawEth(address payable to, uint256 amount) external onlyGovernance nonReentrant {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient ETH balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit EthWithdrawn(to, amount);
    }

    /**
     * @notice Withdraw ERC20 tokens from the treasury
     * @dev Only callable by governance
     * @param token Address of the ERC20 token
     * @param to Address to send tokens to
     * @param amount Amount of tokens to withdraw
     */
    function withdrawTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyGovernance nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 tokenContract = IERC20(token);
        require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient token balance");

        tokenContract.safeTransfer(to, amount);

        emit TokensWithdrawn(token, to, amount);
    }

    /**
     * @notice Execute arbitrary call from the treasury
     * @dev Only callable by governance. Allows governance to interact with external contracts
     * @param target Address to call
     * @param value ETH value to send with the call
     * @param data Calldata for the call
     * @return success Whether the call succeeded
     * @return returnData Return data from the call
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyGovernance nonReentrant returns (bool success, bytes memory returnData) {
        require(target != address(0), "Invalid target address");
        require(address(this).balance >= value, "Insufficient ETH balance");

        (success, returnData) = target.call{value: value}(data);

        if (!success) {
            // Extract revert reason if available
            string memory reason;
            if (returnData.length > 0) {
                assembly {
                    reason := add(returnData, 0x04)
                }
            } else {
                reason = "Unknown error";
            }
            emit ExecutionFailed(target, value, data, reason);
        }

        return (success, returnData);
    }

    /**
     * @notice Batch execute multiple calls from the treasury
     * @dev Only callable by governance. All calls must succeed or entire batch reverts
     * @param targets Array of addresses to call
     * @param values Array of ETH values for each call
     * @param calldatas Array of calldata for each call
     * @return successes Array of success flags for each call
     * @return returnDatas Array of return data from each call
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas
    )
        external
        onlyGovernance
        nonReentrant
        returns (bool[] memory successes, bytes[] memory returnDatas)
    {
        require(
            targets.length == values.length && targets.length == calldatas.length,
            "Array length mismatch"
        );
        require(targets.length > 0, "Empty batch");

        successes = new bool[](targets.length);
        returnDatas = new bytes[](targets.length);

        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i] != address(0), "Invalid target address");
            require(address(this).balance >= values[i], "Insufficient ETH balance");

            (bool success, bytes memory returnData) = targets[i].call{value: values[i]}(calldatas[i]);
            successes[i] = success;
            returnDatas[i] = returnData;

            if (!success) {
                string memory reason;
                if (returnData.length > 0) {
                    assembly {
                        reason := add(returnData, 0x04)
                    }
                } else {
                    reason = "Unknown error";
                }
                emit ExecutionFailed(targets[i], values[i], calldatas[i], reason);
                revert(string(abi.encodePacked("Batch execution failed at index ", uint2str(i))));
            }
        }

        return (successes, returnDatas);
    }

    /**
     * @notice Update the governance address
     * @dev Only callable by current governance
     * @param _newGovernance New governance address
     */
    function updateGovernance(address _newGovernance) external onlyGovernance {
        require(_newGovernance != address(0), "Invalid governance address");
        address oldGovernance = governance;
        governance = _newGovernance;
        emit GovernanceUpdated(oldGovernance, _newGovernance);
    }

    /**
     * @notice Get the ETH balance of the treasury
     * @return ETH balance in wei
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get the token balance of the treasury
     * @param token Address of the ERC20 token
     * @return Token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        require(token != address(0), "Invalid token address");
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Get multiple token balances at once
     * @param tokens Array of token addresses
     * @return balances Array of token balances
     */
    function getTokenBalances(address[] calldata tokens)
        external
        view
        returns (uint256[] memory balances)
    {
        balances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] != address(0)) {
                balances[i] = IERC20(tokens[i]).balanceOf(address(this));
            }
        }
        return balances;
    }

    /**
     * @notice Internal helper to convert uint to string
     * @param _i Uint to convert
     * @return _uintAsString String representation
     */
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Emergency function to recover accidentally sent tokens
     * @dev Only callable by owner (deployer), separate from governance
     * @param token Address of token to recover
     * @param amount Amount to recover
     */
    function emergencyRecoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Emergency function to recover ETH
     * @dev Only callable by owner (deployer), separate from governance
     * @param amount Amount of ETH to recover
     */
    function emergencyRecoverEth(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }
}
