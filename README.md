# ChainWaterSave - Water Saving Action Log DApp

Privacy-preserving water saving DApp based on FHEVM.

## Project Structure

```
actio/
├── contracts/          # Smart Contracts
│   ├── WaterSaveLog.sol
│   ├── hardhat.config.ts
│   └── deploy/
└── frontend/           # Frontend Application
    ├── app/
    ├── components/
    ├── hooks/
    └── fhevm/
```

## Quick Start

### 1. Install Dependencies

```bash
# Contracts
cd contracts
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Local Hardhat Node (Mock Mode)

```bash
cd contracts
npx hardhat node --verbose
```

### 3. Deploy Contracts

```bash
# In a new terminal
cd contracts
npx hardhat deploy --network localhost
```

### 4. Start Frontend (Mock Mode)

```bash
cd frontend
npm run dev:mock
```

### 5. Testnet Mode (Sepolia)

```bash
# Deploy to Sepolia
cd contracts
npx hardhat deploy --network sepolia

# Start frontend (using Relayer SDK)
cd ../frontend
npm run dev
```

## Features

- ✅ Daily water saving records (FHE encrypted)
- ✅ Consecutive days statistics
- ✅ Personal history trends (local decryption)
- ✅ Group water saving contribution statistics
- ✅ NFT badge system (7/30/100 days)

## Tech Stack

- **Contracts**: Solidity + FHEVM v0.9
- **Frontend**: Next.js + React + TailwindCSS
- **FHEVM**: Mock (local) / Relayer SDK (testnet)



