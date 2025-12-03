const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying WaterBadge with account:", deployer.address);

  // Get WaterSaveLog address from deployment
  const fs = require("fs");
  const path = require("path");
  const waterSaveLogPath = path.join(__dirname, "../deployments/localhost/WaterSaveLog.json");
  
  let waterSaveLogAddress;
  if (fs.existsSync(waterSaveLogPath)) {
    const deploymentData = JSON.parse(fs.readFileSync(waterSaveLogPath, "utf-8"));
    waterSaveLogAddress = deploymentData.address;
  } else {
    // Use default address if not found
    waterSaveLogAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  }

  console.log("Using WaterSaveLog address:", waterSaveLogAddress);

  const WaterBadge = await ethers.getContractFactory("WaterBadge");
  const waterBadge = await WaterBadge.deploy(waterSaveLogAddress);

  await waterBadge.waitForDeployment();

  const address = await waterBadge.getAddress();
  console.log("WaterBadge deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    address: address,
    abi: WaterBadge.interface.formatJson(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments/localhost");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "WaterBadge.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/localhost/WaterBadge.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





