"use client";

import { UserStatsDecrypted } from "@/hooks/useWaterSaveLog";

const BADGES = [
  {
    level: 1,
    levelName: "WaterDrop" as const,
    name: "Water Drop Badge",
    icon: "💧",
    requirement: 1,
    description: "Check in 1 day",
    color: "from-blue-400 to-blue-600",
  },
  {
    level: 2,
    levelName: "WaterHero" as const,
    name: "Water Hero Badge",
    icon: "🌊",
    requirement: 30,
    description: "30 consecutive days",
    color: "from-cyan-400 to-blue-600",
  },
  {
    level: 3,
    levelName: "AquaGuardian" as const,
    name: "Aqua Guardian SBT",
    icon: "🏆",
    requirement: 100,
    description: "100 consecutive days",
    color: "from-yellow-400 to-orange-500",
  },
];

import { useWaterBadge, BadgeLevel } from "@/hooks/useWaterBadge";
import { ethers } from "ethers";

export const Achievements = ({ 
  userStats,
  ethersSigner,
  ethersReadonlyProvider,
  chainId,
}: { 
  userStats: UserStatsDecrypted | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
}) => {
  const streak = userStats?.streak ? Number(userStats.streak) : 0;
  
  const {
    userBadge,
    eligibility,
    claimBadge,
    isClaiming,
    message: badgeMessage,
  } = useWaterBadge({
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="text-4xl mr-3">🏅</span>
          My Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BADGES.map((badge) => {
            const canClaim = eligibility[badge.levelName];
            const hasClaimed = 
              badge.levelName === "WaterDrop" && userBadge !== "None" ||
              badge.levelName === "WaterHero" && (userBadge === "WaterHero" || userBadge === "AquaGuardian") ||
              badge.levelName === "AquaGuardian" && userBadge === "AquaGuardian";
            const unlocked = hasClaimed;
            const progress = Math.min((streak / badge.requirement) * 100, 100);

            return (
              <div
                key={badge.level}
                className={`relative overflow-hidden rounded-2xl shadow-lg transform transition-all ${
                  unlocked
                    ? "bg-gradient-to-br " + badge.color + " text-white hover:scale-105"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                <div className="p-6">
                  {/* Badge Icon */}
                  <div className="text-center mb-4">
                    <div
                      className={`text-7xl mb-2 ${
                        unlocked ? "animate-bounce" : "opacity-30"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <h3 className="text-lg font-bold">{badge.name}</h3>
                    <p className={`text-sm mt-1 ${unlocked ? "opacity-90" : "text-gray-500"}`}>
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{streak} days</span>
                      <span>{badge.requirement} days</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          unlocked ? "bg-white" : "bg-primary"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status / Claim Button */}
                  <div className="mt-4 text-center">
                    {hasClaimed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20">
                        ✅ Claimed
                      </span>
                    ) : canClaim ? (
                      <button
                        onClick={() => claimBadge(badge.levelName)}
                        disabled={isClaiming}
                        className="px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-all shadow-md disabled:opacity-50"
                      >
                        {isClaiming ? "Claiming..." : "🎁 Claim Badge"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 text-gray-600">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Shine Effect for Unlocked */}
                {unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine" />
                )}
              </div>
            );
          })}
        </div>

        {/* Message Display */}
        {badgeMessage && (
          <div className="mt-6 bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
            <p className="text-sm text-gray-700">{badgeMessage}</p>
          </div>
        )}

        {/* Next Badge Progress */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Next Goal</h3>
          {streak < 1 ? (
            <p className="text-gray-700">
              Complete your first water saving check-in to claim <span className="font-bold">Water Drop Badge</span> 💧
            </p>
          ) : streak < 30 ? (
            <p className="text-gray-700">
              Keep going for <span className="font-bold text-primary">{30 - streak}</span> more days
              to claim <span className="font-bold">Water Hero Badge</span> 🌊
            </p>
          ) : streak < 100 ? (
            <p className="text-gray-700">
              Keep going for <span className="font-bold text-primary">{100 - streak}</span> more days
              to claim <span className="font-bold">Aqua Guardian SBT</span> 🏆
            </p>
          ) : (
            <p className="text-gray-700">
              🎉 Congratulations! You've met all badge requirements! Click the claim button to claim your badges.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

