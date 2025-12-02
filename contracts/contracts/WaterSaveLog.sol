// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title WaterSaveLog - Privacy-preserving water saving action log
/// @notice A contract that stores encrypted water saving data using FHEVM
/// @dev All sensitive data (liters) is encrypted using FHE operations
contract WaterSaveLog is ZamaEthereumConfig {
    /// @notice Action types enum
    enum ActionType {
        ShorterShower,      // 0: 缩短洗澡时间
        CloseFaucet,        // 1: 关紧水龙头
        RainwaterGarden,    // 2: 收集雨水浇花
        ReuseWater,         // 3: 使用二次水
        Other               // 4: 其他
    }

    /// @notice Water log entry structure
    struct WaterLog {
        euint64 liters;         // Encrypted liters saved
        ActionType actionType;  // Action type (can be public)
        uint256 timestamp;      // Block timestamp
        uint32 cityCode;        // City code (public, for aggregation)
    }

    /// @notice User statistics
    struct UserStats {
        euint64 totalLiters;    // Total encrypted liters saved by user
        uint256 streak;         // Consecutive days
        uint256 totalDays;      // Total days participated
        uint256 lastSubmitDay;  // Last submission day (timestamp / 1 days)
    }

    // User data
    mapping(address => WaterLog[]) private _userLogs;
    mapping(address => UserStats) private _userStats;
    
    // Global encrypted statistics
    euint64 private _globalTotalLiters;
    mapping(uint32 => euint64) private _cityTotalLiters;
    
    // Daily encrypted statistics (for trend analysis)
    mapping(uint256 => euint64) private _dailyTotalLiters;
    
    // Events
    event ActionSubmitted(
        address indexed user,
        ActionType actionType,
        uint256 timestamp,
        uint32 cityCode
    );
    
    event BadgeEligible(
        address indexed user,
        uint256 streak,
        uint256 badgeLevel
    );

    /// @notice Submit a water saving action
    /// @param encryptedLiters The encrypted liters saved (external euint64)
    /// @param inputProof The input proof for verification
    /// @param actionType The type of action (public enum)
    /// @param cityCode The city code for aggregation (public)
    function submitAction(
        externalEuint64 encryptedLiters,
        bytes calldata inputProof,
        ActionType actionType,
        uint32 cityCode
    ) external {
        // Convert external encrypted value to internal euint64
        euint64 litersEnc = FHE.fromExternal(encryptedLiters, inputProof);
        
        // Validate liters is within reasonable range (0-1000 liters)
        // Note: In production, add proper range checks using FHE comparison
        
        // Get current day index
        uint256 today = block.timestamp / 1 days;
        address user = msg.sender;
        
        // Check daily limit (one submission per day)
        UserStats storage stats = _userStats[user];
        if (stats.lastSubmitDay == today) {
            revert("Already submitted today");
        }
        
        // Update streak
        if (stats.lastSubmitDay == 0) {
            // First submission
            stats.streak = 1;
            stats.totalDays = 1;
        } else if (stats.lastSubmitDay == today - 1) {
            // Consecutive day
            stats.streak += 1;
            stats.totalDays += 1;
        } else {
            // Streak broken
            stats.streak = 1;
            stats.totalDays += 1;
        }
        
        stats.lastSubmitDay = today;
        
        // Update user total (encrypted addition)
        stats.totalLiters = FHE.add(stats.totalLiters, litersEnc);
        
        // Create log entry
        WaterLog memory log = WaterLog({
            liters: litersEnc,
            actionType: actionType,
            timestamp: block.timestamp,
            cityCode: cityCode
        });
        
        _userLogs[user].push(log);
        
        // Update global statistics (encrypted addition)
        _globalTotalLiters = FHE.add(_globalTotalLiters, litersEnc);
        
        // Update city statistics (encrypted addition)
        _cityTotalLiters[cityCode] = FHE.add(_cityTotalLiters[cityCode], litersEnc);
        
        // Update daily statistics (encrypted addition)
        _dailyTotalLiters[today] = FHE.add(_dailyTotalLiters[today], litersEnc);
        
        // ACL: Allow user to decrypt their own data
        FHE.allowThis(litersEnc);
        FHE.allow(litersEnc, user);
        FHE.allowThis(stats.totalLiters);
        FHE.allow(stats.totalLiters, user);
        
        // ACL: Allow user to decrypt global/city/daily stats (for viewing aggregate trends)
        FHE.allowThis(_globalTotalLiters);
        FHE.allow(_globalTotalLiters, user);
        FHE.allowThis(_cityTotalLiters[cityCode]);
        FHE.allow(_cityTotalLiters[cityCode], user);
        FHE.allowThis(_dailyTotalLiters[today]);
        FHE.allow(_dailyTotalLiters[today], user);
        
        emit ActionSubmitted(user, actionType, block.timestamp, cityCode);
        
        // Check badge eligibility
        if (stats.streak == 7 || stats.streak == 30 || stats.streak == 100) {
            uint256 badgeLevel = stats.streak == 7 ? 1 : (stats.streak == 30 ? 2 : 3);
            emit BadgeEligible(user, stats.streak, badgeLevel);
        }
    }

    /// @notice Get user's encrypted logs
    /// @param user The user address
    /// @return logs Array of encrypted water logs
    function getEncryptedLogs(address user) external view returns (WaterLog[] memory) {
        return _userLogs[user];
    }

    /// @notice Get user statistics
    /// @param user The user address
    /// @return totalLiters Encrypted total liters (euint64 handle)
    /// @return streak Consecutive days (public)
    /// @return totalDays Total days participated (public)
    /// @return lastSubmitDay Last submission day (public)
    function getUserStats(address user) external view returns (
        euint64 totalLiters,
        uint256 streak,
        uint256 totalDays,
        uint256 lastSubmitDay
    ) {
        UserStats storage stats = _userStats[user];
        return (stats.totalLiters, stats.streak, stats.totalDays, stats.lastSubmitDay);
    }

    /// @notice Get global encrypted total liters
    /// @return Encrypted global total (euint64 handle)
    function getEncryptedGlobalTotal() external view returns (euint64) {
        return _globalTotalLiters;
    }

    /// @notice Get city encrypted total liters
    /// @param cityCode The city code
    /// @return Encrypted city total (euint64 handle)
    function getEncryptedCityTotal(uint32 cityCode) external view returns (euint64) {
        return _cityTotalLiters[cityCode];
    }

    /// @notice Get daily encrypted total liters
    /// @param day The day index (timestamp / 1 days)
    /// @return Encrypted daily total (euint64 handle)
    function getEncryptedDailyTotal(uint256 day) external view returns (euint64) {
        return _dailyTotalLiters[day];
    }

    /// @notice Get last submission time for a user
    /// @param user The user address
    /// @return Last submission timestamp
    function lastSubmitTime(address user) external view returns (uint256) {
        UserStats storage stats = _userStats[user];
        return stats.lastSubmitDay * 1 days;
    }

    /// @notice Check if user can submit today
    /// @param user The user address
    /// @return True if user can submit today
    function canSubmitToday(address user) external view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return _userStats[user].lastSubmitDay < today;
    }
}

