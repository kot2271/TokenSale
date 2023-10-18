import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { ICO } from "../src/types/ICO";
import { ICO__factory } from "../src/types/factories/ICO__factory";


describe("ICO contract", function () {
    let icoContract: ICO;
    let testToken: Contract;
    let usdToken: Contract;
    const INITIAL_TEST_TOKENS_AMOUNT: BigNumber = ethers.utils.parseUnits("10000", "18");
    const INITIAL_USD_TOKENS_AMOUNT: BigNumber = ethers.utils.parseUnits("10000", "6");
    let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users: SignerWithAddress[];

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

        async function getNodeTime(): Promise<number> {
            let blockNumber = await ethers.provider.send('eth_blocknumber', []);
            let txBlockNumber = await ethers.provider.send('eth_getBlockByNumber', [blockNumber, false]);
            return parseInt((txBlockNumber.timestamp).toString());
        }

        async function shiftTime(newTime: number | string) {
            await ethers.provider.send('evm_increaseTime', [newTime]);
            await ethers.provider.send('evm_mine', []);
        }

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
                  expect(await icoContract.balanceOf(owner.address)).to.equal(INITIAL_TEST_TOKENS_AMOUNT);
            });
        });

        describe("buyToken", function() {

            it("Checking buyToken function", async () => {
                const amountToBuy: BigNumber = BigNumber.from(20 * 10 ** 18); // 20 TST
                const usdAmount: BigNumber = BigNumber.from((amountToBuy.mul(2)).div(10 ** 12)); // 1 TST = 2 USD

                // Permission must be granted before purchase.
                await usdToken.approve(icoContract.address, usdAmount, { from: user1.address });

                // startTime + 20 days
                const currentTime = await getNodeTime();
                await shiftTime(currentTime + (20 * 86400))

                // User1 buys tokens
                await icoContract.buyToken(amountToBuy, { from: user1.address });

                // Check that user1 TST balance has increased
                const user1Balance: BigNumber = await testToken.balanceOf(user1.address);
                expect(user1Balance).to.equal(amountToBuy);

                // Check that the contract has an increased procurement amount
                const purchasedAmount: BigNumber = await icoContract.purchasedAmounts(user1.address);
                expect(purchasedAmount).to.equal(amountToBuy);
            });

            it("reverts if sale not started", async function() {
                await getNodeTime();
                await expect(icoContract.buyToken(10)).to.be.revertedWith("ICO has not started yet"); 
            });

            it("reverts if sale finished", async function() {
                // startTime + 35 days
                const currentTime = await getNodeTime();
                await shiftTime(currentTime + (35 * 86400))
                await expect(icoContract.buyToken(10)).to.be.revertedWith("Claiming has started, you can't buy anymore"); 
            });

            it("reverts if amount is less than the minimum purchase", async function() {
                const amount: BigNumber = BigNumber.from(7 * 10 ** 18); // 7 TST
                await expect(icoContract.buyToken(amount, { from: user1.address })).to.be.revertedWith("Amount is less than the minimum purchase");
            });

            it("reverts if amount is more than the maximum purchase", async function() {
                const amount: BigNumber = BigNumber.from(120 * 10 ** 18); // 120 TST
                await expect(icoContract.buyToken(amount, { from: user1.address })).to.be.revertedWith("Amount is more than the maximum purchase");
            });
        });

        describe("withdrawTokens", function() {

            it("Checking the withdrawTokens function", async () => {
                const amountToBuy: BigNumber = BigNumber.from(30 * 10 ** 18); // 30 TST
                const usdAmount: BigNumber = BigNumber.from((amountToBuy.mul(2)).div(10 ** 12)); // 1 TST = 2 USD

                // startTime + 20 days
                const currentTime = await getNodeTime();
                await shiftTime(currentTime + (20 * 86400))

                await usdToken.approve(icoContract.address, usdAmount, { from: user2.address });
                await icoContract.buyToken(amountToBuy, { from: user2.address });

                // startTime + 70 days
                const updatedTime = await getNodeTime();
                await shiftTime(updatedTime + (50 * 86400))

                // User2 extracts the available tokens.
                await icoContract.withdrawTokens({ from: user2.address });

                // Check that user2 TST balance has increased
                const user2Balance: BigNumber = await testToken.balanceOf(user2.address);
                expect(user2Balance).to.equal(amountToBuy);

                // check that the contract has an increased amount of extracted tokens
                const claimedAmount: BigNumber = await icoContract.claimedAmounts(user2.address);
                expect(claimedAmount).to.equal(amountToBuy);
            });

            it("reverts if nothing to claim", async function() {
                // startTime + 70 days
                const currentTime = await getNodeTime();
                await shiftTime(currentTime + (70 * 86400))
                await expect(icoContract.withdrawTokens()).to.be.revertedWith("No 'TST' tokens to withdraw");
            });
        });

        describe("withdrawUSD", function() {

            it("Checking the withdrawUSD function", async () => {
                // Assume that the contract owner is an administrator.
                const admin = owner; 
                const initialBalance: BigNumber = await usdToken.balanceOf(admin.address);

                const amountToBuy: BigNumber = BigNumber.from(40 * 10 ** 18); // 40 TST
                const usdAmount: BigNumber = BigNumber.from((amountToBuy.mul(2)).div(10 ** 12)); // 1 TST = 2 USD

                // startTime + 20 days
                const currentTime = await getNodeTime();
                await shiftTime(currentTime + (20 * 86400))

                await usdToken.approve(icoContract.address, usdAmount, { from: user2.address });
                await icoContract.buyToken(amountToBuy, { from: user2.address });

                // startTime + 120 days
                const updatedTime = await getNodeTime();
                await shiftTime(updatedTime + (100 * 86400))

                // The administrator serves as withdrawUSD.
                await icoContract.withdrawUSD({ from: admin.address });

                // Check that the administrator's balance has increased by the expected amount
                const finalBalance: BigNumber = await usdToken.balanceOf(admin.address);
                const expectedBalance = initialBalance.add(finalBalance);
                expect(finalBalance).to.equal(expectedBalance);
            });

            it("reverts if caller is not admin", async function() {
                const adminRole = await icoContract.ADMIN_ROLE();
                await expect(icoContract.connect(user2.address).withdrawUSD()).to.be.revertedWith(`AccessControl: account ${user2.address} is missing role ${adminRole}`);
            });

            it("reverts if there are no 'USD' tokens to withdraw", async function(){
                const admin = owner; 
                const usdBalance: BigNumber = await usdToken.balanceOf(admin.address);
                expect(usdBalance).to.equal(0);
                await expect(icoContract.connect(admin.address).withdrawUSD()).to.be.revertedWith("No 'USD' tokens to withdraw");
            });
        });
    });
});