"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WaterBadgeAddresses } from "@/abi/WaterBadgeAddresses";
import { WaterBadgeABI } from "@/abi/WaterBadgeABI";

export type BadgeLevel = "None" | "WaterDrop" | "WaterHero" | "AquaGuardian";

const BADGE_LEVEL_MAP: Record<BadgeLevel, number> = {
  None: 0,
  WaterDrop: 1,
  WaterHero: 2,
  AquaGuardian: 3,
};

type WaterBadgeInfoType = {
  abi: typeof WaterBadgeABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getWaterBadgeByChainId(
  chainId: number | undefined
): WaterBadgeInfoType {
  if (!chainId) {
    return { abi: WaterBadgeABI.abi };
  }

  const entry =
    WaterBadgeAddresses[chainId.toString() as keyof typeof WaterBadgeAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: WaterBadgeABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: WaterBadgeABI.abi,
  };
}

export const useWaterBadge = (parameters: {
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const { chainId, ethersSigner, ethersReadonlyProvider } = parameters;

  const [userBadge, setUserBadge] = useState<BadgeLevel>("None");
  const [eligibility, setEligibility] = useState<Record<BadgeLevel, boolean>>({
    None: false,
    WaterDrop: false,
    WaterHero: false,
    AquaGuardian: false,
  });
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const waterBadge = useMemo(() => {
    return getWaterBadgeByChainId(chainId);
  }, [chainId]);

  const isDeployed = useMemo(() => {
    return Boolean(waterBadge.address) && waterBadge.address !== ethers.ZeroAddress;
  }, [waterBadge]);

  // Load user badge and eligibility
  const loadBadgeInfo = useCallback(() => {
    if (!waterBadge.address || !ethersSigner || !ethersReadonlyProvider) {
      return;
    }

    const contract = new ethers.Contract(
      waterBadge.address,
      waterBadge.abi,
      ethersReadonlyProvider
    );

    ethersSigner.getAddress().then(async (userAddress) => {
      try {
        // Get current badge
        const currentBadgeLevel = await contract.getUserBadge(userAddress);
        const badgeLevelNum = Number(currentBadgeLevel);
        const badgeLevelName: BadgeLevel = 
          badgeLevelNum === 1 ? "WaterDrop" :
          badgeLevelNum === 2 ? "WaterHero" :
          badgeLevelNum === 3 ? "AquaGuardian" : "None";
        
        setUserBadge(badgeLevelName);

        // Check eligibility for each badge
        const waterDropEligible = await contract.isEligible(userAddress, 1);
        const waterHeroEligible = await contract.isEligible(userAddress, 2);
        const aquaGuardianEligible = await contract.isEligible(userAddress, 3);

        setEligibility({
          None: false,
          WaterDrop: waterDropEligible,
          WaterHero: waterHeroEligible,
          AquaGuardian: aquaGuardianEligible,
        });
      } catch (error: any) {
        console.error("Failed to load badge info:", error);
      }
    });
  }, [waterBadge.address, waterBadge.abi, ethersSigner, ethersReadonlyProvider]);

  useEffect(() => {
    loadBadgeInfo();
  }, [loadBadgeInfo]);

  // Claim badge
  const claimBadge = useCallback(
    async (level: BadgeLevel) => {
      if (isClaiming || !waterBadge.address || !ethersSigner) {
        return false;
      }

      if (!eligibility[level]) {
        setMessage(`❌ Not eligible yet`);
        return false;
      }

      setIsClaiming(true);
      setMessage(`Claiming ${level} badge...`);

      const contract = new ethers.Contract(
        waterBadge.address,
        waterBadge.abi,
        ethersSigner
      );

      try {
        const tx = await contract.claimBadge(BADGE_LEVEL_MAP[level]);
        setMessage(`Waiting for transaction confirmation: ${tx.hash.slice(0, 10)}...`);
        
        await tx.wait();
        
        setMessage(`🎉 Successfully claimed ${level} badge!`);
        
        // Refresh badge info
        setTimeout(() => {
          loadBadgeInfo();
        }, 1000);

        return true;
      } catch (error: any) {
        setMessage(`❌ Claim failed: ${error.message || error}`);
        return false;
      } finally {
        setIsClaiming(false);
      }
    },
    [waterBadge.address, waterBadge.abi, ethersSigner, eligibility, loadBadgeInfo]
  );

  return {
    contractAddress: waterBadge.address,
    isDeployed,
    userBadge,
    eligibility,
    claimBadge,
    isClaiming,
    message,
    loadBadgeInfo,
  };
};



