async function main() {
    const [deployer] = await ethers.getSigners();
    const provider = new ethers.providers.WebSocketProvider(
        process.env.CHAINSTACK_WEBSOCKET
    );

    console.log("Deploying contracts with the account:", deployer.address);

    const ReentrancyRisk = await ethers.getContractFactory("ReentrancyRisk");
    const reentrancyRisk = await ReentrancyRisk.deploy();
    console.log("ReentrancyRisk address:", reentrancyRisk.address);

    const ReentrancyAttack = await ethers.getContractFactory(
        "ReentrancyAttack"
    );
    const reentrancyAttack = await ReentrancyAttack.deploy(
        reentrancyRisk.address
    );
    console.log("ReentrancyAttack address:", reentrancyAttack.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
