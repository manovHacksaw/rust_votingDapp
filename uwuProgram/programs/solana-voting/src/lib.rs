use anchor_lang::prelude::*;

declare_id!("Gf73oFVLW2DoqfRGaGHb9pAmvXPkJC6ZjNZTJEvaKC5v");

// Define a constant for minimum campaign duration
const MIN_CAMPAIGN_DURATION_SECS: i64 = 60 * 60; // 1 hour
const MAX_CAMPAIGN_DURATION_SECS: i64 = 60 * 60 * 24 * 365; // 1 year (example max)

#[program]
pub mod solana_voting {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        description: String,
        poll_descriptions: Vec<String>,
        duration_in_seconds: i64, // New parameter for campaign duration
    ) -> Result<()> {
        // ✅ Validate inputs
        require!(!description.trim().is_empty(), CustomError::EmptyDescription);
        require!(
            poll_descriptions.len() > 0,
            CustomError::NoProposals
        );
        require!(
            poll_descriptions.len() <= 10,
            CustomError::TooManyProposals
        );

        // ✅ Validate provided duration
        require!(
            duration_in_seconds >= MIN_CAMPAIGN_DURATION_SECS,
            CustomError::CampaignDurationTooShort
        );
        require!(
            duration_in_seconds <= MAX_CAMPAIGN_DURATION_SECS,
            CustomError::CampaignDurationTooLong
        );


        let campaign = &mut ctx.accounts.campaign;
        let mut polls: Vec<ProposalEntry> = Vec::new();

        for desc in poll_descriptions {
            require!(!desc.trim().is_empty(), CustomError::EmptyDescription);
            polls.push(ProposalEntry {
                votes: 0,
                description: desc,
            });
        }

        campaign.description = description;
        campaign.creator = ctx.accounts.signer.key();
        campaign.polls = polls;

        let clock = Clock::get()?;
        campaign.created_at = clock.unix_timestamp;
        // Calculate ends_at based on the provided duration
        campaign.ends_at = clock.unix_timestamp + duration_in_seconds;

        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, poll_index: u8) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;

        // ✅ Validate poll index
        require!(
            (poll_index as usize) < campaign.polls.len(),
            CustomError::InvalidPollIndex
        );

        // Check if campaign has expired
        let now = Clock::get()?.unix_timestamp;
        require!(now <= campaign.ends_at, CustomError::CampaignExpired);


        // ✅ Register the vote
        let poll = &mut campaign.polls[poll_index as usize];
        poll.votes += 1;

        // The creation of the `vote_receipt` account (handled by Anchor's `init` constraint)
        // is what prevents a user from voting twice. No manual check is needed.
        // Store the chosen poll index in the receipt
        let vote_receipt = &mut ctx.accounts.vote_receipt;
        vote_receipt.campaign = campaign.key();
        vote_receipt.voter = ctx.accounts.voter.key();
        vote_receipt.poll_index = poll_index;

        Ok(())
    }
}

// === CONTEXTS ===

#[derive(Accounts)]
#[instruction(description: String)] // Note: duration_in_seconds is not used in PDA seeds
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + Campaign::INIT_SPACE,
        seeds = [b"campaign", signer.key().as_ref(), description.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        mut,
        seeds = [b"campaign", campaign.creator.as_ref(), campaign.description.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = voter,
        space = 8 + VoteReceipt::INIT_SPACE,
        seeds = [b"receipt", campaign.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_receipt: Account<'info, VoteReceipt>,
    pub system_program: Program<'info, System>,
}

// === ACCOUNT STRUCTS ===

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    #[max_len(100)]
    pub description: String,
    pub creator: Pubkey,
    #[max_len(10)]
    pub polls: Vec<ProposalEntry>,
    pub created_at: i64,
    pub ends_at: i64,
}

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProposalEntry {
    pub votes: u64,
    #[max_len(80)]
    pub description: String,
}

#[account]
#[derive(InitSpace)]
pub struct VoteReceipt {
    pub campaign: Pubkey, // Reference to the campaign
    pub voter: Pubkey,    // The public key of the voter
    pub poll_index: u8,   // Which poll they voted for
}

// === ERRORS ===

#[error_code]
pub enum CustomError {
    #[msg("Too many proposals. Maximum allowed is 10.")]
    TooManyProposals,
    #[msg("Invalid poll index.")]
    InvalidPollIndex,
    #[msg("Description cannot be empty.")]
    EmptyDescription,
    #[msg("Campaign must have at least one proposal.")]
    NoProposals,
    #[msg("Campaign has ended")]
    CampaignExpired,
    #[msg("Campaign duration must be at least 1 hour.")]
    CampaignDurationTooShort, // Renamed for clarity
    #[msg("Campaign duration exceeds maximum allowed (1 year).")]
    CampaignDurationTooLong,  // New error for maximum duration
}