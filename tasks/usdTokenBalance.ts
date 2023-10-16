import { task } from "hardhat/config";

const USD_TOKEN_NAME = "USDToken";

task("usdTokenBalance", "Get USDToken balance")
  .addParam("token", "USDToken contract address")
  .addParam("user", "User contract address")
  .setAction(async ({ token,  user}, { ethers }) => {
    const USDToken = await ethers.getContractFactory(USD_TOKEN_NAME);
    const usdToken = USDToken.attach(token);

    const balance = await usdToken.balanceOf(user);
    const etherBalance = ethers.utils.formatUnits(balance, 6);
    
    console.log(`USDToken balance: ${etherBalance}`);
});