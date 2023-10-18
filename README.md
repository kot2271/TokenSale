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

![schema](https://github.com/kot2271/TokenSale/blob/main/schema/schema.jpeg)

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

Running a transferTestTokens task:
```shell
npx hardhat transferTestTokens --token {TEST_TOKEN_ADDRESS} --ico {ICO_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a approve task:
```shell
npx hardhat approve --usd-token {USD_TOKEN_ADDRESS} --ico-contract {ICO_CONTRACT_ADDRESS} --amount 20 --network polygon-mumbai
```

Running a buyToken task:
```shell
npx hardhat buyToken --ico {ICO_CONTRACT_ADDRESS} --amount 20 --network polygon-mumbai
```

Running a getAvailableAmount task:
```shell
npx hardhat getAvailableAmount --ico {ICO_CONTRACT_ADDRESS} --user {USER_ADDRESS} --network polygon-mumbai
```

Running a testTokenBalance task:
```shell
npx hardhat testTokenBalance --token {TEST_TOKEN_ADDRESS} --user {OWNER_ADDRESS} --network polygon-mumbai
```

Running a usdTokenBalance task:
```shell
npx hardhat usdTokenBalance --token {USD_TOKEN_ADDRESS} --user {OWNER_ADDRESS} --network polygon-mumbai
```

Running a withdrawTokens task:
```shell
npx hardhat withdrawTokens --ico {ICO_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a withdrawUSD task:
```shell
npx hardhat withdrawUSD --ico {ICO_CONTRACT_ADDRESS} --network polygon-mumbai
```

## Verify

Verify the installation by running the following command:
```shell
npx hardhat verify --network polygon-mumbai {TEST_TOKEN_ADDRESS} "TestToken" "TST"
```

```shell
npx hardhat verify --network polygon-mumbai {USD_TOKEN_ADDRESS} "USDToken" "USD"
```

```shell
npx hardhat verify --network polygon-mumbai {ICO_CONTRACT_ADDRESS} {TEST_TOKEN_ADDRESS} {USD_TOKEN_ADDRESS}
```

```shell
{ICO_CONTRACT_ADDRESS}: 0x8e9d77211274069Ca6783A653e25bEF72A70b244
{TEST_TOKEN_ADDRESS}: 0x439452D6a8BFaD282d563cfC98872b2f7fe323f5
{USD_TOKEN_ADDRESS}: 0x37D54C410Dc5382a447e927235ad900Ea15F1276
```
