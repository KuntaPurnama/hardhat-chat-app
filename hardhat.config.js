require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")

const COMPILER_SETTINGS = {
    optimizer: {
        enabled: true,
        runs: 1000000,
    },
    metadata: {
        bytecodeHash: "none",
    },
}

const MAINNET_RPC_URL =
    process.env.MAINNET_RPC_URL ||
    process.env.ALCHEMY_MAINNET_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY
// optional
const MNEMONIC = process.env.MNEMONIC || "Your mnemonic"
const FORKING_BLOCK_NUMBER = parseInt(process.env.FORKING_BLOCK_NUMBER) || 0

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"
const REPORT_GAS = process.env.REPORT_GAS || false

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                COMPILER_SETTINGS,
            },
            {
                version: "0.6.6",
                COMPILER_SETTINGS,
            },
            {
                version: "0.4.24",
                COMPILER_SETTINGS,
            },
        ],
    },
    networks: {
        hardhat: {
            hardfork: "merge",
            // If you want to do some forking set `enabled` to true
            forking: {
                url: MAINNET_RPC_URL,
                blockNumber: FORKING_BLOCK_NUMBER,
                enabled: false,
            },
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL !== undefined ? SEPOLIA_RPC_URL : "",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            chainId: 11155111,
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            chainId: 1,
        },
    },
    defaultNetwork: "hardhat",
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            // npx hardhat verify --list-networks
            sepolia: ETHERSCAN_API_KEY,
            mainnet: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
        only: [
            "APIConsumer",
            "AutomationCounter",
            "NFTFloorPriceConsumerV3",
            "PriceConsumerV3",
            "RandomNumberConsumerV2",
            "RandomNumberDirectFundingConsumerV2",
        ],
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./build/cache",
        artifacts: "./build/artifacts",
    },
    mocha: {
        timeout: 300000, // 300 seconds max for running tests
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
}
