import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaVoting } from "../target/types/solana_voting";
import { assert } from "chai";

describe("solana-voting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaVoting as Program<SolanaVoting>;

  const creator = provider.wallet.publicKey;
    const description = "Favorite Programming Language?";
  const proposals = ["Rust", "Solidity", "Python", "Go"];

  let campaignPDA: anchor.web3.PublicKey;

  it("Creates a new campaign", async () => {
    [campaignPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), creator.toBuffer(),Buffer.from(description)],
      program.programId
    );

    await program.methods.createCampaign(description, proposals).
    accounts({
      signer: creator.publicKey ,
      campaign: campaignPDA,
      systemProgram: anchor.web3.SystemProgram.programId,  
    }).rpc();

      const campaign = await program.account.campaign.fetch(campaignPDA);
     assert.equal(campaign.description, description, "Description mismatch");
    assert.equal(campaign.polls.length, proposals.length, "Proposal count mismatch");

    console.log("✅ Campaign created successfully with proposals:", campaign.polls.map(p => p.description));
  });

  it("Casts a vote on proposal", async () => {
    let votingIndex = 0; // Index of the proposal to vote for
    const voter = provider.wallet.publicKey;

    await program.methods.castVote(votingIndex).accounts({
      voter: voter,
      campaign: campaignPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    const campaign = await program.account.campaign.fetch(campaignPDA);
    const proposal = campaign.polls[votingIndex];
    
    assert.equal(proposal.votes.toNumber(), 1, "Vote count should be 1");
    console.log(`✅ Voted for proposal: ${proposal.description}, Total votes: ${proposal.votes}`);
  });

  it("Fails if same user tries to vote again", async () => {
  try {
    // First vote - should pass
    await program.methods.castVote(1).accounts({
      voter: provider.wallet.publicKey,
      campaign: campaignPDA,
    }).rpc();

    // Second vote - should fail
    await program.methods.castVote(1).accounts({
      voter: provider.wallet.publicKey,
      campaign: campaignPDA,
    }).rpc();

    throw new Error("Double vote should have failed, but it didn't!");
  } catch (err) {
    const errMsg = err.toString();
    console.log("Caught error as expected:", errMsg);

    if (!errMsg.includes("You have already voted in this poll.")) {
      throw new Error("Double voting error not caught properly");
    }
  }
});

  
});

