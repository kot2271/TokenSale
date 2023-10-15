# ICO

## Задача:
- Написать 2 смарт контракта ERC20
- ICO контракт с наделением правами
- Тесты + таски
- Деплой скрипт

ERC20 токены:
Смарт контракт 1:
- символ "TST"
- наименование "Test Token"
- decimals = 18

Смарт контракт 2:
- символ "USD"
- наименование "USD Token"
- decimals = 6

ICO смарт контракт:

- цена 1 TST = 2 USD
- Наделение (Claim): 1 месяц 10%, 2 месяц 30%, 3 месяц 50%, 4 месяц 100%
- После начала неделения(когда можно claim) покупки токенов прекращаются
- Минимальная покупка 10 TST и максимальная 100 TST

## Installation
Clone the repository using the following command:
Install the dependencies using the following command:
```shell
npm i
```

## Deployment

Fill in all the required environment variables(copy .env-example to .env and fill it). 

Deploy contract to the chain (polygon-mumbai):
```shell
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

## Tasks

Create a new task(s) and save it(them) in the folder "tasks". Add a new task_name in the file "tasks/index.ts"

Running a approve task:
```shell
npx hardhat approve --usd-token {USD_TOKEN_ADDRESS} --ico-contract {ICO_CONTRACT_ADDRESS} --amount 20 --network polygon-mumbai
```

Running a buyToken task:
```shell
npx hardhat buyToken --ico {ICO_CONTRACT_ADDRESS} --amount 20 --network polygon-mumbai
```

Running a testTokenBalance task:
```shell
npx hardhat testTokenBalance --token {TEST_TOKEN_ADDRESS} --user {OWNER_ADDRESS} --network polygon-mumbai
```

Running a withdrawTokens task:
```shell
npx hardhat withdrawTokens --ico {ICO_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a withdrawTokens task:
```shell
npx hardhat withdrawUSD --ico {ICO_CONTRACT_ADDRESS} --network polygon-mumbai
```

{USD_TOKEN_ADDRESS}: 0xcC4039b157FE599EdEcbEB2b781f445A719001b7
{TEST_TOKEN_ADDRESS}: 0x462cEF234707C9a4Bd9149dF47Df48344773B14F
{ICO_CONTRACT_ADDRESS}: 0xEe6c3C2f2417C808EBbE8E74F4F15a72a4216210
{OWNER_ADDRESS}: 0x28217F6A9AeBa48042E814e9fa8004Ecf5f90873
