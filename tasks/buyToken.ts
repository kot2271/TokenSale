import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const ICO_CONTRACT_NAME = "ICO";

task("buyToken", "Buy tokens during ICO")
  .addParam("ico", "ICO contract address")
  .addParam("amount", "Amount of tokens to buy")
  .setAction(async ({ ico, amount }, { ethers }) => {
    const ICO = await ethers.getContractFactory(ICO_CONTRACT_NAME);
    const icoContract = ICO.attach(ico);

    const amountToBuy: BigNumber = ethers.utils.parseEther(amount.toString());

    const contractTx: ContractTransaction = await icoContract.buyToken(amountToBuy);
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'BuyToken');
    const user: Address = event?.args!['addr'];
    const tstAmount: BigNumber = event?.args!['tstAmount'];
    const usdAmount: BigNumber = event?.args!['usdAmount'];
    const etherTstAmount = ethers.utils.formatEther(tstAmount);
    const etherUsdAmount = ethers.utils.formatEther(usdAmount);

    console.log(`User ${user} bought ${etherTstAmount} 'TST' tokens for ${etherUsdAmount} 'USD'`);
  });