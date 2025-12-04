"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useWaterSaveLog } from "@/hooks/useWaterSaveLog";
import { Navigation } from "@/components/Navigation";
import { SubmitAction } from "@/components/SubmitAction";
import { WaterDropAnimation } from "@/components/WaterDropAnimation";

export default function SubmitPage() {
  const { storage } = useInMemoryStorage();
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

  const { instance: fhevmInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });

  const waterLog = useWaterSaveLog({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage: storage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubmitAction
          onSubmit={waterLog.submitAction}
          canSubmit={waterLog.canSubmit}
          isSubmitting={waterLog.isSubmitting}
        />

        {/* Message Display */}
        {waterLog.message && (
          <div className="mt-6 bg-white border-l-4 border-primary p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-700">{waterLog.message}</p>
          </div>
        )}
      </main>
    </div>
  );
}



