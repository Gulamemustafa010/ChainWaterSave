"use client";

import { useWaterSaveLog } from "@/hooks/useWaterSaveLog";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ethers } from "ethers";
import { RefObject } from "react";

export const Dashboard = ({
  instance,
  storage,
  ethersSigner,
  ethersReadonlyProvider,
  chainId,
  sameChain,
  sameSigner,
}: {
  instance: FhevmInstance | undefined;
  storage: GenericStringStorage;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
}) => {
  const waterLog = useWaterSaveLog({
    instance,
    fhevmDecryptionSignatureStorage: storage,
    eip1193Provider: undefined,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const { userStats, decryptUserTotal, canDecrypt, isDecrypting, message } = waterLog;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Water Saving */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 text-9xl opacity-10">💧</div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-2xl mr-2">💧</span>
              Today's Water Saving
            </h3>
            <p className="text-4xl font-bold mb-1">
              {userStats?.lastSubmitDay === BigInt(Math.floor(Date.now() / 1000 / 86400)) ? "✓" : "--"}
            </p>
            <p className="text-sm opacity-90">
              {userStats?.lastSubmitDay === BigInt(Math.floor(Date.now() / 1000 / 86400))
                ? "Today's record submitted"
                : "Not submitted today"}
            </p>
          </div>
        </div>

        {/* Consecutive Days */}
        <div className="relative overflow-hidden bg-gradient-to-br from-secondary to-green-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 text-9xl opacity-10">🔥</div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-2xl mr-2">🔥</span>
              Consecutive Days
            </h3>
            <p className="text-4xl font-bold mb-1">
              {userStats?.streak.toString() || "--"}
            </p>
            <p className="text-sm opacity-90">days</p>
          </div>
        </div>

        {/* Total Water Saved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 text-9xl opacity-10">🌊</div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-2xl mr-2">🌊</span>
              Total Water Saved
            </h3>
            <p className="text-4xl font-bold mb-1">
              {userStats?.totalLiters && userStats.totalLiters > 0 ? userStats.totalLiters.toString() : "--"}
            </p>
            <p className="text-sm opacity-90">L</p>
          </div>
        </div>
      </div>

      {/* Decrypt Section */}
      {userStats && userStats.totalLiters === BigInt(0) && canDecrypt && (
        <div className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔐 Decrypt Your Total Water Saved</h3>
              <p className="text-sm text-gray-600">Click to decrypt and view your cumulative water saving data</p>
            </div>
            <button
              onClick={decryptUserTotal}
              disabled={isDecrypting}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt Data"}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 My Environmental Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Days</p>
            <p className="text-2xl font-bold text-primary">{userStats?.totalDays.toString() || "0"}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Consecutive Days</p>
            <p className="text-2xl font-bold text-secondary">{userStats?.streak.toString() || "0"}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Water Saved</p>
            <p className="text-2xl font-bold text-purple-600">
              {userStats?.totalLiters ? userStats.totalLiters.toString() : "--"} L
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Badge Level</p>
            <p className="text-2xl font-bold text-yellow-600">
              {userStats && userStats.streak >= BigInt(100) ? "🏆" :
               userStats && userStats.streak >= BigInt(30) ? "🥈" :
               userStats && userStats.streak >= BigInt(7) ? "🥉" : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      )}
    </div>
  );
};



