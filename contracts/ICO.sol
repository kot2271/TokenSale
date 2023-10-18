// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ICO is AccessControl {
    using SafeMath for uint256;
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
        _setupRole(ADMIN_ROLE, msg.sender);
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

        uint256 usdAmount = (amount.mul(price)).div(10**12);

        // Transfer USD to ico contract
        require(usdToken.transferFrom(msg.sender, address(this), usdAmount), "USD transfer failed");

        // Saving the purchase data
        purchasedAmounts[msg.sender] += amount;
        emit BuyToken(msg.sender, amount, usdAmount);
    }

    function withdrawTokens() external {
        uint256 available = getAvailableAmount(msg.sender);
        require(available > 0, "No 'TST' tokens to withdraw");

        require(testToken.transfer(msg.sender, available), "TST transfer failed");
        claimedAmounts[msg.sender] += available;
        emit Withdrawn(msg.sender, available);
    }

    function getAvailableAmount(address user) public view returns (uint256) {
        uint256 purchased = purchasedAmounts[user];
        uint256 claimed = claimedAmounts[user];
        
        // Checking periods
       if (block.timestamp < claim1Timestamp) {
            return 0;
        } else if (block.timestamp < claim2Timestamp) { 
            return (purchased.mul(10).div(100)).sub(claimed);
        } else if (block.timestamp < claim3Timestamp) {
            return (purchased.mul(30).div(100)).sub(claimed);
        } else if (block.timestamp < claim4Timestamp) {
            return (purchased.mul(50).div(100)).sub(claimed);
        } 
        else {
          return purchased.sub(claimed);
        }
    }

    function withdrawUSD() onlyRole(ADMIN_ROLE) external {
        uint256 usdBalance = usdToken.balanceOf(address(this));
        require(usdBalance > 0, "No 'USD' tokens to withdraw");
        require(usdToken.transfer(msg.sender, usdBalance), "USD transfer failed");
        emit Claimed(msg.sender, usdBalance);
    }
}