const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const WaterSaveLog = await ethers.getContractFactory("WaterSaveLog");
  const waterSaveLog = await WaterSaveLog.deploy();

  await waterSaveLog.waitForDeployment();

  const address = await waterSaveLog.getAddress();
  console.log("WaterSaveLog deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  
  const deploymentInfo = {
    address: address,
    abi: WaterSaveLog.interface.formatJson(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments/localhost");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "WaterSaveLog.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/localhost/WaterSaveLog.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

