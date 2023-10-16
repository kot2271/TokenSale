import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const delay = async (time: number) => {
    return new Promise((resolve: any) => {
      setInterval(() => {
        resolve()
      }, time)
    })
  }

const USD_TOKEN_NAME = "USDToken";
const TST_TOKEN_NAME = "TestToken";

task("approve", "Approved to spend from a ico contract")
.addParam("usdToken", "USD token address")
.addParam("tstToken", "TST token address")
.addParam("icoContract", "ICO contract address")
.addParam("amount", "ICO contract address")
.setAction(async ({usdToken, tstToken, icoContract, amount}, { ethers }) => {
    const USDToken = await ethers.getContractFactory(USD_TOKEN_NAME);
    const usdTokenContract = USDToken.attach(usdToken);

    const TestToken = await ethers.getContractFactory(TST_TOKEN_NAME);
    const tstTokenContract = TestToken.attach(tstToken);

    const amountToBuy: BigNumber = ethers.utils.parseEther(amount.toString());
    const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10**12);

    const usdTx: ContractTransaction = await usdTokenContract.approve(icoContract, usdAmount);
    const usdReceipt: ContractReceipt = await usdTx.wait();
    const usdEvent = usdReceipt.events?.find(event => event.event === 'Approval');
    const usdOwner: Address = usdEvent?.args!['owner'];
    const usdSpender: Address = usdEvent?.args!['spender'];
    const usd: BigNumber = usdEvent?.args!['value'];
    const etherUSD = ethers.utils.formatUnits(usd, 6);

    console.log('Wait for delay...\n');
    await delay(20000); // 20 seconds

    const tstTx: ContractTransaction = await tstTokenContract.approve(icoContract, amountToBuy);
    const tstReceipt: ContractReceipt = await tstTx.wait();
    const tstEvent = tstReceipt.events?.find(event => event.event === 'Approval');
    const tstOwner: Address = tstEvent?.args!['owner'];
    const tstSpender: Address = tstEvent?.args!['spender'];
    const tst: BigNumber = tstEvent?.args!['value'];
    const etherTST = ethers.utils.formatEther(tst);
    

    console.log(`USD token owner: ${usdOwner}`);
    console.log(`ICO Contract: ${usdSpender}`);
    console.log(`USD amount: ${usd}`);
    console.log(`Approved ${usdSpender} to spend ${etherUSD} ${USD_TOKEN_NAME}'s \n`);

    console.log(`TST token owner: ${tstOwner}`);
    console.log(`ICO Contract: ${tstSpender}`);
    console.log(`TST amount: ${tst}`);
    console.log(`Approved ${tstSpender} to spend ${etherTST} ${TST_TOKEN_NAME}'s`);
});