#!/bin/bash

# ChainWaterSave Local Startup Script

set -e

echo "🚀 Starting ChainWaterSave local development environment..."
echo ""

# Check if in the correct directory
if [ ! -d "contracts" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script in the actio directory"
    exit 1
fi

# Check if Hardhat node is running
echo "📡 Checking Hardhat node..."
if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
    echo "⚠️  Hardhat node is not running"
    echo ""
    echo "Please start the Hardhat node first:"
    echo "  cd contracts"
    echo "  npx hardhat node --verbose"
    echo ""
    echo "Then run this script in another terminal"
    exit 1
fi

echo "✅ Hardhat node is running"
echo ""

# Deploy contracts
echo "📝 Deploying contracts..."
cd contracts
if [ ! -d "deployments/localhost" ]; then
    echo "  First deployment, deploying contracts..."
    npx hardhat deploy --network localhost
else
    echo "  Contracts already deployed, skipping..."
fi
cd ..

# Generate ABI
echo "🔧 Generating ABI..."
cd frontend
npm run genabi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Make sure Hardhat node is running (Terminal 1)"
echo "  2. Start frontend: cd frontend && npm run dev:mock"
echo "  3. Open browser and visit http://localhost:3000"
echo ""



