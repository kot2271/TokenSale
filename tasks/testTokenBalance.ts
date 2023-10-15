import { task } from "hardhat/config";

const TEST_TOKEN_NAME = "TestToken";

task("testTokenBalance", "Get TestToken balance")
  .addParam("token", "TestToken contract address")
  .addParam("user", "User contract address")
  .setAction(async ({ token,  user}, { ethers }) => {
    const TestToken = await ethers.getContractFactory(TEST_TOKEN_NAME);
    const testToken = TestToken.attach(token);

    const balance = await testToken.balanceOf(user);
    const etherBalance = ethers.utils.formatEther(balance);
    
    console.log(`TestToken balance: ${etherBalance}`);

});