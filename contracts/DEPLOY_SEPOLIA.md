# 部署到Sepolia测试网说明

## 配置RPC端点

公共RPC端点可能不稳定，建议使用你自己的RPC端点（Infura或Alchemy）：

### 方式1: 使用环境变量（推荐）

```bash
# 设置Infura RPC URL
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY"

# 或设置Alchemy RPC URL
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY"
```

### 方式2: 直接修改hardhat.config.ts

在 `hardhat.config.ts` 中修改 `sepolia` 网络的 `url` 字段。

## 检查账户余额

部署前请确保账户有足够的Sepolia ETH支付gas费用：

```bash
npx hardhat run check-balance.js --network sepolia
```

如果没有ETH，可以从以下水龙头获取：
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 部署合约

```bash
npx hardhat run deploy-sepolia-simple.js --network sepolia
```

部署成功后，合约地址将保存在 `deployments/sepolia/` 目录下。

## 部署的合约

1. **WaterSaveLog** - 节水行动记录合约（使用FHEVM加密）
2. **WaterBadge** - NFT徽章合约（依赖WaterSaveLog）

部署账户: `0x07DEC90424152Ac64f3D88B61BcF55f64E1D7789`

