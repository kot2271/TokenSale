import { task } from "hardhat/config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ICO_CONTRACT_NAME = "ICO";
let user: SignerWithAddress;

task("getAvailableAmount", "Get available tokens for claiming")
  .addParam("ico", "ICO contract address")
  .addParam("user", "User address")
  .setAction(async ({ ico, user }, { ethers }) => {
    const ICO = await ethers.getContractFactory(ICO_CONTRACT_NAME);
    const icoContract = ICO.attach(ico);

    const amount = await icoContract.getAvailableAmount(user);
    const etherAmount = ethers.utils.formatEther(amount);

    console.log(`Available to claim: ${etherAmount} 'TST' tokens`);
  });