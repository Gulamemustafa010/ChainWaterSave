const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Determine network name
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  const deploymentsDir = path.join(__dirname, "../deployments", networkName);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // 1. Deploy WaterSaveLog
  console.log("\n=== Deploying WaterSaveLog ===");
  const WaterSaveLog = await ethers.getContractFactory("WaterSaveLog");
  const waterSaveLog = await WaterSaveLog.deploy();
  await waterSaveLog.waitForDeployment();
  const waterSaveLogAddress = await waterSaveLog.getAddress();
  console.log("WaterSaveLog deployed to:", waterSaveLogAddress);

  // Save WaterSaveLog deployment info
  const waterSaveLogDeployment = {
    address: waterSaveLogAddress,
    abi: JSON.parse(WaterSaveLog.interface.formatJson()),
  };
  fs.writeFileSync(
    path.join(deploymentsDir, "WaterSaveLog.json"),
    JSON.stringify(waterSaveLogDeployment, null, 2)
  );
  console.log("WaterSaveLog deployment info saved");

  // 2. Deploy WaterBadge (depends on WaterSaveLog)
  console.log("\n=== Deploying WaterBadge ===");
  console.log("Using WaterSaveLog address:", waterSaveLogAddress);
  const WaterBadge = await ethers.getContractFactory("WaterBadge");
  const waterBadge = await WaterBadge.deploy(waterSaveLogAddress);
  await waterBadge.waitForDeployment();
  const waterBadgeAddress = await waterBadge.getAddress();
  console.log("WaterBadge deployed to:", waterBadgeAddress);

  // Save WaterBadge deployment info
  const waterBadgeDeployment = {
    address: waterBadgeAddress,
    abi: JSON.parse(WaterBadge.interface.formatJson()),
    args: [waterSaveLogAddress],
  };
  fs.writeFileSync(
    path.join(deploymentsDir, "WaterBadge.json"),
    JSON.stringify(waterBadgeDeployment, null, 2)
  );
  console.log("WaterBadge deployment info saved");

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("WaterSaveLog:", waterSaveLogAddress);
  console.log("WaterBadge:", waterBadgeAddress);
  console.log("\nDeployment info saved to:", deploymentsDir);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

