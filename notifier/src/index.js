const axios = require("axios");
const ethers = require("ethers");
require("dotenv").config();

nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
    },
});

const logger = require("logger").createLogger("development.log");
const provider = new ethers.providers.WebSocketProvider(
    process.env.CHAINSTACK_WEBSOCKET
);

const withdrawSig = ethers.utils.id("withdraw()").substring(0, 10);

async function main() {
    provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx);
        if (transaction && transaction.to) {
            let toContractBytecode = await provider.getCode(transaction.to);
            if (
                toContractBytecode
                    .toLowerCase()
                    .includes(
                        process.env.CONTRACT_ADDRESS.substring(2).toLowerCase()
                    ) ||
                transaction.data
                    .toLowerCase()
                    .includes(
                        process.env.CONTRACT_ADDRESS.substring(2).toLowerCase()
                    )
            ) {
                console.log("eureka!");
                let response = await axios.post(
                    `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
                    {
                        id: 1,
                        jsonrpc: "2.0",
                        method: "alchemy_simulateExecution",
                        params: [
                            {
                                from: transaction.from,
                                to: transaction.to,
                                value: transaction.value.toHexString(),
                                data: transaction.data,
                            },
                        ],
                    }
                );
                if (response.data.result) {
                    let txCalls = response.data.result.calls;
                    let withdrawalCall = txCalls.filter(
                        (call) =>
                            call.input == withdrawSig &&
                            ethers.utils.getAddress(call.to) ==
                                process.env.CONTRACT_ADDRESS
                    );
                    let isSuspicious = withdrawalCall.length > 1 ? true : false;
                    console.log("transaction is suspicious", isSuspicious);
                    if (isSuspicious) {
                        // pause contract
                        let response = await axios.post(
                            "http://localhost:3000/pause",
                            {
                                adjustedGasPrice:
                                    Number(transaction.gasPrice.toString()) *
                                    1.5,
                            }
                        );
                        // send email
                        if (response.status == 200) {
                            var mailOptions = {
                                from: process.env.MY_EMAIL,
                                to: "welechi.ifeanyi@gmail.com",
                                subject: "Reentrancy Risk Blocked",
                                text: "This email is from the reentrancy risk contract notifer. If your reading this, the contract has just been paused due to a reentrancy risk. Please check the logs for more details.",
                            };

                            transporter.sendMail(
                                mailOptions,
                                function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log(
                                            "Email sent: " + info.response
                                        );
                                        provider
                                            .getTransaction(tx)
                                            .then((blockedTxn) => {
                                                logger.info(
                                                    "blocked transaction: ",
                                                    blockedTxn
                                                );
                                            });
                                    }
                                }
                            );
                        }
                    }
                }
            }
        }
    });
}

main();
