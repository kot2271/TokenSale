import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const USD_TOKEN_NAME = "USDToken";

task("approve", "Approved to spend from a ico contract")
.addParam("usdToken", "USD token address")
.addParam("icoContract", "ICO contract address")
.addParam("amount", "ICO contract address")
.setAction(async ({usdToken, icoContract, amount}, { ethers }) => {
    const USDToken = await ethers.getContractFactory(USD_TOKEN_NAME);
    const tokenContract = USDToken.attach(usdToken);

    const amountToBuy: BigNumber = ethers.utils.parseEther(amount.toString());
    const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10**12);

    const contractTx: ContractTransaction = await tokenContract.approve(icoContract, usdAmount);
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Approval');
    const Owner: Address = event?.args!['owner'];
    const Spender: Address = event?.args!['spender'];
    const Amount: BigNumber = event?.args!['value'];
    const etherAmount = ethers.utils.formatEther(Amount);
    

    console.log(`USD token owner: ${Owner}`);
    console.log(`ICO Contract: ${Spender}`);
    console.log(`USD amount: ${Amount}`);
    console.log(`Approved ${Spender} to spend ${etherAmount} ${USD_TOKEN_NAME}'s`);
});