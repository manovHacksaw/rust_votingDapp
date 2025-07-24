export interface ProposalEntry {
  votes: number;
  description: string;
}

export interface Campaign {
  id: string;
  description: string;
  creator: string;
  polls: ProposalEntry[];
  createdAt: Date;
  totalVotes: number;
}

export interface VoteReceipt {
  campaign: string;
  voter: string;
  pollIndex: number;
}

export interface CreateCampaignData {
  description: string;
  pollDescriptions: string[];
}