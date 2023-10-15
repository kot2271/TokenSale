// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDToken is ERC20, Ownable {
    uint8 private _decimals;

  constructor() ERC20("USDToken", "USD") {
    _decimals = 6;
    _mint(msg.sender, 10000 * 10 ** _decimals);
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burn(uint256 amount) public onlyOwner {
    _burn(msg.sender, amount);
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }
}