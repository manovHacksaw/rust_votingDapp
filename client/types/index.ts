/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_voting.json`.
 */
export type SolanaVoting = {
  "address": "DEwjDB522WETWNoVWwa3W1rTvoX2Zs4DZPaSpzmny3M7",
  "metadata": {
    "name": "solanaVoting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign.creator",
                "account": "campaign"
              },
              {
                "kind": "account",
                "path": "campaign.description",
                "account": "campaign"
              }
            ]
          }
        },
        {
          "name": "voteReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "description"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "pollDescriptions",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "durationInSeconds",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "voteReceipt",
      "discriminator": [
        104,
        20,
        204,
        252,
        45,
        84,
        37,
        195
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "tooManyProposals",
      "msg": "Too many proposals. Maximum allowed is 10."
    },
    {
      "code": 6001,
      "name": "invalidPollIndex",
      "msg": "Invalid poll index."
    },
    {
      "code": 6002,
      "name": "emptyDescription",
      "msg": "Description cannot be empty."
    },
    {
      "code": 6003,
      "name": "noProposals",
      "msg": "Campaign must have at least one proposal."
    },
    {
      "code": 6004,
      "name": "campaignExpired",
      "msg": "Campaign has ended"
    },
    {
      "code": 6005,
      "name": "campaignDurationTooShort",
      "msg": "Campaign duration must be at least 1 hour."
    },
    {
      "code": 6006,
      "name": "campaignDurationTooLong",
      "msg": "Campaign duration exceeds maximum allowed (1 year)."
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "polls",
            "type": {
              "vec": {
                "defined": {
                  "name": "proposalEntry"
                }
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "endsAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proposalEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "voteReceipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "pollIndex",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
