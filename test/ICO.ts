import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractTransaction, ContractReceipt } from "ethers";
import { ethers } from "hardhat";
import { Address } from 'cluster';

import { ICO } from "../src/types/ICO";
import { ICO__factory } from "../src/types/factories/ICO__factory";


describe("ICO contract", function () {
    let icoContract: ICO;
    let testToken: Contract;
    let usdToken: Contract;
    const INITIAL_TEST_TOKENS_AMOUNT: BigNumber = ethers.utils.parseUnits("10000", "18");
    const INITIAL_USD_TOKENS_AMOUNT: BigNumber = ethers.utils.parseUnits("10000", "6");
    let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users: SignerWithAddress[];
    const startTime = Math.floor(Date.now() / 1000) + 60;

    beforeEach(async () => {
        [owner, user1, user2, ...users] = await ethers.getSigners();

        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy(); 
  
        const USDToken = await ethers.getContractFactory("USDToken");
        usdToken = await USDToken.deploy();
    
        const icoFactory = (await ethers.getContractFactory("ICO", owner)) as ICO__factory;
        icoContract = await icoFactory.deploy(testToken.address, usdToken.address);

        const amount = await testToken.totalSupply();
        await testToken.transfer(icoContract.address, amount);
    });

        describe("Initial params of token contracts", async () => {
            it("Initializes name, symbol and decimals correctly", async () => {
                expect(await testToken.name()).to.equal("TestToken");
                expect(await testToken.symbol()).to.equal("TST");
                expect(await testToken.decimals()).to.equal(18);
      
                expect(await usdToken.name()).to.equal("USDToken");
                expect(await usdToken.symbol()).to.equal("USD");
                expect(await usdToken.decimals()).to.equal(6);
            });
          
            it("should have the correct owner", async () => {
                expect(await testToken.owner()).to.equal(owner.address);
                expect(await usdToken.owner()).to.equal(owner.address);
            });
               
            it("should have the correct initial total supply", async () => {
                expect(await testToken.totalSupply()).to.equal(INITIAL_TEST_TOKENS_AMOUNT);
                expect(await usdToken.totalSupply()).to.equal(INITIAL_USD_TOKENS_AMOUNT);
            });
          
            it("should have the correct initial balance for the owner", async () => {
                  expect(await testToken.balanceOf(owner.address)).to.equal(0);
                  expect(await usdToken.balanceOf(owner.address)).to.equal(INITIAL_USD_TOKENS_AMOUNT);
            });
        });

        describe("buyToken", async () => {

            it("Checking buyToken function", async () => {
                const amountToBuy: BigNumber = ethers.utils.parseEther("20"); // 20 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD

                // Permission must be granted before purchase.
                await usdToken.approve(icoContract.address, usdAmount);

                // startTime + 20 days
                await ethers.provider.send("evm_setNextBlockTimestamp", [startTime]);
                await ethers.provider.send("evm_increaseTime", [20 * 86400]);

                await icoContract.buyToken(amountToBuy);

                // Check that the contract has an increased procurement amount
                const purchasedAmount: BigNumber = await icoContract.purchasedAmounts(owner.address);
                expect(purchasedAmount).to.equal(amountToBuy);
            });

            it("reverts if sale finished", async function() {
                const amountToBuy: BigNumber = ethers.utils.parseEther("10"); // 10 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD
                await usdToken.approve(icoContract.address, usdAmount);
                await ethers.provider.send("evm_increaseTime", [startTime]);
                await expect(icoContract.buyToken(amountToBuy)).to.be.revertedWith("Claiming has started, you can't buy anymore"); 
            });

            it("reverts if amount is less than the minimum purchase", async function() {
                // startTime + 20 days
                await ethers.provider.send("evm_increaseTime", [20 * 86400]);
                const amountToBuy: BigNumber = ethers.utils.parseEther("7"); // 7 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD
                await usdToken.approve(icoContract.address, usdAmount);
                await expect(icoContract.buyToken(amountToBuy)).to.be.revertedWith("Amount is less than the minimum purchase");
            });

            it("reverts if amount is more than the maximum purchase", async function() {
                // startTime + 20 days
                await ethers.provider.send("evm_increaseTime", [20 * 86400]);
                const amountToBuy: BigNumber = ethers.utils.parseEther("120"); // 120 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD
                await usdToken.approve(icoContract.address, usdAmount);
                await expect(icoContract.buyToken(amountToBuy)).to.be.revertedWith("Amount is more than the maximum purchase");
            });
        });

        describe("withdrawTokens", async () => {
        
            it("Checking the withdrawTokens function", async () => {
                const amountToBuy: BigNumber = ethers.utils.parseEther("30"); // 30 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD

                // startTime + 20 days
                // await ethers.provider.send("evm_setNextBlockTimestamp", [startTime]);
                await ethers.provider.send("evm_increaseTime", [20 * 86400]);

                await usdToken.approve(icoContract.address, usdAmount);
                await icoContract.buyToken(amountToBuy);

                // startTime + 50 days
                await ethers.provider.send("evm_increaseTime", [50 * 86400]);

                // User2 extracts the available tokens.
                await icoContract.withdrawTokens();

                // Check that user2 TST balance has increased
                const user1Balance: BigNumber = await testToken.balanceOf(owner.address);
                const actualBalance: BigNumber = amountToBuy.mul(30).div(100);
                expect(user1Balance).to.equal(actualBalance);

                // check that the contract has an increased amount of extracted tokens
                const claimedAmount: BigNumber = await icoContract.claimedAmounts(owner.address);
                expect(claimedAmount).to.equal(actualBalance);
                
                // startTime + 121 days
                await ethers.provider.send("evm_increaseTime", [51 * 86400]);

                // User2 extracts the available tokens.
                await icoContract.withdrawTokens();

                // Check that user2 TST balance has increased
                const balance: BigNumber = await testToken.balanceOf(owner.address);
                expect(balance).to.equal(amountToBuy);

                // check that the contract has an increased amount of extracted tokens
                const claimed: BigNumber = await icoContract.claimedAmounts(owner.address);
                expect(claimed).to.equal(amountToBuy);
            });

            it("reverts if nothing to claim", async function() {
                // startTime + 70 days
                await ethers.provider.send("evm_increaseTime", [70 * 86400]);
                await expect(icoContract.withdrawTokens()).to.be.revertedWith("No 'TST' tokens to withdraw");
            });
        });

        describe("withdrawUSD", async () => {

            it("Checking the withdrawUSD function", async () => {
                // Assume that the contract owner is an administrator.
                const admin = owner; 
                const amountToBuy: BigNumber = ethers.utils.parseEther("40"); // 40 TST
                const usdAmount: BigNumber = (amountToBuy.mul(2)).div(10 ** 12); // 1 TST = 2 USD

                const initialUSDBalance: BigNumber = await usdToken.balanceOf(icoContract.address);

                // startTime + 20 days
                await ethers.provider.send("evm_increaseTime", [20 * 86400]);

                await usdToken.approve(icoContract.address, usdAmount);
                await icoContract.buyToken(amountToBuy);

                // startTime + 121 days
                await ethers.provider.send("evm_increaseTime", [121 * 86400]);

                // The administrator serves as withdrawUSD.
                const contractTx: ContractTransaction = await icoContract.withdrawUSD();
                const contractReceipt: ContractReceipt = await contractTx.wait();
                const event = contractReceipt.events?.find(event => event.event === 'Claimed');
                const sender: Address = event?.args!['addr'];
                const Amount: BigNumber = event?.args!['amount'];

                const totalAmount: BigNumber = initialUSDBalance.add(Amount)

                // Check that the administrator's balance has increased by the expected usdAmount
                expect(usdAmount).to.equal(totalAmount);
                expect(admin.address).to.equal(sender);
            });

            it("reverts if caller is not admin", async function() {
                await expect(icoContract.connect(user2.address).withdrawUSD()).to.be.reverted;
                });

            it("reverts if there are no 'USD' tokens to withdraw", async function(){
                const admin = owner; 
                const usdBalance: BigNumber = await usdToken.balanceOf(icoContract.address);
                expect(usdBalance).to.equal(0);
                await expect(icoContract.connect(admin.address).withdrawUSD()).to.be.reverted;
            });
        });
});