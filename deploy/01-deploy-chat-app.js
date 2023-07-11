const { network } = require("hardhat");
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name) ? VERIFICATION_BLOCK_CONFIRMATIONS :
     network.config.blockConfimations

     log("--------------------------------------------------------")
     const chatApp = await deploy("ChatApp", {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations : waitBlockConfirmations
     })

     if(!developmentChains.includes(network.name)){
        log("Verifying.....")
        await verify(chatApp.address, []);
     }

     log("--------------------------------------------------------")
}


module.exports.tags = ["all", "chatApp"]