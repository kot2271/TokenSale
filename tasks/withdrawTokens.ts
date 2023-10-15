import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const ICO_CONTRACT_NAME = "ICO";

task("withdrawTokens", "Withdraw available tokens")
  .addParam("ico", "ICO contract address")
  .setAction(async ({ ico }, { ethers }) => {
    const ICO = await ethers.getContractFactory(ICO_CONTRACT_NAME);
    const icoContract = ICO.attach(ico);

    const contractTx: ContractTransaction = await icoContract.withdrawTokens();
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Withdrawn');
    const user: Address = event?.args!['addr'];
    const Amount: BigNumber = event?.args!['amount'];
    const etherAmount = ethers.utils.formatEther(Amount);

    console.log(`User ${user} withdrawn ${etherAmount} 'TST' tokens`);
  });