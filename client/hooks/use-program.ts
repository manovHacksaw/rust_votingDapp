import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { SolanaVoting } from "@/types";
import idl from "../lib/idl.json";
import { useSolana } from "./use-solana";

// Program ID from IDL metadata
const PROGRAM_ID = new PublicKey(idl.address);

export const useProgram = () => {
  const { connection, publicKey } = useSolana();
  const wallet = useAnchorWallet();

  // Create provider
  const provider = useMemo(() => {
    if (wallet && connection) {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      setProvider(provider);
      return provider;
    }
    return null;
  }, [connection, wallet]);

  // Create program instance
  const program = useMemo(() => {
    if (provider) {
      return new Program(idl as SolanaVoting, provider);
    }
    return null;
  }, [provider]);

  // Helper function to derive campaign PDA
  const getCampaignPDA = (creator: PublicKey, description: string) => {
    const [campaignPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        creator.toBuffer(),
        Buffer.from(description)
      ],
      PROGRAM_ID
    );
    return campaignPDA;
  };

  // Helper function to derive vote receipt PDA
  const getVoteReceiptPDA = (campaign: PublicKey, voter: PublicKey) => {
    const [voteReceiptPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        campaign.toBuffer(),
        voter.toBuffer()
      ],
      PROGRAM_ID
    );
    return voteReceiptPDA;
  };

  // Create campaign function
  const createCampaign = async (
    description: string,
    pollDescriptions: string[],
    durationInSeconds: number
  ) => {
    if (!program || !wallet || !publicKey) {
      throw new Error("Program, wallet, or publicKey not available");
    }

    try {
      const campaignPDA = getCampaignPDA(publicKey, description);
      
      const tx = await program.methods
        .createCampaign(description, pollDescriptions, new anchor.BN(durationInSeconds))
        .accounts({
          campaign: campaignPDA,
          signer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Campaign created:", campaignPDA.toBase58());
      console.log("Transaction signature:", tx);
      
      return {
        signature: tx,
        campaignPDA: campaignPDA.toBase58(),
      };
    } catch (error) {
      console.error("❌ Failed to create campaign:", error);
      throw error;
    }
  };

  // Cast vote function
  const castVote = async (campaignPDA: PublicKey, pollIndex: number) => {
    if (!program || !wallet || !publicKey) {
      throw new Error("Program, wallet, or publicKey not available");
    }

    try {
      const voteReceiptPDA = getVoteReceiptPDA(campaignPDA, publicKey);
      
      const tx = await program.methods
        .castVote(pollIndex)
        .accounts({
          voter: publicKey,
          campaign: campaignPDA,
          voteReceipt: voteReceiptPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Vote cast successfully");
      console.log("Transaction signature:", tx);
      
      return {
        signature: tx,
        voteReceiptPDA: voteReceiptPDA.toBase58(),
      };
    } catch (error) {
      console.error("❌ Failed to cast vote:", error);
      throw error;
    }
  };

  // Get all campaigns
  const getAllCampaigns = async () => {
    if (!program) {
      throw new Error("Program not available");
    }

    try {
      const campaignAccounts = await program.account.campaign.all();
      
      console.log("📊 Found campaigns:", campaignAccounts.length);
      return campaignAccounts.map(account => ({
        publicKey: account.publicKey.toBase58(),
        account: account.account,
      }));
    } catch (error) {
      console.error("❌ Failed to fetch campaigns:", error);
      throw error;
    }
  };

  // Get campaign by address
  const getCampaign = async (campaignAddress: string) => {
    if (!program) {
      throw new Error("Program not available");
    }

    try {
      const campaignPubkey = new PublicKey(campaignAddress);
      const campaign = await program.account.campaign.fetch(campaignPubkey);
      
      return {
        publicKey: campaignAddress,
        account: campaign,
      };
    } catch (error) {
      console.error("❌ Failed to fetch campaign:", error);
      throw error;
    }
  };

  // Check if user has voted
  const hasVoted = async (campaignPDA: PublicKey, voterPubkey?: PublicKey) => {
    if (!program) {
      throw new Error("Program not available");
    }

    const voter = voterPubkey || publicKey;
    if (!voter) {
      throw new Error("Voter public key not available");
    }

    try {
      const voteReceiptPDA = getVoteReceiptPDA(campaignPDA, voter);
      await program.account.voteReceipt.fetch(voteReceiptPDA);
      return true; // If no error, vote receipt exists
    } catch (error) {
      return false; // Vote receipt doesn't exist
    }
  };

  return {
    // Core objects
    program,
    provider,
    programId: PROGRAM_ID,
    
    // Helper functions
    getCampaignPDA,
    getVoteReceiptPDA,
    
    // Program methods
    createCampaign,
    castVote,
    getAllCampaigns,
    getCampaign,
    hasVoted,
    
    // Status
    isReady: !!program && !!wallet && !!publicKey,
  };
};
