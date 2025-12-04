"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { WaterDropAnimation } from "@/components/WaterDropAnimation";

export default function Home() {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <WaterDropAnimation />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center">
              <div className="mb-8">
                <div className="text-8xl mb-4 animate-bounce">💧</div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ChainWaterSave
                </h1>
                <p className="text-gray-600 text-lg">
                  Record your water saving actions, protect the blue planet
                </p>
              </div>
              
              <button
                onClick={connect}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <span className="flex items-center justify-center">
                  <span className="text-2xl mr-3">🔗</span>
                  Connect Wallet to Start
                </span>
              </button>
              
              <div className="mt-6 text-sm text-gray-500">
                Privacy-preserving water saving DApp based on FHEVM
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation 
        isConnected={isConnected} 
        userAddress={accounts?.[0]} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FHEVM Status */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                fhevmStatus === "ready" ? "bg-green-500 animate-pulse" :
                fhevmStatus === "loading" ? "bg-yellow-500 animate-pulse" :
                fhevmStatus === "error" ? "bg-red-500" : "bg-gray-400"
              }`} />
              <span className="text-sm font-medium text-gray-700">
                FHEVM Status: <span className="font-bold">{fhevmStatus}</span>
              </span>
            </div>
            {fhevmInstance && (
              <span className="text-sm text-green-600 font-semibold">✅ Instance Ready</span>
            )}
          </div>
          {fhevmError && (
            <p className="text-sm text-red-600 mt-2">Error: {fhevmError.message}</p>
          )}
        </div>

        {/* Dashboard Content */}
        {fhevmInstance && (
          <Dashboard
            instance={fhevmInstance}
            storage={fhevmDecryptionSignatureStorage}
            ethersSigner={ethersSigner}
            ethersReadonlyProvider={ethersReadonlyProvider}
            chainId={chainId}
            sameChain={sameChain}
            sameSigner={sameSigner}
          />
        )}
      </main>
    </div>
  );
}
