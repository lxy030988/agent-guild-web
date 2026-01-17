// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title GovernanceToken
 * @dev ERC20 token with voting capabilities for DAO governance
 * @notice This token implements OpenZeppelin's ERC20Votes for snapshot-based voting power
 * and includes delegation functionality for voting power management
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
  /// @notice Maximum supply cap for the token (100 million tokens)
  uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

  /// @notice Emitted when new tokens are minted
  event TokensMinted(address indexed to, uint256 amount);

  /// @notice Emitted when tokens are burned
  event TokensBurned(address indexed from, uint256 amount);

  /**
   * @dev Constructor to initialize the governance token
   * @param _name Token name
   * @param _symbol Token symbol
   * @param _initialSupply Initial supply to mint to deployer
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply
  ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(msg.sender) {
    require(_initialSupply <= MAX_SUPPLY, 'Initial supply exceeds max supply');
    if (_initialSupply > 0) {
      _mint(msg.sender, _initialSupply);
      emit TokensMinted(msg.sender, _initialSupply);
    }
  }

  /**
   * @notice Mint new tokens to a specified address
   * @dev Only owner can mint. Total supply cannot exceed MAX_SUPPLY
   * @param to Address to receive the minted tokens
   * @param amount Amount of tokens to mint
   */
  function mint(address to, uint256 amount) external onlyOwner {
    require(to != address(0), 'Cannot mint to zero address');
    require(totalSupply() + amount <= MAX_SUPPLY, 'Minting would exceed max supply');

    _mint(to, amount);
    emit TokensMinted(to, amount);
  }

  /**
   * @notice Burn tokens from caller's balance
   * @param amount Amount of tokens to burn
   */
  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
    emit TokensBurned(msg.sender, amount);
  }

  /**
   * @notice Burn tokens from a specified address (requires allowance)
   * @param from Address to burn tokens from
   * @param amount Amount of tokens to burn
   */
  function burnFrom(address from, uint256 amount) external {
    _spendAllowance(from, msg.sender, amount);
    _burn(from, amount);
    emit TokensBurned(from, amount);
  }

  /**
   * @notice Get the current voting power of an account
   * @param account Address to check voting power for
   * @return Current voting power (number of votes)
   */
  function getVotes(address account) public view override returns (uint256) {
    return super.getVotes(account);
  }

  /**
   * @notice Get the historical voting power of an account at a specific block
   * @param account Address to check voting power for
   * @param blockNumber Block number to check voting power at
   * @return Historical voting power at the specified block
   */
  function getPastVotes(address account, uint256 blockNumber) public view override returns (uint256) {
    return super.getPastVotes(account, blockNumber);
  }

  /**
   * @notice Get the total voting power at a specific block
   * @param blockNumber Block number to check total voting power at
   * @return Total voting power at the specified block
   */
  function getPastTotalSupply(uint256 blockNumber) public view override returns (uint256) {
    return super.getPastTotalSupply(blockNumber);
  }

  /**
   * @notice Delegate voting power to another address
   * @param delegatee Address to delegate votes to
   */
  function delegate(address delegatee) public override {
    super.delegate(delegatee);
  }

  /**
   * @notice Delegate voting power using a signature
   * @param delegatee Address to delegate votes to
   * @param nonce Nonce for replay protection
   * @param expiry Timestamp when signature expires
   * @param v ECDSA signature parameter
   * @param r ECDSA signature parameter
   * @param s ECDSA signature parameter
   */
  function delegateBySig(
    address delegatee,
    uint256 nonce,
    uint256 expiry,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public override {
    super.delegateBySig(delegatee, nonce, expiry, v, r, s);
  }

  // Required overrides for multiple inheritance

  function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._update(from, to, amount);
  }

  function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(owner);
  }
}
