import { type Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js"

// Use a placeholder program ID for now - replace with your actual program ID
const PROGRAM_ID = new PublicKey("8g17d5n2vmgd3iWjdyjSgAy6g21t2vExAMac22s4aLqg")

// Helper function to create PDA safely
export function createPDA(seeds: (Buffer | Uint8Array)[], programId: PublicKey): [PublicKey, number] {
  try {
    return PublicKey.findProgramAddressSync(seeds, programId)
  } catch (error) {
    console.error("Error creating PDA:", error)
    throw new Error("Failed to create program derived address")
  }
}

// Helper function to encode string as bytes
function encodeString(str: string): Buffer {
  if (!str || typeof str !== "string") {
    throw new Error("Invalid string input")
  }
  return Buffer.from(str, "utf8")
}

// Create campaign instruction
export async function createCampaign(
  connection: Connection,
  signer: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  description: string,
  pollDescriptions: string[],
  durationInSeconds: number,
) {
  try {
    // Validate inputs
    if (!connection) throw new Error("Connection is required")
    if (!signer) throw new Error("Signer is required")
    if (!signTransaction) throw new Error("Sign transaction function is required")
    if (!description?.trim()) throw new Error("Description is required")
    if (!Array.isArray(pollDescriptions) || pollDescriptions.length === 0) {
      throw new Error("Poll descriptions are required")
    }
    if (typeof durationInSeconds !== "number" || durationInSeconds <= 0) {
      throw new Error("Valid duration is required")
    }

    // Create PDA for campaign
    const [campaignPDA] = createPDA([Buffer.from("campaign"), signer.toBuffer(), encodeString(description)], PROGRAM_ID)

    // Create a simplified instruction for demonstration
    // In a real implementation, you'd need to properly serialize the instruction data
    // according to your Anchor program's expected format
    const instructionData = Buffer.from([
      // Discriminator for create_campaign (8 bytes)
      111, 131, 187, 98, 160, 193, 114, 244,
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: signer, isSigner: true, isWritable: true },
        { pubkey: campaignPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    })

    const transaction = new Transaction().add(instruction)
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = signer

    const signedTransaction = await signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    await connection.confirmTransaction(signature, "confirmed")

    return { signature, campaignAddress: campaignPDA.toString() }
  } catch (error) {
    console.error("Error in createCampaign:", error)
    throw new Error(`Failed to create campaign: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Cast vote instruction
export async function castVote(
  connection: Connection,
  voter: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  campaignAddress: PublicKey,
  pollIndex: number,
) {
  try {
    // Validate inputs
    if (!connection) throw new Error("Connection is required")
    if (!voter) throw new Error("Voter is required")
    if (!signTransaction) throw new Error("Sign transaction function is required")
    if (!campaignAddress) throw new Error("Campaign address is required")
    if (typeof pollIndex !== "number" || pollIndex < 0 || pollIndex > 255) {
      throw new Error("Valid poll index is required (0-255)")
    }

    // Check if campaign exists
    const campaignAccount = await connection.getAccountInfo(campaignAddress)
    if (!campaignAccount) {
      throw new Error("Campaign not found")
    }

    // Create PDA for vote receipt
    const [voteReceiptPDA] = createPDA(
      [Buffer.from("receipt"), campaignAddress.toBuffer(), voter.toBuffer()],
      PROGRAM_ID,
    )

    // Create instruction data
    const instructionData = Buffer.from([
      // Discriminator for cast_vote (8 bytes)
      20,
      212,
      15,
      189,
      69,
      180,
      69,
      151,
      // Poll index (1 byte)
      pollIndex,
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: voter, isSigner: true, isWritable: true },
        { pubkey: campaignAddress, isSigner: false, isWritable: true },
        { pubkey: voteReceiptPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    })

    const transaction = new Transaction().add(instruction)
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = voter

    const signedTransaction = await signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    await connection.confirmTransaction(signature, "confirmed")

    return { signature, voteReceiptAddress: voteReceiptPDA.toString() }
  } catch (error) {
    console.error("Error in castVote:", error)
    throw new Error(`Failed to cast vote: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get all campaigns (mock implementation for now)
export async function getAllCampaigns(connection: Connection) {
  try {
    if (!connection) {
      throw new Error("Connection is required")
    }

    // Mock data for demonstration - in a real app you'd fetch from the blockchain
    const mockCampaigns = [
      {
        address: "Campaign1MockAddress123456789",
        description: "Should we add more kawaii emojis to the app? 🌸",
        creator: "Creator1MockAddress123456789",
        polls: [
          { description: "Yes, more kawaii please! 💖", votes: 42 },
          { description: "Current amount is perfect ✨", votes: 18 },
        ],
        createdAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        endsAt: Math.floor(Date.now() / 1000) + 86400 * 6, // 6 days from now
      },
      {
        address: "Campaign2MockAddress123456789",
        description: "What should be our next feature? 🚀",
        creator: "Creator2MockAddress123456789",
        polls: [
          { description: "Dark mode improvements 🌙", votes: 28 },
          { description: "Mobile app version 📱", votes: 35 },
          { description: "NFT integration 🎨", votes: 15 },
        ],
        createdAt: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
        endsAt: Math.floor(Date.now() / 1000) + 86400 * 5, // 5 days from now
      },
    ]

    return mockCampaigns
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    throw new Error(`Failed to fetch campaigns: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
