import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedWaterSaveLog = await deploy("WaterSaveLog", {
    from: deployer,
    log: true,
  });

  console.log(`WaterSaveLog contract deployed at: ${deployedWaterSaveLog.address}`);
};

export default func;
func.id = "deploy_waterSaveLog";
func.tags = ["WaterSaveLog"];





