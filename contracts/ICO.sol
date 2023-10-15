// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ICO is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public testToken;
    IERC20 public usdToken;

    uint256 public price = 2; // 1 TST = 2 USD
    uint256 public startTimestamp;
    uint256 public claim1Timestamp;
    uint256 public claim2Timestamp;
    uint256 public claim3Timestamp;
    uint256 public claim4Timestamp;

    uint256 public minPurchase = 10 * (10**18); // Minimum purchase is 10 TST
    uint256 public maxPurchase = 100 * (10**18); // Maximum purchase is 100 TST

    mapping(address => uint256) public purchasedAmounts;
    mapping(address => uint256) public claimedAmounts;

    event BuyToken(address indexed addr, uint256 tstAmount, uint256 usdAmount);
    event Withdrawn(address indexed addr, uint256 amount);
    event Claimed(address indexed addr, uint256 amount);

    constructor(address _testToken, address _usdToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        testToken = IERC20(_testToken);
        usdToken = IERC20(_usdToken);

        startTimestamp = block.timestamp;
        claim1Timestamp = startTimestamp + 30 days; // 30 days from the start
        claim2Timestamp = startTimestamp + 60 days; // 60 days from the start
        claim3Timestamp = startTimestamp + 90 days; // 90 days from the start
        claim4Timestamp = startTimestamp + 120 days; // 120 days from the start
    }

    function buyToken(uint256 amount) external {
        require(block.timestamp >= startTimestamp, "ICO has not started yet");
        require(block.timestamp < claim1Timestamp, "Claiming has started, you can't buy anymore");
        require(amount >= minPurchase, "Amount is less than the minimum purchase");
        require(amount <= maxPurchase, "Amount is more than the maximum purchase");

        uint256 usdAmount = (amount * price) / (10**12);

        require(usdToken.approve(address(this), usdAmount), "Approval to transfer USD failed");

        require(usdToken.transferFrom(msg.sender, address(this), usdAmount), "USD transfer failed");
        require(testToken.transfer(msg.sender, amount), "TST transfer failed");

        purchasedAmounts[msg.sender] += amount;
        emit BuyToken(msg.sender, amount, usdAmount);
    }

    function withdrawTokens() external {
        uint256 claimableAmount = getAvailableAmount(msg.sender);
        require(claimableAmount > 0, "No 'TST' tokens to withdraw");

        require(testToken.transfer(msg.sender, claimableAmount), "TST transfer failed");
        claimedAmounts[msg.sender] += claimableAmount;
        emit Withdrawn(msg.sender, claimableAmount);
    }

    function getAvailableAmount(address user) public view returns (uint256) {
        if (block.timestamp >= claim1Timestamp && block.timestamp < claim2Timestamp) {
            return (purchasedAmounts[user] * 10) / 100;
        } else if (block.timestamp >= claim2Timestamp && block.timestamp < claim3Timestamp) {
            return (purchasedAmounts[user] * 30) / 100;
        } else if (block.timestamp >= claim3Timestamp && block.timestamp < claim4Timestamp) {
            return (purchasedAmounts[user] * 50) / 100;
        } else if (block.timestamp >= claim4Timestamp) {
            return purchasedAmounts[user] - claimedAmounts[user];
        }
        return 0;
    }

    function withdrawUSD() onlyRole(ADMIN_ROLE) external {
        uint256 usdBalance = usdToken.balanceOf(address(this));
        require(usdBalance > 0, "No 'USD' tokens to withdraw");
        require(usdToken.transfer(msg.sender, usdBalance), "USD transfer failed");
        emit Claimed(msg.sender, usdBalance);
    }
}