// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {

  constructor() ERC20("TestToken", "TST") {
    _mint(msg.sender, 10000 * 10 ** decimals());
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burn(uint256 amount) public onlyOwner {
    _burn(msg.sender, amount);
  }
}