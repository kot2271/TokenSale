import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const TST_TOKEN_NAME = "TestToken";
const ICO_CONTRACT_NAME = "ICO";

task("transferTestTokens", "Transfer from testToke to ICO")
.addParam("token", "TestToken address")
.addParam("ico", "ICO address")
.setAction(async ({token, ico}, { ethers }) => {
    const Token = await ethers.getContractFactory(TST_TOKEN_NAME);
    const tokenContract = Token.attach(token);

    const ICO = await ethers.getContractFactory(ICO_CONTRACT_NAME);
    const icoContract = ICO.attach(ico);

    const amount = await tokenContract.totalSupply();
    console.log(`testToken.totalSupply: ${amount}`);

    const contractTx: ContractTransaction = await tokenContract.transfer(icoContract.address, amount);
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Transfer');
    const From: Address = event?.args!['from'];
    const To: Address = event?.args!['to'];
    const Amount: BigNumber = event?.args!['value'];   
    const etherAmount = ethers.utils.formatEther(Amount);         

    console.log(`Transfer from: ${From}`);
    console.log(`Transfer to: ${To}`);
    console.log(`Amount: ${Amount}`);
    console.log(`Transferred ${etherAmount} ${TST_TOKEN_NAME}'s from ${From} to ${To}`);
});