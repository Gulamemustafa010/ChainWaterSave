"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { Navigation } from "@/components/Navigation";
import { RecordsList } from "@/components/RecordsList";
import { WaterDropAnimation } from "@/components/WaterDropAnimation";
import { WaterSaveLogAddresses } from "@/abi/WaterSaveLogAddresses";
import { WaterSaveLogABI } from "@/abi/WaterSaveLogABI";
import { useMemo } from "react";
import { ethers } from "ethers";

export default function RecordsPage() {
  const { storage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const { instance: fhevmInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });

  const contractInfo = useMemo(() => {
    if (!chainId) return { address: undefined, abi: WaterSaveLogABI.abi };
    
    const entry = WaterSaveLogAddresses[chainId.toString() as keyof typeof WaterSaveLogAddresses];
    if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
      return { address: undefined, abi: WaterSaveLogABI.abi };
    }
    
    return {
      address: entry.address,
      abi: WaterSaveLogABI.abi,
    };
  }, [chainId]);

  if (!isConnected) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <WaterDropAnimation />
        <Navigation isConnected={false} />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <button
              onClick={connect}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation isConnected={isConnected} userAddress={accounts?.[0]} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fhevmInstance && (
          <RecordsList
            instance={fhevmInstance}
            storage={storage}
            ethersSigner={ethersSigner}
            ethersReadonlyProvider={ethersReadonlyProvider}
            contractAddress={contractInfo.address}
            contractAbi={contractInfo.abi}
          />
        )}
      </main>
    </div>
  );
}



