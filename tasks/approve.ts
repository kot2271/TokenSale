import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const USD_TOKEN_NAME = "USDToken";

task("approve", "Approved to spend from a ico contract")
.addParam("usdToken", "USD token address")
.addParam("icoContract", "ICO contract address")
.addParam("amount", "ICO contract address")
.setAction(async ({ usdToken, icoContract, amount }, { ethers }) => {
    const USDToken = await ethers.getContractFactory(USD_TOKEN_NAME);
    const usdTokenContract = USDToken.attach(usdToken);

    const amountToBuy: BigNumber = ethers.utils.parseEther(amount.toString());
    const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10**12);

    const usdTx: ContractTransaction = await usdTokenContract.approve(icoContract, usdAmount);
    const usdReceipt: ContractReceipt = await usdTx.wait();
    const usdEvent = usdReceipt.events?.find(event => event.event === 'Approval');
    const usdOwner: Address = usdEvent?.args!['owner'];
    const usdSpender: Address = usdEvent?.args!['spender'];
    const usd: BigNumber = usdEvent?.args!['value'];
    const etherUSD = ethers.utils.formatUnits(usd, 6);

    console.log(`USD token owner: ${usdOwner}`);
    console.log(`ICO Contract: ${usdSpender}`);
    console.log(`USD amount: ${usd}`);
    console.log(`Approved ${usdSpender} to spend ${etherUSD} ${USD_TOKEN_NAME}'s`);
});