"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

import { WaterSaveLogAddresses } from "@/abi/WaterSaveLogAddresses";
import { WaterSaveLogABI } from "@/abi/WaterSaveLogABI";

export type ActionType = "ShorterShower" | "CloseFaucet" | "RainwaterGarden" | "ReuseWater" | "Other";

export type WaterLogDecrypted = {
  liters: bigint;
  actionType: number;
  timestamp: bigint;
  cityCode: number;
};

export type UserStatsDecrypted = {
  totalLiters: bigint;
  streak: bigint;
  totalDays: bigint;
  lastSubmitDay: bigint;
};

type WaterSaveLogInfoType = {
  abi: typeof WaterSaveLogABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getWaterSaveLogByChainId(
  chainId: number | undefined
): WaterSaveLogInfoType {
  if (!chainId) {
    return { abi: WaterSaveLogABI.abi };
  }

  const entry =
    WaterSaveLogAddresses[chainId.toString() as keyof typeof WaterSaveLogAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: WaterSaveLogABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: WaterSaveLogABI.abi,
  };
}

const ACTION_TYPE_MAP: Record<ActionType, number> = {
  ShorterShower: 0,
  CloseFaucet: 1,
  RainwaterGarden: 2,
  ReuseWater: 3,
  Other: 4,
};

export const useWaterSaveLog = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [userStats, setUserStats] = useState<UserStatsDecrypted | undefined>(undefined);
  const [decryptedLogs, setDecryptedLogs] = useState<WaterLogDecrypted[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const contractRef = useRef<WaterSaveLogInfoType | undefined>(undefined);
  const isSubmittingRef = useRef<boolean>(isSubmitting);
  const isLoadingRef = useRef<boolean>(isLoading);
  const isDecryptingRef = useRef<boolean>(isDecrypting);

  const waterSaveLog = useMemo(() => {
    const c = getWaterSaveLogByChainId(chainId);
    contractRef.current = c;

    if (!c.address) {
      setMessage(`WaterSaveLog deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!waterSaveLog) {
      return undefined;
    }
    return Boolean(waterSaveLog.address) && waterSaveLog.address !== ethers.ZeroAddress;
  }, [waterSaveLog]);

  // Load user stats
  const loadUserStats = useCallback(() => {
    if (isLoadingRef.current || !waterSaveLog.address || !ethersSigner || !ethersReadonlyProvider) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    const contract = new ethers.Contract(
      waterSaveLog.address,
      waterSaveLog.abi,
      ethersReadonlyProvider
    );

    ethersSigner.getAddress().then((userAddress) => {
      contract.getUserStats(userAddress)
        .then((result: any) => {
          setUserStats({
            totalLiters: BigInt(0), // Will be decrypted later
            streak: result.streak,
            totalDays: result.totalDays,
            lastSubmitDay: result.lastSubmitDay,
          });
          setIsLoading(false);
          isLoadingRef.current = false;
        })
        .catch((e: any) => {
          setMessage(`Failed to load user stats: ${e.message}`);
          setIsLoading(false);
          isLoadingRef.current = false;
        });
    });
  }, [waterSaveLog.address, waterSaveLog.abi, ethersSigner, ethersReadonlyProvider]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Submit action
  const submitAction = useCallback(
    async (liters: number, actionType: ActionType, cityCode: number): Promise<boolean> => {
      if (isSubmittingRef.current || !waterSaveLog.address || !instance || !ethersSigner) {
        return false;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setMessage("Encrypting data...");

      const contract = new ethers.Contract(
        waterSaveLog.address,
        waterSaveLog.abi,
        ethersSigner
      );

      try {
        const userAddress = await ethersSigner.getAddress();
        
        // Create encrypted input
        const input = instance.createEncryptedInput(
          waterSaveLog.address,
          userAddress
        );
        input.add64(liters);

        setMessage("Generating encryption proof...");
        const enc = await input.encrypt();

        setMessage("Submitting to blockchain...");
        
        const tx = await contract.submitAction(
          enc.handles[0],
          enc.inputProof,
          ACTION_TYPE_MAP[actionType],
          cityCode
        );

        setMessage(`Waiting for transaction confirmation: ${tx.hash.slice(0, 10)}...`);
        const receipt = await tx.wait();

        setMessage(`✅ Submission successful! Saved ${liters} L of water`);
        
        // Refresh stats
        setTimeout(() => {
          loadUserStats();
        }, 1000);

        return true;
      } catch (error: any) {
        setMessage(`❌ Submission failed: ${error.message || error}`);
        return false;
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [waterSaveLog.address, waterSaveLog.abi, instance, ethersSigner, loadUserStats]
  );

  // Decrypt user total
  const decryptUserTotal = useCallback(async () => {
    if (isDecryptingRef.current || !waterSaveLog.address || !instance || !ethersSigner) {
      return;
    }

    if (!userStats) {
      return;
    }

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Decrypting data...");

    try {
      const userAddress = await ethersSigner.getAddress();
      const contract = new ethers.Contract(
        waterSaveLog.address,
        waterSaveLog.abi,
        ethersReadonlyProvider!
      );

      const stats = await contract.getUserStats(userAddress);
      const totalHandle = stats.totalLiters;

      if (totalHandle === ethers.ZeroHash) {
        setUserStats({
          ...userStats,
          totalLiters: BigInt(0),
        });
        setMessage("Total water saved: 0 L");
        return;
      }

      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [waterSaveLog.address],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        setMessage("❌ Unable to generate decryption signature");
        return;
      }

      setMessage("Decrypting total water saved...");

      const res = await instance.userDecrypt(
        [{ handle: totalHandle, contractAddress: waterSaveLog.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const decryptedTotal = res[totalHandle];
      setUserStats({
        ...userStats,
        totalLiters: BigInt(decryptedTotal),
      });
      setMessage(`✅ Total water saved: ${decryptedTotal} L`);
    } catch (error: any) {
      setMessage(`❌ Decryption failed: ${error.message || error}`);
    } finally {
      isDecryptingRef.current = false;
      setIsDecrypting(false);
    }
  }, [waterSaveLog.address, waterSaveLog.abi, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage, userStats]);

  const canSubmit = useMemo((): boolean => {
    return Boolean(waterSaveLog.address && instance && ethersSigner && !isSubmitting);
  }, [waterSaveLog.address, instance, ethersSigner, isSubmitting]);

  const canDecrypt = useMemo(() => {
    return waterSaveLog.address && instance && ethersSigner && userStats && !isDecrypting;
  }, [waterSaveLog.address, instance, ethersSigner, userStats, isDecrypting]);

  return {
    contractAddress: waterSaveLog.address,
    isDeployed,
    userStats,
    decryptedLogs,
    submitAction,
    decryptUserTotal,
    canSubmit,
    canDecrypt,
    isSubmitting,
    isLoading,
    isDecrypting,
    message,
    loadUserStats,
  };
};



