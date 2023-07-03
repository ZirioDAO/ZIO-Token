// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZioRewardPool is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address;

    mapping(address => uint256) public rewards;

    // address private stakeToken
    // constructor(Token _tokenAddress) {
    // function transferToken()
    // function stake(uint256 amount)
    // function withdraw(uint256 amount)
    // function getReward
}
