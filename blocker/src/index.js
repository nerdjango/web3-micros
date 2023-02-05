const axios = require("axios");
const express = require("express");

require("dotenv").config();

const ethers = require("ethers");
const contractABI = require("../contractABI.json");

const logger = require("logger").createLogger("development.log");

const app = express();
app.use(express.json());

const port = 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

const provider = new ethers.providers.WebSocketProvider(
    process.env.CHAINSTACK_WEBSOCKET
);
const wallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY);
walletSigner = wallet.connect(provider);

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI.output.abi,
    walletSigner
);

app.get("/", (req, res) => {
    res.json({ message: "We're LIVE!" });
});

app.post("/pause", async (req, res) => {
    const { adjustedGasPrice } = req.body;

    let tx = await contract.pause({ gasPrice: adjustedGasPrice });
    console.log(
        "view on etherscan: ",
        "https://goerli.etherscan.io/tx/" + tx.hash
    );
    try {
        let transaction = await tx.wait();
        console.log("transaction complete");
        logger.info("receipt: ", transaction);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
