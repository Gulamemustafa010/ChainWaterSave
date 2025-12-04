"use client";

import { useState } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ethers } from "ethers";

type WaterLogEncrypted = {
  liters: string; // handle
  actionType: number;
  timestamp: bigint;
  cityCode: number;
};

type WaterLogDecrypted = WaterLogEncrypted & {
  decryptedLiters?: bigint;
};

const ACTION_TYPE_NAMES: Record<number, { name: string; icon: string }> = {
  0: { name: "Shorter Shower", icon: "🚿" },
  1: { name: "Close Faucet", icon: "🚰" },
  2: { name: "Rainwater Garden", icon: "🌧️" },
  3: { name: "Reuse Water", icon: "♻️" },
  4: { name: "Other", icon: "💡" },
};

const CITY_NAMES: Record<number, string> = {
  1: "Beijing",
  2: "Shanghai",
  3: "Guangzhou",
  4: "Shenzhen",
  5: "Other",
};

export const RecordsList = ({
  instance,
  storage,
  ethersSigner,
  ethersReadonlyProvider,
  contractAddress,
  contractAbi,
}: {
  instance: FhevmInstance | undefined;
  storage: GenericStringStorage;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  contractAddress: string | undefined;
  contractAbi: any;
}) => {
  const [logs, setLogs] = useState<WaterLogDecrypted[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState<{ [index: number]: boolean }>({});
  const [message, setMessage] = useState("");

  // Load encrypted logs
  const loadLogs = async () => {
    if (!contractAddress || !ethersSigner || !ethersReadonlyProvider) {
      return;
    }

    setIsLoading(true);
    setMessage("Loading records...");

    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersReadonlyProvider
      );

      const userAddress = await ethersSigner.getAddress();
      const encryptedLogs = await contract.getEncryptedLogs(userAddress);

      const logsArray: WaterLogDecrypted[] = encryptedLogs.map((log: any) => ({
        liters: log.liters,
        actionType: Number(log.actionType),
        timestamp: log.timestamp,
        cityCode: Number(log.cityCode),
      }));

      setLogs(logsArray);
      setMessage(`✅ Loaded ${logsArray.length} records`);
    } catch (error: any) {
      setMessage(`❌ Load failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Decrypt single log
  const decryptLog = async (index: number) => {
    if (!instance || !ethersSigner || !contractAddress) {
      return;
    }

    const log = logs[index];
    if (!log || log.decryptedLiters !== undefined) {
      return;
    }

    if (log.liters === ethers.ZeroHash) {
      setLogs((prev) => {
        const newLogs = [...prev];
        newLogs[index] = { ...newLogs[index], decryptedLiters: BigInt(0) };
        return newLogs;
      });
      return;
    }

    setIsDecrypting((prev) => ({ ...prev, [index]: true }));
    setMessage(`Decrypting record ${index + 1}...`);

    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        ethersSigner,
        storage
      );

      if (!sig) {
        setMessage("❌ Unable to generate decryption signature");
        return;
      }

      const res = (await instance.userDecrypt(
        [{ handle: log.liters, contractAddress: contractAddress as `0x${string}` }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      )) as unknown as Record<string, number>;

      const decryptedValue = res[log.liters];
      setLogs((prev) => {
        const newLogs = [...prev];
        newLogs[index] = { ...newLogs[index], decryptedLiters: BigInt(decryptedValue) };
        return newLogs;
      });
      setMessage(`✅ Record ${index + 1} decrypted`);
    } catch (error: any) {
      setMessage(`❌ Decryption failed: ${error.message}`);
    } finally {
      setIsDecrypting((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Decrypt all logs
  const decryptAllLogs = async () => {
    if (!instance || !ethersSigner || !contractAddress) {
      return;
    }

    const encryptedLogs = logs.filter((log) => log.decryptedLiters === undefined && log.liters !== ethers.ZeroHash);
    if (encryptedLogs.length === 0) {
      setMessage("All records decrypted");
      return;
    }

    setMessage(`Decrypting ${encryptedLogs.length} records...`);

    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        ethersSigner,
        storage
      );

      if (!sig) {
        setMessage("❌ Unable to generate decryption signature");
        return;
      }

      const handles = encryptedLogs.map((log) => ({
        handle: log.liters,
        contractAddress: contractAddress as `0x${string}`,
      }));

      const res = (await instance.userDecrypt(
        handles,
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      )) as unknown as Record<string, number>;

      setLogs((prev) =>
        prev.map((log) => {
          if (log.liters === ethers.ZeroHash) {
            return { ...log, decryptedLiters: BigInt(0) };
          }
          if (res[log.liters] !== undefined) {
            return { ...log, decryptedLiters: BigInt(res[log.liters]) };
          }
          return log;
        })
      );
      setMessage(`✅ All records decrypted`);
    } catch (error: any) {
      setMessage(`❌ Decryption failed: ${error.message}`);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="text-4xl mr-3">📝</span>
            My Water Saving Records
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={loadLogs}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "🔄 Refresh Records"}
            </button>
            {logs.length > 0 && (
              <button
                onClick={decryptAllLogs}
                disabled={Object.values(isDecrypting).some((v) => v)}
                className="bg-secondary hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                🔓 Decrypt All
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 bg-blue-50 border-l-4 border-primary p-3 rounded">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}

        {/* Records List */}
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg mb-4">No records yet</p>
            <button
              onClick={loadLogs}
              className="text-primary hover:text-primary-dark font-semibold"
            >
              Click to Load Records
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-gray-100 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">
                        {ACTION_TYPE_NAMES[log.actionType]?.icon || "💡"}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {ACTION_TYPE_NAMES[log.actionType]?.name || "Other"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📍 {CITY_NAMES[log.cityCode] || "Other City"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Water Saved</p>
                        <p className="font-bold text-lg text-primary">
                          {log.decryptedLiters !== undefined ? (
                            <span>{log.decryptedLiters.toString()} L</span>
                          ) : (
                            <span className="text-gray-400">🔒 Encrypted</span>
                          )}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Time</p>
                        <p className="font-semibold text-gray-700">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    {log.decryptedLiters === undefined && (
                      <button
                        onClick={() => decryptLog(index)}
                        disabled={isDecrypting[index]}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDecrypting[index] ? "Decrypting..." : "🔓 Decrypt"}
                      </button>
                    )}
                    {log.decryptedLiters !== undefined && (
                      <div className="text-green-500 text-2xl">✅</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {logs.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Decrypted</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter((l) => l.decryptedLiters !== undefined).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Encrypted</p>
                <p className="text-2xl font-bold text-gray-400">
                  {logs.filter((l) => l.decryptedLiters === undefined).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Water Saved</p>
                <p className="text-2xl font-bold text-primary">
                  {logs
                    .filter((l) => l.decryptedLiters !== undefined)
                    .reduce((sum, l) => sum + Number(l.decryptedLiters), 0)}{" "}
                  L
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



