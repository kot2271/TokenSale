import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const ICO_CONTRACT_NAME = "ICO";

task("withdrawUSD", "Withdraw USD tokens (admin)")
  .addParam("ico", "ICO contract address")
  .setAction(async ({ ico }, { ethers }) => {
    const ICO = await ethers.getContractFactory(ICO_CONTRACT_NAME);
    const icoContract = ICO.attach(ico);

    const contractTx: ContractTransaction = await icoContract.withdrawUSD();
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Claimed');
    const user: Address = event?.args!['addr'];
    const Amount: BigNumber = event?.args!['amount'];
    const etherAmount = ethers.utils.formatUnits(Amount, 6);

    console.log(`User ${user} withdrawn ${etherAmount} 'USD' tokens`);
  });