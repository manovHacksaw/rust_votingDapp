"use client"
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";

// It's good practice to import the IDL and Program types
import idl from "@/lib/idl.json";
import { SolanaVoting } from "../../uwuProgram/target/types/solana_voting"; 
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { CampaignData } from "@/types";

// The IDL JSON file contains the program ID at `idl.address`.
const programId = new PublicKey(idl.address);

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  // 1. Create the provider, memoized for efficiency.
  const provider = useMemo(() => {
    // Only create a provider if the wallet is connected.
    if (!wallet) {
      return null;
    }
    console.log("✅ Provider created. Wallet connected.");
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]); // Re-run only when connection or wallet changes.

  // 2. Use an effect to handle the side effect of setting the global provider.
  useEffect(() => {
    if (provider) {
      setProvider(provider);
      console.log("✅ Global Anchor provider set.");
    } else {
      console.log("🟡 Global provider not set (wallet disconnected).");
    }
  }, [provider]);

  // 3. Create the program instance, also memoized.
  const program = useMemo(() => {
    if (!provider) {
      return null;
    }

    try {
      // Create the program instance using the IDL, program ID, and provider.
      console.log(`✅ Program instance created for ${programId.toBase58()}`);
      return new Program<SolanaVoting>(idl as any, provider);
    } catch (e) {
      // This might happen if the IDL is malformed.
      console.error("❌ Error creating program instance:", e);
      return null;
    }
  }, [provider]); 

  const createCampaign = async(description: string, 
    polls: string[], endTime: number
  ) =>{
     if (!program || !wallet) {
      throw new Error("Program or wallet not initialized.");
    }
    setLoading(true);
    try {
      const [campaignPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          wallet.publicKey.toBuffer(),
          Buffer.from(description)
        ],
        program.programId
      )

      console.log("PROGRAM", program.programId)

      console.log(`Attempting to create campaign at PDA: ${campaignPDA.toBase58()}`);

      const txSignature = await program.methods.createCampaign(description, polls, new BN(endTime))
      .accounts({
        signer: wallet.publicKey,
        campaign: campaignPDA,
        systemProgram: SystemProgram.programId
      }).rpc();

      await connection.confirmTransaction(txSignature, "confirmed");
     
      console.log(`Transaction successful: ${txSignature}`);
      return txSignature;

    } catch (error) {
      console.error("Error in createCampaign:", error);
      throw error;
    } finally{
      setLoading(false);
    }
  }

  const fetchCampaigns = async() => {
    if (!program) {
      console.warn("Program not initialized, cannot fetch campaigns");
      return;
    }

    try {
      const campaignAccounts = await program.account.campaign.all({
        memcmp: {
          offset: 8,
          bytes: bs58.encode(new BN(0, "le").toArray()),
        },
      });

      const campaignArray = campaignAccounts?.map((c) => ({
        address: c.publicKey.toBase58(),
        description: c.account.description,
        creator: c.account.creator.toBase58(),
        polls: c.account.polls.map((p) => ({
          description: p.description,
          votes: p.votes.toNumber()
        }))
      })) || [];

      setCampaigns(campaignArray);

      console.log("Fetched campaigns:", campaignArray);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      throw error;
    }
  }

  const voteForProposal = async(campaignAddress: string, pollIndex: number) => {
    if (!program || !wallet) {
      throw new Error("Program or wallet not initialized.");
    }

    setLoading(true);

    try {
      console.log(`🗳️ Starting vote for campaign: ${campaignAddress}, poll index: ${pollIndex}`);

      const campaignPubkey = new PublicKey(campaignAddress);
      const campaignAccount = await program.account.campaign.fetch(campaignPubkey);
      const creator = campaignAccount.creator;
      const description = campaignAccount.description;

      console.log(`📋 Campaign details - Creator: ${creator.toBase58()}, Description: ${description}`);

      const [campaignPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          creator.toBuffer(),
          Buffer.from(description),
        ],
        program.programId
      );

      if (!campaignPDA.equals(campaignPubkey)) {
        console.warn("⚠️ Mismatch between expected and fetched campaign PDA.");
      }

      const [voteReceiptPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("receipt"),
          campaignPDA.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log(`🗳️ Casting vote for proposal index ${pollIndex} on campaign ${campaignPDA.toBase58()}`);
      console.log(`🧾 Vote receipt PDA: ${voteReceiptPDA.toBase58()}`);

      const txSignature = await program.methods
        .castVote(pollIndex)
        .accounts({
          voter: wallet.publicKey,
          campaign: campaignPDA,
          voteReceipt: voteReceiptPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(txSignature, "confirmed");

      console.log("✅ Vote cast successfully. Tx:", txSignature);
      return txSignature;

    } catch (error) {
      console.error("❌ Error casting vote:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const checkIfUserVoted = async (campaignAddress: string): Promise<boolean> => {
    if (!program || !wallet) {
      console.log("🟡 Cannot check vote status - program or wallet not initialized");
      return false;
    }

    try {
      console.log(`🔍 Checking if user ${wallet.publicKey.toBase58()} has voted on campaign ${campaignAddress}`);

      const campaignPubkey = new PublicKey(campaignAddress);
      const [voteReceiptPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("receipt"),
          campaignPubkey.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log(`🧾 Looking for vote receipt at: ${voteReceiptPDA.toBase58()}`);

      const voteReceipt = await program.account.voteReceipt.fetchNullable(voteReceiptPDA);

      if (voteReceipt) {
        console.log("✅ User has already voted on this campaign");
        return true;
      } else {
        console.log("🆕 User has not voted on this campaign yet");
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking vote status:", error);
      // If we can't check, assume they haven't voted to avoid blocking valid votes
      return false;
    }
  };

  return { program, provider, wallet, connection, programId, createCampaign, loading, fetchCampaigns, campaigns, voteForProposal, checkIfUserVoted };
}