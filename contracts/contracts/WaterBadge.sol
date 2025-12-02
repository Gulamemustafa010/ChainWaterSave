// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title WaterBadge - Soulbound Token (SBT) for water saving achievements
/// @notice Non-transferable achievement badges for water saving milestones
/// @dev Implements SBT pattern - tokens cannot be transferred
contract WaterBadge is ZamaEthereumConfig {
    /// @notice Badge levels
    enum BadgeLevel {
        None,           // 0: No badge
        WaterDrop,      // 1: 1 day - Water Drop Badge
        WaterHero,      // 2: 30 days - Water Hero Badge
        AquaGuardian    // 3: 100 days - Aqua Guardian SBT
    }

    /// @notice Reference to WaterSaveLog contract
    address public waterSaveLogContract;

    /// @notice User's highest badge level
    mapping(address => BadgeLevel) public userBadges;

    /// @notice Badge claim timestamp
    mapping(address => mapping(BadgeLevel => uint256)) public claimTimestamps;

    /// @notice Events
    event BadgeClaimed(address indexed user, BadgeLevel level, uint256 timestamp);
    event BadgeRevoked(address indexed user, BadgeLevel level);

    /// @notice Constructor
    /// @param _waterSaveLogContract Address of WaterSaveLog contract
    constructor(address _waterSaveLogContract) {
        require(_waterSaveLogContract != address(0), "Invalid contract address");
        waterSaveLogContract = _waterSaveLogContract;
    }

    /// @notice Claim a badge based on streak days
    /// @param level The badge level to claim
    function claimBadge(BadgeLevel level) external {
        require(level != BadgeLevel.None, "Cannot claim None badge");
        require(userBadges[msg.sender] < level, "Already have this or higher badge");
        require(claimTimestamps[msg.sender][level] == 0, "Badge already claimed");

        // Get user stats from WaterSaveLog
        (bool success, bytes memory data) = waterSaveLogContract.call(
            abi.encodeWithSignature("getUserStats(address)", msg.sender)
        );
        require(success, "Failed to get user stats");

        // Decode stats (skip totalLiters, get streak, totalDays, lastSubmitDay)
        (, uint256 streak,,) = abi.decode(data, (bytes32, uint256, uint256, uint256));

        // Check eligibility based on level
        uint256 requiredDays = _getRequiredDays(level);
        require(streak >= requiredDays, "Insufficient streak days");

        // Mint badge (update user's badge level)
        userBadges[msg.sender] = level;
        claimTimestamps[msg.sender][level] = block.timestamp;

        emit BadgeClaimed(msg.sender, level, block.timestamp);
    }

    /// @notice Get required days for a badge level
    /// @param level The badge level
    /// @return Required consecutive days
    function _getRequiredDays(BadgeLevel level) internal pure returns (uint256) {
        if (level == BadgeLevel.WaterDrop) return 1;      // 1 day
        if (level == BadgeLevel.WaterHero) return 30;     // 30 days
        if (level == BadgeLevel.AquaGuardian) return 100; // 100 days
        return 0;
    }

    /// @notice Check if user is eligible for a badge
    /// @param user User address
    /// @param level Badge level to check
    /// @return eligible True if user can claim this badge
    function isEligible(address user, BadgeLevel level) external view returns (bool eligible) {
        if (level == BadgeLevel.None) return false;
        if (userBadges[user] >= level) return false;
        if (claimTimestamps[user][level] != 0) return false;

        (bool success, bytes memory data) = waterSaveLogContract.staticcall(
            abi.encodeWithSignature("getUserStats(address)", user)
        );
        if (!success) return false;

        (, uint256 streak,,) = abi.decode(data, (bytes32, uint256, uint256, uint256));
        return streak >= _getRequiredDays(level);
    }

    /// @notice Get user's current badge level
    /// @param user User address
    /// @return level User's badge level
    function getUserBadge(address user) external view returns (BadgeLevel level) {
        return userBadges[user];
    }

    /// @notice Get badge name
    /// @param level Badge level
    /// @return name Badge name
    function getBadgeName(BadgeLevel level) external pure returns (string memory name) {
        if (level == BadgeLevel.WaterDrop) return "Water Drop Badge";
        if (level == BadgeLevel.WaterHero) return "Water Hero Badge";
        if (level == BadgeLevel.AquaGuardian) return "Aqua Guardian SBT";
        return "None";
    }

    /// @notice Check if user has claimed a specific badge
    /// @param user User address
    /// @param level Badge level
    /// @return claimed True if badge was claimed
    function hasClaimed(address user, BadgeLevel level) external view returns (bool claimed) {
        return claimTimestamps[user][level] != 0;
    }

    /// @notice Prevent transfers (SBT characteristic)
    /// @dev This is a simple SBT implementation without ERC721
    function transfer(address, address, uint256) external pure {
        revert("Soulbound: Transfer not allowed");
    }
}





