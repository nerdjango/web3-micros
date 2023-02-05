require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    networks: {
        goerli: {
            url: process.env.CHAINSTACK_NODE,
            accounts: [process.env.ADMIN_WALLET_PRIVATE_KEY],
        },
    },
};
