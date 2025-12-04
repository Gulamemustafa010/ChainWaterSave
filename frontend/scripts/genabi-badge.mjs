import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "WaterBadge";
const rel = "../contracts";
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const deploymentsDir = path.join(dir, "deployments");
const line = "\n===================================================================\n";

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (!optional) {
      console.error(
        `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto 'contracts' directory\n2. Run 'npx hardhat run deploy/deploy-badge.js --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    return undefined;
  }

  const jsonPath = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(jsonPath)) {
    if (!optional) {
      console.error(`${line}${contractName}.json not found${line}`);
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(jsonPath, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, false);
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);
if (!deploySepolia) {
  deploySepolia = { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi-badge'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: JSON.parse(deployLocalhost.abi) }, null, 2)} as const;
\n`;

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi-badge'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);





