import { ethers, run, network } from "hardhat";

const delay = async (time: number) => {
  return new Promise((resolve: any) => {
    setInterval(() => {
      resolve()
    }, time)
  })
}

async function main() {

  const tstName = "TestToken";
  const tstSymbol = "TST";

  const TestToken = await ethers.getContractFactory(tstName);
  const testToken = await TestToken.deploy();

  await testToken.deployed();

  console.log(`${tstName} contract deployed to: ${testToken.address}`);
  console.log('Wait for delay...');
  await delay(20000); // 20 seconds
  console.log(`Starting verify ${tstName}...`);

  try {
    await run('verify', {
      address: testToken!.address,
      constructorArguments: [tstName, tstSymbol],
      contract: 'contracts/TestToken.sol:TestToken',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }


  const usdName = "USDToken";
  const usdSymbol = "USD";

  const USDToken = await ethers.getContractFactory(usdName);
  const usdToken = await USDToken.deploy();

  await usdToken.deployed();

  console.log(`${usdName} contract deployed to: ${usdToken.address}`);
  console.log('Wait for delay...');
  await delay(20000); // 20 seconds
  console.log(`Starting verify ${usdName}...`);

  try {
    await run('verify', {
      address: usdToken!.address,
      constructorArguments: [usdName, usdSymbol],
      contract: 'contracts/USDToken.sol:USDToken',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }


  let icoContract;

  try {
  const ContractFactory = await ethers.getContractFactory("ICO");
  const signer = (await ethers.getSigners())[0];
  icoContract = await ContractFactory.connect(signer).deploy(testToken.address, usdToken.address)
  await icoContract.deployed();

  console.log(`ICO Contract deployed to: ${icoContract.address}`);
  } catch (e: any) {
    console.log(e.message)
  }
  console.log('Wait for delay...');
  await delay(60000);
  console.log('Starting verify ICO contract...');

  try {
    await run('verify', {
      address: icoContract!.address,
      constructorArguments: [testToken.address, usdToken.address],
      contract: 'contracts/ICO.sol:ICO',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });