
/*
  This file is auto-generated.
  Command: 'npm run genabi-badge'
*/
export const WaterBadgeABI = {
  "abi": [
    {
      "type": "constructor",
      "stateMutability": "undefined",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "_waterSaveLogContract"
        }
      ]
    },
    {
      "type": "error",
      "name": "ZamaProtocolUnsupported",
      "inputs": []
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "BadgeClaimed",
      "inputs": [
        {
          "type": "address",
          "name": "user",
          "indexed": true
        },
        {
          "type": "uint8",
          "name": "level",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "timestamp",
          "indexed": false
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "BadgeRevoked",
      "inputs": [
        {
          "type": "address",
          "name": "user",
          "indexed": true
        },
        {
          "type": "uint8",
          "name": "level",
          "indexed": false
        }
      ]
    },
    {
      "type": "function",
      "name": "claimBadge",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "uint8",
          "name": "level"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "claimTimestamps",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": ""
        },
        {
          "type": "uint8",
          "name": ""
        }
      ],
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ]
    },
    {
      "type": "function",
      "name": "confidentialProtocolId",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ]
    },
    {
      "type": "function",
      "name": "getBadgeName",
      "constant": true,
      "stateMutability": "pure",
      "payable": false,
      "inputs": [
        {
          "type": "uint8",
          "name": "level"
        }
      ],
      "outputs": [
        {
          "type": "string",
          "name": "name"
        }
      ]
    },
    {
      "type": "function",
      "name": "getUserBadge",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "user"
        }
      ],
      "outputs": [
        {
          "type": "uint8",
          "name": "level"
        }
      ]
    },
    {
      "type": "function",
      "name": "hasClaimed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "user"
        },
        {
          "type": "uint8",
          "name": "level"
        }
      ],
      "outputs": [
        {
          "type": "bool",
          "name": "claimed"
        }
      ]
    },
    {
      "type": "function",
      "name": "isEligible",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "user"
        },
        {
          "type": "uint8",
          "name": "level"
        }
      ],
      "outputs": [
        {
          "type": "bool",
          "name": "eligible"
        }
      ]
    },
    {
      "type": "function",
      "name": "transfer",
      "constant": true,
      "stateMutability": "pure",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": ""
        },
        {
          "type": "address",
          "name": ""
        },
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "userBadges",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "outputs": [
        {
          "type": "uint8",
          "name": ""
        }
      ]
    },
    {
      "type": "function",
      "name": "waterSaveLogContract",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ]
    }
  ]
} as const;

