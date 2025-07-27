// hooks/useWallet.js
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { useMemo } from "react";
import idl from "../idl.json";
import * as anchor from "@coral-xyz/anchor";
import { SolanaVoting } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Replace this with your program ID from IDL metadata
const PROGRAM_ID = idl.address;

const useProgram = () => {
  const { connection } = useConnection();
 const {publicKey} = useWallet();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (wallet) {
      const _provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      setProvider(_provider);
      return _provider;
    }
    return null;
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (provider) {
      return new Program(idl as SolanaVoting, provider);
    }
    return null;
  }, [provider]);

  const createCampaign = async(description: String, polls: String[], duration: number) =>{
      if (!program || !wallet || !publicKey) {
    console.error("Program or wallet not ready");
    return;}

    try {
       const [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), publicKey?.toBuffer(), Buffer.from(description) ], new PublicKey(PROGRAM_ID)
    )
    await program?.methods.createCampaign(description, polls, new anchor.BN(duration)).accounts({
      campaign: campaignPDA,
      signer: publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc()

     console.log("✅ Campaign created:", campaignPDA.toBase58());
    } catch (error) {
       console.error("❌ Failed to create campaign:", error);
    }
   
  }

  const getAllCampaigns = async() =>{
      if (!program || !wallet || !publicKey) {
    console.error("Program or wallet not ready");
    return;}

    try {
      const campaignAccounts = await program.account.campaign.all([
     {
    memcmp: {
      offset: 8,
      bytes: bs58.encode(new anchor.BN(0, "le").toArray()),
    },
    },
]);

    console.log("campaign accounts: ", campaignAccounts)
    } catch (error) {
      console.error("Error occured while getting campaigns: ", error)
    }
  }

  return { wallet, provider, program, createCampaign, getAllCampaigns };
};

export default useProgram;
